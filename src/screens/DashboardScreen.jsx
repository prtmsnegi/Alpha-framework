import { Timer, ChevronRight, Sun, Moon, AlertTriangle } from 'lucide-react'
import { useTasks } from '../context/TasksContext'
import { useCompletions } from '../context/CompletionsContext'
import { useSettings } from '../context/SettingsContext'
import { usePomodoro } from '../context/PomodoroContext'
import { FRAMEWORKS, FRAMEWORK_IDS } from '../constants/frameworks'
import { segmentLabel, formatPomodoroTime } from '../constants/pomodoro'
import {
  getFrameworkProgress,
  getOverallProgress,
  getWeeklyProgress,
  getMonthlyProgress,
  getConsecutiveMissStreak,
} from '../utils/taskProgress'
import { getCurrentStreak } from '../utils/streaks'
import { getTrendData } from '../utils/trends'
import { useClock } from '../hooks/useClock'
import { ProgressRing } from '../components/ProgressRing'
import { ProgressBar } from '../components/ProgressBar'
import { TrendChart } from '../components/TrendChart'

export function DashboardScreen({ onNavigate }) {
  const { tasks } = useTasks()
  const { completions } = useCompletions()
  const { settings, updateSettings } = useSettings()
  const { sequence, segmentIndex, secondsLeft, running } = usePomodoro()
  const now = useClock()

  const overall = getOverallProgress(tasks, completions)
  const weekly = getWeeklyProgress(tasks, completions)
  const monthly = getMonthlyProgress(tasks, completions)
  const streak = getCurrentStreak(tasks, completions)
  const weekTrend = getTrendData(tasks, completions, 7)
  const atRiskTasks = tasks
    .filter((t) => t.active)
    .map((t) => ({ task: t, streak: getConsecutiveMissStreak(t, completions) }))
    .filter(({ streak }) => streak >= 2)

  return (
    <div className="pb-28 pt-[env(safe-area-inset-top)] px-4">
      <div className="pt-6 pb-2 flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 tabular-nums">
            {now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={() => updateSettings({ dark_mode: !settings.dark_mode })}
          aria-label={settings.dark_mode ? 'Switch to white background' : 'Switch to dark background'}
          className="p-2 rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-300 mt-1"
        >
          {settings.dark_mode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 mt-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
            Today's Progress
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">
            {overall.done}/{overall.total} <span className="text-sm font-medium text-gray-400">tasks</span>
          </p>
          {streak > 0 && (
            <p className="text-xs text-violet-500 font-semibold mt-1">🔥 {streak} day streak</p>
          )}
        </div>
        <ProgressRing value={overall.done} max={overall.total || 1} colorClass="text-violet-500" />
      </div>

      {atRiskTasks.length > 0 && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-4 mt-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle size={14} className="text-red-500" />
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">Needs Attention</p>
          </div>
          <div className="space-y-1">
            {atRiskTasks.map(({ task, streak }) => (
              <p key={task.id} className="text-sm text-gray-700 dark:text-gray-200">
                <span className="font-semibold">{task.name}</span> — missed {streak} days running
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5 mt-3">
        {FRAMEWORK_IDS.map((id) => {
          const accent = FRAMEWORKS[id]
          const progress = getFrameworkProgress(tasks, completions, id)
          return (
            <div
              key={id}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 flex flex-col items-center gap-1.5"
            >
              <ProgressRing
                value={progress.done}
                max={progress.total || 1}
                size={48}
                strokeWidth={5}
                colorClass={accent.text}
                label={`${progress.done}/${progress.total || 0}`}
              />
              <p className={`text-xs font-semibold ${accent.text}`}>{accent.label}</p>
            </div>
          )
        })}
      </div>

      {weekly.target > 0 && (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              Weekly Progress
            </p>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {weekly.count}/{weekly.target}
            </p>
          </div>
          <ProgressBar value={weekly.count} max={weekly.target} colorClass="bg-violet-500" />
        </div>
      )}

      {monthly.target > 0 && (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              Monthly Progress
            </p>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {monthly.count}/{monthly.target}
            </p>
          </div>
          <ProgressBar value={monthly.count} max={monthly.target} colorClass="bg-violet-500" />
        </div>
      )}

      <button
        onClick={() => onNavigate('trends')}
        className="w-full mt-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 active:bg-gray-50 dark:active:bg-gray-800"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
            Last 7 Days
          </p>
          <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
        </div>
        <TrendChart data={weekTrend} height={40} showLabels showCounts />
      </button>

      <button
        onClick={() => onNavigate('pomodoro')}
        className="w-full mt-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 active:bg-gray-50 dark:active:bg-gray-800"
      >
        <div className="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center shrink-0">
          <Timer size={20} className="text-violet-500" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">Pomodoro</p>
          {running ? (
            <p className="text-xs text-violet-500 font-semibold tabular-nums">
              {segmentLabel(sequence, segmentIndex)} · {formatPomodoroTime(secondsLeft)} left
            </p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              4 × {settings.pomodoro_work_minutes} min focus, with breaks
            </p>
          )}
        </div>
        <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
      </button>
    </div>
  )
}
