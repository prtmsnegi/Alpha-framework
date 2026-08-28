import { toDateStr, addDays } from './dateUtils'

// ISO-8601 week: Monday is the first day of the week.
export function getWeekStart(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  const day = d.getDay() // 0 = Sunday .. 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diffToMonday)
  return toDateStr(d)
}

export function getWeekRange(dateStr) {
  const start = getWeekStart(dateStr)
  return { start, end: addDays(start, 6) }
}
