# Error Log

Breaking behaviors encountered during development and their fixes. Documented to prevent regressions.

---

## 2026-04-28 — Landing shaders caused high GPU usage immediately on page load

**Symptoms**
- Opening the landing page on localhost or `clypt.studio` caused laptop fans to spin up on high-end Mac and Lenovo machines.
- Activity Monitor showed elevated WindowServer/GPU work while the page was visible.
- The issue appeared before user interaction and was much lower when reduced-motion mode replaced shaders with static gradients.

**Root cause**
Every landing shader layer mounted and animated immediately, including sections below the fold. The page started seven Paper WebGL canvases on first paint: two in the hero, one in How It Works, two across the tall pipeline scrollytelling section, and two in the showcase. The pipeline shader was especially expensive because it inherited the full multi-viewport section height. Paper shaders default to a high pixel budget and keep a recurring animation loop whenever `speed` is nonzero.

**Fix**
Teach `ShaderBackground` to pause offscreen layers with `IntersectionObserver`, rendering the existing static fallback until the layer is visible. Expose Paper shader performance knobs through `minPixelRatio` and `maxPixelCount`, default the pixel-ratio floor to `1`, and cap landing shader canvas budgets. Remove the extra grain-gradient shader pass from the landing shader stack. Keep the hero shader animated at its original high-resolution budget, but make How It Works, Pipeline, and Showcase wake only when they enter the viewport and render frozen high-resolution frames with `speed={0}`. Gate decorative pulse loops in the landing search/render previews with reduced-motion and in-view checks.

**Affected files**
- `src/components/landing/ShaderBackground.tsx`
- `src/components/landing/Hero.tsx`
- `src/components/landing/HowItWorks.tsx`
- `src/components/landing/PipelineDemos.tsx`
- `src/components/landing/ClipShowcase.tsx`
- `src/components/landing/previews/LandingSearchPreview.tsx`
- `src/components/landing/previews/LandingRenderPreview.tsx`

**Preventive rule**
**Decorative WebGL backgrounds must be visibility-aware, pixel-budgeted, and static unless motion matters.** Do not mount animated full-section shader canvases below the fold on first paint, and never let long scrollytelling sections inherit uncapped animated canvas sizes. Decorative Framer Motion loops also need reduced-motion and viewport gates.

---

## 2026-04-25 — Auth logo shell blocked upper graph node hover

**Symptoms**
- Most auth background graph nodes and edges showed the expected glow behavior on hover.
- The upper `setup_payoff` node and its nearby edges were difficult or impossible to hover cleanly.
- The behavior appeared related to the Clypt logo/title area, but the visible logo link itself was already content-sized.

**Root cause**
The logo row's outer shell stayed on a higher z-index than the React Flow graph and spanned the full auth panel width with `padding: 40`. Even though the actual logo link had been narrowed to the visible logo/wordmark, the parent shell still used default pointer events and intercepted hover hit-testing over the graph underneath, including the upper `setup_payoff` node and its edges.

**Fix**
Set `pointerEvents: "none"` on the logo shell and restore `pointer-events-auto` only on the actual logo `Link`. This preserves the logo navigation target while allowing graph hover events to pass through the surrounding empty header space.

**Affected files**
- `src/components/auth/AuthLayout.tsx`

**Preventive rule**
**When an overlay contains one small interactive child above an interactive background, disable pointer events on the overlay shell and re-enable them only on the child control.** Content-sized links fix navigation hit boxes, but not hover interception from their parent layers.

---

## 2026-04-25 — Auth graph hover flickered after clicking decorative edge space

**Symptoms**
- On a fresh signup/login page load, hovering auth graph nodes and edges worked correctly: nodes glowed, connected nodes dimmed/glowed appropriately, and connected edges animated.
- After clicking the space between the Clypt logo/title and the `setup_payoff` node, subsequent node/edge hover states flickered.
- The clicked area looked like decorative background space, not an intentional control.

**Root cause**
The auth background React Flow graph passed hover state back through fresh `displayNodes` and `displayEdges` arrays. Every hover enter/leave rebuilt the React Flow node/edge props, which could make React Flow re-render wrapper elements under the cursor and fire another leave/enter cycle. Clicking the decorative edge space made the issue easier to trigger because the apparent empty area overlaps a wide transparent edge hit target, but the deeper bug was the hover-state feedback loop through React Flow props.

**Fix**
Use the same stable hover architecture as `LandingGraphDemo`: pass the static `authNodes` and `authEdges` constants directly to React Flow, deliver hover state through `LandingHoverCtx`, and debounce mouseleave by one animation frame. Keep selection and keyboard focus disabled for the decorative auth graph with `elementsSelectable={false}`, `nodesFocusable={false}`, and `edgesFocusable={false}`. Because React Flow disables wrapper pointer events for fully non-selectable elements, add inert node hover and edge click handlers so the wrappers remain hit-testable while the real hover state still comes from the custom node/edge components.

**Affected files**
- `src/components/auth/AuthLayout.tsx`

**Preventive rule**
**Do not feed high-frequency hover state back through React Flow `nodes` / `edges` props.** Keep graph topology props stable and deliver transient hover state through context or direct callbacks. When making a decorative React Flow graph non-selectable, preserve wrapper hit-testing with inert handlers if custom node/edge internals still need hover events.

---

## 2026-04-25 — Auth logo home click target covered nearby graph background

**Symptoms**
- On the signup/login auth pages, clicking the Clypt logo and wordmark correctly navigated to the landing page.
- Nearby background graph areas, especially around the `setup_payoff` node and its edge from the `claim` node, could also trigger landing-page navigation.
- The graph still looked interactive, so the unexpected navigation made it feel like the React Flow node or edge itself was wired incorrectly.

**Root cause**
The auth brand panel attached `onClick={() => navigate("/")}` to a block-level wrapper around `ClyptLogo`. Because the wrapper was a normal block element inside the padded logo row, its hit area expanded across surrounding empty header space instead of matching the visible logo and title.

**Fix**
Replace the block-level click wrapper with a real React Router `Link` that is `inline-flex` and `w-fit`, so only the visible Clypt logo/wordmark content owns the landing-page navigation behavior.

**Affected files**
- `src/components/auth/AuthLayout.tsx`

**Preventive rule**
**Brand navigation should use content-sized links, not block-level click containers.** When a decorative or interactive background sits behind a header, check the link hit box against the visible logo rather than relying on default block layout.

---

## 2026-04-10 — Cortex Graph rendered nodes but no edges

**Symptoms**
- The `/runs/:id/graph` page rendered all semantic nodes correctly but every edge was missing — the graph looked like a disconnected node cloud.
- Reproducible across every seeded run, both fresh runs and those restored from the persisted mock DB.
- No console errors. React Flow's edge layer was simply empty.

**Root cause**
`RunGraph.tsx` was reading nodes from the API (`useNodeList`) but reading edges from a hardcoded `RAW_EDGES` constant. After the centralized mock backend landed, seeded runs got a fresh set of node IDs (e.g. `node_a1b2c3`) that did **not** match the source/target IDs in `RAW_EDGES`. React Flow silently dropped every edge whose `source` or `target` didn't resolve to a mounted node.

The deeper issue: there was no `edgesApi`, no `useEdgeList` hook, and no path for the seeded mock edges in `mockDB.edges` to ever reach the page. The mock layer happily stored edges for each run; the graph page just never asked for them.

**Fix**
Wire edges through the same API path as nodes so they always come from the same data source:

1. `src/mocks/api.ts` — added `mockEdgesApi.list(runId)` that returns `mockDB.get().edges[runId] ?? []`.
2. `src/lib/api.ts` — added typed `edgesApi.list(runId)` that delegates to `mockEdgesApi` in mock mode and `GET /v1/runs/:id/edges` in real mode.
3. `src/hooks/api/useNodes.ts` — added `useEdgeList(runId)` query hook with its own `edgeKeys` namespace.
4. `src/pages/RunGraph.tsx`:
   - Imported `useEdgeList`, `SemanticGraphEdge`, `EdgeType`.
   - Added `edgeTypeForRf()` mapping all 14 backend `EdgeType` values to the 4 React Flow custom edge types (`structural`, `strong`, `moderate`, `longrange`).
   - Added `adaptApiEdge()` that builds an RF `Edge` from a `SemanticGraphEdge`, preserving the original edge type as the label for non-structural edges.
   - When `apiNodes` is non-empty, `sourceEdges` is derived from `apiEdges`; otherwise it falls back to `RAW_EDGES`. Crucially, **nodes and edges now switch sources together** — never one from API and the other from the constant.
   - Added a `useEffect` that re-syncs React Flow's local edge state when `sourceEdges` changes.

Committed as `3ffcf6b`.

**Affected files**
- `src/mocks/api.ts`
- `src/lib/api.ts`
- `src/hooks/api/useNodes.ts`
- `src/pages/RunGraph.tsx`

**Preventive rule**
**Nodes and edges in any React Flow surface MUST come from the same data source.** If you add a new graph page or change how nodes are loaded, audit the edges path in the same change — the two are coupled by ID and React Flow will silently drop dangling edges. When introducing a new run-scoped resource, also add it to `mocks/api.ts`, `lib/api.ts`, and a `useXxxList` hook in one go; never read from `mockDB` directly inside a page component.

---

## 2026-04-10 — Landing page graph hover (glow/streaming edges) flickered or only triggered on click

**Symptoms**
- Hovering over nodes in `LandingGraphDemo` produced no persistent glow; connected edges flickered rapidly on/off.
- Clicking a node somehow "activated" hover — the effect appeared correctly only after a click interaction.
- Identical `ClyptNode` / `ClyptEdge` on Login/Signup (`AuthLayout`) worked correctly on hover.
- After a partial fix that added component-level `onMouseEnter`/`onMouseLeave` callbacks, browser DevTools confirmed 54 enter + 54 leave events firing per single hover interaction.

**Root cause (layered)**

**Layer 1 — React Flow's `onNodeMouseEnter` is gated by `isDragging`.**
When `LandingGraphDemo` mounts lazily via `IntersectionObserver` while the user is scrolling, React Flow initialises with `isDragging: true`. This silently suppresses every `onNodeMouseEnter` for the lifetime of that instance. Clicking a node resets the drag state, explaining the "works after click" symptom. `ClyptEdge` was unaffected because it handles hover via its own `onMouseEnter` on the SVG element.

**Layer 2 — Passing hover state through the `nodes` prop causes React Flow to remount node wrapper DOM elements on every hover tick.**
The workaround for Layer 1 was to pass `_isHoverTarget` / `_hasHover` flags plus callback refs through each node's `data` object. But every `setHoveredNodeId` call regenerated `displayNodes` (new spread objects with new function references) → React Flow received a new `nodes` array → React Flow internally diff'd the data and re-mounted its wrapper divs → those remounts fired rapid `mouseleave` + `mouseenter` DOM events → `setHoveredNodeId` toggled 54 times per hover gesture → the flickering visible to the user. `ClyptEdge` was again unaffected because it used a local `useState` for its own glow, never triggering React Flow's node layer.

**Fix**
Deliver hover state via a React Context (`LandingHoverCtx`) that React Flow's `nodes` / `edges` props never see:

1. `LandingHoverCtx.ts` — context holds `{hoveredNodeId, connectedNodeIds, connectedEdgeIds, onHoverEnter, onHoverLeave}`.
2. `LandingGraphDemo.tsx` — passes `demoNodes` / `demoEdges` as static constants directly (no more `displayNodes` / `displayEdges`). Wraps `<ReactFlow>` in `<LandingHoverCtx.Provider>`. RAF-debounced `onHoverLeave` prevents any residual same-frame spurious leaves.
3. `ClyptNode.tsx` — reads hover state from context if present; falls back to `data` props when context is absent (used by `AuthLayout`). This is the only source of truth for all hover visuals.
4. `ClyptEdge.tsx` — reads `connectedEdgeIds` from context to determine highlight; keeps its own local `useState` for direct edge hover. The `edges` prop to ReactFlow is now also static.

After the fix: 3 enter events / 0 leave events per hover (the 3 captures are normal child-element traversal in capture phase).

**Affected files**
- `src/components/landing/LandingHoverCtx.ts` (new — context definition)
- `src/components/graph/ClyptNode.tsx` (reads from context; keeps data-prop fallback)
- `src/components/graph/ClyptEdge.tsx` (reads `connectedEdgeIds` from context)
- `src/components/landing/LandingGraphDemo.tsx` (static nodes/edges; context provider; RAF debounce)
- `src/index.css` (`.rf-landing .react-flow__pane { pointer-events: none }` kept as defence-in-depth)

**Preventive rule**
**Never pass transient UI state (hover, selection, animation) through React Flow's `nodes` / `edges` props.** Any change to those arrays causes React Flow to diff and potentially remount its internal wrapper elements, triggering cascading DOM events. Use a React Context (or Zustand store) outside the `nodes`/`edges` pipeline so components can read state directly without React Flow's knowledge. Apply the same rule to any library that manages its own DOM wrappers (react-virtualized, Framer Motion layout groups, etc.).

---

## 2026-04-11 — ClyptAnimatedMark endpoint dots visible before arcs drew them

**Symptoms**
- The 4 outer node dots (C endpoints at `(100,±100)` and scissor endpoints at `(-120,±60)`) appeared visible in the navbar before their corresponding arcs had drawn to reach them.
- Persisted even after adding the `animationStarted` mount gate (matching the original Figma Make component exactly).

**Root cause**
Framer Motion's `initial={{ opacity: 0, scale: 0 }}` is applied via `useLayoutEffect` internally, but there is at least one browser paint frame where the element exists in the DOM before framer-motion's effect has run — particularly in React 18 with concurrent rendering. This means the circles render at full opacity for a single frame before being hidden, which is visually perceptible especially at small sizes where the dots are prominent relative to the mark.

The `scale: 0` transform also has a secondary issue: SVG elements default to `transform-origin: 0 0` (the SVG viewport origin), not the element's own center. So a dot at `(100,-100)` scaled to `0` around the origin would animate from the center outward, creating a brief "dot sliding from center" artifact.

**Fix**
Gate the endpoint circles out of the DOM entirely using `setTimeout`s that fire only after their arcs have completed — they are never in the DOM until their arcs finish drawing:

- `showCDots` — set `true` at `300ms (SVG mount) + 2100ms (C arc completion)` = 2400ms from component mount
- `showScissorDots` — set `true` at `300ms + 4500ms (scissor arc completion)` = 4800ms

When the circles do mount (fresh DOM insertion), framer-motion's `initial` IS applied synchronously before the first paint of that element, so the pop-in animation works correctly.

**Affected files**
- `src/components/app/ClyptAnimatedMark.tsx`

**Preventive rule**
**Never rely on framer-motion's `initial` to hide elements that already exist in the DOM** when timing is critical. For sequenced animations where element B must not appear before animation A completes, use conditional rendering (`{condition && <Element />}`) controlled by a `setTimeout` or a state derived from `onAnimationComplete`. `initial` is only guaranteed before the first paint of a freshly *mounted* element.

---

## 2026-04-24 — Landing hero animation port lost the source composition spacing

**Symptoms**
- The imported first-viewport animation appeared inside an oversized rounded container instead of occupying the open right side of the hero.
- The video input, semantic graph, and clip fanout sections were visually compressed into each other.
- Attempts to make the animation fit by moving sections individually made the spacing worse; the source animation needed proportional scaling, not hand-shifted pieces.
- The initial fanout reused the same few poster frames across five clips, making the sequence read as duplicated media instead of five distinct generated candidates.

**Root cause**
The hero animation was treated like a responsive stack of independent DOM regions rather than a single composed scene with a fixed design coordinate system. The component tried to satisfy the available hero slot by changing individual positions, margins, and container treatments. That broke the relative spacing the source animation depended on. Reusing existing poster assets also hid the intended "five separate candidates" story.

**Fix**
Move the animation into a dedicated `ClyptHeroAnimation` scene with a fixed internal stage (`stageWidth`, `stageHeight`) that scales as one unit via `--hero-animation-scale`. Remove the large decorative container, keep the major regions layered over the hero shader, and preserve the input -> graph -> fanout vertical relationship. Add tracked poster assets for the center and side fanout clips so the five-card fanout uses unique thumbnails.

**Affected files**
- `src/components/landing/ClyptHeroAnimation.tsx`
- `src/components/landing/Hero.tsx`
- Landing media entries now live in `src/components/landing/landingMedia.ts`.

**Preventive rule**
**When porting a composed visual animation, preserve its source coordinate space and scale the whole stage proportionally.** Do not "make it fit" by nudging each major section independently unless the source animation was built as a responsive layout from the start. If a scene contains repeated media cards, verify the assets are unique before shipping.

---

## 2026-04-24 — Hero semantic graph edges and node layout did not read as an intentional graph

**Symptoms**
- The semantic graph in the hero animation looked visually unbalanced and less polished than the auth/signup graph.
- Some edge paths appeared awkward or visually detached from the node handles.
- The graph either felt too small in the available space or became risky to enlarge because previous sizing attempts had made React Flow edge endpoints look wrong.
- Dense node copy and translucent node surfaces lost contrast over the GemSmoke shader.

**Root cause**
The first version used a practical Joe Rogan demo graph, but its node positions were too linear and cramped for the hero slot. It also reused shared edge styles that were tuned for full app graph surfaces, not a small cinematic marketing animation. Later attempts to enlarge the graph focused on React Flow `fitViewOptions.padding`, but the graph was width-limited: the node bounds were much wider than the viewport, so small padding changes barely affected the rendered size. Increasing size with CSS transforms would have risked reintroducing edge/handle desync.

**Fix**
Rebalance the hero graph into a symmetric seven-node layout with concise labels and real demo relationships. Add a hero-specific `HeroStructuralEdge` using `getBezierPath()` / `BaseEdge` so the neutral structural edges remain readable on the shader. Keep source/target handle IDs explicit. Tune `SemanticNode` with optional `surfaceOpacity`, `tintOpacity`, `tintFadeOpacity`, and `backdropBlur` data fields so the hero graph can use higher node opacity without changing every graph in the app. Finally, enlarge the graph by adding symmetric horizontal React Flow viewport bleed (`graphHorizontalBleed`) before `fitView` runs, rather than transform-scaling the rendered React Flow layer.

**Affected files**
- `src/components/landing/ClyptHeroAnimation.tsx`
- `src/components/graph/SemanticNode.tsx`

**Preventive rule**
**For React Flow, make graphs larger by changing the viewport available to `fitView`, not by CSS-transforming the rendered graph.** If `fitViewOptions.padding` appears to do nothing, calculate whether width or height is limiting the zoom. For hero/marketing graph variants, keep the real node/edge story but rebalance positions and labels for the target viewport.

---

## 2026-04-24 — Hero animation timing looped and delayed the graph reveal

**Symptoms**
- The analyzing scan line moved down, then back up, then started downward again before the graph appeared.
- The graph-to-fanout handoff felt too slow.
- The animation looped after completion, so users returning to the top after scrolling could see the whole sequence restart instead of the final state.
- During ranking, the center clip lifted and stayed emphasized in a way that made it unclear whether the final state was "all candidates" or "ranked winner."

**Root cause**
The original phase sequencer was a loop: it advanced through `idle`, `analysis`, `generation`, `fanout`, `ranking`, then reset back into the sequence. The analysis scan itself was animated as a repeated down/up sweep (`top: ["0%", "100%", "0%"]`) and the generation phase held for too long. The phase model had no terminal state distinct from the active ranking lift.

**Fix**
Make the phase timeline one-shot per page load. Replace the looping timeout with a list of one-time timeouts and add a terminal `settled` phase. Reduced-motion users jump directly to `settled`. Change the analyzing scan to a single downward sweep whose duration is controlled by `analysisScanDuration`. Shorten graph preview timing (`graphPreviewDuration`) and ranking lift timing (`rankingLiftDuration`) so graph reveal, fanout, and center emphasis happen faster and then settle. Keep `analysisScanDuration` synchronized with the animated navbar logo intro so the scan and mark resolve together.

**Affected files**
- `src/components/landing/ClyptHeroAnimation.tsx`
- `src/components/app/ClyptAnimatedMark.tsx`

**Preventive rule**
**Separate "active animation state" from "terminal settled state" in any first-visit hero animation.** If the animation should only play once, the phase sequencer must have no wraparound path. Avoid repeating keyframes on transition cues that are supposed to gate the next phase.

---

## 2026-04-24 — Clip fanout cards had unstable emphasis, duplicated media, and awkward score placement

**Symptoms**
- The center fanout card could lift into emphasis while the YouTube icon and `Top Match` pill no longer shared a clean horizontal center line.
- `Top Match` wrapped on smaller card states, which made the chip look broken.
- Scores were shown at the bottom as `Score 99`, competing with subtitles and making the lower portion of every card feel heavy.
- The emphasized center score chip used a lighter/purple surface that did not match the dark score chips on the side cards.
- The four side cards became too transparent in the final emphasized state, making the fanout feel more like a background decoration than a ranked set of candidates.
- The initial fanout reused three screenshots across five cards.

**Root cause**
The card chrome was split into independently positioned overlays: platform icon, top label, and score each had their own absolute positioning rules. That made vertical alignment fragile when the center card changed state. The score presentation was inherited from a bottom metadata treatment instead of a compact top-corner badge. The fanout asset list also reused available poster files rather than preserving one poster per generated candidate.

**Fix**
Move the icon, center label, and score into a single top overlay row with shared centering. Rename the emphasized label to `Top Hit` to prevent wrapping. Move every score into a top-right dark chip with no `Score` prefix; keep the center card's `99` chip dark as well. Raise non-top-card opacity in the final state and swap in unique fanout poster assets, with the new center screenshot assigned to the top candidate.

**Affected files**
- `src/components/landing/ClyptHeroAnimation.tsx`
- Landing media entries now live in `src/components/landing/landingMedia.ts`.

**Preventive rule**
**Group related overlay controls in one positioning context.** Do not separately absolute-position icon, status, and score badges if they must remain aligned across animated card states. For fanout/ranking visuals, scores belong in small stable corner chips; avoid bottom overlays that compete with captions.

---

## 2026-04-24 — Landing phase graph edges desynced when the preview was scaled or over-bled

**Symptoms**
- The phase 02/03 `LandingGraphDemo` edges appeared disconnected from the node handles even though the hero graph, auth graph, and app Cortex graph edges worked.
- Shrinking the preview with parent `scale` appeared to fit the card, but React Flow edge endpoints still looked wrong.
- Increasing the phase `rightBleed` prevented the rightmost node from clipping inside the card, but later caused the whole graph card to push into the right edge of the viewport.
- The rightmost node could still be clipped or partially offscreen depending on how the outer phase wrapper and inner React Flow viewport interacted.

**Root cause**
React Flow computes node and edge geometry from its own measured container and node wrapper boxes. Applying a parent CSS `scale` to the phase preview changed the visual pixels after React Flow had already calculated coordinates, which made SVG edges and DOM nodes disagree. Separately, treating `rightBleed` as the only fix mixed two different concerns: letting the phase card occupy extra horizontal space and letting the graph contents have internal viewport room for the rightmost node.

**Fix**
Remove the external `scale` from the `PipelineDemos` phase wrapper. Give `LandingGraphDemo` its own `graphFrameMaxWidth`, wrap `DemoCardShell` in a max-width container, and keep the graph card itself at `w-full`. Use internal React Flow viewport bleed (`graphViewportLeftBleed`, `graphViewportRightBleed`) plus `fitViewOptions.padding` to keep nodes visible inside the graph. Bound the phase-level `rightBleed` so the card can sit comfortably in the scrollytelling layout without overflowing the viewport.

**Affected files**
- `src/components/landing/LandingGraphDemo.tsx`
- `src/components/landing/PipelineDemos.tsx`

**Preventive rule**
**Never parent-scale a mounted React Flow graph to make it fit.** Resize the container or adjust React Flow's own viewport/fitting parameters instead. Keep "outer layout bleed" and "inner graph viewport bleed" as separate knobs: the first controls section composition, the second controls node visibility.

---

## 2026-04-24 — Hero shader and foreground layering reduced animation legibility

**Symptoms**
- The hero background used a separate faded purple glow behind the animation, which fought with the new shader treatment and made the composition feel muddy.
- The requested GemSmoke look initially included too much non-purple color for the brand direction.
- Some graph nodes in the hero appeared too transparent over the shader.
- The animation needed to be guaranteed above the shader rather than blending into the background.

**Root cause**
The hero had two overlapping ambience systems: the old radial glow in `Hero` and the new Paper Design shader in `ShaderBackground`. The animation layer did not have a strong enough explicit stacking/isolation contract, and shared graph node opacity defaults were tuned for app surfaces rather than a moving shader backdrop.

**Fix**
Use `GemSmoke` as the hero shader in a purple/violet/lavender-only palette, remove the grain overlay so it does not dominate the animation, and remove the separate ambient glow layer from `Hero`. Put the animation wrapper on an isolated foreground layer (`z-20 isolate`) and tune hero graph node opacity through `SemanticNode` data overrides.

**Affected files**
- `src/components/landing/ShaderBackground.tsx`
- `src/components/landing/Hero.tsx`
- `src/components/landing/ClyptHeroAnimation.tsx`
- `src/components/graph/SemanticNode.tsx`

**Preventive rule**
**A hero section should have one primary ambience system.** Do not stack old glow layers with shader primitives unless each layer has a defined role and z-index. When a shader sits behind interactive/animated content, set explicit foreground isolation and tune content opacity against the shader, not just against a flat background.

---

## 2026-04-24 — Landing copy, CTA bar, and phase preview labels wrapped or duplicated incorrectly

**Symptoms**
- The hero subheading wrapped to three lines, leaving the final word alone and making the copy block feel uneven.
- The paste-link CTA bar became too long for the revised hero composition.
- Moving the `See demo` button away from the CTA bar made the primary hero controls feel split; moving it back required shrinking the bar without compressing the text.
- Phase preview headers showed `Joe Rogan × Flagrant` twice; the second occurrence should have been the source filename.
- Some phase preview text cut off because phase 02/03 and phase 05 preview components were too narrow for their labels.

**Root cause**
The hero copy and CTA widths were tuned before the right-side animation became denser and larger. Once the animation occupied the reserved space, the left column needed wider text but a shorter input/CTA bar. The phase preview mock chrome reused the run title for both the window/context title and the file/source label, creating duplicate text instead of matching the app's run/file hierarchy.

**Fix**
Increase the hero subheading width and tighten line height so the sentence resolves as two lines. Restore `See demo` beside `Try free now`, but cap the CTA bar at a shorter width. Change the duplicated phase preview secondary title to `joeroganflagrant.mp4`. Widen phase 02/03 and phase 05 preview surfaces enough to prevent label wrap/cutoff while keeping the outer scrollytelling layout stable.

**Affected files**
- `src/components/landing/Hero.tsx`
- `src/components/landing/PipelineDemos.tsx`
- `src/components/landing/previews/LandingTimelinePreview.tsx`
- `src/components/landing/previews/LandingSearchPreview.tsx`
- `src/components/landing/previews/LandingRenderPreview.tsx`

**Preventive rule**
**Hero control groups should be tuned as a system: copy width, input width, and sibling CTA buttons must be checked together.** For mock app chrome, distinguish the run/display title from the source filename; never duplicate the same label in adjacent hierarchy slots unless the actual app does.

---
