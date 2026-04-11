/**
 * Mock implementation of the Clypt backend API. Every function here mirrors
 * the shape of its counterpart in src/lib/api.ts — when VITE_USE_MOCK_API is
 * on, src/lib/api.ts delegates here instead of calling fetch().
 *
 * Each function simulates a small network delay so UI loading states and
 * skeleton cards actually render (otherwise everything would be synchronous
 * and the user would never see the loading phase).
 */

import type {
  RunListItem,
  RunDetail,
  RunMeta,
  SemanticGraphNode,
  SemanticGraphEdge,
  ClipCandidate,
  RenderJobStatus,
  RenderPreset,
  GroundingClipState,
  TimelineBundle,
} from '@/types/clypt'
import type { EmbeddingsData } from '@/hooks/api/useEmbeddings'
import { MOCK_EMBEDDINGS } from '@/hooks/api/useEmbeddings'
import { mockDB } from './store'
import { seedMockDB, buildPhaseStatus, generateTimeline } from './seed'
import { startMockRunLifecycle } from './lifecycle'

// Seed on first import — safe because seedOnce is idempotent.
mockDB.seedOnce(seedMockDB)

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DEFAULT_LATENCY_MS = 180

function delay<T>(value: T, ms: number = DEFAULT_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function makeRunId(): string {
  // Short human-readable id: run_<base36 timestamp>_<random>
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

function toListItem(run: RunDetail): RunListItem {
  const active = run.phases.find((p) => p.status === 'running')
  const failed = run.phases.find((p) => p.status === 'failed')
  const lastCompleted = [...run.phases].reverse().find((p) => p.status === 'completed')
  const latest = failed ?? active ?? lastCompleted ?? run.phases[0]
  return {
    run_id: run.run_id,
    source_url: run.source_url,
    display_name: run.display_name,
    created_at: run.created_at,
    latest_phase: latest.phase,
    latest_status: latest.status,
    clip_count: run.clip_count,
  }
}

// ─── Mock runs API ───────────────────────────────────────────────────────────

export const mockRunsApi = {
  list(): Promise<RunListItem[]> {
    const db = mockDB.get()
    // Reverse insertion order so newest appears first
    const items = db.runOrder
      .slice()
      .reverse()
      .map((id) => db.runs[id])
      .filter(Boolean)
      .map(toListItem)
    return delay(items)
  },

  get(runId: string): Promise<RunDetail> {
    const db = mockDB.get()
    const run = db.runs[runId]
    if (!run) {
      return Promise.reject(new Error(`[mock] run not found: ${runId}`))
    }
    return delay(run)
  },

  create(sourceUrl: string, displayName?: string): Promise<RunMeta> {
    const runId = makeRunId()
    const createdAt = new Date().toISOString()
    const newRun: RunDetail = {
      run_id: runId,
      source_url: sourceUrl,
      display_name: displayName ?? null,
      created_at: createdAt,
      phases: buildPhaseStatus(1, 'running'),
      node_count: null,
      edge_count: null,
      clip_count: null,
    }

    mockDB.update((db) => {
      db.runs[runId] = newRun
      db.clips[runId] = []
      db.nodes[runId] = []
      db.edges[runId] = []
      db.approvals[runId] = {}
      db.runOrder.push(runId)
    })

    // Once the run is persisted, kick off the simulated phase progression.
    // Delay the start slightly so the client has time to navigate to the
    // detail page before the first SSE event fires.
    setTimeout(() => startMockRunLifecycle(runId), 400)

    return delay({
      run_id: runId,
      source_url: sourceUrl,
      display_name: displayName ?? null,
      created_at: createdAt,
    })
  },
}

// ─── Mock nodes API ──────────────────────────────────────────────────────────

export const mockNodesApi = {
  list(runId: string): Promise<SemanticGraphNode[]> {
    const nodes = mockDB.get().nodes[runId] ?? []
    return delay(nodes)
  },

  get(runId: string, nodeId: string): Promise<SemanticGraphNode> {
    const nodes = mockDB.get().nodes[runId] ?? []
    const node = nodes.find((n) => n.node_id === nodeId)
    if (!node) return Promise.reject(new Error(`[mock] node not found: ${nodeId}`))
    return delay(node)
  },
}

// ─── Mock edges API ──────────────────────────────────────────────────────────

export const mockEdgesApi = {
  list(runId: string): Promise<SemanticGraphEdge[]> {
    const edges = mockDB.get().edges[runId] ?? []
    return delay(edges)
  },
}

// ─── Mock clips API ──────────────────────────────────────────────────────────

export const mockClipsApi = {
  list(runId: string): Promise<ClipCandidate[]> {
    const clips = mockDB.get().clips[runId] ?? []
    return delay(clips)
  },

  get(runId: string, clipId: string): Promise<ClipCandidate> {
    const clips = mockDB.get().clips[runId] ?? []
    const clip = clips.find((c) => c.clip_id === clipId)
    if (!clip) return Promise.reject(new Error(`[mock] clip not found: ${clipId}`))
    return delay(clip)
  },

  approve(runId: string, clipId: string): Promise<ClipCandidate> {
    mockDB.update((db) => {
      if (!db.approvals[runId]) db.approvals[runId] = {}
      db.approvals[runId][clipId] = 'approved'
    })
    const clips = mockDB.get().clips[runId] ?? []
    const clip = clips.find((c) => c.clip_id === clipId)
    if (!clip) return Promise.reject(new Error(`[mock] clip not found: ${clipId}`))
    return delay(clip, 120)
  },

  reject(runId: string, clipId: string): Promise<ClipCandidate> {
    mockDB.update((db) => {
      if (!db.approvals[runId]) db.approvals[runId] = {}
      db.approvals[runId][clipId] = 'rejected'
    })
    const clips = mockDB.get().clips[runId] ?? []
    const clip = clips.find((c) => c.clip_id === clipId)
    if (!clip) return Promise.reject(new Error(`[mock] clip not found: ${clipId}`))
    return delay(clip, 120)
  },
}

// ─── Mock embeddings API ─────────────────────────────────────────────────────

export const mockEmbeddingsApi = {
  get(_runId: string): Promise<EmbeddingsData> {
    // We intentionally reuse the deterministic MOCK_EMBEDDINGS — they already
    // represent a plausible 2D projection of ~27 nodes, which matches the
    // demo run's node count.
    return delay(MOCK_EMBEDDINGS)
  },
}

// ─── Mock timeline API ───────────────────────────────────────────────────────

export const mockTimelineApi = {
  get(runId: string): Promise<TimelineBundle> {
    let bundle = mockDB.get().timelines[runId]
    if (!bundle) {
      // Lazy seed — handles stale localStorage caches that pre-date the timelines field.
      if (!mockDB.get().runs[runId]) {
        return Promise.reject(new Error(`[mock] run not found: ${runId}`))
      }
      bundle = generateTimeline(runId)
      mockDB.update((db) => { db.timelines[runId] = bundle! })
    }
    return delay(bundle)
  },
}

// ─── Mock clips (cross-run list) ─────────────────────────────────────────────

export const mockAllClipsApi = {
  list(): Promise<Array<ClipCandidate & { run_id: string }>> {
    const db = mockDB.get()
    const all: Array<ClipCandidate & { run_id: string }> = []
    for (const runId of db.runOrder) {
      const clips = db.clips[runId] ?? []
      for (const clip of clips) {
        all.push({ ...clip, run_id: runId })
      }
    }
    return delay(all)
  },
}

// ─── Mock grounding API ──────────────────────────────────────────────────────

function groundingKey(runId: string, clipId: string): string {
  return `${runId}:${clipId}`
}

function emptyGroundingState(runId: string, clipId: string): GroundingClipState {
  return {
    run_id: runId,
    clip_id: clipId,
    shots: [],
    updated_at: new Date(0).toISOString(),
  }
}

export const mockGroundingApi = {
  /**
   * Returns the saved Grounding-page state for a clip. If nothing has been
   * saved yet we return an empty state rather than 404 — the page treats
   * "no overrides" as "use the model output as-is".
   */
  get(runId: string, clipId: string): Promise<GroundingClipState> {
    const existing = mockDB.get().grounding[groundingKey(runId, clipId)]
    return delay(existing ?? emptyGroundingState(runId, clipId), 90)
  },

  /**
   * Upsert the full Grounding state for a clip. The mutation hook on the
   * frontend builds the next state explicitly and PUTs the whole thing —
   * no merging happens on the server side.
   */
  put(runId: string, clipId: string, state: GroundingClipState): Promise<GroundingClipState> {
    const next: GroundingClipState = {
      ...state,
      run_id: runId,
      clip_id: clipId,
      updated_at: new Date().toISOString(),
    }
    mockDB.update((db) => {
      db.grounding[groundingKey(runId, clipId)] = next
    })
    return delay(next, 90)
  },
}

// ─── Mock render API ─────────────────────────────────────────────────────────

export const mockRenderApi = {
  submit(runId: string, clipId: string, presetId: string): Promise<RenderJobStatus> {
    const key = `${runId}:${clipId}`
    const preset = mockDB.get().presets.find((p) => p.id === presetId)
    if (!preset) {
      return Promise.reject(new Error(`[mock] unknown preset: ${presetId}`))
    }

    const job: RenderJobStatus = {
      clip_id: clipId,
      status: 'queued',
      progress_pct: 0,
      output_url: null,
      error: null,
    }
    mockDB.update((db) => {
      db.renderJobs[key] = job
    })

    // Simulate render progression: queued -> rendering (0-100%) -> completed
    let pct = 0
    const progressTimer = setInterval(() => {
      pct += 10 + Math.floor(Math.random() * 10)
      if (pct >= 100) {
        pct = 100
        clearInterval(progressTimer)
        mockDB.update((db) => {
          db.renderJobs[key] = {
            clip_id: clipId,
            status: 'completed',
            progress_pct: 100,
            // Placeholder public asset shipped with the frontend
            output_url: '/videos/joeroganflagrant.mp4',
            error: null,
          }
        })
      } else {
        mockDB.update((db) => {
          db.renderJobs[key] = {
            clip_id: clipId,
            status: 'rendering',
            progress_pct: pct,
            output_url: null,
            error: null,
          }
        })
      }
    }, 350)

    return delay(job, 100)
  },

  status(runId: string, clipId: string): Promise<RenderJobStatus> {
    const key = `${runId}:${clipId}`
    const job = mockDB.get().renderJobs[key]
    if (!job) {
      return Promise.reject(new Error(`[mock] no render job for ${key}`))
    }
    return delay(job, 80)
  },

  presets(): Promise<RenderPreset[]> {
    return delay(mockDB.get().presets)
  },
}

// ─── Dev-mode flag helper ────────────────────────────────────────────────────

/**
 * Returns true iff mock mode is active. Reads VITE_USE_MOCK_API with a
 * default of "true" (per collaborator instruction: build the frontend fully
 * functional on dummy data before wiring to the real backend).
 */
export function isMockApiEnabled(): boolean {
  const flag = import.meta.env.VITE_USE_MOCK_API
  if (flag === undefined || flag === null) return true
  return String(flag).toLowerCase() !== 'false'
}
