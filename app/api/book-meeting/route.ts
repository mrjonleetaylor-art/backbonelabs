// /api/book-meeting
// Server tool endpoint called by Tom (ElevenLabs server tool) the moment a meeting is agreed.
// Synchronous: writes lead + booking to Supabase, fires SMS to Jon, returns confirmation.
// Decoupled from call lifecycle: doesn't care whether the call ends cleanly afterwards.

import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import { parse, format, addDays } from 'date-fns';

type BookingRequest = {
  caller_name?: string;
  business_name?: string;
  caller_phone?: string;
  industry?: string;
  what_theyre_solving?: string;
  booking_day?: string;
  booking_half?: string;
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: Request) {
  // Auth: ElevenLabs server tool sets Authorization: Bearer <BOOK_MEETING_SECRET>
  const authHeader = req.headers.get('authorization');
  const expected = `Bearer ${process.env.BOOK_MEETING_SECRET}`;
  if (!process.env.BOOK_MEETING_SECRET || authHeader !== expected) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  let body: BookingRequest;
  try {
    body = (await req.json()) as BookingRequest;
  } catch {
    return jsonResponse({ error: 'invalid json' }, 400);
  }

  const {
    caller_name,
    business_name,
    caller_phone,
    industry,
    what_theyre_solving,
    booking_day,
    booking_half,
  } = body ?? {};

  if (!caller_phone || !booking_day || !booking_half) {
    return jsonResponse({
      error: 'missing required fields',
      required: ['caller_phone', 'booking_day', 'booking_half'],
    }, 400);
  }

  const day = parseBookingDay(String(booking_day));
  if (!day) {
    return jsonResponse({
      error: 'could not parse booking_day',
      received: booking_day,
    }, 400);
  }

  const half = String(booking_half).toUpperCase();
  if (half !== 'AM' && half !== 'PM') {
    return jsonResponse({
      error: 'booking_half must be AM or PM',
      received: booking_half,
    }, 400);
  }

  // Lazy init clients to avoid build-time SSR failure.
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );

  // Upsert lead by phone.
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .upsert({
      name: caller_name ?? null,
      business: business_name ?? null,
      phone: caller_phone,
      industry: industry ?? null,
      what_theyre_solving: what_theyre_solving ?? null,
    }, { onConflict: 'phone', ignoreDuplicates: false })
    .select()
    .single();

  if (leadError || !lead) {
    console.error('book_meeting: lead upsert error', leadError);
    return jsonResponse({
      error: 'failed to upsert lead',
      detail: leadError?.message,
    }, 500);
  }

  // Insert booking. call_id is intentionally null; post-call webhook backfills it later.
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      lead_id: lead.id,
      call_id: null,
      day,
      half,
      notes: what_theyre_solving ?? null,
    })
    .select()
    .single();

  if (bookingError) {
    console.error('book_meeting: booking insert error', bookingError);
    return jsonResponse({
      error: 'failed to insert booking',
      detail: bookingError.message,
    }, 500);
  }

  // Fire SMS to Jon. Don't block on failure.
  try {
    const prettyDay = format(parse(day, 'yyyy-MM-dd', new Date()), 'EEEE d MMM');
    const halfWord = half === 'AM' ? 'morning' : 'afternoon';
    await twilioClient.messages.create({
      from: process.env.TWILIO_FROM_NUMBER!,
      to: process.env.JON_MOBILE!,
      body: `RelayDesk: Tom booked a meeting for ${prettyDay} ${halfWord} with ${caller_name ?? 'someone'} from ${business_name ?? 'an unknown business'}. Phone: ${caller_phone}`,
    });
  } catch (smsErr) {
    console.error('book_meeting: sms send error', smsErr);
    // Don't fail the booking on SMS failure.
  }

  return jsonResponse({
    ok: true,
    booking_id: booking.id,
    confirmation: `Meeting booked for ${day} ${half}`,
  }, 200);
}

// Parse booking_day from whatever the LLM produced.
// Prefer ISO YYYY-MM-DD, fall back to "12 May 2026" or bare day name.
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
