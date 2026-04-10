# Components

Complete inventory of all components grouped by domain.

## `src/components/app/` — Application Shell

| Component | File | Description |
|-----------|------|-------------|
| `AppShell` | `AppShell.tsx` | Flex layout: `<AppSidebar />` + `<Outlet />`. Wraps all authenticated routes. |
| `AppSidebar` | `AppSidebar.tsx` | 220px fixed sidebar. Top: logo + Library/Clips nav + "New Run" button. Middle: run-scoped tabs (Overview, Timeline, Cortex Graph, Embeds, Clip Candidates, Grounding, Render) — only shown when a `/runs/:id` route is active. Bottom: Settings + user avatar ("Rithvik K."). |
| `RunContextBar` | `RunContextBar.tsx` | Horizontal bar at top of every run page. Shows run name (left), source URL (center), and phase status text label (right, e.g. "Phase 2 of 6 — Running" or "Complete"). Props: `runId`, `runName`, `videoUrl`, `currentPhase`, `completedPhases` (only `runName`, `videoUrl`, `currentPhase` are destructured). |
| `ClipBoundaryEditor` | `ClipBoundaryEditor.tsx` | Compact clip boundary editor used inside the Clips page detail panel. Renders a looping `<video>` preview clamped to `[startMs, endMs]` with a mini timeline strip and draggable start/end handles + nudge buttons. Defaults `videoSrc` to `/videos/joeroganflagrant.mp4` (the demo placeholder) since the mock pipeline doesn't host per-clip source videos. Calls `onBoundaryChange(startMs, endMs)` on commit. |
| `ErrorBoundary` | `ErrorBoundary.tsx` | React error boundary with fallback UI. Wraps the app-shell layout route and most individual page routes (except `/runs/new`). |
| `PageSkeleton` | `PageSkeleton.tsx` | Loading skeleton placeholder. |
| `ClyptIcon` | `ClyptIcon.tsx` | Small Clypt icon (the "C" mark). |
| `ClyptLogo` | `ClyptLogo.tsx` | Full Clypt wordmark. Note: there is also `src/components/ui/ClyptLogo.tsx` (the shared one used by sidebar/onboarding). |
| `ClyptMark` | `ClyptMark.tsx` | Clypt brandmark SVG (the three-dot curve). |

## `src/components/auth/` — Authentication

| Component | File | Description |
|-----------|------|-------------|
| `AuthLayout` | `AuthLayout.tsx` | Split layout for login/signup. Left side: embedded React Flow graph (using `ClyptNode` + `ClyptEdge`) with logo, testimonial, and copyright overlays (all `pointer-events: none` to allow graph interaction). Right side: form slot via `children`. |
| `GoogleIcon` | `GoogleIcon.tsx` | Google "G" SVG icon for OAuth button. |

## `src/components/embeds/` — Embedding Visualization & Search

| Component | File | Description |
|-----------|------|-------------|
| `EmbedScatter` | `EmbedScatter.tsx` | SVG-based 2D scatter plot. Manages pan/zoom via `Transform` state (wheel zoom, mouse drag). Features: background dot grid, type-colored circles, candidate glow rings, selection rings, hover tooltips. Accepts `highlightedIds` prop: when non-null, matching nodes glow and scale up while non-matches dim to 15% opacity. Uses `ResizeObserver` for responsive sizing. |
| `EmbedToolbar` | `EmbedToolbar.tsx` | Toolbar with semantic/multimodal toggle, zoom controls, fit-to-view. (Used by the old `RunEmbeds` page; `RunSearch` inlines its own controls.) |
| `EmbedInspectPanel` | `EmbedInspectPanel.tsx` | Slide-in panel (right side, 340px) showing selected node details: ID, type pill, candidate badge, timestamps, summary, transcript excerpt, "View in Cortex Graph" link. Slides via `transform: translateX`. Sets `pointerEvents: auto` so close button works inside overlay wrappers. |
| `SearchBar` | `SearchBar.tsx` | Floating search input at top-center. Cmd+K to focus, Enter to submit, Escape to clear. Loading spinner, clear button, violet glow when results are active. |
| `SearchResultsPanel` | `SearchResultsPanel.tsx` | Slide-up panel (196px) from bottom. Shows result count, query text, close button, horizontal scrollable row of `ResultCard` components (inline) with rank badge, type pill, timestamp, summary, similarity score bar. Exports `PANEL_H` constant and `ScoredPoint` type. |
| barrel | `index.ts` | Re-exports: `EmbedScatter`, `EmbedToolbar`, `EmbedInspectPanel`, `SearchBar`, `SearchResultsPanel`, `PANEL_H`, `EmbedType`, `ScoredPoint`. |

## `src/components/graph/` — Cortex Graph (React Flow)

| Component | File | Description |
|-----------|------|-------------|
| `SemanticNode` | `SemanticNode.tsx` | Primary graph node. Frosted-glass background (`backdrop-filter: blur(4px)`) with type-colored linear-gradient tint, dynamic border color, glow `box-shadow` on hover/select. Visible `Handle` dots (top=target, bottom=source) colored by node type. Displays: type label, summary excerpt, timestamp. Supports `dimmed`, `_isHoverTarget`, `_isHoverConnected` data flags. |
| `ClyptNode` | `ClyptNode.tsx` | Simplified shared version of `SemanticNode` styling for use in `AuthLayout` and `LandingGraphDemo`. Same visual properties without the full data-driven logic. |
| `ClyptEdge` | `ClyptEdge.tsx` | Custom edge for auth/landing graphs. Has local hover state, transparent 12px-wide hit area path for reliable mouse detection, label tooltip on hover. |
| `edges.tsx` | `edges.tsx` | Four custom edge types for the main graph: `StructuralEdge` (bezier, curvature 0.2, gray), `StrongRhetoricalEdge` (animated dashes, type-colored), `ModerateRhetoricalEdge` (animated dashes, type-colored), `LongRangeEdge` (dashed, subtle). All use `getBezierPath` with `sourcePosition`/`targetPosition`. |
| `EdgeMarkers` | `EdgeMarkers.tsx` | SVG marker definitions. **Orphan** — no longer rendered since arrowheads were removed. |
| `GraphToolbar` | `GraphToolbar.tsx` | Top-center toolbar. Contains signal filter toggles (trend/comment/retention) and "All types" dropdown with checkboxes per node type. Dropdown uses `position: absolute` — the toolbar root must NOT have `overflow` set. |
| `GraphLegend` | `GraphLegend.tsx` | Bottom-left legend showing node type colors. Positioned absolutely, 12px gap from edges. |
| `InspectPanel` | `InspectPanel.tsx` | Right-side panel for selected node/edge details on the graph page. |
| `TimelineStrip` | `TimelineStrip.tsx` | Bottom strip (88px) showing a minimap of all nodes as colored bars on a horizontal timeline. Has a time ruler with `getTickConfig` from `TimeRuler`. Scrollable horizontally (3x viewport width). Click a bar → `onSelectNode` callback. |

## `src/components/landing/` — Landing Page

| Component | File | Description |
|-----------|------|-------------|
| `Navbar` | `Navbar.tsx` | Top nav with logo, links, login/signup buttons. |
| `Hero` | `Hero.tsx` | Hero section with headline, "See a demo" link, waveform animation. |
| `HowItWorks` | `HowItWorks.tsx` | Step-by-step pipeline explanation. |
| `PipelineDemos` | `PipelineDemos.tsx` | Orchestrator for the six demo cards. |
| `LandingTimelineDemo` | `LandingTimelineDemo.tsx` | Animated timeline mockup. |
| `LandingGraphDemo` | `LandingGraphDemo.tsx` | Embedded React Flow graph using `ClyptNode` + `ClyptEdge`. |
| `LandingNodeDemo` | `LandingNodeDemo.tsx` | Node card visualization. |
| `LandingEmbeddingDemo` | `LandingEmbeddingDemo.tsx` | Scatter plot mockup. |
| `LandingClipDemo` | `LandingClipDemo.tsx` | Clip candidate card. |
| `LandingParticipationDemo` | `LandingParticipationDemo.tsx` | Speaker participation visualization. |
| `ClipShowcase` | `ClipShowcase.tsx` | Showcase section for clip examples. |
| `Features` | `Features.tsx` | Feature grid. |
| `TryItBar` | `TryItBar.tsx` | CTA bar with URL input. |
| `Footer` | `Footer.tsx` | Page footer. |
| `CustomCursor` | `CustomCursor.tsx` | Custom cursor effect (follows mouse). |
| `WaveformBand` | `WaveformBand.tsx` | Animated waveform decoration for hero. |
| `DemoCardShell` | `DemoCardShell.tsx` | Shared card wrapper for demo components. |
| `DemoSectionLayout` | `DemoSectionLayout.tsx` | Layout wrapper for demo sections. |

## `src/components/onboarding/` — Onboarding

| Component | File | Description |
|-----------|------|-------------|
| `OnboardingLayout` | `OnboardingLayout.tsx` | Shared wrapper for all 6 onboarding steps. Header with logo + step progress bar (6 pill indicators + "Step N of 6" label). Centered content area. |

## `src/components/settings/` — Settings

| Component | File | Description |
|-----------|------|-------------|
| `SettingsLayout` | `SettingsLayout.tsx` | Settings page wrapper with side nav + `<Outlet />`. |
| `SettingsNav` | `SettingsNav.tsx` | Settings navigation (Profile, Voiceprints). |

## `src/components/timeline/` — Timeline / Video

| Component | File | Description |
|-----------|------|-------------|
| `VideoPlayer` | `VideoPlayer.tsx` | Auto-detecting video player. Local paths → native `<video>` element synced with `useTimelineStore`. YouTube URLs → iframe API. Empty URL → "No video" placeholder. |
| `WaveformLane` | `WaveformLane.tsx` | Canvas-based waveform visualization per speaker. Uses `mulberry32` PRNG for deterministic mock peaks. Colors speech turns with speaker color, silence with gray. Click handler identifies which turn was clicked. |
| `TimeRuler` | `TimeRuler.tsx` | Adaptive time ruler. Exports `getTickConfig(pixelsPerSecond)` which returns major/minor tick intervals and label format. Renders tick marks and time labels. |
| `Playhead` | `Playhead.tsx` | Vertical playhead line indicator. |
| barrel | `index.ts` | Re-exports: `TimeRuler`, `VideoPlayer`, `WaveformLane`, `Playhead`. |

## `src/components/ui/` — shadcn/ui Primitives

Standard shadcn/ui components built on Radix UI. These should generally not be modified unless fixing a bug.

Full list: `accordion`, `alert-dialog`, `alert`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `ClyptLogo`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input-otp`, `input`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toaster`, `toggle-group`, `toggle`, `tooltip`.

Notable: `ClyptLogo.tsx` in `ui/` is the version used by `OnboardingLayout` and `AppSidebar` (accepts `size` and `defaultExpanded` props).

## `src/components/NavLink.tsx` — Shared Component

Wrapper around React Router's `NavLink` that applies `activeClassName` when the route matches. Used throughout `AppSidebar`. Import path: `@/components/NavLink`.
