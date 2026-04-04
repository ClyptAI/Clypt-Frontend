import type { Node } from "@xyflow/react";

const NODE_TYPE_COLORS: Record<string, string> = {
  claim: "#A78BFA", explanation: "#60A5FA", example: "#2DD4BF", anecdote: "#FBB249",
  reaction_beat: "#FB7185", qa_exchange: "#4ADE80", challenge_exchange: "#FB923C",
  setup_payoff: "#E879F9", reveal: "#FACC15", transition: "#71717A",
};

// Mock: signal tags per node
const SIGNAL_TAGS: Record<string, ("trend" | "comment" | "retention")[]> = {
  "001": ["trend"],
  "003": ["comment"],
  "007": ["trend", "retention"],
  "008": ["comment", "retention"],
  "009": ["trend"],
};

// Convert "M:SS" to seconds
function timeToSec(t: string): number {
  const parts = t.split(":").map(Number);
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
}

const TOTAL_DURATION = 345; // 5:45

interface TimelineStripProps {
  nodes: Node[];
}

export default function TimelineStrip({ nodes }: TimelineStripProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 48,
        zIndex: 20,
        background: "var(--color-surface-1)",
        borderTop: "1px solid var(--color-border)",
        overflow: "hidden",
      }}
    >
      {/* Node type ticks — top half */}
      <div style={{ position: "relative", height: 24 }}>
        {nodes.map((n) => {
          const d = n.data as any;
          const sec = timeToSec(d.timeStart);
          const pct = (sec / TOTAL_DURATION) * 100;
          const color = NODE_TYPE_COLORS[d.node_type] ?? "#71717A";
          return (
            <div
              key={n.id}
              title={d.summary}
              style={{
                position: "absolute",
                left: `${pct}%`,
                top: 7,
                width: 2,
                height: 10,
                borderRadius: 1,
                background: color,
              }}
            />
          );
        })}
      </div>

      {/* Signal tag ticks — bottom half */}
      <div style={{ position: "relative", height: 24 }}>
        {nodes.map((n) => {
          const d = n.data as any;
          const tags = SIGNAL_TAGS[n.id];
          if (!tags) return null;
          const sec = timeToSec(d.timeStart);
          const pct = (sec / TOTAL_DURATION) * 100;
          const SIGNAL_COLORS = { trend: "#FB923C", comment: "#60A5FA", retention: "#4ADE80" };
          return tags.map((tag, i) => (
            <div
              key={`${n.id}-${tag}`}
              style={{
                position: "absolute",
                left: `${pct}%`,
                top: 2 + i * 7,
                width: 2,
                height: 6,
                borderRadius: 1,
                background: SIGNAL_COLORS[tag],
              }}
            />
          ));
        })}
      </div>

      {/* Viewport scrubber */}
      <div
        style={{
          position: "absolute",
          top: 4,
          left: "20%",
          width: "30%",
          minWidth: 40,
          height: 40,
          background: "rgba(167,139,250,0.15)",
          border: "1px solid rgba(167,139,250,0.4)",
          borderRadius: 4,
          cursor: "grab",
        }}
      />
    </div>
  );
}
