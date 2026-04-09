import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * Persists the in-flight onboarding flow so the user can refresh or navigate
 * backwards through the 6 steps without losing what they typed. When a real
 * backend lands, the `finish()` action is where we'd POST the collected
 * profile to create the user's workspace.
 */
export type Framing = 'Single presenter follow' | 'Shared frame (2-shot)' | 'Mixed (decide per shot)'
export type Quality = 'Fast draft' | 'Balanced' | 'High quality'

interface Voiceprint {
  id: string
  name: string
  source: 'recorded' | 'uploaded'
}

interface OnboardingState {
  // Step 1 — channel
  channelUrl: string
  singleVideoMode: boolean
  videoUrl: string

  // Step 4 — preferences
  durationRange: [number, number]
  platforms: string[]
  framing: Framing
  quality: Quality

  // Step 5 — voiceprints
  voiceprints: Voiceprint[]

  // Meta
  completedAt: string | null

  // Setters
  setChannelUrl(url: string): void
  setSingleVideoMode(v: boolean): void
  setVideoUrl(url: string): void

  setDurationRange(r: [number, number]): void
  togglePlatform(p: string): void
  setFraming(f: Framing): void
  setQuality(q: Quality): void

  addVoiceprint(name: string, source: Voiceprint['source']): void
  removeVoiceprint(id: string): void

  markComplete(): void
  reset(): void
}

const INITIAL: Pick<
  OnboardingState,
  | 'channelUrl'
  | 'singleVideoMode'
  | 'videoUrl'
  | 'durationRange'
  | 'platforms'
  | 'framing'
  | 'quality'
  | 'voiceprints'
  | 'completedAt'
> = {
  channelUrl: '',
  singleVideoMode: false,
  videoUrl: '',
  durationRange: [30, 90],
  platforms: ['TikTok', 'Shorts'],
  framing: 'Single presenter follow',
  quality: 'Balanced',
  voiceprints: [],
  completedAt: null,
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...INITIAL,

      setChannelUrl: (url) => set({ channelUrl: url }),
      setSingleVideoMode: (v) => set({ singleVideoMode: v }),
      setVideoUrl: (url) => set({ videoUrl: url }),

      setDurationRange: (r) => set({ durationRange: r }),
      togglePlatform: (p) =>
        set((state) => ({
          platforms: state.platforms.includes(p)
            ? state.platforms.filter((x) => x !== p)
            : [...state.platforms, p],
        })),
      setFraming: (f) => set({ framing: f }),
      setQuality: (q) => set({ quality: q }),

      addVoiceprint: (name, source) =>
        set((state) => ({
          voiceprints: [
            ...state.voiceprints,
            { id: `vp_${Math.random().toString(36).slice(2, 8)}`, name, source },
          ],
        })),
      removeVoiceprint: (id) =>
        set((state) => ({ voiceprints: state.voiceprints.filter((v) => v.id !== id) })),

      markComplete: () => set({ completedAt: new Date().toISOString() }),
      reset: () => set({ ...INITIAL }),
    }),
    {
      name: 'clypt.onboarding',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
