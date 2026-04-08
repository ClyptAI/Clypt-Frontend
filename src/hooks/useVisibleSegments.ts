import { useMemo } from 'react'

export interface TimeSegment {
  id: string
  startTime: number   // seconds
  endTime: number     // seconds
  [key: string]: unknown
}

export interface UseVisibleSegmentsOptions {
  /** How many seconds to render beyond the viewport edges. Default: 10 */
  overscanSeconds?: number
}

export interface UseVisibleSegmentsResult<T extends TimeSegment> {
  visibleSegments: T[]
  totalCount: number
  visibleCount: number
  /** Width in px of all content before the first visible segment (for flow layouts) */
  leadingSpacerPx: number
  /** Width in px of all content after the last visible segment (for flow layouts) */
  trailingSpacerPx: number
}

export function useVisibleSegments<T extends TimeSegment>(
  segments: T[],
  pixelsPerSecond: number,
  scrollX: number,
  viewportWidth: number,
  options: UseVisibleSegmentsOptions = {}
): UseVisibleSegmentsResult<T> {
  const { overscanSeconds = 10 } = options

  return useMemo(() => {
    if (segments.length === 0 || pixelsPerSecond <= 0 || viewportWidth <= 0) {
      return {
        visibleSegments: segments,
        totalCount: segments.length,
        visibleCount: segments.length,
        leadingSpacerPx: 0,
        trailingSpacerPx: 0,
      }
    }

    // Convert viewport pixel bounds to time bounds with overscan
    const visibleStartTime = Math.max(0, (scrollX / pixelsPerSecond) - overscanSeconds)
    const visibleEndTime = (scrollX + viewportWidth) / pixelsPerSecond + overscanSeconds

    // Segments assumed sorted by startTime
    const visible = segments.filter(
      seg => seg.endTime > visibleStartTime && seg.startTime < visibleEndTime
    )

    // Leading spacer: pixel offset up to the first visible segment's start
    const firstVisibleStart = visible.length > 0 ? visible[0].startTime : 0
    const leadingSpacerPx = firstVisibleStart * pixelsPerSecond

    // Trailing spacer: pixel width from last visible segment's end to content end
    const lastSeg = segments[segments.length - 1]
    const lastVisibleEnd = visible.length > 0 ? visible[visible.length - 1].endTime : 0
    const trailingSpacerPx = Math.max(0, (lastSeg?.endTime ?? 0) - lastVisibleEnd) * pixelsPerSecond

    return {
      visibleSegments: visible,
      totalCount: segments.length,
      visibleCount: visible.length,
      leadingSpacerPx,
      trailingSpacerPx,
    }
  }, [segments, pixelsPerSecond, scrollX, viewportWidth, overscanSeconds])
}
