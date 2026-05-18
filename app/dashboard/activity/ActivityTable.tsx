'use client'
import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'
import Avatar, { initialsFrom } from '../_components/Avatar'
import Badge from '../_components/Badge'
import { formatCallTime, formatDuration, formatAuPhone } from '@/lib/formatTime'
import { getCallDetail } from './actions'
import ExpandedCallRow from './ExpandedCallRow'
import ExpandedVoicemailRow from './ExpandedVoicemailRow'
import type { CallDetail } from './actions'
import type { Variant } from '../_components/Badge'

export type TableRow = {
  kind: 'call' | 'voicemail'
  id: string
  phone: string | null
  at: string
  duration: number | null
  variant: Variant
  recordingSid?: string | null
}

type Props = {
  rows: TableRow[]
  initialExpandedId: string | null
  hasMore: boolean
  page: number
  outcomeFilter: string
  since: string
  search: string
}

export default function ActivityTable({
  rows,
  initialExpandedId,
  hasMore,
  page,
  outcomeFilter,
  since,
  search,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(initialExpandedId)
  const [detailMap, setDetailMap] = useState<Record<string, CallDetail>>({})
  // Only show loading spinner for initial call rows — voicemails need no fetch
  const initialIsCall = initialExpandedId
    ? rows.find(r => r.id === initialExpandedId)?.kind !== 'voicemail'
    : false
  const [loadingId, setLoadingId] = useState<string | null>(initialIsCall ? initialExpandedId : null)

  useEffect(() => {
    if (!initialExpandedId) return
    const initialRow = rows.find(r => r.id === initialExpandedId)
    if (initialRow?.kind === 'voicemail') return
    getCallDetail(initialExpandedId).then(result => {
      setLoadingId(null)
      if ('error' in result) return
      setDetailMap(prev => ({ ...prev, [initialExpandedId]: result }))
      window.history.replaceState({}, '', `/dashboard/activity/${initialExpandedId}`)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function toggle(id: string, kind: 'call' | 'voicemail') {
    if (expandedId === id) {
      setExpandedId(null)
      if (kind === 'call') window.history.pushState({}, '', '/dashboard/activity')
      return
    }
    if (kind === 'call' && !detailMap[id]) {
      setLoadingId(id)
      const result = await getCallDetail(id)
      setLoadingId(null)
      if (!('error' in result)) {
        setDetailMap(prev => ({ ...prev, [id]: result }))
      }
    }
    setExpandedId(id)
    if (kind === 'call') window.history.pushState({}, '', `/dashboard/activity/${id}`)
  }

  return (
    <div className="mt-5 bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-slate-100">
              {['Time', 'Caller', 'Duration', 'Type', ''].map((h, i) => (
                <th key={i} className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows.map(row => {
              const caller = formatAuPhone(row.phone)
              const initials = initialsFrom(null, caller)
              const isExpanded = expandedId === row.id
              const isLoading = loadingId === row.id

              return (
                <Fragment key={`${row.kind}-${row.id}`}>
                  <tr className={`border-b border-slate-50 transition-colors ${isExpanded ? 'bg-slate-50/60' : 'hover:bg-slate-50/60'}`}>
                    <td className="px-6 py-3.5 whitespace-nowrap text-slate-600">{formatCallTime(row.at)}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={initials} size={28} />
                        <span className="text-slate-700">{caller}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 tabular-nums text-slate-500">{formatDuration(row.duration)}</td>
                    <td className="px-6 py-3.5"><Badge variant={row.variant} /></td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => toggle(row.id, row.kind)}
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-500 hover:text-indigo-500 transition-colors"
                        aria-expanded={isExpanded}
                      >
                        {isLoading ? (
                          <span className="text-slate-400">Loading…</span>
                        ) : (
                          <>
                            {isExpanded ? 'Close' : 'View'}
                            <svg
                              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b border-slate-100">
                      <td colSpan={5} className="p-0">
                        {row.kind === 'voicemail' ? (
                          <ExpandedVoicemailRow
                            phone={row.phone}
                            at={row.at}
                            duration={row.duration}
                            recordingSid={row.recordingSid ?? null}
                          />
                        ) : (
                          <ExpandedCallRow
                            detail={detailMap[row.id] ?? null}
                            callId={row.id}
                            loading={isLoading}
                          />
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            }) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[13px] text-slate-400">
                  No calls match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="px-6 py-4 border-t border-slate-100 flex justify-center">
          <Link
            href={`/dashboard/activity?outcome=${outcomeFilter}&since=${since}&search=${search}&page=${page + 1}`}
            className="text-[13px] font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            Load more
          </Link>
        </div>
      )}
    </div>
  )
}
