import { useQuery } from '@tanstack/react-query'
import { nodesApi, edgesApi } from '../../lib/api'

export const nodeKeys = {
  all: ['nodes'] as const,
  list: (runId: string) => [...nodeKeys.all, 'list', runId] as const,
  detail: (runId: string, nodeId: string) => [...nodeKeys.all, 'detail', runId, nodeId] as const,
}

export const edgeKeys = {
  all: ['edges'] as const,
  list: (runId: string) => [...edgeKeys.all, 'list', runId] as const,
}

export function useNodeList(runId: string) {
  return useQuery({
    queryKey: nodeKeys.list(runId),
    queryFn: () => nodesApi.list(runId),
    enabled: !!runId,
  })
}

export function useNodeDetail(runId: string, nodeId: string) {
  return useQuery({
    queryKey: nodeKeys.detail(runId, nodeId),
    queryFn: () => nodesApi.get(runId, nodeId),
    enabled: !!runId && !!nodeId,
  })
}

export function useEdgeList(runId: string) {
  return useQuery({
    queryKey: edgeKeys.list(runId),
    queryFn: () => edgesApi.list(runId),
    enabled: !!runId,
  })
}
