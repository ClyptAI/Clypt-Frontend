import { ReactNode, useState, useMemo } from "react";
import { ClyptLogo } from "@/components/ui/ClyptLogo";
import {
  ReactFlow,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ClyptEdge } from "@/components/graph/ClyptEdge";

/* ── Shared node styles ── */

const TYPE_STYLES: Record<string, { border: string; pillBg: string; pillText: string }> = {
  claim: { border: "#A78BFA", pillBg: "rgba(167,139,250,0.15)", pillText: "#C4B5FD" },
  explanation: { border: "#60A5FA", pillBg: "rgba(96,165,250,0.15)", pillText: "#93C5FD" },
  anecdote: { border: "#FBB249", pillBg: "rgba(251,178,73,0.15)", pillText: "#FCD34D" },
  reaction_beat: { border: "#4ADE80", pillBg: "rgba(74,222,128,0.15)", pillText: "#86EFAC" },
  setup_payoff: { border: "#FB923C", pillBg: "rgba(251,146,60,0.15)", pillText: "#FDBA74" },
  qa_exchange: { border: "#38BDF8", pillBg: "rgba(56,189,248,0.15)", pillText: "#7DD3FC" },
};

const SIGNAL_COLORS: Record<string, string> = {
  trend: "#FB923C",
  comment: "#60A5FA",
  retention: "#4ADE80",
};

const NODE_GLOW_BASE: Record<string, string> = {
  claim: "rgba(167,139,250,",
  explanation: "rgba(96,165,250,",
  anecdote: "rgba(251,178,73,",
  setup_payoff: "rgba(251,146,60,",
  reaction_beat: "rgba(74,222,128,",
  qa_exchange: "rgba(56,189,248,",
};

function ClyptNode({ data }: NodeProps) {
  const d = data as {
    label: string;
    type: string;
    signals: string[];
    _isHoverTarget?: boolean;
    _isHoverConnected?: boolean;
    _hasHover?: boolean;
  };
  const s = TYPE_STYLES[d.type] || TYPE_STYLES.claim;
  const base = NODE_GLOW_BASE[d.type] ?? "rgba(167,139,250,";

  const isTarget = !!d._isHoverTarget;
  const isConnected = !!d._isHoverConnected;
  const hasHover = !!d._hasHover;
  const isDimmed = hasHover && !isTarget && !isConnected;

  const boxShadow = isTarget
    ? `0 0 22px ${base}0.55), 0 0 8px ${base}0.4)`
    : isConnected
    ? `0 0 16px ${base}0.30)`
    : "none";

  return (
    <div
      style={{
        width: 160,
        background: "rgba(10,9,9,0.85)",
        borderRadius: 10,
        padding: "10px 12px",
        border: `1.5px solid ${s.border}`,
        boxShadow,
        opacity: isDimmed ? 0.2 : 1,
        transition: "box-shadow 150ms ease, opacity 150ms ease",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ visibility: "hidden" }} />
      <Handle type="source" position={Position.Right} style={{ visibility: "hidden" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
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
          {d.type}
        </span>
        {d.signals.length > 0 && (
          <div style={{ display: "flex" }}>
            {d.signals.map((sig, i) => (
              <div
                key={sig}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: SIGNAL_COLORS[sig] ?? "#A78BFA",
                  marginLeft: i > 0 ? -4 : 0,
                }}
              />
            ))}
          </div>
        )}
      </div>
      <div
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 11,
          color: "rgba(255,255,255,0.85)",
          fontWeight: 500,
          lineHeight: 1.4,
          marginTop: 4,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {d.label}
      </div>
    </div>
  );
}

const nodeTypes = { clyptNode: ClyptNode };
const edgeTypes = { clyptEdge: ClyptEdge };

const authNodes: Node[] = [
  { id: "1", type: "clyptNode", position: { x: 20, y: 100 }, data: { label: "The hook nobody expected", type: "claim", signals: ["trend"] } },
  { id: "2", type: "clyptNode", position: { x: 280, y: 30 }, data: { label: "Setting the scene", type: "setup_payoff", signals: [] } },
  { id: "3", type: "clyptNode", position: { x: 10, y: 320 }, data: { label: "The pivot moment", type: "anecdote", signals: ["comment"] } },
  { id: "4", type: "clyptNode", position: { x: 270, y: 260 }, data: { label: "Why it resonates", type: "explanation", signals: ["retention"] } },
  { id: "5", type: "clyptNode", position: { x: 100, y: 510 }, data: { label: "The payoff", type: "setup_payoff", signals: [] } },
  { id: "6", type: "clyptNode", position: { x: 300, y: 450 }, data: { label: "Audience reaction", type: "reaction_beat", signals: ["comment"] } },
];

const authEdges: Edge[] = [
  { id: "ae1-2", source: "1", target: "2", type: "clyptEdge", data: { label: "supports" } },
  { id: "ae1-3", source: "1", target: "3", type: "clyptEdge", data: { label: "setup_for" } },
  { id: "ae2-4", source: "2", target: "4", type: "clyptEdge", data: { label: "elaborates" } },
  { id: "ae3-5", source: "3", target: "5", type: "clyptEdge", data: { label: "payoff_of" } },
  { id: "ae4-6", source: "4", target: "6", type: "clyptEdge", data: { label: "triggers" } },
  { id: "ae1-4", source: "1", target: "4", type: "clyptEdge", data: { label: "callback_to", dashed: true, animated: true } },
];

const AuthLayout = ({ children }: { children: ReactNode }) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  const connectedNodeIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    const ids = new Set<string>();
    authEdges.forEach((e) => {
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
    authEdges.forEach((e) => {
      if (e.source === hoveredNodeId || e.target === hoveredNodeId) ids.add(e.id);
    });
    return ids;
  }, [hoveredNodeId]);

  const displayNodes = useMemo(() => {
    return authNodes.map((n) => ({
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
    return authEdges.map((e) => ({
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
    <div className="flex h-screen overflow-hidden">
      {/* Left panel */}
      <div
        className="w-[40%] flex flex-col relative overflow-hidden"
        style={{ background: "#0A0909", borderRight: "1px solid var(--color-border)" }}
      >
        {/* React Flow graph background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            opacity: 0.75,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnScroll={false}
            panOnScroll={false}
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

        {/* Logo — above graph */}
        <div style={{ position: "relative", zIndex: 10, padding: 40 }}>
          <ClyptLogo size="lg" defaultExpanded={true} />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Testimonial — above graph */}
        <div style={{ position: "relative", zIndex: 10, padding: "0 40px 40px 40px" }}>
          <div className="w-10 h-px bg-[var(--color-border)] mb-4" />
          <p
            className="font-heading font-medium italic text-[var(--color-text-secondary)]"
            style={{ fontSize: 16 }}
          >
            "Finally a tool that thinks the way I edit."
          </p>
        </div>

        {/* Copyright — above graph */}
        <div style={{ position: "relative", zIndex: 10, padding: "0 40px 24px 40px" }}>
          <span className="font-sans text-xs text-[var(--color-text-muted)]">© 2026 Clypt</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-[60%] flex items-center justify-center" style={{ backgroundColor: "#F4F1EE" }}>
        <div className="w-[380px] flex flex-col gap-6">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
