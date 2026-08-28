import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const DEFAULT_SETTINGS = {
  dark_mode: true,
  pomodoro_work_minutes: 25,
  pomodoro_short_break_minutes: 5,
  pomodoro_long_break_minutes: 30,
}

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [storedSettings, setSettings] = useLocalStorage('alpha:settings', DEFAULT_SETTINGS)
  // Merge with defaults so fields added after a user's settings were first saved
  // (e.g. a new Pomodoro duration) don't come back undefined.
  const settings = { ...DEFAULT_SETTINGS, ...storedSettings }

  const updateSettings = (updates) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
