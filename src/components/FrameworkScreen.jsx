import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTasks } from '../context/TasksContext'
import { useCompletions } from '../context/CompletionsContext'
import { FRAMEWORKS } from '../constants/frameworks'
import { getTaskStatus, isOverdue } from '../utils/taskProgress'
import { todayStr } from '../utils/dateUtils'
import { getWeekRange } from '../utils/weekUtils'
import { TaskCard } from './TaskCard'
import { AddEditTaskModal } from './AddEditTaskModal'
import { EmptyState } from './EmptyState'

/** The shared task-management engine that Groom, Shred, and Style all render. */
export function FrameworkScreen({ framework, children }) {
  const accent = FRAMEWORKS[framework]
  const { getTasksByFramework, addTask, updateTask, deleteTask } = useTasks()
  const { completions, addCompletion, removeLastCompletion, removeLastCompletionInRange, removeLastCompletionEver } =
    useCompletions()
  const [modalTask, setModalTask] = useState(undefined) // undefined = closed, null = new, task = edit

  const tasks = getTasksByFramework(framework)

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

      <div className="px-4 mt-4 space-y-2.5">
        {tasks.length === 0 ? (
          <EmptyState title={`No ${accent.label.toLowerCase()} tasks yet`} subtitle="Tap + Add Task to create one" />
        ) : (
          tasks.map((task) => {
            const status = getTaskStatus(task, completions)
            const handleRemove = () => {
              if (task.frequency_type === 'weekly') {
                const { start, end } = getWeekRange(todayStr())
                removeLastCompletionInRange(task.id, start, end)
              } else if (task.frequency_type === 'once') {
                removeLastCompletionEver(task.id)
              } else {
                removeLastCompletion(task.id, todayStr())
              }
            }
            return (
              <TaskCard
                key={task.id}
                task={task}
                count={status.count}
                target={status.target}
                done={status.done}
                overdue={isOverdue(task, completions)}
                onAdd={() => addCompletion(task.id)}
                onRemove={handleRemove}
                onEdit={() => setModalTask(task)}
                onDelete={() => handleDelete(task)}
              />
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
