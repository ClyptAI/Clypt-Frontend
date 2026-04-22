import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import DemoCardShell from "./DemoCardShell";

const speakers = [
  { letter: "A", name: "Alex", color: "#A78BFA", bg: "rgba(167,139,250,0.18)", border: "rgba(167,139,250,0.4)", cellBg: "rgba(167,139,250,0.15)", cellBorder: "rgba(167,139,250,0.3)" },
  { letter: "B", name: "Jordan", color: "#FBB249", bg: "rgba(251,178,73,0.15)", border: "rgba(251,178,73,0.35)", cellBg: "rgba(251,178,73,0.15)", cellBorder: "rgba(251,178,73,0.3)" },
  { letter: "C", name: "Sam", color: "#60A5FA", bg: "rgba(96,165,250,0.15)", border: "rgba(96,165,250,0.35)", cellBg: "rgba(96,165,250,0.15)", cellBorder: "rgba(96,165,250,0.3)" },
];

// Participation map: [A, B, C] for each shot
const participation = [
  [true, true, false],   // Shot 01
  [false, true, false],  // Shot 02
  [true, false, true],   // Shot 03
  [false, true, true],   // Shot 04
];

// Shot → active speaker index
const shotSpeaker = [0, 1, 2, 0];
// Shot → timing (ms)
const shotTimings = [0, 2500, 5000, 7000];
const LOOP_DURATION = 9000;

// Speaker positions as percentages from left
const speakerPositions = [20, 49, 78];

export default function LandingParticipationDemo() {
  const [activeShot, setActiveShot] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveShot((prev) => {
        const now = Date.now() % LOOP_DURATION;
        if (now < 2500) return 0;
        if (now < 5000) return 1;
        if (now < 7000) return 2;
        return 3;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isInView]);

  const activeSpeakerIdx = shotSpeaker[activeShot];

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <DemoCardShell label="participation_grounding · 3 speakers · 4 shots" className="w-full">
        {/* Zone 1 — Stage */}
        <div
          style={{
            height: 196,
            position: "relative",
            overflow: "hidden",
            background: "rgba(255,255,255,0.01)",
          }}
        >
          {/* Speaker bubbles */}
          {speakers.map((s, i) => {
            const isActive = i === activeSpeakerIdx;
            return (
              <div
                key={s.letter}
                style={{
                  position: "absolute",
                  left: `${speakerPositions[i]}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  transition: "opacity 300ms, transform 300ms",
                  opacity: isActive ? 1 : 0.35,
                }}
              >
                <div style={{ position: "relative" }}>
                  {/* Pulse rings */}
                  {isActive && (
                    <>
                      <motion.div
                        style={{
                          position: "absolute",
                          inset: -8,
                          borderRadius: "50%",
                          border: `1.5px solid ${s.color}`,
                        }}
                        animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                      />
                      <motion.div
                        style={{
                          position: "absolute",
                          inset: -8,
                          borderRadius: "50%",
                          border: `1.5px solid ${s.color}`,
                        }}
                        animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.9 }}
                      />
                    </>
                  )}
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: s.bg,
                      border: `1.5px solid ${isActive ? s.color : s.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      fontWeight: 700,
                      fontSize: 16,
                      color: s.color,
                    }}
                  >
                    {s.letter}
                  </motion.div>
                </div>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                  {s.name}
                </span>
              </div>
            );
          })}

          {/* Camera follow frame */}
          <motion.div
            animate={{ left: `${speakerPositions[activeSpeakerIdx]}%` }}
            transition={{ type: "spring", stiffness: 55, damping: 14 }}
            style={{
              position: "absolute",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 108,
              height: 132,
              borderRadius: 8,
              border: "2px solid rgba(167,139,250,0.8)",
              boxShadow: "0 0 20px rgba(167,139,250,0.2), inset 0 0 20px rgba(167,139,250,0.03)",
              pointerEvents: "none",
            }}
          >
            {/* Crosshair */}
            <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, background: "rgba(167,139,250,0.2)" }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: "rgba(167,139,250,0.2)" }} />
            {/* REC pill */}
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <motion.div
                style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(239,68,68,0.9)" }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.6)" }}>REC</span>
            </div>
          </motion.div>
        </div>

        {/* Zone 2 — Shot participation matrix */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "48px repeat(4, 1fr)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div />
            {[0, 1, 2, 3].map((si) => (
              <div
                key={si}
                style={{
                  padding: "8px 0",
                  textAlign: "center",
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 8,
                  color: "rgba(255,255,255,0.3)",
                  background: activeShot === si ? "rgba(255,255,255,0.03)" : undefined,
                  borderLeft: activeShot === si ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                  borderRight: activeShot === si ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                }}
              >
                SHOT 0{si + 1}
              </div>
            ))}
          </div>

          {/* Rows */}
          {speakers.map((s, si) => (
            <div
              key={s.letter}
              style={{
                display: "grid",
                gridTemplateColumns: "48px repeat(4, 1fr)",
                height: 36,
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: s.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: 9,
                    color: s.color,
                  }}
                >
                  {s.letter}
                </div>
              </div>
              {participation.map((shot, shotIdx) => (
                <div
                  key={shotIdx}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    background: activeShot === shotIdx ? "rgba(255,255,255,0.03)" : undefined,
                    borderLeft: activeShot === shotIdx ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                    borderRight: activeShot === shotIdx ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                    height: "100%",
                    alignItems: "center",
                  }}
                >
                  {shot[si] && (
                    <div
                      style={{
                        width: 28,
                        height: 20,
                        borderRadius: 3,
                        background: s.cellBg,
                        border: `1px solid ${s.cellBorder}`,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </DemoCardShell>
    </div>
  );
}
