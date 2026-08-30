import { todayStr, addDays } from './dateUtils'
import { getTaskStatus } from './taskProgress'

/**
 * Daily accomplishment for one date: fraction of recurring daily/weekly tasks that
 * existed by that date and were done as of that date. One-time (due-date) and monthly
 * tasks are excluded — neither is naturally day-scoped, and would otherwise show as
 * "not done" on every day before they're actually due/complete-able.
 *
 * Uses `created_date`, not `active` — a later soft-deleted task shouldn't disappear
 * from the days when it was genuinely being tracked.
 */
export function getDailyAccomplishment(tasks, completions, date) {
  const eligible = tasks.filter(
    (t) => (t.frequency_type === 'daily' || t.frequency_type === 'weekly') && t.created_date <= date,
  )
  if (eligible.length === 0) return null
  const done = eligible.filter((t) => getTaskStatus(t, completions, date).done).length
  return { date, done, total: eligible.length, pct: done / eligible.length }
}

/** Array of daily-accomplishment entries for the last `days` days, oldest first. */
export function getTrendData(tasks, completions, days, { referenceDate = todayStr(), framework } = {}) {
  const scopedTasks = framework ? tasks.filter((t) => t.framework === framework) : tasks
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(referenceDate, -i)
    result.push(getDailyAccomplishment(scopedTasks, completions, date) ?? { date, done: 0, total: 0, pct: null })
  }
  return result
}
