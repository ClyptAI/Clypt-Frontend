import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Check, Lock, Play, Pause, Zap, TriangleAlert } from "lucide-react";

/* ── Mock clip queue ── */
interface QueueClip {
  id: string;
  label: string;
  timeStart: string;
  timeEnd: string;
  duration: string;
  status: "partial" | "not_started" | "complete" | "locked";
  speakers?: string;
  camera?: string;
}

const QUEUE: QueueClip[] = [
  { id: "001", label: "Clip 001", timeStart: "0:42", timeEnd: "1:18", duration: "35s", status: "partial", speakers: "3/4", camera: "4/4" },
  { id: "002", label: "Clip 002", timeStart: "3:22", timeEnd: "4:05", duration: "43s", status: "not_started" },
  { id: "003", label: "Clip 003", timeStart: "1:50", timeEnd: "2:31", duration: "41s", status: "not_started" },
  { id: "004", label: "Clip 004", timeStart: "6:10", timeEnd: "6:48", duration: "38s", status: "not_started" },
  { id: "005", label: "Clip 005", timeStart: "8:05", timeEnd: "8:44", duration: "39s", status: "not_started" },
  { id: "006", label: "Clip 006", timeStart: "11:22", timeEnd: "12:00", duration: "38s", status: "locked" },
  { id: "007", label: "Clip 007", timeStart: "14:33", timeEnd: "15:10", duration: "37s", status: "locked" },
  { id: "008", label: "Clip 008", timeStart: "17:02", timeEnd: "17:38", duration: "36s", status: "locked" },
];

function StatusIcon({ status }: { status: QueueClip["status"] }) {
  const base: React.CSSProperties = { width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
  switch (status) {
    case "complete":
      return <span style={{ ...base, background: "var(--color-green-muted)", border: "1px solid var(--color-green)" }}><Check size={12} color="var(--color-green)" /></span>;
    case "partial":
      return (
        <span style={{ ...base, border: "2px solid var(--color-amber)", background: "var(--color-amber-muted)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-amber)" }} />
        </span>
      );
    case "locked":
      return <span style={{ ...base, border: "1px solid var(--color-border)", opacity: 0.3 }}><Lock size={10} color="var(--color-text-muted)" /></span>;
    default:
      return <span style={{ ...base, border: "1px solid var(--color-border)" }} />;
  }
}

/* ── Speaker colors ── */
const SPEAKER_COLORS = ["#4A9EFF", "#FF7A5C", "#5CCD8F"];

/* ── Mock shot data ── */
interface Tracklet { id: string; letter: string; durationPct: number; boundSpeaker?: number }
interface Turn { speakerIdx: number; startPct: number; widthPct: number }
interface ShotData {
  idx: number;
  timeStart: string;
  timeEnd: string;
  duration: string;
  tracklets: Tracklet[];
  turns: Turn[];
  speakers: number[];
  transcript: string[];
  voiceprintSuggestion?: { speakerIdx: number; name: string; confidence: number };
  conflict?: { speaker0: number; speaker1: number; tracklet: string; time: string };
  bindings: { speakerIdx: number; trackletId: string }[];
}

const SHOTS: ShotData[] = [
  {
    idx: 1, timeStart: "0:42.0", timeEnd: "0:51.3", duration: "9.3s",
    tracklets: [{ id: "tracklet_001", letter: "A", durationPct: 100, boundSpeaker: 0 }, { id: "tracklet_002", letter: "B", durationPct: 100 }],
    turns: [{ speakerIdx: 0, startPct: 0, widthPct: 100 }, { speakerIdx: 1, startPct: 33, widthPct: 67 }],
    speakers: [0, 1],
    transcript: ["I", "think", "we're", "at", "an", "inflection", "point", "with", "AI", "that", "most", "people", "don't", "fully", "appreciate", "yet"],
    voiceprintSuggestion: { speakerIdx: 0, name: "Rithvik — Host", confidence: 83 },
    bindings: [{ speakerIdx: 0, trackletId: "tracklet_001" }],
  },
  {
    idx: 2, timeStart: "0:51.3", timeEnd: "1:04.1", duration: "12.8s",
    tracklets: [{ id: "tracklet_001", letter: "A", durationPct: 100 }],
    turns: [{ speakerIdx: 1, startPct: 0, widthPct: 100 }],
    speakers: [1],
    transcript: ["The", "capabilities", "are", "advancing", "faster", "than", "our", "institutions", "can", "adapt", "to", "them"],
    bindings: [],
  },
  {
    idx: 3, timeStart: "1:04.1", timeEnd: "1:11.8", duration: "7.7s",
    tracklets: [{ id: "tracklet_001", letter: "A", durationPct: 50 }, { id: "tracklet_002", letter: "B", durationPct: 50 }],
    turns: [{ speakerIdx: 0, startPct: 0, widthPct: 65 }, { speakerIdx: 1, startPct: 39, widthPct: 61 }],
    speakers: [0, 1],
    transcript: ["Let", "me", "show", "you", "what", "happens", "when", "you", "ask", "the", "model"],
    bindings: [],
  },
  {
    idx: 4, timeStart: "1:11.8", timeEnd: "1:18.1", duration: "6.3s",
    tracklets: [{ id: "tracklet_001", letter: "A", durationPct: 50, boundSpeaker: 0 }, { id: "tracklet_002", letter: "B", durationPct: 50 }],
    turns: [{ speakerIdx: 0, startPct: 0, widthPct: 100 }, { speakerIdx: 1, startPct: 19, widthPct: 81 }],
    speakers: [0, 1],
    transcript: ["It", "fails", "consistently", "and", "not", "in", "a", "random", "way"],
    bindings: [{ speakerIdx: 0, trackletId: "tracklet_001" }],
  },
];

/* ── Video Player ── */
function InlineVideoPlayer() {
  const [playing, setPlaying] = useState(false);
  const [progress] = useState(25);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [speed, setSpeed] = useState("1×");

  return (
    <div style={{ height: 160, flexShrink: 0, background: "#000", borderBottom: "1px solid var(--color-border)", position: "relative", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 228, height: 128, background: "var(--color-surface-3)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Play size={32} color="var(--color-text-muted)" />
        </div>
      </div>
      <div style={{ height: 32, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", gap: 12, padding: "0 12px" }}>
        <button onClick={() => setPlaying(!playing)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "#fff" }}>
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "#fff" }}>0:42.4 / 1:18.1</span>
        <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.2)", borderRadius: 2, position: "relative", cursor: "pointer" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "var(--color-violet)", borderRadius: 2 }} />
          <div style={{ position: "absolute", top: -3.5, left: `${progress}%`, transform: "translateX(-50%)", width: 10, height: 10, borderRadius: "50%", background: "var(--color-violet)" }} />
        </div>
        <div style={{ position: "relative" }}>
          <button onClick={() => setSpeedOpen(!speedOpen)} style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "#fff", background: "none", border: "none", cursor: "pointer" }}>{speed}</button>
          {speedOpen && (
            <div style={{ position: "absolute", bottom: "100%", right: 0, background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: 6, padding: 4, zIndex: 10 }}>
              {["0.5×", "0.75×", "1×", "1.25×", "1.5×"].map((s) => (
                <button key={s} onClick={() => { setSpeed(s); setSpeedOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "4px 10px", fontFamily: "'Geist Mono', monospace", fontSize: 11, color: speed === s ? "var(--color-text-primary)" : "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer", borderRadius: 3 }}>{s}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Shot Lane Section ── */
function ShotSection({ shot }: { shot: ShotData }) {
  const [vpAccepted, setVpAccepted] = useState(false);
  const [vpDismissed, setVpDismissed] = useState(false);
  const [showRegistry, setShowRegistry] = useState(false);

  return (
    <div style={{ borderBottom: "2px solid var(--color-border)", paddingBottom: 4 }}>
      {/* Shot header */}
      <div style={{ height: 36, background: "var(--color-surface-1)", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center", padding: "0 16px", gap: 12, position: "sticky", top: 0, zIndex: 5 }}>
        <div style={{ width: 48, height: 27, borderRadius: 3, background: "var(--color-surface-3)", flexShrink: 0 }} />
        <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>Shot {shot.idx}</span>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>{shot.timeStart} – {shot.timeEnd}</span>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>({shot.duration})</span>
      </div>

      {/* Tracklet lane */}
      <div style={{ height: 44, display: "flex", alignItems: "center", padding: "0 16px", background: "var(--color-bg)", borderBottom: "1px solid var(--color-border-subtle)" }}>
        <span className="label-caps" style={{ width: 80, flexShrink: 0, fontSize: 10 }}>TRACKLETS</span>
        <div style={{ flex: 1, display: "flex", gap: 2, alignItems: "center", height: 32 }}>
          {shot.tracklets.map((t) => {
            const bound = shot.bindings.find((b) => b.trackletId === t.id);
            const speakerColor = bound !== undefined ? SPEAKER_COLORS[bound.speakerIdx] : undefined;
            return (
              <div
                key={t.id}
                style={{
                  flex: t.durationPct,
                  minWidth: 60,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderLeft: speakerColor ? `3px solid ${speakerColor}` : "1px solid var(--color-border)",
                  borderRadius: 4,
                  padding: "4px 8px",
                  cursor: "grab",
                  userSelect: "none",
                }}
              >
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--color-surface-3)", flexShrink: 0 }} />
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-primary)" }}>{t.letter}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Binding indicators */}
      {shot.bindings.length > 0 && (
        <svg style={{ width: "100%", height: 12, display: "block" }} preserveAspectRatio="none">
          {shot.bindings.map((b, i) => {
            const color = SPEAKER_COLORS[b.speakerIdx];
            const xStart = 126;
            const tIdx = shot.tracklets.findIndex((t) => t.id === b.trackletId);
            const xEnd = 96 + 40 + tIdx * 80;
            return <line key={i} x1={xStart} y1={10} x2={xEnd} y2={2} stroke={color} strokeWidth={1} opacity={0.6} strokeDasharray="4 3" />;
          })}
        </svg>
      )}

      {/* Speaker lanes */}
      {shot.speakers.map((sIdx) => {
        const turn = shot.turns.find((t) => t.speakerIdx === sIdx);
        const color = SPEAKER_COLORS[sIdx];
        const hasVp = shot.voiceprintSuggestion?.speakerIdx === sIdx && !vpAccepted && !vpDismissed;
        return (
          <div key={sIdx}>
            <div style={{ height: 32, display: "flex", alignItems: "center", padding: "0 16px", background: "var(--color-bg)", borderBottom: "1px solid var(--color-border-subtle)" }}>
              <div style={{ width: 80, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 12, color: "var(--color-text-secondary)" }}>
                  {vpAccepted && sIdx === shot.voiceprintSuggestion?.speakerIdx ? shot.voiceprintSuggestion.name.split(" — ")[0] : `Speaker_0${sIdx}`}
                </span>
                {hasVp && <Zap size={10} color="var(--color-amber)" />}
              </div>
              <div style={{ flex: 1, position: "relative", height: 20 }}>
                {turn && (
                  <div style={{ position: "absolute", left: `${turn.startPct}%`, width: `${turn.widthPct}%`, height: "100%", background: `${color}66`, borderRadius: 2, cursor: "pointer" }} />
                )}
              </div>
            </div>
            {hasVp && (
              <div style={{ padding: "4px 8px 4px 96px", display: "flex", alignItems: "center", gap: 8, background: "var(--color-bg)", borderBottom: "1px solid var(--color-border-subtle)" }}>
                <Zap size={12} color="var(--color-amber)" />
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-text-secondary)" }}>
                  Likely: {shot.voiceprintSuggestion!.name} ({shot.voiceprintSuggestion!.confidence}%)
                </span>
                <button onClick={() => { setVpAccepted(true); setShowRegistry(true); }} style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 11, color: "var(--color-green)", background: "none", border: "none", cursor: "pointer" }}>Accept</button>
                <button onClick={() => setVpDismissed(true)} style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 11, color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-rose)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                >Reject</button>
              </div>
            )}
            {showRegistry && sIdx === shot.voiceprintSuggestion?.speakerIdx && (
              <div style={{ padding: "6px 8px 6px 96px", display: "flex", alignItems: "center", gap: 8, background: "var(--color-surface-1)", borderBottom: "1px solid var(--color-border-subtle)" }}>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-text-secondary)" }}>
                  Save '{shot.voiceprintSuggestion!.name}' to your voiceprint registry?
                </span>
                <button onClick={() => setShowRegistry(false)} style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 11, padding: "3px 8px", borderRadius: 4, background: "var(--color-violet)", color: "#0A0909", border: "none", cursor: "pointer" }}>Save to registry</button>
                <button onClick={() => setShowRegistry(false)} style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 11, color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer" }}>This run only</button>
              </div>
            )}
          </div>
        );
      })}

      {/* Conflict */}
      {shot.conflict && (
        <div style={{ padding: "6px 16px", display: "flex", alignItems: "center", gap: 8, background: "var(--color-rose-muted)", borderLeft: "3px solid var(--color-rose)" }}>
          <TriangleAlert size={14} color="var(--color-rose)" />
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 13, color: "var(--color-rose)" }}>
            Conflict: Speaker_0{shot.conflict.speaker0} and Speaker_0{shot.conflict.speaker1} both assigned to {shot.conflict.tracklet} at {shot.conflict.time}
          </span>
        </div>
      )}

      {/* Transcript lane */}
      <div style={{ minHeight: 36, padding: "8px 16px 8px 96px", background: "var(--color-surface-1)", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", flexWrap: "wrap", gap: 2, alignContent: "flex-start" }}>
        {shot.transcript.map((word, i) => (
          <span
            key={i}
            style={{ padding: "1px 3px", borderRadius: 2, fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-secondary)", cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-surface-3)"; e.currentTarget.style.color = "var(--color-text-primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Shot Lane Editor ── */
function ShotLaneEditor() {
  return (
    <>
      <InlineVideoPlayer />
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", background: "var(--color-bg)" }}>
        {SHOTS.map((s) => <ShotSection key={s.idx} shot={s} />)}
      </div>
    </>
  );
}

export default function RunGrounding() {
  const { id, clipId } = useParams();
  const [activeClip, setActiveClip] = useState(clipId ?? "001");
  const current = QUEUE.find((c) => c.id === activeClip) ?? QUEUE[0];
  const isComplete = current.status === "complete";

  return (
    <div className="flex flex-col" style={{ height: "100vh" }}>
      {/* ── Header bar ── */}
      <div style={{ height: 56, flexShrink: 0, background: "var(--color-surface-1)", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", padding: "0 20px", justifyContent: "space-between" }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            to={`/runs/${id ?? "demo"}/clips`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            ← Clip Candidates
          </Link>
          <span style={{ width: 1, height: 16, background: "var(--color-border)" }} />
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>Lex ep. 412 — Sam Altman</span>
          <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>›</span>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 14, color: "var(--color-text-secondary)" }}>Grounding</span>
        </div>

        {/* Center */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>Clip {current.id}</span>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 14, color: "var(--color-text-muted)" }}>·  {current.timeStart} → {current.timeEnd}  ·  {current.duration}</span>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {[{ label: `Speakers ${current.speakers ?? "0/0"}`, done: current.speakers?.startsWith(current.speakers?.split("/")[1] ?? "") }, { label: `Camera ${current.camera ?? "0/0"}`, done: current.camera?.startsWith(current.camera?.split("/")[1] ?? "") }].map((p) => (
              <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.done ? "var(--color-green)" : "var(--color-amber)" }} />
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-text-muted)" }}>{p.label}</span>
              </div>
            ))}
          </div>
          <button style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid var(--color-border)", background: "var(--color-surface-2)", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)", cursor: "pointer" }}>Save</button>
          <button
            disabled={!isComplete}
            style={{
              padding: "6px 14px", borderRadius: 6, border: "none",
              background: isComplete ? "var(--color-violet)" : "var(--color-surface-3)",
              fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 13,
              color: isComplete ? "#0A0909" : "var(--color-text-muted)",
              cursor: isComplete ? "pointer" : "not-allowed",
            }}
          >Done →</button>
        </div>
      </div>

      {/* ── Main work area ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left clip sidebar */}
        <div style={{ width: 220, flexShrink: 0, background: "var(--color-surface-1)", borderRight: "1px solid var(--color-border)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center" }}>
            <span className="label-caps">Grounding queue</span>
            <span style={{ marginLeft: 6, fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>8 clips</span>
          </div>
          {QUEUE.map((clip) => {
            const isActive = clip.id === activeClip;
            const isLocked = clip.status === "locked";
            return (
              <div
                key={clip.id}
                onClick={() => !isLocked && setActiveClip(clip.id)}
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  cursor: isLocked ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: isActive ? "var(--color-surface-2)" : "transparent",
                  borderLeft: isActive ? "3px solid var(--color-violet)" : "3px solid transparent",
                  transition: "background 100ms",
                }}
                onMouseEnter={(e) => { if (!isActive && !isLocked) e.currentTarget.style.background = "var(--color-surface-2)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <StatusIcon status={clip.status} />
                <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>{clip.label}</span>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>{clip.timeStart} → {clip.timeEnd}  ·  {clip.duration}</span>
                  {isActive && clip.speakers && (
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 11, color: "var(--color-text-muted)" }}>
                      Speakers: {clip.speakers}  ·  Camera: {clip.camera}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center + right */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Center column */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ShotLaneEditor />
            {/* Bottom camera intent placeholder */}
            <div style={{ height: 200, flexShrink: 0, background: "var(--color-surface-1)", borderTop: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 14, color: "var(--color-text-muted)" }}>
                Camera intent panel loads here — coming in next prompt
              </span>
            </div>
          </div>

          {/* Right details placeholder */}
          <div style={{ width: 360, flexShrink: 0, background: "var(--color-surface-1)", borderLeft: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 14, color: "var(--color-text-muted)" }}>
              Details panel loads here
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
