import { useTasks } from '../context/TasksContext'
import { useCompletions } from '../context/CompletionsContext'
import { FRAMEWORKS, FRAMEWORK_IDS } from '../constants/frameworks'
import { getTrendData } from '../utils/trends'
import { ScreenHeader } from '../components/ScreenHeader'
import { TrendChart } from '../components/TrendChart'

const OVERALL_DAYS = 30
const FRAMEWORK_DAYS = 7

export function TrendsScreen({ onBack }) {
  const { tasks } = useTasks()
  const { completions } = useCompletions()

  const overallTrend = getTrendData(tasks, completions, OVERALL_DAYS)
  const validDays = overallTrend.filter((d) => d.pct !== null)
  const avgPct = validDays.length
    ? Math.round((validDays.reduce((sum, d) => sum + d.pct, 0) / validDays.length) * 100)
    : null

  return (
    <div className="pt-[env(safe-area-inset-top)] px-4 pb-10">
      <ScreenHeader onBack={onBack} title="Trends" />

      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
            Last {OVERALL_DAYS} Days
          </p>
          {avgPct !== null && (
            <p className="text-xs font-semibold text-violet-500">{avgPct}% average</p>
          )}
        </div>
        <TrendChart data={overallTrend} height={100} />
      </div>

      <div className="mt-4 space-y-2.5">
        {FRAMEWORK_IDS.map((id) => {
          const accent = FRAMEWORKS[id]
          const trend = getTrendData(tasks, completions, FRAMEWORK_DAYS, { framework: id })
          return (
            <div
              key={id}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4"
            >
              <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${accent.text}`}>{accent.label}</p>
              <TrendChart data={trend} height={40} showLabels showCounts />
            </div>
          )
        })}
      </div>
    </div>
  )
}
