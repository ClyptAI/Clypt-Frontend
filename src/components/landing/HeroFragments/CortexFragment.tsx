import { motion } from "framer-motion";

/**
 * Mini Cortex Map fragment — 4 real ClyptNodes laid on a dot grid with curved edges.
 * Styling mirrors src/components/graph/ClyptNode.tsx and SemanticNode exactly.
 */

type NodeT = {
  id: string;
  x: number;
  y: number;
  type: "claim" | "anecdote" | "setup_payoff" | "insight";
  label: string;
  signals?: string[];
};

const NODE_W = 150;
const NODE_H = 60;
const W = 440;
const H = 320;

const NODES: NodeT[] = [
  { id: "1", x: 22,  y: 38,  type: "claim",         label: "Fear grizzlies by default", signals: ["trend"] },
  { id: "2", x: 252, y: 32,  type: "anecdote",      label: "The ice-raft polar bear story", signals: ["comment"] },
  { id: "3", x: 22,  y: 188, type: "setup_payoff",  label: "Fresh bear sign by the elk", signals: ["retention"] },
  { id: "4", x: 252, y: 188, type: "insight",       label: "The polar bear smells meat" },
];

const EDGES: Array<[string, string, boolean?]> = [
  ["1", "2"],
  ["1", "3"],
  ["2", "4"],
  ["3", "4", true], // dashed callback
];

const COLORS: Record<string, { c: string; pillBg: string; pillText: string }> = {
  claim:        { c: "#A78BFA", pillBg: "rgba(167,139,250,0.15)", pillText: "#C4B5FD" },
  anecdote:     { c: "#FBB249", pillBg: "rgba(251,178,73,0.15)",  pillText: "#FCD34D" },
  setup_payoff: { c: "#FB923C", pillBg: "rgba(251,146,60,0.15)",  pillText: "#FDBA74" },
  insight:      { c: "#A78BFA", pillBg: "rgba(167,139,250,0.15)", pillText: "#C4B5FD" },
};

const SIGNAL_COLORS: Record<string, string> = {
  trend: "#FB923C",
  comment: "#60A5FA",
  retention: "#4ADE80",
};

function hexToRgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function curve(ax: number, ay: number, bx: number, by: number) {
  const mx = (ax + bx) / 2;
  return `M ${ax} ${ay} C ${mx} ${ay}, ${mx} ${by}, ${bx} ${by}`;
}

export default function CortexFragment() {
  const byId = (id: string) => NODES.find((n) => n.id === id)!;

  return (
    <div
      style={{
        width: W,
        height: H,
        borderRadius: 14,
        background:
          "linear-gradient(160deg, rgba(20,16,28,0.95) 0%, rgba(10,9,9,0.95) 100%)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow:
          "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(167,139,250,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* DemoCardShell-style header */}
      <div
        style={{
          height: 30,
          padding: "0 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 11,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.1em",
              fontWeight: 600,
            }}
          >
            CORTEX_GRAPH
          </span>
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.65)",
              letterSpacing: "0.08em",
            }}
          >
            · 4 nodes · 4 edges
          </span>
        </div>
        <div />
      </div>

      {/* Graph canvas */}
      <div
        style={{
          flex: 1,
          position: "relative",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {/* Edges (SVG layer behind nodes) */}
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H - 28 - 32}`} style={{ position: "absolute", inset: 0 }}>
          {EDGES.map(([a, b, dashed], i) => {
            const A = byId(a);
            const B = byId(b);
            const ax = A.x + NODE_W;
            const ay = A.y + NODE_H / 2;
            const bx = B.x;
            const by = B.y + NODE_H / 2;
            return (
              <motion.path
                key={i}
                d={curve(ax, ay, bx, by)}
                fill="none"
                stroke={dashed ? "rgba(167,139,250,0.55)" : "rgba(255,255,255,0.22)"}
                strokeWidth={1.2}
                strokeDasharray={dashed ? "4 4" : undefined}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.45 + i * 0.08, ease: [0.23, 1, 0.32, 1] }}
              />
            );
          })}
        </svg>

        {/* Nodes — replicates ClyptNode visual exactly */}
        {NODES.map((n, i) => {
          const c = COLORS[n.type];
          const nodeBg = `linear-gradient(135deg, ${hexToRgba(c.c, 0.18)}, ${hexToRgba(c.c, 0.06)} 60%), rgba(10,9,9,0.45)`;
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.2 + i * 0.07, ease: [0.23, 1, 0.32, 1] }}
              style={{
                position: "absolute",
                left: n.x,
                top: n.y,
                width: NODE_W,
                borderRadius: 8,
                padding: "8px 10px",
                background: nodeBg,
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                border: `1.5px solid ${c.c}A8`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 8,
                    letterSpacing: "0.05em",
                    background: c.pillBg,
                    border: `1px solid ${c.c}66`,
                    borderRadius: 3,
                    padding: "1px 5px",
                    color: c.pillText,
                  }}
                >
                  {n.type}
                </span>
                {n.signals && n.signals.length > 0 && (
                  <div style={{ display: "flex" }}>
                    {n.signals.map((sig, si) => (
                      <div
                        key={sig}
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          background: SIGNAL_COLORS[sig] ?? "#A78BFA",
                          marginLeft: si > 0 ? -2 : 0,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 10.5,
                  color: "rgba(255,255,255,0.88)",
                  fontWeight: 500,
                  lineHeight: 1.3,
                  marginTop: 4,
                }}
              >
                {n.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend strip — mirrors LandingGraphDemo */}
      <div
        style={{
          height: 32,
          background: "rgba(10,9,9,0.7)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {(["claim", "anecdote", "setup_payoff", "insight"] as const).map((t) => {
          const c = COLORS[t];
          return (
            <span
              key={t}
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 8.5,
                letterSpacing: "0.05em",
                background: c.pillBg,
                borderRadius: 3,
                padding: "2px 6px",
                color: c.pillText,
              }}
            >
              {t}
            </span>
          );
        })}
      </div>
    </div>
  );
}
