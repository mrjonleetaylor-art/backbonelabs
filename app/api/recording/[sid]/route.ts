import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sid: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { sid } = await params
  if (!sid || !/^RE[0-9a-fA-F]{32}$/.test(sid)) {
    return new Response('Bad request', { status: 400 })
  }

  // Ownership check: this query runs under the caller's RLS-scoped session, and
  // the voicemails SELECT policy is restricted to the caller's customer. So a
  // row comes back only if this recording belongs to them. No row = not theirs.
  const { data: voicemail } = await supabase
    .from('voicemails')
    .select('id')
    .eq('twilio_recording_sid', sid)
    .maybeSingle()
  if (!voicemail) return new Response('Not found', { status: 404 })

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!accountSid || !authToken) {
    return new Response('Server configuration error', { status: 500 })
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Recordings/${sid}.mp3`
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

  const upstream = await fetch(url, {
    headers: { Authorization: `Basic ${credentials}` },
  })

  if (!upstream.ok) {
    return new Response('Recording not found', { status: upstream.status })
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'audio/mpeg',
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
