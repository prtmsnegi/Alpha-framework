import { todayStr } from './dateUtils'
import { getWeekRange } from './weekUtils'
import { getMonthRange } from './monthUtils'

/** Number of completions logged for a daily task on the given date. */
export function getDailyCount(taskId, completions, date = todayStr()) {
  return completions.filter((c) => c.task_id === taskId && c.date === date).length
}

/** Number of completions logged for a weekly task in the week containing the given date. */
export function getWeeklyCount(taskId, completions, date = todayStr()) {
  const { start, end } = getWeekRange(date)
  return completions.filter((c) => c.task_id === taskId && c.date >= start && c.date <= end).length
}

/** Number of completions logged for a monthly task in the calendar month containing the given date. */
export function getMonthlyCount(taskId, completions, date = todayStr()) {
  const { start, end } = getMonthRange(date)
  return completions.filter((c) => c.task_id === taskId && c.date >= start && c.date <= end).length
}

/** Total completions ever logged for a task — used by one-time (due-date) tasks, which have no recurring window. */
export function getAllTimeCount(taskId, completions) {
  return completions.filter((c) => c.task_id === taskId).length
}

/** Current progress count for a task, resolved by its frequency type. */
export function getTaskCount(task, completions, date = todayStr()) {
  if (task.frequency_type === 'weekly') return getWeeklyCount(task.id, completions, date)
  if (task.frequency_type === 'monthly') return getMonthlyCount(task.id, completions, date)
  if (task.frequency_type === 'once') return getAllTimeCount(task.id, completions)
  return getDailyCount(task.id, completions, date)
}

/**
 * { count, target, done } for a task on the given reference date. `count`/`target`
 * always reflect the task's natural window (today for daily, this week for weekly, this
 * month for monthly, ever for once) — but `done` means "is there nothing left to do
 * *today*" for daily/weekly, so a weekly task's card can correctly flip to done the
 * moment today's occurrence is logged, without waiting for the whole week's target.
 */
export function getTaskStatus(task, completions, date = todayStr()) {
  const count = getTaskCount(task, completions, date)
  const target = task.target_frequency
  if (task.frequency_type === 'weekly') {
    return { count, target, done: getDailyCount(task.id, completions, date) >= 1 }
  }
  return { count, target, done: count >= target }
}

/** True when a one-time task's due date has passed and it still isn't done. */
export function isOverdue(task, completions, date = todayStr()) {
  if (task.frequency_type !== 'once' || !task.due_date) return false
  return date > task.due_date && !getTaskStatus(task, completions, date).done
}

/**
 * True for a weekly task when the remaining days left in the week (including today) no
 * longer exceed the remaining completions needed — every day left is now mandatory to
 * still hit the target, so "I'll just do it tomorrow" stops being a safe assumption.
 */
export function isWeeklyUrgent(task, completions, date = todayStr()) {
  if (task.frequency_type !== 'weekly') return false
  const { end } = getWeekRange(date)
  const remainingDays = Math.round((new Date(`${end}T00:00:00`) - new Date(`${date}T00:00:00`)) / 86400000) + 1
  const remainingTarget = task.target_frequency - getWeeklyCount(task.id, completions, date)
  return remainingTarget > 0 && remainingTarget >= remainingDays
}

/** True when a task should count toward today's dashboard progress/pending lists. */
function isActiveForDate(task, date) {
  if (!task.active) return false
  if (task.frequency_type === 'once') return Boolean(task.due_date) && task.due_date <= date
  return true
}

/** { done, total } active tasks for a framework, resolved as of the given date. */
export function getFrameworkProgress(tasks, completions, framework, date = todayStr()) {
  const frameworkTasks = tasks.filter((t) => t.framework === framework && isActiveForDate(t, date))
  const done = frameworkTasks.filter((t) => getTaskStatus(t, completions, date).done).length
  return { done, total: frameworkTasks.length }
}

/** { done, total } across all active tasks, resolved as of the given date. */
export function getOverallProgress(tasks, completions, date = todayStr()) {
  const activeTasks = tasks.filter((t) => isActiveForDate(t, date))
  const done = activeTasks.filter((t) => getTaskStatus(t, completions, date).done).length
  return { done, total: activeTasks.length }
}

/** Split active tasks into pending vs. completed as of the given date. */
export function splitTasksByStatus(tasks, completions, date = todayStr()) {
  const activeTasks = tasks.filter((t) => isActiveForDate(t, date))
  const pending = []
  const completed = []
  for (const task of activeTasks) {
    const status = getTaskStatus(task, completions, date)
    ;(status.done ? completed : pending).push({ task, status })
  }
  return { pending, completed }
}

/** Sum of counts/targets across all active weekly tasks — a simple weekly-progress figure. */
export function getWeeklyProgress(tasks, completions, date = todayStr()) {
  const weeklyTasks = tasks.filter((t) => t.active && t.frequency_type === 'weekly')
  const totals = weeklyTasks.reduce(
    (acc, t) => {
      const status = getTaskStatus(t, completions, date)
      acc.count += Math.min(status.count, status.target)
      acc.target += status.target
      return acc
    },
    { count: 0, target: 0 },
  )
  return totals
}

/** Sum of counts/targets across all active monthly tasks — mirrors getWeeklyProgress. */
export function getMonthlyProgress(tasks, completions, date = todayStr()) {
  const monthlyTasks = tasks.filter((t) => t.active && t.frequency_type === 'monthly')
  const totals = monthlyTasks.reduce(
    (acc, t) => {
      const status = getTaskStatus(t, completions, date)
      acc.count += Math.min(status.count, status.target)
      acc.target += status.target
      return acc
    },
    { count: 0, target: 0 },
  )
  return totals
}
