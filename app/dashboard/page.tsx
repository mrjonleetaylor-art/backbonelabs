import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import KpiCard from './_components/KpiCard'
import { Card, CardHeader, CardBody } from './_components/Card'
import OutstandingRow from './_components/OutstandingRow'
import Avatar, { initialsFrom } from './_components/Avatar'
import Badge, { badgeVariant } from './_components/Badge'
import { formatCallTime, formatDuration, formatAuPhone, isoWeekRange, formatWeekRange } from '@/lib/formatTime'

function greeting(): string {
  const hr = new Date().toLocaleString('en-AU', { hour: 'numeric', hour12: false, timeZone: 'Australia/Sydney' })
  const h = parseInt(hr)
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createServiceClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: customer } = await admin
    .from('customers')
    .select('id, business_name, owner_name, google_calendar_connected')
    .eq('auth_user_id', user.id)
    .maybeSingle<{ id: string; business_name: string; owner_name: string | null; google_calendar_connected: boolean | null }>()

  if (!customer) redirect('/auth/error')

  const now = new Date()
  const { start: weekStart } = isoWeekRange(now)
  const lastWeekStart = new Date(weekStart); lastWeekStart.setDate(weekStart.getDate() - 7)
  const lastWeekEnd = new Date(weekStart); lastWeekEnd.setMilliseconds(-1)
  const weekRange = formatWeekRange(weekStart, new Date(weekStart.getTime() + 6 * 86400000), now)

  const calendarConnected = customer.google_calendar_connected ?? false

  const [
    { data: thisWeekCalls },
    { data: lastWeekCalls },
    { data: pendingActions },
    { data: recentCalls },
    { data: upcomingAppointments },
  ] = await Promise.all([
    admin.from('calls').select('id, outcome').eq('customer_id', customer.id).gte('started_at', weekStart.toISOString()),
    admin.from('calls').select('id').eq('customer_id', customer.id).gte('started_at', lastWeekStart.toISOString()).lte('started_at', lastWeekEnd.toISOString()),
    admin.from('actions').select('id, call_id, type, payload, created_at').eq('customer_id', customer.id).eq('status', 'pending').order('created_at', { ascending: false }).limit(4),
    admin.from('calls').select('id, caller_phone, started_at, duration_s, outcome').eq('customer_id', customer.id).order('started_at', { ascending: false }).limit(5),
    calendarConnected
      ? admin.from('appointments').select('id, caller_name, caller_phone, service, booked_for, status').eq('customer_id', customer.id).eq('status', 'confirmed').gte('booked_for', now.toISOString()).order('booked_for', { ascending: true }).limit(5)
      : Promise.resolve({ data: null }),
  ])

  const totalThisWeek = thisWeekCalls?.length ?? 0
  const totalLastWeek = lastWeekCalls?.length ?? 0
  const callsDelta = totalThisWeek - totalLastWeek

  const nonTransfer = thisWeekCalls?.filter(c => c.outcome !== 'transfer').length ?? 0
  const tomPct = totalThisWeek > 0 ? Math.round((nonTransfer / totalThisWeek) * 100) : 0

  const pendingCount = pendingActions?.length ?? 0

  // For recent calls: collect call IDs with pending callback actions
  const recentCallIds = recentCalls?.map(c => c.id) ?? []
  const { data: callbackActions } = recentCallIds.length > 0
    ? await admin.from('actions').select('call_id').in('call_id', recentCallIds).eq('type', 'callback').eq('status', 'pending')
    : { data: [] }
  const callbackSet = new Set((callbackActions ?? []).map(a => a.call_id))

  const firstName = customer.owner_name?.split(' ')[0] ?? 'there'

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[15px] text-slate-500">{greeting()}, {firstName}</p>
        <h1 className="text-[28px] font-bold tracking-[-0.025em] text-slate-900 mt-0.5">
          This week at {customer.business_name}
        </h1>
        <p className="text-[13px] text-slate-400 mt-1 capitalize">{weekRange}</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard
          label="Calls answered"
          value={totalThisWeek}
          delta={{
            value: callsDelta,
            label: callsDelta >= 0 ? 'more than last week' : 'fewer than last week',
          }}
        />
        <KpiCard
          label="Calls you didn't have to take"
          value={nonTransfer}
          subline={`Your agent handled ${tomPct}% of your calls.`}
          accent="cyan"
        />
        <KpiCard
          label="Outstanding"
          value={pendingCount}
          subline="Callbacks and orders waiting on you"
          accent={pendingCount > 0 ? 'amber' : undefined}
        />
      </div>

      {/* Upcoming appointments (only shown when Google Calendar is connected) */}
      {calendarConnected && (
        <div className="mb-4">
          <Card>
            <CardHeader
              title="Upcoming appointments"
              action={
                <Link href="/dashboard/calendar" className="text-[12px] text-[#1E3A5F] hover:text-[#162D47] transition-colors">
                  View all
                </Link>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['When', 'Name', 'Phone', 'Service'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments && upcomingAppointments.length > 0 ? upcomingAppointments.map(appt => (
                    <tr key={appt.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5 whitespace-nowrap text-slate-600">
                        {appt.booked_for ? new Date(appt.booked_for).toLocaleString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Australia/Sydney' }) : '-'}
                      </td>
                      <td className="px-6 py-3.5 text-slate-700">{appt.caller_name ?? '-'}</td>
                      <td className="px-6 py-3.5 text-slate-500">{appt.caller_phone ? formatAuPhone(appt.caller_phone) : '-'}</td>
                      <td className="px-6 py-3.5 text-slate-500">{appt.service ?? '-'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-[13px] text-slate-400">
                        No upcoming appointments.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Bottom row: outstanding + recent calls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Outstanding actions */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader
              title="Outstanding"
              meta={pendingCount > 0 ? `${pendingCount} waiting on you` : 'All clear'}
              action={
                <Link href="/dashboard/activity" className="text-[12px] text-[#1E3A5F] hover:text-[#162D47] transition-colors">
                  See all
                </Link>
              }
            />
            <CardBody className="py-2">
              {pendingActions && pendingActions.length > 0 ? (
                pendingActions.map(a => (
                  <OutstandingRow
                    key={a.id}
                    id={a.id}
                    call_id={a.call_id}
                    type={a.type}
                    payload={a.payload}
                    created_at={a.created_at}
                  />
                ))
              ) : (
                <p className="text-[13px] text-slate-400 py-4 text-center">Nothing outstanding right now.</p>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Recent calls */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader
              title="Recent calls"
              action={
                <Link href="/dashboard/activity" className="text-[12px] text-[#1E3A5F] hover:text-[#162D47] transition-colors">
                  View all
                </Link>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Time', 'Caller', 'Duration', 'Outcome'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentCalls && recentCalls.length > 0 ? recentCalls.map(call => {
                    const variant = badgeVariant(call.outcome, callbackSet.has(call.id))
                    const callerDisplay = formatAuPhone(call.caller_phone)
                    const initials = initialsFrom(null, callerDisplay)
                    return (
                      <tr key={call.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3.5 whitespace-nowrap text-slate-600">{formatCallTime(call.started_at)}</td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar initials={initials} size={28} />
                            <span className="text-slate-700">{callerDisplay}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 tabular-nums text-slate-500">{formatDuration(call.duration_s)}</td>
                        <td className="px-6 py-3.5">
                          <Badge variant={variant} />
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-[13px] text-slate-400">
                        No calls yet this week.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
