import DemoSectionLayout from "./DemoSectionLayout";
import LandingTimelineDemo from "./LandingTimelineDemo";
import LandingNodeDemo from "./LandingNodeDemo";
import LandingGraphDemo from "./LandingGraphDemo";
import LandingEmbeddingDemo from "./LandingEmbeddingDemo";
import LandingParticipationDemo from "./LandingParticipationDemo";
import LandingClipDemo from "./LandingClipDemo";
import { TrendingUp, MessageSquare, BarChart2, Check } from "lucide-react";

const mono = "'Geist Mono', monospace";
const jakarta = "'Plus Jakarta Sans', sans-serif";
const brico = "'Bricolage Grotesque', sans-serif";

function Overline({ children }: { children: string }) {
  return (
    <div style={{ fontFamily: jakarta, fontSize: 11, letterSpacing: "0.1em", color: "#A78BFA", opacity: 0.8, marginBottom: 16 }}>
      {children}
    </div>
  );
}

function Heading({ children }: { children: string }) {
  return (
    <h3 style={{ fontFamily: brico, fontWeight: 700, fontSize: 38, color: "white", lineHeight: 1.15, maxWidth: 360, margin: 0 }}>
      {children}
    </h3>
  );
}

function Subtext({ children }: { children: string }) {
  return (
    <p style={{ fontFamily: jakarta, fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, maxWidth: 380, marginTop: 16 }}>
      {children}
    </p>
  );
}

const typePills = [
  { label: "claim", border: "rgba(167,139,250,0.4)", bg: "rgba(167,139,250,0.1)", text: "#C4B5FD" },
  { label: "explanation", border: "rgba(96,165,250,0.4)", bg: "rgba(96,165,250,0.1)", text: "#93C5FD" },
  { label: "anecdote", border: "rgba(251,178,73,0.4)", bg: "rgba(251,178,73,0.1)", text: "#FCD34D" },
  { label: "reaction_beat", border: "rgba(74,222,128,0.4)", bg: "rgba(74,222,128,0.1)", text: "#86EFAC" },
];

export default function PipelineDemos() {
  return (
    <>
      {/* Section 1 — Timeline */}
      <DemoSectionLayout
        id="phase-01"
        layout="odd"
        copy={
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
        }
        ui={<LandingTimelineDemo />}
      />

      {/* Section 2 — Node */}
      <DemoSectionLayout
        id="phase-02"
        layout="even"
        copy={
          <>
            <Overline>PHASE 02 · NODE CONSTRUCTION</Overline>
            <Heading>Every insight, named.</Heading>
            <Subtext>Clypt's extraction model identifies each semantic unit — tagging it with type, speaker, timestamp, and confidence score. Raw transcript becomes structured, addressable knowledge.</Subtext>
          </>
        }
        ui={<LandingNodeDemo />}
      />

      {/* Section 3 — Graph (full-width) */}
      <DemoSectionLayout
        id="phase-03"
        layout="full"
        copy={
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
            <Overline>PHASE 03 · GRAPH CONSTRUCTION</Overline>
            <h3 style={{ fontFamily: brico, fontWeight: 700, fontSize: 48, color: "white", lineHeight: 1.15, margin: 0 }}>
              Rhetoric, mapped.
            </h3>
            <p style={{ fontFamily: jakarta, fontSize: 17, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, marginTop: 16 }}>
              Every semantic unit becomes a node. Every connection — a claim supporting an anecdote, a question answered three minutes later — becomes a typed edge. The result is a navigable knowledge graph of your content.
            </p>
          </div>
        }
        ui={<LandingGraphDemo />}
      />

      {/* Section 4 — Embeddings */}
      <DemoSectionLayout
        id="phase-04"
        layout="even"
        copy={
          <>
            <Overline>PHASE 04 · CANDIDATE RETRIEVAL</Overline>
            <Heading>The content, charted.</Heading>
            <Subtext>Each node gets embedded into semantic space. Clusters reveal conceptual structure — and signal-tagged nodes light up as clip candidates before a single frame is rendered.</Subtext>
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { color: "rgba(167,139,250,0.85)", label: "Argument cluster" },
                { color: "rgba(251,178,73,0.85)", label: "Narrative cluster" },
                { color: "rgba(74,222,128,0.85)", label: "Reaction cluster" },
                { color: "rgba(96,165,250,0.85)", label: "Exposition cluster" },
              ].map((c) => (
                <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color }} />
                  <span style={{ fontFamily: jakarta, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{c.label}</span>
                </div>
              ))}
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "12px 0" }} />
              {[
                { Icon: TrendingUp, color: "#FB923C", label: "Trend signal" },
                { Icon: MessageSquare, color: "#60A5FA", label: "Comment signal" },
                { Icon: BarChart2, color: "#4ADE80", label: "Retention signal" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <s.Icon size={12} color={s.color} />
                  <span style={{ fontFamily: jakarta, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </>
        }
        ui={<LandingEmbeddingDemo />}
      />

      {/* Section 5 — Participation */}
      <DemoSectionLayout
        id="phase-05"
        layout="odd"
        copy={
          <>
            <Overline>PHASE 05 · PARTICIPATION GROUNDING</Overline>
            <Heading>The camera knows who to follow.</Heading>
            <Subtext>Clypt maps which speakers appear in each shot and assigns camera direction — so every clip frames the right person at the right moment, automatically.</Subtext>
            <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
              {[
                { letter: "A", name: "Alex", shots: 2, color: "#A78BFA", bg: "rgba(167,139,250,0.2)" },
                { letter: "B", name: "Jordan", shots: 2, color: "#FBB249", bg: "rgba(251,178,73,0.2)" },
                { letter: "C", name: "Sam", shots: 2, color: "#60A5FA", bg: "rgba(96,165,250,0.2)" },
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
                  <span style={{ fontFamily: jakarta, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{s.name} · {s.shots} shots</span>
                </div>
              ))}
            </div>
          </>
        }
        ui={<LandingParticipationDemo />}
      />

      {/* Section 6 — Clip */}
      <DemoSectionLayout
        id="phase-06"
        layout="even"
        copy={
          <>
            <Overline>PHASE 06 · CLIP RENDERING</Overline>
            <Heading>Render-ready. Zero editing.</Heading>
            <Subtext>Every output clip arrives fully dressed — speaker-labeled, type-tagged, frame-trimmed, and metadata-stamped. Drop it anywhere, or queue it for batch export.</Subtext>
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
                      background: "rgba(74,222,128,0.15)",
                      border: "1px solid rgba(74,222,128,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Check size={8} color="#4ADE80" />
                  </div>
                  <span style={{ fontFamily: jakarta, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{item}</span>
                </div>
              ))}
            </div>
          </>
        }
        ui={<LandingClipDemo />}
      />
    </>
  );
}
