# AGENTS

Operational startup and maintenance guide for coding agents.

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
- The `RunContextBar` component provides consistent run-level identity/status chrome across all `/runs/:id/*` pages; run-level navigation lives in `AppSidebar`
- `ErrorBoundary` wraps all app-shell routes

### State Management
- **Server state** (runs, nodes/edges, clips, timeline, embeddings, grounding, render): TanStack Query hooks in `src/hooks/api/`
- **Client state** (playhead position, zoom, active clip, approvals): Zustand stores
- **Never** mix: don't put server data in Zustand or UI state in React Query

### API Layer
- All API calls go through `src/lib/api.ts` using the typed API objects (`runsApi`, `nodesApi`, etc.)
- Most endpoints follow the `/v1/runs/{runId}/{resource}` pattern; shared resources like render presets and mock-only cross-run clips are exceptions
- The embeddings endpoint has a built-in fallback to `MOCK_EMBEDDINGS` when the backend is unavailable
- Custom error class: `ClyptApiError` with `status` and `statusText`

### Mock Data
- The centralized in-memory mock backend lives in `src/mocks/` and is the default API path when `VITE_USE_MOCK_API` is not explicitly `false`
- Some pages still contain page-local mock UI fixtures for editor-only details not yet modeled by the mock backend
- The demo run ID is `"demo"` — pages fall back to it when no real data exists
- Mock data uses deterministic seeded PRNGs (`mulberry32`) for reproducibility
- Root demo video: `public/videos/joeroganflagrant.mp4` (about 125MB, ignored by Git, served locally by Vite from `/videos/` when present)

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
Always double-check `.gitignore` coverage before committing to avoid accidental local artifact commits.

## Resolver Rule (Required)

Before implementation work, read `docs/EVALS.md` and use its Task Router to load the right skills for the task.

## Documentation

See `docs/` for detailed documentation:
- `EVALS.md` — lightweight resolver pointers for task-to-skill routing and required eval checks
- `ARCHITECTURE.md` — system architecture and data flow
- `COMPONENTS.md` — component inventory
- `PAGES.md` — page-by-page reference
- `STYLING.md` — design tokens and theme
- `ERROR_LOG.md` — known bugs and their fixes

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Clypt-Frontend** (1239 symbols, 2371 relationships, 52 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/Clypt-Frontend/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/Clypt-Frontend/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Clypt-Frontend/clusters` | All functional areas |
| `gitnexus://repo/Clypt-Frontend/processes` | All execution flows |
| `gitnexus://repo/Clypt-Frontend/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
