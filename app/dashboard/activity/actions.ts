'use server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export type CallDetail = {
  callId: string
  turns: Array<{ role: string; message: string }> | null
  rawTranscript: string | null
  summaryFields: Array<{ label: string; value: string }>
}

const FIELD_LABELS: Record<string, string> = {
  recipient_name: 'Recipient',
  order_type: 'Item',
  delivery_address: 'Delivery address',
  pickup_time: 'Pickup time',
  delivery_date: 'Delivery date',
  delivery_window: 'Delivery window',
  occasion: 'Occasion',
  budget: 'Budget',
  card_message: 'Card message',
  caller_name: 'Caller name',
  caller_phone: 'Caller phone',
  callback_day: 'Callback day',
  callback_half: 'Time',
  callback_reason: 'Reason',
}

export async function getCallDetail(callId: string): Promise<CallDetail | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const admin = createServiceClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: customer } = await admin
    .from('customers')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle<{ id: string }>()
  if (!customer) return { error: 'Customer not found.' }

  const { data: call } = await admin
    .from('calls')
    .select('id, transcript')
    .eq('id', callId)
    .eq('customer_id', customer.id)
    .maybeSingle<{ id: string; transcript: string | null }>()
  if (!call) return { error: 'Call not found.' }

  const { data: action } = await admin
    .from('actions')
    .select('type, payload')
    .eq('call_id', callId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ type: string; payload: Record<string, unknown> }>()

  let turns: Array<{ role: string; message: string }> | null = null
  let rawTranscript: string | null = null
  if (call.transcript) {
    try {
      const parsed = JSON.parse(call.transcript)
      if (Array.isArray(parsed)) turns = parsed
      else rawTranscript = call.transcript
    } catch {
      rawTranscript = call.transcript
    }
  }

  const summaryFields = action?.payload
    ? Object.entries(FIELD_LABELS)
        .filter(([key]) => {
          const v = action.payload[key]
          return v != null && v !== '' && v !== false
        })
        .map(([key, label]) => ({ label, value: String(action.payload[key]) }))
    : []

  return { callId, turns, rawTranscript, summaryFields }
}

function esc(v: unknown): string {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export async function emailCallSummary(callId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  const admin = createServiceClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verify call belongs to this customer
  const { data: customer } = await admin
    .from('customers')
    .select('id, business_name, owner_name, owner_email')
    .eq('auth_user_id', user.id)
    .maybeSingle<{ id: string; business_name: string; owner_name: string | null; owner_email: string }>()
  if (!customer) return { ok: false, error: 'Customer not found.' }

  const { data: call } = await admin
    .from('calls')
    .select('id, caller_phone, started_at, duration_s, transcript, outcome')
    .eq('id', callId)
    .eq('customer_id', customer.id)
    .maybeSingle<{ id: string; caller_phone: string | null; started_at: string; duration_s: number | null; transcript: string | null; outcome: string | null }>()
  if (!call) return { ok: false, error: 'Call not found.' }

  const { data: action } = await admin
    .from('actions')
    .select('type, payload')
    .eq('call_id', callId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ type: string; payload: Record<string, unknown> }>()

  const callerName = (action?.payload?.caller_name as string | null) ?? call.caller_phone ?? 'Unknown caller'
  const subject = `Call summary: ${callerName}`

  // Build structured summary HTML
  const payloadRows = action?.payload ? Object.entries(action.payload)
    .filter(([k, v]) => v != null && v !== '' && !['caller_phone', 'is_sympathy_or_funeral', 'escalation_needed'].includes(k))
    .map(([k, v]) => `<p style="margin:3px 0"><strong>${esc(k.replace(/_/g, ' '))}:</strong> ${esc(v)}</p>`)
    .join('') : ''

  // Transcript excerpt
  let transcriptHtml = ''
  if (call.transcript) {
    try {
      const turns = JSON.parse(call.transcript) as Array<{ role: string; message: string }>
      if (Array.isArray(turns)) {
        transcriptHtml = `
          <h3 style="margin:20px 0 8px;font-size:13px;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">Transcript</h3>
          <div style="background:#F8FAFC;border-radius:8px;padding:12px;font-size:12px;line-height:1.6;">
            ${turns.map(t => `<p style="margin:4px 0"><strong style="color:${t.role === 'agent' ? '#1E3A5F' : '#0F172A'}">${t.role === 'agent' ? 'Tom' : 'Caller'}:</strong> ${esc(t.message)}</p>`).join('')}
          </div>`
      }
    } catch {
      transcriptHtml = `<pre style="background:#F8FAFC;padding:12px;border-radius:8px;font-size:12px;white-space:pre-wrap;">${esc(call.transcript.slice(0, 800))}</pre>`
    }
  }

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;color:#222;max-width:600px;">
      <h2 style="margin:0 0 12px;font-size:16px;">${esc(subject)}</h2>
      ${payloadRows}
      ${transcriptHtml}
      <p style="margin-top:24px;font-size:12px;color:#888;">RelayDesk &middot; ${esc(customer.business_name)}</p>
    </div>`

  const recipient = customer.owner_email
  const { data: msg } = await admin.from('messages').insert({
    customer_id: customer.id,
    call_id: callId,
    channel: 'email',
    recipient,
    subject,
    body: html,
    status: 'queued',
  }).select('id').single<{ id: string }>()

  const resend = new Resend(process.env.RESEND_API_KEY!)
  try {
    const result = await resend.emails.send({
      from: 'RelayDesk <hello@relaydesk.com.au>',
      to: recipient,
      subject,
      html,
    })
    const providerId = (result as { data?: { id?: string } }).data?.id ?? null
    if (msg?.id) {
      await admin.from('messages').update({ status: 'sent', provider_id: providerId, sent_at: new Date().toISOString() }).eq('id', msg.id)
    }
    return { ok: true }
  } catch (err) {
    if (msg?.id) {
      await admin.from('messages').update({ status: 'failed', error: String(err) }).eq('id', msg.id)
    }
    return { ok: false, error: 'Email failed to send.' }
  }
}
