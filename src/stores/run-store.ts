import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { RunDetail, RunListItem, PhaseStatusEntry, PhaseNumber } from '../types/clypt'

interface RunState {
  // Data
  currentRunId: string | null
  currentRun: RunDetail | null
  runList: RunListItem[]

  // UI state
  isLoading: boolean
  error: string | null

  // Derived helpers
  getPhaseStatus(phase: PhaseNumber): PhaseStatusEntry | undefined
  getLatestCompletedPhase(): PhaseNumber | null
  isPhaseComplete(phase: PhaseNumber): boolean

  // Actions
  setCurrentRunId(runId: string | null): void
  setCurrentRun(run: RunDetail | null): void
  setRunList(list: RunListItem[]): void
  setLoading(loading: boolean): void
  setError(error: string | null): void
  updatePhaseStatus(phase: PhaseNumber, status: Partial<PhaseStatusEntry>): void
  reset(): void
}

export const useRunStore = create<RunState>()(
  subscribeWithSelector((set, get) => ({
    currentRunId: null,
    currentRun: null,
    runList: [],
    isLoading: false,
    error: null,

    getPhaseStatus: (phase: PhaseNumber) => {
      const { currentRun } = get()
      return currentRun?.phases.find(p => p.phase === phase)
    },

    getLatestCompletedPhase: () => {
      const { currentRun } = get()
      if (!currentRun) return null
      const completed = currentRun.phases
        .filter(p => p.status === 'completed')
        .map(p => p.phase)
      if (completed.length === 0) return null
      return Math.max(...completed) as PhaseNumber
    },

    isPhaseComplete: (phase: PhaseNumber) => {
      return get().getPhaseStatus(phase)?.status === 'completed'
    },

    setCurrentRunId: (runId: string | null) => set({ currentRunId: runId }),

    setCurrentRun: (run: RunDetail | null) => set({ currentRun: run }),

    setRunList: (list: RunListItem[]) => set({ runList: list }),

    setLoading: (loading: boolean) => set({ isLoading: loading }),

    setError: (error: string | null) => set({ error }),

    updatePhaseStatus: (phase: PhaseNumber, partialStatus: Partial<PhaseStatusEntry>) => {
      const { currentRun } = get()
      if (!currentRun) return
      set({
        currentRun: {
          ...currentRun,
          phases: currentRun.phases.map(p =>
            p.phase === phase ? { ...p, ...partialStatus } : p
          ),
        },
      })
    },

    reset: () =>
      set({
        currentRunId: null,
        currentRun: null,
        runList: [],
        isLoading: false,
        error: null,
      }),
  }))
)
