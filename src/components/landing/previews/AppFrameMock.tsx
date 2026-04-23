import { ReactNode } from "react";

/**
 * Mock app window chrome — macOS-style traffic-light bar wrapping a content
 * pane. Used by the landing-page Phase previews so each section reads as a
 * real page screenshot. Pure presentation, no routing or store reads.
 *
 * Note: the production sidebar is intentionally omitted — these previews
 * focus on the page content itself (which is what each phase is about).
 */
interface AppFrameMockProps {
  /** Title shown in the top window chrome (e.g. "rogan_flagrant — Timeline"). */
  windowLabel: string;
  /** Which run tab the page belongs to (kept for API parity; unused now). */
  activeTab?: "Timeline" | "Cortex Graph" | "Search" | "Clip Candidates" | "Grounding" | "Render";
  children: ReactNode;
  /** Total preview height in px. Defaults to 560. */
  height?: number;
}

export default function AppFrameMock({ windowLabel, children, height = 560 }: AppFrameMockProps) {
  return (
    <div
      style={{
        background: "rgba(14,12,18,0.78)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* macOS window chrome */}
      <div
        style={{
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          background: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(239,68,68,0.55)" }} />
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(234,179,8,0.55)" }} />
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(34,197,94,0.55)" }} />
        </div>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.32)" }}>
          {windowLabel}
        </span>
        <div style={{ width: 21 }} />
      </div>

      {/* Body — content fills full width (no sidebar in landing previews) */}
      <div style={{ height, overflow: "hidden", background: "#0A0909", position: "relative" }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Compact top context bar — mimics RunContextBar. Use inside the content area
 * of AppFrameMock as the first child of each preview.
 */
export function MockContextBar({
  runName,
  phaseLabel,
  completedPhases = 4,
  currentPhase = 5,
  rightSlot,
}: {
  runName: string;
  phaseLabel: string;
  completedPhases?: number;
  currentPhase?: number;
  rightSlot?: ReactNode;
}) {
  return (
    <div
      style={{
        height: 38,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 14px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.015)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 600,
            fontSize: 12,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          {runName}
        </span>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.05em",
          }}
        >
          {phaseLabel}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Phase pip indicator */}
        <div style={{ display: "flex", gap: 3 }}>
          {Array.from({ length: 6 }, (_, i) => {
            const idx = i + 1;
            const done = idx <= completedPhases;
            const active = idx === currentPhase;
            return (
              <div
                key={i}
                style={{
                  width: 14,
                  height: 3,
                  borderRadius: 1,
                  background: done
                    ? "#4ADE80"
                    : active
                      ? "#A78BFA"
                      : "rgba(255,255,255,0.08)",
                }}
              />
            );
          })}
        </div>
        {rightSlot}
      </div>
    </div>
  );
}