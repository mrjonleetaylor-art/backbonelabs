'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function CalendarConnect({ connected }: { connected: boolean }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const queryConnected = searchParams.get('connected') === 'true'
  const queryError = !!searchParams.get('calendar_error')

  // Initialize from URL so no setState needed inside the effect
  const [isConnected, setIsConnected] = useState(() => connected || queryConnected)
  const [success, setSuccess] = useState(() => queryConnected)
  const [error, setError] = useState<string | null>(() =>
    queryError ? 'Could not connect Google Calendar. Please try again.' : null
  )
  const [disconnecting, setDisconnecting] = useState(false)

  // Clean up query string — pure side effect, no state mutation
  useEffect(() => {
    if (queryConnected || queryError) {
      router.replace('/dashboard/account', { scroll: false })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDisconnect() {
    setDisconnecting(true)
    try {
      const res = await fetch('/api/calendar/disconnect', { method: 'POST' })
      if (res.ok) {
        setIsConnected(false)
        setSuccess(false)
      } else {
        setError('Disconnect failed. Please try again.')
      }
    } catch {
      setError('Disconnect failed. Please try again.')
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className="space-y-4">
      {success && (
        <div className="flex items-center gap-2 text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Google Calendar connected successfully.
        </div>
      )}

      {error && (
        <div className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          {error}
        </div>
      )}

      {isConnected ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-[13px] text-slate-700">Google Calendar is connected.</span>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="text-[13px] text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
            <span className="text-[13px] text-slate-500">Not connected.</span>
          </div>
          <a
            href="/api/calendar/connect"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors rounded-lg px-3.5 py-2 leading-none"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Connect Google Calendar
          </a>
        </div>
      )}

      <p className="text-[12px] text-slate-400 leading-relaxed">
        Connect your Google Calendar so your agent can check availability and book appointments directly during calls.
      </p>
    </div>
  )
}
