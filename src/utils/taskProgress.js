import { todayStr } from './dateUtils'
import { getWeekRange } from './weekUtils'

/** Number of completions logged for a daily task on the given date. */
export function getDailyCount(taskId, completions, date = todayStr()) {
  return completions.filter((c) => c.task_id === taskId && c.date === date).length
}

/** Number of completions logged for a weekly task in the week containing the given date. */
export function getWeeklyCount(taskId, completions, date = todayStr()) {
  const { start, end } = getWeekRange(date)
  return completions.filter((c) => c.task_id === taskId && c.date >= start && c.date <= end).length
}

/** Total completions ever logged for a task — used by one-time (due-date) tasks, which have no recurring window. */
export function getAllTimeCount(taskId, completions) {
  return completions.filter((c) => c.task_id === taskId).length
}

/** Current progress count for a task, resolved by its frequency type. */
export function getTaskCount(task, completions, date = todayStr()) {
  if (task.frequency_type === 'weekly') return getWeeklyCount(task.id, completions, date)
  if (task.frequency_type === 'once') return getAllTimeCount(task.id, completions)
  return getDailyCount(task.id, completions, date)
}

/** { count, target, done } for a task on the given reference date. */
export function getTaskStatus(task, completions, date = todayStr()) {
  const count = getTaskCount(task, completions, date)
  return { count, target: task.target_frequency, done: count >= task.target_frequency }
}

/** True when a one-time task's due date has passed and it still isn't done. */
export function isOverdue(task, completions, date = todayStr()) {
  if (task.frequency_type !== 'once' || !task.due_date) return false
  return date > task.due_date && !getTaskStatus(task, completions, date).done
}

/** { done, total } active tasks for a framework, resolved as of the given date. */
export function getFrameworkProgress(tasks, completions, framework, date = todayStr()) {
  const frameworkTasks = tasks.filter((t) => t.active && t.framework === framework)
  const done = frameworkTasks.filter((t) => getTaskStatus(t, completions, date).done).length
  return { done, total: frameworkTasks.length }
}

/** { done, total } across all active tasks, resolved as of the given date. */
export function getOverallProgress(tasks, completions, date = todayStr()) {
  const activeTasks = tasks.filter((t) => t.active)
  const done = activeTasks.filter((t) => getTaskStatus(t, completions, date).done).length
  return { done, total: activeTasks.length }
}

/** Split active tasks into pending vs. completed as of the given date. */
export function splitTasksByStatus(tasks, completions, date = todayStr()) {
  const activeTasks = tasks.filter((t) => t.active)
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
