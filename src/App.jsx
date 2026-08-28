import { useEffect, useState } from 'react'
import { AppProviders } from './context/AppProviders'
import { useSettings } from './context/SettingsContext'
import { BottomNav } from './components/BottomNav'
import { DashboardScreen } from './screens/DashboardScreen'
import { GroomScreen } from './screens/GroomScreen'
import { ShredScreen } from './screens/ShredScreen'
import { StyleScreen } from './screens/StyleScreen'
import { PomodoroScreen } from './screens/PomodoroScreen'

const TABS = {
  dashboard: DashboardScreen,
  groom: GroomScreen,
  shred: ShredScreen,
  style: StyleScreen,
}

const SECONDARY_SCREENS = {
  pomodoro: PomodoroScreen,
}

function AppShell() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [secondaryScreen, setSecondaryScreen] = useState(null)
  const { settings } = useSettings()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', Boolean(settings.dark_mode))
  }, [settings.dark_mode])

  const ActiveTabScreen = TABS[activeTab]
  const SecondaryScreen = secondaryScreen ? SECONDARY_SCREENS[secondaryScreen] : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-md mx-auto min-h-screen relative">
        {activeTab === 'dashboard' ? (
          <DashboardScreen onNavigate={setSecondaryScreen} />
        ) : (
          <ActiveTabScreen />
        )}

        {SecondaryScreen && (
          <div className="fixed inset-0 z-40 bg-gray-50 dark:bg-gray-950 overflow-y-auto">
            <div className="max-w-md mx-auto min-h-screen">
              <SecondaryScreen onBack={() => setSecondaryScreen(null)} />
            </div>
          </div>
        )}
      </div>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  )
}

export default function App() {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  )
}
