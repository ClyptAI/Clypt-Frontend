import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, GitFork, Network, Search, Users, Film } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const phases = [
  { num: "01", name: "Timeline Foundation", desc: "Transcription, diarization, shots, tracklets, emotion, and audio events.", icon: Layers, anchor: "phase-01" },
  { num: "02", name: "Node Construction", desc: "AI merges speaker turns into semantic units and classifies each one.", icon: GitFork, anchor: "phase-02-03" },
  { num: "03", name: "Graph Construction", desc: "Structural and rhetorical edges connect the semantic units into a navigable graph.", icon: Network, anchor: "phase-02-03" },
  { num: "04", name: "Candidate Retrieval", desc: "Embedding-based retrieval seeds subgraph expansion and AI ranking.", icon: Search, anchor: "phase-04" },
  { num: "05", name: "Participation Grounding", desc: "You assign speakers to tracklets and set camera intent per shot.", icon: Users, anchor: "phase-05" },
  { num: "06", name: "Render Planning", desc: "Shot-by-shot render instructions compile into 9:16 output clips.", icon: Film, anchor: "phase-06" },
];

const HowItWorks = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isAmber = (i: number) => i >= 3;

  return (
    <div
      id="how-it-works"
      style={{ padding: "112px 24px 88px", position: "relative" }}
      data-cursor-bg="violet"
    >
      <div className="mx-auto content-layer" style={{ maxWidth: 1180 }}>
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(280px,0.55fr)]">
          <div>
            <p
              className="font-sans"
              style={{
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "hsl(var(--primary) / 0.8)",
                marginBottom: 16,
              }}
            >
              HOW IT WORKS
            </p>
            <motion.h2
              className="font-heading font-bold"
              style={{ fontSize: "clamp(34px, 4vw, 52px)", lineHeight: 1.05, color: "#fff", maxWidth: 680 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease }}
            >
              Six phases, one continuous pipeline.
            </motion.h2>
          </div>
          <p
            className="font-sans"
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.58)",
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Clypt moves from raw video to semantic graph to render-ready clips without leaving the workspace.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          style={{ marginTop: 48 }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {phases.map((phase, i) => {
            const amber = isAmber(i);
            const IconComp = phase.icon;
            const isActive = activeIndex === i;
            const accent = amber ? "#FBB249" : "#A78BFA";
            const borderColor = isActive
              ? amber ? "rgba(251,178,73,0.66)" : "rgba(167,139,250,0.68)"
              : amber ? "rgba(251,178,73,0.28)" : "rgba(167,139,250,0.3)";
            return (
              <motion.div
                key={phase.num}
                className="relative overflow-hidden"
                role="button"
                tabIndex={0}
                aria-current={isActive ? "step" : undefined}
                style={{
                  minHeight: 190,
                  background: isActive
                    ? amber ? "rgba(45,28,18,0.82)" : "rgba(28,22,45,0.86)"
                    : amber ? "rgba(35,22,17,0.66)" : "rgba(19,16,31,0.74)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: `1px solid ${borderColor}`,
                  borderRadius: 14,
                  padding: "22px 22px 24px",
                  cursor: "pointer",
                  boxShadow:
                    isActive
                      ? `0 28px 78px -28px rgba(0,0,0,0.86), 0 0 54px -16px ${amber ? "rgba(251,178,73,0.42)" : "rgba(167,139,250,0.46)"}, inset 0 1px 0 rgba(255,255,255,0.12)`
                      : "0 24px 70px -30px rgba(0,0,0,0.82), inset 0 1px 0 rgba(255,255,255,0.07)",
                }}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(i)}
                onBlur={() => setActiveIndex(null)}
                onClick={() => {
                  setActiveIndex(i);
                  document.getElementById(phase.anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveIndex(i);
                    document.getElementById(phase.anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
                }}
                transition={{ duration: 0.08, ease: "easeOut" }}
                whileHover={{
                  y: -3,
                  borderColor: amber ? "rgba(251,178,73,0.66)" : "rgba(167,139,250,0.68)",
                  backgroundColor: amber ? "rgba(45,28,18,0.74)" : "rgba(24,19,38,0.82)",
                  boxShadow:
                    `0 26px 66px -22px rgba(0,0,0,0.76), 0 0 46px -14px ${amber ? "rgba(251,178,73,0.34)" : "rgba(167,139,250,0.36)"}, inset 0 1px 0 rgba(255,255,255,0.1)`,
                  transition: { duration: 0.08, ease: "easeOut" },
                }}
              >
                {isActive && (
                  <motion.div
                    aria-hidden="true"
                    layoutId="how-it-works-active"
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 14,
                      boxShadow: `inset 0 0 0 1px ${amber ? "rgba(251,178,73,0.36)" : "rgba(167,139,250,0.38)"}`,
                      pointerEvents: "none",
                    }}
                    transition={{ duration: 0.18, ease }}
                  />
                )}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: "0 0 auto",
                    height: isActive ? 4 : 3,
                    background: `linear-gradient(90deg, ${accent}, ${amber ? "rgba(251,178,73,0)" : "rgba(167,139,250,0)"})`,
                    opacity: isActive ? 1 : 0.84,
                  }}
                />
                {/* Ghost number */}
                <span
                  className="absolute font-mono font-bold pointer-events-none"
                  style={{
                    top: 10,
                    right: 16,
                    fontSize: 58,
                    lineHeight: 1,
                    color: isActive ? accent : "rgba(255,255,255,0.08)",
                    opacity: isActive ? 0.42 : 1,
                    textShadow: isActive ? `0 0 28px ${amber ? "rgba(251,178,73,0.48)" : "rgba(167,139,250,0.52)"}` : "none",
                    transition: "color 160ms ease, opacity 160ms ease, text-shadow 160ms ease",
                  }}
                >
                  {phase.num}
                </span>

                {/* Icon */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${isActive ? accent : amber ? "rgba(251,178,73,0.25)" : "rgba(167,139,250,0.25)"}`,
                    background: isActive
                      ? amber ? "rgba(251,178,73,0.18)" : "rgba(167,139,250,0.18)"
                      : amber ? "rgba(251,178,73,0.1)" : "rgba(167,139,250,0.1)",
                    boxShadow: isActive ? `0 0 22px -8px ${accent}` : "none",
                  }}
                >
                  <IconComp size={18} color={accent} />
                </div>

                <h3
                  className="font-heading font-semibold"
                  style={{ fontSize: 17, color: "#fff", marginTop: 18 }}
                >
                  {phase.name}
                </h3>
                <p
                  className="font-sans"
                  style={{ fontSize: 13.5, color: "rgba(255,255,255,0.66)", lineHeight: 1.65, marginTop: 8 }}
                >
                  {phase.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default HowItWorks;
