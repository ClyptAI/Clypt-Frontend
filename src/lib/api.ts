import type {
  RunListItem,
  RunDetail,
  RunMeta,
  SemanticGraphNode,
  ClipCandidate,
  RenderJobStatus,
  RenderPreset,
} from '../types/clypt'
import type { EmbeddingsData } from '../hooks/api/useEmbeddings'
import { MOCK_EMBEDDINGS } from '../hooks/api/useEmbeddings'
import {
  isMockApiEnabled,
  mockRunsApi,
  mockNodesApi,
  mockClipsApi,
  mockEmbeddingsApi,
  mockRenderApi,
} from '../mocks/api'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/**
 * When true, every API namespace below delegates to the in-memory mock
 * implementation under src/mocks/. This is the default until the real
 * backend is wired up — see src/mocks/README or api.ts for details.
 */
const USE_MOCK = isMockApiEnabled()

export class ClyptApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    message?: string,
  ) {
    super(message ?? `${status} ${statusText}`)
    this.name = 'ClyptApiError'
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new ClyptApiError(res.status, res.statusText)
  return res.json() as Promise<T>
}

export const runsApi = {
  list(): Promise<RunListItem[]> {
    if (USE_MOCK) return mockRunsApi.list()
    return apiFetch('/v1/runs')
  },
  get(runId: string): Promise<RunDetail> {
    if (USE_MOCK) return mockRunsApi.get(runId)
    return apiFetch(`/v1/runs/${runId}`)
  },
  create(sourceUrl: string, displayName?: string): Promise<RunMeta> {
    if (USE_MOCK) return mockRunsApi.create(sourceUrl, displayName)
    return apiFetch('/v1/runs', {
      method: 'POST',
      body: JSON.stringify({ source_url: sourceUrl, display_name: displayName }),
    })
  },
}

export const nodesApi = {
  list(runId: string): Promise<SemanticGraphNode[]> {
    if (USE_MOCK) return mockNodesApi.list(runId)
    return apiFetch(`/v1/runs/${runId}/nodes`)
  },
  get(runId: string, nodeId: string): Promise<SemanticGraphNode> {
    if (USE_MOCK) return mockNodesApi.get(runId, nodeId)
    return apiFetch(`/v1/runs/${runId}/nodes/${nodeId}`)
  },
}

export const clipsApi = {
  list(runId: string): Promise<ClipCandidate[]> {
    if (USE_MOCK) return mockClipsApi.list(runId)
    return apiFetch(`/v1/runs/${runId}/clips`)
  },
  get(runId: string, clipId: string): Promise<ClipCandidate> {
    if (USE_MOCK) return mockClipsApi.get(runId, clipId)
    return apiFetch(`/v1/runs/${runId}/clips/${clipId}`)
  },
  approve(runId: string, clipId: string): Promise<ClipCandidate> {
    if (USE_MOCK) return mockClipsApi.approve(runId, clipId)
    return apiFetch(`/v1/runs/${runId}/clips/${clipId}/approve`, { method: 'POST' })
  },
  reject(runId: string, clipId: string): Promise<ClipCandidate> {
    if (USE_MOCK) return mockClipsApi.reject(runId, clipId)
    return apiFetch(`/v1/runs/${runId}/clips/${clipId}/reject`, { method: 'POST' })
  },
}

export const embeddingsApi = {
  async get(runId: string): Promise<EmbeddingsData> {
    if (USE_MOCK) return mockEmbeddingsApi.get(runId)
    try {
      return await apiFetch<EmbeddingsData>(`/v1/runs/${runId}/embeddings`)
    } catch {
      return MOCK_EMBEDDINGS
    }
  },
}

export const renderApi = {
  submit(runId: string, clipId: string, presetId: string): Promise<RenderJobStatus> {
    if (USE_MOCK) return mockRenderApi.submit(runId, clipId, presetId)
    return apiFetch(`/v1/runs/${runId}/clips/${clipId}/render`, {
      method: 'POST',
      body: JSON.stringify({ preset_id: presetId }),
    })
  },
  status(runId: string, clipId: string): Promise<RenderJobStatus> {
    if (USE_MOCK) return mockRenderApi.status(runId, clipId)
    return apiFetch(`/v1/runs/${runId}/clips/${clipId}/render`)
  },
  presets(): Promise<RenderPreset[]> {
    if (USE_MOCK) return mockRenderApi.presets()
    return apiFetch('/v1/render/presets')
  },
}
