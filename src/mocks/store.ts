/**
 * Mock "database" — in-memory state with localStorage persistence.
 *
 * This is the single source of truth for all dummy data in the app. Every
 * mock API function in src/mocks/api.ts reads from and writes to this store.
 * Pages should NEVER import from here directly — they go through the React
 * Query hooks in src/hooks/api/, which call src/lib/api.ts, which delegates
 * to src/mocks/api.ts when VITE_USE_MOCK_API is on (default).
 *
 * When the real backend is wired up later, this file can be left in place
 * or deleted — nothing else in the app imports from it.
 */

import type {
  RunDetail,
  ClipCandidate,
  SemanticGraphNode,
  SemanticGraphEdge,
  RenderPreset,
  RenderJobStatus,
} from '@/types/clypt'

const STORAGE_KEY = 'clypt:mock-db:v1'

export interface MockDB {
  /** runId -> full RunDetail (phases, counts, etc.) */
  runs: Record<string, RunDetail>
  /** runId -> ClipCandidate[] */
  clips: Record<string, ClipCandidate[]>
  /** runId -> SemanticGraphNode[] */
  nodes: Record<string, SemanticGraphNode[]>
  /** runId -> SemanticGraphEdge[] */
  edges: Record<string, SemanticGraphEdge[]>
  /** `${runId}:${clipId}` -> RenderJobStatus */
  renderJobs: Record<string, RenderJobStatus>
  /** Shared list of available render presets */
  presets: RenderPreset[]
  /** runId -> clipId -> 'approved' | 'rejected' */
  approvals: Record<string, Record<string, 'approved' | 'rejected'>>
  /** Insertion order for runs — used to produce a stable "list" response */
  runOrder: string[]
}

function emptyDB(): MockDB {
  return {
    runs: {},
    clips: {},
    nodes: {},
    edges: {},
    renderJobs: {},
    presets: [],
    approvals: {},
    runOrder: [],
  }
}

let dbInstance: MockDB | null = null
const listeners = new Set<() => void>()

function loadDB(): MockDB {
  if (dbInstance) return dbInstance
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        dbInstance = JSON.parse(raw) as MockDB
        // Forward-compat: ensure all expected keys exist
        dbInstance = { ...emptyDB(), ...dbInstance }
        return dbInstance
      }
    }
  } catch {
    // fall through to fresh DB
  }
  dbInstance = emptyDB()
  return dbInstance
}

function persist() {
  if (!dbInstance) return
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dbInstance))
    }
  } catch {
    // ignore quota errors etc.
  }
  listeners.forEach((fn) => {
    try {
      fn()
    } catch {
      /* listener bugs shouldn't break the store */
    }
  })
}

export const mockDB = {
  /** Read-only access to the current DB state. */
  get(): MockDB {
    return loadDB()
  },
  /** Mutate the DB via callback, then persist and notify listeners. */
  update(fn: (db: MockDB) => void): void {
    const db = loadDB()
    fn(db)
    persist()
  },
  /** Subscribe to any DB write. Returns an unsubscribe fn. */
  subscribe(fn: () => void): () => void {
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  },
  /** Wipe the DB back to empty — useful for dev reset. */
  reset(): void {
    dbInstance = emptyDB()
    persist()
  },
  /**
   * Seed the DB if it hasn't been seeded yet. Idempotent — calling twice
   * is a no-op unless reset() was called in between.
   */
  seedOnce(seedFn: (db: MockDB) => void): void {
    const db = loadDB()
    if (db.runOrder.length > 0) return
    seedFn(db)
    persist()
  },
}

// Expose a dev-friendly global for manual reset from the browser console.
// Only in dev mode to avoid polluting production bundles.
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  ;(window as unknown as { __clyptMockDB?: typeof mockDB }).__clyptMockDB = mockDB
}
