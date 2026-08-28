import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { todayStr } from '../utils/dateUtils'

const TasksContext = createContext(null)

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useLocalStorage('alpha:tasks', [])

  const addTask = ({ name, framework, frequency_type, target_frequency, due_date }) => {
    const task = {
      id: crypto.randomUUID(),
      name,
      framework,
      frequency_type,
      target_frequency: frequency_type === 'once' ? 1 : Number(target_frequency) || 1,
      due_date: frequency_type === 'once' ? due_date : null,
      created_date: todayStr(),
      active: true,
    }
    setTasks((prev) => [...prev, task])
    return task
  }

  const updateTask = (id, updates) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  const deleteTask = (id) => {
    // Soft delete: keep the task record so historical completions stay meaningful,
    // just hide it from the active lists.
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, active: false } : t)))
  }

  const getTasksByFramework = (framework) =>
    tasks.filter((t) => t.framework === framework && t.active)

  return (
    <TasksContext.Provider value={{ tasks, addTask, updateTask, deleteTask, getTasksByFramework }}>
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks() {
  const ctx = useContext(TasksContext)
  if (!ctx) throw new Error('useTasks must be used within TasksProvider')
  return ctx
}
