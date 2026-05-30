import { redirect } from 'next/navigation'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { badgeVariant } from '../_components/Badge'
import ActivityFilters from './ActivityFilters'
import ActivityTable from './ActivityTable'
import type { TableRow } from './ActivityTable'

const PAGE_SIZE = 25
const DEFAULT_DAYS = 7
const MAX_DAYS = 90

type SearchParams = {
  outcome?: string
  search?: string
  since?: string
  page?: string
  open?: string
}

// A row from the activity_feed view (see supabase/migrations/0001_activity_feed.sql).
type FeedRow = {
  kind: 'call' | 'voicemail'
  id: string
  phone: string | null
  at: string
  duration: number | null
  outcome: string | null
  recording_sid: string | null
  has_pending_callback: boolean
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// Validate and clamp the `since` window: reject malformed input (fall back to
// the 7-day default) and cap the lookback at 90 days before today.
function resolveSince(raw: string | undefined): string {
  const now = new Date()
  const defaultSince = new Date(now)
  defaultSince.setUTCDate(defaultSince.getUTCDate() - DEFAULT_DAYS)
  const maxSince = new Date(now)
  maxSince.setUTCDate(maxSince.getUTCDate() - MAX_DAYS)

  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return ymd(defaultSince)
  const parsed = new Date(`${raw}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return ymd(defaultSince)
  if (parsed.getTime() > now.getTime()) return ymd(defaultSince) // future -> default
  if (parsed.getTime() < maxSince.getTime()) return ymd(maxSince) // older than 90d -> clamp
  return raw
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
  const since = resolveSince(params.since)
  const sinceIso = new Date(`${since}T00:00:00Z`).toISOString()
  const initialExpandedId = params.open ?? null
  const offset = (page - 1) * PAGE_SIZE

  // Minimal builder shape we drive against the activity_feed view. The view is
  // not in the generated DB types, so we cast to this rather than fight the
  // recursive PostgrestFilterBuilder generics (which blow the type checker).
  type FeedBuilder = {
    eq(column: string, value: unknown): FeedBuilder
    gte(column: string, value: unknown): FeedBuilder
    ilike(column: string, value: string): FeedBuilder
    order(column: string, opts: { ascending: boolean }): FeedBuilder
    range(from: number, to: number): FeedBuilder
    then: PromiseLike<{ data: FeedRow[] | null; error: unknown; count: number | null }>['then']
  }

  // Apply the customer/window/search/outcome filters to a query builder.
  // Used identically for the data page and the exact-count query so they
  // always describe the same result set. The outcome mapping mirrors the
  // ActivityFilters values: callback vs question split on has_pending_callback,
  // and the two together are exactly the in-window `info` calls.
  function applyFilters(q: FeedBuilder): FeedBuilder {
    let out = q.eq('customer_id', customer!.id).gte('at', sinceIso)
    if (search) out = out.ilike('phone', `%${search}%`)
    switch (outcomeFilter) {
      case 'order':
        out = out.eq('outcome', 'order')
        break
      case 'transfer':
        out = out.eq('outcome', 'transfer')
        break
      case 'voicemail':
        out = out.eq('outcome', 'voicemail')
        break
      case 'callback':
        out = out.eq('outcome', 'info').eq('has_pending_callback', true)
        break
      case 'question':
        out = out.eq('outcome', 'info').eq('has_pending_callback', false)
        break
      // 'all' (and anything unrecognised): no outcome filter, includes voicemails
    }
    return out
  }

  const dataQuery = applyFilters(
    admin
      .from('activity_feed')
      .select('kind, id, phone, at, duration, outcome, recording_sid, has_pending_callback') as unknown as FeedBuilder
  )
    .order('at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const countQuery = applyFilters(
    admin.from('activity_feed').select('*', { count: 'exact', head: true }) as unknown as FeedBuilder
  )

  const [{ data, error }, { count }] = await Promise.all([dataQuery, countQuery])
  if (error) throw error

  const rows = data ?? []
  const total = count ?? 0
  const hasMore = offset + PAGE_SIZE < total

  const tableRows: TableRow[] = rows.map(row => ({
    kind: row.kind,
    id: row.id,
    phone: row.phone,
    at: row.at,
    duration: row.duration,
    variant: row.kind === 'voicemail'
      ? 'voicemail'
      : badgeVariant(row.outcome, row.has_pending_callback),
    recordingSid: row.kind === 'voicemail' ? row.recording_sid : undefined,
  }))

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold tracking-[-0.025em] text-slate-900">Activity</h1>
        <p className="text-[13px] text-slate-400 mt-1">Every call your agent handled, in one place.</p>
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
