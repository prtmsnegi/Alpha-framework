import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { segmentLabel } from '../constants/pomodoro'

// Fixed id per segment slot (0-7) — a re-schedule cleanly replaces whatever was pending
// at that slot rather than piling up duplicates.
const NOTIFICATION_BASE_ID = 1000

async function ensurePermission() {
  const current = await LocalNotifications.checkPermissions()
  if (current.display === 'granted') return true
  const requested = await LocalNotifications.requestPermissions()
  return requested.display === 'granted'
}

/**
 * Schedules one OS-level notification per remaining segment in the current pass
 * through the sequence (from `startIndex` through the end — not wrapping into a new
 * cycle, see PomodoroContext for why). These fire from the native OS even while the
 * WebView/JS is suspended, unlike the in-app chime. No-op outside a native build.
 */
export async function scheduleRemainingNotifications(sequence, startIndex, startEndAt) {
  if (!Capacitor.isNativePlatform()) return
  try {
    if (!(await ensurePermission())) return
    await cancelPomodoroNotifications(sequence.length)

    const notifications = []
    let endAt = startEndAt
    for (let i = startIndex; i < sequence.length; i++) {
      const nextIndex = i + 1 === sequence.length ? 0 : i + 1
      notifications.push({
        id: NOTIFICATION_BASE_ID + i,
        title: segmentLabel(sequence, nextIndex),
        body: 'Alpha Pomodoro',
        schedule: { at: new Date(endAt) },
      })
      if (nextIndex === 0) break // stop at the end of this pass, don't schedule into a new cycle
      endAt += sequence[nextIndex].minutes * 60 * 1000
    }

    if (notifications.length > 0) await LocalNotifications.schedule({ notifications })
  } catch {
    // Notifications unsupported/denied — silently skip; the foreground chime still works.
  }
}

/** Cancels every notification id this module may have scheduled. */
export async function cancelPomodoroNotifications(sequenceLength) {
  if (!Capacitor.isNativePlatform()) return
  try {
    const notifications = Array.from({ length: sequenceLength }, (_, i) => ({ id: NOTIFICATION_BASE_ID + i }))
    await LocalNotifications.cancel({ notifications })
  } catch {
    // Nothing pending, or unsupported — fine either way.
  }
}

/** Cancels the notifications for specific segment indices (already handled by an in-app chime). */
export async function cancelSegmentNotifications(indices) {
  if (!Capacitor.isNativePlatform() || indices.length === 0) return
  try {
    const notifications = indices.map((i) => ({ id: NOTIFICATION_BASE_ID + i }))
    await LocalNotifications.cancel({ notifications })
  } catch {
    // Fine either way.
  }
}
