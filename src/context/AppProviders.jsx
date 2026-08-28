import { SettingsProvider } from './SettingsContext'
import { TasksProvider } from './TasksContext'
import { CompletionsProvider } from './CompletionsContext'
import { PomodoroProvider } from './PomodoroContext'

export function AppProviders({ children }) {
  return (
    <SettingsProvider>
      <TasksProvider>
        <CompletionsProvider>
          <PomodoroProvider>{children}</PomodoroProvider>
        </CompletionsProvider>
      </TasksProvider>
    </SettingsProvider>
  )
}
