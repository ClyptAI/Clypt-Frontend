# Architecture

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 18.3 |
| Language | TypeScript | 5.8 |
| Bundler | Vite (SWC plugin) | 5.4 |
| Styling | Tailwind CSS + CSS custom properties | 3.4 |
| Components | shadcn/ui (Radix primitives) | — |
| State (client) | Zustand | 5.0 |
| State (server) | TanStack React Query | 5.83 |
| Routing | React Router DOM | 6.30 |
| Graph viz | @xyflow/react (React Flow) + dagre | 12.10 |
| Animation | Framer Motion | 12.38 |
| Testing | Vitest + Testing Library + Playwright | — |
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
│   ├── app/                 # Shell, sidebar, context bar, error boundary, logo
│   ├── auth/                # AuthLayout (login/signup wrapper with embedded graph)
│   ├── embeds/              # Embedding scatter plot, inspector, search bar/results
│   ├── graph/               # React Flow nodes, edges, toolbar, legend, inspector, timeline strip
│   ├── landing/             # Landing page sections (hero, demos, features, footer)
│   ├── onboarding/          # OnboardingLayout (step indicator wrapper)
│   ├── settings/            # SettingsLayout + SettingsNav
│   ├── timeline/            # VideoPlayer, WaveformLane, TimeRuler, Playhead
│   └── ui/                  # shadcn/ui primitives (button, input, slider, dialog, etc.)
│
├── hooks/
│   ├── api/                 # TanStack Query hooks (useRuns, useClips, useNodes, useEmbeddings)
│   ├── useRunSSE.ts         # EventSource for real-time phase updates
│   ├── useTimelineKeyboard.ts  # Keyboard shortcuts for timeline
│   ├── useVisibleSegments.ts   # Virtualization for timeline lanes
│   └── use-mobile.tsx       # Responsive breakpoint hook
│
├── lib/
│   ├── api.ts               # Typed fetch wrappers (apiFetch, runsApi, nodesApi, etc.)
│   ├── timeline-utils.ts    # formatTimecode, snap helpers, waveform path gen
│   └── utils.ts             # cn() — clsx + tailwind-merge
│
├── stores/
│   ├── run-store.ts         # Current run + phase status
│   ├── clip-store.ts        # Clip list + approval overrides
│   └── timeline-store.ts    # Playhead, zoom, scroll, scrubbing, loop, track expansion
│
├── types/
│   └── clypt.ts             # Domain types mirroring backend Pydantic models
│
├── pages/                   # One file per route (see docs/PAGES.md)
│   ├── Index.tsx            # Landing page
│   ├── Login.tsx / Signup.tsx
│   ├── Library.tsx
│   ├── NewRun.tsx
│   ├── RunOverview.tsx / RunTimeline.tsx / RunGraph.tsx / RunEmbeds.tsx
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
/runs/:id/embeds           → RunEmbeds
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
Backend API (/v1/...)
  ↓ apiFetch() — src/lib/api.ts
  ↓ runsApi / nodesApi / clipsApi / embeddingsApi / renderApi
  ↓ React Query hooks — src/hooks/api/
  ↓ Components consume via useRunDetail(), useNodeList(), etc.
```

Query keys follow a hierarchical pattern:
- `['runs', 'list']` → all runs
- `['runs', 'detail', runId]` → single run
- `['clips', 'list', runId]` → clips for a run
- `['nodes', 'list', runId]` → nodes for a run
- `['embeddings', runId]` → embeddings for a run

### Client State (Zustand)

Three stores, each with `subscribeWithSelector` middleware:

| Store | Purpose | Key State |
|-------|---------|-----------|
| `useRunStore` | Active run context | `currentRunId`, `currentRun`, phase status |
| `useClipStore` | Clip management | `clips[]`, `activeClipId`, `approvalOverrides` |
| `useTimelineStore` | Timeline playback | `playheadPosition`, `playbackState`, `pixelsPerSecond`, `scrollX`, `isScrubbing`, `loopStart/End`, `expandedTracks` |

### Real-time Updates

`useRunSSE` opens an `EventSource` to `/v1/runs/{runId}/events` and dispatches phase status updates to `useRunStore.updatePhaseStatus()`, then invalidates the React Query cache for that run.

## API Endpoints

All calls go through `src/lib/api.ts` via typed API objects. Internal `apiFetch()` handles fetch + error wrapping but is not exported. Base URL from `VITE_API_BASE_URL` (default `http://localhost:8080`).

| Method | Path | API Object | Description |
|--------|------|------------|-------------|
| GET | `/v1/runs` | `runsApi.list()` | List all runs |
| GET | `/v1/runs/:id` | `runsApi.get()` | Run detail + phases |
| POST | `/v1/runs` | `runsApi.create()` | Create new run |
| GET | `/v1/runs/:id/nodes` | `nodesApi.list()` | Graph nodes |
| GET | `/v1/runs/:id/nodes/:nodeId` | `nodesApi.get()` | Single node |
| GET | `/v1/runs/:id/clips` | `clipsApi.list()` | Clip candidates |
| GET | `/v1/runs/:id/clips/:clipId` | `clipsApi.get()` | Single clip |
| POST | `/v1/runs/:id/clips/:clipId/approve` | `clipsApi.approve()` | Approve clip |
| POST | `/v1/runs/:id/clips/:clipId/reject` | `clipsApi.reject()` | Reject clip |
| GET | `/v1/runs/:id/embeddings` | `embeddingsApi.get()` | Node embeddings (falls back to mock) |
| POST | `/v1/runs/:id/clips/:clipId/render` | `renderApi.submit()` | Submit render job |
| GET | `/v1/runs/:id/clips/:clipId/render` | `renderApi.status()` | Render job status |
| GET | `/v1/render/presets` | `renderApi.presets()` | Available render presets |
| SSE | `/v1/runs/:id/events` | `useRunSSE` hook | Real-time phase updates |

## Graph Architecture (Cortex Graph)

The Cortex Graph page (`RunGraph.tsx`) uses React Flow with dagre layout:

1. **Data source:** `useNodeList(runId)` fetches `SemanticGraphNode[]` from the API
2. **Layout:** dagre computes `x, y` positions for each node (left-to-right, 90px node sep, 200px rank sep)
3. **Node rendering:** `SemanticNode` component with frosted-glass blur, type-colored border/glow, visible `Handle` dots
4. **Edge rendering:** Four custom edge types in `edges.tsx` — structural (bezier, curvature 0.2), strong rhetorical (animated dashes), moderate rhetorical (animated dashes), long-range (dashed, subtle)
5. **Filtering:** Node type filter via `GraphToolbar`; uses `hidden: true` on React Flow elements, never removes from array
6. **Overlay layer:** All UI (toolbar, legend, inspector, timeline strip) wrapped in `pointer-events: none` div at z-50, each component sets `pointer-events: auto` on its root

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

At this commit (`3033340`), there is **no centralized mock database** (`src/mocks/` does not exist). Mock data is inlined in individual page files:

- `RunTimeline.tsx`: `MOCK_SPEAKERS`, `MOCK_SHOTS`, tracklets, emotions, audio events
- `RunGraph.tsx`: `RAW_NODES`, `RAW_EDGES`, `SIGNAL_TAGS`
- `RunClips.tsx`: `CLIPS` array
- `RunGrounding.tsx`: `QUEUE`, `SHOTS`, speaker bindings
- `RunRender.tsx`: `CLIPS`, render stage mock
- `RunOverview.tsx`: `MOCK_PHASES`
- `Library.tsx`: `mockRuns`, `mockClips`
- `useEmbeddings.ts`: `MOCK_EMBEDDINGS` with seeded PRNG clusters
- `RunEmbeds.tsx`: embedding scatter with inspect panel
- `SettingsVoiceprints.tsx`: `MOCK` voiceprints array
- `SettingsProfile.tsx`: hardcoded name/email

Local video: `public/videos/joeroganflagrant.mp4` (125MB) — used by the demo run.

## Orphan Files

These files exist on disk but are not imported by any route:
- `src/pages/RunSearch.tsx` — successor to `RunEmbeds.tsx`, not wired in `App.tsx`
- `src/components/graph/EdgeMarkers.tsx` — SVG marker defs, no longer rendered
