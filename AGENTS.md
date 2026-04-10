# AGENTS.md — Clypt Frontend

## Project Overview

Clypt is an AI-powered video analysis and clip generation system. This is the React frontend — a single-page application that provides the UI for the six-phase pipeline: ingesting long-form video, building a semantic graph, retrieving clip candidates, and rendering short-form output.

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Zustand + TanStack Query + React Flow

**Canonical commit:** `43475e5` — this is the known-good baseline (the merge of `main` into `feat/functional-dummy-data` on 2026-04-10, which brought in centralized mocks, the unified Search/Embedding page, the Cortex Graph edges fix, and the timeline divider pointer-events fix). Do not introduce regressions against it. Previous baseline was `3033340` (pre-merge).

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server on http://localhost:8080
npm run build        # Production build
npm run test         # Run vitest (unit tests)
npm run test:watch   # Watch mode
npm run lint         # ESLint
```

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend API base URL (only used when mock mode is off) |
| `VITE_USE_MOCK_API` | `true` | When truthy, every `lib/api.ts` call routes through `src/mocks/api.ts` instead of `fetch`. Set to `false` (or any non-truthy string) to talk to a real backend. |

## Architecture at a Glance

- **Entry:** `src/main.tsx` → `src/App.tsx` (routing, providers)
- **Layout:** Public routes render standalone; app routes render inside `AppShell` (sidebar + `<Outlet />`)
- **State:** Zustand stores (`run-store`, `clip-store`, `timeline-store`, `auth-store`, `onboarding-store`) for local/cross-component state; TanStack Query for server cache
- **API:** `src/lib/api.ts` — typed fetch wrappers against `/v1/` REST endpoints. Defaults to `VITE_USE_MOCK_API=true`, in which case every call short-circuits through `src/mocks/api.ts` against the in-memory mock DB in `src/mocks/store.ts` (seeded once via `src/mocks/seed.ts`, with simulated phase progression in `src/mocks/lifecycle.ts`).
- **Types:** `src/types/clypt.ts` — mirrors backend Pydantic models exactly
- **Styling:** Dark-only theme via CSS custom properties in `src/index.css`; Tailwind maps those vars; no light mode

## Key Conventions

### File Organization
- **Pages** go in `src/pages/` (one file per route, default export)
- **Components** go in `src/components/{domain}/` — `app`, `auth`, `embeds` (embedding scatter + search UI), `graph`, `landing`, `onboarding`, `settings`, `timeline`, `ui`
- **Hooks** go in `src/hooks/` — API hooks in `src/hooks/api/`
- **Stores** go in `src/stores/`
- **Types** go in `src/types/`

### Naming
- Components: PascalCase files matching the default export (`RunGraph.tsx` → `export default function RunGraph()`)
- Hooks: `use` prefix, camelCase (`useClipList`, `useTimelineStore`)
- Stores: `{domain}-store.ts` with a `use{Domain}Store` export
- CSS variables: `--color-{category}` for Clypt tokens, `--node-{type}` for semantic node colors

### Styling Rules
- Use Tailwind utilities first; fall back to inline `style={}` for dynamic values
- Reference CSS variables via `var(--color-*)` — never hardcode hex values for theme colors
- The app is **dark-only** (`#0A0909` background). There is no light theme.
- Font stack: `Bricolage Grotesque` (headings), `Plus Jakarta Sans` (body), `Geist Mono` (data/code), `DM Serif Display` (display/landing)

### Component Patterns
- **shadcn/ui** primitives live in `src/components/ui/` — do not modify these unless necessary
- Graph nodes/edges use custom React Flow components in `src/components/graph/`
- The `RunContextBar` component provides consistent run-level navigation across all `/runs/:id/*` pages
- `ErrorBoundary` wraps all app-shell routes

### State Management
- **Server state** (runs, nodes, clips, embeddings): TanStack Query hooks in `src/hooks/api/`
- **Client state** (playhead position, zoom, active clip, approvals): Zustand stores
- **Never** mix: don't put server data in Zustand or UI state in React Query

### API Layer
- All API calls go through `src/lib/api.ts` using the typed API objects (`runsApi`, `nodesApi`, etc.)
- Endpoints follow `/v1/runs/{runId}/{resource}` pattern
- The embeddings endpoint has a built-in fallback to `MOCK_EMBEDDINGS` when the backend is unavailable
- Custom error class: `ClyptApiError` with `status` and `statusText`

### Mock Data
- Most pages contain inline mock/hardcoded data for demo purposes (no `src/mocks/` directory at this commit)
- The demo run ID is `"demo"` — pages fall back to it when no real data exists
- Mock data uses deterministic seeded PRNGs (`mulberry32`) for reproducibility
- Video file: `public/videos/joeroganflagrant.mp4` (125MB, served by Vite from `/videos/`)

### React Flow (Cortex Graph)
- Layout: dagre (`@dagrejs/dagre`) for automatic node positioning
- Custom node: `SemanticNode` with frosted-glass backdrop blur and node-type coloring
- Custom edges: `edges.tsx` defines `StructuralEdge`, `StrongRhetoricalEdge`, `ModerateRhetoricalEdge`, `LongRangeEdge`; `ClyptEdge` for auth/landing pages
- Shared node component: `ClyptNode` (used in `AuthLayout` and `LandingGraphDemo`)
- Node filtering uses `hidden: true` on React Flow nodes — never remove nodes from the array
- Edge filtering mirrors node visibility via `visibleNodeIds` set
- Overlay UI (toolbar, legend, inspector, timeline strip) sits in a `pointer-events: none` wrapper at `z-index: 50`; each component restores `pointer-events: auto` on its own root

### Video Player
- `VideoPlayer` auto-detects URL type: local paths → `<video>`, YouTube URLs → iframe API
- Local detection: starts with `/`, `./`, `blob:`, or has video extension
- The native player syncs bidirectionally with `useTimelineStore` (playhead, play/pause)
- Use `preload="metadata"` for local video — do NOT use `preload="auto"` (buffers entire file)
- Do NOT set `currentTime` in `loadedmetadata` handlers — this causes seek loops and black frames

## Routing

Public: `/`, `/login`, `/signup`, `/onboard/*` (6 steps)
App shell: `/library`, `/runs/new`, `/runs/:id`, `/runs/:id/timeline`, `/runs/:id/graph`, `/runs/:id/search`, `/runs/:id/clips`, `/runs/:id/grounding`, `/runs/:id/render`
Settings: `/settings`, `/settings/voiceprints`

## Bug Tracking

When fixing a major bug, **always** add an entry to `docs/ERROR_LOG.md` with: symptoms, root cause, fix, affected files, and a preventive rule. This prevents the same class of bug from being reintroduced.

## Documentation

See `docs/` for detailed documentation:
- `ARCHITECTURE.md` — system architecture and data flow
- `COMPONENTS.md` — component inventory
- `PAGES.md` — page-by-page reference
- `STYLING.md` — design tokens and theme
- `ERROR_LOG.md` — known bugs and their fixes
