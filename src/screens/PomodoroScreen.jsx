import { useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Play, Pause, RotateCcw, Settings2 } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { usePomodoro } from '../context/PomodoroContext'
import { ScreenHeader } from '../components/ScreenHeader'
import { Modal } from '../components/Modal'
import { TOTAL_WORK_SESSIONS, workSessionNumber, segmentLabel, formatPomodoroTime } from '../constants/pomodoro'

const IS_NATIVE = Capacitor.isNativePlatform()

export function PomodoroScreen({ onBack }) {
  const { settings } = useSettings()
  const { sequence, segmentIndex, secondsLeft, running, toggleRunning, reset, handleCustomizeSave } = usePomodoro()
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const wakeLockRef = useRef(null)

  // Keeps the screen from auto-locking while a session is actively being watched here.
  // Released automatically by the browser the moment the tab/screen goes hidden (a Wake
  // Lock spec requirement, not something to work around) — re-acquired below whenever
  // this screen is visible again and still running. Not supported everywhere; fails
  // silently where it isn't rather than blocking anything.
  useEffect(() => {
    if (!running || !('wakeLock' in navigator)) return

    let active = true
    const acquire = async () => {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      } catch {
        // Not available right now (e.g. tab hidden, unsupported) — fine, just no lock.
      }
    }
    acquire()

    const onVisible = () => {
      if (active && document.visibilityState === 'visible' && !wakeLockRef.current) acquire()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      active = false
      document.removeEventListener('visibilitychange', onVisible)
      wakeLockRef.current?.release().catch(() => {})
      wakeLockRef.current = null
    }
  }, [running])

  const segment = sequence[segmentIndex]
  const durationSeconds = segment.minutes * 60
  const pct = durationSeconds > 0 ? 1 - secondsLeft / durationSeconds : 0
  const completedWork = sequence.slice(0, segmentIndex).filter((s) => s.type === 'work').length
  const currentWorkNum = segment.type === 'work' ? workSessionNumber(sequence, segmentIndex) : null

  return (
    <div className="pt-[env(safe-area-inset-top)] px-4 pb-10">
      <ScreenHeader
        onBack={onBack}
        title="Pomodoro"
        rightAction={
          <button
            onClick={() => setCustomizeOpen(true)}
            className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
            aria-label="Customize durations"
          >
            <Settings2 size={19} />
          </button>
        }
      />

      <div className="flex flex-col items-center mt-8">
        <p className="text-sm font-semibold text-violet-500">{segmentLabel(sequence, segmentIndex)}</p>

        <div className="relative w-56 h-56 flex items-center justify-center mt-3">
          <svg width={224} height={224} className="-rotate-90 absolute">
            <circle cx={112} cy={112} r={100} strokeWidth={10} className="stroke-gray-100 dark:stroke-gray-800" fill="none" />
            <circle
              cx={112}
              cy={112}
              r={100}
              strokeWidth={10}
              strokeDasharray={2 * Math.PI * 100}
              strokeDashoffset={2 * Math.PI * 100 * (1 - pct)}
              strokeLinecap="round"
              className="stroke-violet-500 transition-all"
              fill="none"
            />
          </svg>
          <p className="text-5xl font-bold text-gray-900 dark:text-gray-50 tabular-nums">{formatPomodoroTime(secondsLeft)}</p>
        </div>

        <div className="flex items-center gap-2 mt-6">
          {Array.from({ length: TOTAL_WORK_SESSIONS }).map((_, i) => {
            const sessionNum = i + 1
            const filled = sessionNum <= completedWork
            const active = sessionNum === currentWorkNum
            return (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  filled ? 'bg-violet-500' : active ? 'bg-violet-300 dark:bg-violet-700' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )
          })}
        </div>

        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={reset}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300"
            aria-label="Reset"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={toggleRunning}
            className="w-20 h-20 rounded-full flex items-center justify-center bg-violet-500 text-white shadow-lg"
            aria-label={running ? 'Pause' : 'Start'}
          >
            {running ? <Pause size={28} /> : <Play size={28} className="ml-0.5" />}
          </button>
          <div className="w-14 h-14" />
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-6 px-4">
          {IS_NATIVE
            ? "Keeps running while Alpha is open, even on another screen, and alerts you even if your phone is locked."
            : "Keeps running while Alpha is open, even on another screen. It can't chime while your phone is fully locked — reopening the app catches it up to the correct time."}
        </p>
      </div>

      {customizeOpen && (
        <CustomizeModal settings={settings} onSave={handleCustomizeSave} onClose={() => setCustomizeOpen(false)} />
      )}
    </div>
  )
}

function CustomizeModal({ settings, onSave, onClose }) {
  const [work, setWork] = useState(String(settings.pomodoro_work_minutes))
  const [shortBreak, setShortBreak] = useState(String(settings.pomodoro_short_break_minutes))
  const [longBreak, setLongBreak] = useState(String(settings.pomodoro_long_break_minutes))

  const canSave = Number(work) > 0 && Number(shortBreak) > 0 && Number(longBreak) > 0

  const handleSave = () => {
    if (!canSave) return
    onSave({
      pomodoro_work_minutes: Number(work),
      pomodoro_short_break_minutes: Number(shortBreak),
      pomodoro_long_break_minutes: Number(longBreak),
    })
    onClose()
  }

  return (
    <Modal title="Customize Pomodoro" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Focus session (minutes)
          </label>
          <input className="input" type="number" min="1" value={work} onChange={(e) => setWork(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Short break (minutes)
          </label>
          <input
            className="input"
            type="number"
            min="1"
            value={shortBreak}
            onChange={(e) => setShortBreak(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Long break (minutes)
          </label>
          <input
            className="input"
            type="number"
            min="1"
            value={longBreak}
            onChange={(e) => setLongBreak(e.target.value)}
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          4 focus sessions per cycle, with a short break between each and a long break after the 4th. Saving
          restarts the cycle from Session 1.
        </p>
        <div className="flex gap-2 pt-2">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary flex-1 disabled:opacity-40" onClick={handleSave} disabled={!canSave}>
            Save
          </button>
        </div>
      </div>
    </Modal>
  )
}
