import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useSettings } from './SettingsContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useClock } from '../hooks/useClock'
import { buildSequence } from '../constants/pomodoro'
import { unlockChime, playChime } from '../utils/chime'
import {
  scheduleRemainingNotifications,
  cancelPomodoroNotifications,
  cancelSegmentNotifications,
} from '../services/pomodoroNotifications'

const PomodoroContext = createContext(null)

// Lives above the screen-swapping logic in App.jsx, not inside PomodoroScreen — so
// navigating away (Back, or to Groom/Shred/Style) no longer unmounts and destroys the
// running timer. Progress is tracked as an absolute end-timestamp rather than a ticking
// counter, so it stays correct through any throttling/brief backgrounding: whenever this
// does get to run again, it recomputes from wall-clock time instead of drifting.
export function PomodoroProvider({ children }) {
  const { settings, updateSettings } = useSettings()
  const sequence = useMemo(
    () =>
      buildSequence({
        work: settings.pomodoro_work_minutes,
        shortBreak: settings.pomodoro_short_break_minutes,
        longBreak: settings.pomodoro_long_break_minutes,
      }),
    [settings.pomodoro_work_minutes, settings.pomodoro_short_break_minutes, settings.pomodoro_long_break_minutes],
  )

  const [segmentIndex, setSegmentIndex] = useState(0)
  const [running, setRunning] = useState(false)
  const [segmentEndAt, setSegmentEndAt] = useState(null) // epoch ms; set only while running
  const [pausedSecondsLeft, setPausedSecondsLeft] = useState(sequence[0].minutes * 60)
  // Session log kept separate from habit completions — Pomodoro never affects Groom/Shred/Style scores.
  const [, setSessions] = useLocalStorage('alpha:pomodoroSessions', [])

  const now = useClock() // shared 1Hz tick — also forces the re-render this context needs

  const secondsLeft =
    running && segmentEndAt != null ? Math.max(0, Math.round((segmentEndAt - now.getTime()) / 1000)) : pausedSecondsLeft

  // Catches the countdown up to wall-clock time. Chains forward from the segment's
  // scheduled end (not from "now"), so segment lengths stay exact even after a long gap —
  // e.g. the phone being locked through several segments. A plain effect, not a state
  // updater, so side effects (logging, chiming) run exactly once per tick, not doubled by
  // Strict Mode's updater-purity check.
  useEffect(() => {
    if (!running || segmentEndAt == null) return
    const nowMs = now.getTime()
    if (nowMs < segmentEndAt) return

    const passedIndices = []
    let idx = segmentIndex
    let endAt = segmentEndAt
    while (nowMs >= endAt) {
      const finished = sequence[idx]
      if (finished.type === 'work') {
        setSessions((s) => [...s, { completed_at: new Date().toISOString(), duration_minutes: finished.minutes }])
      }
      passedIndices.push(idx)
      idx = (idx + 1) % sequence.length
      endAt += sequence[idx].minutes * 60 * 1000
    }
    setSegmentIndex(idx)
    setSegmentEndAt(endAt)
    playChime(sequence[idx].type === 'work' ? 'work' : 'break')
    // Already chimed for these in the foreground — drop the native alarms so a
    // backgrounded phone that got reopened right on time doesn't also pop a duplicate.
    cancelSegmentNotifications(passedIndices)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now])

  const start = () => {
    unlockChime() // must happen inside a user gesture; safe to call every time
    const endAt = Date.now() + secondsLeft * 1000
    setSegmentEndAt(endAt)
    setRunning(true)
    scheduleRemainingNotifications(sequence, segmentIndex, endAt)
  }

  const pause = () => {
    setPausedSecondsLeft(secondsLeft)
    setSegmentEndAt(null)
    setRunning(false)
    cancelPomodoroNotifications(sequence.length)
  }

  const toggleRunning = () => (running ? pause() : start())

  const reset = () => {
    setRunning(false)
    setSegmentEndAt(null)
    setSegmentIndex(0)
    setPausedSecondsLeft(sequence[0].minutes * 60)
    cancelPomodoroNotifications(sequence.length)
  }

  const handleCustomizeSave = (updates) => {
    updateSettings(updates)
    // Apply immediately rather than mid-segment, using the new values directly — the
    // memoized `sequence` above won't reflect `updates` until the next render.
    setRunning(false)
    setSegmentEndAt(null)
    setSegmentIndex(0)
    setPausedSecondsLeft(updates.pomodoro_work_minutes * 60)
    cancelPomodoroNotifications(sequence.length)
  }

  const value = {
    sequence,
    segmentIndex,
    secondsLeft,
    running,
    toggleRunning,
    reset,
    handleCustomizeSave,
  }

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>
}

export function usePomodoro() {
  const ctx = useContext(PomodoroContext)
  if (!ctx) throw new Error('usePomodoro must be used within PomodoroProvider')
  return ctx
}
