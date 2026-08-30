import { SettingsProvider } from './SettingsContext'
import { TasksProvider } from './TasksContext'
import { CompletionsProvider } from './CompletionsContext'
import { PomodoroProvider } from './PomodoroContext'
import { DueDateReminderSync } from '../components/DueDateReminderSync'

export function AppProviders({ children }) {
  return (
    <SettingsProvider>
      <TasksProvider>
        <CompletionsProvider>
          <PomodoroProvider>
            <DueDateReminderSync />
            {children}
          </PomodoroProvider>
        </CompletionsProvider>
      </TasksProvider>
    </SettingsProvider>
  )
}
