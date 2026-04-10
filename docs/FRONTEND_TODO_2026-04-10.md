# Frontend Punch List — 2026-04-10

State of the frontend at the end of the 2026-04-10 work session, after the Grounding persistence work landed in `main` (commits `fb5e0c9`, `d97532d`, `d91bcd6`).

Every item below is verified against the current source — file paths and line numbers are clickable. Nothing in this doc is speculation.

---

## Priority 1 — Real data path missing

### 1.1 RunTimeline is 100% mock data

**Where:** [src/pages/RunTimeline.tsx:30-93](../src/pages/RunTimeline.tsx#L30-L93)

`MOCK_SHOTS` (42 entries), `MOCK_SPEAKERS` (3 with generated turns), `MOCK_EMOTIONS`, and `MOCK_AUDIO_EVENTS` are all in-page constants. There is **no** `useTimelineData` hook, no `timelineApi`, no `mocks/api.ts` entry for the Phase 1 timeline foundation.

The wire types already exist in [src/types/clypt.ts](../src/types/clypt.ts) (`TranscriptWord`, `CanonicalTurn`, `CanonicalTimeline`, `SpeechEmotionEvent`, `SpeechEmotionTimeline`, `AudioEvent`, `AudioEventTimeline`, `ShotTrackletDescriptor`, `ShotTrackletIndex`) — nothing reads them.

**Impact:** Timeline is the most-visited editor page on the site. It's the only major editor surface still running on in-component constants.

**Shape of the fix (mirrors today's grounding work):**
1. Add `mockTimelineApi.get(runId)` in [src/mocks/api.ts](../src/mocks/api.ts) returning a seeded `{ canonical, emotions, audioEvents, shotTracklets }` bundle.
2. Add `MockDB.timelines: Record<string, ...>` in [src/mocks/store.ts](../src/mocks/store.ts) and seed it in [src/mocks/seed.ts](../src/mocks/seed.ts).
3. Add `timelineApi.get(runId)` in [src/lib/api.ts](../src/lib/api.ts).
4. Add `useTimelineData(runId)` query hook in `src/hooks/api/useTimeline.ts`.
5. Replace the four `MOCK_*` constants in [RunTimeline.tsx](../src/pages/RunTimeline.tsx) with the hook output.

This is the highest-leverage remaining piece.

---

## Priority 2 — Stubs that visibly lie to the user

### 2.1 Library Clips tab is pure mock

**Where:** [src/pages/Library.tsx:20-31](../src/pages/Library.tsx#L20-L31), [240-282](../src/pages/Library.tsx#L240-L282)

Hardcoded `mockClips` array of 6 fake titles and durations. Doesn't go through any API. The Runs tab is wired to `useRunList`; Clips tab needs the same treatment, probably a cross-run `useApprovedClipsList` or similar.

### 2.2 Library pagination is fake

**Where:** [src/pages/Library.tsx:227-235](../src/pages/Library.tsx#L227-L235), [272-280](../src/pages/Library.tsx#L272-L280)

"Page 1 of 3" hardcoded on both Runs and Clips tabs. "Next →" does nothing. "Previous" is permanently `disabled`. Either remove pagination entirely or wire real cursoring.

### 2.3 Onboarding flow persists nothing

All 6 onboarding steps render and navigate forward but drop everything the user typed:
- [OnboardChannel.tsx](../src/pages/onboard/OnboardChannel.tsx) — channel URL discarded
- [OnboardBrandProfile.tsx](../src/pages/onboard/OnboardBrandProfile.tsx) — brand profile discarded
- [OnboardPreferences.tsx](../src/pages/onboard/OnboardPreferences.tsx) — duration/platform/framing/quality discarded
- [OnboardVoiceprints.tsx](../src/pages/onboard/OnboardVoiceprints.tsx) — speaker names discarded

There **is** an `onboarding-store.ts` ([src/stores/onboarding-store.ts](../src/stores/onboarding-store.ts)) but no page reads or writes through it.

### 2.4 Settings pages

- [SettingsProfile.tsx](../src/pages/SettingsProfile.tsx) — Name and email default to "Rithvik" / "rithvik@example.com" with no save path.
- [SettingsVoiceprints.tsx](../src/pages/SettingsVoiceprints.tsx) — reads a `MOCK` array, no add/edit persistence.

### 2.5 Auth is non-functional

**Where:** [Login.tsx](../src/pages/Login.tsx), [Signup.tsx](../src/pages/Signup.tsx)

No backend wired. The forms render and the Google button does nothing. There **is** an `auth-store.ts` ([src/stores/auth-store.ts](../src/stores/auth-store.ts)) but the form submit handlers aren't connected.

---

## Priority 3 — Sensible fallbacks (lower urgency)

### 3.1 RunOverview MOCK_PHASES fallback

**Where:** [src/pages/RunOverview.tsx:21,246](../src/pages/RunOverview.tsx#L21)

Used when `phasesFromApi` is empty. Acceptable as a graceful empty-state, but means an unseeded or broken run renders six fake phases instead of an empty/error state. Decide whether to keep as a graceful fallback or replace with a true empty state.

### 3.2 RunGraph RAW_NODES / RAW_EDGES fallback

**Where:** [src/pages/RunGraph.tsx:48,61,165,170](../src/pages/RunGraph.tsx#L48)

Used when `apiNodes` is empty. Same shape as 3.1 — sensible fallback that hides the empty state. This was the source of the disconnected-edges bug fixed in `3ffcf6b` (see [docs/ERROR_LOG.md](ERROR_LOG.md)).

---

## Priority 4 — Cosmetic bugs (Grounding)

Documented in the file header at [src/pages/RunGrounding.tsx:2-10](../src/pages/RunGrounding.tsx#L2-L10):

1. Internal colored bars (speaker turn segments) do not scale proportionally with their outer lane height when dragging the divider.
2. Clip 008 can still get cut off when dragging the divider up — `MIN_VIDEO_H` does not perfectly match the queue panel's rendered height on all viewports.
3. Camera intent: only the header row scales with `laneH`. The content row (intent buttons + Follow/Reaction/Split/Wide selectors) does not resize proportionally — buttons and selects stay fixed-size.

None block use of the page.

---

## What's already done (for reference)

These were either pre-existing or shipped during today's session:

- **Cortex Graph** — fully wired through `useNodeList` + `useEdgeList` (`3ffcf6b`)
- **Search / embedding scatter** — wired through `useEmbeddings`
- **Clip candidates** — wired through `useClipList` + approve/reject mutations
- **Render flow** — wired through `renderApi.presets()` + submit/status mutations
- **Grounding state** — fully persisted via `useGroundingState` / `useUpdateGrounding`. Today's work extended this from box editor only to also cover speaker bindings, camera intents, and manual crops (see [MERGE_NOTES_2026-04-10.md §10](MERGE_NOTES_2026-04-10.md))
- **Mock backend** — `localStorage`-persisted `MockDB` with forward-compat schema merge in `loadDB()`
- **Landing → demo CTA** — `Link to="/runs/demo/timeline"` (`746e7fa`)
- **Demo video gitignore + README** (`b0318f1`)

---

## Recommended order

1. **RunTimeline data path (P1.1)** — biggest win, highest user-facing surface, well-defined shape that mirrors the grounding work.
2. **Onboarding persistence (P2.3)** — small per-page changes, store already exists, completes a visible flow.
3. **Library Clips tab + pagination (P2.1, P2.2)** — either wire it or remove it; current state is misleading.
4. **Settings + Auth (P2.4, P2.5)** — only worth doing if the rest of the app is going to land in front of real users.
5. **Grounding cosmetics (P4)** — polish, last.

Fallback constants in RunOverview / RunGraph (P3) can stay until there's a clear product decision about empty states.
