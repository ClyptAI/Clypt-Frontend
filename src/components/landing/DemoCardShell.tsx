import { ReactNode } from "react";
import { MetallicSweepShader } from "@/components/shaders";

interface DemoCardShellProps {
  label: string;
  rightContent?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function DemoCardShell({ label, rightContent, children, className }: DemoCardShellProps) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        background: "linear-gradient(180deg, rgba(18,14,28,0.84) 0%, rgba(10,9,15,0.92) 100%)",
        border: "1px solid rgba(190,157,255,0.24)",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.54), inset 0 1px 0 rgba(196,181,253,0.08)",
        isolation: "isolate",
      }}
    >
      <MetallicSweepShader
        variant="window"
        accentColor="#C4B5FD"
        delayMs={700}
      />
      {/* macOS-style header bar */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          background: "rgba(30,22,46,0.62)",
          borderBottom: "1px solid rgba(167,139,250,0.14)",
        }}
      >
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(239,68,68,0.5)" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(234,179,8,0.5)" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(34,197,94,0.5)" }} />
        </div>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.38)" }}>
          {label}
        </span>
        <div style={{ display: "flex", gap: 4 }}>{rightContent}</div>
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
