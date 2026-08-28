import { todayStr, addDays } from './dateUtils'
import { getDailyCount } from './taskProgress'

/**
 * Current daily streak: consecutive calendar days (ending today or yesterday)
 * on which every active daily task hit its target. Weekly tasks don't affect this.
 */
export function getCurrentStreak(tasks, completions, referenceDate = todayStr()) {
  const dailyTasks = tasks.filter((t) => t.active && t.frequency_type === 'daily')
  if (dailyTasks.length === 0) return 0

  const dayFullyDone = (date) =>
    dailyTasks.every((t) => getDailyCount(t.id, completions, date) >= t.target_frequency)

  let streak = 0
  let cursor = referenceDate
  // Today doesn't have to be complete yet to keep a streak alive; only count it if it's done.
  if (dayFullyDone(cursor)) streak += 1
  cursor = addDays(cursor, -1)

  while (dayFullyDone(cursor)) {
    streak += 1
    cursor = addDays(cursor, -1)
  }

  return streak
}
