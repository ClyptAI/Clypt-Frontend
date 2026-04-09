import { useNavigate } from "react-router-dom";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useOnboardingStore, type Framing, type Quality } from "@/stores/onboarding-store";

const platforms = ["TikTok", "Reels", "Shorts", "LinkedIn"];
const framingOptions: Framing[] = ["Single presenter follow", "Shared frame (2-shot)", "Mixed (decide per shot)"];
const qualityOptions: Quality[] = ["Fast draft", "Balanced", "High quality"];

const OnboardPreferences = () => {
  const navigate = useNavigate();
  const duration = useOnboardingStore((s) => s.durationRange);
  const activePlatforms = useOnboardingStore((s) => s.platforms);
  const framing = useOnboardingStore((s) => s.framing);
  const quality = useOnboardingStore((s) => s.quality);
  const setDurationRange = useOnboardingStore((s) => s.setDurationRange);
  const togglePlatform = useOnboardingStore((s) => s.togglePlatform);
  const setFraming = useOnboardingStore((s) => s.setFraming);
  const setQuality = useOnboardingStore((s) => s.setQuality);

  return (
    <OnboardingLayout currentStep={4}>
      <h1 className="font-heading font-bold text-[var(--color-text-primary)] text-center" style={{ fontSize: 28 }}>
        Set your clip preferences
      </h1>

      <div className="flex flex-col gap-7 w-full" style={{ maxWidth: 480, margin: "0 auto" }}>
        {/* Duration slider */}
        <div className="flex flex-col gap-2">
          <span className="font-heading font-medium text-[var(--color-text-primary)]" style={{ fontSize: 14 }}>
            Target clip duration
          </span>
          <span className="font-mono text-[var(--color-violet)]" style={{ fontSize: 14 }}>
            {duration[0]}s – {duration[1]}s
          </span>
          <Slider
            min={15}
            max={180}
            step={5}
            value={duration}
            onValueChange={(v) => setDurationRange([v[0], v[1]] as [number, number])}
            className="mt-1"
          />
          <div className="flex justify-between">
            <span className="font-mono text-[var(--color-text-muted)]" style={{ fontSize: 11 }}>15s</span>
            <span className="font-mono text-[var(--color-text-muted)]" style={{ fontSize: 11 }}>3 min</span>
          </div>
        </div>

        {/* Platforms */}
        <div className="flex flex-col gap-2">
          <span className="font-heading font-medium text-[var(--color-text-primary)]" style={{ fontSize: 14 }}>
            Publishing platforms
          </span>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => {
              const active = activePlatforms.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className="font-heading font-medium transition-colors"
                  style={{
                    fontSize: 13,
                    padding: "8px 16px",
                    borderRadius: 20,
                    background: active ? "var(--color-violet-muted)" : "var(--color-surface-2)",
                    border: `1px solid ${active ? "var(--color-violet)" : "var(--color-border)"}`,
                    color: active ? "var(--color-violet)" : "var(--color-text-secondary)",
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Framing */}
        <div className="flex flex-col gap-2.5">
          <span className="font-heading font-medium text-[var(--color-text-primary)]" style={{ fontSize: 14 }}>
            Default framing
          </span>
          {framingOptions.map((opt) => (
            <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="framing"
                checked={framing === opt}
                onChange={() => setFraming(opt)}
                className="accent-[var(--color-violet)]"
              />
              <span className="font-sans text-[var(--color-text-primary)]" style={{ fontSize: 14 }}>
                {opt}
              </span>
            </label>
          ))}
        </div>

        {/* Quality */}
        <div className="flex flex-col gap-2">
          <span className="font-heading font-medium text-[var(--color-text-primary)]" style={{ fontSize: 14 }}>
            Processing quality
          </span>
          <div className="flex rounded-[6px] overflow-hidden border border-[var(--color-border)]">
            {qualityOptions.map((opt) => {
              const active = quality === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setQuality(opt)}
                  className="flex-1 py-2.5 font-heading transition-colors"
                  style={{
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    background: active ? "var(--color-violet)" : "var(--color-surface-2)",
                    color: active ? "#0A0909" : "var(--color-text-secondary)",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Button className="w-full" style={{ maxWidth: 480, margin: "0 auto" }} onClick={() => navigate("/onboard/voiceprints")}>
        Save preferences →
      </Button>
    </OnboardingLayout>
  );
};

export default OnboardPreferences;
