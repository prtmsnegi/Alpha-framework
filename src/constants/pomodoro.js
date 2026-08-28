export const DEFAULT_POMODORO_DURATIONS = {
  work: 25,
  shortBreak: 5,
  longBreak: 30,
}

export const TOTAL_WORK_SESSIONS = 4

/**
 * Classic Pomodoro cycle shape (4 focus sessions, short breaks between them, one
 * longer break after the 4th, before it loops) with user-configurable durations.
 */
export function buildSequence({ work, shortBreak, longBreak }) {
  return [
    { type: 'work', minutes: work },
    { type: 'short_break', minutes: shortBreak },
    { type: 'work', minutes: work },
    { type: 'short_break', minutes: shortBreak },
    { type: 'work', minutes: work },
    { type: 'short_break', minutes: shortBreak },
    { type: 'work', minutes: work },
    { type: 'long_break', minutes: longBreak },
  ]
}

/** 1-based index of the work session at segmentIndex within the given sequence. */
export function workSessionNumber(sequence, segmentIndex) {
  return sequence.slice(0, segmentIndex + 1).filter((s) => s.type === 'work').length
}

/** Human-readable label for a segment, e.g. "Session 2 of 4", "Short Break", "Long Break". */
export function segmentLabel(sequence, segmentIndex) {
  const segment = sequence[segmentIndex]
  if (segment.type === 'work') return `Session ${workSessionNumber(sequence, segmentIndex)} of ${TOTAL_WORK_SESSIONS}`
  if (segment.type === 'short_break') return 'Short Break'
  return 'Long Break'
}

/** mm:ss for a countdown display. */
export function formatPomodoroTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
