import { toDateStr } from './dateUtils'

/** Calendar-month range containing the given date. */
export function getMonthRange(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  const start = toDateStr(new Date(d.getFullYear(), d.getMonth(), 1))
  const end = toDateStr(new Date(d.getFullYear(), d.getMonth() + 1, 0))
  return { start, end }
}
