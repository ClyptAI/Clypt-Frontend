import { ReactNode } from "react";
import { ClyptLogo } from "@/components/ui/ClyptLogo";

const NodeGraph = () => (
  <svg width="280" height="220" viewBox="0 0 280 220" fill="none" className="opacity-85">
    <line x1="80" y1="38" x2="160" y2="78" stroke="var(--color-border)" strokeWidth="1" />
    <line x1="80" y1="38" x2="80" y2="108" stroke="var(--color-border)" strokeWidth="1" />
    <line x1="160" y1="98" x2="80" y2="128" stroke="var(--color-border)" strokeWidth="1" />
    <line x1="160" y1="98" x2="220" y2="148" stroke="var(--color-border)" strokeWidth="1" />
    <defs>
      <marker id="arrowViolet" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6" fill="var(--color-violet)" />
      </marker>
    </defs>
    <line x1="80" y1="128" x2="160" y2="168" stroke="var(--color-violet)" strokeWidth="1" markerEnd="url(#arrowViolet)" />
    <rect x="40" y="18" width="80" height="40" rx="8" fill="var(--color-surface-2)" stroke="var(--color-border)" strokeWidth="1" />
    <rect x="40" y="18" width="3" height="40" rx="1.5" fill="var(--node-claim)" />
    <rect x="120" y="68" width="80" height="40" rx="8" fill="var(--color-surface-2)" stroke="var(--color-border)" strokeWidth="1" />
    <rect x="120" y="68" width="3" height="40" rx="1.5" fill="var(--node-anecdote)" />
    <rect x="40" y="108" width="80" height="40" rx="8" fill="var(--color-surface-2)" stroke="var(--color-border)" strokeWidth="1" />
    <rect x="40" y="108" width="3" height="40" rx="1.5" fill="var(--node-setup-payoff)" />
    <rect x="120" y="148" width="80" height="40" rx="8" fill="var(--color-surface-2)" stroke="var(--color-border)" strokeWidth="1" />
    <rect x="120" y="148" width="3" height="40" rx="1.5" fill="var(--node-reaction-beat)" />
    <rect x="190" y="128" width="80" height="40" rx="8" fill="var(--color-surface-2)" stroke="var(--color-border)" strokeWidth="1" />
    <rect x="190" y="128" width="3" height="40" rx="1.5" fill="var(--node-example)" />
  </svg>
);

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-[40%] bg-[var(--color-surface-1)] border-r border-[var(--color-border)] flex flex-col p-10">
        <ClyptLogo size="md" />

        <div className="flex-1 flex flex-col justify-center gap-12">
          <NodeGraph />
          <div>
            <div className="w-10 h-px bg-[var(--color-border)] mb-4" />
            <p className="font-heading font-medium italic text-[var(--color-text-secondary)]" style={{ fontSize: 16 }}>
              "Finally a tool that thinks the way I edit."
            </p>
          </div>
        </div>

        <span className="font-sans text-xs text-[var(--color-text-muted)]">
          © 2026 Clypt
        </span>
      </div>

      <div className="w-[60%] flex items-center justify-center" style={{ backgroundColor: "#F4F1EE" }}>
        <div className="w-[380px] flex flex-col gap-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
