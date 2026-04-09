import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/stores/onboarding-store";

const OnboardReady = () => {
  const navigate = useNavigate();
  const prefilled = useOnboardingStore((s) =>
    s.singleVideoMode ? s.videoUrl : s.channelUrl,
  );
  const markComplete = useOnboardingStore((s) => s.markComplete);

  const [url, setUrl] = useState(prefilled);

  const handleAnalyze = () => {
    markComplete();
    navigate("/runs/new", { state: { url: url.trim() } });
  };

  const handleBrowse = () => {
    markComplete();
    navigate("/library");
  };

  return (
    <OnboardingLayout currentStep={6}>
      <div className="flex flex-col items-center text-center">
        {/* Waveform cut icon */}
        <svg width="40" height="24" viewBox="0 0 40 24" fill="none" className="mb-4">
          <line x1="0" y1="12" x2="18" y2="12" stroke="var(--color-border)" strokeWidth="2" />
          <line x1="20" y1="2" x2="20" y2="22" stroke="var(--color-violet)" strokeWidth="1.5" />
          <line x1="22" y1="12" x2="40" y2="12" stroke="var(--color-violet)" strokeWidth="2" />
        </svg>

        <h1 className="font-heading text-[var(--color-text-primary)]" style={{ fontSize: 40, fontWeight: 800 }}>
          You're set up.
        </h1>
        <p className="font-sans font-normal text-[var(--color-text-secondary)] mt-3" style={{ fontSize: 16 }}>
          Paste any YouTube video link to start your first run.
        </p>
      </div>

      <div className="flex items-center gap-3 w-full mt-4" style={{ maxWidth: 560 }}>
        <Input
          className="h-[52px] text-[15px] flex-1"
          placeholder="youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && url.trim()) handleAnalyze();
          }}
        />
        <Button
          className="h-[52px] px-7 flex-shrink-0"
          onClick={handleAnalyze}
          disabled={!url.trim()}
          style={{ opacity: url.trim() ? 1 : 0.4, cursor: url.trim() ? "pointer" : "not-allowed" }}
        >
          Analyze →
        </Button>
      </div>

      <p className="text-center">
        <button
          onClick={handleBrowse}
          className="font-sans text-[var(--color-text-muted)] hover:underline bg-transparent border-none cursor-pointer"
          style={{ fontSize: 14 }}
        >
          Or browse your library →
        </button>
      </p>
    </OnboardingLayout>
  );
};

export default OnboardReady;
