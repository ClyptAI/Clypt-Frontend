import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";

const nodeColors = [
  "var(--node-claim)",
  "var(--node-anecdote)",
  "var(--node-setup-payoff)",
  "var(--node-reaction-beat)",
  "var(--node-qa-exchange)",
  "var(--node-example)",
];

const statusLabels = [
  "Transcribing audio...",
  "Identifying speakers...",
  "Detecting shots...",
  "Building semantic graph...",
];

const OnboardAnalyzing = () => {
  const navigate = useNavigate();
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % statusLabels.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance after 8s
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/onboard/brand-profile");
    }, 8000);
    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <OnboardingLayout currentStep={2}>
      <div className="flex flex-col items-center">
        {/* SVG timeline animation */}
        <svg width="320" height="80" viewBox="0 0 320 80" fill="none" className="mb-2">
          {/* Timeline bar */}
          <line x1="20" y1="20" x2="300" y2="20" stroke="var(--color-surface-3)" strokeWidth="2" />
          {/* Nodes */}
          {nodeColors.map((color, i) => {
            const cx = 20 + i * 56;
            return (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={20}
                  r={5}
                  fill="var(--color-surface-3)"
                  className="animate-node-pulse"
                  style={{
                    animationDelay: `${i * 0.4}s`,
                    animationFillMode: "forwards",
                  }}
                >
                  <animate
                    attributeName="fill"
                    from="var(--color-surface-3)"
                    to={color}
                    dur="0.6s"
                    begin={`${i * 0.4}s`}
                    fill="freeze"
                  />
                  <animate
                    attributeName="r"
                    values="5;7;5"
                    dur="1.2s"
                    begin={`${i * 0.4}s`}
                    repeatCount="indefinite"
                  />
                </circle>
                <line
                  x1={cx}
                  y1={25}
                  x2={cx}
                  y2={41}
                  stroke="var(--color-border)"
                  strokeWidth="1"
                  opacity="0"
                >
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="0.6"
                    dur="0.3s"
                    begin={`${i * 0.4}s`}
                    fill="freeze"
                  />
                </line>
              </g>
            );
          })}
        </svg>

        <h2 className="font-heading font-bold text-[var(--color-text-primary)] text-center mt-10" style={{ fontSize: 28 }}>
          Building your creator profile
        </h2>

        {/* Progress bar */}
        <div className="w-80 mt-6">
          <div className="h-[3px] rounded-sm bg-[var(--color-surface-2)] overflow-hidden">
            <div
              className="h-full rounded-sm bg-[var(--color-violet)]"
              style={{
                animation: "progressFill 8s ease-out forwards",
              }}
            />
          </div>
        </div>

        {/* Status label */}
        <p
          className="font-heading font-medium text-[var(--color-text-secondary)] text-center mt-4 transition-opacity duration-300"
          style={{ fontSize: 14 }}
          key={statusIdx}
        >
          {statusLabels[statusIdx]}
        </p>

        <p className="font-sans text-[var(--color-text-muted)] text-center mt-3" style={{ fontSize: 13 }}>
          Usually takes 30–90 seconds.
        </p>
      </div>

      <style>{`
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 85%; }
        }
      `}</style>
    </OnboardingLayout>
  );
};

export default OnboardAnalyzing;
