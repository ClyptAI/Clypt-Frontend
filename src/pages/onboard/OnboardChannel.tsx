import { useNavigate } from "react-router-dom";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useOnboardingStore } from "@/stores/onboarding-store";

const OnboardChannel = () => {
  const navigate = useNavigate();
  const channelUrl = useOnboardingStore((s) => s.channelUrl);
  const singleVideo = useOnboardingStore((s) => s.singleVideoMode);
  const videoUrl = useOnboardingStore((s) => s.videoUrl);
  const setChannelUrl = useOnboardingStore((s) => s.setChannelUrl);
  const setSingleVideo = useOnboardingStore((s) => s.setSingleVideoMode);
  const setVideoUrl = useOnboardingStore((s) => s.setVideoUrl);

  const isEmpty = singleVideo ? !videoUrl.trim() : !channelUrl.trim();

  return (
    <OnboardingLayout currentStep={1}>
      <div className="text-center">
        <h1 className="font-heading font-bold text-[var(--color-text-primary)]" style={{ fontSize: 32 }}>
          Connect your YouTube channel
        </h1>
        <p className="font-sans font-normal text-[var(--color-text-secondary)] mx-auto mt-3" style={{ fontSize: 16, maxWidth: 440 }}>
          We'll analyze your recent content to understand your format and voice.
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <label className="font-heading font-medium text-[var(--color-text-primary)]" style={{ fontSize: 13 }}>
          YouTube channel URL or handle
        </label>
        <Input
          className="h-12 text-[15px]"
          placeholder="@yourchannel or youtube.com/c/..."
          value={channelUrl}
          onChange={(e) => setChannelUrl(e.target.value)}
        />

        <div className="flex items-center gap-2.5 mt-3">
          <Switch checked={singleVideo} onCheckedChange={setSingleVideo} />
          <span className="font-sans text-[var(--color-text-secondary)]" style={{ fontSize: 14 }}>
            Or analyze a single video instead
          </span>
        </div>

        {singleVideo && (
          <Input
            className="h-12 text-[15px] mt-2"
            placeholder="youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        )}
      </div>

      <Button
        className="w-full h-12 text-base font-heading font-semibold"
        disabled={isEmpty}
        style={{ opacity: isEmpty ? 0.4 : 1, cursor: isEmpty ? "not-allowed" : "pointer" }}
        onClick={() => navigate("/onboard/analyzing")}
      >
        Analyze →
      </Button>
    </OnboardingLayout>
  );
};

export default OnboardChannel;
