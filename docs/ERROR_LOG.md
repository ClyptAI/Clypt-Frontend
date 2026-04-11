# Error Log

Breaking behaviors encountered during development and their fixes. Documented to prevent regressions.

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
