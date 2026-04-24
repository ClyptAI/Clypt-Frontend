# Pages

Detailed reference for every page in the application.

---

## Public Pages

### Landing Page — `Index.tsx`
- **Route:** `/`
- **Layout:** Standalone (no sidebar)
- **Sections:** `Navbar` → `Hero` → `HowItWorks` → `PipelineDemos` (sticky 6-phase scrollytelling) → `ClipShowcase` → `Footer`
- **Features:** `CustomCursor` (brand-violet animated cursor follower), `ShaderBackground` section treatments, a hero paste-link CTA bar, `ClyptHeroAnimation` (one-shot video analysis -> widened React Flow graph reveal -> clip fanout), Framer Motion scroll-based animations, and interactive clip cards with timestamp-only overlays. The hero and lower showcase cards use tracked assets from `public/videos/landing/`, `public/images/landing-posters/`, and `public/images/hero/`.
- **Mock data:** Visual-only outer marketing copy; the phase preview internals mirror the seeded Joe Rogan × Flagrant demo surfaces used inside the app.
- **Notes:** `Try free now` links to `/signup`; `See demo` in `Hero` is a React Router `<Link to="/runs/demo/timeline">` that drops the user straight into the seeded demo run's timeline editor. The hero animation runs once per page load and settles on the ranked clip fanout. The phase 02/03 landing graph keeps React Flow unscaled and constrains overflow through card max width, bounded bleed, and internal `fitView` padding. `TryItBar.tsx` remains in the source tree as a legacy standalone CTA component but is not rendered by `Index.tsx`.

### Login — `Login.tsx`
- **Route:** `/login`
- **Layout:** `AuthLayout` (split: graph left, form right)
- **Features:** `AuthInput` fields, "Sign in with Google" button, forgot-password tooltip, link to signup, animated shader-backed brand panel on the left
- **Mock data:** Uses the local `auth-store` mock auth flow; successful submit routes to `/library`

### Signup — `Signup.tsx`
- **Route:** `/signup`
- **Layout:** `AuthLayout` (same as login)
- **Features:** Name/email/password fields, Google OAuth button, password-length validation, link to login
- **Mock data:** Uses the local `auth-store` mock signup flow; successful submit routes to `/onboard/channel`

---

## Onboarding Pages

All use `OnboardingLayout` with a step indicator (1–6).

### Step 1: Channel — `OnboardChannel.tsx`
- **Route:** `/onboard/channel`
- **Features:** YouTube channel URL input, single video toggle (switches to video URL input)
- **Navigates to:** `/onboard/analyzing`

### Step 2: Analyzing — `OnboardAnalyzing.tsx`
- **Route:** `/onboard/analyzing`
- **Features:** Animated SVG timeline with 6 colored dots pulsing sequentially, progress bar (0→85% over 8s), rotating status labels ("Transcribing audio...", "Identifying speakers...", "Detecting shots...", "Building semantic graph...")
- **Auto-advances:** After 8 seconds → `/onboard/brand-profile`
- **Mock data:** `statusLabels` array, `nodeColors` array

### Step 3: Brand Profile — `OnboardBrandProfile.tsx`
- **Route:** `/onboard/brand-profile`
- **Features:** Fake channel card ("Your Channel", @yourchannel, 142K subs), style tag pills, engagement bar chart
- **Mock data:** `styleTags`, `engagementBars` arrays
- **Navigates to:** `/onboard/preferences`

### Step 4: Preferences — `OnboardPreferences.tsx`
- **Route:** `/onboard/preferences`
- **Features:** Duration range slider (15s–3min), platform pills (TikTok, Reels, Shorts, LinkedIn), framing radio buttons, quality segmented control
- **Mock data:** `platforms`, `framingOptions`, `qualityOptions` arrays
- **Navigates to:** `/onboard/voiceprints`

### Step 5: Voiceprints — `OnboardVoiceprints.tsx`
- **Route:** `/onboard/voiceprints`
- **Features:** Speaker name input fields, recording toggle (UI only)
- **Navigates to:** `/onboard/ready`

### Step 6: Ready — `OnboardReady.tsx`
- **Route:** `/onboard/ready`
- **Features:** YouTube URL input, "Analyze" button, "Browse library" link
- **Navigates to:** `/runs/new` (with URL in state) or `/library`

---

## App Shell Pages

All render inside `AppShell` (sidebar visible). Run-scoped pages show `RunContextBar` at top.

### Library — `Library.tsx`
- **Route:** `/library`, `/library/clips`
- **Features:** Run cards with phase progress, clip count. Clicking a card navigates to `/runs/demo` (hardcoded). Tabs for "Runs" and "Clips" views.
- **Mock data:** `mockRuns` (3 runs with hardcoded titles/phases), `mockClips`
- **Hooks:** `useRunList` (React Query, but falls back to mock)
- **Notes:** Pagination shows "Page 1 of 3" but is non-functional

### New Run — `NewRun.tsx`
- **Route:** `/runs/new`
- **Features:** YouTube URL input with oEmbed preview fetch, toggle switches for comment analysis and trend detection
- **Hooks:** `useCreateRun` mutation
- **Navigates to:** `/runs/{newRunId}` on success

### Run Overview — `RunOverview.tsx`
- **Route:** `/runs/:id`
- **Features:** Phase status cards (1–6) with status indicators, elapsed time, artifacts
- **Mock data:** `MOCK_PHASES` array, fallback run name "Joe Rogan × Flagrant" and URL
- **Hooks:** `useRunDetail`, `useRunStore`, `useRunSSE` (real-time phase updates)

### Run Timeline — `RunTimeline.tsx`
- **Route:** `/runs/:id/timeline`
- **Features:**
  - Top: Resizable video area with `VideoPlayer` (drag divider to resize)
  - Floating controls: Layer toggles (left), color legend (right)
  - Transport bar: Play/pause, timecode, playback rate
  - Scrub bar: Waveform-style with hover time preview
  - Time ruler: `TimeRuler` with adaptive tick granularity
  - Lanes: `WaveformLane` per speaker (max 5 primary + 1 "Minor Speakers"), plus optional shot, tracklet, transcript, emotion, audio event lanes
- **Mock data:** `MOCK_SPEAKERS` (7 speakers with turns), `MOCK_SHOTS` (5 shots), tracklets, emotions, audio events. `DEMO_VIDEO_URL = "/videos/joeroganflagrant.mp4"`
- **Hooks:** `useTimelineStore` (playhead, zoom, scroll), `useRunDetail`, `useTimelineKeyboard`
- **State:** `videoDuration`, `videoHeightPx`, `layers` toggles, `selection`, `hoverPct`, `isScrubbing`

### Cortex Graph — `RunGraph.tsx`
- **Route:** `/runs/:id/graph`
- **Features:**
  - Full-screen React Flow canvas with dagre layout
  - `SemanticNode` with type-colored frosted-glass styling
  - Four edge types: structural, strong rhetorical (animated), moderate rhetorical (animated), long-range (dashed)
  - `GraphToolbar`: Signal filters (trend/comment/retention) + node type dropdown filter
  - `GraphLegend`: Node type color legend
  - `InspectPanel`: Selected node/edge details
  - `TimelineStrip`: Bottom minimap with clickable node bars and time ruler
  - Node hover: highlights connected nodes and edges
  - Edge hover: glow effect with edge type label
- **Mock data:** `RAW_NODES` (10 nodes), `RAW_EDGES` (16 edges), `SIGNAL_TAGS`
- **Hooks:** `useNodeList` (React Query)
- **State:** `selectedNode`, `selectedEdge`, `hoveredNodeId`, `hoveredEdgeId`, `activeTypes` set, `signalFilters`

### Search — `RunSearch.tsx`
- **Route:** `/runs/:id/search`
- **Features:**
  - Unified search + embedding space — the scatter IS the search result surface
  - `SearchBar` (floating, Cmd+K focus, Enter to search, Escape/X to clear)
  - `EmbedScatter` (SVG scatter with pan/zoom, `highlightedIds` dims non-matches to 15%)
  - `SearchResultsPanel` (slides up from bottom with horizontal ranked result cards)
  - `EmbedInspectPanel` (slides in from right for selected node)
  - Inline semantic/multimodal toggle + zoom controls (top right)
  - Type legend (bottom left, shifts up when results panel is open)
  - Node count chip (bottom right)
- **States:** Idle (all nodes lit, exploration), Typing (no change), Results (matches glow + scale up, non-matches dim), Node selected (ring + inspect panel), Clear/Escape (return to idle)
- **Mock data:** `MOCK_EMBEDDINGS` (seeded PRNG clusters in `useEmbeddings`); mock search via word overlap in summary + transcript_excerpt, fills to min 4 results
- **Hooks:** `useEmbeddings`, `useRunDetail`
- **State:** `embedType`, `selectedNode`, `inputValue`, `activeQuery`, `results`, `fitSignal`, `zoomDelta`

### Clip Candidates — `RunClips.tsx`
- **Route:** `/runs/:id/clips`
- **Features:** Ranked list of clip candidates with score, rationale, time range. Approve/reject buttons with optimistic UI. Click to expand clip details.
- **Mock data:** `CLIPS` array (8 clips)
- **Hooks:** `useClipList`, `useApproveClip`, `useRejectClip`, `useClipStore`

### Grounding — `RunGrounding.tsx`
- **Route:** `/runs/:id/grounding`, `/runs/:id/grounding/:clipId`
- **Features:** Video player with timeline, speaker lane bindings, shot/intent assignments. Queue of clips to process. Speaker identification interface. **Manual bounding box editor** (floating top-right toolbar): toggle `[Edit boxes]` to enable per-shot drag/resize/delete on the tracker output, `[+ Add box]` to add a new tracklet (auto-incremented letter past A/B/C). Coexists with the `ManualCropModal` — independent state.
- **Mock data:** `QUEUE` (clip queue), `SHOTS`, speaker bindings, intents. `DEMO_VIDEO_URL`
- **State:** Active clip / playback / `cropModal` / `speakerNames` / `boxEditMode` / `selectedBoxKey` stay local (pure UI). **Everything else is persisted server-side** via `useGroundingState`/`useUpdateGrounding` (keyed by `runId + clipId`, payload is `GroundingClipState`): box rect overrides, user-added tracklets, hidden originals, **per-shot speaker bindings, camera intents, and manual crop boxes**. The page reads through three "effective" memos (`effectiveBindings`, `effectiveIntents`, `effectiveCrops`) that overlay persisted overrides on top of the seed defaults; an `undefined` field in a persisted shot means "use the seed". Deleting a tracklet cascades binding cleanup into the same mutation.

### Render — `RunRender.tsx`
- **Route:** `/runs/:id/render`
- **Features:** Render pipeline UI: clip selection → preset selection (TikTok/Reels/Shorts/Square) → render progress → download
- **Mock data:** `CLIPS`, `ClipPlan`, `RenderStage` mock list, preset cards
- **Hooks:** `useClipList`, `renderApi.presets()`, render submit/status mutations

---

## Settings Pages

### Profile — `SettingsProfile.tsx`
- **Route:** `/settings` (index)
- **Features:** Name, email, password change fields
- **Mock data:** Default "Rithvik", "rithvik@example.com"

### Voiceprints — `SettingsVoiceprints.tsx`
- **Route:** `/settings/voiceprints`
- **Features:** List of saved voiceprints, add new voiceprint
- **Mock data:** `MOCK` voiceprints array

---

## Error Page

### Not Found — `NotFound.tsx`
- **Route:** `*` (catch-all)
- **Features:** 404 message, logs the attempted path via `useLocation`

---

## Orphan Pages (not routed)

### RunEmbeds — `RunEmbeds.tsx`
- **Not in `App.tsx`** — predecessor to `RunSearch.tsx`, plain embedding scatter without search
- **Features:** `EmbedToolbar`, `EmbedScatter`, `EmbedInspectPanel`, type legend
- **Status:** Dead code, superseded by `RunSearch.tsx`
