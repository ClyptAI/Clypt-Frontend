import type {
  RunListItem,
  RunDetail,
  RunMeta,
  SemanticGraphNode,
  ClipCandidate,
  RenderJobStatus,
  RenderPreset,
} from '../types/clypt'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

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
    return apiFetch('/v1/runs')
  },
  get(runId: string): Promise<RunDetail> {
    return apiFetch(`/v1/runs/${runId}`)
  },
  create(sourceUrl: string, displayName?: string): Promise<RunMeta> {
    return apiFetch('/v1/runs', {
      method: 'POST',
      body: JSON.stringify({ source_url: sourceUrl, display_name: displayName }),
    })
  },
}

export const nodesApi = {
  list(runId: string): Promise<SemanticGraphNode[]> {
    return apiFetch(`/v1/runs/${runId}/nodes`)
  },
  get(runId: string, nodeId: string): Promise<SemanticGraphNode> {
    return apiFetch(`/v1/runs/${runId}/nodes/${nodeId}`)
  },
}

export const clipsApi = {
  list(runId: string): Promise<ClipCandidate[]> {
    return apiFetch(`/v1/runs/${runId}/clips`)
  },
  get(runId: string, clipId: string): Promise<ClipCandidate> {
    return apiFetch(`/v1/runs/${runId}/clips/${clipId}`)
  },
  approve(runId: string, clipId: string): Promise<ClipCandidate> {
    return apiFetch(`/v1/runs/${runId}/clips/${clipId}/approve`, { method: 'POST' })
  },
  reject(runId: string, clipId: string): Promise<ClipCandidate> {
    return apiFetch(`/v1/runs/${runId}/clips/${clipId}/reject`, { method: 'POST' })
  },
}

export const renderApi = {
  submit(runId: string, clipId: string, presetId: string): Promise<RenderJobStatus> {
    return apiFetch(`/v1/runs/${runId}/clips/${clipId}/render`, {
      method: 'POST',
      body: JSON.stringify({ preset_id: presetId }),
    })
  },
  status(runId: string, clipId: string): Promise<RenderJobStatus> {
    return apiFetch(`/v1/runs/${runId}/clips/${clipId}/render`)
  },
  presets(): Promise<RenderPreset[]> {
    return apiFetch('/v1/render/presets')
  },
}
