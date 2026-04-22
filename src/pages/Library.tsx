import { useNavigate } from "react-router-dom";
import { Play, Pencil, Download, Plus, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRunList } from "@/hooks/api/useRuns";
import { useAllClips, fmtClipDuration } from "@/hooks/api/useTimeline";
import type { RunListItem } from "@/types/clypt";
import { ThumbnailShader } from "@/components/shaders";

type RunStatus = "analyzing" | "complete" | "grounding" | "failed";

interface RunCard {
  id: string;
  title: string;
  url: string;
  status: RunStatus;
  clipCount?: number;
  time: string;
  phases: ("done" | "active" | "pending" | "failed")[];
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function adaptRunListItem(r: RunListItem): RunCard {
  const statusMap: Record<string, RunStatus> = {
    running: "analyzing",
    completed: "complete",
    needs_action: "grounding",
    failed: "failed",
    pending: "analyzing",
  };
  const isComplete = r.latest_status === "completed" && r.latest_phase >= 6;
  return {
    id: r.run_id,
    title: r.display_name ?? r.source_url ?? "Untitled run",
    url: r.source_url ?? "",
    status: statusMap[r.latest_status] ?? "analyzing",
    clipCount: r.clip_count ?? undefined,
    time: formatRelativeTime(r.created_at),
    phases: Array.from({ length: 6 }, (_, i) => {
      const phaseNum = i + 1;
      if (isComplete) return "done" as const;
      if (phaseNum < r.latest_phase) return "done" as const;
      if (phaseNum === r.latest_phase)
        return r.latest_status === "failed" ? "failed" as const : "active" as const;
      return "pending" as const;
    }),
  };
}

function PhaseDots({ phases }: { phases: RunCard["phases"] }) {
  return (
    <div className="flex items-center gap-[4px]">
      {phases.map((p, i) => (
        <span
          key={i}
          className={`w-[8px] h-[8px] rounded-full ${
            p === "done"
              ? "bg-[var(--color-green)]"
              : p === "active"
                ? "bg-[var(--color-cyan)] animate-pulse"
                : p === "failed"
                  ? "bg-[var(--color-rose)]"
                  : "border border-[var(--color-border)] bg-transparent"
          }`}
        />
      ))}
    </div>
  );
}

function StatusBadge({ status, clipCount }: { status: RunStatus; clipCount?: number }) {
  switch (status) {
    case "analyzing":
      return (
        <span className="flex items-center gap-[6px] font-heading font-medium text-[12px] text-[var(--color-cyan)]">
          <span className="w-[6px] h-[6px] rounded-full bg-[var(--color-cyan)]" />
          Analyzing
        </span>
      );
    case "complete":
      return (
        <span className="flex items-center gap-[6px] font-heading font-medium text-[12px] text-[var(--color-green)]">
          ✓ {clipCount} clips ready
        </span>
      );
    case "grounding":
      return (
        <span className="flex items-center gap-[6px] font-heading font-medium text-[12px] text-[var(--color-amber)]">
          ▲ Needs grounding
        </span>
      );
    case "failed":
      return (
        <span className="flex items-center gap-[6px] font-heading font-medium text-[12px] text-[var(--color-rose)]">
          ✕ Failed
        </span>
      );
  }
}

function ActionLink({ status }: { status: RunStatus }) {
  if (status === "analyzing") return null;
  const map = {
    complete: { label: "Review →", color: "var(--color-violet)" },
    grounding: { label: "Ground →", color: "var(--color-amber)" },
    failed: { label: "Retry →", color: "var(--color-rose)" },
  } as const;
  const { label, color } = map[status];
  return (
    <button
      className="font-sans font-medium text-[13px] hover:underline"
      style={{ color }}
    >
      {label}
    </button>
  );
}

function thumbnailVariantForStatus(status: RunStatus): "analyzing" | "complete" | "failed" | "default" {
  switch (status) {
    case "analyzing":
      return "analyzing";
    case "complete":
    case "grounding":
      return "complete";
    case "failed":
      return "failed";
  }
}

function RunsTab({
  runs,
  isLoading,
  isError,
  apiRuns,
}: {
  runs: RunCard[];
  isLoading: boolean;
  isError: boolean;
  apiRuns: RunListItem[] | undefined;
}) {
  const navigate = useNavigate();
  return (
    <div className="p-[32px]">
      {/* Error banner */}
      {isError && (
        <div
          className="mb-[16px] rounded-[6px] px-[14px] py-[10px] font-sans text-[13px]"
          style={{ background: "rgba(239,68,68,0.1)", color: "var(--color-rose)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          Failed to load runs. Showing cached data.
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-[16px]">
        {/* Skeleton cards while loading with no data yet */}
        {isLoading && !apiRuns && Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-[8px] p-4"
            style={{ background: "var(--color-surface-1)", border: "1px solid var(--color-border)", height: 100 }}
          />
        ))}

        {runs.map((run) => (
          <div
            key={run.id}
            onClick={() => navigate(`/runs/${run.id}`)}
            className="group rounded-[8px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-1)] flex flex-col cursor-pointer hover:border-[var(--color-violet)] transition-colors"
          >
            {/* Thumbnail */}
            <div className="aspect-video relative overflow-hidden flex items-center justify-center">
              <ThumbnailShader
                variant={thumbnailVariantForStatus(run.status)}
                intensity="subtle"
                className="absolute inset-0"
              />
              <Play size={32} className="text-[var(--color-text-muted)] relative z-10" />
            </div>

            {/* Content */}
            <div className="p-[16px] flex flex-col gap-[12px]">
              <div className="flex items-start gap-[8px]">
                <h3 className="font-heading font-semibold text-[15px] text-[var(--color-text-primary)] leading-[1.4] line-clamp-2 flex-1">
                  {run.title}
                </h3>
                <Pencil
                  size={14}
                  className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-[3px] cursor-pointer"
                />
              </div>

              <span className="font-mono text-[12px] text-[var(--color-text-muted)] truncate">
                {run.url}
              </span>

              <div className="h-px bg-[var(--color-border-subtle)]" />

              <div className="flex items-center justify-between">
                <PhaseDots phases={run.phases} />
                <span className="font-sans text-[12px] text-[var(--color-text-muted)]">
                  {run.time}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <StatusBadge status={run.status} clipCount={run.clipCount} />
                <ActionLink status={run.status} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {!isLoading && apiRuns?.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16">
          <span className="font-body text-[15px]" style={{ color: "var(--color-text-muted)" }}>
            No runs yet — submit a YouTube URL to get started.
          </span>
        </div>
      )}
    </div>
  );
}

function ClipsTab() {
  const navigate = useNavigate();
  const { data: allClips, isLoading } = useAllClips();

  return (
    <div className="p-[32px]">
      {isLoading && !allClips && (
        <div className="grid gap-[12px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-[8px] bg-[var(--color-surface-2)]"
              style={{ aspectRatio: "9/16" }}
            />
          ))}
        </div>
      )}

      {!isLoading && (!allClips || allClips.length === 0) && (
        <div className="flex flex-col items-center gap-3 py-16">
          <Film size={36} className="text-[var(--color-text-muted)]" />
          <span className="font-body text-[15px]" style={{ color: "var(--color-text-muted)" }}>
            No clips yet — finish a run to generate clips.
          </span>
        </div>
      )}

      {allClips && allClips.length > 0 && (
        <div className="grid gap-[12px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
          {allClips.map((clip) => (
            <div
              key={`${clip.run_id}:${clip.clip_id}`}
              className="group relative rounded-[8px] overflow-hidden cursor-pointer"
              style={{ aspectRatio: "9/16" }}
              onClick={() => navigate(`/runs/${clip.run_id}/clips`)}
            >
              <ThumbnailShader
                variant="complete"
                intensity="subtle"
                className="absolute inset-0"
              />
              {/* Play icon center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Play size={28} className="text-[var(--color-text-muted)] opacity-40 group-hover:opacity-80 transition-opacity" />
              </div>

              {/* Hover download button */}
              <button
                className="absolute top-[8px] right-[8px] z-10 p-[4px] rounded-[4px] bg-[rgba(10,9,9,0.6)] opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={16} className="text-white" />
              </button>

              {/* Bottom overlay */}
              <div
                className="absolute inset-x-0 bottom-0 p-[10px] flex flex-col gap-[2px]"
                style={{ background: "linear-gradient(transparent, rgba(10,9,9,0.85))" }}
              >
                <span className="font-heading font-medium text-[12px] text-white line-clamp-2">
                  {clip.rationale}
                </span>
                <span className="font-mono text-[11px] text-[var(--color-text-muted)]">
                  {fmtClipDuration(clip.start_ms, clip.end_ms)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Library() {
  const navigate = useNavigate();
  const { data: apiRuns, isLoading, isError } = useRunList();
  const runs = apiRuns?.map(adaptRunListItem) ?? [];
  const isClips = location.pathname === "/library/clips";

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between px-[32px] py-[32px] pb-[24px] border-b border-[var(--color-border-subtle)]">
        <h1 className="font-heading font-bold text-[24px] text-[var(--color-text-primary)]">
          {isClips ? "Your Clips" : "Your Runs"}
        </h1>
        {!isClips && (
          <Button
            variant="default"
            className="px-[16px] py-[8px] h-auto gap-[8px]"
            onClick={() => navigate("/runs/new")}
          >
            <Plus size={16} />
            <span className="font-heading font-semibold text-[14px]">New Run</span>
          </Button>
        )}
      </div>

      {isClips ? (
        <ClipsTab />
      ) : (
        <RunsTab runs={runs} isLoading={isLoading} isError={isError} apiRuns={apiRuns} />
      )}
    </div>
  );
}
