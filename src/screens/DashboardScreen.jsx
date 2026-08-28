import { Timer, ChevronRight, Sun, Moon } from 'lucide-react'
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
  splitTasksByStatus,
  isOverdue,
} from '../utils/taskProgress'
import { getCurrentStreak } from '../utils/streaks'
import { getTrendData } from '../utils/trends'
import { useClock } from '../hooks/useClock'
import { formatDisplayDate } from '../utils/dateUtils'
import { ProgressRing } from '../components/ProgressRing'
import { ProgressBar } from '../components/ProgressBar'
import { TrendChart } from '../components/TrendChart'
import { EmptyState } from '../components/EmptyState'

export function DashboardScreen({ onNavigate }) {
  const { tasks } = useTasks()
  const { completions } = useCompletions()
  const { settings, updateSettings } = useSettings()
  const { sequence, segmentIndex, secondsLeft, running } = usePomodoro()
  const now = useClock()

  const overall = getOverallProgress(tasks, completions)
  const weekly = getWeeklyProgress(tasks, completions)
  const streak = getCurrentStreak(tasks, completions)
  const weekTrend = getTrendData(tasks, completions, 7)
  const { pending, completed } = splitTasksByStatus(tasks, completions)

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
        <TrendChart data={weekTrend} height={40} showLabels />
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

      <div className="mt-5">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
          Pending ({pending.length})
        </p>
        {pending.length === 0 ? (
          <EmptyState title="Nothing pending" subtitle="You're all caught up for now" />
        ) : (
          <div className="space-y-2">
            {pending.map(({ task, status }) => (
              <TaskRow key={task.id} task={task} status={status} overdue={isOverdue(task, completions)} />
            ))}
          </div>
        )}
      </div>

      {completed.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
            Completed ({completed.length})
          </p>
          <div className="space-y-2">
            {completed.map(({ task, status }) => (
              <TaskRow key={task.id} task={task} status={status} muted />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TaskRow({ task, status, muted, overdue }) {
  const accent = FRAMEWORKS[task.framework]
  return (
    <div
      className={`rounded-xl border border-gray-100 dark:border-gray-800 px-3.5 py-2.5 flex items-center justify-between ${
        muted ? 'bg-gray-50 dark:bg-gray-900/50 opacity-60' : 'bg-white dark:bg-gray-900'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-2 h-2 rounded-full shrink-0 ${accent.bg}`} />
        <p className="text-sm text-gray-800 dark:text-gray-100 truncate">{task.name}</p>
      </div>
      {task.frequency_type === 'once' ? (
        <p className={`text-xs shrink-0 ${overdue ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
          {overdue ? `Overdue: ${formatDisplayDate(task.due_date)}` : `Due ${formatDisplayDate(task.due_date)}`}
        </p>
      ) : (
        <p className="text-xs text-gray-400 shrink-0">
          {status.count}/{status.target}
        </p>
      )}
    </div>
  )
}
