import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clipsApi } from '../../lib/api'

export const clipKeys = {
  all: ['clips'] as const,
  lists: () => [...clipKeys.all, 'list'] as const,
  list: (runId: string) => [...clipKeys.all, 'list', runId] as const,
  detail: (runId: string, clipId: string) => [...clipKeys.all, 'detail', runId, clipId] as const,
}

export function useClipList(runId: string) {
  return useQuery({
    queryKey: clipKeys.list(runId),
    queryFn: () => clipsApi.list(runId),
    enabled: !!runId,
  })
}

export function useClipDetail(runId: string, clipId: string) {
  return useQuery({
    queryKey: clipKeys.detail(runId, clipId),
    queryFn: () => clipsApi.get(runId, clipId),
    enabled: !!runId && !!clipId,
  })
}

export function useApproveClip(runId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (clipId: string) => clipsApi.approve(runId, clipId),
    onSuccess: () => qc.invalidateQueries({ queryKey: clipKeys.list(runId) }),
  })
}

export function useRejectClip(runId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (clipId: string) => clipsApi.reject(runId, clipId),
    onSuccess: () => qc.invalidateQueries({ queryKey: clipKeys.list(runId) }),
  })
}
