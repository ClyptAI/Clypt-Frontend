# Frontend Punch List — 2026-04-10

State of the frontend at the end of the 2026-04-10 work session, after the Grounding persistence work landed in `main` (commits `fb5e0c9`, `d97532d`, `d91bcd6`).

This is a dated punch list, not the canonical current-state reference. Items below have been refreshed where later work changed their status; for the active architecture, use [ARCHITECTURE.md](ARCHITECTURE.md) and [PAGES.md](PAGES.md).

---

## Priority 1 — Remaining real data gaps

### 1.1 RunTimeline timeline API path exists; editor fixtures remain

**Where:** [src/pages/RunTimeline.tsx:30-93](../src/pages/RunTimeline.tsx#L30-L93)

Current status: the Phase 1 timeline data path now exists. `src/lib/api.ts` exposes `timelineApi.get(runId)`, `src/hooks/api/useTimeline.ts` exposes `useTimelineData(runId)`, and `src/mocks/api.ts` exposes `mockTimelineApi.get(runId)`.

Remaining gap: the Timeline page still has some editor/UI fixture behavior around lane presentation and local demo video playback. The root demo video remains local-only at `public/videos/joeroganflagrant.mp4`.

**Impact:** Timeline is one of the highest-visibility editor pages. Its canonical data path is now wired, but the remaining local fixtures and local-only demo video still matter for production demo quality.

The highest-leverage remaining piece is deciding whether the production demo workspace should keep using the local-only root demo video or move that video to Blob later.

---

## Priority 2 — Stubs that visibly lie to the user

### 2.1 Library Clips tab is wired through the mock/API layer

**Where:** [src/pages/Library.tsx:20-31](../src/pages/Library.tsx#L20-L31), [240-282](../src/pages/Library.tsx#L240-L282)

Current status: the Clips tab uses `useAllClips()`, which calls `allClipsApi.list()`. In mock mode, that resolves through `mockAllClipsApi`; in real mode the cross-run endpoint is not defined yet and currently returns an empty list.

### 2.2 Library pagination removed

**Where:** [src/pages/Library.tsx:227-235](../src/pages/Library.tsx#L227-L235), [272-280](../src/pages/Library.tsx#L272-L280)

Current status: the fake pagination controls are gone.

### 2.3 Onboarding flow persists key setup state

The onboarding store is now used by:
- [OnboardChannel.tsx](../src/pages/onboard/OnboardChannel.tsx) — channel URL, single-video mode, and video URL
- [OnboardPreferences.tsx](../src/pages/onboard/OnboardPreferences.tsx) — duration, platforms, framing, and quality
- [OnboardVoiceprints.tsx](../src/pages/onboard/OnboardVoiceprints.tsx) — saved voiceprints
- [OnboardReady.tsx](../src/pages/onboard/OnboardReady.tsx) — prefilled URL selection and completion timestamp

Remaining gap: the visual brand-profile step is still mostly presentational.

### 2.4 Settings pages

- [SettingsProfile.tsx](../src/pages/SettingsProfile.tsx) — Name and email default to "Rithvik" / "rithvik@example.com" with no save path.
- [SettingsVoiceprints.tsx](../src/pages/SettingsVoiceprints.tsx) — reads a `MOCK` array, no add/edit persistence.

### 2.5 Auth is still mock-only

**Where:** [Login.tsx](../src/pages/Login.tsx), [Signup.tsx](../src/pages/Signup.tsx)

No real backend is wired yet, but the forms are now connected to the local `auth-store.ts` ([src/stores/auth-store.ts](../src/stores/auth-store.ts)). Email/password and Google actions drive the mock auth flow and route into the app/onboarding correctly. The remaining gap is real authentication, not dead UI wiring.

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

These were either pre-existing or shipped in later sessions:

- **Cortex Graph** — fully wired through `useNodeList` + `useEdgeList` (`3ffcf6b`)
- **Timeline API path** — `timelineApi`, `mockTimelineApi`, `MockDB.timelines`, and `useTimelineData`
- **Search / embedding scatter** — wired through `useEmbeddings`
- **Clip candidates** — wired through `useClipList` + approve/reject mutations
- **Render flow** — wired through `renderApi.presets()` + submit/status mutations
- **Grounding state** — fully persisted via `useGroundingState` / `useUpdateGrounding`. The grounding persistence work extended this from box editor only to also cover speaker bindings, camera intents, and manual crops (see [MERGE_NOTES_2026-04-10.md §10](MERGE_NOTES_2026-04-10.md))
- **Mock backend** — `localStorage`-persisted `MockDB` with forward-compat schema merge in `loadDB()`
- **Library Clips tab** — wired through `useAllClips` / `mockAllClipsApi`
- **Onboarding setup state** — channel, preferences, voiceprints, and ready-state completion use `onboarding-store`
- **Landing → demo CTA** — `Link to="/runs/demo/timeline"` (`746e7fa`)
- **Demo video gitignore + README** (`b0318f1`)

---

## Recommended order

1. **Real cross-run clips endpoint** — `useAllClips` is wired, but real mode still returns an empty list until the backend contract exists.
2. **Production demo video decision** — keep `public/videos/joeroganflagrant.mp4` local-only for dev/demo work or move the root demo workspace video to Blob later.
3. **Settings + Auth (P2.4, P2.5)** — only worth doing if the rest of the app is going to land in front of real users.
4. **Grounding cosmetics (P4)** — polish, last.

Fallback constants in RunOverview / RunGraph (P3) can stay until there's a clear product decision about empty states.
