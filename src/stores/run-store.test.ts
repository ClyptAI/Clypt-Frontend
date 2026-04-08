import { describe, it, expect, beforeEach } from 'vitest'
import { useRunStore } from './run-store'
import type { RunDetail, PhaseStatusEntry } from '../types/clypt'

function makeRun(overrides?: Partial<RunDetail>): RunDetail {
  return {
    run_id: 'run-1',
    source_url: 'https://youtube.com/watch?v=abc',
    created_at: '2024-01-01T00:00:00Z',
    display_name: null,
    node_count: null,
    edge_count: null,
    clip_count: null,
    phases: [],
    ...overrides,
  }
}

function makePhaseEntry(overrides?: Partial<PhaseStatusEntry>): PhaseStatusEntry {
  return {
    phase: 1,
    name: 'Timeline Foundation',
    status: 'pending',
    elapsed_s: null,
    summary: null,
    artifact_keys: [],
    ...overrides,
  }
}

beforeEach(() => {
  useRunStore.setState({
    currentRunId: null,
    currentRun: null,
    runList: [],
    isLoading: false,
    error: null,
  })
})

describe('RunStore — initial state', () => {
  it('has currentRunId = null', () => {
    expect(useRunStore.getState().currentRunId).toBeNull()
  })

  it('has currentRun = null', () => {
    expect(useRunStore.getState().currentRun).toBeNull()
  })

  it('has empty runList', () => {
    expect(useRunStore.getState().runList).toEqual([])
  })

  it('has isLoading = false', () => {
    expect(useRunStore.getState().isLoading).toBe(false)
  })

  it('has error = null', () => {
    expect(useRunStore.getState().error).toBeNull()
  })
})

describe('RunStore — setCurrentRunId', () => {
  it('updates currentRunId', () => {
    useRunStore.getState().setCurrentRunId('run-abc')
    expect(useRunStore.getState().currentRunId).toBe('run-abc')
  })

  it('accepts null', () => {
    useRunStore.getState().setCurrentRunId('run-abc')
    useRunStore.getState().setCurrentRunId(null)
    expect(useRunStore.getState().currentRunId).toBeNull()
  })
})

describe('RunStore — isPhaseComplete', () => {
  it('returns false for missing phase when currentRun is null', () => {
    expect(useRunStore.getState().isPhaseComplete(1)).toBe(false)
  })

  it('returns false for a phase with status pending', () => {
    const run = makeRun({ phases: [makePhaseEntry({ phase: 1, status: 'pending' })] })
    useRunStore.getState().setCurrentRun(run)
    expect(useRunStore.getState().isPhaseComplete(1)).toBe(false)
  })

  it('returns true for a phase with status completed', () => {
    const run = makeRun({ phases: [makePhaseEntry({ phase: 1, status: 'completed' })] })
    useRunStore.getState().setCurrentRun(run)
    expect(useRunStore.getState().isPhaseComplete(1)).toBe(true)
  })

  it('returns false for a phase not present in the run', () => {
    const run = makeRun({ phases: [makePhaseEntry({ phase: 1, status: 'completed' })] })
    useRunStore.getState().setCurrentRun(run)
    expect(useRunStore.getState().isPhaseComplete(2)).toBe(false)
  })
})

describe('RunStore — updatePhaseStatus', () => {
  it('mutates the correct phase entry', () => {
    const run = makeRun({
      phases: [
        makePhaseEntry({ phase: 1, status: 'running' }),
        makePhaseEntry({ phase: 2, status: 'pending' }),
      ],
    })
    useRunStore.getState().setCurrentRun(run)
    useRunStore.getState().updatePhaseStatus(1, { status: 'completed', elapsed_s: 12.5 })

    const phases = useRunStore.getState().currentRun!.phases
    expect(phases[0].status).toBe('completed')
    expect(phases[0].elapsed_s).toBe(12.5)
    expect(phases[1].status).toBe('pending')
  })

  it('no-ops when currentRun is null', () => {
    expect(() => {
      useRunStore.getState().updatePhaseStatus(1, { status: 'completed' })
    }).not.toThrow()
    expect(useRunStore.getState().currentRun).toBeNull()
  })

  it('does not mutate phases not targeted', () => {
    const run = makeRun({
      phases: [
        makePhaseEntry({ phase: 1, status: 'completed' }),
        makePhaseEntry({ phase: 2, status: 'running' }),
      ],
    })
    useRunStore.getState().setCurrentRun(run)
    useRunStore.getState().updatePhaseStatus(2, { status: 'completed' })

    const phases = useRunStore.getState().currentRun!.phases
    expect(phases[0].status).toBe('completed')
    expect(phases[1].status).toBe('completed')
  })
})

describe('RunStore — getLatestCompletedPhase', () => {
  it('returns null when currentRun is null', () => {
    expect(useRunStore.getState().getLatestCompletedPhase()).toBeNull()
  })

  it('returns null when no phase is completed', () => {
    const run = makeRun({
      phases: [
        makePhaseEntry({ phase: 1, status: 'running' }),
        makePhaseEntry({ phase: 2, status: 'pending' }),
      ],
    })
    useRunStore.getState().setCurrentRun(run)
    expect(useRunStore.getState().getLatestCompletedPhase()).toBeNull()
  })

  it('returns the highest completed phase number', () => {
    const run = makeRun({
      phases: [
        makePhaseEntry({ phase: 1, status: 'completed' }),
        makePhaseEntry({ phase: 2, status: 'completed' }),
        makePhaseEntry({ phase: 3, status: 'running' }),
      ],
    })
    useRunStore.getState().setCurrentRun(run)
    expect(useRunStore.getState().getLatestCompletedPhase()).toBe(2)
  })

  it('returns single completed phase', () => {
    const run = makeRun({
      phases: [makePhaseEntry({ phase: 4, status: 'completed' })],
    })
    useRunStore.getState().setCurrentRun(run)
    expect(useRunStore.getState().getLatestCompletedPhase()).toBe(4)
  })
})

describe('RunStore — reset', () => {
  it('clears all state', () => {
    useRunStore.setState({
      currentRunId: 'run-x',
      currentRun: makeRun(),
      runList: [{ run_id: 'x', source_url: '', created_at: '', display_name: null, latest_phase: 1, latest_status: 'completed' }],
      isLoading: true,
      error: 'some error',
    })
    useRunStore.getState().reset()
    const state = useRunStore.getState()
    expect(state.currentRunId).toBeNull()
    expect(state.currentRun).toBeNull()
    expect(state.runList).toEqual([])
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })
})
