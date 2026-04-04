import { Button } from "@/components/ui/button";

const Hero = () => {
  // Generate sinusoidal path data
  const generateWavePath = (amplitude: number, frequency: number, phase: number, yOffset: number) => {
    const width = 1400;
    const points: string[] = [];
    for (let x = 0; x <= width; x += 2) {
      const y = yOffset + amplitude * Math.sin((x / width) * Math.PI * frequency + phase);
      points.push(`${x === 0 ? "M" : "L"} ${x} ${y}`);
    }
    return points.join(" ");
  };

  const wave1 = generateWavePath(20, 4, 0, 50);
  const wave2 = generateWavePath(16, 3.5, 1.2, 70);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* SVG waveform background */}
      <svg
        className="absolute top-1/2 left-0 right-0 w-full opacity-35 pointer-events-none"
        style={{ transform: "translateY(-50%)" }}
        viewBox="0 0 1400 120"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="waveGrad1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-border)" />
            <stop offset="49.9%" stopColor="var(--color-border)" />
            <stop offset="50.1%" stopColor="var(--color-violet)" />
            <stop offset="100%" stopColor="var(--color-violet)" />
          </linearGradient>
          <linearGradient id="waveGrad2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-border)" />
            <stop offset="49.9%" stopColor="var(--color-border)" />
            <stop offset="50.1%" stopColor="var(--color-violet)" />
            <stop offset="100%" stopColor="var(--color-violet)" />
          </linearGradient>
        </defs>
        <g className="animate-waveform-drift-1" style={{ transformOrigin: "center" }}>
          <path d={wave1} stroke="url(#waveGrad1)" strokeWidth="1.5" />
        </g>
        <g className="animate-waveform-drift-2" style={{ transformOrigin: "center" }}>
          <path d={wave2} stroke="url(#waveGrad2)" strokeWidth="1.5" />
        </g>
        {/* Vertical cut line at midpoint */}
        <line x1="700" y1="20" x2="700" y2="100" stroke="var(--color-violet)" strokeWidth="1" />
      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <h1 className="font-display italic leading-none" style={{ fontSize: "clamp(60px, 8vw, 96px)", color: "var(--color-text-primary)" }}>
          Break the video.
        </h1>
        <h1 className="font-display italic leading-none mt-1" style={{ fontSize: "clamp(60px, 8vw, 96px)", color: "var(--color-text-primary)" }}>
          Keep the moment.
        </h1>

        <p className="font-sans font-normal text-lg text-[var(--color-text-secondary)] max-w-[520px] mt-6">
          Clypt finds and frames the clips that matter, using the semantic structure of your content.
        </p>

        <div className="flex items-center gap-4 mt-10">
          <Button variant="default">Get started free</Button>
          <a
            href="#demo"
            className="font-sans font-normal text-[var(--color-violet)] no-underline hover:underline transition-all"
          >
            See a demo →
          </a>
        </div>

        <div className="mt-12 flex items-center gap-0 text-[13px] text-[var(--color-text-muted)]">
          <span className="font-sans">Used by creators at</span>
          <span className="mx-2">·</span>
          <span className="font-heading font-medium">Nebula</span>
          <span className="mx-2">·</span>
          <span className="font-heading font-medium">Dropout</span>
          <span className="mx-2">·</span>
          <span className="font-heading font-medium">Corridor</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
