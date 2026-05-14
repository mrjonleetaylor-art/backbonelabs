import { formatCallTime, formatDuration } from '@/lib/formatTime'

export default function ExpandedVoicemailRow({
  phone,
  at,
  duration,
  recordingSid,
}: {
  phone: string | null
  at: string
  duration: number | null
  recordingSid: string | null
}) {
  return (
    <div className="px-6 py-5 bg-slate-50/60 border-t border-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Audio player */}
        <div className="lg:col-span-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-3">
            Voicemail recording
          </h3>
          {recordingSid ? (
            <audio
              controls
              className="w-full rounded-lg"
              src={`/api/recording/${recordingSid}`}
              preload="none"
            />
          ) : (
            <p className="text-[13px] text-slate-400">No recording available.</p>
          )}
        </div>

        {/* Details */}
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-3">Details</h3>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-0.5">Caller</p>
              <p className="text-[13px] text-slate-800">{phone ?? 'Unknown'}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-0.5">Received</p>
              <p className="text-[13px] text-slate-800">{formatCallTime(at)}</p>
            </div>
            {duration != null && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-0.5">Duration</p>
                <p className="text-[13px] text-slate-800">{formatDuration(duration)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
