import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useVisibleSegments, type TimeSegment } from './useVisibleSegments'

// ─── fixture helpers ────────────────────────────────────────────────────────

const seg = (id: string, startTime: number, endTime: number): TimeSegment => ({
  id,
  startTime,
  endTime,
})

// ─── tests ──────────────────────────────────────────────────────────────────

describe('useVisibleSegments', () => {
  it('empty segments returns empty result with zero spacers', () => {
    const { result } = renderHook(() =>
      useVisibleSegments([], 60, 0, 800)
    )
    expect(result.current.visibleSegments).toEqual([])
    expect(result.current.totalCount).toBe(0)
    expect(result.current.visibleCount).toBe(0)
    expect(result.current.leadingSpacerPx).toBe(0)
    expect(result.current.trailingSpacerPx).toBe(0)
  })

  it('returns all segments when viewport is wider than content', () => {
    const segments = [
      seg('a', 0, 10),
      seg('b', 10, 20),
      seg('c', 20, 30),
    ]
    // viewportWidth 10000px >> 30s * 60pps = 1800px
    const { result } = renderHook(() =>
      useVisibleSegments(segments, 60, 0, 10000, { overscanSeconds: 0 })
    )
    expect(result.current.visibleSegments).toHaveLength(3)
    expect(result.current.visibleCount).toBe(3)
    expect(result.current.totalCount).toBe(3)
  })

  it('filters out segments before and after the visible+overscan window', () => {
    // segments at [0-5s, 10-15s, 20-25s]
    // scrollX=600, pps=60, viewportWidth=300
    // visible window (no overscan): 600/60=10s → (600+300)/60=15s
    // with overscanSeconds=0: only the 10-15s segment should be visible
    const segments = [
      seg('early', 0, 5),
      seg('mid', 10, 15),
      seg('late', 20, 25),
    ]
    const { result } = renderHook(() =>
      useVisibleSegments(segments, 60, 600, 300, { overscanSeconds: 0 })
    )
    expect(result.current.visibleSegments).toHaveLength(1)
    expect(result.current.visibleSegments[0].id).toBe('mid')
  })

  it('leadingSpacerPx equals firstVisible.startTime * pixelsPerSecond', () => {
    const segments = [
      seg('a', 0, 5),
      seg('b', 10, 15),
      seg('c', 20, 25),
    ]
    // scroll to show only 'b' (no overscan)
    const pps = 60
    const { result } = renderHook(() =>
      useVisibleSegments(segments, pps, 600, 300, { overscanSeconds: 0 })
    )
    // first visible is 'b' at startTime=10
    expect(result.current.leadingSpacerPx).toBe(10 * pps) // 600
  })

  it('trailingSpacerPx equals (lastSeg.endTime - lastVisible.endTime) * pps', () => {
    const segments = [
      seg('a', 0, 5),
      seg('b', 10, 15),
      seg('c', 20, 25),
    ]
    const pps = 60
    const { result } = renderHook(() =>
      useVisibleSegments(segments, pps, 600, 300, { overscanSeconds: 0 })
    )
    // last seg endTime=25, last visible 'b' endTime=15 → (25-15)*60 = 600
    expect(result.current.trailingSpacerPx).toBe((25 - 15) * pps) // 600
  })

  it('overscan includes segments just outside the viewport', () => {
    const segments = [
      seg('before', 0, 5),   // ends at 5s, visible window starts at 10s
      seg('mid', 10, 15),
      seg('after', 19, 24),  // starts at 19s, visible window ends at 15s
    ]
    // scrollX=600, pps=60, viewportWidth=300 → [10s, 15s] raw, +5s overscan → [5s, 20s]
    const { result } = renderHook(() =>
      useVisibleSegments(segments, 60, 600, 300, { overscanSeconds: 5 })
    )
    // 'before' ends at 5s which equals visibleStartTime (10-5=5) → endTime > visibleStartTime is false (5 > 5 is false)
    // 'after' starts at 19s < 20s (visibleEndTime) → included
    expect(result.current.visibleSegments.map(s => s.id)).toContain('after')
    expect(result.current.visibleSegments.map(s => s.id)).toContain('mid')
  })

  it('overscanSeconds=0 excludes segments just outside the raw viewport', () => {
    const segments = [
      seg('just-before', 8, 10),  // ends exactly at viewport start (10s)
      seg('mid', 10, 15),
      seg('just-after', 15, 17),  // starts exactly at viewport end (15s)
    ]
    // scrollX=600, pps=60, viewportWidth=300 → [10s, 15s] raw
    // endTime > 10 → 'just-before' (endTime=10) is NOT > 10, excluded
    // startTime < 15 → 'just-after' (startTime=15) is NOT < 15, excluded
    const { result } = renderHook(() =>
      useVisibleSegments(segments, 60, 600, 300, { overscanSeconds: 0 })
    )
    const ids = result.current.visibleSegments.map(s => s.id)
    expect(ids).not.toContain('just-before')
    expect(ids).not.toContain('just-after')
    expect(ids).toContain('mid')
  })

  it('returns stable visibleSegments reference when inputs are unchanged (memoization)', () => {
    const segments = [
      seg('a', 0, 10),
      seg('b', 50, 60),
    ]
    const { result, rerender } = renderHook(() =>
      useVisibleSegments(segments, 60, 0, 1000)
    )
    const firstRef = result.current.visibleSegments
    rerender()
    // Same deps → useMemo should return same array reference
    expect(result.current.visibleSegments).toBe(firstRef)
  })

  it('works with generic type extensions — extra fields pass through correctly', () => {
    interface SpeakerTurn extends TimeSegment {
      transcript: string
      speakerId: number
    }
    const turns: SpeakerTurn[] = [
      { id: 't1', startTime: 0, endTime: 5, transcript: 'Hello world', speakerId: 0 },
      { id: 't2', startTime: 100, endTime: 110, transcript: 'Far away', speakerId: 1 },
    ]
    const { result } = renderHook(() =>
      useVisibleSegments(turns, 60, 0, 600, { overscanSeconds: 0 })
    )
    // Only 't1' falls within [0s, 10s] raw window
    expect(result.current.visibleSegments).toHaveLength(1)
    const visible = result.current.visibleSegments[0]
    expect(visible.transcript).toBe('Hello world')
    expect(visible.speakerId).toBe(0)
  })

  it('returns zero spacers when all segments are visible', () => {
    const segments = [
      seg('a', 0, 5),
      seg('b', 5, 10),
    ]
    const { result } = renderHook(() =>
      useVisibleSegments(segments, 60, 0, 10000, { overscanSeconds: 0 })
    )
    expect(result.current.leadingSpacerPx).toBe(0)
    expect(result.current.trailingSpacerPx).toBe(0)
  })
})
