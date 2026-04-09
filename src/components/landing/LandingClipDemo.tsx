import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp } from "lucide-react";
import DemoCardShell from "./DemoCardShell";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function LandingClipDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [scanDone, setScanDone] = useState(false);
  const [entranceDone, setEntranceDone] = useState(false);

  return (
    <div ref={ref}>
      <DemoCardShell label="clip_renderer · render complete">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
            padding: "40px 32px",
            minHeight: 420,
          }}
        >
          {/* Left metadata column */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 1.1, ease }}
            style={{
              width: 140,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 14,
            }}
          >
            {/* Chip 1 — clip composition (multiple nodes → one clip) */}
            <div
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10,
                color: "#C4B5FD",
                background: "rgba(167,139,250,0.1)",
                border: "1px solid rgba(167,139,250,0.3)",
                borderRadius: 6,
                padding: "5px 10px",
                whiteSpace: "nowrap",
              }}
            >
              CLIP · 3 nodes
            </div>

            {/* Chip 2 — speaker */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "rgba(167,139,250,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: 10,
                  color: "#A78BFA",
                }}
              >
                A
              </div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                Alex
              </span>
            </div>
          </motion.div>

          {/* Center — 9:16 clip card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0, ease }}
            onAnimationComplete={() => {
              if (isInView && !entranceDone) setEntranceDone(true);
            }}
            style={{
              width: 180,
              aspectRatio: "9/16",
              borderRadius: 12,
              overflow: "hidden",
              border: "1.5px solid rgba(167,139,250,0.5)",
              background: "linear-gradient(170deg, #1a0f28 0%, #0d0a1a 40%, #0a0a12 100%)",
              position: "relative",
              flexShrink: 0,
            }}
          >
            {/* Animated box-shadow glow wrapper */}
            <motion.div
              style={{
                position: "absolute",
                inset: -2,
                borderRadius: 14,
                pointerEvents: "none",
                zIndex: -1,
              }}
              animate={
                entranceDone
                  ? {
                      boxShadow: [
                        "0 0 40px rgba(167,139,250,0.12), 0 24px 48px rgba(0,0,0,0.6)",
                        "0 0 64px rgba(167,139,250,0.28), 0 24px 48px rgba(0,0,0,0.6)",
                        "0 0 40px rgba(167,139,250,0.12), 0 24px 48px rgba(0,0,0,0.6)",
                      ],
                    }
                  : {}
              }
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, delay: 1.5 }}
            />

            {/* Accent strip */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#A78BFA" }} />

            {/* Timestamp */}
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                fontFamily: "'Geist Mono', monospace",
                fontSize: 9,
                color: "rgba(255,255,255,0.5)",
                background: "rgba(0,0,0,0.5)",
                padding: "2px 5px",
                borderRadius: 3,
              }}
            >
              0:09–0:23
            </div>

            {/* RENDER READY badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={
                isInView && scanDone
                  ? {
                      opacity: 1,
                      scale: 1,
                      background: [
                        "rgba(74,222,128,0.10)",
                        "rgba(74,222,128,0.20)",
                        "rgba(74,222,128,0.10)",
                      ],
                      boxShadow: [
                        "0 0 0px rgba(74,222,128,0)",
                        "0 0 8px rgba(74,222,128,0.3)",
                        "0 0 0px rgba(74,222,128,0)",
                      ],
                    }
                  : {}
              }
              transition={{
                opacity: { duration: 0.3, delay: 0 },
                scale: { duration: 0.3, delay: 0 },
                background: { duration: 2.5, ease: "easeInOut", repeat: Infinity, delay: 1.3 },
                boxShadow: { duration: 2.5, ease: "easeInOut", repeat: Infinity, delay: 1.3 },
              }}
              style={{
                position: "absolute",
                top: 12,
                left: 10,
                fontFamily: "'Geist Mono', monospace",
                fontSize: 8,
                color: "#4ADE80",
                background: "rgba(74,222,128,0.1)",
                border: "1px solid rgba(74,222,128,0.4)",
                borderRadius: 3,
                padding: "2px 6px",
              }}
            >
              ✓ RENDER READY
            </motion.div>

            {/* Waveform hint — breathing bars */}
            <div
              style={{
                position: "absolute",
                top: "45%",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              {[
                { w: 60, h: 2, opRange: [0.10, 0.25], dur: 2.2, delay: 0 },
                { w: 80, h: 4, opRange: [0.08, 0.20], dur: 3.0, delay: 0.7 },
                { w: 50, h: 2, opRange: [0.10, 0.22], dur: 2.6, delay: 1.4 },
              ].map((bar, i) => (
                <motion.div
                  key={i}
                  animate={
                    entranceDone
                      ? { opacity: [bar.opRange[0], bar.opRange[1], bar.opRange[0]] }
                      : { opacity: 0.1 }
                  }
                  transition={
                    entranceDone
                      ? { duration: bar.dur, ease: "easeInOut", repeat: Infinity, delay: bar.delay }
                      : {}
                  }
                  style={{
                    width: `${bar.w}%`,
                    height: bar.h,
                    background: "rgba(255,255,255,1)",
                    borderRadius: 2,
                    maxWidth: 100,
                    opacity: 0.1,
                  }}
                />
              ))}
            </div>

            {/* Bottom gradient */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "65%",
                background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Speaker chip */}
            <div
              style={{
                position: "absolute",
                left: 10,
                bottom: 92,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "rgba(167,139,250,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: 7,
                  color: "#A78BFA",
                }}
              >
                A
              </div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
                Alex
              </span>
            </div>

            {/* Node chips — the semantic nodes that compose this clip */}
            <div
              style={{
                position: "absolute",
                left: 10,
                right: 10,
                bottom: 68,
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 4,
              }}
            >
              {[
                { label: "claim", color: "#A78BFA" },
                { label: "explain", color: "#7DD3FC" },
                { label: "example", color: "#4ADE80" },
              ].map((n, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 8,
                    color: "rgba(255,255,255,0.75)",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    padding: "2px 5px",
                    borderRadius: 3,
                  }}
                >
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: n.color,
                    }}
                  />
                  {n.label}
                </div>
              ))}
            </div>

            {/* Title */}
            <div
              style={{
                position: "absolute",
                left: 10,
                right: 10,
                bottom: 34,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 11,
                color: "rgba(255,255,255,0.9)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.3,
              }}
            >
              The market rewards simplicity
            </div>

            {/* Duration */}
            <div
              style={{
                position: "absolute",
                right: 10,
                bottom: 12,
                fontFamily: "'Geist Mono', monospace",
                fontSize: 9,
                color: "rgba(255,255,255,0.35)",
              }}
            >
              14s
            </div>

            {/* Scan line */}
            {isInView && !scanDone && (
              <motion.div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: 2,
                  background: "rgba(167,139,250,0.7)",
                }}
                initial={{ top: "0%" }}
                animate={{ top: "100%", opacity: [0.8, 0.8, 0] }}
                transition={{ duration: 0.55, delay: 0.5, ease: "linear" }}
                onAnimationComplete={() => setScanDone(true)}
              />
            )}
          </motion.div>

          {/* Right metadata column */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 1.15, ease }}
            style={{
              width: 140,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 14,
            }}
          >
            {/* Chip 3 — duration */}
            <div
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              14s · 1080p
            </div>

            {/* Chip 4 — trend badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10,
                color: "#FDBA74",
                background: "rgba(251,146,60,0.08)",
                border: "1px solid rgba(251,146,60,0.25)",
                borderRadius: 4,
                padding: "4px 10px",
              }}
            >
              <TrendingUp size={12} color="#FB923C" />
              trend signal
            </div>
          </motion.div>
        </div>
      </DemoCardShell>
    </div>
  );
}
