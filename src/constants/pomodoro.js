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
