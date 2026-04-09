import { useState, useMemo, useRef, useEffect } from "react";
import { ReactFlow, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import DemoCardShell from "./DemoCardShell";
import { ClyptEdge } from "@/components/graph/ClyptEdge";
import { ClyptNode } from "@/components/graph/ClyptNode";

const TYPE_STYLES: Record<string, { pillBg: string; pillText: string }> = {
  claim:             { pillBg: "rgba(167,139,250,0.15)", pillText: "#C4B5FD" },
  explanation:       { pillBg: "rgba(96,165,250,0.15)",  pillText: "#93C5FD" },
  anecdote:          { pillBg: "rgba(251,178,73,0.15)",  pillText: "#FCD34D" },
  reaction_beat:     { pillBg: "rgba(74,222,128,0.15)",  pillText: "#86EFAC" },
  setup_payoff:      { pillBg: "rgba(251,146,60,0.15)",  pillText: "#FDBA74" },
  qa_exchange:       { pillBg: "rgba(56,189,248,0.15)",  pillText: "#7DD3FC" },
};

const nodeTypes = { clyptNode: ClyptNode };
const edgeTypes = { clyptEdge: ClyptEdge };

const demoNodes: Node[] = [
  { id: "1", type: "clyptNode", position: { x: 40, y: 140 }, data: { label: "The core argument", type: "claim", signals: ["trend"] } },
  { id: "2", type: "clyptNode", position: { x: 260, y: 60 }, data: { label: "How the system works", type: "explanation", signals: [] } },
  { id: "3", type: "clyptNode", position: { x: 260, y: 220 }, data: { label: "The story from 2019", type: "anecdote", signals: ["comment"] } },
  { id: "4", type: "clyptNode", position: { x: 480, y: 40 }, data: { label: "Audience pushback", type: "reaction_beat", signals: [] } },
  { id: "5", type: "clyptNode", position: { x: 480, y: 180 }, data: { label: "The setup", type: "setup_payoff", signals: ["trend", "retention"] } },
  { id: "6", type: "clyptNode", position: { x: 700, y: 110 }, data: { label: "Q&A on the method", type: "qa_exchange", signals: ["retention"] } },
  { id: "7", type: "clyptNode", position: { x: 700, y: 270 }, data: { label: "The payoff moment", type: "setup_payoff", signals: [] } },
  { id: "8", type: "clyptNode", position: { x: 920, y: 160 }, data: { label: "Callbacks to the claim", type: "explanation", signals: ["comment"] } },
];

const demoEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", type: "clyptEdge", data: { label: "supports" } },
  { id: "e1-3", source: "1", target: "3", type: "clyptEdge", data: { label: "supports" } },
  { id: "e2-4", source: "2", target: "4", type: "clyptEdge", data: { label: "elaborates" } },
  { id: "e3-5", source: "3", target: "5", type: "clyptEdge", data: { label: "setup_for" } },
  { id: "e4-6", source: "4", target: "6", type: "clyptEdge", data: { label: "challenges" } },
  { id: "e5-7", source: "5", target: "7", type: "clyptEdge", data: { label: "payoff_of" } },
  { id: "e6-8", source: "6", target: "8", type: "clyptEdge", data: { label: "answers" } },
  { id: "e7-8", source: "7", target: "8", type: "clyptEdge", data: { label: "escalates" } },
  { id: "e1-6", source: "1", target: "6", type: "clyptEdge", data: { label: "callback_to", dashed: true, animated: true } },
  { id: "e3-7", source: "3", target: "7", type: "clyptEdge", data: { label: "topic_recurrence", dashed: true } },
  { id: "e5-8", source: "5", target: "8", type: "clyptEdge", data: { label: "elaborates" } },
];

const legendTypes = ["claim", "explanation", "anecdote", "setup_payoff", "reaction_beat"];

export default function LandingGraphDemo() {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Delay-mount ReactFlow until the container is in the viewport.
  // This guarantees the same initialization conditions as AuthLayout
  // (where the graph is above the fold and visible on first paint).
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

  const displayNodes = useMemo(() => {
    return demoNodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        _isHoverTarget: hoveredNodeId === n.id,
        _isHoverConnected: hoveredNodeId ? connectedNodeIds.has(n.id) && hoveredNodeId !== n.id : false,
        _hasHover: !!hoveredNodeId,
      },
    }));
  }, [hoveredNodeId, connectedNodeIds]);

  const displayEdges = useMemo(() => {
    return demoEdges.map((e) => ({
      ...e,
      data: {
        ...e.data,
        _isHoverHighlighted: hoveredNodeId ? connectedEdgeIds.has(e.id) : false,
        _isEdgeHovered: hoveredEdgeId === e.id,
        _hasHover: !!hoveredNodeId || !!hoveredEdgeId,
      },
    }));
  }, [hoveredNodeId, hoveredEdgeId, connectedEdgeIds]);

  return (
    <DemoCardShell label="cortex_graph · 8 nodes · 11 edges" className="mx-auto">
      <div ref={sentinelRef} style={{ maxWidth: 1100 }}>
        <div
          style={{
            height: 420,
            position: "relative",
            backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          {mounted && (
            <div style={{ position: "absolute", inset: 0 }}>
              <ReactFlow
                nodes={displayNodes}
                edges={displayEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                nodesDraggable={false}
                nodesConnectable={false}
                zoomOnScroll={false}
                panOnScroll={false}
                panOnDrag={false}
                preventScrolling={false}
                proOptions={{ hideAttribution: true }}
                onNodeMouseEnter={(_evt, node) => setHoveredNodeId(node.id)}
                onNodeMouseLeave={() => setHoveredNodeId(null)}
                onEdgeMouseEnter={(_evt, edge) => setHoveredEdgeId(edge.id)}
                onEdgeMouseLeave={() => setHoveredEdgeId(null)}
                fitView
                fitViewOptions={{ padding: 0.25 }}
                style={{ background: "transparent" }}
              />
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
  );
}
