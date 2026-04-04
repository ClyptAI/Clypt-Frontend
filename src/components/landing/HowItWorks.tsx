import { motion } from "framer-motion";
import { Layers, GitFork, Network, Search, Users, Film } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const phases = [
  { num: "01", name: "Timeline Foundation", desc: "Transcription, diarization, shots, tracklets, emotion, and audio events.", icon: Layers },
  { num: "02", name: "Node Construction", desc: "Gemini merges speaker turns into semantic units and classifies each one.", icon: GitFork },
  { num: "03", name: "Graph Construction", desc: "Structural and rhetorical edges connect the semantic units into a navigable graph.", icon: Network },
  { num: "04", name: "Candidate Retrieval", desc: "Embedding-based retrieval seeds subgraph expansion and Gemini ranking.", icon: Search },
  { num: "05", name: "Participation Grounding", desc: "You assign speakers to tracklets and set camera intent per shot.", icon: Users },
  { num: "06", name: "Render Planning", desc: "Shot-by-shot render instructions compile into 9:16 output clips.", icon: Film },
];

const HowItWorks = () => {
  const isAmber = (i: number) => i >= 3;

  return (
    <section id="how-it-works" style={{ padding: "100px 24px" }}>
      <div className="max-w-[1100px] mx-auto">
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
                className="relative overflow-hidden transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  padding: 28,
                  cursor: "default",
                }}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
                }}
                whileHover={{
                  borderColor: "rgba(167,139,250,0.25)",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  boxShadow: "0 0 40px -12px rgba(167,139,250,0.15)",
                }}
              >
                {/* Ghost number */}
                <span
                  className="absolute font-mono font-bold pointer-events-none"
                  style={{ top: 16, right: 20, fontSize: 64, color: "rgba(255,255,255,0.04)" }}
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
