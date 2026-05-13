type Delta = {
  value: number
  label: string // e.g. "more than last week" | "fewer than last week"
}

type Props = {
  label: string
  value: string | number
  subline?: string
  delta?: Delta
  accent?: 'cyan' | 'amber' | 'violet'
}

export default function KpiCard({ label, value, subline, delta, accent }: Props) {
  const accentClass =
    accent === 'cyan' ? 'border-t-2 border-cyan-400' :
    accent === 'amber' ? 'border-t-2 border-amber-400' :
    accent === 'violet' ? 'border-t-2 border-indigo-400' : ''

  const valueColor =
    accent === 'cyan' ? '#06B6D4' :
    accent === 'amber' ? '#F59E0B' : '#0F172A'

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-6 ${accentClass}`}
      style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}
    >
      <p className="text-[12px] font-medium text-slate-500 uppercase tracking-[0.06em] mb-2">{label}</p>
      <p className="text-[36px] font-bold tracking-[-0.03em] leading-none tabular-nums" style={{ color: valueColor }}>
        {value}
      </p>
      {subline && (
        <p className="text-[13px] text-slate-500 mt-2 leading-snug">{subline}</p>
      )}
      {delta != null && (
        <p className="text-[12px] mt-2" style={{ color: delta.value >= 0 ? '#059669' : '#DC2626' }}>
          {delta.value >= 0 ? '+' : ''}{delta.value} {delta.label}
        </p>
      )}
    </div>
  )
}
