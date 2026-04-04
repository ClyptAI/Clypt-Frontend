import { useState } from "react";

const phases = [
  { num: "01", name: "Timeline Foundation", desc: "Transcription, diarization, shots, tracklets, emotion, and audio events." },
  { num: "02", name: "Node Construction", desc: "Gemini merges speaker turns into semantic units and classifies each one." },
  { num: "03", name: "Graph Construction", desc: "Structural and rhetorical edges connect the semantic units into a navigable graph." },
  { num: "04", name: "Candidate Retrieval", desc: "Embedding-based retrieval seeds subgraph expansion and Gemini ranking." },
  { num: "05", name: "Participation Grounding", desc: "You assign speakers to tracklets and set camera intent per shot." },
  { num: "06", name: "Render Planning", desc: "Shot-by-shot render instructions compile into 9:16 output clips." },
];

const HowItWorks = () => {
  const [hoveredIdx, setHoveredIdx] = useState(3); // phase 4 default highlighted

  return (
    <section className="bg-[var(--color-surface-1)] py-20">
      <div className="max-w-[680px] mx-auto px-6">
        <p className="label-caps text-center mb-4">How it works</p>
        <h2 className="font-heading font-bold text-4xl text-[var(--color-text-primary)] text-center mb-16" style={{ fontSize: "36px" }}>
          Six phases. One clip.
        </h2>

        <div className="flex flex-col">
          {phases.map((phase, i) => {
            const isActive = hoveredIdx === i;
            return (
              <div
                key={phase.num}
                className="flex items-center py-5 px-6 border-b transition-colors"
                style={{
                  borderColor: "var(--color-border-subtle)",
                  backgroundColor: isActive ? "var(--color-surface-2)" : "transparent",
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(3)}
              >
                <span
                  className="font-mono text-xs flex-shrink-0"
                  style={{
                    width: 32,
                    color: isActive ? "var(--color-violet)" : "var(--color-text-muted)",
                    fontSize: 12,
                  }}
                >
                  {phase.num}
                </span>
                <span className="font-heading font-semibold text-[var(--color-text-primary)]" style={{ width: 220, fontSize: 15 }}>
                  {phase.name}
                </span>
                <span className="font-sans font-normal text-[var(--color-text-secondary)] flex-1" style={{ fontSize: 14 }}>
                  {phase.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
