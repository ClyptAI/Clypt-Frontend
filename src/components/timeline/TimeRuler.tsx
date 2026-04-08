import { useCallback, useEffect, useRef, useState } from 'react'

interface TimeRulerProps {
  duration: number
  pixelsPerSecond: number
  scrollX: number
  viewportWidth: number
  onSeek: (time: number) => void
  onScrubStart?: () => void
  onScrubEnd?: () => void
}

interface TickConfig {
  minor: number
  major: number
  label: number
}

export function getTickConfig(pixelsPerSecond: number): TickConfig {
  if (pixelsPerSecond > 500) return { minor: 0.01, major: 0.1, label: 0.5 }
  if (pixelsPerSecond > 200) return { minor: 0.05, major: 0.5, label: 1 }
  if (pixelsPerSecond > 100) return { minor: 0.1, major: 1, label: 1 }
  if (pixelsPerSecond > 50)  return { minor: 0.5, major: 1, label: 5 }
  if (pixelsPerSecond > 20)  return { minor: 1, major: 5, label: 5 }
  return { minor: 5, major: 10, label: 10 }
}

export function formatRulerTime(seconds: number): string {
  const rounded = Math.round(seconds * 1000) / 1000
  const m = Math.floor(rounded / 60)
  const s = Math.floor(rounded % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function TimeRuler({
  duration,
  pixelsPerSecond,
  scrollX,
  viewportWidth,
  onSeek,
  onScrubStart,
  onScrubEnd,
}: TimeRulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null)
  const scrollXRef = useRef(scrollX)
  const isDraggingRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    scrollXRef.current = scrollX
  }, [scrollX])

  const getTimeFromEvent = useCallback((e: MouseEvent): number => {
    const container = rulerRef.current?.parentElement?.parentElement
    if (!container) return 0
    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left + scrollXRef.current
    return Math.max(0, Math.min(duration, x / pixelsPerSecond))
  }, [duration, pixelsPerSecond])

  function handleMouseDown(e: React.MouseEvent) {
    isDraggingRef.current = true
    setIsDragging(true)
    onScrubStart?.()
    const time = getTimeFromEvent(e.nativeEvent)
    onSeek(time)
  }

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!isDraggingRef.current) return
      const time = getTimeFromEvent(e)
      onSeek(time)
    }

    function handleMouseUp(e: MouseEvent) {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      setIsDragging(false)
      const time = getTimeFromEvent(e)
      onSeek(time)
      onScrubEnd?.()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [getTimeFromEvent, onSeek, onScrubEnd])

  const config = getTickConfig(pixelsPerSecond)
  const visibleStart = Math.max(0, scrollX / pixelsPerSecond)
  const visibleEnd = Math.min(duration, (scrollX + viewportWidth) / pixelsPerSecond)

  // Snap to the minor tick grid
  const startTick = Math.floor(visibleStart / config.minor) * config.minor
  const ticks: Array<{ time: number; isMajor: boolean; showLabel: boolean }> = []

  for (let t = startTick; t <= visibleEnd + config.minor; t = Math.round((t + config.minor) * 1e10) / 1e10) {
    if (t < 0 || t > duration) continue
    const isMajor = Math.abs(Math.round(t / config.major) * config.major - t) < config.minor * 0.01
    const showLabel = isMajor && Math.abs(Math.round(t / config.label) * config.label - t) < config.minor * 0.01
    ticks.push({ time: t, isMajor, showLabel })
  }

  return (
    <div
      ref={rulerRef}
      className={`h-8 border-b border-border flex items-end relative bg-surface-1 select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-pointer'
      }`}
      onMouseDown={handleMouseDown}
      style={{ width: duration * pixelsPerSecond }}
    >
      {ticks.map(({ time, isMajor, showLabel }) => {
        const left = time * pixelsPerSecond - scrollX
        return (
          <div
            key={time}
            className="absolute bottom-0 flex flex-col items-start"
            style={{ left }}
          >
            <div
              className={`w-px bg-border ${isMajor ? 'h-4' : 'h-2'}`}
            />
            {showLabel && (
              <span
                className="font-mono text-[9px] text-text-muted pl-1 whitespace-nowrap absolute bottom-4"
                style={{ left: 0 }}
              >
                {formatRulerTime(time)}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
