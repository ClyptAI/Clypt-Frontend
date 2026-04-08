import { useEffect, useCallback } from 'react'
import { useTimelineStore } from '@/stores/timeline-store'

export interface UseTimelineKeyboardOptions {
  /** Disable shortcuts when focus is inside an input/textarea/contenteditable */
  ignoreWhenInputFocused?: boolean
  /** Seek step in seconds for arrow keys (default: 5) */
  seekStep?: number
  /** Whether the shortcuts are active (default: true) */
  enabled?: boolean
}

export function useTimelineKeyboard({
  ignoreWhenInputFocused = true,
  seekStep = 5,
  enabled = true,
}: UseTimelineKeyboardOptions = {}): void {
  const play = useTimelineStore(s => s.play)
  const pause = useTimelineStore(s => s.pause)
  const playbackState = useTimelineStore(s => s.playbackState)
  const seekTo = useTimelineStore(s => s.seekTo)
  const playheadPosition = useTimelineStore(s => s.playheadPosition)
  const zoomIn = useTimelineStore(s => s.zoomIn)
  const zoomOut = useTimelineStore(s => s.zoomOut)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return

    if (ignoreWhenInputFocused) {
      const target = e.target as HTMLElement
      const tag = target.tagName?.toLowerCase() ?? ''
      if (tag === 'input' || tag === 'textarea' || target.isContentEditable) return
    }

    const isPlaying = playbackState === 'playing'

    switch (e.key) {
      case ' ':
      case 'k':
      case 'K':
        e.preventDefault()
        isPlaying ? pause() : play()
        break
      case 'j':
      case 'J':
      case 'ArrowLeft':
        e.preventDefault()
        seekTo(Math.max(0, playheadPosition - (e.shiftKey ? seekStep * 5 : seekStep)))
        break
      case 'l':
      case 'L':
      case 'ArrowRight':
        e.preventDefault()
        seekTo(playheadPosition + (e.shiftKey ? seekStep * 5 : seekStep))
        break
      case '0':
      case 'Home':
        e.preventDefault()
        seekTo(0)
        break
      case '+':
      case '=':
      case ']':
        e.preventDefault()
        zoomIn()
        break
      case '-':
      case '[':
        e.preventDefault()
        zoomOut()
        break
    }
  }, [enabled, ignoreWhenInputFocused, playbackState, seekTo, playheadPosition, play, pause, zoomIn, zoomOut, seekStep])

  useEffect(() => {
    if (!enabled) return
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, handleKeyDown])
}
