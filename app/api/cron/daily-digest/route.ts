// app/api/cron/daily-digest/route.ts
// Vercel cron: fires once a day at 18:00 AEST (08:00 UTC).
// Sends an end-of-day summary of meetings Tom booked today
// and what's scheduled for tomorrow.

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { format, addDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const TZ = 'Australia/Sydney';

type BookingRow = {
  half: string;
  lead?: { name?: string; business?: string; phone?: string } | null;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(req: Request) {
  // Vercel cron sends a bearer token. Reject anything that doesn't match.
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return json({ error: 'unauthorized' }, 401);
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY!);

  const now = toZonedTime(new Date(), TZ);
  const today = format(now, 'yyyy-MM-dd');
  const tomorrow = format(addDays(now, 1), 'yyyy-MM-dd');

  const todayStartUtc = new Date(`${today}T00:00:00+10:00`).toISOString();
  const tomorrowStartUtc = new Date(`${tomorrow}T00:00:00+10:00`).toISOString();

  const { data: bookedToday, error: bookedTodayErr } = await supabase
    .from('bookings')
    .select('half, lead:leads(name, business, phone)')
    .gte('created_at', todayStartUtc)
    .lt('created_at', tomorrowStartUtc);
  if (bookedTodayErr) console.error('bookedToday err', bookedTodayErr);

  const { data: tomorrowCalls, error: tomorrowErr } = await supabase
    .from('bookings')
    .select('half, lead:leads(name, business, phone)')
    .eq('day', tomorrow)
    .eq('status', 'pending');
  if (tomorrowErr) console.error('tomorrow err', tomorrowErr);

  const todayList: BookingRow[] = (bookedToday ?? []) as BookingRow[];
  const allTomorrow: BookingRow[] = (tomorrowCalls ?? []) as BookingRow[];
  const tomorrowAm = allTomorrow.filter((b) => b.half === 'AM');
  const tomorrowPm = allTomorrow.filter((b) => b.half === 'PM');

  const todayCount = todayList.length;
  const todayNames = formatNames(todayList) || 'no one';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.5; color: #222;">
      <h2 style="margin: 0 0 16px 0; font-size: 16px;">Tom's day</h2>
      <p>Today Tom booked <strong>${todayCount}</strong> ${pluralise('meeting', todayCount)}: ${todayNames}.</p>
      <p>Tomorrow you have:</p>
      <ul style="margin: 0 0 12px 16px; padding: 0;">
        <li><strong>${tomorrowAm.length}</strong> ${pluralise('morning call', tomorrowAm.length)}: ${formatNames(tomorrowAm) || 'none'}</li>
        <li><strong>${tomorrowPm.length}</strong> ${pluralise('afternoon call', tomorrowPm.length)}: ${formatNames(tomorrowPm) || 'none'}</li>
      </ul>
      <p style="margin-top: 24px; font-size: 12px; color: #666;">RelayDesk daily digest. ${format(now, 'EEEE d MMM yyyy')}.</p>
    </div>
  `;

  const subject =
    todayCount > 0
      ? `Tom booked ${todayCount} ${pluralise('meeting', todayCount)} today`
      : `No meetings booked today, ${tomorrowAm.length + tomorrowPm.length} ${pluralise('call', tomorrowAm.length + tomorrowPm.length)} tomorrow`;

  await resend.emails.send({
    from: 'RelayDesk <hello@relaydesk.com.au>',
    to: process.env.JON_EMAIL!,
    subject,
    html,
  });

  return json({
    ok: true,
    todayCount,
    tomorrowAm: tomorrowAm.length,
    tomorrowPm: tomorrowPm.length,
  });
}

function formatNames(rows: BookingRow[]): string {
  return rows
    .map((r) => {
      const name = r.lead?.name ?? 'unknown';
      const business = r.lead?.business ?? 'unknown business';
      return `${name} (${business})`;
    })
    .join(', ');
}

function pluralise(word: string, n: number): string {
  return n === 1 ? word : `${word}s`;
}
