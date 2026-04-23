# Merge Notes — 2026-04-10

Merge of `origin/main` into `feat/functional-dummy-data`. Resulting baseline commit: **`43475e5`**.

This document records every change made on the feat side leading up to the merge, the merge itself, and every doc edit applied afterward to keep the docs in sync with the merged code.

---

## 1. Pre-merge state

- Local feat branch was at `fc396e8` ("fixed grounding bug + node/clip confusion").
- `origin/main` had moved ahead with two commits the feat branch hadn't seen:
  - `9e79b24` — `docs: add AGENTS.md and comprehensive project documentation` (Rithvik). Adds `AGENTS.md` plus `docs/{ARCHITECTURE,COMPONENTS,PAGES,STYLING,ERROR_LOG}.md`.
  - `4c4c1f4` — `feat: unified Search + Embedding Space page replacing Embeds`. Replaces the standalone `RunEmbeds` page with a new `RunSearch` page that combines the scatter view with semantic search; adds `SearchBar`, `SearchResultsPanel`, tweaks `EmbedScatter` and `EmbedInspectPanel`, and rewires `App.tsx` + `AppSidebar.tsx`.
- Merge base: `3033340`.

The two sides touched mostly disjoint files, so the merge was always going to be clean — but the feat branch had three open issues that needed to land first (so the docs being merged in would describe accurate code).

## 2. Pre-merge fixes staged on feat

### 2.1 `3ffcf6b` — `fix(graph): wire Cortex Graph edges through the API`

The Cortex Graph rendered nodes but no edges (a friend caught the regression in a screenshot). Root cause and full fix are documented in `docs/ERROR_LOG.md`. Files touched:

- `src/mocks/api.ts` — added `mockEdgesApi.list(runId)`.
- `src/lib/api.ts` — added typed `edgesApi.list(runId)`.
- `src/hooks/api/useNodes.ts` — added `useEdgeList` query hook.
- `src/pages/RunGraph.tsx` — added `edgeTypeForRf()`, `adaptApiEdge()`, the `usingApiData` flag, the `sourceEdges` memo, and an effect that re-syncs `useEdgesState` when the source flips between API and constant.

Type-checks clean. Confirmed visually against a freshly seeded run.

### 2.2 `8f1a6fe` — `fix(timeline): use pointer events for divider drag so it survives the iframe player`

Codex's fix for the glitchy timeline divider. Reviewed and merged after verifying all four mechanics were correct:

- `MouseEvent` → `PointerEvent` so the drag survives crossing into the YouTube iframe.
- `setPointerCapture()` on the handle so subsequent move/up events route to the same element.
- `useEffect`-managed window listeners keyed on `[isDividerDragging, minVideoH, MAX_VIDEO_H]` (replaces the prior `useRef`-only approach which had a stale `MAX_VIDEO_H` closure).
- A fixed-position full-screen overlay div mounted at `z-index: 80` only while dragging, so the iframe never steals pointer events.
- `touchAction: 'none'` on the handle for trackpad/touch devices.

File touched: `src/pages/RunTimeline.tsx`. Type-checks clean.

### 2.3 `95fa226` — `docs: drop stale Lovable preview URL from README`

Collaborator flagged via Discord screenshot that `README.md` still had a stale `https://clypt-v3.lovable.app` URL pointing at the old Lovable preview. Removed the URL line. File touched: `README.md`.

## 3. Demo video verification

Per request, every page that previews video against the dummy data now points at `/videos/joeroganflagrant.mp4`. Audited and confirmed — no edits needed:

- `src/pages/RunTimeline.tsx`
- `src/pages/RunGrounding.tsx`
- `src/pages/RunRender.tsx`
- `src/components/app/ClipBoundaryEditor.tsx` (default `videoSrc`)
- `src/mocks/seed.ts` (run fixtures)

`public/videos/joeroganflagrant.mp4` is already in the repo.

## 4. The merge

```
git checkout main && git pull --ff-only origin main
git checkout feat/functional-dummy-data
git merge --no-ff main
```

Result: **`43475e5`** — `merge: pull main (docs + Search/Embedding page) into feat/functional-dummy-data`. **No conflicts.** The two sides happened to touch fully disjoint files at the line level:

- Main side added new files (`docs/*.md`, `AGENTS.md`, `RunSearch.tsx`, `SearchBar.tsx`, `SearchResultsPanel.tsx`) and made small surgical edits to `App.tsx`, `AppSidebar.tsx`, `EmbedScatter.tsx`, `EmbedInspectPanel.tsx`.
- Feat side never touched any of those files in the same regions.

`tsc --noEmit` is clean against the merge commit.

## 5. Post-merge test status

`npm run test` reports **12 pre-existing failures** in two files. **These are not caused by the merge** — confirmed by diffing the test files against `fc396e8` (`git diff fc396e8 HEAD --stat -- src/lib/api.test.ts src/hooks/useRunSSE.test.ts`), which shows zero changes to either test file across the merge.

- `src/lib/api.test.ts` (6 failures) — stubs the global `fetch` and asserts URLs/bodies, but every call short-circuits through the centralized mock layer because `VITE_USE_MOCK_API` defaults to truthy.
- `src/hooks/useRunSSE.test.ts` (6 failures) — same root cause: stubs `EventSource`, but mock mode never instantiates one.

Both test files were written before the centralized mock layer in `src/mocks/` existed, and were never updated to opt out of it. Recommended fix (tracked, not yet applied):

> Set `import.meta.env.VITE_USE_MOCK_API = 'false'` in `test/setup.ts` so the real `fetch`/`EventSource` paths run during unit tests, while the dev server keeps mock mode on by default.

Per-test stubbing of `isMockApiEnabled` would also work but is more invasive.

## 6. Doc reconciliation (post-merge edits to keep docs in sync with merged code)

The docs that landed via `9e79b24` were written against `main`'s state, not `feat`'s. After the merge they describe a smaller surface area than what actually exists on disk (no centralized mock layer, no edges API, no Cortex Graph edges fix, no `ClipBoundaryEditor`, etc.). I edited them in place rather than as a separate follow-up PR.

### 6.1 `docs/ARCHITECTURE.md`
- Updated the `src/` directory tree: added `mocks/` section (`api.ts`, `lifecycle.ts`, `seed.ts`, `store.ts`), expanded `stores/` to list all five stores, added `ClipBoundaryEditor` mention under `components/app/`, added `useEdgeList` and `useRender` to the api hooks list, added `edgesApi` to the `lib/api.ts` description.
- Rewrote the **Server State** section: added a dual-path mock-mode diagram, expanded the query keys list (added `edges`, `render`), expanded the **Client State** table to all 5 stores with a persistence column.
- Added a `GET /v1/runs/:id/edges → edgesApi.list()` row to the endpoint table; updated the SSE row to note mock-mode behavior.
- Rewrote the **Cortex Graph** section: added `useEdgeList`, the rule "Nodes and edges must always come from the same source", the edge type mapping bullet, and strengthened the visibility-filter rule.
- Replaced the **Mock Data Status** section with a two-layer explanation: (1) the centralized in-memory mock backend with a file table, (2) the page-local UI fixtures, plus the test-suite caveat documenting the pre-existing failures from §5.
- The **Orphan Files** section was reviewed and left unchanged — the existing entry for `RunEmbeds.tsx` ("no longer routed in `App.tsx`") is now exactly accurate after main's `4c4c1f4` switched the route to `RunSearch`.

### 6.2 `docs/COMPONENTS.md`
- Added a `ClipBoundaryEditor` row under the `src/components/app/` table describing its purpose, the looping `<video>` preview, the placeholder default `videoSrc`, and the `onBoundaryChange` callback.

### 6.3 `AGENTS.md`
- Bumped the **Canonical commit** pin from `3033340` to `43475e5`, with a one-line explanation of what that baseline contains.
- Updated the **State** bullet to list all five Zustand stores (was missing `auth-store` and `onboarding-store`).
- Updated the **API** bullet to describe the `VITE_USE_MOCK_API` short-circuit behavior and point at the four files in `src/mocks/`.
- Added a `VITE_USE_MOCK_API` row to the **Environment** table.

### 6.4 `docs/ERROR_LOG.md`
- Added the first entry: the Cortex Graph edges-gone bug — symptoms, root cause, fix, affected files, and a preventive rule about coupling node and edge data sources in any React Flow surface.

## 7. Open follow-ups (not blocking the merge)

- **Test suite repair.** Apply the `VITE_USE_MOCK_API = 'false'` fix in `test/setup.ts` to bring `api.test.ts` and `useRunSSE.test.ts` back to green. Pre-existing, but worth fixing in a small follow-up.
- **`src/pages/RunEmbeds.tsx`.** Officially orphan as of `4c4c1f4`. Already documented under **Orphan Files** in `ARCHITECTURE.md`. Safe to delete in a small cleanup PR — left in place for now in case anything is still cherry-picking from it.
- **`src/components/graph/EdgeMarkers.tsx`.** Same status — orphan, already documented. Same recommendation.
- ~~**Push and PR.** Local `feat/functional-dummy-data` is 6 ahead of `origin/feat/functional-dummy-data`. Not pushed yet — waiting on user sign-off before publishing or opening the merge PR back to main.~~ **Done in §9.4** — branch is now pushed (`origin/feat/functional-dummy-data` at `1db1584`). PR back to `main` still pending.

## 8. Commit summary (merge + reconciliation)

| SHA | Author | Type | Description |
|------|--------|------|-------------|
| `3ffcf6b` | me | fix | Wire Cortex Graph edges through the API (4 files). |
| `8f1a6fe` | Codex (reviewed/merged) | fix | Pointer-events timeline divider drag. |
| `95fa226` | me | docs | Drop stale Lovable preview URL from README. |
| `43475e5` | me | merge | Merge `origin/main` into `feat/functional-dummy-data`. No conflicts. |
| `8b4e334` | me | docs | Reconcile AGENTS/ARCHITECTURE/COMPONENTS with merged feat state + log edges bug. |
| `29b7e3b` | me | docs | Add this `MERGE_NOTES_2026-04-10` file. |

---

## 9. Post-merge follow-on work (same day)

After the merge + doc reconciliation landed, three more pieces of frontend work shipped on the same branch in the same session. These are independent of the merge — they're tracked here because they happened the same day and finish out the spec the user wanted ("finish the frontend today").

### 9.1 `746e7fa` — `feat(landing): route "See a demo" CTA into the seeded /runs/demo/timeline editor`

The Hero CTA was a dead in-page anchor (`href="#demo"` with no matching `id="demo"`). Replaced with a React Router `<Link to="/runs/demo/timeline">` that drops the user straight into the seeded demo run's editor.

**Black-video bug surfaced and fixed in the same commit.** The seeded demo run carries `source_url: 'https://youtube.com/watch?v=demo412'` (a fake YouTube URL kept around for the context-bar label). The old precedence in `RunTimeline.tsx` was `runDetail?.source_url ?? DEMO_VIDEO_URL`, so the truthy fake URL was winning and feeding the player a YouTube ID that doesn't exist → black iframe. Inverted the precedence for `runId === "demo"` so the local mp4 always wins for playback, and surfaced a friendly `"Joe Rogan × Flagrant (demo)"` label in the context bar instead of the fake URL.

Files: `src/components/landing/Hero.tsx`, `src/pages/RunTimeline.tsx`, plus untracking the broken `public/videos/joeroganflagrant.mp4` blob (see §9.2).

### 9.2 `b0318f1` — `chore(videos): gitignore demo video binaries; add README`

Even after §9.1's precedence fix the video was still black on Windows. Root cause was deeper: `public/videos/joeroganflagrant.mp4` had been committed as a git **symlink** (mode `120000`) pointing at the absolute macOS path `/Users/rithvik/Clypt-V3/videos/joeroganflagrant.mp4`. On Rithvik's Mac the symlink resolved to a real file. On Windows — where symlinks need admin privileges — git materialized it as a 51-byte text blob containing the path string, which `<video>` happily served as a black frame.

Resolution:
- `git rm --cached public/videos/joeroganflagrant.mp4` to drop the symlink blob.
- Added `public/videos/*.mp4` + `!public/videos/.gitkeep` to `.gitignore`.
- Added `public/videos/.gitkeep` so the empty folder still ships.
- Added `public/videos/README.md` documenting the convention, the fresh-checkout setup, and the symlink history (so nobody re-commits one).
- At that point: copied the real ~125 MB mp4 from a local download into `public/videos/`. Today the large root demo file is still local-only, but the landing-specific clips/posters now live in tracked repo paths under `public/videos/landing/` and `public/images/landing-posters/`.

### 9.3 `1db1584` — `feat(grounding): manual bounding box editor with per-shot drag/resize/add/delete`

Lets users correct the tracker output on the Grounding page when the model puts a box in the wrong place or misses a person entirely. Boxes are stored in normalized 0..1 coordinates so they survive any container resize.

**New types and constants** at the top of `RunGrounding.tsx`:
- `BoxRect = { x, y, w, h }`, `ResizeHandle = "nw" | "n" | ... | "w"`
- `DEFAULT_BOX_POSITIONS` (initial fallback rects for the original tracker tracklets), `DEFAULT_NEW_BOX` (centered 25%×50% rect for newly added boxes), `MIN_BOX_SIZE` (clamps tiny boxes), `clampRect()` helper.

**`EditableBox` component** (new, ~180 lines):
- 8 resize handles (`nw/n/ne/e/se/s/sw/w`) plus a move drag surface, all sharing a single `dragRef` so the active handle owns the gesture.
- Pointer-capture based (`setPointerCapture`/`releasePointerCapture`) — same pattern as the timeline divider fix in §2.2, so drags survive crossing into other regions.
- Per-box delete (`×`) button visible only when selected, letter label and bound-speaker name badge.
- `pointerEvents: "none"` when not in edit mode so the underlying queue/video stay clickable.

**Rewritten `BoundingBoxOverlay`** that takes the shot, bindings, speakerNames, plus per-shot `userTracklets`/`hiddenIds`/`rects`/`editMode`/`selectedTrackletId` and `onUpdateRect`/`onSelect`/`onDelete` callbacks. The effective tracklet list is `(originals - hiddenIds) ∪ userTracklets`, so the editor can both prune the model's tracklets and add new ones.

**State + helpers in the main `RunGrounding` component:**
- `trackletBoxes: Record<shotIdx, Record<trackletId, BoxRect>>` — rect overrides
- `userTracklets: Record<shotIdx, Tracklet[]>` — boxes the user added on top of the model's output
- `hiddenIdsByShot: Record<shotIdx, string[]>` — original tracklets the user removed
- `boxEditMode` / `selectedBoxKey` — global toggle and `"shotIdx:trackletId"` selection
- `handleAddBox(shotIdx)` picks the next free letter past the originals + extras (D, E, …), assigns a unique id, drops a centered default rect, selects the new box, and auto-enables edit mode.
- `handleDeleteBox(shotIdx, trackletId)` distinguishes originals (added to `hiddenIdsByShot`, recoverable in principle) from user-added (fully removed), and **also clears any speaker bindings** that referenced the deleted tracklet for that shot.

**Floating glass toolbar** at top-right of the video container, mirroring the Queue panel's glass styling on the left. Two buttons: `[⌬ Edit boxes]` toggle (turns violet when active, deselects on toggle off) and `[+ Add box]` (disabled until edit mode is on).

Coexists with the existing `ManualCropModal` — they're independent state.

### 9.4 Push

`git push` of all 11 commits ahead of origin landed cleanly:
```
fc396e8..1db1584  feat/functional-dummy-data -> feat/functional-dummy-data
```

PR back to `main` is **still pending** — the user has not asked for it yet.

## 10. Grounding state persistence (server round-trip)

After §9.3 shipped the box editor, all of its state was still living in component-local `useState` slices on `RunGrounding`. That meant any user edit was destroyed the moment the page unmounted (queue switch, navigation, reload). User picked **Option B** of the persistence design — a real round-trip through the typed API + mock backend, so the same code path will work against the real backend whenever it lands.

### 10.1 New domain types ([src/types/clypt.ts](../src/types/clypt.ts))

Added the wire format for persisted Grounding edits:

```ts
export interface BoundingBoxRect { x: number; y: number; w: number; h: number }  // all 0..1
export interface GroundingTracklet { id: string; letter: string; duration_pct: number }
export interface GroundingShotState {
  shot_idx: number
  rects: Record<string, BoundingBoxRect>
  user_tracklets: GroundingTracklet[]
  hidden_tracklet_ids: string[]
}
export interface GroundingClipState {
  run_id: string
  clip_id: string
  shots: GroundingShotState[]
  updated_at: string  // ISO 8601
}
```

The wire shape is **shots-as-array** (matching the rest of the snake-case API) even though the in-component slices were originally shot-keyed maps — conversion happens at the page boundary.

### 10.2 Mock backend ([src/mocks/store.ts](../src/mocks/store.ts), [seed.ts](../src/mocks/seed.ts), [api.ts](../src/mocks/api.ts))

- `MockDB` gets a new field: `grounding: Record<string, GroundingClipState>` keyed by `${runId}:${clipId}`. The forward-compat `{...emptyDB(), ...persisted}` merge in `loadDB()` fills this in for stale `clypt:mock-db:v1` caches automatically — no migration needed.
- `seedMockDB()` initializes `db.grounding = {}` explicitly.
- `mockGroundingApi.get(runId, clipId)` returns the saved state if any, otherwise an **empty stub** (`{ shots: [], updated_at: epoch }`) — never 404. The page treats "no overrides" as "use the model output as-is", so a missing record is the normal case.
- `mockGroundingApi.put(runId, clipId, state)` upserts the full payload, stamps `updated_at = now()`, and writes through `mockDB.update()` (which persists to `localStorage` and notifies listeners).

### 10.3 Real-mode wrappers ([src/lib/api.ts](../src/lib/api.ts))

```ts
export const groundingApi = {
  get(runId, clipId): Promise<GroundingClipState> { ... apiFetch(`/v1/runs/${runId}/clips/${clipId}/grounding`) }
  put(runId, clipId, state): Promise<GroundingClipState> { ... apiFetch(..., { method: 'PUT', body: JSON.stringify(state) }) }
}
```

### 10.4 React Query hooks ([src/hooks/api/useGrounding.ts](../src/hooks/api/useGrounding.ts))

New file with two exports:

- `useGroundingState(runId, clipId)` — `useQuery` keyed on `['grounding', 'detail', runId, clipId]`, enabled when both ids are present.
- `useUpdateGrounding(runId, clipId)` — `useMutation` with **optimistic updates**: `onMutate` cancels in-flight queries, snapshots the previous cache value, and writes the next state straight into the cache so the UI stays snappy across drag/resize. `onError` restores the snapshot. `onSettled` invalidates the query to re-fetch the truth.

Re-exported from `src/hooks/api/index.ts`.

### 10.5 Page rewrite ([src/pages/RunGrounding.tsx](../src/pages/RunGrounding.tsx))

- Deleted the three `useState` slices (`trackletBoxes`, `userTracklets`, `hiddenIdsByShot`) plus their handler bodies.
- Added `useGroundingState(runId, activeClip || clipId)` and `useUpdateGrounding(...)`. Pure UI state (`boxEditMode`, `selectedBoxKey`) stays as `useState` since it shouldn't survive navigation.
- Two new helpers: `getShotState(state, shotIdx)` (returns the matching shot or an empty stub) and `replaceShot(state, shotIdx, fn)` (immutable upsert of one shot inside the `GroundingClipState`).
- Each handler (`handleUpdateRect`, `handleDeleteBox`, `handleAddBox`) now builds the **full next `GroundingClipState`** and calls `updateGrounding.mutate(next)`. No partial server-side merging — the wire format is "send the whole thing".
- The overlay mount converts `GroundingTracklet[]` (snake_case wire) → `Tracklet[]` (camelCase UI type) via a tiny inline `.map()`.
- `safeGrounding` memo gives the rest of the page a non-null placeholder while the first `GET` is in flight (mock mode resolves instantly, but real mode might not).

### 10.6 Doc edits

- `docs/ARCHITECTURE.md`: added `groundingApi` to the `api.ts` description, two new rows to the endpoint table (`GET`/`PUT /v1/runs/:id/clips/:clipId/grounding`), `grounding` to the `MockDB` field list, the new query key to the hierarchical list.
- `docs/PAGES.md`: Grounding entry now says the box editor state is server-persisted via the hook pair, not local `useState`.
- This section.

### 10.7 Verification

- `npx tsc --noEmit` — clean.
- Existing localStorage carrying the old `clypt:mock-db:v1` shape boots without manual reset (forward-compat merge in `loadDB`).
- Bindings still live in component-local state (not persisted) — the deletion-cascade cleanup happens alongside the mutation, but bindings themselves are out of scope for this round.

### 10.8 Follow-on: extend `GroundingClipState` to bindings, camera intents, manual crops

Before §10 the persisted blob only carried box-editor state (rects, user tracklets, hidden ids). Everything *else* the user did on the Grounding page — speaker bindings, camera intent selections, manual crop boxes — was still local `useState` and got thrown away on navigation. This sub-section extends the same persistence path to all three.

**Wire types ([src/types/clypt.ts](../src/types/clypt.ts))** — `GroundingShotState` gains three optional fields:

```ts
bindings?: GroundingBinding[]
intent?:   GroundingIntent
manual_crop?: GroundingCropPosition
```

`undefined` is meaningful: it means "the user has not touched this aspect of this shot, fall back to the seed default". An explicit empty array (or new value) means "user touched it, persist it as-is". This keeps the wire payload sparse (untouched shots round-trip as empty objects) and lets the seed evolve independently of saved state. New supporting types: `GroundingBinding`, `GroundingIntentType`, `GroundingIntent`, `GroundingCropPosition`. Bindings and crops share the wire shape with the local UI types, so no conversion is needed at the boundary; intents do need a converter because the local UI uses camelCase (`reactOn`, `splitLeft`) and the wire uses snake_case (`react_on`, `split_left`).

**Page wiring ([src/pages/RunGrounding.tsx](../src/pages/RunGrounding.tsx))**:

- Deleted the `useState` slices for `bindings`, `intents`, `manualCrops`. `cropModal` and `speakerNames` stay local — they're pure UI state.
- New module-level converters `intentToWire` / `intentFromWire` translate between camelCase `ShotIntent` and snake_case `GroundingIntent`.
- Three new effective-state memos merge seed defaults with persisted overrides:
  - `effectiveBindings: Record<number, Binding[]>` — starts from `getInitialBindings()`, overlays per-shot persisted bindings where present.
  - `effectiveIntents: ShotIntent[]` — per-shot, prefers persisted intent (passed through `intentFromWire`), falls back to seed.
  - `effectiveCrops: Record<number, CropPosition>` — populated only for shots with a persisted `manual_crop`.
- Four new persisted handlers replace the old setters: `handleAddBinding`, `handleRemoveBinding`, `updateIntent`, `handleSaveCrop`. Each builds the next `GroundingClipState` via `replaceShot` and calls `updateGrounding.mutate(next)`. `updateIntent` reads the *effective* current value first so a partial patch (e.g. `{ intent: 'Follow' }`) merges with the prior shape instead of clobbering it. `handleSaveCrop` writes both `manual_crop` and `intent: { ...current, cropSet: true }` in the same mutation so the "Set" indicator updates atomically.
- `handleDeleteBox` cascades binding removal into the same `replaceShot` callback (instead of a second `setBindings` call), reading `shot.bindings ?? SEED_BINDINGS[shotIdx] ?? []`. The cascade is **only** applied when at least one binding is actually removed — otherwise `shot.bindings` stays `undefined` so it keeps falling through to the seed.
- All read sites updated: progress counters, the active-shot intent display, the camera intent buttons/config, the shot-strip "all bound" check, the overlay mount, and the `ManualCropModal` initial value.

**Result.** Everything the user does on the Grounding page now survives navigation, queue switches, and full page reloads via the same `localStorage`-backed mock store the box editor uses. The page is "done" in the sense that no state is silently dropped.

`npx tsc --noEmit` — clean.

## 11. Full commit summary (everything shipped today)

| SHA | Type | Description |
|------|------|-------------|
| `3ffcf6b` | fix | Wire Cortex Graph edges through the API. |
| `8f1a6fe` | fix | Pointer-events timeline divider drag (Codex, reviewed). |
| `95fa226` | docs | Drop stale Lovable preview URL from README. |
| `43475e5` | merge | Merge `origin/main` into `feat/functional-dummy-data`. |
| `8b4e334` | docs | Reconcile AGENTS/ARCHITECTURE/COMPONENTS + log edges bug. |
| `29b7e3b` | docs | Add `MERGE_NOTES_2026-04-10` file (this file). |
| `746e7fa` | feat | "See a demo" CTA → `/runs/demo/timeline` + black-iframe precedence fix. |
| `b0318f1` | chore | Gitignore demo video binaries + README explaining the convention. |
| `1db1584` | feat | Manual bounding box editor on the Grounding page (§9.3). |
| `ddc1737` | docs | Log post-merge follow-on work in MERGE_NOTES §9. |
| `fb5e0c9` | feat | Persist Grounding box-editor state through the typed API + mock backend (§10). |
| `d97532d` | feat | Extend Grounding persistence to bindings, camera intents, manual crops (§10.8). |
