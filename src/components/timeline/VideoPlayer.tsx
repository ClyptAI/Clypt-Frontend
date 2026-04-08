/// <reference types="@types/youtube" />
'use client'
import { useEffect, useRef, useCallback } from 'react'
import { useTimelineStore } from '@/stores/timeline-store'

declare global {
  interface Window {
    YT: typeof YT
    onYouTubeIframeAPIReady: () => void
  }
}

export interface VideoPlayerProps {
  /** Full YouTube URL, e.g. https://www.youtube.com/watch?v=abc */
  videoUrl: string
  className?: string
}

function extractVideoId(url: string): string | null {
  const match =
    url.match(/[?&]v=([^&]+)/) ??
    url.match(/youtu\.be\/([^?]+)/) ??
    url.match(/shorts\/([^?]+)/)
  return match?.[1] ?? null
}

// ─── YT API singleton loader ───────────────────────────────────────────────

let ytApiLoaded = false
let ytApiReady = false
const ytApiReadyCallbacks: Array<() => void> = []

function loadYTApi(onReady: () => void) {
  if (ytApiReady) { onReady(); return }
  ytApiReadyCallbacks.push(onReady)
  if (ytApiLoaded) return
  ytApiLoaded = true
  const script = document.createElement('script')
  script.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(script)
  window.onYouTubeIframeAPIReady = () => {
    ytApiReady = true
    ytApiReadyCallbacks.forEach(cb => cb())
    ytApiReadyCallbacks.length = 0
  }
}

// ─── Component ────────────────────────────────────────────────────────────

export function VideoPlayer({ videoUrl, className }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YT.Player | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastSeekRef = useRef<number>(0)
  const isPlayerReady = useRef(false)

  const playheadPosition = useTimelineStore(s => s.playheadPosition)
  const playbackState = useTimelineStore(s => s.playbackState)
  const seekTo = useTimelineStore(s => s.seekTo)
  const play = useTimelineStore(s => s.play)
  const pause = useTimelineStore(s => s.pause)

  const videoId = extractVideoId(videoUrl)

  const stopPoll = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }, [])

  const startPoll = useCallback(() => {
    stopPoll()
    pollRef.current = setInterval(() => {
      if (playerRef.current && isPlayerReady.current) {
        const t = playerRef.current.getCurrentTime?.()
        if (typeof t === 'number') {
          lastSeekRef.current = t
          seekTo(t)
        }
      }
    }, 250)
  }, [seekTo, stopPoll])

  // Init player
  useEffect(() => {
    if (!videoId || !containerRef.current) return
    loadYTApi(() => {
      if (!containerRef.current) return
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: { autoplay: 0, controls: 1, modestbranding: 1, rel: 0, enablejsapi: 1 },
        events: {
          onReady: () => { isPlayerReady.current = true },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              play()
              startPoll()
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              pause()
              stopPoll()
            }
          },
        },
      })
    })
    return () => {
      stopPoll()
      playerRef.current?.destroy()
      playerRef.current = null
      isPlayerReady.current = false
    }
  }, [videoId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Store playback state → player
  useEffect(() => {
    if (!isPlayerReady.current || !playerRef.current) return
    if (playbackState === 'playing') {
      playerRef.current.playVideo?.()
      startPoll()
    } else {
      playerRef.current.pauseVideo?.()
      stopPoll()
    }
  }, [playbackState, startPoll, stopPoll])

  // Store seek → player (only on explicit seeks, not polling ticks)
  useEffect(() => {
    if (!isPlayerReady.current || !playerRef.current) return
    const delta = Math.abs(playheadPosition - lastSeekRef.current)
    if (delta > 1.5) {
      playerRef.current.seekTo?.(playheadPosition, true)
      lastSeekRef.current = playheadPosition
    }
  }, [playheadPosition])

  if (!videoId) {
    return (
      <div
        className={className}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}
      >
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          Video Player
        </span>
      </div>
    )
  }

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%' }} />
}
