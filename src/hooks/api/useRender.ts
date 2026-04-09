import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { renderApi } from '../../lib/api'
import type { RenderJobStatus } from '../../types/clypt'

export const renderKeys = {
  all: ['render'] as const,
  presets: () => [...renderKeys.all, 'presets'] as const,
  status: (runId: string, clipId: string) =>
    [...renderKeys.all, 'status', runId, clipId] as const,
}

export function useRenderPresets() {
  return useQuery({
    queryKey: renderKeys.presets(),
    queryFn: renderApi.presets,
    staleTime: Infinity, // presets don't change at runtime
  })
}

/**
 * Polls render status until the job reaches a terminal state. Returns `enabled`
 * gates: nothing fetches until a render has actually been submitted for the
 * (runId, clipId) pair.
 */
export function useRenderStatus(runId: string, clipId: string, enabled: boolean) {
  return useQuery({
    queryKey: renderKeys.status(runId, clipId),
    queryFn: () => renderApi.status(runId, clipId),
    enabled: enabled && !!runId && !!clipId,
    refetchInterval: (query) => {
      const data = query.state.data as RenderJobStatus | undefined
      if (!data) return 500
      if (data.status === 'completed' || data.status === 'failed') return false
      return 500
    },
  })
}

export function useSubmitRender(runId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ clipId, presetId }: { clipId: string; presetId: string }) =>
      renderApi.submit(runId, clipId, presetId),
    onSuccess: (job) => {
      // Seed the status cache so the polling query picks up the queued state
      // immediately instead of waiting for its first refetch tick.
      qc.setQueryData(renderKeys.status(runId, job.clip_id), job)
    },
  })
}
