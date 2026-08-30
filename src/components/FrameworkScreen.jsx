import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTasks } from '../context/TasksContext'
import { useCompletions } from '../context/CompletionsContext'
import { FRAMEWORKS } from '../constants/frameworks'
import { getTaskStatus, isOverdue, isWeeklyUrgent } from '../utils/taskProgress'
import { todayStr } from '../utils/dateUtils'
import { getMonthRange } from '../utils/monthUtils'
import { TaskCard } from './TaskCard'
import { AddEditTaskModal } from './AddEditTaskModal'
import { EmptyState } from './EmptyState'

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

  // Drag-to-reorder: `dragOrderIds` (non-null only while dragging) holds the live,
  // possibly-reordered id sequence; committed to context on pointerup. Kept as plain
  // refs where a re-render isn't needed, to avoid re-running this on every pointer pixel.
  const [dragOrderIds, setDragOrderIds] = useState(null)
  const draggedIdRef = useRef(null)
  const itemRefs = useRef({})

  const displayTasks = dragOrderIds
    ? dragOrderIds.map((id) => tasks.find((t) => t.id === id)).filter(Boolean)
    : tasks

  const handlePointerDown = (e, taskId) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    draggedIdRef.current = taskId
    setDragOrderIds(tasks.map((t) => t.id))
  }

  const handlePointerMove = (e) => {
    const draggedId = draggedIdRef.current
    if (!draggedId || !dragOrderIds) return
    const pointerY = e.clientY

    let closestIndex = 0
    let closestDistance = Infinity
    dragOrderIds.forEach((id, index) => {
      const el = itemRefs.current[id]
      if (!el) return
      const rect = el.getBoundingClientRect()
      const distance = Math.abs(pointerY - (rect.top + rect.height / 2))
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })

    const currentIndex = dragOrderIds.indexOf(draggedId)
    if (closestIndex !== currentIndex) {
      setDragOrderIds(reorderArray(dragOrderIds, currentIndex, closestIndex))
    }
  }

  const handlePointerUp = () => {
    if (draggedIdRef.current && dragOrderIds) {
      reorderTasks(framework, dragOrderIds)
    }
    draggedIdRef.current = null
    setDragOrderIds(null)
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
                  onAdd={() => addCompletion(task.id)}
                  onRemove={handleRemove}
                  onEdit={() => setModalTask(task)}
                  onDelete={() => handleDelete(task)}
                  dragHandleProps={{
                    onPointerDown: (e) => handlePointerDown(e, task.id),
                    onPointerMove: handlePointerMove,
                    onPointerUp: handlePointerUp,
                    onPointerCancel: handlePointerUp,
                  }}
                />
              </div>
            )
          })
        )}
      </div>

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
