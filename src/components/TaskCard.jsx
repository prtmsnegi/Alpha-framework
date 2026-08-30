import { Check, Pencil, Trash2, Minus, Plus } from 'lucide-react'
import { FRAMEWORKS } from '../constants/frameworks'
import { formatDisplayDate } from '../utils/dateUtils'

const WINDOW_LABEL = { daily: 'today', weekly: 'this week', monthly: 'this month' }

/**
 * Shared task row used by Groom, Shred, and Style — the "one task-management engine"
 * every framework screen renders. Single compact row: a leading checkbox for
 * daily/weekly/once/interval (tap adds when not done, undoes the most recent when done —
 * the same model weekly already used), name + count/due-date text, then edit/delete.
 * Monthly has no natural per-day checkbox, so it keeps a distinct +1/undo pair instead,
 * placed alongside edit/delete rather than a leading checkbox.
 */
export function TaskCard({
  task,
  count,
  target,
  done,
  overdue,
  urgent,
  dueDate,
  isDragging,
  onAdd,
  onRemove,
  onEdit,
  onDelete,
  dragZoneProps,
}) {
  const accent = FRAMEWORKS[task.framework]
  const isMonthly = task.frequency_type === 'monthly'
  const isOnce = task.frequency_type === 'once'
  const isInterval = task.frequency_type === 'interval'
  const isDueDateStyle = isOnce || isInterval

  const infoText = isDueDateStyle
    ? done
      ? isInterval
        ? `Next: ${formatDisplayDate(dueDate)}`
        : 'Completed'
      : overdue
        ? `Overdue ${formatDisplayDate(dueDate)}`
        : `Due ${formatDisplayDate(dueDate)}`
    : `${count}/${target} ${WINDOW_LABEL[task.frequency_type]}`

  const infoColor =
    isDueDateStyle && overdue
      ? 'text-red-500 font-semibold'
      : !isMonthly && !isDueDateStyle && urgent && !done
        ? 'text-amber-500 font-semibold'
        : 'text-gray-400 dark:text-gray-500'

  return (
    <div
      className={`rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 py-1.5 px-2 flex items-center gap-2 transition-all ${
        isDragging ? 'shadow-md scale-[1.02]' : ''
      }`}
    >
      {!isMonthly && (
        <button
          onClick={() => (done ? onRemove() : onAdd())}
          aria-label={done ? 'Undo completion' : 'Mark done'}
          className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${
            done ? `${accent.bg} border-transparent text-white` : 'border-gray-200 dark:border-gray-700 text-transparent'
          }`}
        >
          <Check size={16} strokeWidth={3} />
        </button>
      )}

      <div
        {...dragZoneProps}
        style={{ WebkitTouchCallout: 'none' }}
        className={`flex-1 min-w-0 flex items-baseline gap-1.5 select-none touch-pan-y ${isDragging ? 'touch-none' : ''}`}
      >
        <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">{task.name}</p>
        <p className={`text-xs shrink-0 ${infoColor}`}>{infoText}</p>
      </div>

      {isMonthly && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onRemove}
            disabled={count === 0}
            aria-label="Undo last completion"
            className="w-6 h-6 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-400 disabled:opacity-30"
          >
            <Minus size={13} />
          </button>
          <button
            onClick={onAdd}
            disabled={done}
            aria-label="Log one completion"
            className={`w-6 h-6 rounded-full flex items-center justify-center text-white disabled:opacity-40 ${accent.bg}`}
          >
            {done ? <Check size={13} strokeWidth={3} /> : <Plus size={13} strokeWidth={3} />}
          </button>
        </div>
      )}

      <div className="flex items-center shrink-0">
        <button
          onClick={onEdit}
          className="p-1 rounded-full text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          aria-label={`Edit ${task.name}`}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded-full text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          aria-label={`Delete ${task.name}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
