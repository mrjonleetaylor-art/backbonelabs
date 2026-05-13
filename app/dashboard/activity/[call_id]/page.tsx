import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import Badge, { badgeVariant } from '../../_components/Badge'
import { formatCallTime, formatDuration } from '@/lib/formatTime'
import EmailSummaryButton from './EmailSummaryButton'

type Params = { call_id: string }

export default async function CallDetailPage({ params }: { params: Promise<Params> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createServiceClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: customer } = await admin
    .from('customers')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle<{ id: string }>()
  if (!customer) redirect('/auth/error')

  const { call_id } = await params

  const { data: call } = await admin
    .from('calls')
    .select('id, caller_phone, started_at, duration_s, outcome, transcript')
    .eq('id', call_id)
    .eq('customer_id', customer.id)
    .maybeSingle<{
      id: string
      caller_phone: string | null
      started_at: string
      duration_s: number | null
      outcome: string | null
      transcript: string | null
    }>()

  if (!call) notFound()

  const { data: action } = await admin
    .from('actions')
    .select('type, payload')
    .eq('call_id', call_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ type: string; payload: Record<string, unknown> }>()

  const { data: callbackAction } = await admin
    .from('actions')
    .select('id')
    .eq('call_id', call_id)
    .eq('type', 'callback')
    .eq('status', 'pending')
    .maybeSingle<{ id: string }>()

  const variant = badgeVariant(call.outcome, !!callbackAction)

  // Parse transcript
  type Turn = { role: string; message: string }
  let turns: Turn[] | null = null
  let rawTranscript: string | null = null
  if (call.transcript) {
    try {
      const parsed = JSON.parse(call.transcript)
      if (Array.isArray(parsed)) turns = parsed as Turn[]
      else rawTranscript = call.transcript
    } catch {
      rawTranscript = call.transcript
    }
  }

  // Build summary fields from action payload
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

  const summaryFields = action?.payload
    ? Object.entries(FIELD_LABELS)
        .filter(([key]) => {
          const v = action.payload[key]
          return v != null && v !== '' && v !== false
        })
        .map(([key, label]) => ({ label, value: String(action.payload[key]) }))
    : []

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      {/* Back */}
      <Link href="/dashboard/activity" className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-600 transition-colors mb-6">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back to activity
      </Link>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em] text-slate-900">
            {call.caller_phone ?? 'Unknown caller'}
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            {formatCallTime(call.started_at)} &middot; {formatDuration(call.duration_s)}
          </p>
        </div>
        <Badge variant={variant} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: transcript */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-[14px] font-semibold text-slate-900">Transcript</h2>
            </div>
            <div className="px-6 py-5 space-y-3 max-h-[600px] overflow-y-auto">
              {turns ? (
                turns.map((t, i) => {
                  const isAgent = t.role === 'agent'
                  return (
                    <div key={i} className={`flex gap-3 ${isAgent ? '' : 'flex-row-reverse'}`}>
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        style={{ background: isAgent ? '#6366F1' : '#94A3B8' }}
                      >
                        {isAgent ? 'T' : 'C'}
                      </div>
                      <div className={`rounded-xl px-4 py-2.5 text-[13px] leading-relaxed max-w-[80%] ${isAgent ? 'bg-indigo-50 text-slate-800' : 'bg-slate-100 text-slate-700'}`}>
                        <p className="text-[10px] font-semibold mb-1 uppercase tracking-wide" style={{ color: isAgent ? '#6366F1' : '#64748B' }}>
                          {isAgent ? 'Tom' : 'Caller'}
                        </p>
                        {t.message}
                      </div>
                    </div>
                  )
                })
              ) : rawTranscript ? (
                <pre className="text-[12px] text-slate-600 whitespace-pre-wrap leading-relaxed">{rawTranscript}</pre>
              ) : (
                <p className="text-[13px] text-slate-400">No transcript available for this call.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: summary + actions */}
        <div className="space-y-4">
          {/* Summary card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden sticky top-8" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-[14px] font-semibold text-slate-900">Summary</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              {summaryFields.length > 0 ? (
                summaryFields.map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-0.5">{label}</p>
                    <p className="text-[13px] text-slate-800">{value}</p>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-slate-400">No structured data for this call.</p>
              )}
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-2">
              <button
                disabled
                aria-disabled="true"
                className="w-full text-[13px] font-medium text-slate-400 border border-slate-200 rounded-lg py-2.5 cursor-not-allowed flex items-center justify-between px-4"
              >
                Request recording
                <span className="text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-400 rounded px-1.5 py-0.5">Soon</span>
              </button>
              <button
                disabled
                aria-disabled="true"
                className="w-full text-[13px] font-medium text-slate-400 border border-slate-200 rounded-lg py-2.5 cursor-not-allowed flex items-center justify-between px-4"
              >
                Send payment link
                <span className="text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-400 rounded px-1.5 py-0.5">Soon</span>
              </button>
              <EmailSummaryButton callId={call.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
