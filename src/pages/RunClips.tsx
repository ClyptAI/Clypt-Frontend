import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import RunContextBar from "@/components/app/RunContextBar";
import { Bookmark, X, ChevronRight, RotateCcw, Loader2 } from "lucide-react";
import { useClipList, useApproveClip, useRejectClip } from "@/hooks/api/useClips";
import { useNodeList } from "@/hooks/api/useNodes";
import { useRunDetail } from "@/hooks/api/useRuns";
import { useClipStore } from "@/stores/clip-store";
import { ClipBoundaryEditor } from "@/components/app/ClipBoundaryEditor";
import type { ClipCandidate, NodeType } from "@/types/clypt";

/* ── Colors ── */
const NODE_TYPE_COLORS: Record<string, string> = {
  claim: "#A78BFA", explanation: "#60A5FA", example: "#2DD4BF", anecdote: "#FBB249",
  reaction_beat: "#FB7185", qa_exchange: "#4ADE80", challenge_exchange: "#FB923C",
  setup_payoff: "#E879F9", reveal: "#FACC15", transition: "#71717A",
};

/* ── View model shape ── */
// Internal shape the list/detail components consume. We adapt ClipCandidate ->
// ClipData in one spot so the UI doesn't have to know about the wire format.
interface ClipData {
  id: string;
  rank: number;
  score: number;
  startMs: number;
  endMs: number;
  timeStart: string;
  timeEnd: string;
  duration: string;
  nodeTypes: string[];
  source: string;
  queryAligned: boolean;
  pinned: boolean;
  scores: { label: string; value: number }[];
  rationale: string;
  seedNode: string;
  subgraph: string;
  subgraphNodes: number;
}

/* ── Helpers ── */
function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function adaptApiClip(
  c: ClipCandidate,
  idx: number,
  nodeTypeByNodeId: Record<string, NodeType>,
): ClipData {
  const startSec = c.start_ms / 1000;
  const endSec = c.end_ms / 1000;
  const durationSec = Math.round(endSec - startSec);
  // Derive chip labels from the actual nodes the clip spans. Dedupe while
  // preserving order so the first-seen type shows up leftmost.
  const seen = new Set<string>();
  const nodeTypes: string[] = [];
  for (const nodeId of c.node_ids) {
    const t = nodeTypeByNodeId[nodeId];
    if (t && !seen.has(t)) {
      seen.add(t);
      nodeTypes.push(t);
    }
  }
  return {
    id: c.clip_id ?? `clip-${idx}`,
    rank: c.pool_rank ?? idx + 1,
    score: c.score,
    startMs: c.start_ms,
    endMs: c.end_ms,
    timeStart: fmtTime(startSec),
    timeEnd: fmtTime(endSec),
    duration: `${durationSec}s`,
    nodeTypes,
    source: c.source_prompt_ids[0] ?? "unknown",
    queryAligned: c.query_aligned ?? false,
    pinned: false,
    scores: Object.entries(c.score_breakdown ?? {}).map(([label, value]) => ({ label, value })),
    rationale: c.rationale,
    seedNode: c.seed_node_id ?? "—",
    subgraph: c.subgraph_id ?? "—",
    subgraphNodes: c.node_ids.length,
  };
}

/* ── Skeleton card ── */
function ClipCardSkeleton() {
  return (
    <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border-subtle)", borderLeft: "3px solid transparent" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ width: 60, height: 16, borderRadius: 3, background: "var(--color-surface-3)" }} />
        <div style={{ width: 120, height: 12, borderRadius: 3, background: "var(--color-surface-3)" }} />
        <div style={{ display: "flex", gap: 4 }}>
          <div style={{ width: 60, height: 18, borderRadius: 3, background: "var(--color-surface-3)" }} />
          <div style={{ width: 80, height: 18, borderRadius: 3, background: "var(--color-surface-3)" }} />
        </div>
      </div>
    </div>
  );
}

function TypeChip({ type, small }: { type: string; small?: boolean }) {
  const color = NODE_TYPE_COLORS[type] ?? "#71717A";
  return (
    <span style={{ background: `${color}1f`, border: `1px solid ${color}4d`, fontFamily: "'Geist Mono', monospace", fontSize: small ? 9 : 10, color, padding: small ? "1px 5px" : "2px 6px", borderRadius: 3 }}>
      {type}
    </span>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ width: 160, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13, color: "var(--color-text-secondary)", flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 5, background: "var(--color-surface-3)", borderRadius: 3, overflow: "hidden" }}>
        {value > 0 && <div style={{ width: `${(value / 10) * 100}%`, height: "100%", background: "var(--color-violet)", borderRadius: 3 }} />}
      </div>
      <span style={{ width: 30, textAlign: "right", fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>
        {value > 0 ? value.toFixed(1) : "—"}
      </span>
    </div>
  );
}

/* ── Clip Card ── */
function ClipCard({ clip, selected, onSelect, onPin, onReject }: { clip: ClipData; selected: boolean; onSelect: () => void; onPin: () => void; onReject: () => void }) {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: "14px 16px",
        borderBottom: "1px solid var(--color-border-subtle)",
        cursor: "pointer",
        background: selected ? "var(--color-surface-2)" : "transparent",
        borderLeft: selected ? "3px solid var(--color-violet)" : "3px solid transparent",
        transition: "background 100ms",
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = "var(--color-surface-1)"; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>#{clip.rank}</span>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 16, fontWeight: 500, color: "var(--color-text-primary)" }}>{clip.score.toFixed(1)}</span>
          </div>
          <div style={{ width: 80, height: 3, background: "var(--color-surface-3)", borderRadius: 2 }}>
            <div style={{ width: (clip.score / 10) * 80, height: "100%", background: "var(--color-violet)", borderRadius: 2 }} />
          </div>
        </div>
        {clip.queryAligned && (
          <span style={{ background: "var(--color-amber-muted)", border: "1px solid rgba(251,178,73,0.3)", color: "var(--color-amber)", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 10, padding: "2px 6px", borderRadius: 4 }}>Query match</span>
        )}
      </div>

      {/* Timestamps */}
      <div style={{ marginTop: 6, fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>
        {clip.timeStart} → {clip.timeEnd}  ·  {clip.duration}
      </div>

      {/* Node types */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
        {clip.nodeTypes.map((t) => <TypeChip key={t} type={t} small />)}
      </div>

      {/* Source */}
      <div style={{ marginTop: 6 }}>
        <span style={{ background: "var(--color-surface-2)", fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "var(--color-text-muted)", padding: "2px 6px", borderRadius: 3 }}>{clip.source}</span>
      </div>

      {/* Bottom row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <button onClick={(e) => { e.stopPropagation(); onPin(); }} style={{ background: "none", border: "none", cursor: "pointer", color: clip.pinned ? "var(--color-violet)" : "var(--color-text-muted)", display: "flex", padding: 2 }}>
          <Bookmark size={14} fill={clip.pinned ? "currentColor" : "none"} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onReject(); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "flex", padding: 2 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-rose)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Detail Panel ── */
function ClipDetail({ clip, onPin, onReject, onApprove, approving, onBoundaryChange }: { clip: ClipData; onPin: () => void; onReject: () => void; onApprove: () => void; approving: boolean; onBoundaryChange: (clipId: string, startMs: number, endMs: number) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 22, color: "var(--color-text-primary)" }}>Clip {clip.id}</span>
            <span className="label-caps">Rank #{clip.rank}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onPin} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, border: "1px solid var(--color-border)", background: "var(--color-surface-2)", color: "var(--color-text-primary)", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13, cursor: "pointer" }}>
              <Bookmark size={14} fill={clip.pinned ? "currentColor" : "none"} /> Pin
            </button>
            <button
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, border: "1px solid var(--color-border)", background: "var(--color-surface-2)", color: "var(--color-text-primary)", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13, cursor: "pointer" }}
              onClick={onReject}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-rose)"; e.currentTarget.style.color = "var(--color-rose)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text-primary)"; }}
            >
              <X size={14} /> Reject
            </button>
          </div>
        </div>

        {/* Score */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 36, color: "var(--color-text-primary)" }}>{clip.score.toFixed(1)}</span>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 18, color: "var(--color-text-muted)" }}>/ 10</span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 13, color: "var(--color-text-muted)", alignSelf: "center" }}>Overall score</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {clip.scores.map((s) => <ScoreBar key={s.label} label={s.label} value={s.value} />)}
          </div>
        </div>

        {/* Rationale */}
        <div>
          <span className="label-caps" style={{ display: "block", marginBottom: 8 }}>Rationale</span>
          <div style={{ borderLeft: "3px solid var(--color-border)", paddingLeft: 14 }}>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 15, color: "var(--color-text-primary)", fontStyle: "italic", margin: 0, lineHeight: 1.6 }}>
              {clip.rationale}
            </p>
          </div>
        </div>

        {/* Source trace */}
        <div>
          <span className="label-caps" style={{ display: "block", marginBottom: 8 }}>Source trace</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 24px" }}>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>Seeded by <span style={{ color: "var(--color-text-primary)" }}>{clip.source}</span></span>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>Subgraph <span style={{ color: "var(--color-text-primary)" }}>{clip.subgraph} · {clip.subgraphNodes} nodes</span></span>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>Seed node <span style={{ color: "var(--color-text-primary)" }}>{clip.seedNode}</span></span>
          </div>
          <button style={{ marginTop: 6, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: 13, color: "var(--color-violet)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >View subgraph in Cortex Graph →</button>
        </div>

        {/* Node composition */}
        <div>
          <span className="label-caps" style={{ display: "block", marginBottom: 8 }}>Node composition</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {clip.nodeTypes.map((t, i) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {i > 0 && <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>→</span>}
                <TypeChip type={t} />
              </div>
            ))}
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-text-muted)", marginTop: 6, display: "block" }}>
            Clip spans {clip.nodeTypes.length} nodes · {clip.duration} total
          </span>
        </div>

        {/* Clip boundaries — basic editor with video preview + drag handles */}
        <div>
          <span className="label-caps" style={{ display: "block", marginBottom: 8 }}>Clip boundaries</span>
          <ClipBoundaryEditor
            // key forces a fresh editor per clip selection so internal seed state resets
            key={clip.id}
            initialStartMs={clip.startMs}
            initialEndMs={clip.endMs}
            onBoundaryChange={(s, e) => onBoundaryChange(clip.id, s, e)}
          />
        </div>

        {/* Similar clips */}
        <div>
          <span className="label-caps" style={{ display: "block", marginBottom: 8 }}>Similar clips in this run</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[{ rank: 3, score: 7.9, time: "1:50 → 2:31", overlap: "70%" }, { rank: 5, score: 7.3, time: "8:05 → 8:44", overlap: "45%" }].map((s) => (
              <div key={s.rank} style={{ display: "flex", alignItems: "center", gap: 12, padding: 8, background: "var(--color-surface-1)", borderRadius: 6 }}>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>#{s.rank}</span>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-primary)" }}>{s.score.toFixed(1)}</span>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>{s.time}</span>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-text-muted)" }}>{s.overlap} node overlap</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{ padding: "20px 32px", borderTop: "1px solid var(--color-border-subtle)", background: "var(--color-bg)", flexShrink: 0 }}>
        <button
          disabled={approving}
          onClick={onApprove}
          style={{ width: "100%", height: 44, background: "var(--color-violet)", color: "#0A0909", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 15, border: "none", borderRadius: 6, cursor: approving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: approving ? 0.7 : 1 }}
        >
          {approving ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Adding…</> : "Add to grounding queue →"}
        </button>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function RunClips() {
  const { id } = useParams();
  const runId = id ?? "demo";

  const { data: apiClips, isLoading } = useClipList(runId);
  const { data: runDetail } = useRunDetail(runId);
  const { data: apiNodes } = useNodeList(runId);
  const { approveClip, rejectClip, resetApproval, setActiveClipId } = useClipStore();
  const approveMutation = useApproveClip(runId);
  const rejectMutation = useRejectClip(runId);

  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string>("");
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [rejectedOpen, setRejectedOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"score" | "duration" | "earliest">("score");
  const [sortOpen, setSortOpen] = useState(false);
  // User-edited clip boundaries keyed by clip id. An empty map means "use the
  // values from the wire response" — we only write here when the user has
  // actually dragged something in the ClipBoundaryEditor.
  const [boundaryOverrides, setBoundaryOverrides] = useState<
    Record<string, { startMs: number; endMs: number }>
  >({});

  // Lookup table so adaptApiClip can turn node_ids into chip labels.
  const nodeTypeByNodeId: Record<string, NodeType> = {};
  for (const n of apiNodes ?? []) nodeTypeByNodeId[n.node_id] = n.node_type;

  const baseClips = (apiClips ?? []).map((c, i) => adaptApiClip(c, i, nodeTypeByNodeId));
  const clips = baseClips.map((c) => {
    const override = boundaryOverrides[c.id];
    if (!override) return { ...c, pinned: pinnedIds.has(c.id) };
    // Re-derive the human-readable timecodes and duration from the user's
    // edited range so the list + detail panel stay consistent.
    const startSec = override.startMs / 1000;
    const endSec = override.endMs / 1000;
    return {
      ...c,
      pinned: pinnedIds.has(c.id),
      startMs: override.startMs,
      endMs: override.endMs,
      timeStart: fmtTime(startSec),
      timeEnd: fmtTime(endSec),
      duration: `${Math.max(0, Math.round(endSec - startSec))}s`,
    };
  });

  // Once clips load, lock selection to the first non-rejected clip. Also
  // self-heal if the currently-selected clip disappears (e.g. after a refetch
  // removed it) — fall back to the first available.
  useEffect(() => {
    if (clips.length === 0) return;
    const stillValid = clips.some((c) => c.id === selectedId && !rejectedIds.has(c.id));
    if (!stillValid) {
      const firstActive = clips.find((c) => !rejectedIds.has(c.id));
      if (firstActive) setSelectedId(firstActive.id);
    }
  }, [clips, rejectedIds, selectedId]);

  const activeClips = clips.filter((c) => !rejectedIds.has(c.id));
  const rejectedClips = clips.filter((c) => rejectedIds.has(c.id));
  const selected = clips.find((c) => c.id === selectedId) ?? activeClips[0];

  const togglePin = (cid: string) => setPinnedIds((s) => {
    const n = new Set(s);
    n.has(cid) ? n.delete(cid) : n.add(cid);
    return n;
  });

  const reject = (cid: string) => {
    setRejectedIds((s) => { const n = new Set(s); n.add(cid); return n; });
    if (selectedId === cid) setSelectedId(activeClips.find((c) => c.id !== cid)?.id ?? activeClips[0]?.id ?? "");
    rejectClip(cid);
    rejectMutation.mutate(cid, { onError: () => toast.error("Failed to reject clip") });
  };

  const restore = (cid: string) => {
    setRejectedIds((s) => { const n = new Set(s); n.delete(cid); return n; });
    resetApproval(cid);
  };

  const handleSelect = (cid: string) => {
    setSelectedId(cid);
    setActiveClipId(cid);
  };

  const handleApprove = (cid: string) => {
    approveClip(cid);
    approveMutation.mutate(cid, {
      onSuccess: () => toast.success('Added to grounding queue'),
      onError: () => toast.error('Failed to approve clip'),
    });
  };

  const handleBoundaryChange = (cid: string, startMs: number, endMs: number) => {
    setBoundaryOverrides((prev) => ({ ...prev, [cid]: { startMs, endMs } }));
  };

  // Find the live phase for the header — prefer running, then first pending,
  // fall back to the last phase so a completed run shows "Complete".
  const runningPhase = runDetail?.phases.find((p) => p.status === "running");
  const pendingPhase = runDetail?.phases.find((p) => p.status === "pending");
  const lastPhase = runDetail?.phases[runDetail.phases.length - 1];
  const headerPhase = runningPhase ?? pendingPhase ?? lastPhase;
  const completedCount = runDetail?.phases.filter((p) => p.status === "completed").length ?? 0;

  return (
    <div className="flex flex-col" style={{ height: "100vh" }}>
      <RunContextBar
        runId={runId}
        runName={runDetail?.display_name ?? runDetail?.source_url ?? "Run"}
        videoUrl={runDetail?.source_url ?? ""}
        currentPhase={headerPhase?.phase ?? 6}
        completedPhases={completedCount}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left panel */}
        <div style={{ width: 380, flexShrink: 0, borderRight: "1px solid var(--color-border)", overflowY: "auto", background: "var(--color-surface-1)" }}>
          {/* Header */}
          <div style={{ padding: 16, borderBottom: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--color-surface-1)", zIndex: 5 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--color-text-primary)" }}>Clip Candidates</span>
              <span style={{ marginLeft: 8, background: "var(--color-surface-2)", border: "1px solid var(--color-border)", fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)", padding: "2px 7px", borderRadius: 4 }}>{isLoading ? "…" : activeClips.length}</span>
            </div>
            <div style={{ position: "relative" }}>
              <button onClick={() => setSortOpen(!sortOpen)} style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13, color: "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer" }}>
                {sortBy === "score" ? "Score" : sortBy === "duration" ? "Duration" : "Earliest"} ▾
              </button>
              {sortOpen && (
                <div style={{ position: "absolute", top: "100%", right: 0, background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: 6, padding: 4, zIndex: 10, minWidth: 120 }}>
                  {(["score", "duration", "earliest"] as const).map((s) => (
                    <button key={s} onClick={() => { setSortBy(s); setSortOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 10px", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13, color: sortBy === s ? "var(--color-text-primary)" : "var(--color-text-secondary)", background: "none", border: "none", borderRadius: 4, cursor: "pointer" }}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cards or skeleton */}
          {isLoading && !apiClips
            ? Array.from({ length: 5 }).map((_, i) => <ClipCardSkeleton key={i} />)
            : activeClips.map((c) => (
                <ClipCard key={c.id} clip={c} selected={c.id === selectedId} onSelect={() => handleSelect(c.id)} onPin={() => togglePin(c.id)} onReject={() => reject(c.id)} />
              ))
          }

          {/* Rejected */}
          {rejectedClips.length > 0 && (
            <>
              <div onClick={() => setRejectedOpen(!rejectedOpen)} style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <ChevronRight size={14} style={{ color: "var(--color-text-muted)", transform: rejectedOpen ? "rotate(90deg)" : "none", transition: "transform 150ms" }} />
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13, color: "var(--color-text-muted)" }}>Rejected ({rejectedClips.length})</span>
              </div>
              {rejectedOpen && rejectedClips.map((c) => (
                <div key={c.id} style={{ opacity: 0.5, padding: "14px 16px", borderBottom: "1px solid var(--color-border-subtle)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>#{c.rank}</span>
                      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 16, fontWeight: 500, color: "var(--color-text-primary)" }}>{c.score.toFixed(1)}</span>
                    </div>
                    <button onClick={() => restore(c.id)} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: 12, color: "var(--color-violet)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      <RotateCcw size={12} /> Restore
                    </button>
                  </div>
                  <div style={{ marginTop: 4, fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>{c.timeStart} → {c.timeEnd}</div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, overflowY: "hidden", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
          {selected && (
            <ClipDetail
              clip={selected}
              onPin={() => togglePin(selected.id)}
              onReject={() => reject(selected.id)}
              onApprove={() => handleApprove(selected.id)}
              approving={approveMutation.isPending}
              onBoundaryChange={handleBoundaryChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
