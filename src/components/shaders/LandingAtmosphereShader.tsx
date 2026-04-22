import { DotGrid, FlowingGradient } from "shaders/react";
import ShaderSurface from "./ShaderSurface";

export type ShaderIntensity = "subtle" | "medium" | "strong";

export type LandingAtmosphereVariant =
  | "page"
  | "hero"
  | "section-timeline"
  | "section-graph"
  | "section-retrieval"
  | "section-grounding"
  | "section-render"
  | "cta"
  | "search"
  | "auth"
  | "analyzer";

interface LandingAtmosphereShaderProps {
  variant: LandingAtmosphereVariant;
  intensity?: ShaderIntensity;
  interactive?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const intensityScale: Record<ShaderIntensity, number> = {
  subtle: 0.8,
  medium: 1,
  strong: 1.2,
};

function pageFallback(scale: number) {
  return {
    background:
      "radial-gradient(circle at 50% 0%, rgba(167,139,250,0.14) 0%, rgba(10,9,9,0) 38%), radial-gradient(circle at 18% 18%, rgba(34,211,238,0.08) 0%, rgba(10,9,9,0) 24%), linear-gradient(180deg, rgba(14,11,22,0.98) 0%, rgba(10,9,9,1) 36%, rgba(10,9,9,1) 100%)",
    filter: `saturate(${1 + (scale - 1) * 0.1})`,
  } satisfies React.CSSProperties;
}

function sectionFallback(accent: string) {
  return {
    background: `radial-gradient(circle at 50% 0%, ${accent}16 0%, rgba(10,9,9,0) 42%), linear-gradient(180deg, rgba(11,10,15,0.96) 0%, rgba(9,9,11,0.94) 100%)`,
  } satisfies React.CSSProperties;
}

export default function LandingAtmosphereShader({
  variant,
  intensity = "medium",
  interactive = false,
  className,
  children,
}: LandingAtmosphereShaderProps) {
  const scale = intensityScale[intensity];

  const fallback =
    variant === "page" || variant === "hero"
      ? pageFallback(scale)
      : variant === "search"
        ? sectionFallback("#22D3EE")
        : variant === "auth"
          ? sectionFallback("#A78BFA")
          : variant === "analyzer"
            ? sectionFallback("#22D3EE")
            : variant === "cta"
              ? sectionFallback("#A78BFA")
              : variant === "section-graph"
                ? sectionFallback("#A78BFA")
                : variant === "section-timeline"
                  ? sectionFallback("#22D3EE")
                  : variant === "section-retrieval"
                    ? sectionFallback("#FBB249")
                    : variant === "section-grounding"
                      ? sectionFallback("#FB923C")
                      : sectionFallback("#FB7185");

  return (
    <ShaderSurface
      className={className}
      fallback={fallback}
      interactive={interactive}
      children={children}
      renderShader={({ reducedMotion }) => {
        switch (variant) {
          case "page":
            return (
              <>
                <FlowingGradient
                  colorA="#09090B"
                  colorB="#1D1538"
                  colorC="#143041"
                  colorD="#29174A"
                  speed={reducedMotion ? 0.03 : 0.08 * scale}
                  distortion={reducedMotion ? 0.04 : 0.12 * scale}
                  opacity={0.44}
                />
                <DotGrid color="#C4B5FD" density={40} dotSize={0.16} twinkle={0} opacity={0.08} />
              </>
            );
          case "hero":
            return (
              <>
                <FlowingGradient
                  colorA="#08070C"
                  colorB="#26134A"
                  colorC="#18374B"
                  colorD="#43205F"
                  speed={reducedMotion ? 0.04 : 0.1 * scale}
                  distortion={reducedMotion ? 0.05 : 0.15 * scale}
                  opacity={0.64}
                />
                <DotGrid color="#F4F1EE" density={52} dotSize={0.12} twinkle={0} opacity={0.08} />
              </>
            );
          case "section-timeline":
            return (
              <>
                <FlowingGradient
                  colorA="#09090E"
                  colorB="#1A1740"
                  colorC="#132A39"
                  colorD="#3A2160"
                  speed={reducedMotion ? 0.03 : 0.08 * scale}
                  distortion={reducedMotion ? 0.04 : 0.1 * scale}
                  opacity={0.42}
                />
                <DotGrid color="#C4B5FD" density={34} dotSize={0.16} twinkle={0} opacity={0.07} />
              </>
            );
          case "section-graph":
            return (
              <>
                <FlowingGradient
                  colorA="#0A0910"
                  colorB="#24134A"
                  colorC="#1A2547"
                  colorD="#3A1D55"
                  speed={reducedMotion ? 0.03 : 0.08 * scale}
                  distortion={reducedMotion ? 0.04 : 0.1 * scale}
                  opacity={0.42}
                />
                <DotGrid color="#C4B5FD" density={34} dotSize={0.15} twinkle={0} opacity={0.08} />
              </>
            );
          case "section-retrieval":
            return (
              <>
                <FlowingGradient
                  colorA="#0A0910"
                  colorB="#26174A"
                  colorC="#38205A"
                  colorD="#4A2352"
                  speed={reducedMotion ? 0.03 : 0.08 * scale}
                  distortion={reducedMotion ? 0.04 : 0.1 * scale}
                  opacity={0.42}
                />
                <DotGrid color="#C4B5FD" density={36} dotSize={0.16} twinkle={0} opacity={0.07} />
              </>
            );
          case "section-grounding":
            return (
              <>
                <FlowingGradient
                  colorA="#0A0910"
                  colorB="#231347"
                  colorC="#381C57"
                  colorD="#4F2963"
                  speed={reducedMotion ? 0.03 : 0.08 * scale}
                  distortion={reducedMotion ? 0.04 : 0.1 * scale}
                  opacity={0.4}
                />
                <DotGrid color="#D8B4FE" density={34} dotSize={0.16} twinkle={0} opacity={0.07} />
              </>
            );
          case "section-render":
            return (
              <>
                <FlowingGradient
                  colorA="#09090A"
                  colorB="#241A42"
                  colorC="#16263A"
                  colorD="#41205A"
                  speed={reducedMotion ? 0.03 : 0.08 * scale}
                  distortion={reducedMotion ? 0.04 : 0.1 * scale}
                  opacity={0.42}
                />
                <DotGrid color="#C4B5FD" density={32} dotSize={0.15} twinkle={0} opacity={0.06} />
              </>
            );
          case "cta":
            return (
              <>
                <FlowingGradient
                  colorA="#0A0909"
                  colorB="#24194A"
                  colorC="#163342"
                  colorD="#3D214F"
                  speed={reducedMotion ? 0.03 : 0.08 * scale}
                  distortion={reducedMotion ? 0.04 : 0.1 * scale}
                  opacity={0.48}
                />
                <DotGrid color="#C4B5FD" density={30} dotSize={0.15} twinkle={0} opacity={0.06} />
              </>
            );
          case "search":
            return (
              <>
                <FlowingGradient
                  colorA="#09090B"
                  colorB="#10263A"
                  colorC="#1F1D49"
                  colorD="#13363E"
                  speed={reducedMotion ? 0.02 : 0.06 * scale}
                  distortion={reducedMotion ? 0.03 : 0.08 * scale}
                  opacity={0.32}
                />
                <DotGrid color="#67E8F9" density={32} dotSize={0.14} twinkle={0} opacity={0.06} />
              </>
            );
          case "auth":
            return (
              <>
                <FlowingGradient
                  colorA="#09090A"
                  colorB="#24164A"
                  colorC="#151824"
                  colorD="#2E2A55"
                  speed={reducedMotion ? 0.02 : 0.06 * scale}
                  distortion={reducedMotion ? 0.03 : 0.08 * scale}
                  opacity={0.3}
                />
                <DotGrid color="#C4B5FD" density={28} dotSize={0.15} twinkle={0} opacity={0.05} />
              </>
            );
          case "analyzer":
            return (
              <>
                <FlowingGradient
                  colorA="#09090B"
                  colorB="#12313A"
                  colorC="#17192A"
                  colorD="#271D4A"
                  speed={reducedMotion ? 0.02 : 0.06 * scale}
                  distortion={reducedMotion ? 0.03 : 0.08 * scale}
                  opacity={0.36}
                />
                <DotGrid color="#67E8F9" density={28} dotSize={0.15} twinkle={0} opacity={0.05} />
              </>
            );
        }
      }}
    />
  );
}
