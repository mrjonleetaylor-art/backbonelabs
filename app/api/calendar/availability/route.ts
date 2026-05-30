// ElevenLabs server tool: check available appointment slots for a customer's Google Calendar.
// Auth: Authorization: Bearer <ELEVENLABS_TOOL_SECRET>
// Body: { agent_id, date, duration_minutes? }
// Returns: { available_slots: [{ start, end, label }] }

import { createClient } from '@supabase/supabase-js'
import { sydneyToUtc, sydneyToUtcISO, toSydneyISO, formatSydneySlotLabel } from '@/lib/time'

type RequestBody = {
  agent_id?: string
  date?: string          // YYYY-MM-DD
  duration_minutes?: number
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { access_token?: string }
  return data.access_token ?? null
}

function computeAvailableSlots(
  busyPeriods: { start: string; end: string }[],
  dateStr: string,
  durationMinutes: number
): { start: string; end: string; label: string }[] {
  const businessStartMs = sydneyToUtc(dateStr, '09:00:00').getTime()
  const businessEndMs = sydneyToUtc(dateStr, '17:00:00').getTime()
  const durationMs = durationMinutes * 60 * 1000

  const busy = busyPeriods.map(b => ({
    start: Date.parse(b.start),
    end: Date.parse(b.end),
  }))

  const slots: { start: string; end: string; label: string }[] = []
  let current = businessStartMs

  while (current + durationMs <= businessEndMs) {
    const slotEnd = current + durationMs
    const overlaps = busy.some(b => current < b.end && slotEnd > b.start)
    if (!overlaps) {
      slots.push({
        start: toSydneyISO(current),
        end: toSydneyISO(slotEnd),
        label: formatSydneySlotLabel(current),
      })
    }
    current += durationMs
  }

  return slots
}

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  const expected = `Bearer ${process.env.ELEVENLABS_TOOL_SECRET}`
  if (!process.env.ELEVENLABS_TOOL_SECRET || authHeader !== expected) {
    return json({ error: 'unauthorized' }, 401)
  }

  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return json({ error: 'invalid json' }, 400)
  }

  const { agent_id, date, duration_minutes = 60 } = body

  if (!agent_id || !date) {
    return json({ error: 'missing required fields', required: ['agent_id', 'date'] }, 400)
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json({ error: 'date must be YYYY-MM-DD' }, 400)
  }

  const admin = createClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: customer } = await admin
    .from('customers')
    .select('id, google_refresh_token, google_calendar_id, google_calendar_connected')
    .eq('elevenlabs_agent_id', agent_id)
    .maybeSingle<{
      id: string
      google_refresh_token: string | null
      google_calendar_id: string
      google_calendar_connected: boolean
    }>()

  if (!customer?.google_calendar_connected || !customer.google_refresh_token) {
    return json({ error: 'calendar_not_connected', message: 'This business has not connected Google Calendar.' }, 422)
  }

  const accessToken = await refreshAccessToken(customer.google_refresh_token)
  if (!accessToken) {
    return json({ error: 'token_refresh_failed' }, 500)
  }

  const calendarId = customer.google_calendar_id ?? 'primary'
  const timeMin = sydneyToUtcISO(date, '00:00:00')
  const timeMax = sydneyToUtcISO(date, '23:59:59')

  const freeBusyRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      timeZone: 'Australia/Sydney',
      items: [{ id: calendarId }],
    }),
  })

  if (!freeBusyRes.ok) {
    console.error('freeBusy error', await freeBusyRes.text())
    return json({ error: 'calendar_query_failed' }, 500)
  }

  const freeBusy = (await freeBusyRes.json()) as {
    calendars: Record<string, { busy: { start: string; end: string }[] }>
  }

  const busyPeriods = freeBusy.calendars?.[calendarId]?.busy ?? []
  const available_slots = computeAvailableSlots(busyPeriods, date, duration_minutes)

  return json({ date, available_slots })
}
