import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Check, X, AlertTriangle, Play, ChevronRight } from "lucide-react";
import RunContextBar from "@/components/app/RunContextBar";
import { useRunDetail } from "@/hooks/api/useRuns";
import { useRunStore } from "@/stores/run-store";
import { useRunSSE } from "@/hooks/useRunSSE";
import type { RunDetail, PhaseStatusEntry } from "@/types/clypt";

/* ─── phase data ─── */
type PhaseStatus = "completed" | "running" | "pending" | "needs-action" | "failed";

interface Phase {
  name: string;
  status: PhaseStatus;
  elapsed?: string;
  summary: string;
  artifacts?: string[];
}

const MOCK_PHASES: Phase[] = [
  { name: "Timeline Foundation", status: "completed", elapsed: "1m 23s", summary: "248 speaker turns · 42 shots · 12 audio events", artifacts: ["timeline.json", "shots.json", "audio_events.json"] },
  { name: "Node Construction", status: "completed", elapsed: "3m 07s", summary: "61 semantic nodes constructed", artifacts: ["nodes.json", "node_embeddings.bin"] },
  { name: "Graph Construction", status: "running", summary: "187 edges — 142 structural, 45 rhetorical" },
  { name: "Candidate Retrieval", status: "pending", summary: "Pending…" },
  { name: "Participation Grounding", status: "pending", summary: "Awaiting speaker grounding" },
  { name: "Render Planning", status: "pending", summary: "—" },
];

/* ─── helpers ─── */
function mapApiStatus(apiStatus: PhaseStatusEntry["status"]): PhaseStatus {
  if (apiStatus === "needs_action") return "needs-action";
  return apiStatus;
}

function formatElapsed(elapsed_s: number | null): string | undefined {
  if (elapsed_s == null) return undefined;
  if (elapsed_s < 60) return `${Math.round(elapsed_s)}s`;
  const m = Math.floor(elapsed_s / 60);
  const s = Math.round(elapsed_s % 60);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function mapApiPhaseToLocal(entry: PhaseStatusEntry): Phase {
  return {
    name: entry.name,
    status: mapApiStatus(entry.status),
    elapsed: formatElapsed(entry.elapsed_s),
    summary: entry.summary ?? (entry.status === "pending" ? "Pending…" : "—"),
    artifacts: entry.artifact_keys.length > 0 ? entry.artifact_keys : undefined,
  };
}

function formatSourceUrl(url: string): string {
  try {
    const u = new URL(url);
    const raw = u.hostname.replace(/^www\./, "") + u.pathname + (u.search ? u.search.slice(0, 12) + "…" : "");
    return raw.length > 32 ? raw.slice(0, 30) + "…" : raw;
  } catch {
    return url.length > 32 ? url.slice(0, 30) + "…" : url;
  }
}

/* ─── phase dot ─── */
function PhaseDot({ status }: { status: PhaseStatus }) {
  const base = "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 relative";

  if (status === "completed")
    return <div className={base} style={{ background: "var(--color-green)" }}><Check size={12} color="#0A0909" strokeWidth={3} /></div>;

  if (status === "running")
    return (
      <div className={base} style={{ background: "var(--color-cyan-muted)", border: "2px solid var(--color-cyan)" }}>
        <span className="block w-2 h-2 rounded-full animate-pulse-dot" style={{ background: "var(--color-cyan)" }} />
      </div>
    );

  if (status === "needs-action")
    return <div className={base} style={{ background: "var(--color-amber-muted)", border: "2px solid var(--color-amber)" }}><AlertTriangle size={12} style={{ color: "var(--color-amber)" }} /></div>;

  if (status === "failed")
    return <div className={base} style={{ background: "var(--color-rose-muted)", border: "2px solid var(--color-rose)" }}><X size={12} style={{ color: "var(--color-rose)" }} /></div>;

  // pending
  return <div className={base} style={{ background: "var(--color-surface-1)", border: "1px solid var(--color-border)" }} />;
}

/* ─── status badge ─── */
function StatusBadge({ status }: { status: PhaseStatus }) {
  const map: Record<PhaseStatus, { bg: string; fg: string; label: string }> = {
    completed: { bg: "var(--color-green-muted)", fg: "var(--color-green)", label: "Completed" },
    running: { bg: "var(--color-cyan-muted)", fg: "var(--color-cyan)", label: "Running…" },
    pending: { bg: "var(--color-surface-2)", fg: "var(--color-text-muted)", label: "Pending" },
    "needs-action": { bg: "var(--color-amber-muted)", fg: "var(--color-amber)", label: "Needs your input" },
    failed: { bg: "var(--color-rose-muted)", fg: "var(--color-rose)", label: "Failed" },
  };
  const s = map[status];
  return (
    <span
      className="font-heading font-medium text-[12px] px-2 py-0.5 rounded"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}

/* ─── phase row ─── */
function PhaseRow({ phase, isLast }: { phase: Phase; isLast: boolean }) {
  return (
    <div className="relative flex gap-4 pb-6" style={{ alignItems: "flex-start" }}>
      {/* vertical line */}
      {!isLast && (
        <div
          className="absolute left-[11px] top-6 bottom-0 w-[2px]"
          style={{ background: "var(--color-border-subtle)" }}
        />
      )}

      <PhaseDot status={phase.status} />

      <div className="flex flex-col gap-1 min-w-0">
        {/* title row */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-heading font-semibold text-[15px]" style={{ color: "var(--color-text-primary)" }}>
            {phase.name}
          </span>
          <StatusBadge status={phase.status} />
          {phase.elapsed && (
            <span className="font-mono text-[11px]" style={{ color: "var(--color-text-muted)" }}>
              {phase.elapsed}
            </span>
          )}
        </div>

        {/* summary */}
        <span className="font-body text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
          {phase.summary}
        </span>
      </div>
    </div>
  );
}

/* ─── summary panel ─── */
function RunSummaryPanel({ runDetail }: { runDetail?: RunDetail | null }) {
  const runId = runDetail?.run_id ?? "run_20260403_abc1";
  const started = runDetail
    ? new Date(runDetail.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "3 Apr 2026, 14:23";
  const source = runDetail ? formatSourceUrl(runDetail.source_url) : "youtube.com/watch?v=dQw4…";

  const rows: [string, string, boolean][] = [
    ["Run ID", runId, true],
    ["Started", started, false],
    ["Source", source, true],
  ];
  const stats: [string, string][] = [
    ["Nodes", runDetail ? String(runDetail.node_count ?? "—") : "61"],
    ["Edges", runDetail ? String(runDetail.edge_count ?? "—") : "187"],
    ["Clip candidates", runDetail ? String(runDetail.clip_count ?? "—") : "—"],
    ["Rendered clips", "—"],
  ];

  return (
    <div
      className="rounded-lg p-5 flex flex-col gap-4 w-[260px] flex-shrink-0"
      style={{ background: "var(--color-surface-1)", border: "1px solid var(--color-border)" }}
    >
      {/* thumbnail */}
      <div
        className="rounded-md overflow-hidden flex items-center justify-center"
        style={{ aspectRatio: "16/9", background: "var(--color-surface-2)" }}
      >
        <Play size={32} style={{ color: "var(--color-text-muted)" }} />
      </div>

      {/* metadata */}
      <div className="flex flex-col gap-2.5">
        {rows.map(([label, value, mono]) => (
          <div key={label} className="flex justify-between items-baseline gap-4">
            <span className="font-body text-[13px]" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
            <span className={`${mono ? "font-mono" : "font-body"} text-[${mono ? "11" : "13"}px] truncate text-right`} style={{ color: mono ? "var(--color-text-muted)" : "var(--color-text-primary)" }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="h-px" style={{ background: "var(--color-border-subtle)" }} />

      {/* stats */}
      <div className="flex flex-col gap-2">
        {stats.map(([label, value]) => (
          <div key={label} className="flex justify-between items-baseline">
            <span className="font-body text-[13px]" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
            <span className="font-mono text-[13px]" style={{ color: "var(--color-text-primary)" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── page ─── */
export default function RunOverview() {
  const { id } = useParams();
  const runId = id || "demo";

  const { data: runDetail, isLoading, isError } = useRunDetail(runId);
  const { setCurrentRunId, setCurrentRun } = useRunStore();

  useEffect(() => {
    setCurrentRunId(runId);
    setCurrentRun(runDetail ?? null);
  }, [runId, runDetail, setCurrentRunId, setCurrentRun]);

  const phases: Phase[] = runDetail
    ? runDetail.phases.map(mapApiPhaseToLocal)
    : MOCK_PHASES;

  const isPhaseRunning = phases.some(p => p.status === "running");
  const { connectionState } = useRunSSE(isPhaseRunning ? runId : null);

  const completedPhases = runDetail
    ? runDetail.phases.filter((p) => p.status === "completed").length
    : 2;

  const runningPhaseEntry = runDetail?.phases.find((p) => p.status === "running");
  const currentPhase = runningPhaseEntry
    ? runningPhaseEntry.phase
    : runDetail
    ? Math.min(completedPhases + 1, 6)
    : 3;

  const runName = isLoading
    ? "Loading…"
    : (runDetail?.display_name ?? "Lex ep. 412 — Sam Altman");

  const videoUrl = runDetail?.source_url
    ? formatSourceUrl(runDetail.source_url)
    : "youtube.com/watch?v=dQw4w9WgXcQ";

  return (
    <div className="flex flex-col min-h-full">
      <RunContextBar
        runId={runId}
        runName={runName}
        videoUrl={videoUrl}
        currentPhase={currentPhase}
        completedPhases={completedPhases}
      />

      <div className="flex-1 px-6 py-8 mx-auto w-full" style={{ maxWidth: 860 }}>
        <div className="flex gap-10 items-start" style={{ minWidth: 0 }}>
          {/* left — phase tracker */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <span className="label-caps">Pipeline</span>
              {connectionState === "connected" && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--color-cyan)" }} />
                  <span className="font-mono text-[11px]" style={{ color: "var(--color-cyan)" }}>Live</span>
                </div>
              )}
            </div>

            {isError && !runDetail && (
              <div
                className="mb-5 px-4 py-3 rounded-lg font-body text-[13px]"
                style={{
                  background: "var(--color-rose-muted)",
                  color: "var(--color-rose)",
                  border: "1px solid var(--color-rose)",
                }}
              >
                Failed to load run data. Showing last known state.
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-4 items-center animate-pulse">
                    <div className="w-6 h-6 rounded-full" style={{ background: "var(--color-surface-2)" }} />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="h-3 rounded" style={{ width: "40%", background: "var(--color-surface-2)" }} />
                      <div className="h-2 rounded" style={{ width: "60%", background: "var(--color-surface-3)" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {phases.map((phase, i) => (
                  <PhaseRow key={phase.name} phase={phase} isLast={i === phases.length - 1} />
                ))}
              </div>
            )}
          </div>

          {/* right — summary */}
          <RunSummaryPanel runDetail={runDetail} />
        </div>
      </div>
    </div>
  );
}
