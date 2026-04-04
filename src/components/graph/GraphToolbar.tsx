import { useState, useRef, useEffect } from "react";
import {
  LayoutGrid,
  ChevronDown,
  Bookmark,
  TrendingUp,
  MessageSquare,
  BarChart2,
  ZoomOut,
  ZoomIn,
  Maximize2,
  Network,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

const NODE_TYPES = [
  { key: "claim", color: "#A78BFA", label: "claim" },
  { key: "explanation", color: "#60A5FA", label: "explanation" },
  { key: "example", color: "#2DD4BF", label: "example" },
  { key: "anecdote", color: "#FBB249", label: "anecdote" },
  { key: "reaction_beat", color: "#FB7185", label: "reaction_beat" },
  { key: "qa_exchange", color: "#4ADE80", label: "qa_exchange" },
  { key: "challenge_exchange", color: "#FB923C", label: "challenge_exchange" },
  { key: "setup_payoff", color: "#E879F9", label: "setup_payoff" },
  { key: "reveal", color: "#FACC15", label: "reveal" },
  { key: "transition", color: "#71717A", label: "transition" },
];

interface GraphToolbarProps {
  typeCounts: Record<string, number>;
  activeTypes: Set<string>;
  onToggleType: (t: string) => void;
  onSelectAllTypes: () => void;
  onClearTypes: () => void;
  confidence: number;
  onConfidenceChange: (v: number) => void;
  clipWorthy: boolean;
  onClipWorthyToggle: () => void;
  signalFilters: { trend: boolean; comment: boolean; retention: boolean };
  onSignalToggle: (s: "trend" | "comment" | "retention") => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  subgraph: boolean;
  onSubgraphToggle: () => void;
}

function Divider() {
  return <div style={{ width: 1, height: 20, background: "var(--color-border)", flexShrink: 0 }} />;
}

function GhostBtn({
  active,
  activeColor,
  activeBg,
  activeBorder,
  onClick,
  children,
  style,
}: {
  active?: boolean;
  activeColor?: string;
  activeBg?: string;
  activeBorder?: string;
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 6,
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontWeight: 500,
        fontSize: 13,
        cursor: "pointer",
        border: active ? `1px solid ${activeBorder ?? "transparent"}` : "1px solid transparent",
        background: active ? (activeBg ?? "var(--color-violet-muted)") : "transparent",
        color: active ? (activeColor ?? "var(--color-violet)") : "var(--color-text-secondary)",
        transition: "all 100ms",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default function GraphToolbar(props: GraphToolbarProps) {
  const [typeOpen, setTypeOpen] = useState(false);
  const [confOpen, setConfOpen] = useState(false);
  const typeRef = useRef<HTMLDivElement>(null);
  const confRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (typeRef.current && !typeRef.current.contains(e.target as HTMLElement)) setTypeOpen(false);
      if (confRef.current && !confRef.current.contains(e.target as HTMLElement)) setConfOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeCount = props.activeTypes.size;
  const typeLabel = activeCount === 10 ? "All types" : `${activeCount} types`;

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        background: "var(--color-surface-1)",
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: "6px 10px",
        display: "flex",
        flexWrap: "nowrap",
        alignItems: "center",
        gap: 6,
        overflowX: "auto",
      }}
    >
      {/* G1 — Node type filter */}
      <div ref={typeRef} style={{ position: "relative" }}>
        <GhostBtn onClick={() => { setTypeOpen(!typeOpen); setConfOpen(false); }}>
          <LayoutGrid size={14} />
          {typeLabel}
          <ChevronDown size={12} />
        </GhostBtn>
        {typeOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              padding: 8,
              width: 220,
              display: "flex",
              flexDirection: "column",
              gap: 4,
              zIndex: 30,
            }}
          >
            {NODE_TYPES.map((t) => (
              <div
                key={t.key}
                onClick={() => props.onToggleType(t.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 8px",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-3)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13, color: "var(--color-text-primary)" }}>{t.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>{props.typeCounts[t.key] ?? 0}</span>
                  <Checkbox
                    checked={props.activeTypes.has(t.key)}
                    onCheckedChange={() => props.onToggleType(t.key)}
                    className="data-[state=checked]:bg-[#A78BFA] data-[state=checked]:border-[#A78BFA]"
                  />
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", marginTop: 4 }}>
              <button onClick={props.onSelectAllTypes} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "var(--color-violet)", background: "none", border: "none", cursor: "pointer" }}>Select all</button>
              <button onClick={props.onClearTypes} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer" }}>Clear</button>
            </div>
          </div>
        )}
      </div>

      <Divider />

      {/* G2 — Confidence */}
      <div ref={confRef} style={{ position: "relative" }}>
        <GhostBtn onClick={() => { setConfOpen(!confOpen); setTypeOpen(false); }}>
          ≥ {props.confidence.toFixed(2)}
        </GhostBtn>
        {confOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              padding: 16,
              width: 200,
              zIndex: 30,
            }}
          >
            <span className="label-caps" style={{ marginBottom: 10, display: "block" }}>Min. confidence</span>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[props.confidence]}
              onValueChange={([v]) => props.onConfidenceChange(v)}
              className="[&_[role=slider]]:bg-[#A78BFA] [&_[role=slider]]:border-[#A78BFA] [&_.relative>div]:bg-[#A78BFA]"
            />
            <div style={{ textAlign: "center", marginTop: 8, fontFamily: "'Geist Mono', monospace", fontSize: 14, color: "var(--color-text-primary)" }}>
              {props.confidence.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* G3 — Clip-worthy */}
      <GhostBtn active={props.clipWorthy} onClick={props.onClipWorthyToggle}>
        <Bookmark size={14} />
        Clip-worthy
      </GhostBtn>

      <Divider />

      {/* G4 — Signal filters */}
      <GhostBtn
        active={props.signalFilters.trend}
        activeColor="#FB923C"
        activeBg="rgba(249,115,22,0.12)"
        activeBorder="rgba(249,115,22,0.3)"
        onClick={() => props.onSignalToggle("trend")}
      >
        <TrendingUp size={13} />
        Trend
      </GhostBtn>
      <GhostBtn
        active={props.signalFilters.comment}
        activeColor="#60A5FA"
        activeBg="rgba(96,165,250,0.12)"
        activeBorder="rgba(96,165,250,0.3)"
        onClick={() => props.onSignalToggle("comment")}
      >
        <MessageSquare size={13} />
        Comment
      </GhostBtn>
      <GhostBtn
        active={props.signalFilters.retention}
        activeColor="#4ADE80"
        activeBg="rgba(74,222,128,0.12)"
        activeBorder="rgba(74,222,128,0.3)"
        onClick={() => props.onSignalToggle("retention")}
      >
        <BarChart2 size={13} />
        Retention
      </GhostBtn>

      <Divider />

      {/* G5 — Zoom */}
      <button onClick={props.onZoomOut} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, border: "none", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer" }}>
        <ZoomOut size={14} />
      </button>
      <button onClick={props.onZoomIn} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, border: "none", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer" }}>
        <ZoomIn size={14} />
      </button>
      <button onClick={props.onFitView} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, border: "none", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer" }}>
        <Maximize2 size={14} />
      </button>

      {/* G6 — Subgraph */}
      <GhostBtn active={props.subgraph} onClick={props.onSubgraphToggle}>
        <Network size={14} />
        Subgraph
      </GhostBtn>
    </div>
  );
}
