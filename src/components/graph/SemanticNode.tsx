import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

const NODE_TYPE_COLORS: Record<string, string> = {
  claim: "#A78BFA",
  explanation: "#60A5FA",
  example: "#2DD4BF",
  anecdote: "#FBB249",
  reaction_beat: "#FB7185",
  qa_exchange: "#4ADE80",
  challenge_exchange: "#FB923C",
  setup_payoff: "#E879F9",
  reveal: "#FACC15",
  transition: "#71717A",
};

export interface SemanticNodeData {
  node_type: string;
  timeStart: string;
  timeEnd: string;
  summary: string;
  flags?: string[];
  [key: string]: unknown;
}

function SemanticNode({ data, selected }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const d = data as unknown as SemanticNodeData;
  const color = NODE_TYPE_COLORS[d.node_type] ?? "#71717A";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minWidth: 180,
        maxWidth: 220,
        borderRadius: 8,
        background: selected || hovered ? "var(--color-surface-2)" : "var(--color-surface-1)",
        border: selected ? `1px solid ${color}b3` : "1px solid var(--color-border)",
        borderLeft: `3px solid ${color}`,
        padding: "10px 12px 10px 14px",
        boxShadow: selected ? `inset 0 0 0 1px ${color}26` : "none",
        transition: "background 100ms ease",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            background: `${color}1f`,
            border: `1px solid ${color}4d`,
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10,
            color,
            padding: "2px 6px",
            borderRadius: 3,
          }}
        >
          {d.node_type}
        </span>
        {/* Signal tag placeholder */}
        <div style={{ display: "flex", gap: 4 }} />
      </div>

      {/* Timestamp */}
      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "var(--color-text-muted)" }}>
        {d.timeStart} → {d.timeEnd}
      </span>

      {/* Summary */}
      <p
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 400,
          fontSize: 12,
          color: "var(--color-text-primary)",
          lineHeight: 1.4,
          margin: 0,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {d.summary}
      </p>

      {/* Flags */}
      {d.flags && d.flags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {d.flags.map((f) => (
            <span key={f} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "var(--color-text-muted)",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, color: "var(--color-text-muted)" }}>
                {f}
              </span>
            </span>
          ))}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--color-border)",
          border: "1px solid var(--color-border)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 100ms",
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--color-border)",
          border: "1px solid var(--color-border)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 100ms",
        }}
      />
    </div>
  );
}

export default memo(SemanticNode);
