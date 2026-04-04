import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ReactFlow,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import DemoCardShell from "./DemoCardShell";
import { ClyptEdge } from "@/components/graph/ClyptEdge";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

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

function ClyptNode({ data }: NodeProps) {
  const d = data as { label: string; type: string; signals: string[] };
  const s = TYPE_STYLES[d.type] || TYPE_STYLES.claim;
  const nodeGlowMap: Record<string, string> = {
    claim: "0 0 18px rgba(167,139,250,0.35)",
    explanation: "0 0 18px rgba(96,165,250,0.30)",
    anecdote: "0 0 18px rgba(251,178,73,0.30)",
    setup_payoff: "0 0 18px rgba(251,146,60,0.30)",
    reaction_beat: "0 0 18px rgba(74,222,128,0.30)",
    qa_exchange: "0 0 18px rgba(56,189,248,0.30)",
  };
  return (
    <div
      style={{
        width: 160,
        background: "rgba(10,9,9,0.85)",
        borderRadius: 10,
        padding: "10px 12px",
        border: `1.5px solid ${s.border}`,
        boxShadow: nodeGlowMap[d.type] ?? "0 0 14px rgba(255,255,255,0.12)",
        transition: "box-shadow 200ms ease",
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
          <div style={{ display: "flex", gap: -4 }}>
            {d.signals.map((sig) => (
              <div
                key={sig}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: SIGNAL_COLORS[sig] ?? "#A78BFA",
                  marginLeft: -4,
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
  return (
    <DemoCardShell label="cortex_graph · 8 nodes · 11 edges" className="mx-auto">
      <div style={{ maxWidth: 1100 }}>
      <div
        style={{
          height: 420,
          position: "relative",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <ReactFlow
          nodes={demoNodes}
          edges={demoEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          panOnScroll={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
          fitView
          style={{ background: "transparent" }}
        />
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
