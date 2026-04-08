interface RunContextBarProps {
  runId: string;
  runName: string;
  videoUrl: string;
  currentPhase: number;
  completedPhases: number;
}

export default function RunContextBar({
  runName,
  videoUrl,
  currentPhase,
}: RunContextBarProps) {
  const phaseLabel =
    currentPhase <= 6
      ? `Phase ${currentPhase} of 6 — Running`
      : "Complete";

  return (
    <div
      className="flex-shrink-0 flex items-center justify-between px-6 border-b relative"
      style={{
        height: 48,
        background: "var(--color-surface-1)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Left — run name */}
      <span className="font-heading font-semibold text-[13px]" style={{ color: "var(--color-text-primary)" }}>
        {runName}
      </span>

      {/* Center — video title */}
      <span
        className="absolute left-1/2 -translate-x-1/2 font-mono text-[11px] truncate max-w-[320px]"
        style={{ color: "var(--color-text-muted)" }}
      >
        {videoUrl}
      </span>

      {/* Right — phase status */}
      <span className="label-caps" style={{ color: "var(--color-cyan)", fontSize: 11 }}>
        {phaseLabel}
      </span>
    </div>
  );
}
