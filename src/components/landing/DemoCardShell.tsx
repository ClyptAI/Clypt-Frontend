import { ReactNode } from "react";

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
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
      }}
    >
      {/* macOS-style header bar */}
      <div
        style={{
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          background: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(239,68,68,0.5)" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(234,179,8,0.5)" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(34,197,94,0.5)" }} />
        </div>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
          {label}
        </span>
        <div style={{ display: "flex", gap: 4 }}>{rightContent}</div>
      </div>
      {children}
    </div>
  );
}
