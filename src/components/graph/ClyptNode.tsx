import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useLandingHover } from "@/components/landing/LandingHoverCtx";

/* ── Type → color map (matches SemanticNode exactly) ── */
const NODE_TYPE_COLORS: Record<string, string> = {
  claim:             "#A78BFA",
  explanation:       "#60A5FA",
  anecdote:          "#FBB249",
  reaction_beat:     "#4ADE80",
  setup_payoff:      "#FB923C",
  qa_exchange:       "#38BDF8",
  challenge_exchange:"#FB923C",
  reveal:            "#FACC15",
  transition:        "#71717A",
  hook:              "#4ADE80",
  conflict:          "#EF4444",
  punchline:         "#FBB249",
  payoff:            "#4ADE80",
  insight:           "#A78BFA",
  topic_shift:       "#60A5FA",
  speaker_beat:      "#E879F9",
};

const PILL_STYLES: Record<string, { pillBg: string; pillText: string }> = {
  claim:             { pillBg: "rgba(167,139,250,0.15)", pillText: "#C4B5FD" },
  explanation:       { pillBg: "rgba(96,165,250,0.15)",  pillText: "#93C5FD" },
  anecdote:          { pillBg: "rgba(251,178,73,0.15)",  pillText: "#FCD34D" },
  reaction_beat:     { pillBg: "rgba(74,222,128,0.15)",  pillText: "#86EFAC" },
  setup_payoff:      { pillBg: "rgba(251,146,60,0.15)",  pillText: "#FDBA74" },
  qa_exchange:       { pillBg: "rgba(56,189,248,0.15)",  pillText: "#7DD3FC" },
  challenge_exchange:{ pillBg: "rgba(251,146,60,0.15)",  pillText: "#FDBA74" },
  reveal:            { pillBg: "rgba(250,204,21,0.15)",  pillText: "#FDE047" },
  transition:        { pillBg: "rgba(113,113,122,0.15)", pillText: "#A1A1AA" },
  hook:              { pillBg: "rgba(74,222,128,0.15)",  pillText: "#86EFAC" },
  conflict:          { pillBg: "rgba(239,68,68,0.15)",   pillText: "#FCA5A5" },
  punchline:         { pillBg: "rgba(251,178,73,0.15)",  pillText: "#FCD34D" },
  payoff:            { pillBg: "rgba(74,222,128,0.15)",  pillText: "#86EFAC" },
  insight:           { pillBg: "rgba(167,139,250,0.15)", pillText: "#C4B5FD" },
  topic_shift:       { pillBg: "rgba(96,165,250,0.15)",  pillText: "#93C5FD" },
  speaker_beat:      { pillBg: "rgba(232,121,249,0.15)", pillText: "#F0ABFC" },
};

const GLOW_BASE: Record<string, string> = {
  claim:             "rgba(167,139,250,",
  explanation:       "rgba(96,165,250,",
  anecdote:          "rgba(251,178,73,",
  reaction_beat:     "rgba(74,222,128,",
  setup_payoff:      "rgba(251,146,60,",
  qa_exchange:       "rgba(56,189,248,",
  challenge_exchange:"rgba(251,146,60,",
  reveal:            "rgba(250,204,21,",
  transition:        "rgba(148,163,184,",
  hook:              "rgba(74,222,128,",
  conflict:          "rgba(239,68,68,",
  punchline:         "rgba(251,178,73,",
  payoff:            "rgba(74,222,128,",
  insight:           "rgba(167,139,250,",
  topic_shift:       "rgba(96,165,250,",
  speaker_beat:      "rgba(232,121,249,",
};

const SIGNAL_COLORS: Record<string, string> = {
  trend:     "#FB923C",
  comment:   "#60A5FA",
  retention: "#4ADE80",
  clip:      "#A78BFA",
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export interface ClyptNodeData {
  label: string;
  type: string;
  signals?: string[];
  nodeWidth?: number;
  _isHoverTarget?: boolean;
  _isHoverConnected?: boolean;
  _hasHover?: boolean;
  /** Optional: caller can inject hover callbacks to bypass React Flow's
   *  onNodeMouseEnter (which is gated by an internal isDragging flag that
   *  can be stuck when the component mounts during a scroll gesture). */
  _onHoverEnter?: (id: string) => void;
  _onHoverLeave?: () => void;
  [key: string]: unknown;
}

function ClyptNodeComponent({ data, id }: NodeProps) {
  const d = data as unknown as ClyptNodeData;
  const lh = useLandingHover();

  const color  = NODE_TYPE_COLORS[d.type] ?? "#71717A";
  const pill   = PILL_STYLES[d.type]      ?? { pillBg: "rgba(113,113,122,0.15)", pillText: "#A1A1AA" };
  const base   = GLOW_BASE[d.type]        ?? "rgba(167,139,250,";
  const nodeWidth = typeof d.nodeWidth === "number" ? d.nodeWidth : 160;

  // When inside LandingGraphDemo, read hover state from context so the ReactFlow
  // `nodes` prop stays static and never triggers remount cascades. Fall back to
  // data props (used by AuthLayout where onNodeMouseEnter works normally).
  const isTarget    = lh ? lh.hoveredNodeId === id
                         : !!d._isHoverTarget;
  const isConnected = lh ? (lh.hoveredNodeId ? lh.connectedNodeIds.has(id) && lh.hoveredNodeId !== id : false)
                         : !!d._isHoverConnected;
  const hasHover    = lh ? !!lh.hoveredNodeId : !!d._hasHover;
  const isDimmed    = hasHover && !isTarget && !isConnected;

  const handleEnter = lh ? () => lh.onHoverEnter(id) : (d._onHoverEnter ? () => d._onHoverEnter!(id) : undefined);
  const handleLeave = lh ? () => lh.onHoverLeave()   : (d._onHoverLeave ? () => d._onHoverLeave!()   : undefined);

  const boxShadow = isTarget
    ? `0 0 28px ${base}0.7), 0 0 10px ${base}0.45)`
    : isConnected
    ? `0 0 20px ${base}0.5), 0 0 6px ${base}0.3)`
    : "none";

  // Frosted glass + type-color tint — matches SemanticNode exactly
  const nodeBg = `linear-gradient(135deg, ${hexToRgba(color, 0.18)}, ${hexToRgba(color, 0.06)} 60%), rgba(10,9,9,0.45)`;
  const borderColor = (isTarget || isConnected) ? color : `${color}A8`;

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        width: nodeWidth,
        borderRadius: 10,
        padding: "10px 12px",
        background: nodeBg,
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        border: `1.5px solid ${borderColor}`,
        boxShadow,
        opacity: isDimmed ? 0.2 : 1,
        transition: "box-shadow 150ms ease, opacity 150ms ease, border-color 150ms ease",
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 8, height: 8, borderRadius: "50%", background: color, border: "none" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: 8, height: 8, borderRadius: "50%", background: color, border: "none" }}
      />

      {/* Pill + signal badges */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 9,
            letterSpacing: "0.05em",
            background: pill.pillBg,
            border: `1px solid ${color}66`,
            borderRadius: 4,
            padding: "2px 6px",
            color: pill.pillText,
          }}
        >
          {d.type}
        </span>
        {d.signals && d.signals.length > 0 && (
          <div style={{ display: "flex" }}>
            {d.signals.map((sig, i) => (
              <div
                key={sig}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: SIGNAL_COLORS[sig] ?? "#A78BFA",
                  marginLeft: i > 0 ? -3 : 0,
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 11,
          color: "rgba(255,255,255,0.85)",
          fontWeight: 500,
          lineHeight: 1.4,
          marginTop: 5,
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

export const ClyptNode = memo(ClyptNodeComponent);
