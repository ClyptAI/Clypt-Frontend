import { motion, useInView } from "framer-motion";
import { useMemo, useRef } from "react";
import DemoCardShell from "./DemoCardShell";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const speakers = [
  { letter: "A", name: "Alex", color: "#A78BFA", bg: "rgba(167,139,250,0.3)", barColor: "rgba(167,139,250,0.5)" },
  { letter: "B", name: "Jordan", color: "#FBB249", bg: "rgba(251,178,73,0.2)", barColor: "rgba(251,178,73,0.45)" },
  { letter: "C", name: "Sam", color: "#60A5FA", bg: "rgba(96,165,250,0.2)", barColor: "rgba(96,165,250,0.45)" },
];

const timestamps = ["0:00", "0:10", "0:20", "0:30", "0:40", "0:50", "1:00"];

function makeBars(seed: number) {
  return Array.from({ length: 80 }, (_, i) => {
    const envelope = Math.abs(Math.sin((i + seed * 30) * 0.12));
    const silent = (i + seed * 7) % 11 === 0 || (i + seed * 3) % 13 === 0;
    return silent ? 2 : 4 + envelope * 24;
  });
}

export default function LandingTimelineDemo() {
  const barData = useMemo(() => speakers.map((_, i) => makeBars(i)), []);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref}>
      <DemoCardShell label="timeline_foundation · 00:00:00">
        {/* Timestamp ruler */}
        <div
          style={{
            height: 24,
            display: "flex",
            alignItems: "flex-end",
            padding: "0 72px 0 72px",
            background: "rgba(255,255,255,0.02)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            position: "relative",
          }}
        >
          {timestamps.map((t, i) => (
            <div
              key={t}
              style={{
                position: "absolute",
                left: `${72 + ((i / (timestamps.length - 1)) * (100 - 18)) / 100 * (100)}%`,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transform: "translateX(-50%)",
              }}
            >
              <div style={{ width: 1, height: 4, background: "rgba(255,255,255,0.15)", marginBottom: 2 }} />
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{t}</span>
            </div>
          ))}
        </div>

        {/* Speaker lanes */}
        <div style={{ position: "relative" }}>
          {speakers.map((s, si) => (
            <div key={s.letter} style={{ display: "flex", height: 52, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {/* Lane header */}
              <div
                style={{
                  width: 72,
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.03)",
                  borderRight: "1px solid rgba(255,255,255,0.07)",
                  gap: 2,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: s.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: 11,
                    color: s.color,
                  }}
                >
                  {s.letter}
                </div>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{s.name}</span>
              </div>
              {/* Waveform */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "0 8px",
                  background: "rgba(255,255,255,0.01)",
                  position: "relative",
                }}
              >
                {barData[si].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0 }}
                    animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: si * 0.1 + i * 0.007,
                      ease,
                    }}
                    style={{
                      width: 2,
                      height: h,
                      borderRadius: 9999,
                      background: s.barColor,
                      opacity: h <= 2 ? 0.15 : 1,
                      flexShrink: 0,
                      transformOrigin: "bottom center",
                      animation: isInView ? `waveRipple 4s ease-in-out ${-(i * 0.05)}s infinite` : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Clip bracket markers */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 72,
              right: 0,
              bottom: 0,
              pointerEvents: "none",
            }}
          >
            {/* Marker 1 on Speaker A lane */}
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: "23%" } : { width: 0 }}
              transition={{ duration: 0.4, delay: 0.6, ease }}
              style={{
                position: "absolute",
                top: 0,
                height: 52,
                left: "15%",
                background: "rgba(167,139,250,0.12)",
                borderLeft: "2px solid rgba(167,139,250,0.6)",
                borderRight: "2px solid rgba(167,139,250,0.6)",
              }}
            />
            {/* Marker 2 on Speaker B lane */}
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: "23%" } : { width: 0 }}
              transition={{ duration: 0.4, delay: 0.75, ease }}
              style={{
                position: "absolute",
                top: 52,
                height: 52,
                left: "42%",
                background: "rgba(251,178,73,0.1)",
                borderLeft: "2px solid rgba(251,178,73,0.5)",
                borderRight: "2px solid rgba(251,178,73,0.5)",
              }}
            />
          </div>

          {/* Animated playhead */}
          <motion.div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 1,
              background: "#A78BFA",
              opacity: 0.8,
              left: 72,
              zIndex: 5,
            }}
            animate={{ x: ["5%", "75%"] }}
            transition={{ duration: 8, repeat: Infinity, repeatType: "loop", ease: "linear" }}
          >
            <div
              style={{
                position: "absolute",
                top: -4,
                left: -3,
                width: 0,
                height: 0,
                borderLeft: "3px solid transparent",
                borderRight: "3px solid transparent",
                borderTop: "5px solid #A78BFA",
              }}
            />
          </motion.div>
        </div>

        {/* Bracket labels in ruler */}
        <div
          style={{
            display: "flex",
            gap: 16,
            padding: "6px 12px 6px 80px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, color: "#A78BFA" }}>claim · 0:09–0:23</span>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, color: "#FBB249" }}>anecdote · 0:25–0:39</span>
        </div>
      </DemoCardShell>
    </div>
  );
}
