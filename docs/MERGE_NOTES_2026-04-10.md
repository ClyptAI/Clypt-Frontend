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

Collaborator flagged via Discord screenshot that `clypt-frontend/README.md` still had a stale `https://clypt-v3.lovable.app` URL pointing at the old Lovable preview. Removed the URL line. File touched: `README.md`.

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
- **Push and PR.** Local `feat/functional-dummy-data` is 6 ahead of `origin/feat/functional-dummy-data`. Not pushed yet — waiting on user sign-off before publishing or opening the merge PR back to main.

## 8. Commit summary

| SHA | Author | Type | Description |
|------|--------|------|-------------|
| `3ffcf6b` | me | fix | Wire Cortex Graph edges through the API (4 files). |
| `8f1a6fe` | Codex (reviewed/merged) | fix | Pointer-events timeline divider drag. |
| `95fa226` | me | docs | Drop stale Lovable preview URL from README. |
| `43475e5` | me | merge | Merge `origin/main` into `feat/functional-dummy-data`. No conflicts. |
| (next) | me | docs | Doc reconciliation + ERROR_LOG entry + this merge notes file. |
