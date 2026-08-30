import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { getTaskStatus } from '../utils/taskProgress'

// Offset well clear of Pomodoro's notification ids (1000-1007) — see pomodoroNotifications.js.
const REMINDER_BASE_ID = 5000
const REMINDER_ID_RANGE = 5000

// A separate, low-importance channel — "silent" as asked for, distinct from the loud
// Pomodoro alerts channel. Importance/sound are locked in at channel creation.
const CHANNEL_ID = 'due-date-reminders'
let channelReady = null

async function ensureChannel() {
  if (!channelReady) {
    channelReady = LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'Due Date Reminders',
      description: 'A quiet reminder on the morning a one-time task is due',
      importance: 3,
      visibility: 1,
      vibration: false,
    }).catch(() => {})
  }
  return channelReady
}

async function ensurePermission() {
  const current = await LocalNotifications.checkPermissions()
  if (current.display === 'granted') return true
  const requested = await LocalNotifications.requestPermissions()
  return requested.display === 'granted'
}

// Deterministic string -> positive int, so the same task always maps to the same
// notification id (a re-sync cleanly replaces rather than duplicates).
function reminderIdFor(taskId) {
  let hash = 0
  for (let i = 0; i < taskId.length; i++) {
    hash = (hash * 31 + taskId.charCodeAt(i)) | 0
  }
  return REMINDER_BASE_ID + (Math.abs(hash) % REMINDER_ID_RANGE)
}

function sixAmOn(dateStr) {
  return new Date(`${dateStr}T06:00:00`)
}

/**
 * Reconciles native due-date reminders against current task/completion state: cancels
 * the reminder for every one-time task (done or not, active or not — a stale id is
 * harmless to cancel), then reschedules one at 6am on the due date for each that's
 * still active, undone, and has a due date. Called on every tasks/completions change
 * (see DueDateReminderSync.jsx), so an early completion, an edited due date, or a
 * deleted task all correctly drop their reminder without any extra wiring. No-op
 * outside a native build.
 */
export async function syncDueDateReminders(tasks, completions) {
  if (!Capacitor.isNativePlatform()) return
  try {
    const onceTasksWithDueDate = tasks.filter((t) => t.frequency_type === 'once' && t.due_date)
    if (onceTasksWithDueDate.length === 0) return

    const cancelIds = onceTasksWithDueDate.map((t) => ({ id: reminderIdFor(t.id) }))
    await LocalNotifications.cancel({ notifications: cancelIds })

    const needsReminder = onceTasksWithDueDate.filter(
      (t) => t.active && !getTaskStatus(t, completions).done,
    )
    if (needsReminder.length === 0) return
    if (!(await ensurePermission())) return
    await ensureChannel()

    const notifications = needsReminder.map((t) => ({
      id: reminderIdFor(t.id),
      title: t.name,
      body: 'Due today',
      channelId: CHANNEL_ID,
      schedule: { at: sixAmOn(t.due_date) },
    }))
    await LocalNotifications.schedule({ notifications })
  } catch {
    // Unsupported/denied — silently skip; the task still shows on the dashboard on its due date.
  }
}
