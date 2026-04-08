export interface SnapTrack {
  id: string
  clips: Array<{ id: string; startTime: number; duration: number }>
}

export type SnapPointType = 'clip-start' | 'clip-end' | 'playhead' | 'grid'

export interface SnapPoint {
  time: number
  type: SnapPointType
}

export interface SnapSettings {
  enabled: boolean
  snapToClips: boolean
  snapToPlayhead: boolean
  snapToGrid: boolean
  snapThreshold: number // pixels
  gridSize: number // seconds
}

export interface SnapResult {
  time: number
  snapped: boolean
  snapPoint?: SnapPoint
}

export function formatTimecode(timeInSeconds: number, frameRate = 30): string {
  if (!isFinite(timeInSeconds) || isNaN(timeInSeconds) || timeInSeconds < 0) {
    return '00:00:00:00'
  }

  const hours = Math.floor(timeInSeconds / 3600)
  const minutes = Math.floor((timeInSeconds % 3600) / 60)
  const seconds = Math.floor(timeInSeconds % 60)
  const frames = Math.floor((timeInSeconds % 1) * frameRate)

  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`
}

export function generateWaveformPath(
  waveformData: Float32Array | number[],
  width: number,
): string {
  const samples = waveformData instanceof Float32Array ? waveformData : waveformData
  if (!samples || samples.length === 0) {
    return 'M0,20 L100,20'
  }

  const step = Math.max(1, Math.floor(samples.length / width))
  const parts: string[] = []

  for (let i = 0; i < width; i++) {
    const sampleIndex = Math.min(i * step, samples.length - 1)
    const value = Math.abs(samples[sampleIndex] || 0)
    const y = 20 - value * 18
    parts.push(`${i === 0 ? 'M' : 'L'}${i},${y}`)
  }

  return parts.join(' ')
}

const SNAP_PRIORITY: Record<SnapPointType, number> = {
  'clip-start': 0,
  'clip-end': 0,
  playhead: 1,
  grid: 2,
}

export function calculateSnap(
  rawTime: number,
  clipId: string,
  tracks: SnapTrack[],
  playheadPosition: number,
  snapSettings: SnapSettings,
  pixelsPerSecond: number,
  clipDuration?: number,
): SnapResult {
  if (!snapSettings.enabled) {
    return { time: rawTime, snapped: false }
  }

  const { snapToClips, snapToPlayhead, snapToGrid, snapThreshold, gridSize } = snapSettings
  const thresholdSeconds = snapThreshold / pixelsPerSecond

  const snapPoints: SnapPoint[] = []

  if (snapToClips) {
    for (const track of tracks) {
      for (const clip of track.clips) {
        if (clip.id === clipId) continue
        snapPoints.push({ time: clip.startTime, type: 'clip-start' })
        snapPoints.push({ time: clip.startTime + clip.duration, type: 'clip-end' })
      }
    }
  }

  if (snapToPlayhead) {
    snapPoints.push({ time: playheadPosition, type: 'playhead' })
  }

  if (snapToGrid) {
    const nearestGrid = Math.round(rawTime / gridSize) * gridSize
    snapPoints.push({ time: nearestGrid, type: 'grid' })
  }

  let bestSnapPoint: SnapPoint | undefined
  let bestDist = Infinity
  let snapFromEnd = false

  for (const sp of snapPoints) {
    const distStart = Math.abs(rawTime - sp.time)
    const distEnd = clipDuration !== undefined ? Math.abs(rawTime + clipDuration - sp.time) : Infinity

    const minDist = Math.min(distStart, distEnd)
    if (minDist > thresholdSeconds) continue

    const fromEnd = distEnd < distStart

    const betterPriority =
      bestSnapPoint === undefined ||
      SNAP_PRIORITY[sp.type] < SNAP_PRIORITY[bestSnapPoint.type] ||
      (SNAP_PRIORITY[sp.type] === SNAP_PRIORITY[bestSnapPoint.type] && minDist < bestDist)

    if (betterPriority) {
      bestSnapPoint = sp
      bestDist = minDist
      snapFromEnd = fromEnd
    }
  }

  if (bestSnapPoint) {
    const snappedTime = snapFromEnd
      ? bestSnapPoint.time - (clipDuration ?? 0)
      : bestSnapPoint.time
    return { time: Math.max(0, snappedTime), snapped: true, snapPoint: bestSnapPoint }
  }

  return { time: rawTime, snapped: false }
}
