import { motion } from "framer-motion";
import { Layers, GitFork, Network, Search, Users, Film } from "lucide-react";
import ShaderBackground from "./ShaderBackground";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const phases = [
  { num: "01", name: "Timeline Foundation", desc: "Transcription, diarization, shots, tracklets, emotion, and audio events.", icon: Layers, anchor: "phase-01" },
  { num: "02", name: "Node Construction", desc: "Gemini merges speaker turns into semantic units and classifies each one.", icon: GitFork, anchor: "phase-02-03" },
  { num: "03", name: "Graph Construction", desc: "Structural and rhetorical edges connect the semantic units into a navigable graph.", icon: Network, anchor: "phase-02-03" },
  { num: "04", name: "Candidate Retrieval", desc: "Embedding-based retrieval seeds subgraph expansion and Gemini ranking.", icon: Search, anchor: "phase-04" },
  { num: "05", name: "Participation Grounding", desc: "You assign speakers to tracklets and set camera intent per shot.", icon: Users, anchor: "phase-05" },
  { num: "06", name: "Render Planning", desc: "Shot-by-shot render instructions compile into 9:16 output clips.", icon: Film, anchor: "phase-06" },
];

const HowItWorks = () => {
  const isAmber = (i: number) => i >= 3;

  return (
    <section
      id="how-it-works"
      style={{ padding: "100px 24px", position: "relative", isolation: "isolate" }}
      data-cursor-bg="violet"
    >
      <ShaderBackground
        variant="how-it-works"
        intensity="subtle"
        className="shader-layer"
        pauseWhenOffscreen
        viewportMargin="-20% 0px -20% 0px"
        animated={false}
        minPixelRatio={2}
        maxPixelCount={1920 * 1080 * 4}
      />
      <div className="max-w-[1100px] mx-auto content-layer">
        <p
          className="font-sans text-center"
          style={{
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            marginBottom: 16,
          }}
        >
          HOW IT WORKS
        </p>
        <motion.h2
          className="font-heading font-bold text-center"
          style={{ fontSize: 42, color: "#fff" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
        >
          Six phases. One clip.
        </motion.h2>

        <motion.div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(3, 1fr)", marginTop: 56 }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {phases.map((phase, i) => {
            const amber = isAmber(i);
            const IconComp = phase.icon;
            return (
              <motion.div
                key={phase.num}
                className="relative overflow-hidden"
                style={{
                  background: "rgba(14,12,18,0.72)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 20,
                  padding: 28,
                  cursor: "pointer",
                  boxShadow:
                    "0 20px 50px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
                onClick={() => {
                  document.getElementById(phase.anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
                }}
                transition={{ duration: 0.08, ease: "easeOut" }}
                whileHover={{
                  borderColor: "rgba(167,139,250,0.4)",
                  backgroundColor: "rgba(20,16,28,0.82)",
                  boxShadow:
                    "0 24px 60px -20px rgba(0,0,0,0.7), 0 0 40px -12px rgba(167,139,250,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
                  transition: { duration: 0.08, ease: "easeOut" },
                }}
              >
                {/* Ghost number */}
                <span
                  className="absolute font-mono font-bold pointer-events-none"
                  style={{
                    top: 12,
                    right: 18,
                    fontSize: 72,
                    lineHeight: 1,
                    color: "rgba(255,255,255,0.12)",
                  }}
                >
                  {phase.num}
                </span>

                {/* Icon */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${amber ? "rgba(251,178,73,0.25)" : "rgba(167,139,250,0.25)"}`,
                    background: amber ? "rgba(251,178,73,0.1)" : "rgba(167,139,250,0.1)",
                  }}
                >
                  <IconComp size={18} color={amber ? "#FBB249" : "#A78BFA"} />
                </div>

                <h3
                  className="font-heading font-semibold"
                  style={{ fontSize: 16, color: "#fff", marginTop: 16 }}
                >
                  {phase.name}
                </h3>
                <p
                  className="font-sans"
                  style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginTop: 8 }}
                >
                  {phase.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
