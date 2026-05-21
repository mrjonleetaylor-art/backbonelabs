'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'

type Props = {
  current: { outcome: string; search: string; since: string }
}

const OUTCOMES = [
  { value: 'all', label: 'All' },
  { value: 'order', label: 'Orders' },
  { value: 'callback', label: 'Callbacks' },
  { value: 'question', label: 'Questions' },
  { value: 'transfer', label: 'Transfers' },
  { value: 'voicemail', label: 'Voicemail' },
]

const DATE_OPTIONS = [
  { value: daysAgo(7), label: 'Last 7 days' },
  { value: daysAgo(14), label: 'Last 14 days' },
  { value: daysAgo(30), label: 'Last 30 days' },
]

function daysAgo(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10)
}

export default function ActivityFilters({ current }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState(current.search)

  function navigate(updates: Partial<typeof current>) {
    const params = new URLSearchParams({
      outcome: current.outcome,
      since: current.since,
      search: current.search,
      ...updates,
    })
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Segmented control */}
      <div className="flex bg-slate-100 rounded-lg p-1 gap-0.5">
        {OUTCOMES.map(o => (
          <button
            key={o.value}
            onClick={() => navigate({ outcome: o.value, page: '1' } as never)}
            className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors whitespace-nowrap ${
              current.outcome === o.value
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Date range */}
      <select
        value={current.since}
        onChange={e => navigate({ since: e.target.value, page: '1' } as never)}
        className="text-[12px] border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 cursor-pointer"
      >
        {DATE_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Search */}
      <input
        type="search"
        placeholder="Search by phone number…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && navigate({ search, page: '1' } as never)}
        onBlur={() => search !== current.search && navigate({ search, page: '1' } as never)}
        className="text-[12px] border border-slate-200 rounded-lg px-3 py-2 text-slate-600 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 w-48"
      />
    </div>
  )
}
