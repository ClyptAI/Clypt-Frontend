import type { Node } from "@xyflow/react";

const NODE_TYPE_COLORS: Record<string, string> = {
  claim: "#A78BFA", explanation: "#60A5FA", example: "#2DD4BF", anecdote: "#FBB249",
  reaction_beat: "#FB7185", qa_exchange: "#4ADE80", challenge_exchange: "#FB923C",
  setup_payoff: "#E879F9", reveal: "#FACC15", transition: "#71717A",
};

// Convert "M:SS" to seconds
function timeToSec(t: string): number {
  if (!t) return 0;
  const parts = t.split(":").map(Number);
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
}

interface TimelineStripProps {
  nodes: Node[];
}

export default function TimelineStrip({ nodes }: TimelineStripProps) {
  const times = nodes.map((n) => {
    const d = n.data as any;
    return timeToSec(d.timeEnd ?? d.timeStart ?? "0:00");
  }).filter(Boolean);

  const maxTime = Math.max(60, ...times);

  const allZero = nodes.every((n) => {
    const d = n.data as any;
    return timeToSec(d.timeStart ?? "0:00") === 0;
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        zIndex: 20,
        background: "var(--color-surface-1)",
        borderTop: "1px solid var(--color-border)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Label row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 12px 0",
          height: 20,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10,
            color: "var(--color-text-muted)",
            letterSpacing: "0.04em",
          }}
        >
          Timeline
        </span>
        {nodes.length > 0 && (
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 10,
              color: "rgba(161,161,170,0.4)",
            }}
          >
            · click a marker to select node
          </span>
        )}
      </div>

      {/* Track */}
      <div style={{ position: "relative", height: 36, flex: 1 }}>
        {allZero && maxTime <= 60 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Geist Mono', monospace",
              fontSize: 10,
              color: "rgba(161,161,170,0.5)",
            }}
          >
            Timeline unavailable — no timestamp data
          </div>
        ) : (
          nodes.map((n) => {
            const d = n.data as any;
            const startSec = timeToSec(d.timeStart ?? "0:00");
            const endSec = timeToSec(d.timeEnd ?? d.timeStart ?? "0:00");
            const left = maxTime > 0 ? (startSec / maxTime) * 100 : 0;
            const width = maxTime > 0
              ? Math.max(((endSec - startSec) / maxTime) * 100, 1.2)
              : 1.2;
            const color = NODE_TYPE_COLORS[d.node_type] ?? "#71717A";
            const mins = Math.floor(startSec / 60);
            const secs = String(Math.round(startSec % 60)).padStart(2, "0");
            return (
              <div
                key={n.id}
                title={`${d.summary ?? d.label ?? n.id} · ${mins}:${secs}`}
                style={{
                  position: "absolute",
                  left: `${left}%`,
                  top: 4,
                  width: `${width}%`,
                  height: 28,
                  borderRadius: 3,
                  background: color,
                  opacity: 0.7,
                  cursor: "pointer",
                }}
              />
            );
          })
        )}

        {/* Viewport scrubber */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "20%",
            width: "30%",
            minWidth: 40,
            height: "100%",
            background: "rgba(167,139,250,0.15)",
            border: "1px solid rgba(167,139,250,0.4)",
            borderRadius: 4,
            cursor: "grab",
          }}
        />
      </div>
    </div>
  );
}
