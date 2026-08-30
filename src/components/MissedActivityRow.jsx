import { Check, X } from 'lucide-react'
import { FRAMEWORKS } from '../constants/frameworks'
import { formatDisplayDate } from '../utils/dateUtils'

/**
 * A single "did you actually do this?" row for a past day that wasn't logged — distinct
 * from TaskCard since it's a pure completion record for a specific date, not task
 * management (no edit/delete). Checking it off backfills a completion for that date;
 * dismissing it says "no, that day genuinely didn't happen" without creating one.
 */
export function MissedActivityRow({ task, date, onCheck, onDismiss }) {
  const accent = FRAMEWORKS[task.framework]
  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 py-1.5 px-2 flex items-center gap-2">
      <button
        onClick={onCheck}
        aria-label={`Mark ${task.name} done on ${formatDisplayDate(date)}`}
        className="w-7 h-7 rounded-full flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 text-transparent shrink-0"
      >
        <Check size={16} strokeWidth={3} />
      </button>
      <p className="flex-1 min-w-0 text-sm text-gray-700 dark:text-gray-200 truncate">{task.name}</p>
      <p className={`text-xs shrink-0 ${accent.text}`}>{formatDisplayDate(date)}</p>
      <button
        onClick={onDismiss}
        aria-label={`Dismiss ${task.name} on ${formatDisplayDate(date)}`}
        className="p-1 rounded-full text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  )
}
