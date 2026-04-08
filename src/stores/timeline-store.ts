import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export const ZOOM_PRESETS = {
  MIN: 10,
  DEFAULT: 50,
  MAX: 500,
} as const

export type ReviewPlaybackState = 'stopped' | 'playing' | 'paused'

export interface TimelineState {
  // Playback
  playheadPosition: number
  playbackState: ReviewPlaybackState
  playbackRate: number

  // Zoom / pan
  pixelsPerSecond: number
  scrollX: number
  scrollY: number
  viewportWidth: number
  viewportHeight: number

  // Track layout
  trackHeight: number
  trackHeights: Record<string, number>

  // Loop
  loopEnabled: boolean
  loopStart: number
  loopEnd: number

  // Scrubbing
  isScrubbing: boolean
  scrubPosition: number | null

  // Track expansion (for collapsible lanes)
  expandedTracks: Set<string>

  // Actions — playback
  play: () => void
  pause: () => void
  stop: () => void
  togglePlayback: () => void
  setPlaybackRate: (rate: number) => void
  setPlayheadPosition: (position: number) => void
  seekTo: (position: number) => void
  seekRelative: (delta: number) => void
  seekToStart: () => void
  seekToEnd: (duration: number) => void

  // Actions — scrubbing
  startScrubbing: (position: number) => void
  updateScrubPosition: (position: number) => void
  endScrubbing: () => void

  // Actions — zoom
  zoomIn: () => void
  zoomOut: () => void
  setZoom: (pixelsPerSecond: number) => void
  zoomToFit: (duration: number) => void
  resetZoom: () => void

  // Actions — scroll
  setScrollX: (scrollX: number) => void
  setScrollY: (scrollY: number) => void
  scrollToPlayhead: () => void

  // Actions — viewport
  setViewportDimensions: (width: number, height: number) => void

  // Actions — track heights
  setTrackHeight: (height: number) => void
  setTrackHeightById: (trackId: string, height: number) => void
  getTrackHeight: (trackId: string) => number

  // Actions — loop
  setLoopEnabled: (enabled: boolean) => void
  setLoopRange: (start: number, end: number) => void

  // Coordinate utilities
  timeToPixels: (time: number) => number
  pixelsToTime: (pixels: number) => number
  getVisibleTimeRange: () => { start: number; end: number }
  isTimeVisible: (time: number) => boolean

  // Track expansion
  toggleTrackExpanded: (trackId: string) => void
  setTrackExpanded: (trackId: string, expanded: boolean) => void
  isTrackExpanded: (trackId: string) => boolean
}

const TRACK_HEIGHT_MIN = 40
const TRACK_HEIGHT_MAX = 200
const ZOOM_STEP = 1.5

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export const useTimelineStore = create<TimelineState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state — playback
    playheadPosition: 0,
    playbackState: 'stopped',
    playbackRate: 1,

    // Initial state — zoom / pan
    pixelsPerSecond: ZOOM_PRESETS.DEFAULT,
    scrollX: 0,
    scrollY: 0,
    viewportWidth: 0,
    viewportHeight: 0,

    // Initial state — track layout
    trackHeight: 80,
    trackHeights: {},

    // Initial state — loop
    loopEnabled: false,
    loopStart: 0,
    loopEnd: 0,

    // Initial state — scrubbing
    isScrubbing: false,
    scrubPosition: null,

    // Initial state — track expansion
    expandedTracks: new Set<string>(),

    // Playback actions
    play: () => set({ playbackState: 'playing' }),
    pause: () => set({ playbackState: 'paused' }),
    stop: () => set({ playbackState: 'stopped', playheadPosition: 0 }),

    togglePlayback: () => {
      const { playbackState } = get()
      if (playbackState === 'playing') {
        set({ playbackState: 'paused' })
      } else {
        set({ playbackState: 'playing' })
      }
    },

    setPlaybackRate: (rate: number) =>
      set({ playbackRate: clamp(rate, 0.1, 4.0) }),

    setPlayheadPosition: (position: number) =>
      set({ playheadPosition: Math.max(0, position) }),

    seekTo: (position: number) =>
      set({ playheadPosition: Math.max(0, position) }),

    seekRelative: (delta: number) => {
      const { playheadPosition } = get()
      set({ playheadPosition: Math.max(0, playheadPosition + delta) })
    },

    seekToStart: () => set({ playheadPosition: 0 }),

    seekToEnd: (duration: number) => set({ playheadPosition: duration }),

    // Scrubbing actions
    startScrubbing: (position: number) =>
      set({ isScrubbing: true, scrubPosition: position }),

    updateScrubPosition: (position: number) =>
      set({ scrubPosition: position }),

    endScrubbing: () => {
      const { scrubPosition } = get()
      set({
        isScrubbing: false,
        scrubPosition: null,
        ...(scrubPosition !== null ? { playheadPosition: scrubPosition } : {}),
      })
    },

    // Zoom actions
    zoomIn: () => {
      const { pixelsPerSecond } = get()
      set({ pixelsPerSecond: clamp(pixelsPerSecond * ZOOM_STEP, ZOOM_PRESETS.MIN, ZOOM_PRESETS.MAX) })
    },

    zoomOut: () => {
      const { pixelsPerSecond } = get()
      set({ pixelsPerSecond: clamp(pixelsPerSecond / ZOOM_STEP, ZOOM_PRESETS.MIN, ZOOM_PRESETS.MAX) })
    },

    setZoom: (pixelsPerSecond: number) =>
      set({ pixelsPerSecond: clamp(pixelsPerSecond, ZOOM_PRESETS.MIN, ZOOM_PRESETS.MAX) }),

    zoomToFit: (duration: number) => {
      const { viewportWidth } = get()
      if (duration <= 0) return
      const fittedPps = (viewportWidth - 100) / duration
      set({
        pixelsPerSecond: clamp(fittedPps, ZOOM_PRESETS.MIN, ZOOM_PRESETS.MAX),
        scrollX: 0,
      })
    },

    resetZoom: () => set({ pixelsPerSecond: ZOOM_PRESETS.DEFAULT, scrollX: 0 }),

    // Scroll actions
    setScrollX: (scrollX: number) => set({ scrollX: Math.max(0, scrollX) }),
    setScrollY: (scrollY: number) => set({ scrollY: Math.max(0, scrollY) }),

    scrollToPlayhead: () => {
      const { playheadPosition, pixelsPerSecond, scrollX, viewportWidth } = get()
      const playheadPixel = playheadPosition * pixelsPerSecond
      const visibleStart = scrollX
      const visibleEnd = scrollX + viewportWidth

      if (playheadPixel < visibleStart || playheadPixel > visibleEnd) {
        const centeredScrollX = playheadPixel - viewportWidth / 2
        set({ scrollX: Math.max(0, centeredScrollX) })
      }
    },

    // Viewport actions
    setViewportDimensions: (width: number, height: number) =>
      set({ viewportWidth: width, viewportHeight: height }),

    // Track height actions
    setTrackHeight: (height: number) =>
      set({ trackHeight: clamp(height, TRACK_HEIGHT_MIN, TRACK_HEIGHT_MAX) }),

    setTrackHeightById: (trackId: string, height: number) => {
      const { trackHeights } = get()
      set({
        trackHeights: {
          ...trackHeights,
          [trackId]: clamp(height, TRACK_HEIGHT_MIN, TRACK_HEIGHT_MAX),
        },
      })
    },

    getTrackHeight: (trackId: string) => {
      const { trackHeights, trackHeight } = get()
      return trackHeights[trackId] ?? trackHeight
    },

    // Loop actions
    setLoopEnabled: (enabled: boolean) => set({ loopEnabled: enabled }),

    setLoopRange: (start: number, end: number) =>
      set({ loopStart: Math.max(0, start), loopEnd: Math.max(0, end) }),

    // Coordinate utilities
    timeToPixels: (time: number) => {
      const { pixelsPerSecond } = get()
      return time * pixelsPerSecond
    },

    pixelsToTime: (pixels: number) => {
      const { pixelsPerSecond } = get()
      return pixels / pixelsPerSecond
    },

    getVisibleTimeRange: () => {
      const { scrollX, viewportWidth, pixelsPerSecond } = get()
      return {
        start: scrollX / pixelsPerSecond,
        end: (scrollX + viewportWidth) / pixelsPerSecond,
      }
    },

    isTimeVisible: (time: number) => {
      const { scrollX, viewportWidth, pixelsPerSecond } = get()
      const pixel = time * pixelsPerSecond
      return pixel >= scrollX && pixel <= scrollX + viewportWidth
    },

    // Track expansion actions
    toggleTrackExpanded: (trackId: string) => {
      const { expandedTracks } = get()
      const next = new Set(expandedTracks)
      if (next.has(trackId)) {
        next.delete(trackId)
      } else {
        next.add(trackId)
      }
      set({ expandedTracks: next })
    },

    setTrackExpanded: (trackId: string, expanded: boolean) => {
      const { expandedTracks } = get()
      const next = new Set(expandedTracks)
      if (expanded) {
        next.add(trackId)
      } else {
        next.delete(trackId)
      }
      set({ expandedTracks: next })
    },

    isTrackExpanded: (trackId: string) => {
      const { expandedTracks } = get()
      return expandedTracks.has(trackId)
    },
  }))
)
