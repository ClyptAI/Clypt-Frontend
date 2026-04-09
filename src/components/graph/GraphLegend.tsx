import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const NODE_TYPES = [
  { key: "claim", color: "#A78BFA" },
  { key: "explanation", color: "#60A5FA" },
  { key: "example", color: "#2DD4BF" },
  { key: "anecdote", color: "#FBB249" },
  { key: "reaction_beat", color: "#FB7185" },
  { key: "qa_exchange", color: "#4ADE80" },
  { key: "challenge_exchange", color: "#FB923C" },
  { key: "setup_payoff", color: "#E879F9" },
  { key: "reveal", color: "#FACC15" },
  { key: "transition", color: "#71717A" },
];

interface GraphLegendProps {
  typeCounts: Record<string, number>;
}

export default function GraphLegend({ typeCounts }: GraphLegendProps) {
  const [open, setOpen] = useState(true);
  const present = NODE_TYPES.filter((t) => (typeCounts[t.key] ?? 0) > 0);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        left: 12,
        zIndex: 20,
        pointerEvents: "auto",
        background: "var(--color-surface-1)",
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: "12px 14px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: open ? 8 : 0 }}>
        <span className="label-caps">Node types</span>
        <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "flex" }}>
          {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {present.map((t) => (
            <div key={t.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 12, color: "var(--color-text-secondary)" }}>{t.key}</span>
              </div>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>{typeCounts[t.key]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
