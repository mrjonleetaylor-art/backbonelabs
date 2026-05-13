// app/api/elevenlabs-webhook/route.ts
// Receives ElevenLabs post-call webhooks and dispatches to:
//   - Tom (sales agent)        -> sales_calls / leads / bookings, Twilio SMS to Jon
//   - Customer-facing agents   -> calls / actions / messages, Resend email to the owner
//
// ElevenLabs post-call webhook payload shape (per
// https://elevenlabs.io/docs/eleven-agents/workflows/post-call-webhooks):
// { type, event_timestamp, data: { agent_id, conversation_id, transcript[],
//   metadata: { call_duration_secs, ... }, analysis: { data_collection_results,
//   transcript_summary, ... }, ... } }
//
// Customer dispatch resolves the agent via customers.elevenlabs_agent_id.
// If no customer matches, the call is logged and skipped.

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import { Resend } from 'resend';
import { parse, addDays, format } from 'date-fns';
import crypto from 'crypto';

// ===== Types =====

// ElevenLabs sends data_collection_results as a map of variable name to either
// a raw value or an object with { value, rationale, ... }. Normalise both shapes
// down to a flat Collected map.
type RawCollectedValue =
  | string
  | number
  | boolean
  | null
  | { value?: unknown; rationale?: string; data_collection_id?: string };

type Collected = {
  // Common fields
  caller_name?: string;
  caller_phone?: string;
  business_name?: string;
  outcome?: string;
  notes?: string;

  // Tom-specific
  industry?: string;
  what_theyre_solving?: string;
  booking_agreed?: boolean;
  booking_day?: string;
  booking_half?: string;

  // Customer-facing (Ava) - order detail
  recipient_name?: string;
  order_type?: string;
  delivery_address?: string;
  pickup_time?: string;
  delivery_date?: string;
  delivery_window?: string;
  occasion?: string;
  budget?: string;
  card_message?: string;

  // Customer-facing (Ava) - callback detail
  callback_day?: string;
  callback_half?: string;
  callback_reason?: string;

  // Customer-facing (Ava) - flags
  is_sympathy_or_funeral?: boolean;
  escalation_needed?: boolean;
};

type WebhookData = {
  agent_id?: string;
  conversation_id?: string;
  status?: string;
  transcript?: unknown;
  metadata?: {
    start_time_unix_secs?: number;
    call_duration_secs?: number;
    phone_call?: {
      external_number?: string;
      direction?: string;
    };
    [key: string]: unknown;
  };
  analysis?: {
    data_collection_results?: Record<string, RawCollectedValue>;
    transcript_summary?: string;
    call_successful?: string;
    evaluation_criteria_results?: Record<string, unknown>;
  };
  conversation_initiation_client_data?: {
    dynamic_variables?: Record<string, unknown>;
  };
  [key: string]: unknown;
};

type WebhookPayload = {
  type?: string;
  event_timestamp?: number;
  data?: WebhookData;
};

type Customer = {
  id: string;
  business_name: string;
  owner_name: string | null;
  owner_email: string | null;
  elevenlabs_agent_id: string | null;
};

type CallRow = { id: string };

// ===== Helpers =====

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseSignatureHeader(header: string | null): { timestamp: string; signature: string } | null {
  if (!header) return null;
  const parts = header.split(',').reduce((acc, part) => {
    const idx = part.indexOf('=');
    if (idx > 0) acc[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
    return acc;
  }, {} as Record<string, string>);
  if (!parts.t || !parts.v0) return null;
  return { timestamp: parts.t, signature: parts.v0 };
}

function verifySignature(timestamp: string, rawBody: string, signature: string): boolean {
  if (!process.env.ELEVENLABS_WEBHOOK_SECRET) return false;
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 1800) return false; // 30 min window
  const expected = crypto
    .createHmac('sha256', process.env.ELEVENLABS_WEBHOOK_SECRET)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// Flatten data_collection_results: each entry can be a raw value or
// { value, rationale, data_collection_id }. We only care about value.
function flattenCollected(raw: Record<string, RawCollectedValue> | undefined): Collected {
  if (!raw) return {};
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (val !== null && typeof val === 'object' && 'value' in val) {
      out[key] = (val as { value?: unknown }).value;
    } else {
      out[key] = val;
    }
  }
  return out as Collected;
}

function getCollected(data: WebhookData): Collected {
  return flattenCollected(data.analysis?.data_collection_results);
}

function getCallerPhone(data: WebhookData, collected: Collected): string | null {
  // 1. From the LLM's data collection extraction.
  if (collected.caller_phone) return String(collected.caller_phone);
  // 2. From Twilio metadata (inbound caller's external number).
  const ext = data.metadata?.phone_call?.external_number;
  if (typeof ext === 'string' && ext.length > 0) return ext;
  // 3. Dynamic variables passed in at conversation start.
  const dyn = data.conversation_initiation_client_data?.dynamic_variables;
  if (dyn && typeof dyn === 'object') {
    const candidate = (dyn as Record<string, unknown>).system__caller_id;
    if (typeof candidate === 'string' && /\d/.test(candidate)) return candidate;
  }
  return null;
}

function transcriptToString(t: unknown): string | null {
  if (typeof t === 'string') return t;
  if (t == null) return null;
  return JSON.stringify(t);
}

function esc(value: unknown): string {
  const s = value == null ? '' : String(value);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseRelativeDay(input: string | null | undefined): string | null {
  if (!input) return null;
  const lower = input.toLowerCase().trim();

  const isoMatch = input.match(/\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];

  if (/\btoday\b/.test(lower)) return format(new Date(), 'yyyy-MM-dd');
  if (/\btomorrow\b/.test(lower)) return format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const fullMatch = input.match(/\d{1,2}\s+[A-Za-z]+\s+\d{4}/);
  if (fullMatch) {
    try {
      const parsed = parse(fullMatch[0], 'd MMMM yyyy', new Date());
      if (!isNaN(parsed.getTime())) return format(parsed, 'yyyy-MM-dd');
    } catch {
      /* fall through */
    }
  }

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < dayNames.length; i++) {
    if (lower.includes(dayNames[i])) {
      const today = new Date();
      let daysAhead = i - today.getDay();
      if (daysAhead <= 0) daysAhead += 7;
      if (/\bafter next\b/.test(lower)) daysAhead += 7;
      else if (/\bnext\b/.test(lower) && daysAhead < 7) daysAhead += 7;
      return format(addDays(today, daysAhead), 'yyyy-MM-dd');
    }
  }
  return null;
}

function mapCustomerOutcome(
  collected: Collected
): { call_outcome: string | null; action_type: string | null } {
  const o = (collected.outcome ?? '').toLowerCase();
  if (o === 'order_captured') return { call_outcome: 'order', action_type: 'order' };
  if (o === 'callback_booked') return { call_outcome: 'info', action_type: 'callback' };
  if (o === 'escalated') return { call_outcome: 'transfer', action_type: 'info' };
  if (o === 'enquiry_only') return { call_outcome: 'info', action_type: null };
  if (o === 'no_contact_captured' || o === 'hung_up') return { call_outcome: 'other', action_type: null };
  return { call_outcome: null, action_type: null };
}

// ===== Tom pipeline =====

async function handleTomCall(
  supabase: SupabaseClient,
  twilioClient: ReturnType<typeof twilio>,
  data: WebhookData,
  rawPayload: WebhookPayload,
  conversationId: string
): Promise<Response> {
  const { data: existing } = await supabase
    .from('sales_calls')
    .select('id')
    .eq('elevenlabs_conversation_id', conversationId)
    .maybeSingle();
  if (existing) return json({ ok: true, deduped: true });

  const collected = getCollected(data);
  const callerPhone = getCallerPhone(data, collected);

  const { data: callRow, error: callError } = await supabase
    .from('sales_calls')
    .insert({
      elevenlabs_conversation_id: conversationId,
      caller_phone: callerPhone,
      duration_seconds: data.metadata?.call_duration_secs ?? null,
      transcript: transcriptToString(data.transcript),
      outcome: collected.outcome ?? null,
      raw_payload: rawPayload,
    })
    .select()
    .single();

  if (callError || !callRow) {
    console.error('Tom call insert error', callError);
    return json({ error: callError?.message ?? 'call insert failed' }, 500);
  }

  let leadId: string | null = null;
  if (callerPhone) {
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .upsert(
        {
          name: collected.caller_name ?? null,
          business: collected.business_name ?? null,
          phone: callerPhone,
          industry: collected.industry ?? null,
          what_theyre_solving: collected.what_theyre_solving ?? null,
          first_call_id: callRow.id,
          last_call_id: callRow.id,
        },
        { onConflict: 'phone', ignoreDuplicates: false }
      )
      .select()
      .single();
    if (leadError) console.error('Tom lead upsert error', leadError);
    leadId = lead?.id ?? null;
  }

  if (
    collected.booking_agreed === true &&
    collected.booking_day &&
    collected.booking_half &&
    leadId
  ) {
    const day = parseRelativeDay(String(collected.booking_day));
    const half = String(collected.booking_half).toUpperCase();
    if (day && (half === 'AM' || half === 'PM')) {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          lead_id: leadId,
          call_id: callRow.id,
          day,
          half,
          notes: collected.what_theyre_solving ?? null,
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Tom booking insert error', bookingError);
      } else if (booking) {
        try {
          await sendTomBookingSms(twilioClient, {
            name: collected.caller_name ?? 'someone',
            business: collected.business_name ?? 'an unknown business',
            phone: callerPhone ?? 'unknown',
            day,
            half: half as 'AM' | 'PM',
          });
        } catch (smsErr) {
          console.error('Tom sms send error', smsErr);
        }
      }
    } else {
      console.warn('Tom booking captured but day/half failed validation', {
        booking_day: collected.booking_day,
        booking_half: collected.booking_half,
      });
    }
  }

  return json({ ok: true, pipeline: 'tom' });
}

async function sendTomBookingSms(
  client: ReturnType<typeof twilio>,
  args: {
    name: string;
    business: string;
    phone: string;
    day: string;
    half: 'AM' | 'PM';
  }
) {
  const prettyDay = format(parse(args.day, 'yyyy-MM-dd', new Date()), 'EEEE d MMM');
  const halfWord = args.half === 'AM' ? 'morning' : 'afternoon';
  await client.messages.create({
    from: process.env.TWILIO_FROM_NUMBER!,
    to: process.env.JON_MOBILE!,
    body: `RelayDesk: Tom booked a meeting for ${prettyDay} ${halfWord} with ${args.name} from ${args.business}. Phone: ${args.phone}`,
  });
}

// ===== Customer-facing pipeline (Ava etc.) =====

async function handleCustomerCall(
  supabase: SupabaseClient,
  resend: Resend,
  customer: Customer,
  data: WebhookData,
  rawPayload: WebhookPayload,
  conversationId: string
): Promise<Response> {
  const { data: existing } = await supabase
    .from('calls')
    .select('id')
    .eq('elevenlabs_call_id', conversationId)
    .maybeSingle();
  if (existing) return json({ ok: true, deduped: true });

  const collected = getCollected(data);
  const callerPhone = getCallerPhone(data, collected);
  const mapped = mapCustomerOutcome(collected);

  // Prefer Ava's notes field for the summary, fall back to the LLM's transcript summary.
  const summary = collected.notes ?? data.analysis?.transcript_summary ?? null;

  // Compute started_at from unix timestamp if present.
  const startedAt = data.metadata?.start_time_unix_secs
    ? new Date(data.metadata.start_time_unix_secs * 1000).toISOString()
    : null;

  const { data: callRow, error: callError } = await supabase
    .from('calls')
    .insert({
      customer_id: customer.id,
      elevenlabs_call_id: conversationId,
      caller_phone: callerPhone,
      started_at: startedAt,
      duration_s: data.metadata?.call_duration_secs ?? null,
      transcript: transcriptToString(data.transcript),
      summary,
      outcome: mapped.call_outcome,
      raw_webhook: rawPayload as unknown as Record<string, unknown>,
    })
    .select('id')
    .single<CallRow>();

  if (callError || !callRow) {
    console.error('customer call insert error', callError);
    return json({ error: callError?.message ?? 'call insert failed' }, 500);
  }

  let actionType: string | null = mapped.action_type;
  if (!actionType && collected.escalation_needed) {
    actionType = 'info';
  }

  if (actionType === 'order') {
    const dueAt = parseRelativeDay(collected.delivery_date) ?? null;
    await supabase.from('actions').insert({
      customer_id: customer.id,
      call_id: callRow.id,
      type: 'order',
      status: 'pending',
      payload: {
        caller_name: collected.caller_name ?? null,
        caller_phone: callerPhone,
        recipient_name: collected.recipient_name ?? null,
        order_type: collected.order_type ?? null,
        delivery_address: collected.delivery_address ?? null,
        pickup_time: collected.pickup_time ?? null,
        delivery_day_raw: collected.delivery_date ?? null,
        delivery_window: collected.delivery_window ?? null,
        occasion: collected.occasion ?? null,
        budget: collected.budget ?? null,
        card_message: collected.card_message ?? null,
        is_sympathy_or_funeral: collected.is_sympathy_or_funeral ?? false,
      },
      due_at: dueAt ? `${dueAt}T07:00:00+10:00` : null,
    });
  } else if (actionType === 'callback') {
    const callbackDate = parseRelativeDay(collected.callback_day) ?? null;
    await supabase.from('actions').insert({
      customer_id: customer.id,
      call_id: callRow.id,
      type: 'callback',
      status: 'pending',
      payload: {
        caller_name: collected.caller_name ?? null,
        caller_phone: callerPhone,
        callback_day_raw: collected.callback_day ?? null,
        callback_half: collected.callback_half ?? null,
        callback_reason: collected.callback_reason ?? null,
        business_name: collected.business_name ?? null,
      },
      due_at: callbackDate ? `${callbackDate}T00:00:00+10:00` : null,
    });
  } else if (actionType === 'info') {
    await supabase.from('actions').insert({
      customer_id: customer.id,
      call_id: callRow.id,
      type: 'info',
      status: 'pending',
      payload: {
        caller_name: collected.caller_name ?? null,
        caller_phone: callerPhone,
        reason: collected.notes ?? 'Caller needs follow-up.',
        is_sympathy_or_funeral: collected.is_sympathy_or_funeral ?? false,
      },
    });
  }

  await sendOwnerEmail({
    supabase,
    resend,
    customer,
    callId: callRow.id,
    callerPhone,
    actionType,
    collected,
    transcript: transcriptToString(data.transcript),
  });

  return json({ ok: true, pipeline: 'customer', customer_id: customer.id });
}

async function sendOwnerEmail(args: {
  supabase: SupabaseClient;
  resend: Resend;
  customer: Customer;
  callId: string;
  callerPhone: string | null;
  actionType: string | null;
  collected: Collected;
  transcript: string | null;
}) {
  const recipient = args.customer.owner_email ?? process.env.JON_EMAIL ?? null;
  if (!recipient) {
    console.warn('no owner_email and no JON_EMAIL fallback, skipping notification', {
      customer_id: args.customer.id,
    });
    return;
  }

  const { subject, html } = renderOwnerEmail(args);

  const { data: msgRow, error: msgError } = await args.supabase
    .from('messages')
    .insert({
      customer_id: args.customer.id,
      call_id: args.callId,
      channel: 'email',
      recipient,
      subject,
      body: html,
      status: 'queued',
    })
    .select('id')
    .single<{ id: string }>();

  if (msgError) {
    console.error('messages insert error', msgError);
  }

  try {
    const result = await args.resend.emails.send({
      from: 'RelayDesk <hello@relaydesk.com.au>',
      to: recipient,
      subject,
      html,
    });
    const providerId = (result as { data?: { id?: string } }).data?.id ?? null;
    if (msgRow?.id) {
      await args.supabase
        .from('messages')
        .update({
          status: 'sent',
          provider_id: providerId,
          sent_at: new Date().toISOString(),
        })
        .eq('id', msgRow.id);
    }
  } catch (err) {
    console.error('owner email send error', err);
    if (msgRow?.id) {
      await args.supabase
        .from('messages')
        .update({
          status: 'failed',
          error: err instanceof Error ? err.message : String(err),
        })
        .eq('id', msgRow.id);
    }
  }
}

function renderOwnerEmail(args: {
  customer: Customer;
  callerPhone: string | null;
  actionType: string | null;
  collected: Collected;
  transcript: string | null;
}): { subject: string; html: string } {
  const c = args.collected;
  const business = args.customer.business_name;
  const flags: string[] = [];
  if (c.is_sympathy_or_funeral) flags.push('Sympathy/funeral');
  if (c.escalation_needed) flags.push('Escalation needed');

  const transcriptPreview = args.transcript
    ? args.transcript.length > 600
      ? `${args.transcript.slice(0, 600)}...`
      : args.transcript
    : null;

  let subject: string;
  let bodyRows: Array<{ label: string; value: string | null | undefined }> = [];

  if (args.actionType === 'order') {
    const recipient = c.recipient_name ?? 'someone';
    const occasion = c.occasion ?? 'a request';
    subject = `New order at ${business}: ${occasion} for ${recipient}`;
    bodyRows = [
      { label: 'Caller', value: `${c.caller_name ?? 'unknown'} (${args.callerPhone ?? 'no number'})` },
      { label: 'Recipient', value: c.recipient_name },
      { label: 'Order type', value: c.order_type },
      { label: 'Delivery address', value: c.delivery_address },
      { label: 'Pickup time', value: c.pickup_time },
      { label: 'When', value: c.delivery_date },
      { label: 'Window', value: c.delivery_window },
      { label: 'Occasion', value: c.occasion },
      { label: 'Budget', value: c.budget },
      { label: 'Card message', value: c.card_message },
    ];
  } else if (args.actionType === 'callback') {
    subject = `Callback requested at ${business}: ${c.callback_reason ?? 'no reason given'}`;
    bodyRows = [
      { label: 'Caller', value: `${c.caller_name ?? 'unknown'} (${args.callerPhone ?? 'no number'})` },
      { label: 'Business', value: c.business_name },
      { label: 'When', value: c.callback_day },
      { label: 'Window', value: c.callback_half },
      { label: 'Reason', value: c.callback_reason },
    ];
  } else if (args.actionType === 'info') {
    subject = `Call needing attention at ${business}`;
    bodyRows = [
      { label: 'Caller', value: `${c.caller_name ?? 'unknown'} (${args.callerPhone ?? 'no number'})` },
      { label: 'Notes', value: c.notes },
    ];
  } else {
    subject = `Call recorded at ${business}`;
    bodyRows = [
      { label: 'Caller', value: `${c.caller_name ?? 'unknown'} (${args.callerPhone ?? 'no number'})` },
      { label: 'Outcome', value: c.outcome },
      { label: 'Notes', value: c.notes },
    ];
  }

  const rowsHtml = bodyRows
    .filter((r) => r.value != null && r.value !== '')
    .map((r) => `<p style="margin:4px 0;"><strong>${esc(r.label)}:</strong> ${esc(r.value)}</p>`)
    .join('');

  const flagsHtml = flags.length
    ? `<p style="margin:12px 0 4px 0;"><strong>Flags:</strong> ${flags.map(esc).join(', ')}</p>`
    : '';

  const transcriptHtml = transcriptPreview
    ? `
        <h3 style="margin:20px 0 6px 0; font-size:14px;">Call transcript (first 600 chars)</h3>
        <pre style="white-space:pre-wrap; background:#f5f5f5; padding:12px; border-radius:6px; font-size:12px; color:#333;">${esc(transcriptPreview)}</pre>
      `
    : '';

  const notesHtml = c.notes
    ? `<p style="margin:12px 0 4px 0;"><strong>Ava&rsquo;s notes:</strong> ${esc(c.notes)}</p>`
    : '';

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:14px; line-height:1.5; color:#222; max-width:640px;">
      <h2 style="margin:0 0 12px 0; font-size:16px;">${esc(subject)}</h2>
      ${rowsHtml}
      ${notesHtml}
      ${flagsHtml}
      ${transcriptHtml}
      <p style="margin-top:24px; font-size:12px; color:#888;">RelayDesk &middot; ${esc(business)}</p>
    </div>
  `;

  return { subject, html };
}

// ===== Entry point =====

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );
  const resend = new Resend(process.env.RESEND_API_KEY!);

  const rawBody = await req.text();
  const sigHeader = req.headers.get('elevenlabs-signature');
  const parsed = parseSignatureHeader(sigHeader);
  if (!parsed || !verifySignature(parsed.timestamp, rawBody, parsed.signature)) {
    return json({ error: 'invalid signature' }, 401);
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  // Only handle post_call_transcription events. Skip post_call_audio and
  // call_initiation_failure events (return 200 so ElevenLabs doesn't retry).
  const eventType = payload.type;
  if (eventType !== 'post_call_transcription') {
    return json({ ok: true, skipped: 'event_type', event_type: eventType ?? null });
  }

  const data = payload.data;
  if (!data) {
    return json({ error: 'missing data object' }, 400);
  }

  const conversationId = data.conversation_id;
  if (!conversationId) return json({ error: 'missing conversation_id' }, 400);

  const agentId = data.agent_id;
  if (!agentId) return json({ error: 'missing agent_id' }, 400);

  if (agentId === process.env.TOM_AGENT_ID) {
    return handleTomCall(supabase, twilioClient, data, payload, conversationId);
  }

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, business_name, owner_name, owner_email, elevenlabs_agent_id')
    .eq('elevenlabs_agent_id', agentId)
    .in('status', ['pilot', 'paying'])
    .maybeSingle<Customer>();

  if (customerError) {
    console.error('customer lookup error', customerError);
    return json({ error: 'customer lookup failed' }, 500);
  }

  if (!customer) {
    console.log('no customer matched agent_id, skipping', { agentId });
    return json({ ok: true, skipped: 'no_customer_match' });
  }

  return handleCustomerCall(supabase, resend, customer, data, payload, conversationId);
}
