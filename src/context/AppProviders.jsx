import { SettingsProvider } from './SettingsContext'
import { TasksProvider } from './TasksContext'
import { CompletionsProvider } from './CompletionsContext'

export function AppProviders({ children }) {
  return (
    <SettingsProvider>
      <TasksProvider>
        <CompletionsProvider>{children}</CompletionsProvider>
      </TasksProvider>
    </SettingsProvider>
  )
}
