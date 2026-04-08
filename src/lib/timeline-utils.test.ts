import { describe, it, expect } from 'vitest'
import {
  formatTimecode,
  generateWaveformPath,
  calculateSnap,
} from './timeline-utils'
import type { SnapTrack, SnapSettings } from './timeline-utils'

describe('formatTimecode', () => {
  it('returns 00:00:00:00 for 0', () => {
    expect(formatTimecode(0)).toBe('00:00:00:00')
  })

  it('formats 90.5 seconds correctly at 30fps', () => {
    // 90.5s = 1min 30sec 0.5*30=15 frames
    expect(formatTimecode(90.5)).toBe('00:01:30:15')
  })

  it('returns 00:00:00:00 for NaN', () => {
    expect(formatTimecode(NaN)).toBe('00:00:00:00')
  })

  it('returns 00:00:00:00 for negative values', () => {
    expect(formatTimecode(-1)).toBe('00:00:00:00')
  })
})

describe('generateWaveformPath', () => {
  it('returns flat line fallback for empty array', () => {
    expect(generateWaveformPath([], 100)).toBe('M0,20 L100,20')
  })

  it('produces correct y values for flat 0.5 amplitude', () => {
    const data = new Array(100).fill(0.5)
    const path = generateWaveformPath(data, 5)
    // y = 20 - 0.5 * 18 = 11
    expect(path).toBe('M0,11 L1,11 L2,11 L3,11 L4,11')
  })
})

describe('calculateSnap', () => {
  const baseSettings: SnapSettings = {
    enabled: true,
    snapToClips: true,
    snapToPlayhead: true,
    snapToGrid: true,
    snapThreshold: 10,
    gridSize: 1,
  }

  const tracks: SnapTrack[] = [
    {
      id: 'track-1',
      clips: [
        { id: 'clip-2', startTime: 5.0, duration: 3.0 },
        { id: 'clip-3', startTime: 10.0, duration: 2.0 },
      ],
    },
  ]

  it('returns raw time unchanged when snap disabled', () => {
    const result = calculateSnap(
      3.7,
      'clip-1',
      tracks,
      2.0,
      { ...baseSettings, enabled: false },
      100,
    )
    expect(result.snapped).toBe(false)
    expect(result.time).toBe(3.7)
  })

  it('snaps to nearby clip start', () => {
    // rawTime 5.05 is 0.05s from clip-2 startTime 5.0, threshold=10px/100pps=0.1s
    const result = calculateSnap(5.05, 'clip-1', tracks, 0, baseSettings, 100)
    expect(result.snapped).toBe(true)
    expect(result.time).toBe(5.0)
    expect(result.snapPoint?.type).toBe('clip-start')
  })

  it('clip-start/end snaps take priority over playhead', () => {
    // rawTime 5.03 is close to both clip start (5.0) and playhead (5.05)
    // clip-start has priority 0, playhead priority 1
    const result = calculateSnap(
      5.03,
      'clip-1',
      tracks,
      5.05, // playhead very close
      { ...baseSettings, snapToGrid: false },
      100,
    )
    expect(result.snapped).toBe(true)
    expect(result.snapPoint?.type).toBe('clip-start')
    expect(result.time).toBe(5.0)
  })
})
