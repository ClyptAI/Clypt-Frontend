# Components

Complete inventory of all components grouped by domain.

## `src/components/app/` — Application Shell

| Component | File | Description |
|-----------|------|-------------|
| `AppShell` | `AppShell.tsx` | Flex layout: `<AppSidebar />` + `<Outlet />`. Wraps all authenticated routes. |
| `AppSidebar` | `AppSidebar.tsx` | 220px fixed sidebar. Top: oversized static `ClyptAnimatedMark` brand mark + Library/Clips nav + "New Run" button. Middle: run-scoped tabs — only shown when a `/runs/:id` route is active. Bottom: Settings + user avatar. |
| `RunContextBar` | `RunContextBar.tsx` | Horizontal bar at top of every run page. Shows run name on the left and phase status text on the right; run navigation lives in `AppSidebar`. |
| `ClipBoundaryEditor` | `ClipBoundaryEditor.tsx` | Compact clip boundary editor. Renders a looping `<video>` preview clamped to `[startMs, endMs]` with draggable start/end handles + nudge buttons. |
| `ClyptAnimatedMark` | `ClyptAnimatedMark.tsx` | **Primary brand mark.** Framer Motion viewfinder + layered waveform SVG logo. `animate={true}` plays the fast intro sequence (center flash, bracket reveal, waveform bars) timed to resolve with the landing hero analysis scan; `animate={false}` renders the settled final state instantly. Props: `size` (px), `animate` (bool, default true), `className`. |
| `ErrorBoundary` | `ErrorBoundary.tsx` | React error boundary with fallback UI. |
| `PageSkeleton` | `PageSkeleton.tsx` | Loading skeleton placeholder. |
| `ClyptIcon` | `ClyptIcon.tsx` | Small Clypt icon (the "C" mark). |
| `ClyptLogo` | `ClyptLogo.tsx` | Legacy logo component in `app/` — uses `ClyptMark` + Bricolage Grotesque text. Superseded by `ui/ClyptLogo` for all primary usage. |
| `ClyptMark` | `ClyptMark.tsx` | Legacy two-bar parallelogram SVG mark. Used only by `app/ClyptLogo`. |

## `src/components/auth/` — Authentication

| Component | File | Description |
|-----------|------|-------------|
| `AuthLayout` | `AuthLayout.tsx` | Split layout for login/signup. Left side: embedded React Flow graph (using `ClyptNode` + `ClyptEdge`) over a `ShaderBackground`, plus logo, testimonial, and copyright overlays. Right side: dark form panel slot via `children`. |
| `AuthInput` | `AuthInput.tsx` | Auth-form input with explicit focus border/glow transitions, dark glass styling, and no `transition: all`. |
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
| `SemanticNode` | `SemanticNode.tsx` | Primary graph node. Frosted-glass background (`backdrop-filter: blur(4px)` by default) with type-colored linear-gradient tint, dynamic border color, glow `box-shadow` on hover/select. Visible `Handle` dots (top=target, bottom=source) colored by node type. Displays: type label, summary excerpt, timestamp. Supports `dimmed`, `_isHoverTarget`, `_isHoverConnected`, plus optional `surfaceOpacity`, `tintOpacity`, `tintFadeOpacity`, and `backdropBlur` data fields for landing/hero tuning. |
| `ClyptNode` | `ClyptNode.tsx` | Simplified shared version of `SemanticNode` styling for `AuthLayout` and `LandingGraphDemo`. Dual hover-state source: when rendered inside a `LandingHoverCtx.Provider` it reads hover flags from context (so the React Flow `nodes` prop stays static and avoids remount cascades); otherwise falls back to `_isHoverTarget` / `_isHoverConnected` / `_hasHover` flags in `data` (used by `AuthLayout` via React Flow's `onNodeMouseEnter`). `_onHoverEnter` / `_onHoverLeave` callbacks in `data` are also supported as a fallback. |
| `ClyptEdge` | `ClyptEdge.tsx` | Custom edge for auth/landing graphs. Local `useState` for direct edge hover (drives glow + label). When rendered inside a `LandingHoverCtx.Provider`, reads `connectedEdgeIds` from context for the node-hover highlight; otherwise reads `_isHoverHighlighted` from `data`. Transparent 12px-wide hit-area path for reliable mouse detection. |
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
| `Hero` | `Hero.tsx` | Landing hero with a violet `GemSmoke` `ShaderBackground`, animated two-line headline, two-line supporting copy, paste-link CTA bar, `Try free now` signup link, `See demo` link into `/runs/demo/timeline`, and the right-side `ClyptHeroAnimation`. |
| `ClyptHeroAnimation` | `ClyptHeroAnimation.tsx` | First-viewport hero animation. Runs once per page load through video analysis, a symmetric seven-node semantic graph reveal, clip fanout, and a settled `Top Hit` center card. The analysis scan is timed to finish with the navbar logo intro, and the center-card ranking lift resolves quickly into the settled fanout. The graph layer uses symmetric horizontal React Flow viewport bleed, not CSS transform scaling, so the wide node layout can render larger while keeping edge endpoints attached. Uses landing media from the Blob-backed `landingMedia` manifest, keeps the fanout score chips in the top-right of each clip card, and respects reduced motion by jumping to the settled state. |
| `HowItWorks` | `HowItWorks.tsx` | Six-phase overview grid with click-to-scroll cards that jump to the matching landing preview section. Card hover transitions are intentionally short and Framer-controlled so the active state does not trail when users sweep across the grid. |
| `PipelineDemos` | `PipelineDemos.tsx` | Sticky scrollytelling orchestrator for the six landing phase sections. A left-side progress rail tracks the active phase while the right pane swaps app-frame previews. Supports bounded per-phase right bleed for wide previews, including the cortex graph stage, while avoiding parent scale transforms around React Flow so edge coordinates stay aligned. Outer copy stays general-marketing; embedded previews carry the Joe Rogan x Flagrant demo internals. Its decorative shader wakes only near the viewport and renders a frozen high-resolution frame. |
| `LandingTimelineDemo` | `LandingTimelineDemo.tsx` | Animated timeline mockup. |
| `LandingGraphDemo` | `LandingGraphDemo.tsx` | Embedded React Flow graph using `ClyptNode` + `ClyptEdge`. Mounts lazily via `IntersectionObserver`. Hover state is managed in a `LandingHoverCtx.Provider` that wraps `<ReactFlow>` — the `nodes` and `edges` props are static constants so React Flow never remounts its wrapper divs on hover. The graph card owns its max width and uses internal viewport bleed plus `fitView` padding for node visibility instead of external scaling. RAF-debounced `onHoverLeave` guards against residual same-frame spurious leave events. |
| `LandingHoverCtx` | `LandingHoverCtx.ts` | React Context that delivers `{hoveredNodeId, connectedNodeIds, connectedEdgeIds, onHoverEnter, onHoverLeave}` to `ClyptNode` and `ClyptEdge` inside `LandingGraphDemo` without touching React Flow's data pipeline. |
| `LandingNodeDemo` | `LandingNodeDemo.tsx` | Node card visualization. |
| `LandingEmbeddingDemo` | `LandingEmbeddingDemo.tsx` | Scatter plot mockup. |
| `LandingClipDemo` | `LandingClipDemo.tsx` | Clip candidate card. |
| `LandingParticipationDemo` | `LandingParticipationDemo.tsx` | Speaker participation visualization. |
| `ClipShowcase` | `ClipShowcase.tsx` | Lower landing clip fan. Uses Vercel Blob MP4s plus Blob poster thumbnails, stays paused by default, plays only on hover+click, resets on hover-off, and shows a single timestamp pill as overlay. Its background shader wakes only near the viewport and renders a frozen high-resolution frame. |
| `Features` | `Features.tsx` | Feature grid. |
| `TryItBar` | `TryItBar.tsx` | Legacy standalone CTA bar with URL input. The current landing route does not render it; the active paste-link CTA lives inside `Hero`. |
| `Footer` | `Footer.tsx` | Page footer. |
| `CustomCursor` | `CustomCursor.tsx` | Brand-violet custom cursor effect. Follows the pointer with a direct dot and springy ring, and switches size/state for `data-cursor="pointer"`, `play`, and `text`. |
| `WaveformBand` | `WaveformBand.tsx` | Animated waveform decoration for hero. |
| `DemoCardShell` | `DemoCardShell.tsx` | Shared card wrapper for demo components. |
| `DemoSectionLayout` | `DemoSectionLayout.tsx` | Layout wrapper for demo sections. |
| `ShaderBackground` | `ShaderBackground.tsx` | Section-level Paper Design shader wrapper. Variant-based effect library with reduced-motion static fallbacks for hero, auth, how-it-works, pipeline, showcase, CTA, and onboarding surfaces. Supports `pauseWhenOffscreen`, `viewportMargin`, `animated={false}` frozen frames, `frame`, `minPixelRatio`, and `maxPixelCount` so decorative WebGL work can be visibility-aware and capped. The hero variant uses `GemSmoke` in a purple/violet palette without the previous grain-gradient layer, so the animation sits over branded motion instead of the older ambient glow. |
| `HeroFragments/*` | `HeroFragments/` | Floating mini product cards around the hero. The active layout mounts cortex, timeline, and two real clip chips backed by Blob-hosted landing media; the fragment editor can persist local layout overrides in `localStorage`. |
| `previews/*` | `previews/` | Full landing phase preview surfaces (`LandingTimelinePreview`, `LandingSearchPreview`, `LandingGroundingPreview`, `LandingRenderPreview`) wrapped in `AppFrameMock` so each section previews a real in-app workspace pane. Decorative pulsing loops in search/render previews are gated by `useReducedMotion` and `useInView`. |

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

Notable: `ClyptLogo.tsx` in `ui/` is the **primary logo lockup** used by `Navbar`, `AuthLayout`, `OnboardingLayout`, and `Footer`. It renders `ClyptAnimatedMark` (the viewfinder/waveform mark) alongside a Bricolage Grotesque 700 lowercase "clypt" wordmark. Props: `size` (`sm` | `md` | `lg` | `xl`), `animate` (default `false` — only `Navbar` passes `true`), `defaultExpanded` (no-op, kept for API compat). Size map: sm=38px mark/15px text, md=52/20, lg=70/27, xl=110/46. `AppSidebar` uses `ClyptAnimatedMark` directly (mark only, no wordmark).

## `src/components/NavLink.tsx` — Shared Component

Wrapper around React Router's `NavLink` that applies `activeClassName` when the route matches. Used throughout `AppSidebar`. Import path: `@/components/NavLink`.
