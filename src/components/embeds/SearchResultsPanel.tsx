import { X } from "lucide-react";
import type { EmbedPoint } from "@/hooks/api/useEmbeddings";

export interface ScoredPoint extends EmbedPoint {
  score: number;
}

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
  insight:           "#A78BFA",
};

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: "rgba(255,255,255,0.06)",
        borderRadius: "8px 8px 0 0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.round(score * 100)}%`,
          height: "100%",
          background: color,
          borderRadius: "8px 8px 0 0",
          transition: "width 300ms ease",
        }}
      />
    </div>
  );
}

function ResultCard({
  point,
  rank,
  isSelected,
  onClick,
}: {
  point: ScoredPoint;
  rank: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const color = NODE_TYPE_COLORS[point.node_type] ?? "#71717A";

  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        flexShrink: 0,
        width: 210,
        background: isSelected
          ? `rgba(${hexToRgb(color)}, 0.12)`
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${isSelected ? `${color}55` : "rgba(255,255,255,0.08)"}`,
        borderRadius: 8,
        padding: "14px 12px 12px",
        cursor: "pointer",
        transition: "background 120ms, border-color 120ms",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.07)";
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
      }}
    >
      <ScoreBar score={point.score} color={color} />

      {/* Rank + type row */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Geist Mono', monospace",
            fontSize: 9,
            color: "rgba(255,255,255,0.5)",
            flexShrink: 0,
          }}
        >
          {rank}
        </span>
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10,
            color,
            background: `${color}18`,
            border: `1px solid ${color}44`,
            borderRadius: 3,
            padding: "1px 6px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 130,
          }}
        >
          {point.node_type}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "'Geist Mono', monospace",
            fontSize: 9,
            color: "rgba(255,255,255,0.3)",
            flexShrink: 0,
          }}
        >
          {Math.round(point.score * 100)}%
        </span>
      </div>

      {/* Timestamp */}
      <div
        style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 10,
          color: "rgba(255,255,255,0.35)",
          marginBottom: 7,
        }}
      >
        {formatTime(point.start_s)} → {formatTime(point.end_s)}
      </div>

      {/* Summary */}
      <p
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 12,
          color: "rgba(255,255,255,0.7)",
          margin: 0,
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical" as const,
          overflow: "hidden",
        }}
      >
        {point.summary}
      </p>
    </div>
  );
}

// Hex → "R,G,B" helper for rgba()
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

interface SearchResultsPanelProps {
  query: string;
  results: ScoredPoint[];
  selectedId: string | null;
  onSelect: (p: EmbedPoint) => void;
  onClose: () => void;
}

const PANEL_H = 196;

export default function SearchResultsPanel({
  query,
  results,
  selectedId,
  onSelect,
  onClose,
}: SearchResultsPanelProps) {
  const isOpen = results.length > 0;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: PANEL_H,
        zIndex: 10,
        pointerEvents: "auto",
        background: "rgba(10,9,9,0.88)",
        backdropFilter: "blur(14px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        transform: isOpen ? "translateY(0)" : "translateY(100%)",
        transition: "transform 240ms cubic-bezier(0.16,1,0.3,1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px 8px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 11,
            color: "rgba(167,139,250,0.8)",
            fontWeight: 500,
          }}
        >
          {results.length} result{results.length !== 1 ? "s" : ""}
        </span>
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.35)",
          }}
        >
          ·
        </span>
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.5)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            fontStyle: "italic",
          }}
        >
          "{query}"
        </span>
        <button
          onClick={onClose}
          style={{
            flexShrink: 0,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.35)",
            display: "flex",
            alignItems: "center",
            padding: 2,
            borderRadius: 4,
            transition: "color 120ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
        >
          <X size={14} />
        </button>
      </div>

      {/* Cards row */}
      <div
        style={{
          flex: 1,
          overflowX: "auto",
          overflowY: "hidden",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "10px 16px",
          scrollbarWidth: "none",
        }}
      >
        {results.map((p, i) => (
          <ResultCard
            key={p.node_id}
            point={p}
            rank={i + 1}
            isSelected={selectedId === p.node_id}
            onClick={() => onSelect(p)}
          />
        ))}
      </div>
    </div>
  );
}

export { PANEL_H };
