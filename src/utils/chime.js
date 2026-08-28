// Synthesized beeps via Web Audio — no audio asset to bundle, works offline.
// Browsers require a user gesture before audio can play; call unlockChime() from
// inside a click handler (e.g. the Pomodoro Start button) once, then playChime()
// can be called later from timer callbacks that aren't themselves a user gesture.
let audioCtx = null

const RING_DURATION_SECONDS = 10
const RING_REPEAT_INTERVAL_SECONDS = 1.6

export function unlockChime() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    audioCtx = new Ctx()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
}

function beep(frequency, startTime, duration) {
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(0.45, startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration)
}

/** Plays a two-tone chime pair marking a segment transition. `kind` picks the tone. */
function chimePair(kind, startTime) {
  if (kind === 'work') {
    beep(880, startTime, 0.15)
    beep(1046, startTime + 0.18, 0.2)
  } else {
    beep(659, startTime, 0.15)
    beep(523, startTime + 0.18, 0.22)
  }
}

/** Rings for ~10 seconds (repeating chime pairs) so it's easy to notice from across a room. */
export function playChime(kind = 'break') {
  if (!audioCtx) return
  const now = audioCtx.currentTime
  for (let t = 0; t < RING_DURATION_SECONDS; t += RING_REPEAT_INTERVAL_SECONDS) {
    chimePair(kind, now + t)
  }
}
