import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRunSSE } from './useRunSSE'
import type { PhaseStatusEntry } from '@/types/clypt'

/* ─── mock EventSource ─── */

let lastInstance: MockEventSource | null = null

class MockEventSource {
  onopen: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  close = vi.fn()
  url: string

  constructor(url: string) {
    this.url = url
    lastInstance = this
  }
}

/* ─── mocks ─── */

const mockUpdatePhaseStatus = vi.fn()
const mockInvalidateQueries = vi.fn()

// Stable object references so useCallback deps don't change between renders
const mockQc = { invalidateQueries: mockInvalidateQueries }
const mockStoreSlice = { updatePhaseStatus: mockUpdatePhaseStatus }

vi.mock('@/stores/run-store', () => ({
  useRunStore: vi.fn((selector: (s: typeof mockStoreSlice) => unknown) =>
    selector(mockStoreSlice)
  ),
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(() => mockQc),
}))

/* ─── helpers ─── */

function makePhasePayload(overrides?: Partial<PhaseStatusEntry>): PhaseStatusEntry {
  return {
    phase: 1,
    name: 'Timeline Foundation',
    status: 'running',
    elapsed_s: null,
    summary: null,
    artifact_keys: [],
    ...overrides,
  }
}

async function triggerOpen() {
  await act(async () => {
    lastInstance?.onopen?.(new Event('open'))
  })
}

async function triggerMessage(data: object) {
  await act(async () => {
    const event = new MessageEvent('message', { data: JSON.stringify(data) })
    lastInstance?.onmessage?.(event)
  })
}

async function triggerError() {
  await act(async () => {
    lastInstance?.onerror?.(new Event('error'))
  })
}

/* ─── tests ─── */

beforeEach(() => {
  lastInstance = null
  vi.stubGlobal('EventSource', MockEventSource)
  mockUpdatePhaseStatus.mockReset()
  mockInvalidateQueries.mockReset()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useRunSSE — no runId', () => {
  it('stays disconnected and does not instantiate EventSource', () => {
    const { result } = renderHook(() => useRunSSE(null))
    expect(result.current.connectionState).toBe('disconnected')
    expect(lastInstance).toBeNull()
  })
})

describe('useRunSSE — valid runId', () => {
  it('instantiates EventSource with the correct URL', () => {
    renderHook(() => useRunSSE('run-abc'))
    expect(lastInstance).not.toBeNull()
    expect(lastInstance!.url).toBe('http://localhost:8080/v1/runs/run-abc/events')
  })

  it('sets connectionState to "connected" when onopen fires', async () => {
    const { result } = renderHook(() => useRunSSE('run-abc'))
    await triggerOpen()
    expect(result.current.connectionState).toBe('connected')
  })

  it('calls updatePhaseStatus with the phase_update payload', async () => {
    const payload = makePhasePayload({ phase: 2, status: 'running' })
    renderHook(() => useRunSSE('run-abc'))
    await triggerMessage({ type: 'phase_update', payload })
    expect(mockUpdatePhaseStatus).toHaveBeenCalledOnce()
    expect(mockUpdatePhaseStatus).toHaveBeenCalledWith(payload.phase, payload)
  })

  it('invalidates query cache and disconnects on run_complete', async () => {
    const { result } = renderHook(() => useRunSSE('run-abc'))
    await triggerOpen()
    expect(result.current.connectionState).toBe('connected')

    await triggerMessage({ type: 'run_complete' })

    expect(mockInvalidateQueries).toHaveBeenCalledOnce()
    expect(lastInstance!.close).toHaveBeenCalled()
    expect(result.current.connectionState).toBe('disconnected')
  })

  it('sets connectionState to "error" when onerror fires', async () => {
    const { result } = renderHook(() =>
      useRunSSE('run-abc', { maxReconnects: 0 })
    )
    await triggerError()
    expect(result.current.connectionState).toBe('error')
  })

  it('calls es.close() on unmount', () => {
    const { unmount } = renderHook(() => useRunSSE('run-abc'))
    const instance = lastInstance!
    unmount()
    expect(instance.close).toHaveBeenCalled()
  })

  it('closes EventSource when disconnect() is called from outside', async () => {
    const { result } = renderHook(() => useRunSSE('run-abc'))
    const instance = lastInstance!
    await act(async () => {
      result.current.disconnect()
    })
    expect(instance.close).toHaveBeenCalled()
    expect(result.current.connectionState).toBe('disconnected')
  })
})

describe('useRunSSE — autoConnect: false', () => {
  it('does not instantiate EventSource when autoConnect is false', () => {
    renderHook(() => useRunSSE('run-abc', { autoConnect: false }))
    expect(lastInstance).toBeNull()
  })
})
