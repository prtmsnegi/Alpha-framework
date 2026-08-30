import { Check, Pencil, Trash2, Minus, GripVertical } from 'lucide-react'
import { FRAMEWORKS } from '../constants/frameworks'
import { ProgressBar } from './ProgressBar'
import { formatDisplayDate } from '../utils/dateUtils'

const WINDOW_LABEL = { daily: 'today', weekly: 'this week', monthly: 'this month' }

/**
 * Shared task row used by Groom, Shred, and Style — the "one task-management
 * engine" every framework screen renders. Daily and weekly tasks show tappable
 * slot(s) — daily gets one per target occurrence, weekly gets exactly one
 * representing today (the weekly target is tracked in the subtitle, not the
 * slot count). Monthly keeps the accumulating progress-bar widget.
 */
export function TaskCard({ task, count, target, done, overdue, urgent, onAdd, onRemove, onEdit, onDelete, dragHandleProps }) {
  const accent = FRAMEWORKS[task.framework]
  const isMonthly = task.frequency_type === 'monthly'
  const isOnce = task.frequency_type === 'once'
  const slotCount = task.frequency_type === 'weekly' ? 1 : target

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-1.5 min-w-0">
          {dragHandleProps && (
            <button
              {...dragHandleProps}
              aria-label={`Reorder ${task.name}`}
              className="p-1 -ml-1 mt-0.5 rounded text-gray-300 dark:text-gray-600 shrink-0 touch-none cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={15} />
            </button>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate">{task.name}</p>
            {isOnce ? (
              <p className={`text-xs mt-0.5 ${overdue ? 'text-red-500 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
                {done ? 'Completed' : overdue ? `Overdue since ${formatDisplayDate(task.due_date)}` : `Due ${formatDisplayDate(task.due_date)}`}
              </p>
            ) : (
              <p
                className={`text-xs mt-0.5 ${
                  urgent && !done ? 'text-amber-500 font-semibold' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {count}/{target} {WINDOW_LABEL[task.frequency_type]}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-full text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            aria-label={`Edit ${task.name}`}
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-full text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            aria-label={`Delete ${task.name}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {isMonthly ? (
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar value={count} max={target} colorClass={accent.bg} />
          </div>
          <button
            onClick={onRemove}
            disabled={count === 0}
            aria-label="Undo last completion"
            className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-400 disabled:opacity-30"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={onAdd}
            disabled={done}
            aria-label="Log one completion"
            className={`px-3 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold disabled:opacity-40 ${accent.bg}`}
          >
            {done ? <Check size={16} strokeWidth={3} /> : '+1'}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 mt-2">
          {Array.from({ length: slotCount }).map((_, i) => {
            const filled = task.frequency_type === 'weekly' ? done : i < count
            return (
              <button
                key={i}
                onClick={() => (filled ? onRemove() : onAdd())}
                aria-label={filled ? 'Undo completion' : 'Mark done'}
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  filled
                    ? `${accent.bg} border-transparent text-white`
                    : 'border-gray-200 dark:border-gray-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
