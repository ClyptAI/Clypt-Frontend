import { motion } from "framer-motion";
import { Search } from "lucide-react";
import AppFrameMock from "./AppFrameMock";

/**
 * Faithful preview of the RunSearch page — RunContextBar, full-bleed scatter,
 * centered search bar (top), embed-type pill + zoom controls (top right),
 * legend (bottom left), node count (bottom right), results panel (bottom).
 */

const NODE_COLORS: Record<string, string> = {
  claim: "#A78BFA",
  explanation: "#60A5FA",
  anecdote: "#FBB249",
  reaction_beat: "#4ADE80",
  qa_exchange: "#38BDF8",
  challenge_exchange: "#FB923C",
  setup_payoff: "#FB923C",
  reveal: "#FACC15",
  insight: "#A78BFA",
};

type Point = { x: number; y: number; type: string; r: number; highlight?: boolean };
const POINTS: Point[] = [
  // Cluster 1 (claims, upper-left, shifted right)
  { x: 28, y: 24, type: "claim", r: 5 },
  { x: 32, y: 30, type: "claim", r: 4 },
  { x: 24, y: 32, type: "claim", r: 5 },
  { x: 36, y: 24, type: "claim", r: 4 },
  { x: 29, y: 38, type: "explanation", r: 4 },
  { x: 38, y: 34, type: "explanation", r: 4 },
  // Cluster 2 (anecdotes, lower-left, shifted right)
  { x: 26, y: 60, type: "anecdote", r: 5 },
  { x: 32, y: 64, type: "anecdote", r: 5, highlight: true },
  { x: 22, y: 66, type: "anecdote", r: 4 },
  { x: 36, y: 68, type: "setup_payoff", r: 5 },
  { x: 29, y: 72, type: "setup_payoff", r: 4 },
  { x: 40, y: 60, type: "anecdote", r: 4 },
  // Cluster 3 (polar-bear debate, top-right)
  { x: 70, y: 28, type: "reaction_beat", r: 5 },
  { x: 76, y: 24, type: "challenge_exchange", r: 5, highlight: true },
  { x: 82, y: 32, type: "challenge_exchange", r: 4 },
  { x: 72, y: 38, type: "reaction_beat", r: 4 },
  { x: 80, y: 40, type: "reaction_beat", r: 4 },
  // Cluster 4 (explanations, middle-right)
  { x: 60, y: 50, type: "explanation", r: 4 },
  { x: 68, y: 52, type: "explanation", r: 5, highlight: true },
  { x: 64, y: 58, type: "explanation", r: 4 },
  { x: 72, y: 62, type: "explanation", r: 4 },
  // Cluster 5 (bottom-right reveal)
  { x: 70, y: 72, type: "reveal", r: 5 },
  { x: 76, y: 74, type: "reveal", r: 4 },
  { x: 64, y: 70, type: "reveal", r: 4 },
];

const BLOBS = [
  { x: 30, y: 30, w: 30, h: 24, color: "rgba(167,139,250,0.10)" },
  { x: 30, y: 66, w: 30, h: 22, color: "rgba(251,178,73,0.10)" },
  { x: 76, y: 32, w: 28, h: 24, color: "rgba(74,222,128,0.10)" },
  { x: 67, y: 56, w: 28, h: 20, color: "rgba(96,165,250,0.10)" },
  { x: 70, y: 72, w: 26, h: 18, color: "rgba(250,204,21,0.10)" },
];

const RESULTS = [
  { type: "challenge_exchange", score: 0.91, summary: "The guest tries to call the polar bear curious instead of predatory" },
  { type: "reveal", score: 0.88, summary: "The famous turn: Joe says the polar bear smells meat, full stop" },
  { type: "anecdote", score: 0.83, summary: "Ice-raft survival story where the polar bear keeps closing the distance" },
  { type: "explanation", score: 0.79, summary: "Polar bears are uniquely predatory because they don't have non-meat options" },
];

const PANEL_H = 116;

export default function LandingSearchPreview() {
  return (
    <AppFrameMock windowLabel="Joe Rogan × Flagrant — Search" height={580}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0A0909" }}>
        {/* RunContextBar */}
        <div
          style={{
            height: 40,
            flexShrink: 0,
            background: "rgba(255,255,255,0.02)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 18px",
          }}
        >
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 12.5, color: "rgba(255,255,255,0.92)" }}>
            joeroganflagrant.mp4
          </span>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "#67E8F9", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Phase 4 of 6 — Running
          </span>
        </div>

        {/* Scatter viewport */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {/* Cluster blobs (background glow) */}
          {BLOBS.map((b, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${b.x - b.w / 2}%`,
                top: `${b.y - b.h / 2}%`,
                width: `${b.w}%`,
                height: `${b.h}%`,
                borderRadius: "50%",
                background: `radial-gradient(ellipse, ${b.color}, transparent 70%)`,
                filter: "blur(24px)",
              }}
            />
          ))}

          {/* Scatter points — use absolutely-positioned divs so circles stay
              perfectly round at any container aspect ratio (an SVG viewBox
              with preserveAspectRatio="none" stretches them into ovals). */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              height: `calc(100% - ${PANEL_H}px)`,
              pointerEvents: "none",
            }}
          >
            {POINTS.map((p, i) => {
              const c = NODE_COLORS[p.type] ?? "#A78BFA";
              const opacity = p.highlight ? 1 : 0.7;
              const dot = p.r * 2; // px diameter
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: dot,
                    height: dot,
                    marginLeft: -dot / 2,
                    marginTop: -dot / 2,
                    borderRadius: "50%",
                    background: c,
                    opacity,
                    boxShadow: p.highlight ? `0 0 0 2px ${c}33, 0 0 12px ${c}55` : undefined,
                  }}
                >
                  {p.highlight && (
                    <>
                      {/* Two staggered rings — while one fades out the other
                          fades in, hiding the keyframe-loop reset. */}
                      {[0, 0.9].map((delay, idx) => (
                        <motion.div
                          key={idx}
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            width: dot,
                            height: dot,
                            marginLeft: -dot / 2,
                            marginTop: -dot / 2,
                            borderRadius: "50%",
                            border: `1px solid ${c}`,
                            pointerEvents: "none",
                            willChange: "transform, opacity",
                          }}
                          initial={{ scale: 1, opacity: 0 }}
                          animate={{
                            scale: [1, 2.8],
                            opacity: [0, 0.7, 0],
                          }}
                          transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            ease: "easeOut",
                            delay,
                            times: [0, 0.15, 1],
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Search bar — centered top */}
          <div
            style={{
              position: "absolute",
              top: 18,
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(540px, calc(100% - 220px))",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              background: "rgba(18,16,16,0.92)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(167,139,250,0.4)",
              borderRadius: 12,
              boxShadow: "0 0 0 1px rgba(167,139,250,0.15), 0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <Search size={15} color="rgba(167,139,250,0.85)" />
            <span
              style={{
                flex: 1,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 13,
                color: "rgba(255,255,255,0.9)",
              }}
            >
              polar bear
            </span>
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 9.5,
                color: "rgba(255,255,255,0.4)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "2px 5px",
                borderRadius: 4,
              }}
            >
              ⌘K
            </span>
          </div>

          {/* Zoom controls — top right (toggle moved above results panel) */}
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 14,
              display: "flex",
              gap: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                background: "rgba(18,16,16,0.92)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 8,
                padding: 3,
                gap: 1,
              }}
            >
              {["+", "−", "⊡"].map((s) => (
                <span
                  key={s}
                  style={{
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.55)",
                    borderRadius: 5,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Semantic / multimodal toggle — centered just above the results panel */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: PANEL_H + 12,
              display: "flex",
              background: "rgba(18,16,16,0.92)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 8,
              padding: 3,
              gap: 2,
              zIndex: 2,
            }}
          >
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10,
                padding: "4px 11px",
                borderRadius: 5,
                background: "rgba(167,139,250,0.18)",
                color: "#A78BFA",
              }}
            >
              semantic
            </span>
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10,
                padding: "4px 11px",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              multimodal
            </span>
          </div>

          {/* Legend — bottom left, above panel */}
          <div
            style={{
              position: "absolute",
              bottom: PANEL_H + 14,
              left: 14,
              padding: "8px 12px",
              background: "rgba(10,9,9,0.85)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8,
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
          >
            {[
              { type: "challenge_exchange", color: "#FB923C" },
              { type: "reveal", color: "#FACC15" },
              { type: "anecdote", color: "#FBB249" },
              { type: "explanation", color: "#60A5FA" },
              { type: "qa_exchange", color: "#38BDF8" },
              { type: "reaction_beat", color: "#4ADE80" },
            ].map((l) => (
              <div key={l.type} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                  {l.type}
                </span>
              </div>
            ))}
          </div>

          {/* Node count — bottom right */}
          <div
            style={{
              position: "absolute",
              bottom: PANEL_H + 16,
              right: 14,
              fontFamily: "'Geist Mono', monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
            }}
          >
            28 nodes · 17 candidates
          </div>

          {/* Search results panel — bottom slide-up */}
          <motion.div
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: PANEL_H,
              background: "rgba(14,12,18,0.95)",
              backdropFilter: "blur(14px)",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              padding: "10px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 7,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                4 results for "polar bear"
              </span>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9.5, color: "rgba(255,255,255,0.4)" }}>
                ESC to clear
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, overflow: "hidden" }}>
              {RESULTS.map((r, i) => {
                const c = NODE_COLORS[r.type] ?? "#A78BFA";
                return (
                  <div
                    key={i}
                    style={{
                      flex: "1 1 0",
                      minWidth: 0,
                      padding: "8px 10px",
                      background: "rgba(255,255,255,0.03)",
                      border: i === 0 ? `1px solid ${c}66` : "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 6,
                      display: "flex",
                      flexDirection: "column",
                      gap: 5,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span
                        style={{
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: 8,
                          padding: "1px 5px",
                          borderRadius: 3,
                          background: `${c}22`,
                          color: c,
                        }}
                      >
                        {r.type}
                      </span>
                      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                        {(r.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 10.5,
                        color: "rgba(255,255,255,0.72)",
                        lineHeight: 1.35,
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {r.summary}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </AppFrameMock>
  );
}
