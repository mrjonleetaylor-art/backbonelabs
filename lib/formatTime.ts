// Format a UTC timestamp as "2:47 pm / Today", "9:21 am / Yesterday", "5:32 pm / Mon 11 May"
export function formatCallTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'

  const now = new Date()
  const tz = 'Australia/Sydney'

  const timePart = d.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: tz,
  }).toLowerCase()

  // Compare calendar dates in AEST by extracting year/month/day via Intl
  const dateParts = (date: Date) => {
    const parts = new Intl.DateTimeFormat('en-AU', {
      year: 'numeric', month: '2-digit', day: '2-digit', timeZone: tz,
    }).formatToParts(date)
    return {
      y: parts.find(p => p.type === 'year')!.value,
      m: parts.find(p => p.type === 'month')!.value,
      d: parts.find(p => p.type === 'day')!.value,
    }
  }

  const dp = dateParts(d)
  const tp = dateParts(now)
  const yp = dateParts(new Date(now.getTime() - 86400000))

  let dayPart: string
  if (dp.y === tp.y && dp.m === tp.m && dp.d === tp.d) {
    dayPart = 'Today'
  } else if (dp.y === yp.y && dp.m === yp.m && dp.d === yp.d) {
    dayPart = 'Yesterday'
  } else {
    dayPart = d.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: tz,
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
