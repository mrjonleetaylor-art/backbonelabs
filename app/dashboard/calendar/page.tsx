import { redirect } from 'next/navigation'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader } from '../_components/Card'
import { formatAuPhone } from '@/lib/formatTime'

type Appointment = {
  id: string
  caller_name: string | null
  caller_phone: string | null
  service: string | null
  booked_for: string | null
  end_time: string | null
  notes: string | null
  status: string
  created_at: string
}

function formatDatetime(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Australia/Sydney',
  })
}

function AppointmentTable({ rows, empty }: { rows: Appointment[] | null; empty: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-slate-100">
            {['When', 'Name', 'Phone', 'Service', 'Notes', 'Status'].map(h => (
              <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows && rows.length > 0 ? rows.map(appt => (
            <tr key={appt.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
              <td className="px-6 py-3.5 whitespace-nowrap text-slate-600">{formatDatetime(appt.booked_for)}</td>
              <td className="px-6 py-3.5 text-slate-700">{appt.caller_name ?? '-'}</td>
              <td className="px-6 py-3.5 text-slate-500">{appt.caller_phone ? formatAuPhone(appt.caller_phone) : '-'}</td>
              <td className="px-6 py-3.5 text-slate-500">{appt.service ?? '-'}</td>
              <td className="px-6 py-3.5 text-slate-400 max-w-[200px] truncate">{appt.notes ?? '-'}</td>
              <td className="px-6 py-3.5">
                <span className={`inline-block text-[11px] font-medium rounded-full px-2 py-0.5 ${
                  appt.status === 'confirmed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {appt.status}
                </span>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-[13px] text-slate-400">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createServiceClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: customer } = await admin
    .from('customers')
    .select('id, google_calendar_connected')
    .eq('auth_user_id', user.id)
    .maybeSingle<{ id: string; google_calendar_connected: boolean | null }>()

  if (!customer) redirect('/auth/error')

  if (!customer.google_calendar_connected) {
    return (
      <div className="p-8 max-w-[900px] mx-auto">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold tracking-[-0.025em] text-slate-900">Calendar</h1>
          <p className="text-[13px] text-slate-400 mt-1">Appointments booked by your agent.</p>
        </div>
        <Card>
          <div className="px-6 py-12 text-center">
            <p className="text-[15px] font-medium text-slate-700 mb-1">Google Calendar not connected</p>
            <p className="text-[13px] text-slate-400 mb-5">Connect your calendar so your agent can book appointments directly.</p>
            <a
              href="/api/calendar/connect"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white bg-[#1E3A5F] hover:bg-[#1E3A5F] transition-colors rounded-lg px-4 py-2.5 leading-none"
            >
              Connect your Google Calendar
            </a>
          </div>
        </Card>
      </div>
    )
  }

  const now = new Date()

  const [
    { data: upcoming },
    { data: past },
  ] = await Promise.all([
    admin
      .from('appointments')
      .select('id, caller_name, caller_phone, service, booked_for, end_time, notes, status, created_at')
      .eq('customer_id', customer.id)
      .gte('booked_for', now.toISOString())
      .order('booked_for', { ascending: true })
      .limit(50),
    admin
      .from('appointments')
      .select('id, caller_name, caller_phone, service, booked_for, end_time, notes, status, created_at')
      .eq('customer_id', customer.id)
      .lt('booked_for', now.toISOString())
      .order('booked_for', { ascending: false })
      .limit(20),
  ])

  return (
    <div className="p-8 max-w-[1100px] mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-[28px] font-bold tracking-[-0.025em] text-slate-900">Calendar</h1>
        <p className="text-[13px] text-slate-400 mt-1">Appointments booked by your agent.</p>
      </div>

      <Card>
        <CardHeader
          title="Upcoming"
          meta={upcoming && upcoming.length > 0 ? `${upcoming.length} appointment${upcoming.length === 1 ? '' : 's'}` : 'Nothing scheduled'}
        />
        <AppointmentTable rows={upcoming} empty="No upcoming appointments." />
      </Card>

      <Card>
        <CardHeader title="Past appointments" />
        <AppointmentTable rows={past} empty="No past appointments." />
      </Card>
    </div>
  )
}
