// One-off generator for android/app/src/main/res/raw/pomodoro_ring.wav — a ~10s
// synthesized ring (no licensed audio asset needed) used as the native notification
// sound so Pomodoro alerts are audible even when the phone is locked. Re-run with
// `node scripts/generate-ring-wav.cjs` if the ring pattern needs to change.
const fs = require('fs')
const path = require('path')

const SAMPLE_RATE = 44100
const DURATION_SECONDS = 10
const REPEAT_INTERVAL = 1.6
const BEEP_GAP = 0.18

function envelope(t, duration) {
  const attack = 0.02
  if (t < attack) return t / attack
  const decay = duration - t
  if (decay < attack) return Math.max(0, decay / attack)
  return 1
}

function addBeep(samples, frequency, startTime, duration, amplitude) {
  const startSample = Math.floor(startTime * SAMPLE_RATE)
  const numSamples = Math.floor(duration * SAMPLE_RATE)
  for (let i = 0; i < numSamples; i++) {
    const idx = startSample + i
    if (idx >= samples.length) break
    const t = i / SAMPLE_RATE
    const env = envelope(t, duration)
    const sample = Math.sin(2 * Math.PI * frequency * t) * env * amplitude
    samples[idx] += sample
  }
}

const totalSamples = Math.ceil(DURATION_SECONDS * SAMPLE_RATE)
const samples = new Float32Array(totalSamples)

for (let t = 0; t < DURATION_SECONDS; t += REPEAT_INTERVAL) {
  addBeep(samples, 880, t, 0.15, 0.6)
  addBeep(samples, 1046, t + BEEP_GAP, 0.2, 0.6)
}

// Clamp and convert to 16-bit PCM.
const pcm = new Int16Array(totalSamples)
for (let i = 0; i < totalSamples; i++) {
  const clamped = Math.max(-1, Math.min(1, samples[i]))
  pcm[i] = Math.round(clamped * 32767)
}

const numChannels = 1
const bitsPerSample = 16
const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8)
const blockAlign = numChannels * (bitsPerSample / 8)
const dataSize = pcm.length * 2
const buffer = Buffer.alloc(44 + dataSize)

buffer.write('RIFF', 0)
buffer.writeUInt32LE(36 + dataSize, 4)
buffer.write('WAVE', 8)
buffer.write('fmt ', 12)
buffer.writeUInt32LE(16, 16)
buffer.writeUInt16LE(1, 20) // PCM
buffer.writeUInt16LE(numChannels, 22)
buffer.writeUInt32LE(SAMPLE_RATE, 24)
buffer.writeUInt32LE(byteRate, 28)
buffer.writeUInt16LE(blockAlign, 32)
buffer.writeUInt16LE(bitsPerSample, 34)
buffer.write('data', 36)
buffer.writeUInt32LE(dataSize, 40)

for (let i = 0; i < pcm.length; i++) {
  buffer.writeInt16LE(pcm[i], 44 + i * 2)
}

const outPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'raw', 'pomodoro_ring.wav')
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, buffer)
console.log(`Wrote ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`)
