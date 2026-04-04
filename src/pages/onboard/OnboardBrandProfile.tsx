import { useNavigate } from "react-router-dom";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";

const styleTags = ["Setup-payoff heavy", "High reaction density", "Solo presenter"];

const engagementBars = [
  { label: "Humor", color: "var(--color-amber)", fill: 72 },
  { label: "Emotion", color: "var(--color-rose)", fill: 58 },
  { label: "Social", color: "var(--color-cyan)", fill: 45 },
  { label: "Expertise", color: "var(--color-violet)", fill: 84 },
];

const OnboardBrandProfile = () => {
  const navigate = useNavigate();

  return (
    <OnboardingLayout currentStep={3}>
      <div className="flex gap-10 w-full" style={{ maxWidth: 800 }}>
        {/* Left column */}
        <div className="flex flex-col gap-5" style={{ width: "40%" }}>
          {/* Channel card */}
          <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-lg p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[var(--color-surface-3)] flex-shrink-0" />
              <div>
                <p className="font-heading font-semibold text-[var(--color-text-primary)]" style={{ fontSize: 18 }}>
                  Your Channel
                </p>
                <p className="font-sans text-[var(--color-text-muted)]" style={{ fontSize: 13 }}>
                  @yourchannel · 142K subscribers
                </p>
              </div>
            </div>
            <span className="label-caps mt-1">Your content style</span>
            <div className="flex flex-wrap gap-2">
              {styleTags.map((tag) => (
                <span
                  key={tag}
                  className="font-heading font-medium rounded"
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 4,
                    background: "var(--color-violet-muted)",
                    border: "1px solid rgba(167, 139, 250, 0.3)",
                    color: "var(--color-violet)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6" style={{ width: "60%" }}>
          <span className="label-caps">Engagement profile</span>

          <div className="flex flex-col gap-4">
            {engagementBars.map((bar) => (
              <div key={bar.label} className="flex items-center gap-3">
                <span className="font-heading font-medium text-[var(--color-text-primary)] flex-shrink-0" style={{ width: 100, fontSize: 14 }}>
                  {bar.label}
                </span>
                <div className="flex-1 h-1.5 rounded-sm bg-[var(--color-surface-3)] overflow-hidden">
                  <div
                    className="h-full rounded-sm transition-all duration-1000"
                    style={{ width: `${bar.fill}%`, backgroundColor: bar.color }}
                  />
                </div>
                <span className="font-mono text-[var(--color-text-muted)] flex-shrink-0" style={{ fontSize: 12 }}>
                  {bar.fill}%
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1 mt-2">
            <p className="font-sans text-[var(--color-text-secondary)]" style={{ fontSize: 14 }}>
              Hook style: <span className="text-[var(--color-text-primary)]">Direct claim</span>
            </p>
            <p className="font-sans text-[var(--color-text-secondary)]" style={{ fontSize: 14 }}>
              Payoff style: <span className="text-[var(--color-text-primary)]">Reversal + reaction</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full mt-4">
        <Button className="flex-1" onClick={() => navigate("/onboard/preferences")}>
          Looks right →
        </Button>
        <Button variant="ghost">Adjust manually</Button>
      </div>
    </OnboardingLayout>
  );
};

export default OnboardBrandProfile;
