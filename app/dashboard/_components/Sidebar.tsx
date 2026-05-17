'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

type Customer = {
  id: string
  business_name: string
  owner_name: string | null
  owner_email: string
  owner_phone: string | null
  industry: string | null
}

type Props = {
  customer: Customer
  pendingCount: number
}

function NavItem({
  href,
  label,
  icon,
  badge,
  soon,
  active,
}: {
  href?: string
  label: string
  icon: React.ReactNode
  badge?: number
  soon?: boolean
  active?: boolean
}) {
  const base =
    'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors w-full text-left'

  if (soon) {
    return (
      <div className={`${base} text-slate-400 cursor-default`}>
        {icon}
        <span className="flex-1">{label}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-400 rounded px-1.5 py-0.5">
          Soon
        </span>
      </div>
    )
  }

  return (
    <Link
      href={href!}
      className={`${base} ${active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="text-[11px] font-bold bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none">
          {badge}
        </span>
      )}
    </Link>
  )
}

export default function Sidebar({ customer, pendingCount }: Props) {
  const pathname = usePathname()
  const [comingSoonOpen, setComingSoonOpen] = useState(false)

  const initials = (customer.owner_name ?? customer.owner_email)
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <aside
      className="w-[240px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-white h-full"
    >
      {/* Header */}
      <div className="px-5 pt-6 pb-4 border-b border-slate-100">
        <div className="text-[18px] font-bold tracking-[-0.02em] text-slate-900 mb-0.5">
          <span className="text-cyan-500">Relay</span><span className="text-slate-900">Desk</span>
        </div>
        <div className="text-[12px] text-slate-500 font-medium mt-2">{customer.business_name}</div>
        {customer.industry && (
          <span className="inline-block mt-1 text-[11px] bg-cyan-50 text-cyan-700 font-medium rounded px-1.5 py-0.5">
            {customer.industry}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Workspace</p>
        <NavItem
          href="/dashboard"
          label="Dashboard"
          active={pathname === '/dashboard'}
          icon={<GridIcon />}
        />
        <NavItem
          href="/dashboard/activity"
          label="Activity"
          active={pathname.startsWith('/dashboard/activity')}
          badge={pendingCount}
          icon={<ActivityIcon />}
        />
        <NavItem
          href="/dashboard/calendar"
          label="Calendar"
          active={pathname.startsWith('/dashboard/calendar')}
          icon={<CalendarIcon />}
        />

        <p className="px-3 mt-5 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Configure</p>
        <NavItem
          href="/dashboard/account"
          label="Account"
          active={pathname === '/dashboard/account'}
          icon={<AccountIcon />}
        />

        <button
          onClick={() => setComingSoonOpen(o => !o)}
          className="flex items-center gap-1 px-3 mt-5 mb-1 w-full text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-500 transition-colors"
        >
          <span className="flex-1">Coming soon</span>
          <svg
            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-200 ${comingSoonOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {comingSoonOpen && (
          <>
            <div className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-400 cursor-default">
              <LinkIcon />
              <span>Payment links</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-400 cursor-default">
              <AgentIcon />
              <span>Agent settings</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-400 cursor-default">
              <PlanIcon />
              <span>Plan</span>
            </div>
          </>
        )}

      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
          Need a hand? Reply to your welcome email or ring us on{' '}
          <a href="tel:+61253023030" className="text-indigo-500 hover:underline">02 5302 3030</a>.
        </p>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{ background: '#6366F1' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-slate-700 truncate">{customer.owner_name ?? 'Owner'}</p>
            <p className="text-[11px] text-slate-400 truncate">{customer.owner_email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function GridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}
function ActivityIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function LinkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  )
}
function AgentIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
    </svg>
  )
}
function PlanIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  )
}
function AccountIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  )
}
