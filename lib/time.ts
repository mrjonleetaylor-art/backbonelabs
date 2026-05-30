// Timezone helpers for RelayDesk. All business logic runs in a single
// timezone: Sydney. Using date-fns-tz keyed to the IANA zone keeps every
// conversion DST-correct across the AEST (+10:00) / AEDT (+11:00) switch,
// so nothing drifts by an hour when daylight saving starts in October.
//
// SEAM: if multi-tenant timezones are ever needed, this module is where to
// add it. Thread a per-customer IANA zone through these helpers instead of
// the hardcoded TZ constant. Do not build multi-timezone support now.
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz'

export const TZ = 'Australia/Sydney'

// Convert a Sydney wall-clock date + time to a UTC instant (DST-correct).
// e.g. sydneyToUtc('2026-10-15', '09:00:00')
export function sydneyToUtc(dateStr: string, timeStr: string): Date {
  return fromZonedTime(`${dateStr}T${timeStr}`, TZ)
}

// Same as sydneyToUtc but returns a UTC ISO string.
export function sydneyToUtcISO(dateStr: string, timeStr: string): string {
  return sydneyToUtc(dateStr, timeStr).toISOString()
}

// Format a UTC instant (epoch ms, ISO string, or Date) as a Sydney-local
// ISO string with the correct offset, e.g. "2026-10-15T09:00:00+11:00".
export function toSydneyISO(when: number | string | Date): string {
  return formatInTimeZone(when, TZ, "yyyy-MM-dd'T'HH:mm:ssXXX")
}

// Format a UTC instant as a Sydney-local slot label, e.g. "9:00 AM".
export function formatSydneySlotLabel(when: number | string | Date): string {
  return formatInTimeZone(when, TZ, 'h:mm a')
}
