import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import DemoCardShell from "./DemoCardShell";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function LandingClipDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [scanDone, setScanDone] = useState(false);

  return (
    <div ref={ref}>
      <DemoCardShell label="clip_renderer · render complete">
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            minHeight: 400,
          }}
        >
          {/* Floating metadata chips */}
          {/* Chip A — above */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 1.1, ease }}
            style={{
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
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
            CLAIM · node_042
          </motion.div>

          {/* Chip B — left */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 1.18, ease }}
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
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
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Alex</span>
          </motion.div>

          {/* Chip C — right */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 1.26, ease }}
            style={{
              position: "absolute",
              right: 16,
              top: "30%",
              fontFamily: "'Geist Mono', monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            14s · 1080p
          </motion.div>

          {/* Chip D — below-right */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 1.34, ease }}
            style={{
              position: "absolute",
              bottom: 16,
              right: 24,
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontFamily: "'Geist Mono', monospace",
              fontSize: 10,
              color: "#FDBA74",
              background: "rgba(251,146,60,0.1)",
              border: "1px solid rgba(251,146,60,0.3)",
              borderRadius: 4,
              padding: "4px 10px",
            }}
          >
            ↗ trend signal
          </motion.div>

          {/* 9:16 clip card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0, ease }}
            style={{
              width: 180,
              aspectRatio: "9/16",
              borderRadius: 12,
              overflow: "hidden",
              border: "1.5px solid rgba(167,139,250,0.5)",
              background: "linear-gradient(170deg, #1a0f28 0%, #0d0a1a 40%, #0a0a12 100%)",
              boxShadow: "0 0 40px rgba(167,139,250,0.12), 0 24px 48px rgba(0,0,0,0.6)",
              position: "relative",
            }}
          >
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
              animate={isInView && scanDone ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 0, ease }}
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

            {/* Waveform hint */}
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
              {[60, 80, 50].map((w, i) => (
                <div
                  key={i}
                  style={{
                    width: `${w}%`,
                    height: i === 1 ? 4 : 2,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 2,
                    maxWidth: 100,
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
                bottom: 68,
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
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.6)" }}>Alex</span>
            </div>

            {/* Type chip */}
            <div
              style={{
                position: "absolute",
                left: 10,
                bottom: 50,
                fontFamily: "'Geist Mono', monospace",
                fontSize: 9,
                background: "rgba(167,139,250,0.2)",
                border: "1px solid rgba(167,139,250,0.4)",
                color: "#C4B5FD",
                padding: "2px 6px",
                borderRadius: 3,
              }}
            >
              claim
            </div>

            {/* Title */}
            <div
              style={{
                position: "absolute",
                left: 10,
                right: 10,
                bottom: 24,
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
                bottom: 8,
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
        </div>
      </DemoCardShell>
    </div>
  );
}
