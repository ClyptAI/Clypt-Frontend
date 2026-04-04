import { useState } from "react";
import { motion } from "framer-motion";

const phases = [
  { num: "01", name: "Timeline Foundation", desc: "Transcription, diarization, shots, tracklets, emotion, and audio events." },
  { num: "02", name: "Node Construction", desc: "Gemini merges speaker turns into semantic units and classifies each one." },
  { num: "03", name: "Graph Construction", desc: "Structural and rhetorical edges connect the semantic units into a navigable graph." },
  { num: "04", name: "Candidate Retrieval", desc: "Embedding-based retrieval seeds subgraph expansion and Gemini ranking." },
  { num: "05", name: "Participation Grounding", desc: "You assign speakers to tracklets and set camera intent per shot." },
  { num: "06", name: "Render Planning", desc: "Shot-by-shot render instructions compile into 9:16 output clips." },
];

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const headingWords = ["Six", "phases.", "One", "clip."];

const HowItWorks = () => {
  const [hoveredIdx, setHoveredIdx] = useState(3);

  return (
    <motion.section
      className="bg-[var(--color-surface-1)] py-20"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease }}
    >
      <div className="max-w-[680px] mx-auto px-6">
        <p className="label-caps text-center mb-4">How it works</p>

        {/* Word-by-word heading */}
        <motion.h2
          className="font-heading font-bold text-[var(--color-text-primary)] text-center mb-16 flex justify-center gap-[0.3em] flex-wrap"
          style={{ fontSize: 36 }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
        >
          {headingWords.map((w, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease } },
              }}
            >
              {w}
            </motion.span>
          ))}
        </motion.h2>

        {/* Pipeline rows */}
        <motion.div
          className="flex flex-col"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {phases.map((phase, i) => {
            const isActive = hoveredIdx === i;
            return (
              <motion.div
                key={phase.num}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
                }}
                className="relative flex items-center py-5 px-6 border-b transition-colors cursor-default"
                style={{
                  borderColor: "var(--color-border-subtle)",
                  backgroundColor: isActive ? "var(--color-surface-2)" : "transparent",
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(3)}
              >
                {/* Violet left border on hover */}
                <motion.div
                  className="absolute left-0 top-0 w-[3px]"
                  style={{ background: "var(--color-violet)" }}
                  initial={{ height: "0%" }}
                  animate={{ height: isActive ? "100%" : "0%" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
                <motion.span
                  className="font-mono text-xs flex-shrink-0"
                  style={{ width: 32, fontSize: 12 }}
                  animate={{ color: isActive ? "var(--color-violet)" : "var(--color-text-muted)" }}
                  transition={{ duration: 0.4 }}
                >
                  {phase.num}
                </motion.span>
                <span className="font-heading font-semibold text-[var(--color-text-primary)]" style={{ width: 220, fontSize: 15 }}>
                  {phase.name}
                </span>
                <span className="font-sans font-normal text-[var(--color-text-secondary)] flex-1" style={{ fontSize: 14 }}>
                  {phase.desc}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HowItWorks;
