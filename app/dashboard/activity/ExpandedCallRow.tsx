import EmailSummaryButton from './EmailSummaryButton'
import type { CallDetail } from './actions'

export default function ExpandedCallRow({
  detail,
  callId,
  loading,
}: {
  detail: CallDetail | null
  callId: string
  loading: boolean
}) {
  if (loading || !detail) {
    return (
      <div className="px-6 py-8 text-center text-[13px] text-slate-400">
        Loading…
      </div>
    )
  }

  const { turns, rawTranscript, summaryFields } = detail

  return (
    <div className="px-6 py-5 bg-slate-50/60 border-t border-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Transcript */}
        <div className="lg:col-span-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-3">Transcript</h3>
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2">
            {turns ? (
              turns.map((t, i) => {
                const isAgent = t.role === 'agent'
                return (
                  <div key={i} className={`flex gap-2.5 ${isAgent ? '' : 'flex-row-reverse'}`}>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                      style={{ background: isAgent ? '#1E3A5F' : '#94A3B8' }}
                    >
                      {isAgent ? 'T' : 'C'}
                    </div>
                    <div className={`rounded-xl px-3.5 py-2 text-[12px] leading-relaxed max-w-[85%] ${isAgent ? 'bg-[#EEF2F8] text-slate-800' : 'bg-white text-slate-700 border border-slate-200'}`}>
                      <p
                        className="text-[9px] font-semibold mb-1 uppercase tracking-wide"
                        style={{ color: isAgent ? '#1E3A5F' : '#64748B' }}
                      >
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

        {/* Summary + actions */}
        <div className="space-y-4">
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-3">Summary</h3>
            <div className="space-y-2.5">
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
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-200">
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
            <EmailSummaryButton callId={callId} />
          </div>
        </div>
      </div>
    </div>
  )
}
