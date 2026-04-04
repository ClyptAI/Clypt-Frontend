import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import DemoCardShell from "./DemoCardShell";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

function Row({ delay, children, inView }: { delay: number; children: React.ReactNode; inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: delay + 0.3, ease }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingNodeDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref}>
      <DemoCardShell label="node_extractor · 1 node selected">
        {/* Scan sweep */}
        {isInView && (
          <motion.div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 1,
              background: "rgba(167,139,250,0.5)",
              zIndex: 10,
              pointerEvents: "none",
            }}
            initial={{ top: 0, opacity: 0.7 }}
            animate={{ top: "100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "linear" }}
          />
        )}

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
          {/* Row 1: Type + ID */}
          <Row delay={0} inView={isInView}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <motion.span
                animate={
                  isInView
                    ? {
                        background: [
                          "rgba(167,139,250,0.15)",
                          "rgba(167,139,250,0.28)",
                          "rgba(167,139,250,0.15)",
                        ],
                      }
                    : {}
                }
                transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity, delay: 0.6 }}
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 10,
                  background: "rgba(167,139,250,0.15)",
                  border: "1px solid rgba(167,139,250,0.4)",
                  borderRadius: 4,
                  padding: "3px 8px",
                  color: "#C4B5FD",
                  display: "inline-block",
                }}
              >
                claim
              </motion.span>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>node_042</span>
            </div>
          </Row>

          {/* Row 2: Speaker chip */}
          <Row delay={0.1} inView={isInView}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
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
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                Alex · 0:09 → 0:23
              </span>
            </div>
          </Row>

          {/* Divider */}
          <Row delay={0.2} inView={isInView}>
            <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "12px 0" }} />
          </Row>

          {/* Row 3: Label */}
          <Row delay={0.3} inView={isInView}>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 14,
                color: "rgba(255,255,255,0.9)",
                fontWeight: 500,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              The market consistently rewards simplicity over feature depth.
            </p>
          </Row>

          {/* Row 4: Confidence bar */}
          <Row delay={0.5} inView={isInView}>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 9,
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.08em",
                  }}
                >
                  CONFIDENCE
                </span>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "#C4B5FD" }}>91%</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 9999, overflow: "hidden", position: "relative" }}>
                <motion.div
                  style={{ height: "100%", background: "#A78BFA", borderRadius: 9999, position: "relative" }}
                  initial={{ width: "0%" }}
                  animate={isInView ? { width: "91%" } : {}}
                  transition={{ duration: 0.6, ease, delay: 0.8 }}
                >
                  {/* Glow dot at leading edge */}
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={isInView ? { opacity: 0 } : {}}
                    transition={{ duration: 0.25, delay: 1.4 }}
                    style={{
                      position: "absolute",
                      right: -3,
                      top: -3,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#A78BFA",
                      boxShadow: "0 0 8px #A78BFA",
                      // Hide initially (bar starts at 0%)
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </Row>

          {/* Row 5: Signals */}
          <Row delay={0.7} inView={isInView}>
            <div style={{ marginTop: 16 }}>
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 9,
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: "0.08em",
                }}
              >
                SIGNALS
              </span>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                {[
                  { label: "trend", dotColor: "#FB923C", bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.3)", text: "#FDBA74" },
                  { label: "comment", dotColor: "#60A5FA", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.3)", text: "#93C5FD" },
                ].map((s) => (
                  <span
                    key={s.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: 10,
                      color: s.text,
                      background: s.bg,
                      border: `1px solid ${s.border}`,
                      borderRadius: 4,
                      padding: "3px 8px",
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dotColor }} />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          </Row>

          {/* Row 6: Connections */}
          <Row delay={0.9} inView={isInView}>
            <div style={{ marginTop: 16 }}>
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 9,
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: "0.08em",
                }}
              >
                CONNECTIONS
              </span>
              <div style={{ marginTop: 6, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                <div>→ supports · 2 nodes</div>
                <div>← callback_to · 1 node</div>
              </div>
            </div>
          </Row>
        </div>

        {/* Bottom strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.4, duration: 0.3 }}
          style={{
            background: "rgba(255,255,255,0.02)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "10px 20px",
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.25)",
          }}
        >
          0:09 → 0:23 · 14s · CLAIM
        </motion.div>
      </DemoCardShell>
    </div>
  );
}
