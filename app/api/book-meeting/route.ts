// /api/book-meeting
// Server tool endpoint called by Tom (ElevenLabs server tool) the moment a meeting is agreed.
// Synchronous: writes lead + booking to Supabase, fires email notification to Jon, returns confirmation.
// Decoupled from call lifecycle: doesn't care whether the call ends cleanly afterwards.
//
// This file lives in the project as: app/api/book-meeting/route.ts (App Router)
// Source canonical: ~/Projects/backbone-labs/agent/pipeline/book-meeting.ts
//
// Notification path: Resend email. SMS via Twilio is blocked because the current Twilio
// AU number isn't SMS-enabled. Switching to SMS later means flipping the Resend block to Twilio.

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
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
  const resend = new Resend(process.env.RESEND_API_KEY!);

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

  // Fire email notification to Jon. Don't block on failure.
  // (Was Twilio SMS, but the current AU Twilio number isn't SMS-enabled. Switch back when it is.)
  try {
    const prettyDay = format(parse(day, 'yyyy-MM-dd', new Date()), 'EEEE d MMM');
    const halfWord = half === 'AM' ? 'morning' : 'afternoon';
    const summary = `${caller_name ?? 'someone'} from ${business_name ?? 'an unknown business'}`;
    await resend.emails.send({
      from: 'RelayDesk <hello@relaydesk.com.au>',
      to: process.env.JON_EMAIL!,
      subject: `Tom booked: ${prettyDay} ${halfWord}, ${summary}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.5; color: #222;">
          <h2 style="margin: 0 0 12px 0; font-size: 16px;">New meeting booked</h2>
          <p><strong>When:</strong> ${prettyDay} ${halfWord}</p>
          <p><strong>Caller:</strong> ${caller_name ?? 'unknown name'}</p>
          <p><strong>Business:</strong> ${business_name ?? 'unknown business'}</p>
          <p><strong>Industry:</strong> ${industry ?? 'not captured'}</p>
          <p><strong>Phone:</strong> ${caller_phone}</p>
          <p><strong>What they're solving:</strong> ${what_theyre_solving ?? 'not captured'}</p>
        </div>
      `,
    });
  } catch (emailErr) {
    console.error('book_meeting: email send error', emailErr);
    // Don't fail the booking on email failure.
  }

  return jsonResponse({
    ok: true,
    booking_id: booking.id,
    confirmation: `Meeting booked for ${day} ${half}`,
  }, 200);
}

// Parse booking_day from whatever the LLM produced.
// Server-side date math is the source of truth. The LLM should pass raw phrases,
// not pre-computed ISO dates, because LLMs are unreliable at calendar arithmetic.
// Order: ISO date → "today"/"tomorrow" → full date string → day name → fail.
function parseBookingDay(input: string): string | null {
  if (!input) return null;
  const lower = input.toLowerCase().trim();

  // ISO date already present. Trust it (LLM gave a specific calendar date).
  const isoMatch = input.match(/\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];

  // Relative: today, tomorrow.
  if (/\btoday\b/.test(lower)) {
    return format(new Date(), 'yyyy-MM-dd');
  }
  if (/\btomorrow\b/.test(lower)) {
    return format(addDays(new Date(), 1), 'yyyy-MM-dd');
  }

  // Full date like "12 May 2026" or "Tuesday 12 May 2026".
  const fullMatch = input.match(/\d{1,2}\s+[A-Za-z]+\s+\d{4}/);
  if (fullMatch) {
    try {
      const parsed = parse(fullMatch[0], 'd MMMM yyyy', new Date());
      if (!isNaN(parsed.getTime())) return format(parsed, 'yyyy-MM-dd');
    } catch { /* fall through */ }
  }

  // Day of week ("monday", "next tuesday", etc.). Compute next occurrence.
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < dayNames.length; i++) {
    if (lower.includes(dayNames[i])) {
      const today = new Date();
      const targetDow = i;
      const currentDow = today.getDay();
      let daysAhead = targetDow - currentDow;
      if (daysAhead <= 0) daysAhead += 7;
      return format(addDays(today, daysAhead), 'yyyy-MM-dd');
    }
  }
  return null;
}
