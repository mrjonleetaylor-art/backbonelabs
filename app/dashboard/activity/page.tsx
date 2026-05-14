import { redirect } from 'next/navigation'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { badgeVariant } from '../_components/Badge'
import ActivityFilters from './ActivityFilters'
import ActivityTable from './ActivityTable'
import type { TableRow } from './ActivityTable'

const PAGE_SIZE = 25

type SearchParams = {
  outcome?: string
  search?: string
  since?: string
  page?: string
  open?: string
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
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

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const outcomeFilter = params.outcome ?? 'all'
  const search = params.search ?? ''
  const since = params.since ?? (() => {
    const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10)
  })()
  const sinceDate = new Date(since)
  const initialExpandedId = params.open ?? null

  // Build calls query
  let callsQuery = admin
    .from('calls')
    .select('id, caller_phone, started_at, duration_s, outcome')
    .eq('customer_id', customer.id)
    .gte('started_at', sinceDate.toISOString())
    .order('started_at', { ascending: false })

  if (outcomeFilter === 'order') callsQuery = callsQuery.eq('outcome', 'order')
  else if (outcomeFilter === 'transfer') callsQuery = callsQuery.eq('outcome', 'transfer')
  else if (outcomeFilter === 'complaint') callsQuery = callsQuery.eq('outcome', 'complaint')
  else if (outcomeFilter === 'callback' || outcomeFilter === 'question') callsQuery = callsQuery.eq('outcome', 'info')

  const showVoicemails = outcomeFilter === 'all' || outcomeFilter === 'voicemail'
  const showCalls = outcomeFilter !== 'voicemail'

  const [callsResult, voicemailsResult] = await Promise.all([
    showCalls ? callsQuery : Promise.resolve({ data: [] }),
    showVoicemails
      ? admin.from('voicemails').select('id, twilio_from_number, created_at, duration_seconds').eq('customer_id', customer.id).gte('created_at', sinceDate.toISOString()).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ])

  type CallRow = { id: string; caller_phone: string | null; started_at: string; duration_s: number | null; outcome: string | null }
  type VoicemailRow = { id: string; twilio_from_number: string | null; created_at: string; duration_seconds: number | null }

  const calls = (callsResult.data ?? []) as CallRow[]
  const voicemails = (voicemailsResult.data ?? []) as VoicemailRow[]

  const allCallIds = calls.map(c => c.id)
  const { data: callbackActions } = allCallIds.length > 0
    ? await admin.from('actions').select('call_id').in('call_id', allCallIds).eq('type', 'callback').eq('status', 'pending')
    : { data: [] }
  const callbackSet = new Set((callbackActions ?? []).map(a => a.call_id))

  type MergedRow =
    | { kind: 'call'; id: string; phone: string | null; at: string; duration: number | null; outcome: string | null }
    | { kind: 'voicemail'; id: string; phone: string | null; at: string; duration: number | null }

  const merged: MergedRow[] = [
    ...calls.map(c => ({ kind: 'call' as const, id: c.id, phone: c.caller_phone, at: c.started_at, duration: c.duration_s, outcome: c.outcome })),
    ...voicemails.map(v => ({ kind: 'voicemail' as const, id: v.id, phone: v.twilio_from_number, at: v.created_at, duration: v.duration_seconds })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  const filtered = search ? merged.filter(r => r.phone?.includes(search)) : merged

  const finalRows = outcomeFilter === 'callback'
    ? filtered.filter(r => r.kind === 'call' && callbackSet.has(r.id))
    : outcomeFilter === 'question'
    ? filtered.filter(r => r.kind === 'call' && !callbackSet.has(r.id) && r.outcome === 'info')
    : filtered

  const offset = (page - 1) * PAGE_SIZE
  const pageRows = finalRows.slice(offset, offset + PAGE_SIZE)
  const hasMore = finalRows.length > offset + PAGE_SIZE

  const tableRows: TableRow[] = pageRows.map(row => ({
    kind: row.kind,
    id: row.id,
    phone: row.phone,
    at: row.at,
    duration: row.duration,
    variant: row.kind === 'voicemail'
      ? 'voicemail'
      : badgeVariant(row.outcome ?? null, callbackSet.has(row.id)),
  }))

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold tracking-[-0.025em] text-slate-900">Activity</h1>
        <p className="text-[13px] text-slate-400 mt-1">Every call Tom handled, in one place.</p>
      </div>

      <ActivityFilters current={{ outcome: outcomeFilter, search, since }} />

      <ActivityTable
        rows={tableRows}
        initialExpandedId={initialExpandedId}
        hasMore={hasMore}
        page={page}
        outcomeFilter={outcomeFilter}
        since={since}
        search={search}
      />
    </div>
  )
}
