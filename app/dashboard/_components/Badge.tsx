export type Variant = 'order' | 'callback' | 'question' | 'transfer' | 'voicemail' | 'complaint' | 'other'

const CONFIG: Record<Variant, { label: string; bg: string; color: string }> = {
  order:     { label: 'Order taken',         bg: '#DCFCE7', color: '#15803D' },
  callback:  { label: 'Callback scheduled',  bg: '#EEF2FF', color: '#4F46E5' },
  question:  { label: 'Question answered',   bg: '#F0F9FF', color: '#0369A1' },
  transfer:  { label: 'Transferred to you',  bg: '#FEF3C7', color: '#B45309' },
  voicemail: { label: 'Voicemail taken',     bg: '#F1F5F9', color: '#475569' },
  complaint: { label: 'Complaint',           bg: '#FEE2E2', color: '#B91C1C' },
  other:     { label: 'Other',               bg: '#F1F5F9', color: '#475569' },
}

export default function Badge({ variant }: { variant: Variant }) {
  const { label, bg, color } = CONFIG[variant]
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold rounded-full px-2.5 py-1 whitespace-nowrap"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  )
}

export function badgeVariant(
  outcome: string | null,
  hasCallbackAction: boolean,
  isVoicemail = false
): Variant {
  if (isVoicemail) return 'voicemail'
  switch (outcome) {
    case 'order':     return 'order'
    case 'transfer':  return 'transfer'
    case 'complaint': return 'complaint'
    case 'info':      return hasCallbackAction ? 'callback' : 'question'
    default:          return 'other'
  }
}
