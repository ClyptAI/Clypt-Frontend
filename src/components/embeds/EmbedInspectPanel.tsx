import { X, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { EmbedPoint } from "@/hooks/api/useEmbeddings";

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

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

interface EmbedInspectPanelProps {
  node: EmbedPoint | null;
  runId: string;
  onClose: () => void;
}

export default function EmbedInspectPanel({ node, runId, onClose }: EmbedInspectPanelProps) {
  const isOpen = node !== null;
  const color = node ? (NODE_TYPE_COLORS[node.node_type] ?? "#71717A") : "#71717A";

  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: 340,
        zIndex: 30,
        background: "var(--color-surface-1)",
        borderLeft: "1px solid var(--color-border)",
        overflowY: "auto",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 200ms ease-in-out",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {node && (
        <>
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--color-border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <span className="label-caps">Node</span>
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 11,
                color: "var(--color-text-muted)",
              }}
            >
              {node.node_id}
            </span>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                display: "flex",
                padding: 2,
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              flex: 1,
            }}
          >
            {/* Type pill + candidate badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  background: `${color}1f`,
                  border: `1px solid ${color}4d`,
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 10,
                  color,
                  padding: "3px 7px",
                  borderRadius: 3,
                }}
              >
                {node.node_type}
              </span>
              {node.is_candidate && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "rgba(251,178,73,0.12)",
                    border: "1px solid rgba(251,178,73,0.35)",
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 10,
                    color: "#FBB249",
                    padding: "3px 7px",
                    borderRadius: 3,
                  }}
                >
                  <Star size={9} fill="#FBB249" />
                  candidate
                </span>
              )}
            </div>

            {/* Timestamp */}
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 13,
                color: "var(--color-text-secondary)",
              }}
            >
              {formatTime(node.start_s)} → {formatTime(node.end_s)}
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                }}
              >
                ({node.end_s - node.start_s}s)
              </span>
            </span>

            {/* Summary */}
            <div style={{ borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: 16 }}>
              <span className="label-caps" style={{ display: "block", marginBottom: 6 }}>
                Summary
              </span>
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: 14,
                  color: "var(--color-text-primary)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {node.summary}
              </p>
            </div>

            {/* Transcript excerpt */}
            <div style={{ borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: 16 }}>
              <span className="label-caps" style={{ display: "block", marginBottom: 6 }}>
                Transcript
              </span>
              <div
                style={{
                  background: "var(--color-surface-2)",
                  borderRadius: 6,
                  padding: "10px 12px",
                  borderLeft: `2px solid ${color}55`,
                }}
              >
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 400,
                    fontSize: 13,
                    fontStyle: "italic",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  "{node.transcript_excerpt}"
                </p>
              </div>
            </div>

            {/* Embedding coordinates (debug info) */}
            <div style={{ borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: 16 }}>
              <span className="label-caps" style={{ display: "block", marginBottom: 6 }}>
                Projection
              </span>
              <div style={{ display: "flex", gap: 16 }}>
                <span
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                  }}
                >
                  x: {node.x.toFixed(4)}
                </span>
                <span
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                  }}
                >
                  y: {node.y.toFixed(4)}
                </span>
              </div>
            </div>

            {/* View in Graph link */}
            <Link
              to={`/runs/${runId}/graph`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: 8,
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                textDecoration: "none",
                transition: "border-color 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${color}55`)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
            >
              <span
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 500,
                  fontSize: 13,
                  color: "var(--color-text-primary)",
                }}
              >
                View in Cortex Graph
              </span>
              <ArrowRight size={14} color={color} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
