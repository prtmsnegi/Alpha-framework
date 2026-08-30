import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTasks } from '../context/TasksContext'
import { useCompletions } from '../context/CompletionsContext'
import { FRAMEWORKS } from '../constants/frameworks'
import { getTaskStatus, isOverdue, isWeeklyUrgent, getMissedInstances } from '../utils/taskProgress'
import { todayStr } from '../utils/dateUtils'
import { getMonthRange } from '../utils/monthUtils'
import { TaskCard } from './TaskCard'
import { MissedActivityRow } from './MissedActivityRow'
import { AddEditTaskModal } from './AddEditTaskModal'
import { EmptyState } from './EmptyState'

const PRESS_HOLD_MS = 400
const MOVE_CANCEL_THRESHOLD = 10

function reorderArray(arr, fromIndex, toIndex) {
  const copy = [...arr]
  const [item] = copy.splice(fromIndex, 1)
  copy.splice(toIndex, 0, item)
  return copy
}

/** The shared task-management engine that Groom, Shred, and Style all render. */
export function FrameworkScreen({ framework, children }) {
  const accent = FRAMEWORKS[framework]
  const { getTasksByFramework, addTask, updateTask, deleteTask, reorderTasks } = useTasks()
  const { completions, addCompletion, removeLastCompletion, removeLastCompletionInRange, removeLastCompletionEver } =
    useCompletions()
  const [modalTask, setModalTask] = useState(undefined) // undefined = closed, null = new, task = edit

  const tasks = getTasksByFramework(framework)
  const missedInstances = getMissedInstances(tasks, completions)

  // Long-press-to-drag: `drag` (non-null only once armed) holds the dragged task id and
  // the live, possibly-reordered id sequence, committed via reorderTasks on release.
  // `pressRef` tracks the pending hold-timer before it arms — a real drag never starts
  // from a quick tap, and moving far enough before the hold fires cancels it as a scroll.
  const [drag, setDrag] = useState(null)
  const pressRef = useRef(null)
  const itemRefs = useRef({})

  const displayTasks = drag ? drag.orderIds.map((id) => tasks.find((t) => t.id === id)).filter(Boolean) : tasks

  const clearPressTimer = () => {
    if (pressRef.current?.timerId) clearTimeout(pressRef.current.timerId)
    pressRef.current = null
  }

  const handleZonePointerDown = (e, taskId) => {
    const { clientX, clientY, pointerId, currentTarget } = e
    clearPressTimer()
    const timerId = setTimeout(() => {
      try {
        currentTarget.setPointerCapture(pointerId)
      } catch {
        // Fine either way — reorder still works via normal event bubbling.
      }
      setDrag({ id: taskId, orderIds: tasks.map((t) => t.id) })
    }, PRESS_HOLD_MS)
    pressRef.current = { startX: clientX, startY: clientY, timerId }
  }

  const handleZonePointerMove = (e) => {
    if (drag) {
      const pointerY = e.clientY
      let closestIndex = 0
      let closestDistance = Infinity
      drag.orderIds.forEach((id, index) => {
        const el = itemRefs.current[id]
        if (!el) return
        const rect = el.getBoundingClientRect()
        const distance = Math.abs(pointerY - (rect.top + rect.height / 2))
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })
      const currentIndex = drag.orderIds.indexOf(drag.id)
      if (closestIndex !== currentIndex) {
        setDrag({ ...drag, orderIds: reorderArray(drag.orderIds, currentIndex, closestIndex) })
      }
      return
    }
    if (!pressRef.current) return
    const dx = e.clientX - pressRef.current.startX
    const dy = e.clientY - pressRef.current.startY
    if (Math.hypot(dx, dy) > MOVE_CANCEL_THRESHOLD) clearPressTimer()
  }

  const handleZonePointerUp = () => {
    clearPressTimer()
    if (drag) {
      reorderTasks(framework, drag.orderIds)
      setDrag(null)
    }
  }

  const handleZonePointerCancel = () => {
    clearPressTimer()
    setDrag(null)
  }

  const handleSave = (data) => {
    if (modalTask?.id) {
      updateTask(modalTask.id, data)
    } else {
      addTask(data)
    }
  }

  const handleDelete = (task) => {
    if (window.confirm(`Delete "${task.name}"? Its history will still be kept.`)) {
      deleteTask(task.id)
    }
  }

  return (
    <div className="pb-28 pt-[env(safe-area-inset-top)]">
      <div className={`px-4 pt-6 pb-4 ${accent.bgSoft}`}>
        <h1 className={`text-2xl font-bold ${accent.text}`}>{accent.label}</h1>
      </div>

      {children}

      <div className="px-4 mt-4 space-y-2">
        {tasks.length === 0 ? (
          <EmptyState title={`No ${accent.label.toLowerCase()} tasks yet`} subtitle="Tap + Add Task to create one" />
        ) : (
          displayTasks.map((task) => {
            const status = getTaskStatus(task, completions)
            const handleRemove = () => {
              if (task.frequency_type === 'once') {
                removeLastCompletionEver(task.id)
              } else if (task.frequency_type === 'monthly') {
                const { start, end } = getMonthRange(todayStr())
                removeLastCompletionInRange(task.id, start, end)
              } else {
                removeLastCompletion(task.id, todayStr())
              }
            }
            return (
              <div key={task.id} ref={(el) => (itemRefs.current[task.id] = el)}>
                <TaskCard
                  task={task}
                  count={status.count}
                  target={status.target}
                  done={status.done}
                  overdue={isOverdue(task, completions)}
                  urgent={isWeeklyUrgent(task, completions)}
                  isDragging={drag?.id === task.id}
                  onAdd={() => addCompletion(task.id)}
                  onRemove={handleRemove}
                  onEdit={() => setModalTask(task)}
                  onDelete={() => handleDelete(task)}
                  dragZoneProps={{
                    onPointerDown: (e) => handleZonePointerDown(e, task.id),
                    onPointerMove: handleZonePointerMove,
                    onPointerUp: handleZonePointerUp,
                    onPointerCancel: handleZonePointerCancel,
                  }}
                />
              </div>
            )
          })
        )}
      </div>

      {missedInstances.length > 0 && (
        <div className="px-4 mt-5">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
            Missed
          </p>
          <div className="space-y-2">
            {missedInstances.map(({ task, date }) => (
              <MissedActivityRow
                key={`${task.id}-${date}`}
                task={task}
                date={date}
                onCheck={() => addCompletion(task.id, date)}
              />
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setModalTask(null)}
        className={`fixed bottom-20 right-4 z-30 flex items-center gap-1.5 px-4 py-3 rounded-full text-white text-sm font-semibold shadow-lg ${accent.bg}`}
      >
        <Plus size={18} strokeWidth={2.6} />
        Add Task
      </button>

      {modalTask !== undefined && (
        <AddEditTaskModal
          framework={framework}
          task={modalTask}
          onSave={handleSave}
          onClose={() => setModalTask(undefined)}
        />
      )}
    </div>
  )
}
