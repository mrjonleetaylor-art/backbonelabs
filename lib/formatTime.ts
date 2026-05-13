// Format a UTC timestamp as "2:47 pm / Today", "9:21 am / Yesterday", "5:32 pm / Mon 11 May"
export function formatCallTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()

  const aest = (date: Date) =>
    new Date(date.toLocaleString('en-AU', { timeZone: 'Australia/Sydney' }))

  const local = aest(d)
  const today = aest(now)

  const timePart = local.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Australia/Sydney',
  }).toLowerCase()

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let dayPart: string
  if (sameDay(local, today)) {
    dayPart = 'Today'
  } else if (sameDay(local, yesterday)) {
    dayPart = 'Yesterday'
  } else {
    dayPart = local.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'Australia/Sydney',
    })
  }

  return `${timePart} / ${dayPart}`
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function isoWeekRange(now: Date): { start: Date; end: Date } {
  const d = new Date(now)
  const day = d.getDay()
  // ISO week starts Monday (day 1), JS getDay() is 0=Sun
  const diff = (day === 0 ? -6 : 1 - day)
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { start: monday, end: sunday }
}

export function formatWeekRange(start: Date, end: Date, today: Date): string {
  const opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }
  const startStr = start.toLocaleDateString('en-AU', opts)
  const sameWeek = today <= end && today >= start
  const endLabel = sameWeek
    ? `today, ${today.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`
    : end.toLocaleDateString('en-AU', { ...opts, year: 'numeric' })
  return `${startStr} – ${endLabel}`
}
