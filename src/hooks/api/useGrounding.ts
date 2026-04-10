import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groundingApi } from '../../lib/api'
import type { GroundingClipState } from '../../types/clypt'

export const groundingKeys = {
  all: ['grounding'] as const,
  detail: (runId: string, clipId: string) =>
    [...groundingKeys.all, 'detail', runId, clipId] as const,
}

export function useGroundingState(runId: string, clipId: string) {
  return useQuery({
    queryKey: groundingKeys.detail(runId, clipId),
    queryFn: () => groundingApi.get(runId, clipId),
    enabled: !!runId && !!clipId,
  })
}

/**
 * Optimistic mutation: writes the new state into the React Query cache
 * immediately so the editor stays snappy, then PUTs to the API. On error
 * the previous cache value is restored. The Grounding page builds the full
 * next state explicitly and passes it through `mutate()` — there is no
 * server-side merging.
 */
export function useUpdateGrounding(runId: string, clipId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (next: GroundingClipState) => groundingApi.put(runId, clipId, next),
    onMutate: async (next) => {
      const key = groundingKeys.detail(runId, clipId)
      await qc.cancelQueries({ queryKey: key })
      const previous = qc.getQueryData<GroundingClipState>(key)
      qc.setQueryData(key, next)
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(groundingKeys.detail(runId, clipId), ctx.previous)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: groundingKeys.detail(runId, clipId) })
    },
  })
}
