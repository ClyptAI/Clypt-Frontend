import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Upload, Plus } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const OnboardVoiceprints = () => {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);

  return (
    <OnboardingLayout currentStep={5}>
      <div className="text-center">
        <h1 className="font-heading font-bold text-[var(--color-text-primary)]" style={{ fontSize: 28 }}>
          Register your voice
        </h1>
        <p className="font-sans font-normal text-[var(--color-text-secondary)] mx-auto mt-3" style={{ fontSize: 15, maxWidth: 440 }}>
          Optional. Clypt uses your voiceprint to auto-identify you in future videos — so you don't have to label yourself every time.
        </p>
      </div>

      {/* Two option cards */}
      <div className="flex gap-4 w-full">
        {/* Record card */}
        <div className="flex-1 bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-lg p-6 flex flex-col gap-3">
          <Mic size={28} color="var(--color-violet)" />
          <h3 className="font-heading font-semibold text-[var(--color-text-primary)]" style={{ fontSize: 16 }}>
            Record a sample
          </h3>
          <p className="font-sans text-[var(--color-text-secondary)]" style={{ fontSize: 13 }}>
            15–30 seconds in your normal speaking voice.
          </p>
          <Button
            variant="secondary"
            className="mt-2"
            onClick={() => setRecording(!recording)}
          >
            {recording ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-rose)] animate-pulse" />
                Stop
              </span>
            ) : (
              "Start recording"
            )}
          </Button>
        </div>

        {/* Upload card */}
        <div className="flex-1 bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-lg p-6 flex flex-col gap-3">
          <Upload size={28} color="var(--color-violet)" />
          <h3 className="font-heading font-semibold text-[var(--color-text-primary)]" style={{ fontSize: 16 }}>
            Upload an audio clip
          </h3>
          <p className="font-sans text-[var(--color-text-secondary)]" style={{ fontSize: 13 }}>
            MP3 or WAV, 15–30 seconds.
          </p>
          <div
            className="mt-2 flex items-center justify-center rounded-[6px] p-5 text-center font-sans text-[var(--color-text-muted)] cursor-pointer transition-colors hover:border-[var(--color-violet)]"
            style={{
              border: "1px dashed var(--color-border)",
              fontSize: 13,
            }}
          >
            Drop file here
          </div>
        </div>
      </div>

      {/* Name field */}
      <div className="w-full mt-2">
        <label className="block font-heading font-medium text-[var(--color-text-primary)] mb-2" style={{ fontSize: 13 }}>
          Name this voiceprint
        </label>
        <Input placeholder="e.g. Rithvik — Host" className="h-11" />
      </div>

      <Button variant="ghost" className="gap-2">
        <Plus size={16} />
        Add another speaker
      </Button>

      {/* CTA row */}
      <div className="flex flex-col items-center gap-3 w-full">
        <Button className="w-full" onClick={() => navigate("/onboard/ready")}>
          Save and continue →
        </Button>
        <button
          onClick={() => navigate("/onboard/ready")}
          className="font-sans text-[var(--color-text-muted)] hover:underline transition-colors bg-transparent border-none cursor-pointer"
          style={{ fontSize: 14 }}
        >
          Skip for now →
        </button>
      </div>
    </OnboardingLayout>
  );
};

export default OnboardVoiceprints;
