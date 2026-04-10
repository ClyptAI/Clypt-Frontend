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
