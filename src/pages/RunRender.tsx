import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronDown,
  X,
  TriangleAlert,
  Clock,
  Check,
  Play,
  Download,
  LinkIcon,
  Film,
} from "lucide-react";
import { toast } from "sonner";
import RunContextBar from "@/components/app/RunContextBar";

/* ── Types ── */
type IntentType = "Follow" | "Reaction" | "Split" | "Wide" | "Manual" | "NotSet";

interface ShotPlan {
  idx: number;
  time: string;
  intent: IntentType;
  detail: string;
}

interface ClipPlan {
  id: string;
  label: string;
  timeRange: string;
  duration: string;
  rank: number;
  score: number;
  complete: boolean;
  incompleteNote?: string;
  shots: ShotPlan[];
}

/* ── Mock data ── */
const CLIPS: ClipPlan[] = [
  {
    id: "001", label: "Clip 001", timeRange: "0:42 → 1:18", duration: "35s", rank: 1, score: 8.4, complete: true,
    shots: [
      { idx: 1, time: "0:42–0:51", intent: "Follow", detail: "Rithvik — Host" },
      { idx: 2, time: "0:51–1:04", intent: "Reaction", detail: "react on Speaker 1" },
      { idx: 3, time: "1:04–1:11", intent: "Split", detail: "Rithvik / Speaker 1" },
      { idx: 4, time: "1:11–1:18", intent: "Wide", detail: "2 speakers" },
    ],
  },
  {
    id: "002", label: "Clip 002", timeRange: "3:22 → 4:05", duration: "43s", rank: 2, score: 7.9, complete: true,
    shots: [
      { idx: 1, time: "3:22–3:38", intent: "Follow", detail: "Rithvik — Host" },
      { idx: 2, time: "3:38–3:52", intent: "Follow", detail: "Speaker 1" },
      { idx: 3, time: "3:52–4:05", intent: "Wide", detail: "2 speakers" },
    ],
  },
  {
    id: "003", label: "Clip 003", timeRange: "1:50 → 2:31", duration: "41s", rank: 3, score: 7.1, complete: false,
    incompleteNote: "Shot 2 is missing camera intent.",
    shots: [
      { idx: 1, time: "1:50–2:08", intent: "Follow", detail: "Speaker 1" },
      { idx: 2, time: "2:08–2:20", intent: "NotSet", detail: "" },
      { idx: 3, time: "2:20–2:31", intent: "Wide", detail: "2 speakers" },
    ],
  },
];

const INTENT_STYLES: Record<IntentType, { bg: string; color: string; prefix: string }> = {
  Follow:   { bg: "var(--color-violet-muted)", color: "var(--color-violet)", prefix: "Follow" },
  Reaction: { bg: "rgba(251,178,73,0.12)",     color: "var(--color-amber)",  prefix: "Reaction" },
  Split:    { bg: "rgba(34,211,238,0.10)",      color: "var(--color-cyan)",   prefix: "Split" },
  Wide:     { bg: "rgba(74,222,128,0.10)",      color: "var(--color-green)",  prefix: "Wide" },
  Manual:   { bg: "var(--color-surface-3)",      color: "var(--color-text-secondary)", prefix: "Manual crop ✓" },
  NotSet:   { bg: "var(--color-rose-muted)",     color: "var(--color-rose)",   prefix: "Not set" },
};

/* ── Stage A — Review ── */
function ReviewStage({ onRender }: { onRender: () => void }) {
  const { id } = useParams();
  const [clips, setClips] = useState(CLIPS);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "001": true });
  const [captions, setCaptions] = useState<"Off" | "On" | "Auto">("Auto");
  const [captionStyle, setCaptionStyle] = useState("Minimal");
  const [resolution, setResolution] = useState<"720p" | "1080p">("1080p");

  const completeClips = clips.filter((c) => c.complete);
  const incompleteClips = clips.filter((c) => !c.complete);

  const removeClip = (clipId: string) => setClips((prev) => prev.filter((c) => c.id !== clipId));

  const toggle = (clipId: string) => setExpanded((prev) => ({ ...prev, [clipId]: !prev[clipId] }));

  const SegmentedControl = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => (
    <div style={{ display: "flex", gap: 0, border: "1px solid var(--color-border)", borderRadius: 6, overflow: "hidden" }}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            padding: "6px 14px", border: "none", cursor: "pointer",
            fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13,
            background: value === opt ? "var(--color-violet-muted)" : "var(--color-surface-2)",
            color: value === opt ? "var(--color-violet)" : "var(--color-text-muted)",
            borderRight: "1px solid var(--color-border)",
          }}
        >{opt}</button>
      ))}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
          {/* Header */}
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 26, color: "var(--color-text-primary)", margin: 0 }}>Review render plan</h1>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 15, color: "var(--color-text-secondary)", marginTop: 6, marginBottom: 32 }}>
            Confirm the shot-by-shot layout for each clip before rendering.
          </p>

          {/* Clip cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {clips.map((clip) => {
              const isOpen = !!expanded[clip.id];
              return (
                <div key={clip.id} style={{ border: "1px solid var(--color-border)", borderRadius: 8, background: "var(--color-surface-1)", overflow: "hidden" }}>
                  {/* Card header */}
                  <div
                    onClick={() => toggle(clip.id)}
                    style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "background 100ms" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <ChevronDown size={16} style={{ color: "var(--color-text-muted)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms" }} />
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 15, color: "var(--color-text-primary)" }}>{clip.label}</span>
                        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>
                          {clip.timeRange}  ·  {clip.duration}  ·  Rank #{clip.rank}  ·  Score {clip.score}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        padding: "3px 8px", borderRadius: 4,
                        fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 11,
                        background: clip.complete ? "var(--color-green-muted)" : "var(--color-rose-muted)",
                        border: clip.complete ? "1px solid rgba(74,222,128,0.4)" : "1px solid rgba(251,113,133,0.4)",
                        color: clip.complete ? "var(--color-green)" : "var(--color-rose)",
                      }}>
                        {clip.complete ? "Grounding complete ✓" : "Grounding incomplete"}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeClip(clip.id); }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: "var(--color-text-muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-rose)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Card body */}
                  {isOpen && (
                    <div style={{ padding: "16px 20px", borderTop: "1px solid var(--color-border-subtle)", display: "flex", flexDirection: "column", gap: 10 }}>
                      {/* Incomplete warning */}
                      {!clip.complete && clip.incompleteNote && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--color-rose-muted)", borderRadius: 6 }}>
                          <TriangleAlert size={14} style={{ color: "var(--color-rose)", flexShrink: 0 }} />
                          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 13, color: "var(--color-rose)", flex: 1 }}>
                            Grounding incomplete — {clip.incompleteNote}
                          </span>
                          <Link
                            to={`/runs/${id ?? "demo"}/grounding/${clip.id}`}
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: 13, color: "var(--color-rose)", textDecoration: "none" }}
                            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                          >Fix →</Link>
                        </div>
                      )}

                      {/* Shot list */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {clip.shots.map((shot) => {
                          const style = INTENT_STYLES[shot.intent];
                          return (
                            <div key={shot.idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: "var(--color-surface-2)", borderRadius: 6 }}>
                              <div style={{ width: 40, height: 22, borderRadius: 3, background: "var(--color-surface-3)", flexShrink: 0 }} />
                              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)", width: 160, flexShrink: 0 }}>
                                Shot {shot.idx}  ·  {shot.time}
                              </span>
                              <span style={{
                                padding: "3px 8px", borderRadius: 4,
                                fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 11,
                                background: style.bg, color: style.color,
                              }}>
                                {shot.intent === "NotSet" ? "Not set" : `${style.prefix}${shot.detail ? ` · ${shot.detail}` : ""}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bottom links */}
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                        <Link
                          to={`/runs/${id ?? "demo"}/grounding/${clip.id}`}
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                        >← Edit grounding</Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Global render settings */}
          <div style={{ border: "1px solid var(--color-border)", borderRadius: 8, background: "var(--color-surface-1)", padding: 20, marginTop: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 15, color: "var(--color-text-primary)", margin: 0, marginBottom: 4 }}>Render settings</h2>

            {/* Captions */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>Captions</span>
              <SegmentedControl options={["Off", "On", "Auto"]} value={captions} onChange={(v) => setCaptions(v as typeof captions)} />
            </div>

            {/* Caption style */}
            {captions !== "Off" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>Caption style</span>
                <select
                  value={captionStyle}
                  onChange={(e) => setCaptionStyle(e.target.value)}
                  style={{
                    height: 32, background: "var(--color-surface-2)", border: "1px solid var(--color-border)",
                    borderRadius: 4, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13,
                    color: "var(--color-text-primary)", padding: "0 12px", cursor: "pointer", outline: "none",
                  }}
                >
                  <option>Minimal</option>
                  <option>Bold</option>
                  <option>Subtitles</option>
                </select>
              </div>
            )}

            {/* Resolution */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>Resolution</span>
                <SegmentedControl options={["720p", "1080p"]} value={resolution} onChange={(v) => setResolution(v as typeof resolution)} />
              </div>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-text-muted)", margin: "8px 0 0" }}>
                Output is always 9:16 portrait. Resolution refers to the short edge.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky CTA bar */}
      <div style={{ flexShrink: 0, borderTop: "1px solid var(--color-border-subtle)", padding: "16px 24px", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 14, color: "var(--color-text-secondary)" }}>
          {clips.length} clips in queue  ·  {completeClips.length} complete, {incompleteClips.length} incomplete
        </span>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{
            padding: "8px 16px", borderRadius: 6, border: "1px solid var(--color-border)",
            background: "transparent", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13,
            color: "var(--color-text-secondary)", cursor: "pointer",
          }}>Save plan for later</button>
          <button
            disabled={completeClips.length === 0}
            onClick={onRender}
            style={{
              padding: "0 28px", height: 44, borderRadius: 6, border: "none",
              background: completeClips.length > 0 ? "var(--color-violet)" : "var(--color-surface-3)",
              fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 15,
              color: completeClips.length > 0 ? "#0A0909" : "var(--color-text-muted)",
              cursor: completeClips.length > 0 ? "pointer" : "not-allowed",
            }}
            title={completeClips.length === 0 ? "Fix incomplete clips before rendering" : undefined}
          >Render {completeClips.length} clips →</button>
        </div>
      </div>
    </div>
  );
}

/* ── Stage B — Rendering ── */
type RenderStatus = "queued" | "rendering" | "done" | "failed";

interface RenderClip {
  id: string;
  label: string;
  timeRange: string;
  duration: string;
  fileSize: string;
  status: RenderStatus;
  progress?: number;
  progressNote?: string;
  failNote?: string;
}

function RenderStage() {
  const [selectedClip, setSelectedClip] = useState<string | null>("001");

  const [renderClips] = useState<RenderClip[]>([
    { id: "001", label: "Clip 001", timeRange: "0:42 → 1:18", duration: "35s", fileSize: "24.7 MB", status: "done" },
    { id: "002", label: "Clip 002", timeRange: "3:22 → 4:05", duration: "43s", fileSize: "31.2 MB", status: "rendering", progress: 72, progressNote: "Shot 3/4 — Applying follow crop…" },
  ]);

  const anyDone = renderClips.some((c) => c.status === "done");
  const selected = renderClips.find((c) => c.id === selectedClip && c.status === "done");

  const statusIcon = (status: RenderStatus) => {
    switch (status) {
      case "queued": return <Clock size={14} style={{ color: "var(--color-text-muted)" }} />;
      case "rendering": return <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-cyan)", display: "inline-block", animation: "pulse 1.5s infinite" }} />;
      case "done": return <Check size={14} style={{ color: "var(--color-green)" }} />;
      case "failed": return <X size={14} style={{ color: "var(--color-rose)" }} />;
    }
  };

  const GhostBtn = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) => (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 4,
        border: "1px solid var(--color-border)", background: "transparent", cursor: "pointer",
        fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 12, color: "var(--color-text-secondary)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {icon}{label}
    </button>
  );

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Left — render status list */}
      <div style={{ width: 380, flexShrink: 0, borderRight: "1px solid var(--color-border)", background: "var(--color-surface-1)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: 16, borderBottom: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--color-surface-1)", zIndex: 2 }}>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--color-text-primary)" }}>Rendering</span>
          <button
            disabled={!anyDone}
            style={{
              display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 4,
              border: "1px solid var(--color-border)", background: "transparent", cursor: anyDone ? "pointer" : "not-allowed",
              fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 12,
              color: anyDone ? "var(--color-text-secondary)" : "var(--color-text-muted)", opacity: anyDone ? 1 : 0.5,
            }}
          >
            <Download size={14} />Download all
          </button>
        </div>

        {renderClips.map((clip) => (
          <div
            key={clip.id}
            onClick={() => clip.status === "done" && setSelectedClip(clip.id)}
            style={{
              padding: "14px 16px", borderBottom: "1px solid var(--color-border-subtle)",
              display: "flex", flexDirection: "column", gap: 8,
              cursor: clip.status === "done" ? "pointer" : "default",
              background: selectedClip === clip.id ? "var(--color-surface-2)" : "transparent",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {statusIcon(clip.status)}
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>{clip.label}</span>
              </div>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>{clip.duration}</span>
            </div>

            {/* Rendering state */}
            {clip.status === "rendering" && (
              <>
                <div style={{ width: "100%", height: 4, background: "var(--color-surface-3)", borderRadius: 2 }}>
                  <div style={{ width: `${clip.progress ?? 0}%`, height: "100%", background: "var(--color-cyan)", borderRadius: 2, transition: "width 300ms" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-text-secondary)" }}>{clip.progressNote}</span>
                  <button style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-rose)" }}>Cancel</button>
                </div>
              </>
            )}

            {/* Done state */}
            {clip.status === "done" && (
              <div style={{ display: "flex", gap: 8 }}>
                <GhostBtn icon={<Play size={12} />} label="Preview" onClick={() => setSelectedClip(clip.id)} />
                <GhostBtn icon={<Download size={12} />} label="Download" />
                <GhostBtn icon={<LinkIcon size={12} />} label="Copy link" onClick={() => toast.success("Link copied")} />
              </div>
            )}

            {/* Failed state */}
            {clip.status === "failed" && (
              <div>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-rose)" }}>{clip.failNote}</span>
                <button style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: 12, color: "var(--color-violet)", marginLeft: 8 }}>Retry</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right — preview area */}
      <div style={{ flex: 1, background: "var(--color-bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
        {!selected ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Film size={48} style={{ color: "var(--color-surface-3)" }} />
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 15, color: "var(--color-text-muted)" }}>Select a completed clip to preview</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* 9:16 video player */}
            <div style={{ width: 270, height: 480, borderRadius: 8, overflow: "hidden", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <Play size={32} style={{ color: "rgba(255,255,255,0.4)" }} />
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Rendered preview</span>
              </div>
            </div>

            {/* Clip info */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginTop: 16 }}>
              <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 15, color: "var(--color-text-primary)" }}>{selected.label}</span>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>
                {selected.timeRange}  ·  {selected.duration}  ·  {selected.fileSize}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <button style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: 6, border: "none",
                background: "var(--color-violet)", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 14,
                color: "#0A0909", cursor: "pointer",
              }}>
                <Download size={14} />Download
              </button>
              <button style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6,
                border: "1px solid var(--color-border)", background: "transparent",
                fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 14,
                color: "var(--color-text-primary)", cursor: "pointer",
              }}>
                <LinkIcon size={14} />Copy link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Pulse animation ── */
const pulseKeyframes = `
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
`;

/* ── Main page ── */
export default function RunRender() {
  const { id } = useParams();
  const [stage, setStage] = useState<"review" | "rendering">("review");

  return (
    <div className="flex flex-col h-full">
      <style>{pulseKeyframes}</style>
      <RunContextBar
        runId={id ?? "demo"}
        runName="Lex ep. 412 — Sam Altman"
        videoUrl="https://youtube.com/watch?v=example"
        currentPhase={6}
        completedPhases={6}
      />
      {stage === "review" ? (
        <ReviewStage onRender={() => setStage("rendering")} />
      ) : (
        <RenderStage />
      )}
    </div>
  );
}
