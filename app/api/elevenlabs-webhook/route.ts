// app/api/elevenlabs-webhook/route.ts
// Receives ElevenLabs post-call webhooks, writes to Supabase
// (sales_calls, leads, bookings), fires SMS on bookings.

import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import { parse, addDays, format } from 'date-fns';
import crypto from 'crypto';

type Collected = {
  caller_phone?: string;
  caller_name?: string;
  business_name?: string;
  industry?: string;
  what_theyre_solving?: string;
  outcome?: string;
  booking_agreed?: boolean;
  booking_day?: string;
  booking_half?: string;
};

type WebhookPayload = {
  conversation_id?: string;
  conversationId?: string;
  agent_id?: string;
  agentId?: string;
  caller_phone?: string;
  duration_seconds?: number;
  duration?: number;
  transcript?: string;
  collected_data?: Collected;
  data_collection_results?: Collected;
  analysis?: { data_collection_results?: Collected };
  metadata?: { caller_phone?: string };
};

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

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );

  const rawBody = await req.text();
  const sigHeader = req.headers.get('elevenlabs-signature');
  const parsed = parseSignatureHeader(sigHeader);
  if (!parsed || !verifySignature(parsed.timestamp, rawBody, parsed.signature)) {
    return new Response(JSON.stringify({ error: 'invalid signature' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  const conversationId = payload.conversation_id ?? payload.conversationId;
  if (!conversationId) return json({ error: 'missing conversation_id' }, 400);

  // Idempotency: if we've already processed this conversation, ack and bail.
  const { data: existing } = await supabase
    .from('sales_calls')
    .select('id')
    .eq('elevenlabs_conversation_id', conversationId)
    .maybeSingle();
  if (existing) return json({ ok: true, deduped: true });

  // Map agent_id — only process Tom's conversations here.
  const agentId = payload.agent_id ?? payload.agentId;
  if (agentId !== process.env.TOM_AGENT_ID) {
    console.log('skipping non-Tom agent', { agentId });
    return json({ ok: true, skipped: 'not_tom' });
  }

  // Structured data collected during the call.
  const collected: Collected =
    payload.collected_data ??
    payload.data_collection_results ??
    payload.analysis?.data_collection_results ??
    {};

  const callerPhone =
    collected.caller_phone ??
    payload.caller_phone ??
    payload.metadata?.caller_phone ??
    null;

  // Insert sales_calls row.
  const { data: callRow, error: callError } = await supabase
    .from('sales_calls')
    .insert({
      elevenlabs_conversation_id: conversationId,
      caller_phone: callerPhone,
      duration_seconds: payload.duration_seconds ?? payload.duration ?? null,
      transcript:
        typeof payload.transcript === 'string'
          ? payload.transcript
          : JSON.stringify(payload.transcript ?? null),
      outcome: collected.outcome ?? null,
      raw_payload: payload,
    })
    .select()
    .single();

  if (callError || !callRow) {
    console.error('call insert error', callError);
    return json({ error: callError?.message ?? 'call insert failed' }, 500);
  }

  // Upsert lead by phone.
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
    if (leadError) console.error('lead upsert error', leadError);
    leadId = lead?.id ?? null;
  }

  // Booking, if Tom captured one.
  if (
    collected.booking_agreed === true &&
    collected.booking_day &&
    collected.booking_half &&
    leadId
  ) {
    const day = parseBookingDay(String(collected.booking_day));
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
        console.error('booking insert error', bookingError);
      } else if (booking) {
        try {
          await sendBookingSms(twilioClient, {
            name: collected.caller_name ?? 'someone',
            business: collected.business_name ?? 'an unknown business',
            phone: callerPhone ?? 'unknown',
            day,
            half: half as 'AM' | 'PM',
          });
        } catch (smsErr) {
          console.error('sms send error', smsErr);
        }
      }
    } else {
      console.warn('booking captured but day/half failed validation', {
        booking_day: collected.booking_day,
        booking_half: collected.booking_half,
      });
    }
  }

  return json({ ok: true });
}

// Parse ElevenLabs' freeform booking_day string to ISO YYYY-MM-DD.
// The prompt asks for ISO but we accept "Tuesday 12 May 2026" and bare day names.
function parseBookingDay(input: string): string | null {
  if (!input) return null;

  const isoMatch = input.match(/\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];

  const fullMatch = input.match(/\d{1,2}\s+[A-Za-z]+\s+\d{4}/);
  if (fullMatch) {
    try {
      const parsed = parse(fullMatch[0], 'd MMMM yyyy', new Date());
      if (!isNaN(parsed.getTime())) return format(parsed, 'yyyy-MM-dd');
    } catch { /* fall through */ }
  }

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const lower = input.toLowerCase();
  for (let i = 0; i < dayNames.length; i++) {
    if (lower.includes(dayNames[i])) {
      const today = new Date();
      let daysAhead = i - today.getDay();
      if (daysAhead <= 0) daysAhead += 7;
      return format(addDays(today, daysAhead), 'yyyy-MM-dd');
    }
  }
  return null;
}

async function sendBookingSms(
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
