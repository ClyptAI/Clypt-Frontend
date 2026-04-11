import { useQuery } from '@tanstack/react-query'
import { timelineApi, allClipsApi } from '../../lib/api'
import type { ClipCandidate } from '../../types/clypt'

export const timelineKeys = {
  all: ['timeline'] as const,
  detail: (runId: string) => [...timelineKeys.all, 'detail', runId] as const,
}

export const allClipsKeys = {
  all: ['clips', 'all'] as const,
}

export function useTimelineData(runId: string) {
  return useQuery({
    queryKey: timelineKeys.detail(runId),
    queryFn: () => timelineApi.get(runId),
    enabled: !!runId,
    staleTime: Infinity, // timeline data doesn't change during a session
  })
}

export function useAllClips() {
  return useQuery({
    queryKey: allClipsKeys.all,
    queryFn: () => allClipsApi.list(),
    staleTime: 30_000,
  })
}

/** Format clip duration from ms to M:SS */
export function fmtClipDuration(startMs: number, endMs: number): string {
  const totalSec = Math.round((endMs - startMs) / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export type AllClipItem = ClipCandidate & { run_id: string }
