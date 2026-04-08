import { describe, it, expect, beforeEach } from 'vitest'
import { useTimelineStore, ZOOM_PRESETS } from './timeline-store'

// Reset store state before each test
beforeEach(() => {
  useTimelineStore.setState({
    playheadPosition: 0,
    playbackState: 'stopped',
    playbackRate: 1,
    pixelsPerSecond: ZOOM_PRESETS.DEFAULT,
    scrollX: 0,
    scrollY: 0,
    viewportWidth: 0,
    viewportHeight: 0,
    trackHeight: 80,
    trackHeights: {},
    loopEnabled: false,
    loopStart: 0,
    loopEnd: 0,
    isScrubbing: false,
    scrubPosition: null,
    expandedTracks: new Set<string>(),
  })
})

describe('TimelineStore — initial state', () => {
  it('has correct default pixelsPerSecond', () => {
    expect(useTimelineStore.getState().pixelsPerSecond).toBe(50)
  })

  it('has correct default playbackState', () => {
    expect(useTimelineStore.getState().playbackState).toBe('stopped')
  })

  it('has correct default playheadPosition', () => {
    expect(useTimelineStore.getState().playheadPosition).toBe(0)
  })

  it('has correct default playbackRate', () => {
    expect(useTimelineStore.getState().playbackRate).toBe(1)
  })

  it('has correct default scrollX and scrollY', () => {
    const state = useTimelineStore.getState()
    expect(state.scrollX).toBe(0)
    expect(state.scrollY).toBe(0)
  })

  it('has correct default trackHeight', () => {
    expect(useTimelineStore.getState().trackHeight).toBe(80)
  })

  it('starts with empty expandedTracks', () => {
    expect(useTimelineStore.getState().expandedTracks.size).toBe(0)
  })

  it('starts with loopEnabled false', () => {
    expect(useTimelineStore.getState().loopEnabled).toBe(false)
  })

  it('starts with isScrubbing false', () => {
    expect(useTimelineStore.getState().isScrubbing).toBe(false)
  })
})

describe('TimelineStore — zoom', () => {
  it('zoomIn() multiplies pixelsPerSecond by 1.5', () => {
    useTimelineStore.getState().zoomIn()
    expect(useTimelineStore.getState().pixelsPerSecond).toBeCloseTo(75)
  })

  it('zoomOut() divides pixelsPerSecond by 1.5', () => {
    useTimelineStore.getState().zoomOut()
    expect(useTimelineStore.getState().pixelsPerSecond).toBeCloseTo(50 / 1.5)
  })

  it('zoomIn() clamps at ZOOM_PRESETS.MAX', () => {
    useTimelineStore.setState({ pixelsPerSecond: ZOOM_PRESETS.MAX })
    useTimelineStore.getState().zoomIn()
    expect(useTimelineStore.getState().pixelsPerSecond).toBe(ZOOM_PRESETS.MAX)
  })

  it('zoomOut() clamps at ZOOM_PRESETS.MIN', () => {
    useTimelineStore.setState({ pixelsPerSecond: ZOOM_PRESETS.MIN })
    useTimelineStore.getState().zoomOut()
    expect(useTimelineStore.getState().pixelsPerSecond).toBe(ZOOM_PRESETS.MIN)
  })

  it('setZoom() clamps to [MIN, MAX]', () => {
    useTimelineStore.getState().setZoom(9999)
    expect(useTimelineStore.getState().pixelsPerSecond).toBe(ZOOM_PRESETS.MAX)
    useTimelineStore.getState().setZoom(0)
    expect(useTimelineStore.getState().pixelsPerSecond).toBe(ZOOM_PRESETS.MIN)
  })

  it('resetZoom() restores DEFAULT and resets scrollX', () => {
    useTimelineStore.setState({ pixelsPerSecond: 200, scrollX: 500 })
    useTimelineStore.getState().resetZoom()
    expect(useTimelineStore.getState().pixelsPerSecond).toBe(ZOOM_PRESETS.DEFAULT)
    expect(useTimelineStore.getState().scrollX).toBe(0)
  })
})

describe('TimelineStore — coordinate utilities', () => {
  it('timeToPixels(10) returns 10 * pixelsPerSecond', () => {
    // pixelsPerSecond defaults to 50
    const result = useTimelineStore.getState().timeToPixels(10)
    expect(result).toBe(10 * 50)
  })

  it('pixelsToTime(500) returns 500 / pixelsPerSecond', () => {
    const result = useTimelineStore.getState().pixelsToTime(500)
    expect(result).toBe(500 / 50)
  })

  it('timeToPixels and pixelsToTime are inverses', () => {
    const time = 42.7
    const pixels = useTimelineStore.getState().timeToPixels(time)
    expect(useTimelineStore.getState().pixelsToTime(pixels)).toBeCloseTo(time)
  })
})

describe('TimelineStore — getVisibleTimeRange()', () => {
  it('returns correct range given scrollX and viewportWidth', () => {
    useTimelineStore.setState({ scrollX: 100, viewportWidth: 800, pixelsPerSecond: 50 })
    const range = useTimelineStore.getState().getVisibleTimeRange()
    expect(range.start).toBeCloseTo(100 / 50)
    expect(range.end).toBeCloseTo((100 + 800) / 50)
  })

  it('returns 0-based range when scrollX is 0', () => {
    useTimelineStore.setState({ scrollX: 0, viewportWidth: 1000, pixelsPerSecond: 50 })
    const range = useTimelineStore.getState().getVisibleTimeRange()
    expect(range.start).toBe(0)
    expect(range.end).toBe(20)
  })

  it('updates correctly after scrolling', () => {
    useTimelineStore.setState({ pixelsPerSecond: 100, viewportWidth: 500 })
    useTimelineStore.getState().setScrollX(200)
    const range = useTimelineStore.getState().getVisibleTimeRange()
    expect(range.start).toBeCloseTo(2)
    expect(range.end).toBeCloseTo(7)
  })
})

describe('TimelineStore — toggleTrackExpanded()', () => {
  it('adds track to set when not expanded', () => {
    useTimelineStore.getState().toggleTrackExpanded('track-1')
    expect(useTimelineStore.getState().expandedTracks.has('track-1')).toBe(true)
  })

  it('removes track from set when already expanded', () => {
    useTimelineStore.getState().toggleTrackExpanded('track-1')
    useTimelineStore.getState().toggleTrackExpanded('track-1')
    expect(useTimelineStore.getState().expandedTracks.has('track-1')).toBe(false)
  })

  it('toggles independently for multiple tracks', () => {
    useTimelineStore.getState().toggleTrackExpanded('track-1')
    useTimelineStore.getState().toggleTrackExpanded('track-2')
    useTimelineStore.getState().toggleTrackExpanded('track-1')
    const { expandedTracks } = useTimelineStore.getState()
    expect(expandedTracks.has('track-1')).toBe(false)
    expect(expandedTracks.has('track-2')).toBe(true)
  })

  it('isTrackExpanded() reflects toggle state', () => {
    expect(useTimelineStore.getState().isTrackExpanded('track-x')).toBe(false)
    useTimelineStore.getState().toggleTrackExpanded('track-x')
    expect(useTimelineStore.getState().isTrackExpanded('track-x')).toBe(true)
  })

  it('setTrackExpanded() sets explicit state', () => {
    useTimelineStore.getState().setTrackExpanded('track-y', true)
    expect(useTimelineStore.getState().isTrackExpanded('track-y')).toBe(true)
    useTimelineStore.getState().setTrackExpanded('track-y', false)
    expect(useTimelineStore.getState().isTrackExpanded('track-y')).toBe(false)
  })
})

describe('TimelineStore — playback', () => {
  it('play() sets playbackState to playing', () => {
    useTimelineStore.getState().play()
    expect(useTimelineStore.getState().playbackState).toBe('playing')
  })

  it('pause() sets playbackState to paused', () => {
    useTimelineStore.getState().play()
    useTimelineStore.getState().pause()
    expect(useTimelineStore.getState().playbackState).toBe('paused')
  })

  it('stop() resets position and sets stopped', () => {
    useTimelineStore.setState({ playheadPosition: 30 })
    useTimelineStore.getState().stop()
    expect(useTimelineStore.getState().playbackState).toBe('stopped')
    expect(useTimelineStore.getState().playheadPosition).toBe(0)
  })

  it('togglePlayback() plays when stopped', () => {
    useTimelineStore.getState().togglePlayback()
    expect(useTimelineStore.getState().playbackState).toBe('playing')
  })

  it('togglePlayback() pauses when playing', () => {
    useTimelineStore.getState().play()
    useTimelineStore.getState().togglePlayback()
    expect(useTimelineStore.getState().playbackState).toBe('paused')
  })

  it('setPlaybackRate() clamps to [0.1, 4.0]', () => {
    useTimelineStore.getState().setPlaybackRate(0)
    expect(useTimelineStore.getState().playbackRate).toBe(0.1)
    useTimelineStore.getState().setPlaybackRate(10)
    expect(useTimelineStore.getState().playbackRate).toBe(4.0)
    useTimelineStore.getState().setPlaybackRate(2)
    expect(useTimelineStore.getState().playbackRate).toBe(2)
  })
})

describe('TimelineStore — scrubbing', () => {
  it('startScrubbing() sets isScrubbing and scrubPosition', () => {
    useTimelineStore.getState().startScrubbing(15)
    expect(useTimelineStore.getState().isScrubbing).toBe(true)
    expect(useTimelineStore.getState().scrubPosition).toBe(15)
  })

  it('updateScrubPosition() updates scrubPosition', () => {
    useTimelineStore.getState().startScrubbing(5)
    useTimelineStore.getState().updateScrubPosition(20)
    expect(useTimelineStore.getState().scrubPosition).toBe(20)
  })

  it('endScrubbing() commits scrubPosition to playheadPosition', () => {
    useTimelineStore.getState().startScrubbing(25)
    useTimelineStore.getState().endScrubbing()
    expect(useTimelineStore.getState().isScrubbing).toBe(false)
    expect(useTimelineStore.getState().scrubPosition).toBeNull()
    expect(useTimelineStore.getState().playheadPosition).toBe(25)
  })
})

describe('TimelineStore — track heights', () => {
  it('setTrackHeight() clamps to [40, 200]', () => {
    useTimelineStore.getState().setTrackHeight(10)
    expect(useTimelineStore.getState().trackHeight).toBe(40)
    useTimelineStore.getState().setTrackHeight(9999)
    expect(useTimelineStore.getState().trackHeight).toBe(200)
    useTimelineStore.getState().setTrackHeight(100)
    expect(useTimelineStore.getState().trackHeight).toBe(100)
  })

  it('setTrackHeightById() stores per-track height', () => {
    useTimelineStore.getState().setTrackHeightById('t1', 120)
    expect(useTimelineStore.getState().trackHeights['t1']).toBe(120)
  })

  it('getTrackHeight() falls back to global trackHeight', () => {
    useTimelineStore.setState({ trackHeight: 80 })
    expect(useTimelineStore.getState().getTrackHeight('nonexistent')).toBe(80)
  })

  it('getTrackHeight() returns per-track height when set', () => {
    useTimelineStore.getState().setTrackHeightById('t2', 150)
    expect(useTimelineStore.getState().getTrackHeight('t2')).toBe(150)
  })
})

describe('TimelineStore — loop', () => {
  it('setLoopEnabled() toggles loop', () => {
    useTimelineStore.getState().setLoopEnabled(true)
    expect(useTimelineStore.getState().loopEnabled).toBe(true)
  })

  it('setLoopRange() sets start and end', () => {
    useTimelineStore.getState().setLoopRange(5, 15)
    expect(useTimelineStore.getState().loopStart).toBe(5)
    expect(useTimelineStore.getState().loopEnd).toBe(15)
  })
})

describe('TimelineStore — zoomToFit()', () => {
  it('calculates pps from viewportWidth and duration', () => {
    useTimelineStore.setState({ viewportWidth: 1100 })
    useTimelineStore.getState().zoomToFit(10) // (1100-100)/10 = 100
    expect(useTimelineStore.getState().pixelsPerSecond).toBe(100)
    expect(useTimelineStore.getState().scrollX).toBe(0)
  })

  it('clamps zoom to MAX when duration is very short', () => {
    useTimelineStore.setState({ viewportWidth: 5100 })
    useTimelineStore.getState().zoomToFit(1) // (5100-100)/1 = 5000, clamps to 500
    expect(useTimelineStore.getState().pixelsPerSecond).toBe(ZOOM_PRESETS.MAX)
  })

  it('clamps zoom to MIN when duration is very long', () => {
    useTimelineStore.setState({ viewportWidth: 110 })
    useTimelineStore.getState().zoomToFit(100) // (110-100)/100 = 0.1, clamps to 10
    expect(useTimelineStore.getState().pixelsPerSecond).toBe(ZOOM_PRESETS.MIN)
  })
})
