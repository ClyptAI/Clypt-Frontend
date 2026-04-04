import { useState } from "react";
import { useParams } from "react-router-dom";
import { Check, X, AlertTriangle, Play, ChevronRight, FileText } from "lucide-react";
import RunContextBar from "@/components/app/RunContextBar";

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
  const [expanded, setExpanded] = useState(false);
  const hasArtifacts = phase.artifacts && phase.artifacts.length > 0;

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

        {/* artifacts toggle */}
        {hasArtifacts && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="font-body text-[12px] mt-1 hover:underline bg-transparent border-none cursor-pointer p-0"
              style={{ color: "var(--color-violet)" }}
            >
              {expanded ? "Hide" : "Show artifacts →"}
            </button>
            {expanded && (
              <div className="flex flex-col gap-1 mt-1">
                {phase.artifacts!.map((a) => (
                  <div key={a} className="flex items-center gap-1.5">
                    <FileText size={11} style={{ color: "var(--color-text-muted)" }} />
                    <span className="font-mono text-[11px]" style={{ color: "var(--color-text-muted)" }}>{a}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── summary panel ─── */
function RunSummaryPanel() {
  const rows: [string, string, boolean][] = [
    ["Run ID", "run_20260403_abc1", true],
    ["Started", "3 Apr 2026, 14:23", false],
    ["Source", "youtube.com/watch?v=dQw4…", true],
  ];
  const stats: [string, string][] = [
    ["Nodes", "61"],
    ["Edges", "187"],
    ["Clip candidates", "—"],
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

  return (
    <div className="flex flex-col min-h-full">
      <RunContextBar
        runId={runId}
        runName="Lex ep. 412 — Sam Altman"
        videoUrl="youtube.com/watch?v=dQw4w9WgXcQ"
        currentPhase={3}
        completedPhases={2}
      />

      <div className="flex-1 px-6 py-8 mx-auto w-full" style={{ maxWidth: 860 }}>
        <div className="flex gap-10 items-start" style={{ minWidth: 0 }}>
          {/* left — phase tracker */}
          <div className="flex-1 min-w-0">
            <span className="label-caps mb-5 block">Pipeline</span>
            <div>
              {MOCK_PHASES.map((phase, i) => (
                <PhaseRow key={phase.name} phase={phase} isLast={i === MOCK_PHASES.length - 1} />
              ))}
            </div>
          </div>

          {/* right — summary */}
          <RunSummaryPanel />
        </div>
      </div>
    </div>
  );
}
