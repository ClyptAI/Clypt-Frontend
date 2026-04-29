# Architecture

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 18.3 |
| Language | TypeScript | 5.8 |
| Bundler | Vite (SWC plugin) | 8.0 |
| Styling | Tailwind CSS + CSS custom properties | 3.4 |
| Components | shadcn/ui (Radix primitives) | — |
| State (client) | Zustand | 5.0 |
| State (server) | TanStack React Query | 5.83 |
| Routing | React Router DOM | 6.30 |
| Graph viz | @xyflow/react (React Flow) + dagre | 12.10 |
| Animation | Framer Motion | 12.38 |
| Testing | Vitest + Testing Library + Playwright | Vitest 4.1 / Playwright 1.57 |
| Icons | Lucide React | 0.462 |

## Directory Structure

```
src/
├── main.tsx                 # ReactDOM entry — mounts <App />
├── App.tsx                  # Providers + BrowserRouter + route tree
├── index.css                # Global styles, CSS custom properties, Tailwind layers
├── App.css                  # Empty (styles live in index.css)
├── vite-env.d.ts            # Vite client types
│
├── components/
│   ├── NavLink.tsx           # Wrapper around react-router NavLink with activeClassName
│   ├── app/                 # Shell, sidebar, context bar, error boundary, logo, ClipBoundaryEditor
│   ├── auth/                # AuthLayout (login/signup wrapper with embedded graph)
│   ├── embeds/              # Embedding scatter plot, search bar, results panel, inspector
│   ├── graph/               # React Flow nodes, edges, toolbar, legend, inspector, timeline strip
│   ├── landing/             # Landing page sections (hero, phase demos, clip showcase, footer)
│   ├── onboarding/          # OnboardingLayout (step indicator wrapper)
│   ├── settings/            # SettingsLayout + SettingsNav
│   ├── timeline/            # VideoPlayer, WaveformLane, TimeRuler, Playhead
│   └── ui/                  # shadcn/ui primitives (button, input, slider, dialog, etc.)
│
├── hooks/
│   ├── api/                 # TanStack Query hooks (runs, clips, nodes/edges, timeline/all-clips, embeddings, grounding, render)
│   ├── useRunSSE.ts         # Real-time phase updates — EventSource against the real backend, mockRunBus when in mock mode
│   ├── useTimelineKeyboard.ts  # Keyboard shortcuts for timeline
│   ├── useVisibleSegments.ts   # Virtualization for timeline lanes
│   └── use-mobile.tsx       # Responsive breakpoint hook
│
├── lib/
│   ├── api.ts               # Typed fetch wrappers (runsApi, nodesApi, edgesApi, clipsApi, embeddingsApi, timelineApi, allClipsApi, groundingApi, renderApi)
│   ├── timeline-utils.ts    # formatTimecode, snap helpers, waveform path gen
│   └── utils.ts             # cn() — clsx + tailwind-merge
│
├── mocks/                   # Centralized in-memory mock backend (active when VITE_USE_MOCK_API ≠ 'false')
│   ├── store.ts             # MockDB shape + localStorage-persisted singleton
│   ├── seed.ts              # Demo run seed (27-node graph, 8 clips, timeline bundles, 4 render presets)
│   ├── api.ts               # mockRunsApi / mockNodesApi / mockEdgesApi / mockClipsApi / mockEmbeddingsApi / mockTimelineApi / mockAllClipsApi / mockGroundingApi / mockRenderApi
│   └── lifecycle.ts         # mockRunBus — fake phase progression that useRunSSE subscribes to in mock mode
│
├── stores/
│   ├── run-store.ts         # Current run + phase status
│   ├── clip-store.ts        # Clip list + approval overrides
│   ├── timeline-store.ts    # Playhead, zoom, scroll, scrubbing, loop, track expansion
│   ├── auth-store.ts        # Persisted mock session for Login/Signup (localStorage)
│   └── onboarding-store.ts  # Persisted in-flight onboarding flow (channel URL, preferences, voiceprints)
│
├── types/
│   └── clypt.ts             # Domain types mirroring backend Pydantic models
│
├── pages/                   # One file per route (see docs/PAGES.md)
│   ├── Index.tsx            # Landing page
│   ├── Login.tsx / Signup.tsx
│   ├── Library.tsx
│   ├── NewRun.tsx
│   ├── RunOverview.tsx / RunTimeline.tsx / RunGraph.tsx / RunSearch.tsx
│   ├── RunClips.tsx / RunGrounding.tsx / RunRender.tsx
│   ├── SettingsProfile.tsx / SettingsVoiceprints.tsx
│   ├── NotFound.tsx
│   └── onboard/             # 6-step onboarding flow
│
└── test/
    └── setup.ts             # Vitest setup (Testing Library matchers)
```

## Routing Architecture

Routes are defined in `src/App.tsx`. The app has three route groups:

### 1. Public Routes (no layout wrapper)
```
/                          → Index (landing page)
/login                     → Login
/signup                    → Signup
/onboard/channel           → OnboardChannel
/onboard/analyzing         → OnboardAnalyzing
/onboard/brand-profile     → OnboardBrandProfile
/onboard/preferences       → OnboardPreferences
/onboard/voiceprints       → OnboardVoiceprints
/onboard/ready             → OnboardReady
```

### 2. App Shell Routes (sidebar + main content via `<Outlet />`)
```
/library                   → Library
/library/clips             → Library (clips tab)
/runs/new                  → NewRun
/runs/:id                  → RunOverview
/runs/:id/timeline         → RunTimeline
/runs/:id/graph            → RunGraph
/runs/:id/search           → RunSearch
/runs/:id/clips            → RunClips
/runs/:id/grounding        → RunGrounding
/runs/:id/grounding/:clipId → RunGrounding (specific clip)
/runs/:id/render           → RunRender
```

### 3. Settings (nested under SettingsLayout)
```
/settings                  → SettingsProfile (index)
/settings/voiceprints      → SettingsVoiceprints
```

### 4. Catch-all
```
*                          → NotFound
```

## Provider Hierarchy

```
QueryClientProvider          (TanStack Query cache)
  └─ TooltipProvider         (Radix tooltip context)
      ├─ Toaster             (shadcn toast notifications)
      ├─ Sonner              (sonner toast notifications)
      └─ BrowserRouter       (React Router)
           └─ Routes         (route definitions)
```

## Data Flow

### Server State (TanStack Query)

```
Real backend (/v1/...)            Mock mode (default)
        ↑                                ↑
        │ apiFetch()                     │ direct call
        │                                │
        └─── src/lib/api.ts ─── isMockApiEnabled() ──┐
                  │                                  │
                  ↓ runsApi / nodesApi / edgesApi /  ↓ mockRunsApi / mockNodesApi /
                    clipsApi / embeddingsApi /        mockEdgesApi / mockClipsApi /
                    timelineApi / allClipsApi /       mockEmbeddingsApi / mockTimelineApi /
                    groundingApi / renderApi          mockAllClipsApi / mockGroundingApi /
                                                       mockRenderApi
                  ↓                                  ↓
                  └─────── React Query hooks ────────┘
                              src/hooks/api/
                                    ↓
                  Components consume via useRunDetail(),
                  useNodeList(), useEdgeList(), …
```

`USE_MOCK` is on by default — `isMockApiEnabled()` returns `true` unless `VITE_USE_MOCK_API` is explicitly set to `'false'`. When on, every typed API object delegates to its `mock*Api` counterpart in `src/mocks/api.ts`, which reads/writes the in-memory `MockDB` from `src/mocks/store.ts` (persisted to `localStorage` under `clypt:mock-db:v1`). The `MockDB` is seeded once on first import via `seedMockDB()` in `src/mocks/seed.ts` — one demo run (`run_id: "demo"`) plus two secondary runs.

Query keys follow a hierarchical pattern:
- `['runs', 'list']` → all runs
- `['runs', 'detail', runId]` → single run
- `['clips', 'list', runId]` → clips for a run
- `['clips', 'all']` → cross-run clips list used by the Library clips tab
- `['nodes', 'list', runId]` → nodes for a run
- `['edges', 'list', runId]` → edges for a run
- `['embeddings', runId]` → embeddings for a run
- `['timeline', 'detail', runId]` → timeline bundle for a run
- `['render', 'presets']` → render presets
- `['render', 'status', runId, clipId]` → render job status
- `['grounding', 'detail', runId, clipId]` → persisted Grounding-page edits (rect overrides, user-added tracklets, hidden originals)

### Client State (Zustand)

Five stores. The original three (run/clip/timeline) are session-scoped and use `subscribeWithSelector`; `auth-store` and `onboarding-store` are persisted to `localStorage` via `zustand/middleware`'s `persist` and survive reloads.

| Store | Persisted | Purpose | Key State |
|-------|-----------|---------|-----------|
| `useRunStore` | no | Active run context | `currentRunId`, `currentRun`, phase status |
| `useClipStore` | no | Clip management | `clips[]`, `activeClipId`, `approvalOverrides` |
| `useTimelineStore` | no | Timeline playback | `playheadPosition`, `playbackState`, `pixelsPerSecond`, `scrollX`, `isScrubbing`, `loopStart/End`, `expandedTracks` |
| `useAuthStore` | yes | Mock session for Login/Signup | `session`, `isAuthenticated`, `login()/signup()/loginWithGoogle()/logout()` |
| `useOnboardingStore` | yes | In-flight onboarding flow | `channelUrl`, `singleVideoMode`, `videoUrl`, `durationRange`, `platforms`, `framing`, `quality`, `voiceprints[]`, `completedAt` |

### Real-time Updates

`useRunSSE` has two backends:
- **Real mode** (`VITE_USE_MOCK_API=false`): opens an `EventSource` to `/v1/runs/{runId}/events` and reacts to `phase_update` / `run_complete` / `run_failed` / `heartbeat` messages.
- **Mock mode** (default): subscribes to `mockRunBus` from `src/mocks/lifecycle.ts`. The mock lifecycle is started by `mockRunsApi.create()` after a short delay and walks the run through phases 1→6 over a few seconds, emitting the same event shape on the bus.

Either way, payloads are dispatched to `useRunStore.updatePhaseStatus()` and the React Query cache for the run is invalidated.

## API Endpoints

All calls go through `src/lib/api.ts` via typed API objects. Internal `apiFetch()` handles fetch + error wrapping but is not exported. Base URL from `VITE_API_BASE_URL` (default `http://localhost:8080`).

| Method | Path | API Object | Description |
|--------|------|------------|-------------|
| GET | `/v1/runs` | `runsApi.list()` | List all runs |
| GET | `/v1/runs/:id` | `runsApi.get()` | Run detail + phases |
| POST | `/v1/runs` | `runsApi.create()` | Create new run |
| GET | `/v1/runs/:id/nodes` | `nodesApi.list()` | Graph nodes |
| GET | `/v1/runs/:id/nodes/:nodeId` | `nodesApi.get()` | Single node |
| GET | `/v1/runs/:id/edges` | `edgesApi.list()` | Graph edges |
| GET | `/v1/runs/:id/clips` | `clipsApi.list()` | Clip candidates |
| GET | `/v1/runs/:id/clips/:clipId` | `clipsApi.get()` | Single clip |
| POST | `/v1/runs/:id/clips/:clipId/approve` | `clipsApi.approve()` | Approve clip |
| POST | `/v1/runs/:id/clips/:clipId/reject` | `clipsApi.reject()` | Reject clip |
| GET | `/v1/runs/:id/embeddings` | `embeddingsApi.get()` | Node embeddings (falls back to mock) |
| GET | `/v1/runs/:id/timeline` | `timelineApi.get()` | Canonical timeline bundle |
| GET | `/v1/runs/:id/clips/:clipId/grounding` | `groundingApi.get()` | Persisted Grounding-page state (returns empty stub when nothing saved). |
| PUT | `/v1/runs/:id/clips/:clipId/grounding` | `groundingApi.put()` | Upsert full Grounding state (no server-side merge). |
| POST | `/v1/runs/:id/clips/:clipId/render` | `renderApi.submit()` | Submit render job |
| GET | `/v1/runs/:id/clips/:clipId/render` | `renderApi.status()` | Render job status |
| GET | `/v1/render/presets` | `renderApi.presets()` | Available render presets |
| SSE | `/v1/runs/:id/events` | `useRunSSE` hook | Real-time phase updates (real mode only — mock mode uses `mockRunBus`) |

`allClipsApi.list()` powers the `/library/clips` grid. In mock mode it reads from `mockAllClipsApi`; in real mode the cross-run clips endpoint is not defined yet and currently returns an empty list.

## Graph Architecture (Cortex Graph)

The Cortex Graph page (`RunGraph.tsx`) uses React Flow with dagre layout:

1. **Data source:** `useNodeList(runId)` fetches `SemanticGraphNode[]` and `useEdgeList(runId)` fetches `SemanticGraphEdge[]`. When the API returns data, both nodes and edges go through `adaptApiNode()` / `adaptApiEdge()` to produce React Flow shapes; otherwise both fall back to `RAW_NODES` / `RAW_EDGES` together. **Nodes and edges must always come from the same source** — mixing API nodes with hardcoded edges produces orphaned edge endpoints, which the visibility filter (rule 5) silently hides.
2. **Edge type mapping:** `edgeTypeForRf()` collapses the backend `EdgeType` union (`next_turn`, `prev_turn`, `overlaps_with`, `setup_for`, `payoff_of`, `answers`, `callback_to`, `topic_recurrence`, `challenges`, `contradicts`, `supports`, `elaborates`, `reaction_to`, `escalates`) onto the four registered React Flow edge types: `structural` (sequential/temporal), `strong` (setup/payoff/answers), `moderate` (rhetorical relations), `longrange` (callbacks, recurrence).
3. **Layout:** dagre computes `x, y` positions for each node (left-to-right, 90px node sep, 200px rank sep). Disconnected nodes scatter — if the graph looks visually "exploded," check that edges are loading.
4. **Node rendering:** `SemanticNode` component with frosted-glass blur, type-colored border/glow, visible `Handle` dots.
5. **Filtering:** Node type filter via `GraphToolbar`. **Always uses `hidden: true` on React Flow elements, never removes from the array.** Edge visibility mirrors node visibility — `displayEdges` hides any edge whose source or target isn't in `visibleNodeIds`.
6. **Overlay layer:** All UI (toolbar, legend, inspector, timeline strip) wrapped in `pointer-events: none` div at z-50, each component sets `pointer-events: auto` on its root.

## Timeline Architecture

The Timeline page (`RunTimeline.tsx`) is an NLE-style layout:

1. **Video area** (top, resizable via drag divider): `VideoPlayer` component
2. **Transport bar**: play/pause, timecode display, playback rate
3. **Scrub bar**: Waveform-style scrubber with hover preview
4. **Time ruler**: `TimeRuler` with adaptive tick granularity
5. **Lane area** (bottom, scrollable): `WaveformLane` per speaker, plus optional shot/tracklet/emotion/audio-event lanes

All synced through `useTimelineStore` — the single source of truth for playhead position, zoom level, scroll offset, and playback state.

## Onboarding Flow

Six-step flow, each page uses `OnboardingLayout` (step indicator header + centered content):

```
/onboard/channel → /onboard/analyzing → /onboard/brand-profile →
/onboard/preferences → /onboard/voiceprints → /onboard/ready
```

The analyzing step auto-advances after 8 seconds. The ready step navigates to `/runs/new` or `/library`.

## Mock Data Status

There are **two layers** of mock data, and they coexist deliberately.

### Layer 1: centralized in-memory mock backend (`src/mocks/`)

This is what the typed API objects in `src/lib/api.ts` delegate to when `VITE_USE_MOCK_API` is unset or `'true'` (the default). Pages should never import from `src/mocks/` directly — they go through React Query hooks → typed API objects → mock layer.

| File | Purpose |
|------|---------|
| `store.ts` | `MockDB` interface (`runs`, `clips`, `nodes`, `edges`, `renderJobs`, `presets`, `approvals`, `grounding`, `timelines`, `runOrder`) and a singleton instance persisted to `localStorage` under `clypt:mock-db:v1`. Exports `mockDB.get()`, `mockDB.update()`, `mockDB.seedOnce()`. Forward-compat merges new fields onto stale caches via `{...emptyDB(), ...persisted}`. |
| `seed.ts` | One-time seed: a 27-node demo run (`run_id: "demo"`) with synthetic `next_turn` edges plus 7 rhetorical edges, 8 hand-written `ClipCandidate`s, deterministic timeline bundles, two secondary runs, and 4 render presets. Also exports `buildPhaseStatus()` for synthesizing phase arrays. |
| `api.ts` | `mockRunsApi`, `mockNodesApi`, `mockEdgesApi`, `mockClipsApi`, `mockEmbeddingsApi`, `mockTimelineApi`, `mockAllClipsApi`, `mockGroundingApi`, `mockRenderApi` — each mirrors the real API shape with a short simulated latency so loading states render. `isMockApiEnabled()` lives here. |
| `lifecycle.ts` | `mockRunBus` — a fake phase progression. When `mockRunsApi.create()` runs, `startMockRunLifecycle()` walks the new run through phases 1→6 over a few seconds, emitting `phase_update` / `run_complete` events that `useRunSSE` subscribes to in mock mode. |

### Layer 2: page-local mock UI fixtures

Some pages still inline mock data for things the centralized DB doesn't model — signal tag overlays, grounding queues/default assignments, voiceprints, hardcoded profile info, and presentational editor fixtures. These are not duplicates of the mock DB; they're decorative UI fixtures the real API will eventually replace.

- `RunTimeline.tsx`: timeline data is fetched through `useTimelineData`; the page still owns presentational lane/playback UI state and uses the Blob-hosted root demo video for the seeded `demo` run
- `RunGraph.tsx`: `RAW_NODES`, `RAW_EDGES`, `SIGNAL_TAGS` — used **only** as the fallback when `useNodeList` returns an empty array (e.g. an unrecognized `runId`); the demo run hits the mock DB instead
- `RunGrounding.tsx`: `QUEUE`, `SHOTS`, speaker bindings, intents
- `RunRender.tsx`: render-stage UI and preset card layout around API-backed preset/status data
- `useEmbeddings.ts`: `MOCK_EMBEDDINGS` with seeded `mulberry32` PRNG clusters — currently bypasses the mock DB entirely
- `SettingsVoiceprints.tsx`: `MOCK` voiceprints array
- `SettingsProfile.tsx`: hardcoded name/email

Root demo video: `ROOT_DEMO_VIDEO_URL` in `src/lib/demo-media.ts` points at the Vercel Blob-hosted `joeroganflagrant.mp4`. It is used by the seeded demo run, by `ClipBoundaryEditor` as the placeholder cut source, and as the `output_url` returned by the mock render lifecycle. Do not add the 125MB MP4 to Git or rely on a local `/videos/` path for production demos.

### Test-suite caveat

`src/lib/api.test.ts` and `src/hooks/useRunSSE.test.ts` were written before the centralized mock layer existed and assume the real `fetch` / `EventSource` paths. They currently fail in the default test environment because both code paths short-circuit through mock mode. Either disable mock mode via `import.meta.env.VITE_USE_MOCK_API = 'false'` in `test/setup.ts` (preferred) or stub `isMockApiEnabled` per test. Tracked but not yet fixed.

## Orphan Files

These files exist on disk but are not imported by any route:
- `src/pages/RunEmbeds.tsx` — predecessor to `RunSearch.tsx`, no longer routed in `App.tsx`
- `src/components/graph/EdgeMarkers.tsx` — SVG marker defs, no longer rendered
