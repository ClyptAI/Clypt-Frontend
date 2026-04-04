import { motion } from "framer-motion";
import DemoCardShell from "./DemoCardShell";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

function Row({ delay, children }: { delay: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.4, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingNodeDemo() {
  return (
    <DemoCardShell label="node_extractor · 1 node selected">
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Row 1: Type + ID */}
        <Row delay={0}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10,
                background: "rgba(167,139,250,0.15)",
                border: "1px solid rgba(167,139,250,0.4)",
                borderRadius: 4,
                padding: "3px 8px",
                color: "#C4B5FD",
              }}
            >
              claim
            </span>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>node_042</span>
          </div>
        </Row>

        {/* Row 2: Speaker chip */}
        <Row delay={0.1}>
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
        <Row delay={0.2}>
          <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "12px 0" }} />
        </Row>

        {/* Row 3: Label */}
        <Row delay={0.3}>
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
        <Row delay={0.5}>
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
            <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 9999, overflow: "hidden" }}>
              <motion.div
                style={{ height: "100%", background: "#A78BFA", borderRadius: 9999 }}
                initial={{ width: "0%" }}
                whileInView={{ width: "91%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease }}
              />
            </div>
          </div>
        </Row>

        {/* Row 5: Signals */}
        <Row delay={0.7}>
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
        <Row delay={0.9}>
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
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.1, duration: 0.3 }}
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
  );
}
