import { Link, useLocation } from "react-router-dom";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const TABS = [
  { label: "Overview", path: "", phase: 0 },
  { label: "Timeline", path: "/timeline", phase: 1 },
  { label: "Cortex Graph", path: "/graph", phase: 2 },
  { label: "Clip Candidates", path: "/clips", phase: 4 },
  { label: "Grounding", path: "/grounding", phase: 5 },
  { label: "Render", path: "/render", phase: 6 },
];

interface RunContextBarProps {
  runId: string;
  runName: string;
  videoUrl: string;
  currentPhase: number; // 1-6, which phase is currently running
  completedPhases: number; // how many phases are completed
}

export default function RunContextBar({
  runId,
  runName,
  videoUrl,
  currentPhase,
  completedPhases,
}: RunContextBarProps) {
  const location = useLocation();
  const basePath = `/runs/${runId}`;

  const phaseLabel =
    currentPhase <= 6
      ? `Phase ${currentPhase} of 6 — Running`
      : "Complete";

  return (
    <div className="sticky top-0 z-10 w-full border-b" style={{ background: "var(--color-surface-1)", borderColor: "var(--color-border)" }}>
      {/* Top row */}
      <div className="flex items-center justify-between px-6 py-3">
        <Link
          to="/library"
          className="font-body text-[13px] hover:underline"
          style={{ color: "var(--color-text-muted)" }}
        >
          ← Library
        </Link>

        <div className="flex flex-col items-center gap-0.5">
          <span className="font-heading font-semibold text-[14px]" style={{ color: "var(--color-text-primary)" }}>
            {runName}
          </span>
          <span className="font-mono text-[11px]" style={{ color: "var(--color-text-muted)" }}>
            {videoUrl}
          </span>
        </div>

        <span className="label-caps" style={{ color: "var(--color-cyan)" }}>
          {phaseLabel}
        </span>
      </div>

      {/* Tab row */}
      <div className="flex gap-0 px-6 border-t" style={{ borderColor: "var(--color-border-subtle)" }}>
        {TABS.map((tab) => {
          const fullPath = basePath + tab.path;
          const isActive = location.pathname === fullPath;
          const isLocked = tab.phase > completedPhases && tab.phase > currentPhase;
          const isAvailable = !isLocked;

          if (isLocked) {
            return (
              <Tooltip key={tab.label}>
                <TooltipTrigger asChild>
                  <span
                    className="font-heading font-medium text-[13px] px-4 py-2.5 border-b-2 border-transparent opacity-40 cursor-not-allowed select-none"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {tab.label}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Available after Phase {tab.phase} completes.
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link
              key={tab.label}
              to={fullPath}
              className="font-heading text-[13px] px-4 py-2.5 border-b-2 transition-colors"
              style={{
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                borderBottomColor: isActive ? "var(--color-violet)" : "transparent",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
