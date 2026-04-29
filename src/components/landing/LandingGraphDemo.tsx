import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { ReactFlow, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import DemoCardShell from "./DemoCardShell";
import { ClyptEdge } from "@/components/graph/ClyptEdge";
import { ClyptNode } from "@/components/graph/ClyptNode";
import { LandingHoverCtx } from "./LandingHoverCtx";

const TYPE_STYLES: Record<string, { pillBg: string; pillText: string }> = {
  claim:             { pillBg: "rgba(167,139,250,0.15)", pillText: "#C4B5FD" },
  explanation:       { pillBg: "rgba(96,165,250,0.15)",  pillText: "#93C5FD" },
  anecdote:          { pillBg: "rgba(251,178,73,0.15)",  pillText: "#FCD34D" },
  reaction_beat:     { pillBg: "rgba(74,222,128,0.15)",  pillText: "#86EFAC" },
  setup_payoff:      { pillBg: "rgba(251,146,60,0.15)",  pillText: "#FDBA74" },
  qa_exchange:       { pillBg: "rgba(56,189,248,0.15)",  pillText: "#7DD3FC" },
  challenge_exchange:{ pillBg: "rgba(251,146,60,0.15)",  pillText: "#FDBA74" },
  example:           { pillBg: "rgba(45,212,191,0.15)",  pillText: "#99F6E4" },
};

const nodeTypes = { clyptNode: ClyptNode };
const edgeTypes = { clyptEdge: ClyptEdge };
const graphFrameMaxWidth = 1120;
const graphViewportLeftBleed = 0;
const graphViewportRightBleed = 0;
const graphFitPadding = 0.16;
const landingNodeWidth = 184;

const demoNodes: Node[] = [
  { id: "1", type: "clyptNode", position: { x: 42, y: 205 }, data: { label: "Fear grizzlies by default", type: "claim", signals: ["trend"], nodeWidth: landingNodeWidth } },
  { id: "2", type: "clyptNode", position: { x: 246, y: 72 }, data: { label: "A grizzly is a 900-pound wild dog", type: "explanation", signals: [], nodeWidth: landingNodeWidth } },
  { id: "3", type: "clyptNode", position: { x: 246, y: 326 }, data: { label: "Fresh bear sign by the elk", type: "setup_payoff", signals: ["trend"], nodeWidth: landingNodeWidth } },
  { id: "4", type: "clyptNode", position: { x: 478, y: 28 }, data: { label: "No — it smells meat", type: "example", signals: ["comment"], nodeWidth: landingNodeWidth } },
  { id: "5", type: "clyptNode", position: { x: 482, y: 246 }, data: { label: "What do you even do there?", type: "qa_exchange", signals: [], nodeWidth: landingNodeWidth } },
  { id: "6", type: "clyptNode", position: { x: 704, y: 132 }, data: { label: "The ice-raft story turns fatal", type: "anecdote", signals: ["retention"], nodeWidth: landingNodeWidth } },
  { id: "7", type: "clyptNode", position: { x: 698, y: 340 }, data: { label: "The camp erupts when it charges", type: "reaction_beat", signals: ["comment", "retention"], nodeWidth: landingNodeWidth } },
];

const demoEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", type: "clyptEdge", data: { label: "elaborates" } },
  { id: "e1-3", source: "1", target: "3", type: "clyptEdge", data: { label: "setup_for" } },
  { id: "e2-4", source: "2", target: "4", type: "clyptEdge", data: { label: "supports" } },
  { id: "e2-5", source: "2", target: "5", type: "clyptEdge", data: { label: "raises" } },
  { id: "e3-5", source: "3", target: "5", type: "clyptEdge", data: { label: "foreshadows", dashed: true } },
  { id: "e4-6", source: "4", target: "6", type: "clyptEdge", data: { label: "escalates" } },
  { id: "e5-7", source: "5", target: "7", type: "clyptEdge", data: { label: "answers" } },
  { id: "e6-7", source: "6", target: "7", type: "clyptEdge", data: { label: "triggers" } },
];

const legendTypes = ["claim", "explanation", "example", "setup_payoff", "qa_exchange", "reaction_beat"];

export default function LandingGraphDemo() {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // RAF-debounced leave: ClyptNode's onMouseEnter triggers a React re-render which
  // can cause the browser to refire mouseleave spuriously. Cancelling the scheduled
  // leave if a new enter arrives within the same frame prevents flickering.
  const leaveRAF = useRef<number | null>(null);
  const onHoverEnter = useCallback((id: string) => {
    if (leaveRAF.current !== null) {
      cancelAnimationFrame(leaveRAF.current);
      leaveRAF.current = null;
    }
    setHoveredNodeId(id);
  }, []);
  const onHoverLeave = useCallback(() => {
    leaveRAF.current = requestAnimationFrame(() => {
      leaveRAF.current = null;
      setHoveredNodeId(null);
    });
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const connectedNodeIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    const ids = new Set<string>();
    demoEdges.forEach((e) => {
      if (e.source === hoveredNodeId || e.target === hoveredNodeId) {
        ids.add(e.source);
        ids.add(e.target);
      }
    });
    return ids;
  }, [hoveredNodeId]);

  const connectedEdgeIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    const ids = new Set<string>();
    demoEdges.forEach((e) => {
      if (e.source === hoveredNodeId || e.target === hoveredNodeId) ids.add(e.id);
    });
    return ids;
  }, [hoveredNodeId]);

  // demoNodes and demoEdges are passed as-is (static constants). Hover state is
  // delivered via LandingHoverCtx so React Flow's node layer never re-renders on
  // hover, which was causing 54+ rapid remount/enter/leave events per hover tick.
  const ctxValue = useMemo(
    () => ({ hoveredNodeId, connectedNodeIds, connectedEdgeIds, onHoverEnter, onHoverLeave }),
    [hoveredNodeId, connectedNodeIds, connectedEdgeIds, onHoverEnter, onHoverLeave],
  );

  return (
    <div className="mx-auto w-full" style={{ maxWidth: graphFrameMaxWidth }}>
      <DemoCardShell label="cortex_graph · 7 nodes · 8 edges" className="w-full">
        <div ref={sentinelRef}>
          <div
            style={{
              height: 430,
              position: "relative",
              backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          >
            {mounted && (
              <div
                style={{
                  position: "absolute",
                  inset: `0 -${graphViewportRightBleed}px 0 -${graphViewportLeftBleed}px`,
                }}
              >
                <LandingHoverCtx.Provider value={ctxValue}>
                  <ReactFlow
                    nodes={demoNodes}
                    edges={demoEdges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    zoomOnScroll={false}
                    panOnScroll={false}
                    panOnDrag={false}
                    preventScrolling={false}
                    proOptions={{ hideAttribution: true }}
                    fitView
                    fitViewOptions={{ padding: graphFitPadding }}
                    style={{ background: "transparent" }}
                    className="rf-landing"
                  />
                </LandingHoverCtx.Provider>
              </div>
            )}
          </div>
          {/* Legend */}
          <div
            style={{
              height: 40,
              background: "rgba(10,9,9,0.7)",
              backdropFilter: "blur(8px)",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {legendTypes.map((t) => {
              const s = TYPE_STYLES[t];
              return (
                <span
                  key={t}
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 9,
                    letterSpacing: "0.05em",
                    background: s.pillBg,
                    borderRadius: 4,
                    padding: "2px 6px",
                    color: s.pillText,
                  }}
                >
                  {t}
                </span>
              );
            })}
          </div>
        </div>
      </DemoCardShell>
    </div>
  );
}
