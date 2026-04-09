import { memo } from "react";
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
  hook: "#4ADE80",
  conflict: "#EF4444",
  punchline: "#FBB249",
  payoff: "#4ADE80",
  insight: "#A78BFA",
  topic_shift: "#60A5FA",
  speaker_beat: "#E879F9",
};

const PILL_STYLES: Record<string, { pillBg: string; pillText: string }> = {
  claim: { pillBg: "rgba(167,139,250,0.15)", pillText: "#C4B5FD" },
  explanation: { pillBg: "rgba(96,165,250,0.15)", pillText: "#93C5FD" },
  example: { pillBg: "rgba(45,212,191,0.15)", pillText: "#5EEAD4" },
  anecdote: { pillBg: "rgba(251,178,73,0.15)", pillText: "#FCD34D" },
  reaction_beat: { pillBg: "rgba(251,113,133,0.15)", pillText: "#FDA4AF" },
  qa_exchange: { pillBg: "rgba(74,222,128,0.15)", pillText: "#86EFAC" },
  challenge_exchange: { pillBg: "rgba(251,146,60,0.15)", pillText: "#FDBA74" },
  setup_payoff: { pillBg: "rgba(232,121,249,0.15)", pillText: "#F0ABFC" },
  reveal: { pillBg: "rgba(250,204,21,0.15)", pillText: "#FDE047" },
  transition: { pillBg: "rgba(113,113,122,0.15)", pillText: "#A1A1AA" },
  hook: { pillBg: "rgba(74,222,128,0.15)", pillText: "#86EFAC" },
  conflict: { pillBg: "rgba(239,68,68,0.15)", pillText: "#FCA5A5" },
  punchline: { pillBg: "rgba(251,178,73,0.15)", pillText: "#FCD34D" },
  payoff: { pillBg: "rgba(74,222,128,0.15)", pillText: "#86EFAC" },
  insight: { pillBg: "rgba(167,139,250,0.15)", pillText: "#C4B5FD" },
  topic_shift: { pillBg: "rgba(96,165,250,0.15)", pillText: "#93C5FD" },
  speaker_beat: { pillBg: "rgba(232,121,249,0.15)", pillText: "#F0ABFC" },
};

const SIGNAL_COLORS: Record<string, string> = {
  trend: "#FB923C",
  comment: "#60A5FA",
  retention: "#4ADE80",
  clip: "#A78BFA",
};

const GLOW_BASE: Record<string, string> = {
  claim: "rgba(167,139,250,",
  explanation: "rgba(96,165,250,",
  example: "rgba(74,222,128,",
  anecdote: "rgba(251,178,73,",
  reaction_beat: "rgba(74,222,128,",
  qa_exchange: "rgba(56,189,248,",
  challenge_exchange: "rgba(251,146,60,",
  setup_payoff: "rgba(251,146,60,",
  reveal: "rgba(232,121,249,",
  transition: "rgba(148,163,184,",
  hook: "rgba(74,222,128,",
  conflict: "rgba(239,68,68,",
  punchline: "rgba(251,178,73,",
  payoff: "rgba(74,222,128,",
  insight: "rgba(167,139,250,",
  topic_shift: "rgba(96,165,250,",
  speaker_beat: "rgba(232,121,249,",
};

export interface SemanticNodeData {
  node_type: string;
  timeStart: string;
  timeEnd: string;
  summary: string;
  flags?: string[];
  signalTags?: ("trend" | "comment" | "retention")[];
  clipWorthy?: boolean;
  speaker?: string;
  score?: number;
  dimmed?: boolean;
  _isHoverTarget?: boolean;
  _isHoverConnected?: boolean;
  _hasHover?: boolean;
  [key: string]: unknown;
}

/** Converts a 6-digit hex color to rgba() string. */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function SemanticNode({ data, selected }: NodeProps) {
  const d = data as unknown as SemanticNodeData;
  const color = NODE_TYPE_COLORS[d.node_type] ?? "#71717A";
  const pill = PILL_STYLES[d.node_type] ?? { pillBg: "rgba(113,113,122,0.15)", pillText: "#A1A1AA" };

  // Hover flags from parent
  const isHoverTarget = !!d._isHoverTarget;
  const isHoverConnected = !!d._isHoverConnected;
  const hasHover = !!d._hasHover;
  const isDimmed = (hasHover && !isHoverTarget && !isHoverConnected) || d.dimmed;

  const base = GLOW_BASE[d.node_type] ?? "rgba(167,139,250,";
  const boxShadow = isHoverTarget
    ? `0 0 28px ${base}0.7), 0 0 10px ${base}0.45)`
    : isHoverConnected
    ? `0 0 20px ${base}0.5), 0 0 6px ${base}0.3)`
    : selected
    ? `0 0 18px ${base}0.45), 0 0 6px ${base}0.25)`
    : "none";

  // Match reference: bg-type/10 + backdrop-blur creates the frosted glass node body.
  // Edges behind show as blurred smears through the translucent background — that IS the intended effect.
  const nodeBg = `linear-gradient(135deg, ${hexToRgba(color, 0.18)}, ${hexToRgba(color, 0.06)} 60%), rgba(10,9,9,0.45)`;
  // Border at 65% opacity at rest, full on active states
  const borderColor = (isHoverTarget || isHoverConnected || selected) ? color : `${color}A8`;

  // Build signal badges
  const signals: { key: string; color: string }[] = [];
  if (d.clipWorthy) signals.push({ key: "clip", color: SIGNAL_COLORS.clip });
  if (d.signalTags) {
    d.signalTags.forEach((tag) => {
      if (SIGNAL_COLORS[tag]) signals.push({ key: tag, color: SIGNAL_COLORS[tag] });
    });
  }

  return (
    <div
      style={{
        minWidth: 180,
        maxWidth: 220,
        borderRadius: 10,
        opacity: isDimmed ? 0.2 : 1,
        background: nodeBg,
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        border: `1.5px solid ${borderColor}`,
        padding: "10px 12px 10px 12px",
        boxShadow,
        transition: "opacity 150ms ease, box-shadow 150ms ease, background 100ms ease",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {/* Top row: type pill + signal badges */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
          {d.node_type}
        </span>
        {signals.length > 0 && (
          <div style={{ display: "flex" }}>
            {signals.map((sig, i) => (
              <div
                key={sig.key}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: sig.color,
                  marginLeft: i > 0 ? -3 : 0,
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Summary / label */}
      <p
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 500,
          fontSize: 12,
          color: "rgba(255,255,255,0.85)",
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

      {/* Detail row: speaker · timestamp · score */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        {d.speaker ? (
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
            {d.speaker}
          </span>
        ) : (
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
            {d.timeStart} → {d.timeEnd}
          </span>
        )}
        {d.speaker && (
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
            {d.timeStart}
          </span>
        )}
        {typeof d.score === "number" && (
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700, color }}>
            {d.score}
          </span>
        )}
      </div>

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
                  background: "rgba(255,255,255,0.35)",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
                {f}
              </span>
            </span>
          ))}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          border: "none",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          border: "none",
        }}
      />
    </div>
  );
}

export default memo(SemanticNode);
