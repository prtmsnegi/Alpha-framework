import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, Settings2 } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useSettings } from '../context/SettingsContext'
import { ScreenHeader } from '../components/ScreenHeader'
import { Modal } from '../components/Modal'
import { buildSequence, TOTAL_WORK_SESSIONS, workSessionNumber } from '../constants/pomodoro'
import { unlockChime, playChime } from '../utils/chime'

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function segmentLabel(sequence, segmentIndex) {
  const segment = sequence[segmentIndex]
  if (segment.type === 'work') return `Session ${workSessionNumber(sequence, segmentIndex)} of ${TOTAL_WORK_SESSIONS}`
  if (segment.type === 'short_break') return 'Short Break'
  return 'Long Break'
}

export function PomodoroScreen({ onBack }) {
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
  const [secondsLeft, setSecondsLeft] = useState(sequence[0].minutes * 60)
  const [running, setRunning] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  // Session log kept separate from habit completions — Pomodoro never affects Groom/Shred/Style scores.
  const [, setSessions] = useLocalStorage('alpha:pomodoroSessions', [])
  const intervalRef = useRef(null)

  // Ticks the countdown. Kept as a pure decrement — no side effects in the updater,
  // since React (Strict Mode) may invoke a functional updater more than once and any
  // side effect inside it (like logging a session or playing a chime) would then fire
  // more than once too.
  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : prev))
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  // Reacts to the countdown reaching zero: logs a finished work session, chimes, then
  // auto-advances into the next segment. A plain effect (not a state updater), so it
  // runs exactly once per transition.
  useEffect(() => {
    if (!running || secondsLeft !== 0) return
    const finished = sequence[segmentIndex]
    if (finished.type === 'work') {
      setSessions((s) => [...s, { completed_at: new Date().toISOString(), duration_minutes: finished.minutes }])
    }
    const nextIndex = (segmentIndex + 1) % sequence.length
    setSegmentIndex(nextIndex)
    setSecondsLeft(sequence[nextIndex].minutes * 60)
    playChime(sequence[nextIndex].type === 'work' ? 'work' : 'break')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft])

  const reset = () => {
    setRunning(false)
    setSegmentIndex(0)
    setSecondsLeft(sequence[0].minutes * 60)
  }

  const toggleRunning = () => {
    unlockChime() // must happen inside a user gesture; safe to call every time
    setRunning((r) => !r)
  }

  const handleCustomizeSave = (updates) => {
    updateSettings(updates)
    // Apply immediately rather than mid-segment, using the new values directly —
    // `sequence` above won't reflect `updates` until the next render.
    setRunning(false)
    setSegmentIndex(0)
    setSecondsLeft(updates.pomodoro_work_minutes * 60)
  }

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
          <p className="text-5xl font-bold text-gray-900 dark:text-gray-50 tabular-nums">{formatTime(secondsLeft)}</p>
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
