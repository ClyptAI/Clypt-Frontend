import { Beam, DotGrid, FlowingGradient, StudioBackground } from "shaders/react";
import ShaderSurface from "./ShaderSurface";
import type { ShaderIntensity } from "./LandingAtmosphereShader";

export type ThumbnailShaderVariant = "default" | "analyzing" | "complete" | "failed";

interface ThumbnailShaderProps {
  variant: ThumbnailShaderVariant;
  intensity?: ShaderIntensity;
  interactive?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const intensityScale: Record<ShaderIntensity, number> = {
  subtle: 0.8,
  medium: 1,
  strong: 1.15,
};

export default function ThumbnailShader({
  variant,
  intensity = "medium",
  interactive = false,
  className,
  children,
}: ThumbnailShaderProps) {
  const scale = intensityScale[intensity];

  return (
    <ShaderSurface
      className={className}
      interactive={interactive}
      children={children}
      fallback={{
        background:
          variant === "analyzing"
            ? "radial-gradient(circle at 50% 0%, rgba(34,211,238,0.22) 0%, rgba(10,9,9,0) 42%), linear-gradient(180deg, rgba(14,21,27,0.98) 0%, rgba(10,9,9,1) 100%)"
            : variant === "complete"
              ? "radial-gradient(circle at 50% 0%, rgba(167,139,250,0.2) 0%, rgba(10,9,9,0) 42%), linear-gradient(180deg, rgba(20,16,25,0.98) 0%, rgba(10,9,9,1) 100%)"
              : variant === "failed"
                ? "radial-gradient(circle at 50% 0%, rgba(251,113,133,0.18) 0%, rgba(10,9,9,0) 42%), linear-gradient(180deg, rgba(30,14,19,0.98) 0%, rgba(10,9,9,1) 100%)"
                : "linear-gradient(180deg, rgba(20,18,19,0.98) 0%, rgba(10,9,9,1) 100%)",
      }}
      renderShader={({ reducedMotion }) => {
        switch (variant) {
          case "analyzing":
            return (
              <>
                <FlowingGradient
                  colorA="#081014"
                  colorB="#0E7490"
                  colorC="#22D3EE"
                  colorD="#A78BFA"
                  speed={reducedMotion ? 0.05 : 0.14 * scale}
                  distortion={reducedMotion ? 0.05 : 0.18 * scale}
                  opacity={0.84}
                />
                <Beam
                  startPosition={{ x: 0.08, y: 0.18 }}
                  endPosition={{ x: 0.9, y: 0.74 }}
                  insideColor="#67E8F9"
                  outsideColor="#A78BFA"
                  startThickness={0.06}
                  endThickness={0.08}
                  opacity={0.12}
                />
              </>
            );
          case "complete":
            return (
              <>
                <StudioBackground
                  color="#120F15"
                  keyColor="#A78BFA"
                  fillColor="#22D3EE"
                  backColor="#4ADE80"
                  keyIntensity={16 * scale}
                  fillIntensity={9 * scale}
                  backIntensity={10 * scale}
                  brightness={9}
                  ambientIntensity={reducedMotion ? 3 : 8}
                  ambientSpeed={reducedMotion ? 0.04 : 0.12}
                  opacity={0.86}
                />
                <DotGrid color="#FFFFFF" density={24} dotSize={0.12} twinkle={0} opacity={0.05} />
              </>
            );
          case "failed":
            return (
              <>
                <FlowingGradient
                  colorA="#13090D"
                  colorB="#7F1D1D"
                  colorC="#FB7185"
                  colorD="#FBB249"
                  speed={reducedMotion ? 0.03 : 0.08 * scale}
                  distortion={reducedMotion ? 0.03 : 0.12 * scale}
                  opacity={0.78}
                />
                <DotGrid color="#FECDD3" density={22} dotSize={0.15} twinkle={0} opacity={0.05} />
              </>
            );
          default:
            return (
              <>
                <FlowingGradient
                  colorA="#09090B"
                  colorB="#1E1B4B"
                  colorC="#0F766E"
                  colorD="#A78BFA"
                  speed={reducedMotion ? 0.03 : 0.08 * scale}
                  distortion={reducedMotion ? 0.03 : 0.12 * scale}
                  opacity={0.74}
                />
                <DotGrid color="#E5E7EB" density={24} dotSize={0.12} twinkle={0} opacity={0.04} />
              </>
            );
        }
      }}
    />
  );
}
