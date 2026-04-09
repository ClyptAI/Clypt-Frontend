import { useState, useEffect, useMemo } from "react";
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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import RunContextBar from "@/components/app/RunContextBar";
import { useClipList } from "@/hooks/api/useClips";
import { useRunDetail } from "@/hooks/api/useRuns";
import { useRenderPresets, useRenderStatus, useSubmitRender } from "@/hooks/api/useRender";
import type { ClipCandidate, RenderPreset } from "@/types/clypt";

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

const INTENT_STYLES: Record<IntentType, { bg: string; color: string; prefix: string }> = {
  Follow:   { bg: "var(--color-violet-muted)", color: "var(--color-violet)", prefix: "Follow" },
  Reaction: { bg: "rgba(251,178,73,0.12)",     color: "var(--color-amber)",  prefix: "Reaction" },
  Split:    { bg: "rgba(34,211,238,0.10)",      color: "var(--color-cyan)",   prefix: "Split" },
  Wide:     { bg: "rgba(74,222,128,0.10)",      color: "var(--color-green)",  prefix: "Wide" },
  Manual:   { bg: "var(--color-surface-3)",      color: "var(--color-text-secondary)", prefix: "Manual crop ✓" },
  NotSet:   { bg: "var(--color-rose-muted)",     color: "var(--color-rose)",   prefix: "Not set" },
};

/* ── Helpers ── */
function fmtTimeMs(ms: number): string {
  const s = ms / 1000;
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

function adaptClipToPlan(c: ClipCandidate, idx: number): ClipPlan {
  const durSec = Math.round((c.end_ms - c.start_ms) / 1000);
  return {
    id: c.clip_id ?? `clip-${idx}`,
    label: `Clip ${String(idx + 1).padStart(3, "0")}`,
    timeRange: `${fmtTimeMs(c.start_ms)} → ${fmtTimeMs(c.end_ms)}`,
    duration: `${durSec}s`,
    rank: c.pool_rank ?? idx + 1,
    score: c.score,
    // All demo clips are treated as grounding-complete. The first-real-backend
    // wiring will replace this with an actual check against grounding state.
    complete: true,
    shots: [],
  };
}

/* ── Stage A — Review ── */
interface ReviewStageProps {
  onRender: (submitted: { clipId: string; label: string; timeRange: string; duration: string }[]) => void;
  clips: ClipPlan[];
  clipsLoading: boolean;
  presets: RenderPreset[] | undefined;
  selectedPresetId: string;
  setSelectedPresetId: (id: string) => void;
  runId: string;
  onRemoveClip: (clipId: string) => void;
}

function ReviewStage({
  onRender,
  clips,
  clipsLoading,
  presets,
  selectedPresetId,
  setSelectedPresetId,
  runId,
  onRemoveClip,
}: ReviewStageProps) {
  const submitMutation = useSubmitRender(runId);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [captions, setCaptions] = useState<"Off" | "On" | "Auto">("Auto");
  const [captionStyle, setCaptionStyle] = useState("Minimal");

  // Auto-expand the first card once data lands.
  useEffect(() => {
    if (clips.length > 0 && Object.keys(expanded).length === 0) {
      setExpanded({ [clips[0].id]: true });
    }
  }, [clips, expanded]);

  const completeClips = clips.filter((c) => c.complete);
  const incompleteClips = clips.filter((c) => !c.complete);

  const toggle = (clipId: string) => setExpanded((prev) => ({ ...prev, [clipId]: !prev[clipId] }));

  const handleRender = async () => {
    if (!selectedPresetId || completeClips.length === 0) return;
    try {
      // Fire all submits in parallel so Stage B sees them all queued at once.
      await Promise.all(
        completeClips.map((clip) =>
          submitMutation.mutateAsync({ clipId: clip.id, presetId: selectedPresetId }),
        ),
      );
      onRender(
        completeClips.map((c) => ({
          clipId: c.id,
          label: c.label,
          timeRange: c.timeRange,
          duration: c.duration,
        })),
      );
    } catch {
      toast.error("Render failed to submit — please try again");
    }
  };

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
            {clipsLoading && clips.length === 0 ? (
              [1, 2, 3].map((i) => (
                <div key={i} style={{ border: "1px solid var(--color-border)", borderRadius: 8, background: "var(--color-surface-1)", overflow: "hidden", height: 64, animation: "pulse 1.5s infinite" }}>
                  <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: "var(--color-surface-3)" }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ width: 80, height: 14, borderRadius: 3, background: "var(--color-surface-3)" }} />
                      <div style={{ width: 180, height: 11, borderRadius: 3, background: "var(--color-surface-3)" }} />
                    </div>
                  </div>
                </div>
              ))
            ) : clips.length === 0 ? (
              <div style={{ padding: "32px 20px", border: "1px dashed var(--color-border)", borderRadius: 8, textAlign: "center", color: "var(--color-text-muted)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14 }}>
                No clips approved for this run yet. Approve clips first on the Clips page.
              </div>
            ) : (
              clips.map((clip) => {
                const isOpen = !!expanded[clip.id];
                return (
                  <div key={clip.id} style={{ border: "1px solid var(--color-border)", borderRadius: 8, background: "var(--color-surface-1)", overflow: "hidden" }}>
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
                            {clip.timeRange}  ·  {clip.duration}  ·  Rank #{clip.rank}  ·  Score {clip.score.toFixed(1)}
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
                          onClick={(e) => { e.stopPropagation(); onRemoveClip(clip.id); }}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: "var(--color-text-muted)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-rose)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--color-border-subtle)", display: "flex", flexDirection: "column", gap: 10 }}>
                        {!clip.complete && clip.incompleteNote && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--color-rose-muted)", borderRadius: 6 }}>
                            <TriangleAlert size={14} style={{ color: "var(--color-rose)", flexShrink: 0 }} />
                            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 13, color: "var(--color-rose)", flex: 1 }}>
                              Grounding incomplete — {clip.incompleteNote}
                            </span>
                            <Link
                              to={`/runs/${runId}/grounding/${clip.id}`}
                              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: 13, color: "var(--color-rose)", textDecoration: "none" }}
                            >Fix →</Link>
                          </div>
                        )}

                        {clip.shots.length > 0 ? (
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
                        ) : (
                          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 13, color: "var(--color-text-muted)", margin: 0 }}>
                            Shot grounding not yet available — clip will render with auto-crop.
                          </p>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                          <Link
                            to={`/runs/${runId}/grounding/${clip.id}`}
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}
                          >← Edit grounding</Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Global render settings */}
          <div style={{ border: "1px solid var(--color-border)", borderRadius: 8, background: "var(--color-surface-1)", padding: 20, marginTop: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 15, color: "var(--color-text-primary)", margin: 0, marginBottom: 4 }}>Render settings</h2>

            {/* Preset picker */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>Preset</span>
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                style={{
                  height: 32, background: "var(--color-surface-2)", border: "1px solid var(--color-border)",
                  borderRadius: 4, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13,
                  color: "var(--color-text-primary)", padding: "0 12px", cursor: "pointer", outline: "none",
                  minWidth: 220,
                }}
              >
                {(presets ?? []).map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

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
            disabled={completeClips.length === 0 || submitMutation.isPending || !selectedPresetId}
            onClick={handleRender}
            style={{
              padding: "0 28px", height: 44, borderRadius: 6, border: "none",
              background: completeClips.length > 0 ? "var(--color-violet)" : "var(--color-surface-3)",
              fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 15,
              color: completeClips.length > 0 ? "#0A0909" : "var(--color-text-muted)",
              cursor: completeClips.length > 0 && !submitMutation.isPending ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", gap: 8,
            }}
            title={completeClips.length === 0 ? "Fix incomplete clips before rendering" : undefined}
          >
            {submitMutation.isPending && <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />}
            Render {completeClips.length} clips →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Stage B — Rendering ── */
interface SubmittedClip {
  clipId: string;
  label: string;
  timeRange: string;
  duration: string;
}

interface RenderStageProps {
  runId: string;
  submittedClips: SubmittedClip[];
  onBack: () => void;
}

function RenderStage({ runId, submittedClips, onBack }: RenderStageProps) {
  const [selectedClipId, setSelectedClipId] = useState<string | null>(
    submittedClips[0]?.clipId ?? null,
  );

  // Kick selection to the first completed clip once something finishes, so
  // the preview panel isn't stuck on a still-rendering item.
  const firstSubmittedId = submittedClips[0]?.clipId ?? null;
  useEffect(() => {
    if (!selectedClipId && firstSubmittedId) setSelectedClipId(firstSubmittedId);
  }, [selectedClipId, firstSubmittedId]);

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Left — render status list */}
      <div style={{ width: 380, flexShrink: 0, borderRight: "1px solid var(--color-border)", background: "var(--color-surface-1)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: 16, borderBottom: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--color-surface-1)", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={onBack}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13 }}
            >
              ← Back
            </button>
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--color-text-primary)" }}>Rendering</span>
          </div>
        </div>

        {submittedClips.map((clip) => (
          <RenderClipRow
            key={clip.clipId}
            runId={runId}
            clip={clip}
            selected={selectedClipId === clip.clipId}
            onSelect={() => setSelectedClipId(clip.clipId)}
          />
        ))}
      </div>

      {/* Right — preview area (Stage C) */}
      <RenderPreviewPanel
        runId={runId}
        clip={submittedClips.find((c) => c.clipId === selectedClipId) ?? null}
      />
    </div>
  );
}

/* ── Stage B row — single clip's render status (polls its own query) ── */
interface RenderClipRowProps {
  runId: string;
  clip: SubmittedClip;
  selected: boolean;
  onSelect: () => void;
}

function RenderClipRow({ runId, clip, selected, onSelect }: RenderClipRowProps) {
  const { data: job } = useRenderStatus(runId, clip.clipId, true);
  const status = job?.status ?? "queued";
  const pct = job?.progress_pct ?? 0;
  const isDone = status === "completed";
  const isFailed = status === "failed";

  const statusIcon = () => {
    switch (status) {
      case "queued": return <Clock size={14} style={{ color: "var(--color-text-muted)" }} />;
      case "rendering": return <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-cyan)", display: "inline-block", animation: "pulse 1.5s infinite" }} />;
      case "completed": return <Check size={14} style={{ color: "var(--color-green)" }} />;
      case "failed": return <X size={14} style={{ color: "var(--color-rose)" }} />;
    }
  };

  const handleCopyLink = () => {
    if (job?.output_url) {
      navigator.clipboard.writeText(new URL(job.output_url, window.location.origin).href);
      toast.success("Link copied");
    }
  };

  return (
    <div
      onClick={() => isDone && onSelect()}
      style={{
        padding: "14px 16px", borderBottom: "1px solid var(--color-border-subtle)",
        display: "flex", flexDirection: "column", gap: 8,
        cursor: isDone ? "pointer" : "default",
        background: selected ? "var(--color-surface-2)" : "transparent",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {statusIcon()}
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>{clip.label}</span>
        </div>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>{clip.duration}</span>
      </div>

      {(status === "queued" || status === "rendering") && (
        <>
          <div style={{ width: "100%", height: 4, background: "var(--color-surface-3)", borderRadius: 2 }}>
            <div style={{ width: `${pct}%`, height: "100%", background: "var(--color-cyan)", borderRadius: 2, transition: "width 300ms" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-text-secondary)" }}>
              {status === "queued" ? "Queued…" : `Rendering · ${pct}%`}
            </span>
          </div>
        </>
      )}

      {isDone && job?.output_url && (
        <div style={{ display: "flex", gap: 8 }}>
          <a
            href={job.output_url}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            style={{
              display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 4,
              border: "1px solid var(--color-border)", background: "transparent",
              fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 12, color: "var(--color-text-secondary)",
              textDecoration: "none",
            }}
          >
            <Play size={12} />Preview
          </a>
          <a
            href={job.output_url}
            download
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 4,
              border: "1px solid var(--color-border)", background: "transparent",
              fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 12, color: "var(--color-text-secondary)",
              textDecoration: "none",
            }}
          >
            <Download size={12} />Download
          </a>
          <button
            onClick={(e) => { e.stopPropagation(); handleCopyLink(); }}
            style={{
              display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 4,
              border: "1px solid var(--color-border)", background: "transparent", cursor: "pointer",
              fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 12, color: "var(--color-text-secondary)",
            }}
          >
            <LinkIcon size={12} />Copy link
          </button>
        </div>
      )}

      {isFailed && (
        <div>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-rose)" }}>
            {job?.error ?? "Render failed"}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Stage C — preview panel ── */
function RenderPreviewPanel({ runId, clip }: { runId: string; clip: SubmittedClip | null }) {
  const { data: job } = useRenderStatus(runId, clip?.clipId ?? "", !!clip);

  if (!clip) {
    return (
      <div style={{ flex: 1, background: "var(--color-bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <Film size={48} style={{ color: "var(--color-surface-3)" }} />
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 15, color: "var(--color-text-muted)", marginTop: 12 }}>
          Select a completed clip to preview
        </span>
      </div>
    );
  }

  const isDone = job?.status === "completed" && !!job.output_url;

  return (
    <div style={{ flex: 1, background: "var(--color-bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* 9:16 video player */}
        <div style={{ width: 270, height: 480, borderRadius: 8, overflow: "hidden", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isDone && job?.output_url ? (
            <video
              src={job.output_url}
              controls
              autoPlay
              loop
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Loader2 size={28} style={{ color: "rgba(255,255,255,0.4)", animation: "spin 1s linear infinite" }} />
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                {job?.status === "queued" ? "Queued…" : `Rendering · ${job?.progress_pct ?? 0}%`}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginTop: 16 }}>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 15, color: "var(--color-text-primary)" }}>{clip.label}</span>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>
            {clip.timeRange}  ·  {clip.duration}
          </span>
        </div>

        {isDone && job?.output_url && (
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <a
              href={job.output_url}
              download
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: 6, border: "none",
                background: "var(--color-violet)", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 14,
                color: "#0A0909", cursor: "pointer", textDecoration: "none",
              }}
            >
              <Download size={14} />Download
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(new URL(job.output_url!, window.location.origin).href);
                toast.success("Link copied");
              }}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6,
                border: "1px solid var(--color-border)", background: "transparent",
                fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 14,
                color: "var(--color-text-primary)", cursor: "pointer",
              }}
            >
              <LinkIcon size={14} />Copy link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Keyframes ── */
const animationKeyframes = `
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

/* ── Main page ── */
export default function RunRender() {
  const { id } = useParams();
  const runId = id ?? "demo";
  const [stage, setStage] = useState<"review" | "rendering">("review");
  const [submittedClips, setSubmittedClips] = useState<SubmittedClip[]>([]);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");

  const { data: runDetail } = useRunDetail(runId);
  const { data: apiClips, isLoading: clipsLoading } = useClipList(runId);
  const { data: presets } = useRenderPresets();

  // Default the preset to the first one the API returns.
  useEffect(() => {
    if (!selectedPresetId && presets && presets.length > 0) {
      setSelectedPresetId(presets[0].id);
    }
  }, [presets, selectedPresetId]);

  // Convert the wire format to the UI plan shape, filtered by user removals.
  const clipPlans: ClipPlan[] = useMemo(() => {
    if (!apiClips) return [];
    return apiClips
      .map((c, i) => adaptClipToPlan(c, i))
      .filter((c) => !removedIds.has(c.id));
  }, [apiClips, removedIds]);

  const headerPhase = runDetail?.phases.find((p) => p.status === "running")
    ?? runDetail?.phases[runDetail.phases.length - 1];
  const completedCount = runDetail?.phases.filter((p) => p.status === "completed").length ?? 0;

  return (
    <div className="flex flex-col h-full">
      <style>{animationKeyframes}</style>
      <RunContextBar
        runId={runId}
        runName={runDetail?.display_name ?? runDetail?.source_url ?? "Run"}
        videoUrl={runDetail?.source_url ?? ""}
        currentPhase={headerPhase?.phase ?? 6}
        completedPhases={completedCount}
      />
      {stage === "review" ? (
        <ReviewStage
          onRender={(submitted) => {
            setSubmittedClips(submitted);
            setStage("rendering");
          }}
          clips={clipPlans}
          clipsLoading={clipsLoading}
          presets={presets}
          selectedPresetId={selectedPresetId}
          setSelectedPresetId={setSelectedPresetId}
          runId={runId}
          onRemoveClip={(clipId) => setRemovedIds((prev) => new Set(prev).add(clipId))}
        />
      ) : (
        <RenderStage
          runId={runId}
          submittedClips={submittedClips}
          onBack={() => setStage("review")}
        />
      )}
    </div>
  );
}
