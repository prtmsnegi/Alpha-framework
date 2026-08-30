import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { todayStr } from '../utils/dateUtils'

const CompletionsContext = createContext(null)

export function CompletionsProvider({ children }) {
  const [completions, setCompletions] = useLocalStorage('alpha:completions', [])
  // Not a completion — just "stop asking about this specific missed day." Doesn't
  // affect counts, trends, or streaks, purely filters the Missed section's list.
  const [dismissedMisses, setDismissedMisses] = useLocalStorage('alpha:dismissedMisses', [])

  const addCompletion = (taskId, date = todayStr()) => {
    const entry = { id: crypto.randomUUID(), task_id: taskId, date, timestamp: new Date().toISOString() }
    setCompletions((prev) => [...prev, entry])
  }

  const removeLastMatching = (predicate) => {
    setCompletions((prev) => {
      const matches = prev.filter(predicate).sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      const last = matches[0]
      if (!last) return prev
      return prev.filter((c) => c.id !== last.id)
    })
  }

  // Removes the most recently logged completion for this task on this exact date —
  // used when the user un-checks a daily slot (a correction, not a history rewrite).
  const removeLastCompletion = (taskId, date) => {
    removeLastMatching((c) => c.task_id === taskId && c.date === date)
  }

  // Removes the most recently logged completion for this task anywhere within a date
  // range — used to undo a monthly task's most recent tap, regardless of which day
  // in the month it was logged on (a monthly target isn't tied to any single day).
  const removeLastCompletionInRange = (taskId, startDate, endDate) => {
    removeLastMatching((c) => c.task_id === taskId && c.date >= startDate && c.date <= endDate)
  }

  // Removes the most recently logged completion for this task, regardless of date —
  // used to undo a one-time task's single checkmark.
  const removeLastCompletionEver = (taskId) => {
    removeLastMatching((c) => c.task_id === taskId)
  }

  const removeCompletionsForTask = (taskId) => {
    setCompletions((prev) => prev.filter((c) => c.task_id !== taskId))
  }

  const dismissMiss = (taskId, date) => {
    setDismissedMisses((prev) => [...prev, { task_id: taskId, date }])
  }

  return (
    <CompletionsContext.Provider
      value={{
        completions,
        addCompletion,
        removeLastCompletion,
        removeLastCompletionInRange,
        removeLastCompletionEver,
        removeCompletionsForTask,
        dismissedMisses,
        dismissMiss,
      }}
    >
      {children}
    </CompletionsContext.Provider>
  )
}

export function useCompletions() {
  const ctx = useContext(CompletionsContext)
  if (!ctx) throw new Error('useCompletions must be used within CompletionsProvider')
  return ctx
}
