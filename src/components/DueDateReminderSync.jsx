import { useEffect } from 'react'
import { useTasks } from '../context/TasksContext'
import { useCompletions } from '../context/CompletionsContext'
import { syncDueDateReminders } from '../services/dueDateNotifications'

/** Non-rendering: keeps native due-date reminders in sync with tasks/completions. */
export function DueDateReminderSync() {
  const { tasks } = useTasks()
  const { completions } = useCompletions()

  useEffect(() => {
    syncDueDateReminders(tasks, completions)
  }, [tasks, completions])

  return null
}
