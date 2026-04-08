import { useState, useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRunStore } from '@/stores/run-store'
import { runKeys } from '@/hooks/api/useRuns'
import type { PhaseStatusEntry } from '@/types/clypt'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export type SSEConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface SSEEvent {
  type: 'phase_update' | 'run_complete' | 'run_failed' | 'heartbeat'
  payload?: PhaseStatusEntry
}

export interface UseRunSSEOptions {
  /** Only connect when the run has active phases (default: true) */
  autoConnect?: boolean
  /** Reconnect delay in ms (default: 3000) */
  reconnectDelay?: number
  /** Max reconnect attempts (default: 5) */
  maxReconnects?: number
}

export function useRunSSE(
  runId: string | null,
  {
    autoConnect = true,
    reconnectDelay = 3000,
    maxReconnects = 5,
  }: UseRunSSEOptions = {}
): { connectionState: SSEConnectionState; disconnect: () => void } {
  const [connectionState, setConnectionState] = useState<SSEConnectionState>('disconnected')
  const esRef = useRef<EventSource | null>(null)
  const reconnectCount = useRef(0)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const qc = useQueryClient()
  const updatePhaseStatus = useRunStore(s => s.updatePhaseStatus)

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    esRef.current?.close()
    esRef.current = null
    setConnectionState('disconnected')
  }, [])

  const connect = useCallback(() => {
    if (!runId || !autoConnect) return
    disconnect()

    setConnectionState('connecting')
    const es = new EventSource(`${BASE_URL}/v1/runs/${runId}/events`)
    esRef.current = es

    es.onopen = () => {
      setConnectionState('connected')
      reconnectCount.current = 0
    }

    es.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data)

        if (data.type === 'phase_update' && data.payload) {
          updatePhaseStatus(data.payload.phase, data.payload)
          qc.invalidateQueries({ queryKey: runKeys.detail(runId) })
        }

        if (data.type === 'run_complete' || data.type === 'run_failed') {
          qc.invalidateQueries({ queryKey: runKeys.detail(runId) })
          disconnect()
        }
      } catch {
        // silently ignore malformed events
      }
    }

    es.onerror = () => {
      es.close()
      setConnectionState('error')

      if (reconnectCount.current < maxReconnects) {
        reconnectCount.current++
        reconnectTimer.current = setTimeout(connect, reconnectDelay)
      }
    }
  }, [runId, autoConnect, disconnect, updatePhaseStatus, qc, reconnectDelay, maxReconnects])

  useEffect(() => {
    if (runId && autoConnect) {
      connect()
    }
    return disconnect
  }, [runId, autoConnect, connect, disconnect])

  return { connectionState, disconnect }
}
