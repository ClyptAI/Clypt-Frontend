import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import AppFrameMock from "./AppFrameMock";

/**
 * Faithful preview of the RunRender page (Stage A — Review render plan).
 * Mirrors the production layout: centered max-width column, "Review render
 * plan" heading, expandable clip cards with shot-by-shot intent rows, then a
 * Render settings card and a sticky CTA bar at the bottom with the violet
 * "Render N clips →" button.
 */

const INTENT_COLORS = {
  Follow:   { bg: "rgba(167,139,250,0.12)", color: "#C4B5FD" },
  Reaction: { bg: "rgba(251,178,73,0.12)",  color: "#FCD34D" },
  Split:    { bg: "rgba(34,211,238,0.10)",   color: "#67E8F9" },
  Wide:     { bg: "rgba(74,222,128,0.10)",   color: "#86EFAC" },
} as const;

const CLIPS = [
  {
    label: "Clip 001",
    timeRange: "0:38 → 1:04",
    duration: "26s",
    rank: 1,
    score: 8.4,
    complete: true,
    expanded: true,
    shots: [
      { idx: 1, time: "0:42.0–0:51.3", intent: "Follow"   as const, detail: "Joe" },
      { idx: 2, time: "0:51.3–1:04.1", intent: "Reaction" as const, detail: "Andrew → Joe" },
    ],
  },
  {
    label: "Clip 002",
    timeRange: "1:40 → 2:05",
    duration: "25s",
    rank: 2,
    score: 8.1,
    complete: true,
    expanded: false,
  },
  {
    label: "Clip 003",
    timeRange: "2:27 → 3:10",
    duration: "43s",
    rank: 3,
    score: 7.9,
    complete: true,
    expanded: false,
  },
] as const;

export default function LandingRenderPreview() {
  const previewRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(previewRef, { margin: "-20% 0px -20% 0px" });
  const animateDecor = !reduceMotion && isInView;

  return (
    <AppFrameMock windowLabel="Joe Rogan × Flagrant — Render" height={580}>
      <div ref={previewRef} style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0A0909" }}>
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
            Phase 6 of 6 — Running
          </span>
        </div>

        {/* Scrollable review area */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 620, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Heading */}
            <div>
              <h2
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: 19,
                  color: "rgba(255,255,255,0.95)",
                  margin: 0,
                }}
              >
                Review render plan
              </h2>
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                  margin: "4px 0 0",
                }}
              >
                Confirm the shot-by-shot layout for each clip before rendering.
              </p>
            </div>

            {/* Clip cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CLIPS.map((c) => (
                <div
                  key={c.label}
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    background: "rgba(20,18,19,0.7)",
                    overflow: "hidden",
                  }}
                >
                  {/* Card header */}
                  <div
                    style={{
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <ChevronDown
                        size={14}
                        color="rgba(255,255,255,0.5)"
                        style={{ transform: c.expanded ? "rotate(0deg)" : "rotate(-90deg)" }}
                      />
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 13, color: "rgba(255,255,255,0.95)" }}>
                          {c.label}
                        </span>
                        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                          {c.timeRange}  ·  {c.duration}  ·  Rank #{c.rank}  ·  Score {c.score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 4,
                          fontFamily: "'Bricolage Grotesque', sans-serif",
                          fontWeight: 500,
                          fontSize: 9.5,
                          background: c.complete ? "rgba(74,222,128,0.10)" : "rgba(251,113,133,0.10)",
                          border: c.complete ? "1px solid rgba(74,222,128,0.4)" : "1px solid rgba(251,113,133,0.4)",
                          color: c.complete ? "#86EFAC" : "#FECACA",
                        }}
                      >
                        {c.complete ? "Grounding complete ✓" : "Grounding incomplete"}
                      </span>
                      <X size={12} color="rgba(255,255,255,0.4)" />
                    </div>
                  </div>

                  {/* Expanded content */}
                  {c.expanded && "shots" in c && c.shots && (
                    <div
                      style={{
                        padding: "12px 14px",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {c.shots.map((s) => {
                        const style = INTENT_COLORS[s.intent];
                        return (
                          <div
                            key={s.idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 11,
                              padding: "7px 10px",
                              background: "rgba(255,255,255,0.025)",
                              borderRadius: 5,
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 18,
                                borderRadius: 3,
                                background: "rgba(255,255,255,0.06)",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontFamily: "'Geist Mono', monospace",
                                fontSize: 10.5,
                                color: "rgba(255,255,255,0.5)",
                                width: 130,
                                flexShrink: 0,
                              }}
                            >
                              Shot {s.idx}  ·  {s.time}
                            </span>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: 3,
                                fontFamily: "'Bricolage Grotesque', sans-serif",
                                fontWeight: 500,
                                fontSize: 9.5,
                                background: style.bg,
                                color: style.color,
                              }}
                            >
                              {s.intent} · {s.detail}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Render settings */}
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                background: "rgba(20,18,19,0.7)",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 12, color: "rgba(255,255,255,0.9)" }}>
                Render settings
              </span>

              <SettingRow label="Preset" value="TikTok 9:16 · 1080p" />
              <SettingRow label="Captions" value={<Segmented value="Auto" options={["Off", "On", "Auto"]} />} />
            </div>
          </div>
        </div>

        {/* Sticky CTA bar */}
        <div
          style={{
            flexShrink: 0,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "12px 24px",
            background: "rgba(10,9,9,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11.5, color: "rgba(255,255,255,0.55)" }}>
            3 clips in queue · 3 complete
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <div
              style={{
                padding: "7px 14px",
                borderRadius: 5,
                border: "1px solid rgba(255,255,255,0.1)",
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 500,
                fontSize: 11,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              Save plan for later
            </div>
            <motion.div
              animate={
                !animateDecor
                  ? undefined
                  : {
                      boxShadow: [
                        "0 0 12px 1px rgba(167,139,250,0.34)",
                        "0 0 22px 4px rgba(167,139,250,0.54)",
                      ],
                    }
              }
              transition={
                animateDecor
                  ? {
                      duration: 1.6,
                      repeat: Infinity,
                      repeatType: "mirror",
                      ease: "easeInOut",
                    }
                  : undefined
              }
              style={{
                padding: "7px 16px",
                borderRadius: 5,
                background: "#A78BFA",
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 600,
                fontSize: 11.5,
                color: "#0A0909",
              }}
            >
              Render 3 clips →
            </motion.div>
          </div>
        </div>
      </div>
    </AppFrameMock>
  );
}

function SettingRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 11.5, color: "rgba(255,255,255,0.9)" }}>
        {label}
      </span>
      {typeof value === "string" ? (
        <div
          style={{
            padding: "5px 11px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 5,
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 500,
            fontSize: 10.5,
            color: "rgba(255,255,255,0.7)",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          {value}
          <ChevronDown size={11} />
        </div>
      ) : (
        value
      )}
    </div>
  );
}

function Segmented({ value, options }: { value: string; options: string[] }) {
  return (
    <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 5, overflow: "hidden" }}>
      {options.map((o) => (
        <span
          key={o}
          style={{
            padding: "4px 11px",
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 500,
            fontSize: 10,
            background: o === value ? "rgba(167,139,250,0.18)" : "rgba(255,255,255,0.02)",
            color: o === value ? "#C4B5FD" : "rgba(255,255,255,0.45)",
            borderRight: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {o}
        </span>
      ))}
    </div>
  );
}
