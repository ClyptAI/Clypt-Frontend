/// <reference types="@types/youtube" />
import { useEffect, useRef, useCallback } from 'react'
import { useTimelineStore } from '@/stores/timeline-store'

declare global {
  interface Window {
    YT: typeof YT
    onYouTubeIframeAPIReady: () => void
  }
}

export interface VideoPlayerProps {
  /** YouTube URL or a local/CDN path e.g. /videos/clip.mp4 */
  videoUrl: string
  className?: string
}

function extractYouTubeId(url: string): string | null {
  const match =
    url.match(/[?&]v=([^&]+)/) ??
    url.match(/youtu\.be\/([^?]+)/) ??
    url.match(/shorts\/([^?]+)/)
  return match?.[1] ?? null
}

function isLocalOrDirectVideo(url: string): boolean {
  return (
    url.startsWith('/') ||
    url.startsWith('./') ||
    url.startsWith('blob:') ||
    /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)
  )
}

// ─── YT API singleton loader ────────────────────────────────────────────────

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

// ─── Native <video> player ───────────────────────────────────────────────────

function NativeVideoPlayer({ videoUrl, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const lastSeekRef = useRef<number>(0)
  const suppressStoreSeekRef = useRef(false)

  const playheadPosition = useTimelineStore(s => s.playheadPosition)
  const playbackState = useTimelineStore(s => s.playbackState)
  const seekTo = useTimelineStore(s => s.seekTo)
  const play = useTimelineStore(s => s.play)
  const pause = useTimelineStore(s => s.pause)

  // Player events → store
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const onPlay = () => play()
    const onPause = () => pause()
    const onTimeUpdate = () => {
      const t = v.currentTime
      lastSeekRef.current = t
      suppressStoreSeekRef.current = true
      seekTo(t)
      // Allow store seek → player after a brief tick
      setTimeout(() => { suppressStoreSeekRef.current = false }, 50)
    }

    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('ended', onPause)
    v.addEventListener('timeupdate', onTimeUpdate)
    return () => {
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('ended', onPause)
      v.removeEventListener('timeupdate', onTimeUpdate)
    }
  }, [play, pause, seekTo])

  // Store playback state → player
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (playbackState === 'playing') v.play().catch(() => {})
    else v.pause()
  }, [playbackState])

  // Store seek → player (only explicit seeks, not timeupdate echoes)
  useEffect(() => {
    const v = videoRef.current
    if (!v || suppressStoreSeekRef.current) return
    const delta = Math.abs(playheadPosition - lastSeekRef.current)
    if (delta > 1.0) {
      v.currentTime = playheadPosition
      lastSeekRef.current = playheadPosition
    }
  }, [playheadPosition])

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      className={className}
      style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
      preload="metadata"
    />
  )
}

// ─── YouTube iframe player ───────────────────────────────────────────────────

function YouTubePlayer({ videoUrl, className }: VideoPlayerProps) {
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

  const videoId = extractYouTubeId(videoUrl)

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
              play(); startPoll()
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              pause(); stopPoll()
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

  useEffect(() => {
    if (!isPlayerReady.current || !playerRef.current) return
    if (playbackState === 'playing') { playerRef.current.playVideo?.(); startPoll() }
    else { playerRef.current.pauseVideo?.(); stopPoll() }
  }, [playbackState, startPoll, stopPoll])

  useEffect(() => {
    if (!isPlayerReady.current || !playerRef.current) return
    const delta = Math.abs(playheadPosition - lastSeekRef.current)
    if (delta > 1.5) {
      playerRef.current.seekTo?.(playheadPosition, true)
      lastSeekRef.current = playheadPosition
    }
  }, [playheadPosition])

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%' }} />
}

// ─── Public component — auto-detects URL type ────────────────────────────────

export function VideoPlayer({ videoUrl, className }: VideoPlayerProps) {
  if (!videoUrl) {
    return (
      <div
        className={className}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}
      >
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          No video
        </span>
      </div>
    )
  }

  if (isLocalOrDirectVideo(videoUrl)) {
    return <NativeVideoPlayer videoUrl={videoUrl} className={className} />
  }

  return <YouTubePlayer videoUrl={videoUrl} className={className} />
}
