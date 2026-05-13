// app/api/elevenlabs-webhook/route.ts
// Receives ElevenLabs post-call webhooks and dispatches to:
//   - Tom (sales agent)        -> sales_calls / leads / bookings, Twilio SMS to Jon
//   - Customer-facing agents   -> calls / actions / messages, Resend email to the owner
//
// Customer dispatch resolves the agent via customers.elevenlabs_agent_id.
// If no customer matches, the call is logged and skipped.

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import { Resend } from 'resend';
import { parse, addDays, format } from 'date-fns';
import crypto from 'crypto';

// ===== Types =====

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

type WebhookPayload = {
  conversation_id?: string;
  conversationId?: string;
  agent_id?: string;
  agentId?: string;
  caller_phone?: string;
  duration_seconds?: number;
  duration?: number;
  transcript?: string | unknown;
  collected_data?: Collected;
  data_collection_results?: Collected;
  analysis?: { data_collection_results?: Collected };
  metadata?: { caller_phone?: string };
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
  if (!Number.isFinite(age) || age > 300) return false;
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

function getCollected(payload: WebhookPayload): Collected {
  return (
    payload.collected_data ??
    payload.data_collection_results ??
    payload.analysis?.data_collection_results ??
    {}
  );
}

function getCallerPhone(payload: WebhookPayload, collected: Collected): string | null {
  return collected.caller_phone ?? payload.caller_phone ?? payload.metadata?.caller_phone ?? null;
}

function transcriptToString(t: unknown): string | null {
  if (typeof t === 'string') return t;
  if (t == null) return null;
  return JSON.stringify(t);
}

function esc(value: unknown): string {
  // Minimal HTML escape for email bodies. Prevents injection via user fields.
  const s = value == null ? '' : String(value);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Parse a relative date phrase to ISO YYYY-MM-DD. Best-effort; returns null on failure.
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
      // If the phrase mentions "next" or "after next", push out further
      if (/\bafter next\b/.test(lower)) daysAhead += 7;
      else if (/\bnext\b/.test(lower) && daysAhead < 7) daysAhead += 7;
      return format(addDays(today, daysAhead), 'yyyy-MM-dd');
    }
  }
  return null;
}

// Map Ava's outcome enum into the database call_outcome enum + an action type.
// Ava outcomes: order_captured | callback_booked | enquiry_only | escalated | no_contact_captured | hung_up
// DB call_outcome: order | info | transfer | complaint | other
// DB action_type:  order | callback | quote | complaint | info | other
function mapCustomerOutcome(
  collected: Collected
): { call_outcome: string | null; action_type: string | null } {
  const o = (collected.outcome ?? '').toLowerCase();
  if (o === 'order_captured') return { call_outcome: 'order', action_type: 'order' };
  if (o === 'callback_booked') return { call_outcome: 'info', action_type: 'callback' };
  if (o === 'escalated') return { call_outcome: 'transfer', action_type: 'info' };
  if (o === 'enquiry_only') return { call_outcome: 'info', action_type: null };
  if (o === 'no_contact_captured' || o === 'hung_up') return { call_outcome: 'other', action_type: null };
  // Sympathy/funeral isn't a separate outcome, it's a flag. Complaint isn't in the Ava outcome list yet.
  return { call_outcome: null, action_type: null };
}

// ===== Tom pipeline =====

async function handleTomCall(
  supabase: SupabaseClient,
  twilioClient: ReturnType<typeof twilio>,
  payload: WebhookPayload,
  conversationId: string
): Promise<Response> {
  // Idempotency on sales_calls.
  const { data: existing } = await supabase
    .from('sales_calls')
    .select('id')
    .eq('elevenlabs_conversation_id', conversationId)
    .maybeSingle();
  if (existing) return json({ ok: true, deduped: true });

  const collected = getCollected(payload);
  const callerPhone = getCallerPhone(payload, collected);

  const { data: callRow, error: callError } = await supabase
    .from('sales_calls')
    .insert({
      elevenlabs_conversation_id: conversationId,
      caller_phone: callerPhone,
      duration_seconds: payload.duration_seconds ?? payload.duration ?? null,
      transcript: transcriptToString(payload.transcript),
      outcome: collected.outcome ?? null,
      raw_payload: payload,
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
  payload: WebhookPayload,
  conversationId: string
): Promise<Response> {
  // Idempotency on calls.elevenlabs_call_id.
  const { data: existing } = await supabase
    .from('calls')
    .select('id')
    .eq('elevenlabs_call_id', conversationId)
    .maybeSingle();
  if (existing) return json({ ok: true, deduped: true });

  const collected = getCollected(payload);
  const callerPhone = getCallerPhone(payload, collected);
  const mapped = mapCustomerOutcome(collected);

  const { data: callRow, error: callError } = await supabase
    .from('calls')
    .insert({
      customer_id: customer.id,
      elevenlabs_call_id: conversationId,
      caller_phone: callerPhone,
      duration_s: payload.duration_seconds ?? payload.duration ?? null,
      transcript: transcriptToString(payload.transcript),
      summary: collected.notes ?? null,
      outcome: mapped.call_outcome,
      raw_webhook: payload as unknown as Record<string, unknown>,
    })
    .select('id')
    .single<CallRow>();

  if (callError || !callRow) {
    console.error('customer call insert error', callError);
    return json({ error: callError?.message ?? 'call insert failed' }, 500);
  }

  // Create the relevant action row.
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
      due_at: dueAt ? `${dueAt}T07:00:00+10:00` : null, // 5pm AEST as a soft due time
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

  // Fire owner notification (email).
  await sendOwnerEmail({
    supabase,
    resend,
    customer,
    callId: callRow.id,
    callerPhone,
    actionType,
    collected,
    transcript: transcriptToString(payload.transcript),
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

  // Pre-insert the messages row so we have an id to track status on.
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
    // Still try to send.
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

  const conversationId = payload.conversation_id ?? payload.conversationId;
  if (!conversationId) return json({ error: 'missing conversation_id' }, 400);

  const agentId = payload.agent_id ?? payload.agentId;
  if (!agentId) return json({ error: 'missing agent_id' }, 400);

  // Dispatch: Tom or customer-facing.
  if (agentId === process.env.TOM_AGENT_ID) {
    return handleTomCall(supabase, twilioClient, payload, conversationId);
  }

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, business_name, owner_name, owner_email, elevenlabs_agent_id')
    .eq('elevenlabs_agent_id', agentId)
    .in('status', ['pilot', 'paying']) // skip churned; treat pilot and paying the same operationally
    .maybeSingle<Customer>();

  if (customerError) {
    console.error('customer lookup error', customerError);
    return json({ error: 'customer lookup failed' }, 500);
  }

  if (!customer) {
    console.log('no customer matched agent_id, skipping', { agentId });
    return json({ ok: true, skipped: 'no_customer_match' });
  }

  return handleCustomerCall(supabase, resend, customer, payload, conversationId);
}
