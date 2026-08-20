import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const sampleRate = 22050
const outputDirectory = resolve('public/assets/audio')

function createWaveFile(sequence) {
  const samples = []

  for (const tone of sequence) {
    const length = Math.floor(sampleRate * tone.duration)
    for (let index = 0; index < length; index += 1) {
      const time = index / sampleRate
      const envelope = Math.min(1, index / 180) * Math.max(0, 1 - index / length)
      const frequency = tone.endFrequency
        ? tone.frequency + (tone.endFrequency - tone.frequency) * (index / length)
        : tone.frequency
      const sample = Math.sin(2 * Math.PI * frequency * time) * envelope * (tone.volume ?? 0.5)
      samples.push(Math.max(-1, Math.min(1, sample)))
    }
  }

  const dataSize = samples.length * 2
  const buffer = Buffer.alloc(44 + dataSize)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVEfmt ', 8)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)
  samples.forEach((sample, index) => buffer.writeInt16LE(Math.round(sample * 32767), 44 + index * 2))
  return buffer
}

const sounds = {
  attack: [{ frequency: 180, endFrequency: 520, duration: 0.12 }, { frequency: 90, duration: 0.08 }],
  defense: [{ frequency: 260, duration: 0.09 }, { frequency: 360, duration: 0.12 }],
  special: [{ frequency: 240, endFrequency: 900, duration: 0.28 }, { frequency: 1200, duration: 0.12, volume: 0.35 }],
  defeated: [{ frequency: 420, endFrequency: 80, duration: 0.38 }],
  victory: [
    { frequency: 523, duration: 0.12 }, { frequency: 659, duration: 0.12 },
    { frequency: 784, duration: 0.12 }, { frequency: 1046, duration: 0.32 },
  ],
  defeat: [
    { frequency: 392, duration: 0.18 }, { frequency: 330, duration: 0.18 },
    { frequency: 262, duration: 0.35 },
  ],
}

mkdirSync(outputDirectory, { recursive: true })
Object.entries(sounds).forEach(([name, sequence]) => {
  writeFileSync(resolve(outputDirectory, `${name}.wav`), createWaveFile(sequence))
})

console.log(`Generated ${Object.keys(sounds).length} battle sounds in ${outputDirectory}`)
