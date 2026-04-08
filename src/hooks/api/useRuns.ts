import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { runsApi } from '../../lib/api'

export const runKeys = {
  all: ['runs'] as const,
  lists: () => [...runKeys.all, 'list'] as const,
  detail: (runId: string) => [...runKeys.all, 'detail', runId] as const,
}

export function useRunList() {
  return useQuery({ queryKey: runKeys.lists(), queryFn: runsApi.list })
}

export function useRunDetail(runId: string) {
  return useQuery({
    queryKey: runKeys.detail(runId),
    queryFn: () => runsApi.get(runId),
    enabled: !!runId,
  })
}

export function useCreateRun() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sourceUrl, displayName }: { sourceUrl: string; displayName?: string }) =>
      runsApi.create(sourceUrl, displayName),
    onSuccess: () => qc.invalidateQueries({ queryKey: runKeys.lists() }),
  })
}
