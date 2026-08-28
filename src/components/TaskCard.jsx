import { Check, Pencil, Trash2, Minus } from 'lucide-react'
import { FRAMEWORKS } from '../constants/frameworks'
import { ProgressBar } from './ProgressBar'
import { formatDisplayDate } from '../utils/dateUtils'

/**
 * Shared task row used by Groom, Shred, and Style — the "one task-management
 * engine" every framework screen renders. A daily task shows one tappable slot
 * per target occurrence; a weekly task shows an accumulating progress bar.
 */
export function TaskCard({ task, count, target, done, overdue, onAdd, onRemove, onEdit, onDelete }) {
  const accent = FRAMEWORKS[task.framework]

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate">{task.name}</p>
          {task.frequency_type === 'once' ? (
            <p className={`text-xs mt-0.5 ${overdue ? 'text-red-500 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
              {done ? 'Completed' : overdue ? `Overdue since ${formatDisplayDate(task.due_date)}` : `Due ${formatDisplayDate(task.due_date)}`}
            </p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {count}/{target} {task.frequency_type === 'daily' ? 'today' : 'this week'}
            </p>
          )}
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

      {task.frequency_type !== 'weekly' ? (
        <div className="flex flex-wrap gap-2 mt-3">
          {Array.from({ length: target }).map((_, i) => {
            const filled = i < count
            return (
              <button
                key={i}
                onClick={() => (filled ? onRemove() : onAdd())}
                aria-label={filled ? 'Undo completion' : 'Mark done'}
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                  filled
                    ? `${accent.bg} border-transparent text-white`
                    : 'border-gray-200 dark:border-gray-700 text-transparent'
                }`}
              >
                <Check size={18} strokeWidth={3} />
              </button>
            )
          })}
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-3">
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
      )}
    </div>
  )
}
