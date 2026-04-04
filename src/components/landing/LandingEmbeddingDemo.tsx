import { motion } from "framer-motion";
import DemoCardShell from "./DemoCardShell";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const TYPE_FILLS: Record<string, string> = {
  claim: "rgba(167,139,250,0.85)",
  explanation: "rgba(96,165,250,0.85)",
  anecdote: "rgba(251,178,73,0.85)",
  setup_payoff: "rgba(251,146,60,0.85)",
  reaction_beat: "rgba(74,222,128,0.85)",
  qa_exchange: "rgba(56,189,248,0.85)",
};

const SIGNAL_META: Record<string, { fill: string; ring: string }> = {
  trend: { fill: "rgba(251,146,60,0.95)", ring: "rgba(251,146,60,0.6)" },
  comment: { fill: "rgba(96,165,250,0.95)", ring: "rgba(96,165,250,0.6)" },
  retention: { fill: "rgba(74,222,128,0.95)", ring: "rgba(74,222,128,0.6)" },
};

const dots = [
  { id: 1, x: 90, y: 55, type: "claim", r: 5, signal: null },
  { id: 2, x: 125, y: 70, type: "claim", r: 5, signal: null },
  { id: 3, x: 105, y: 95, type: "explanation", r: 4, signal: null },
  { id: 4, x: 150, y: 58, type: "claim", r: 6, signal: "trend" },
  { id: 5, x: 165, y: 88, type: "explanation", r: 4, signal: null },
  { id: 6, x: 135, y: 118, type: "explanation", r: 5, signal: null },
  { id: 7, x: 175, y: 72, type: "claim", r: 4, signal: null },
  { id: 8, x: 85, y: 245, type: "anecdote", r: 5, signal: null },
  { id: 9, x: 115, y: 268, type: "setup_payoff", r: 4, signal: null },
  { id: 10, x: 148, y: 240, type: "anecdote", r: 6, signal: null },
  { id: 11, x: 95, y: 295, type: "setup_payoff", r: 5, signal: "retention" },
  { id: 12, x: 165, y: 275, type: "anecdote", r: 4, signal: null },
  { id: 13, x: 125, y: 318, type: "setup_payoff", r: 5, signal: null },
  { id: 14, x: 335, y: 175, type: "reaction_beat", r: 5, signal: null },
  { id: 15, x: 370, y: 195, type: "qa_exchange", r: 5, signal: null },
  { id: 16, x: 350, y: 225, type: "reaction_beat", r: 4, signal: null },
  { id: 17, x: 408, y: 180, type: "qa_exchange", r: 6, signal: "comment" },
  { id: 18, x: 390, y: 240, type: "reaction_beat", r: 4, signal: null },
  { id: 19, x: 420, y: 215, type: "qa_exchange", r: 5, signal: null },
  { id: 20, x: 365, y: 258, type: "reaction_beat", r: 4, signal: null },
  { id: 21, x: 290, y: 65, type: "explanation", r: 4, signal: null },
  { id: 22, x: 320, y: 82, type: "explanation", r: 5, signal: null },
  { id: 23, x: 305, y: 108, type: "explanation", r: 4, signal: null },
  { id: 24, x: 350, y: 68, type: "explanation", r: 5, signal: null },
  { id: 25, x: 378, y: 98, type: "explanation", r: 4, signal: null },
  { id: 26, x: 348, y: 130, type: "explanation", r: 5, signal: null },
  { id: 27, x: 225, y: 185, type: "claim", r: 4, signal: null },
  { id: 28, x: 258, y: 298, type: "anecdote", r: 4, signal: null },
];

const clusterLines: [number, number][] = [
  [1, 2], [1, 3], [2, 3], [2, 4], [3, 5], [3, 6], [4, 5], [5, 6], [5, 7], [4, 7],
  [8, 9], [8, 10], [9, 10], [9, 11], [10, 12], [11, 13], [12, 13],
  [14, 15], [14, 16], [15, 16], [15, 17], [16, 18], [17, 19], [18, 19], [18, 20], [19, 20],
  [21, 22], [21, 23], [22, 23], [22, 24], [23, 25], [24, 25], [24, 26], [25, 26],
];

const dotMap = Object.fromEntries(dots.map((d) => [d.id, d]));

const blobs = [
  { x: 130, y: 88, w: 180, h: 140, color: "rgba(167,139,250,0.09)" },
  { x: 125, y: 278, w: 180, h: 140, color: "rgba(251,178,73,0.09)" },
  { x: 385, y: 215, w: 200, h: 150, color: "rgba(74,222,128,0.09)" },
  { x: 335, y: 97, w: 170, h: 130, color: "rgba(96,165,250,0.09)" },
];

const signalChips = [
  { icon: "↗", color: "#FB923C", label: "trend · node_004", text: "#FDBA74", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.25)" },
  { icon: "💬", color: "#60A5FA", label: "comment · node_017", text: "#93C5FD", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.25)" },
  { icon: "📊", color: "#4ADE80", label: "retention · node_011", text: "#86EFAC", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.25)" },
];

export default function LandingEmbeddingDemo() {
  return (
    <DemoCardShell label="embedding_space · 28 nodes · 3 signals">
      <div style={{ position: "relative", overflow: "hidden" }}>
        {/* Cluster blobs */}
        {blobs.map((b, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.x - b.w / 2,
              top: b.y - b.h / 2,
              width: b.w,
              height: b.h,
              borderRadius: "50%",
              background: `radial-gradient(ellipse, ${b.color}, transparent 70%)`,
              filter: "blur(32px)",
              pointerEvents: "none",
            }}
          />
        ))}

        <svg viewBox="0 0 500 380" width="100%" height="340" style={{ display: "block", position: "relative" }}>
          {/* Proximity lines */}
          {clusterLines.map(([a, b]) => {
            const da = dotMap[a];
            const db = dotMap[b];
            return <line key={`${a}-${b}`} x1={da.x} y1={da.y} x2={db.x} y2={db.y} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />;
          })}

          {/* Dots */}
          {dots.map((d, i) => {
            const isSignal = d.signal !== null;
            const sm = d.signal ? SIGNAL_META[d.signal] : null;
            const fill = isSignal ? sm!.fill : TYPE_FILLS[d.type];
            const r = isSignal ? 9 : d.r;

            return (
              <g key={d.id}>
                {/* Pulse rings for signal dots */}
                {isSignal && sm && (
                  <>
                    <motion.circle
                      cx={d.x}
                      cy={d.y}
                      fill="none"
                      stroke={sm.ring}
                      strokeWidth={1.5}
                      initial={{ r: r, opacity: 0.55 }}
                      animate={{ r: r + 18, opacity: 0 }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.circle
                      cx={d.x}
                      cy={d.y}
                      fill="none"
                      stroke={sm.ring}
                      strokeWidth={1.5}
                      initial={{ r: r, opacity: 0.55 }}
                      animate={{ r: r + 18, opacity: 0 }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 1.1 }}
                    />
                  </>
                )}
                <motion.circle
                  cx={d.x}
                  cy={d.y}
                  r={r}
                  fill={fill}
                  opacity={isSignal ? 1 : 0.75}
                  initial={{ scale: 0.2, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: isSignal ? 1 : 0.75 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.4, delay: i * 0.04, ease }}
                  style={{ transformOrigin: `${d.x}px ${d.y}px` }}
                />
              </g>
            );
          })}
        </svg>

        {/* Bottom signal bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 40,
            background: "rgba(10,9,9,0.7)",
            backdropFilter: "blur(8px)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          {signalChips.map((c) => (
            <span
              key={c.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10,
                color: c.text,
                background: c.bg,
                border: `1px solid ${c.border}`,
                padding: "4px 10px",
                borderRadius: 4,
              }}
            >
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </DemoCardShell>
  );
}
