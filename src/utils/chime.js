// Synthesized beeps via Web Audio — no audio asset to bundle, works offline.
// Browsers require a user gesture before audio can play; call unlockChime() from
// inside a click handler (e.g. the Pomodoro Start button) once, then playChime()
// can be called later from timer callbacks that aren't themselves a user gesture.
let audioCtx = null

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
  gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration)
}

/** Plays a short chime marking a segment transition. `kind` picks the tone. */
export function playChime(kind = 'break') {
  if (!audioCtx) return
  const now = audioCtx.currentTime
  if (kind === 'work') {
    beep(880, now, 0.15)
    beep(1046, now + 0.18, 0.2)
  } else {
    beep(659, now, 0.15)
    beep(523, now + 0.18, 0.22)
  }
}
