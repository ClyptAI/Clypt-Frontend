import { ReactNode, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ClyptLogo } from "@/components/ui/ClyptLogo";
import { ReactFlow, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ClyptEdge } from "@/components/graph/ClyptEdge";
import { ClyptNode } from "@/components/graph/ClyptNode";
import ShaderBackground from "@/components/landing/ShaderBackground";

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
  const navigate = useNavigate();
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
        {/* Animated shader behind everything in the brand panel */}
        <ShaderBackground variant="auth" className="shader-layer" style={{ zIndex: 0 }} />

        {/* React Flow graph background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
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

        {/* Logo — above graph */}
        <div style={{ position: "relative", zIndex: 10, padding: 40 }}>
          <div className="cursor-pointer" onClick={() => navigate("/")}>
            <ClyptLogo size="xl" />
          </div>
        </div>

        {/* Spacer — must not block graph pointer events */}
        <div className="flex-1" style={{ pointerEvents: "none" }} />

        {/* Testimonial — above graph */}
        <div style={{ position: "relative", zIndex: 10, padding: "0 40px 40px 40px", pointerEvents: "none" }}>
          <div className="w-10 h-px bg-[var(--color-border)] mb-4" />
          <p
            className="font-heading font-medium italic text-[var(--color-text-secondary)]"
            style={{ fontSize: 16 }}
          >
            "Finally a tool that thinks the way I edit."
          </p>
        </div>

        {/* Copyright — above graph */}
        <div style={{ position: "relative", zIndex: 10, padding: "0 40px 24px 40px", pointerEvents: "none" }}>
          <span className="font-sans text-xs text-[var(--color-text-muted)]">© 2026 Clypt</span>
        </div>
      </div>

      {/* Right panel — dark to match the product, frosted glass card */}
      <div
        className="w-[60%] flex items-center justify-center relative"
        style={{
          backgroundColor: "#0E0C12",
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(167,139,250,0.08), transparent 60%), radial-gradient(ellipse 60% 60% at 30% 90%, rgba(34,211,238,0.05), transparent 60%)",
          animation: "fadeIn 300ms ease-out both",
        }}
      >
        <div className="w-[400px] flex flex-col gap-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
