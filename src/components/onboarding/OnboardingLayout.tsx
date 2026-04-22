import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ClyptLogo } from "@/components/ui/ClyptLogo";
import ShaderBackground from "@/components/landing/ShaderBackground";
import type { ShaderVariant } from "@/components/landing/ShaderBackground";

const stepLabels = ["Channel", "Analyzing", "Brand Profile", "Preferences", "Voiceprints", "Ready"];

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  shaderVariant?: ShaderVariant;
}

const OnboardingLayout = ({ children, currentStep, shaderVariant = "onboard-aurora" }: OnboardingLayoutProps) => {
  const navigate = useNavigate();
  return (
    <div
      className="flex flex-col h-screen bg-[var(--color-bg)] relative overflow-hidden"
      style={{ isolation: "isolate" }}
    >
      {/* Base aurora shader behind the entire layout */}
      <ShaderBackground variant={shaderVariant} className="shader-layer" />

      <div
        className="content-layer h-16 flex-shrink-0 border-b border-[var(--color-border-subtle)] flex items-center justify-between px-10"
        style={{
          background: "rgba(10,9,9,0.6)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <ClyptLogo size="md" defaultExpanded={true} />
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            {stepLabels.map((_, i) => {
              const stepNum = i + 1;
              const isCompleted = stepNum < currentStep;
              const isCurrent = stepNum === currentStep;
              return (
                <div
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: isCurrent ? 36 : 28,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor:
                      isCompleted || isCurrent
                        ? "var(--color-violet)"
                        : "var(--color-surface-3)",
                  }}
                />
              );
            })}
          </div>
          <span className="font-heading font-medium text-[var(--color-text-muted)]" style={{ fontSize: 12 }}>
            Step {currentStep} of 6 — {stepLabels[currentStep - 1]}
          </span>
        </div>

        <div className="w-[60px]" />
      </div>

      <div className="content-layer flex-1 flex flex-col items-center justify-center p-10 overflow-y-auto">
        <div
          className="max-w-[560px] w-full flex flex-col gap-8"
          style={{
            background: "rgba(14,12,18,0.78)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20,
            padding: "40px 36px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
