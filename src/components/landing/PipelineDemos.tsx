import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import LandingGraphDemo from "./LandingGraphDemo";
import LandingTimelinePreview from "./previews/LandingTimelinePreview";
import LandingSearchPreview from "./previews/LandingSearchPreview";
import LandingGroundingPreview from "./previews/LandingGroundingPreview";
import LandingRenderPreview from "./previews/LandingRenderPreview";
import ShaderBackground from "./ShaderBackground";
import { TrendingUp, MessageSquare, BarChart2, Check } from "lucide-react";

const mono = "'Geist Mono', monospace";
const jakarta = "'Plus Jakarta Sans', sans-serif";
const brico = "'Bricolage Grotesque', sans-serif";
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

function Overline({ children }: { children: string }) {
  return (
    <div style={{ fontFamily: jakarta, fontSize: 11, letterSpacing: "0.1em", color: "hsl(var(--primary))", opacity: 0.8, marginBottom: 16 }}>
      {children}
    </div>
  );
}

function Heading({ children }: { children: string }) {
  return (
    <h3 style={{ fontFamily: brico, fontWeight: 700, fontSize: 38, color: "hsl(var(--foreground))", lineHeight: 1.15, maxWidth: 420, margin: 0 }}>
      {children}
    </h3>
  );
}

function Subtext({ children }: { children: string }) {
  return (
    <p style={{ fontFamily: jakarta, fontSize: 16, color: "hsl(var(--foreground) / 0.6)", lineHeight: 1.65, maxWidth: 420, marginTop: 16 }}>
      {children}
    </p>
  );
}

const typePills = [
  { label: "claim", border: "hsl(var(--primary) / 0.4)", bg: "hsl(var(--primary) / 0.1)", text: "hsl(var(--primary))" },
  { label: "explanation", border: "hsl(217 91% 70% / 0.4)", bg: "hsl(217 91% 70% / 0.1)", text: "hsl(213 94% 78%)" },
  { label: "anecdote", border: "hsl(38 96% 64% / 0.4)", bg: "hsl(38 96% 64% / 0.1)", text: "hsl(46 97% 65%)" },
  { label: "reaction_beat", border: "hsl(142 76% 64% / 0.4)", bg: "hsl(142 76% 64% / 0.1)", text: "hsl(141 84% 74%)" },
];

const phases = [
  {
    id: "phase-01",
    copy: (
      <>
        <Overline>PHASE 01 · TIMELINE FOUNDATION</Overline>
        <Heading>Every word. Every speaker. Every frame.</Heading>
        <Subtext>Clypt transcribes, diarizes, and indexes your video into a multi-lane timeline — tracklets, emotion markers, and audio events aligned to the millisecond.</Subtext>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 32 }}>
          {typePills.map((p) => (
            <span
              key={p.label}
              style={{
                fontFamily: mono,
                fontSize: 11,
                border: `1px solid ${p.border}`,
                background: p.bg,
                color: p.text,
                padding: "3px 8px",
                borderRadius: 4,
              }}
            >
              {p.label}
            </span>
          ))}
        </div>
      </>
    ),
    ui: <LandingTimelinePreview />,
  },
  {
    id: "phase-02-03",
    copy: (
      <>
        <Overline>PHASE 02 / 03 · NODES & GRAPH</Overline>
        <Heading>Every moment, labeled — and connected.</Heading>
        <Subtext>Your video gets broken into moments — a claim, a reaction, a payoff — each one tagged with who said it and how strong the signal is. Then Clypt connects them into the shape of your video, not just the timeline.</Subtext>
      </>
    ),
    ui: <LandingGraphDemo />,
    compact: true,
    rightBleed: 144,
  },
  {
    id: "phase-04",
    copy: (
      <>
        <Overline>PHASE 04 · CANDIDATE RETRIEVAL</Overline>
        <Heading>The clips worth cutting, before you touch the timeline.</Heading>
        <Subtext>Similar moments cluster together. The ones already resonating — lit up by trending topics or hot comment threads — rise to the top as candidates. You walk in already knowing where the clips live.</Subtext>
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { color: "hsl(var(--primary) / 0.85)", label: "Argument cluster" },
            { color: "hsl(38 96% 64% / 0.85)", label: "Narrative cluster" },
            { color: "hsl(142 76% 64% / 0.85)", label: "Reaction cluster" },
            { color: "hsl(217 91% 70% / 0.85)", label: "Exposition cluster" },
          ].map((c) => (
            <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color }} />
              <span style={{ fontFamily: jakarta, fontSize: 12, color: "hsl(var(--foreground) / 0.5)" }}>{c.label}</span>
            </div>
          ))}
          <div style={{ height: 1, background: "hsl(var(--foreground) / 0.06)", margin: "12px 0" }} />
          {[
            { Icon: TrendingUp, color: "hsl(25 95% 60%)", label: "Trend signal" },
            { Icon: MessageSquare, color: "hsl(217 91% 70%)", label: "Comment signal" },
            { Icon: BarChart2, color: "hsl(142 76% 64%)", label: "Retention signal" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <s.Icon size={12} color={s.color} />
              <span style={{ fontFamily: jakarta, fontSize: 12, color: "hsl(var(--foreground) / 0.5)" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </>
    ),
    ui: <LandingSearchPreview />,
  },
  {
    id: "phase-05",
    copy: (
      <>
        <Overline>PHASE 05 · PARTICIPATION GROUNDING</Overline>
        <Heading>You choose who to follow.</Heading>
        <Subtext>Clypt lets you map which speakers appear in each shot and assign camera direction, so every clip frames the right person at the right moment.</Subtext>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 32 }}>
          {[
            { letter: "A", name: "Joe", shots: 2, color: "hsl(var(--primary))", bg: "hsl(var(--primary) / 0.2)" },
            { letter: "B", name: "Andrew", shots: 2, color: "hsl(38 96% 64%)", bg: "hsl(38 96% 64% / 0.2)" },
            { letter: "C", name: "Akaash", shots: 2, color: "hsl(217 91% 70%)", bg: "hsl(217 91% 70% / 0.2)" },
          ].map((s) => (
            <div key={s.letter} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: brico,
                  fontWeight: 700,
                  fontSize: 11,
                  color: s.color,
                }}
              >
                {s.letter}
              </div>
              <span style={{ fontFamily: jakarta, fontSize: 12, color: "hsl(var(--foreground) / 0.5)" }}>{s.name} · {s.shots} shots</span>
            </div>
          ))}
        </div>
      </>
    ),
    ui: <LandingGroundingPreview />,
    rightBleed: 64,
  },
  {
    id: "phase-06",
    copy: (
      <>
        <Overline>PHASE 06 · CLIP RENDERING</Overline>
        <Heading>Ready to post. Zero editing.</Heading>
        <Subtext>No cropping, no captioning, no cleanup. Every clip leaves Clypt ready for the feed — one at a time, or a whole batch.</Subtext>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 32 }}>
          {[
            "Speaker-attributed transcript overlay",
            "Node type + signal metadata embedded",
            "Frame-accurate 9:16 crop",
            "One-tap social export",
          ].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "hsl(142 76% 64% / 0.15)",
                  border: "1px solid hsl(142 76% 64% / 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Check size={8} color="hsl(142 76% 64%)" />
              </div>
              <span style={{ fontFamily: jakarta, fontSize: 13, color: "hsl(var(--foreground) / 0.6)" }}>{item}</span>
            </div>
          ))}
        </div>
      </>
    ),
    ui: <LandingRenderPreview />,
  },
];

export default function PipelineDemos() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activePhase, setActivePhase] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const nextPhase = Math.min(phases.length - 1, Math.max(0, Math.floor(latest * phases.length)));
    setActivePhase(nextPhase);
  });

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        isolation: "isolate",
        minHeight: `${phases.length * 100}vh`,
        paddingTop: 112,
        paddingBottom: 112,
        overflow: "clip",
      }}
    >
      <ShaderBackground
        variant="pipeline-deep"
        intensity="normal"
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      />
      <div
        style={{
          zIndex: 10,
          position: "relative",
          width: "min(1240px, 100%)",
          margin: "0 auto",
          padding: "0 32px 0 88px",
          display: "grid",
          gridTemplateColumns: "minmax(300px, 0.42fr) minmax(0, 0.58fr)",
          gap: 48,
          alignItems: "start",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: -48,
              top: "22vh",
              height: "56vh",
              width: 2,
              background: "hsl(var(--foreground) / 0.14)",
              pointerEvents: "none",
            }}
          >
            <motion.div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: progressHeight,
                background: "hsl(var(--primary))",
              }}
            />
          </div>
          {phases.map((phase, index) => (
            <motion.div
              key={phase.id}
              style={{
                display: index === activePhase ? "block" : "none",
                maxWidth: 460,
              }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: index === activePhase ? 1 : 0, y: index === activePhase ? 0 : 14 }}
              transition={{ duration: 0.35, ease }}
            >
              {phase.copy}
            </motion.div>
          ))}
        </div>
        <div style={{ minWidth: 0 }}>
          {phases.map((phase) => {
            const rightBleed = phase.rightBleed ?? 0;
            return (
            <section
              key={phase.id}
              id={phase.id}
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: rightBleed > 0 ? "flex-start" : "center",
              }}
            >
              <motion.div
                style={{
                  width: rightBleed > 0 ? `calc(100% + ${rightBleed}px)` : "100%",
                  marginRight: rightBleed > 0 ? -rightBleed : 0,
                  transformOrigin: rightBleed > 0 ? "left center" : "center",
                  scale: phase.compact ? 0.97 : 1,
                }}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.35 }}
                transition={{ duration: 0.45, ease }}
              >
                {phase.ui}
              </motion.div>
            </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
