import Link from 'next/link'

type ActionType = 'order' | 'callback' | 'info' | 'other' | 'quote' | 'complaint'

const DISK: Record<string, { bg: string; fg: string; label: string }> = {
  order:     { bg: '#DCFCE7', fg: '#15803D', label: 'Order' },
  callback:  { bg: '#EEF2FF', fg: '#4F46E5', label: 'Callback' },
  info:      { bg: '#F0F9FF', fg: '#0369A1', label: 'Info' },
  quote:     { bg: '#FEF3C7', fg: '#B45309', label: 'Quote' },
  complaint: { bg: '#FEE2E2', fg: '#B91C1C', label: 'Complaint' },
  other:     { bg: '#F1F5F9', fg: '#475569', label: 'Other' },
}

function derivedTitle(type: ActionType, payload: Record<string, unknown>): string {
  const p = payload
  if (type === 'order') {
    const recipient = p.recipient_name ? String(p.recipient_name) : null
    return recipient ? `Send payment link to ${recipient}` : 'Prepare order'
  }
  if (type === 'callback') {
    const name = p.caller_name ? String(p.caller_name) : 'caller'
    return `Call ${name} back`
  }
  if (type === 'info' || type === 'quote') {
    const name = p.caller_name ? String(p.caller_name) : null
    return name ? `Follow up with ${name}` : 'Caller needs follow-up'
  }
  if (type === 'complaint') {
    const name = p.caller_name ? String(p.caller_name) : 'caller'
    return `Resolve complaint from ${name}`
  }
  return 'Action needed'
}

function derivedMeta(type: ActionType, payload: Record<string, unknown>, age: string): string {
  const p = payload
  const parts: string[] = []
  if (type === 'order' && p.budget) parts.push(String(p.budget))
  if (type === 'callback' && p.callback_day) parts.push(String(p.callback_day))
  if (p.occasion) parts.push(String(p.occasion))
  parts.push(age)
  return parts.join(' · ')
}

function ageLabel(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

type Props = {
  id: string
  call_id: string | null
  type: ActionType
  payload: Record<string, unknown>
  created_at: string
}

export default function OutstandingRow({ id, call_id, type, payload, created_at }: Props) {
  const disk = DISK[type] ?? DISK.other
  const title = derivedTitle(type, payload)
  const meta = derivedMeta(type, payload, ageLabel(created_at))
  const href = call_id ? `/dashboard/activity/${call_id}` : '/dashboard/activity'

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0" key={id}>
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
        style={{ background: disk.bg, color: disk.fg }}
      >
        {disk.label.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-slate-800 truncate">{title}</p>
        <p className="text-[11px] text-slate-400 truncate">{meta}</p>
      </div>
      <Link
        href={href}
        className="text-[12px] font-medium text-indigo-500 hover:text-indigo-700 whitespace-nowrap transition-colors"
      >
        Open
      </Link>
    </div>
  )
}
