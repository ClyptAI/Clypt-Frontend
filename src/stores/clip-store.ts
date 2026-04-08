import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { ClipCandidate } from '../types/clypt'

type ApprovalState = 'pending' | 'approved' | 'rejected'

interface ClipState {
  // Data
  clips: ClipCandidate[]
  activeClipId: string | null

  // Approval overrides (keyed by clip_id, for optimistic UI)
  approvalOverrides: Record<string, ApprovalState>

  // UI state
  isLoading: boolean
  error: string | null

  // Derived helpers
  getClipById(clipId: string): ClipCandidate | undefined
  getApprovalState(clipId: string): ApprovalState
  getApprovedClips(): ClipCandidate[]
  getRejectedClips(): ClipCandidate[]
  getPendingClips(): ClipCandidate[]
  getSortedClips(): ClipCandidate[]

  // Actions
  setClips(clips: ClipCandidate[]): void
  setActiveClipId(clipId: string | null): void
  approveClip(clipId: string): void
  rejectClip(clipId: string): void
  resetApproval(clipId: string): void
  setLoading(loading: boolean): void
  setError(error: string | null): void
  reset(): void
}

export const useClipStore = create<ClipState>()(
  subscribeWithSelector((set, get) => ({
    clips: [],
    activeClipId: null,
    approvalOverrides: {},
    isLoading: false,
    error: null,

    getClipById: (clipId: string) => {
      return get().clips.find(c => c.clip_id === clipId)
    },

    getApprovalState: (clipId: string): ApprovalState => {
      return get().approvalOverrides[clipId] ?? 'pending'
    },

    getApprovedClips: () => {
      const { clips, getApprovalState } = get()
      return clips.filter(c => c.clip_id != null && getApprovalState(c.clip_id) === 'approved')
    },

    getRejectedClips: () => {
      const { clips, getApprovalState } = get()
      return clips.filter(c => c.clip_id != null && getApprovalState(c.clip_id) === 'rejected')
    },

    getPendingClips: () => {
      const { clips, getApprovalState } = get()
      return clips.filter(c => c.clip_id == null || getApprovalState(c.clip_id) === 'pending')
    },

    getSortedClips: () => {
      return [...get().clips].sort((a, b) => b.score - a.score)
    },

    setClips: (clips: ClipCandidate[]) => set({ clips }),

    setActiveClipId: (clipId: string | null) => set({ activeClipId: clipId }),

    approveClip: (clipId: string) =>
      set(state => ({
        approvalOverrides: { ...state.approvalOverrides, [clipId]: 'approved' },
      })),

    rejectClip: (clipId: string) =>
      set(state => ({
        approvalOverrides: { ...state.approvalOverrides, [clipId]: 'rejected' },
      })),

    resetApproval: (clipId: string) => {
      const { approvalOverrides } = get()
      const next = { ...approvalOverrides }
      delete next[clipId]
      set({ approvalOverrides: next })
    },

    setLoading: (loading: boolean) => set({ isLoading: loading }),

    setError: (error: string | null) => set({ error }),

    reset: () =>
      set({
        clips: [],
        activeClipId: null,
        approvalOverrides: {},
        isLoading: false,
        error: null,
      }),
  }))
)
