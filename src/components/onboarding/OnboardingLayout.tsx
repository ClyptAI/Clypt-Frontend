import { ReactNode } from "react";
import { ClyptLogo } from "@/components/ui/ClyptLogo";

const stepLabels = ["Channel", "Analyzing", "Brand Profile", "Preferences", "Voiceprints", "Ready"];

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
}

const OnboardingLayout = ({ children, currentStep }: OnboardingLayoutProps) => {
  return (
    <div className="flex flex-col h-screen bg-[var(--color-bg)]">
      <div className="h-16 flex-shrink-0 border-b border-[var(--color-border-subtle)] flex items-center justify-between px-10">
        <ClyptLogo size="sm" />

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

      <div className="flex-1 flex flex-col items-center justify-center p-10 overflow-y-auto">
        <div className="max-w-[560px] w-full flex flex-col gap-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
