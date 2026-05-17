// ElevenLabs server tool: create a Google Calendar appointment for a customer.
// Auth: Authorization: Bearer <ELEVENLABS_TOOL_SECRET>
// Body: { agent_id, caller_name, caller_phone, service, start, end, notes? }
// Returns: { ok, event_id, confirmation }

import { createClient } from '@supabase/supabase-js'

type RequestBody = {
  agent_id?: string
  caller_name?: string
  caller_phone?: string
  service?: string
  start?: string   // ISO 8601
  end?: string     // ISO 8601
  notes?: string
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

function formatConfirmation(start: string, service: string | undefined): string {
  try {
    const d = new Date(start)
    const opts: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Australia/Sydney',
    }
    const formatted = d.toLocaleString('en-AU', opts)
    return service ? `${service} booked for ${formatted}` : `Appointment booked for ${formatted}`
  } catch {
    return 'Appointment booked successfully'
  }
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

  const { agent_id, caller_name, caller_phone, service, start, end, notes } = body

  if (!agent_id || !start || !end) {
    return json({ error: 'missing required fields', required: ['agent_id', 'start', 'end'] }, 400)
  }

  const admin = createClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: customer } = await admin
    .from('customers')
    .select('id, business_name, google_refresh_token, google_calendar_id, google_calendar_connected')
    .eq('elevenlabs_agent_id', agent_id)
    .maybeSingle<{
      id: string
      business_name: string
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
  const summary = service
    ? `${service} - ${caller_name ?? 'Customer'}`
    : `Appointment - ${caller_name ?? 'Customer'}`

  const descriptionParts = [
    caller_name ? `Name: ${caller_name}` : null,
    caller_phone ? `Phone: ${caller_phone}` : null,
    notes ? `Notes: ${notes}` : null,
    `Booked by RelayDesk`,
  ].filter(Boolean)

  const eventRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary,
        description: descriptionParts.join('\n'),
        start: { dateTime: start, timeZone: 'Australia/Sydney' },
        end: { dateTime: end, timeZone: 'Australia/Sydney' },
      }),
    }
  )

  if (!eventRes.ok) {
    console.error('Google Calendar event creation failed', await eventRes.text())
    return json({ error: 'event_creation_failed' }, 500)
  }

  const event = (await eventRes.json()) as { id?: string }
  const googleEventId = event.id ?? null

  const { error: insertError } = await admin.from('appointments').insert({
    customer_id: customer.id,
    caller_name: caller_name ?? null,
    caller_phone: caller_phone ?? null,
    service: service ?? null,
    booked_for: start,
    end_time: end,
    google_event_id: googleEventId,
    notes: notes ?? null,
  })

  if (insertError) {
    console.error('appointments insert error', insertError)
    // Don't fail — the calendar event was created successfully
  }

  return json({
    ok: true,
    event_id: googleEventId,
    confirmation: formatConfirmation(start, service),
  })
}
