/**
 * Fake run lifecycle — simulates a pipeline run walking through phases 1..6
 * over a handful of seconds, emitting phase_update events that useRunSSE
 * subscribes to in mock mode.
 *
 * This is what makes the "Start run" flow feel alive without a backend.
 */

import type { PhaseStatusEntry, PhaseNumber, PhaseStatus } from '@/types/clypt'
import { mockDB } from './store'
import { buildPhaseStatus } from './seed'

export interface MockRunEvent {
  type: 'phase_update' | 'run_complete' | 'run_failed' | 'heartbeat'
  payload?: PhaseStatusEntry
}

type Listener = (evt: MockRunEvent) => void

// runId -> Set<Listener>
const listenersByRun = new Map<string, Set<Listener>>()

// runId -> active timer (so we can cancel if user navigates away mid-run)
const activeTimers = new Map<string, ReturnType<typeof setTimeout>>()

function emit(runId: string, evt: MockRunEvent) {
  const set = listenersByRun.get(runId)
  if (!set) return
  for (const fn of set) {
    try {
      fn(evt)
    } catch {
      /* listener bugs shouldn't break the bus */
    }
  }
}

export const mockRunBus = {
  /** Subscribe to events for a specific run. Returns an unsubscribe fn. */
  subscribe(runId: string, listener: Listener): () => void {
    let set = listenersByRun.get(runId)
    if (!set) {
      set = new Set()
      listenersByRun.set(runId, set)
    }
    set.add(listener)
    return () => {
      set?.delete(listener)
      if (set && set.size === 0) listenersByRun.delete(runId)
    }
  },
}

/**
 * Kick off a simulated lifecycle for a freshly-created run. Walks phase 1..6
 * over ~12 seconds total, updating both the mock DB and firing SSE events.
 *
 * Idempotent per runId: if a lifecycle is already active for this run, the
 * second call is a no-op.
 */
export function startMockRunLifecycle(
  runId: string,
  {
    perPhaseMs = 2000,
    failAtPhase = null,
  }: { perPhaseMs?: number; failAtPhase?: PhaseNumber | null } = {},
): void {
  if (activeTimers.has(runId)) return

  let currentPhase: PhaseNumber = 1

  const tick = () => {
    // Mark the current phase as "running" (if not already), then after
    // perPhaseMs mark it completed and advance.
    mockDB.update((db) => {
      const run = db.runs[runId]
      if (!run) return
      run.phases = buildPhaseStatus(currentPhase, 'running')
    })

    emit(runId, {
      type: 'phase_update',
      payload: {
        phase: currentPhase,
        name: `Phase ${currentPhase}`,
        status: 'running',
        elapsed_s: 0,
        summary: null,
        artifact_keys: [],
      },
    })

    const timer = setTimeout(() => {
      // Decide: fail, complete-and-advance, or finish-all.
      if (failAtPhase !== null && currentPhase === failAtPhase) {
        mockDB.update((db) => {
          const run = db.runs[runId]
          if (!run) return
          run.phases = buildPhaseStatus(currentPhase, 'failed')
        })
        emit(runId, {
          type: 'phase_update',
          payload: {
            phase: currentPhase,
            name: `Phase ${currentPhase}`,
            status: 'failed',
            elapsed_s: perPhaseMs / 1000,
            summary: 'Simulated failure',
            artifact_keys: [],
          },
        })
        emit(runId, { type: 'run_failed' })
        activeTimers.delete(runId)
        return
      }

      if (currentPhase < 6) {
        // Mark as completed and advance
        mockDB.update((db) => {
          const run = db.runs[runId]
          if (!run) return
          run.phases = buildPhaseStatus(currentPhase + 1, 'running')
          // Progressive counts — nodes/edges appear by phase 2/3, clips by phase 5
          if (currentPhase === 2) run.node_count = 27
          if (currentPhase === 3) run.edge_count = 41
          if (currentPhase === 5) run.clip_count = 8
        })
        emit(runId, {
          type: 'phase_update',
          payload: {
            phase: currentPhase,
            name: `Phase ${currentPhase}`,
            status: 'completed',
            elapsed_s: perPhaseMs / 1000,
            summary: null,
            artifact_keys: [`phase_${currentPhase}_output.json`],
          },
        })
        currentPhase = (currentPhase + 1) as PhaseNumber
        tick()
      } else {
        // All phases done
        mockDB.update((db) => {
          const run = db.runs[runId]
          if (!run) return
          run.phases = buildPhaseStatus(7, 'completed')
          run.clip_count = run.clip_count ?? 8
        })
        emit(runId, {
          type: 'phase_update',
          payload: {
            phase: 6,
            name: 'Phase 6',
            status: 'completed',
            elapsed_s: perPhaseMs / 1000,
            summary: null,
            artifact_keys: ['phase_6_output.json'],
          },
        })
        emit(runId, { type: 'run_complete' })
        activeTimers.delete(runId)
      }
    }, perPhaseMs)

    activeTimers.set(runId, timer)
  }

  tick()
}

/** Cancel an in-flight mock lifecycle (e.g. on reset). */
export function stopMockRunLifecycle(runId: string): void {
  const timer = activeTimers.get(runId)
  if (timer) {
    clearTimeout(timer)
    activeTimers.delete(runId)
  }
}

/** Returns the latest phase status from the DB — used for initial SSE snapshot. */
export function getCurrentPhaseStatus(runId: string): PhaseStatusEntry | null {
  const run = mockDB.get().runs[runId]
  if (!run) return null
  return run.phases.find((p) => p.status === 'running') ?? run.phases[run.phases.length - 1]
}
