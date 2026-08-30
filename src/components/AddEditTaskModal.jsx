import { useState } from 'react'
import { Modal } from './Modal'
import { FREQUENCY_TYPES } from '../constants/frequency'
import { todayStr } from '../utils/dateUtils'

export function AddEditTaskModal({ framework, task, onSave, onClose }) {
  const [name, setName] = useState(task?.name ?? '')
  const [frequencyType, setFrequencyType] = useState(task?.frequency_type ?? 'daily')
  const [targetFrequency, setTargetFrequency] = useState(String(task?.target_frequency ?? 1))
  const [dueDate, setDueDate] = useState(task?.due_date ?? todayStr())
  const [intervalUnit, setIntervalUnit] = useState(
    task?.interval_days && task.interval_days % 7 === 0 ? 'weeks' : 'days',
  )
  const [intervalNumber, setIntervalNumber] = useState(() => {
    if (!task?.interval_days) return '1'
    return String(task.interval_days % 7 === 0 ? task.interval_days / 7 : task.interval_days)
  })

  const isOnce = frequencyType === 'once'
  const isInterval = frequencyType === 'interval'
  const intervalDays = intervalUnit === 'weeks' ? Number(intervalNumber) * 7 : Number(intervalNumber)

  const canSave =
    name.trim().length > 0 &&
    (isOnce ? Boolean(dueDate) : isInterval ? intervalDays > 0 : Number(targetFrequency) > 0)

  const handleSave = () => {
    if (!canSave) return
    onSave({
      name: name.trim(),
      framework,
      frequency_type: frequencyType,
      target_frequency: Number(targetFrequency),
      due_date: dueDate,
      interval_days: intervalDays,
    })
    onClose()
  }

  return (
    <Modal title={task ? 'Edit Task' : 'Add Task'} onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Task Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Gym"
            autoFocus
          />
        </div>

        {isOnce ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Due Date</label>
              <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Frequency</label>
              <select className="input" value={frequencyType} onChange={(e) => setFrequencyType(e.target.value)}>
                {FREQUENCY_TYPES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : isInterval ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Every</label>
              <div className="flex gap-1.5">
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={intervalNumber}
                  onChange={(e) => setIntervalNumber(e.target.value)}
                />
                <select
                  className="input"
                  value={intervalUnit}
                  onChange={(e) => setIntervalUnit(e.target.value)}
                >
                  <option value="days">days</option>
                  <option value="weeks">weeks</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Frequency</label>
              <select className="input" value={frequencyType} onChange={(e) => setFrequencyType(e.target.value)}>
                {FREQUENCY_TYPES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Target</label>
              <input
                className="input"
                type="number"
                min="1"
                value={targetFrequency}
                onChange={(e) => setTargetFrequency(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Frequency</label>
              <select className="input" value={frequencyType} onChange={(e) => setFrequencyType(e.target.value)}>
                {FREQUENCY_TYPES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary flex-1 disabled:opacity-40" onClick={handleSave} disabled={!canSave}>
            Save
          </button>
        </div>
      </div>
    </Modal>
  )
}
