import { Beam, DotGrid, FlowingGradient, Glow, StudioBackground } from "shaders/react";
import ShaderSurface from "./ShaderSurface";
import type { ShaderIntensity } from "./LandingAtmosphereShader";

export type PanelShaderVariant =
  | "hero-card"
  | "clip-card"
  | "search-result"
  | "inspect-header"
  | "inspect-callout"
  | "render-card"
  | "render-row"
  | "render-preview";

interface PanelShaderProps {
  variant: PanelShaderVariant;
  intensity?: ShaderIntensity;
  interactive?: boolean;
  className?: string;
  accentColor?: string;
  children?: React.ReactNode;
}

const intensityScale: Record<ShaderIntensity, number> = {
  subtle: 0.82,
  medium: 1,
  strong: 1.16,
};

function withAlpha(hex: string, alpha: string) {
  return `${hex}${alpha}`;
}

export default function PanelShader({
  variant,
  intensity = "medium",
  interactive = false,
  className,
  accentColor = "#A78BFA",
  children,
}: PanelShaderProps) {
  const scale = intensityScale[intensity];

  const fallback = {
    background:
      variant === "render-preview"
        ? "radial-gradient(circle at 50% 20%, rgba(167,139,250,0.16) 0%, rgba(10,9,9,0) 44%), linear-gradient(180deg, rgba(20,18,19,0.98) 0%, rgba(10,9,9,1) 100%)"
        : `radial-gradient(circle at 20% 0%, ${withAlpha(accentColor, "2E")} 0%, rgba(10,9,9,0) 38%), linear-gradient(180deg, rgba(20,18,19,0.92) 0%, rgba(14,12,16,0.98) 100%)`,
  } satisfies React.CSSProperties;

  return (
    <ShaderSurface
      className={className}
      fallback={fallback}
      interactive={interactive}
      children={children}
      renderShader={({ reducedMotion }) => {
        switch (variant) {
          case "hero-card":
            return (
              <>
                <FlowingGradient
                  colorA="#09090C"
                  colorB={accentColor}
                  colorC="#22D3EE"
                  colorD="#FB7185"
                  speed={reducedMotion ? 0.08 : 0.18 * scale}
                  distortion={reducedMotion ? 0.08 : 0.28 * scale}
                  opacity={0.88}
                />
                <DotGrid color="#F4F1EE" density={34} dotSize={0.13} twinkle={reducedMotion ? 0 : 0.06} opacity={0.06} />
              </>
            );
          case "clip-card":
            return (
              <>
                <StudioBackground
                  color="#120F14"
                  keyColor={accentColor}
                  fillColor="#22D3EE"
                  backColor="#FB7185"
                  keyIntensity={14 * scale}
                  fillIntensity={8 * scale}
                  backIntensity={12 * scale}
                  brightness={8}
                  ambientIntensity={reducedMotion ? 4 : 8 * scale}
                  ambientSpeed={reducedMotion ? 0.05 : 0.18}
                  opacity={0.82}
                />
                <Glow intensity={0.5 * scale} threshold={0.2} size={12}>
                  <Beam
                    startPosition={{ x: 0.1, y: 0.18 }}
                    endPosition={{ x: 0.86, y: 0.72 }}
                    insideColor="#FFFFFF"
                    outsideColor={accentColor}
                    startThickness={0.05}
                    endThickness={0.08}
                    opacity={0.12}
                  />
                </Glow>
              </>
            );
          case "search-result":
            return (
              <>
                <FlowingGradient
                  colorA="#09090C"
                  colorB={accentColor}
                  colorC="#111827"
                  colorD="#22D3EE"
                  speed={reducedMotion ? 0.05 : 0.12 * scale}
                  distortion={reducedMotion ? 0.04 : 0.16 * scale}
                  opacity={0.7}
                />
                <Beam
                  startPosition={{ x: 0.04, y: 0.16 }}
                  endPosition={{ x: 0.96, y: 0.62 }}
                  insideColor="#FFFFFF"
                  outsideColor={accentColor}
                  startThickness={0.05}
                  endThickness={0.09}
                  opacity={0.12}
                />
              </>
            );
          case "inspect-header":
            return (
              <FlowingGradient
                colorA="#09090B"
                colorB={accentColor}
                colorC="#1E293B"
                colorD="#22D3EE"
                speed={reducedMotion ? 0.04 : 0.1 * scale}
                distortion={reducedMotion ? 0.04 : 0.12 * scale}
                opacity={0.68}
              />
            );
          case "inspect-callout":
            return (
              <>
                <StudioBackground
                  color="#111017"
                  keyColor={accentColor}
                  fillColor="#60A5FA"
                  backColor="#A78BFA"
                  keyIntensity={10 * scale}
                  fillIntensity={8 * scale}
                  backIntensity={8 * scale}
                  brightness={8}
                  ambientIntensity={reducedMotion ? 4 : 8}
                  ambientSpeed={reducedMotion ? 0.04 : 0.14}
                  opacity={0.76}
                />
                <DotGrid color="#FFFFFF" density={22} dotSize={0.14} twinkle={0} opacity={0.05} />
              </>
            );
          case "render-card":
            return (
              <>
                <StudioBackground
                  color="#110F13"
                  keyColor={accentColor}
                  fillColor="#22D3EE"
                  backColor="#FB7185"
                  keyIntensity={16 * scale}
                  fillIntensity={10 * scale}
                  backIntensity={12 * scale}
                  brightness={10}
                  ambientIntensity={reducedMotion ? 4 : 10 * scale}
                  ambientSpeed={reducedMotion ? 0.04 : 0.18}
                  opacity={0.8}
                />
                <DotGrid color="#C4B5FD" density={26} dotSize={0.12} twinkle={0} opacity={0.04} />
              </>
            );
          case "render-row":
            return (
              <FlowingGradient
                colorA="#09090A"
                colorB={accentColor}
                colorC="#0F172A"
                colorD="#22D3EE"
                speed={reducedMotion ? 0.03 : 0.08 * scale}
                distortion={reducedMotion ? 0.03 : 0.1 * scale}
                opacity={0.5}
              />
            );
          case "render-preview":
            return (
              <>
                <StudioBackground
                  color="#0E0C10"
                  keyColor="#A78BFA"
                  fillColor="#22D3EE"
                  backColor="#FB7185"
                  keyIntensity={20 * scale}
                  fillIntensity={12 * scale}
                  backIntensity={14 * scale}
                  brightness={12}
                  ambientIntensity={reducedMotion ? 5 : 12 * scale}
                  ambientSpeed={reducedMotion ? 0.05 : 0.22}
                  opacity={0.82}
                />
                <Beam
                  startPosition={{ x: 0.12, y: 0.16 }}
                  endPosition={{ x: 0.86, y: 0.78 }}
                  insideColor="#DDD6FE"
                  outsideColor="#22D3EE"
                  startThickness={0.05}
                  endThickness={0.07}
                  opacity={0.08}
                />
              </>
            );
        }
      }}
    />
  );
}
