import { useReducedMotion, type MotionStyle } from "framer-motion";
import { Beam, Glow } from "shaders/react";
import { cn } from "@/lib/utils";
import ShaderSurface from "./ShaderSurface";

export type MetallicSweepVariant = "section" | "window" | "card" | "card-strong";

interface MetallicSweepShaderProps {
  className?: string;
  variant?: MetallicSweepVariant;
  accentColor?: string;
  delayMs?: number;
}

const animationByVariant: Record<MetallicSweepVariant, string> = {
  section: "shader-metallic-sweep-panel",
  window: "shader-metallic-sweep-window",
  card: "shader-metallic-sweep-card",
  "card-strong": "shader-metallic-sweep-card",
};

const placementByVariant: Record<MetallicSweepVariant, string> = {
  section: "pointer-events-none absolute inset-x-0 top-0 h-[42%]",
  window: "pointer-events-none absolute inset-x-0 top-0 h-[46%]",
  card: "pointer-events-none absolute inset-x-0 top-0 h-[58%]",
  "card-strong": "pointer-events-none absolute inset-x-0 top-0 h-[58%]",
};

const fadeMaskStyle = {
  WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 62%, rgba(0,0,0,0) 100%)",
  maskImage: "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 62%, rgba(0,0,0,0) 100%)",
} satisfies MotionStyle;

export default function MetallicSweepShader({
  className,
  variant = "section",
  accentColor = "#D8B4FE",
  delayMs = 0,
}: MetallicSweepShaderProps) {
  const prefersReducedMotion = useReducedMotion();

  const baseClassName = cn(
    placementByVariant[variant],
    !prefersReducedMotion && animationByVariant[variant],
    className,
  );

  const animationStyle = {
    ...fadeMaskStyle,
    ...(!prefersReducedMotion
      ? ({ animationDelay: `${delayMs}ms` } satisfies MotionStyle)
      : {}),
  } satisfies MotionStyle;

  if (variant === "card" || variant === "card-strong") {
    const isStrong = variant === "card-strong";

    return (
      <ShaderSurface
        className={baseClassName}
        style={animationStyle}
        renderShader={({ reducedMotion }) => (
          <Beam
            startPosition={{ x: 0.08, y: 0.04 }}
            endPosition={{ x: 0.44, y: 0.56 }}
            insideColor="#FFFFFF"
            outsideColor={accentColor}
            startThickness={reducedMotion ? 0.014 : { type: "auto-animate", mode: "ping-pong", outputMin: 0.012, outputMax: 0.018, speed: 0.08 }}
            endThickness={reducedMotion ? 0.024 : { type: "auto-animate", mode: "ping-pong", outputMin: 0.02, outputMax: 0.028, speed: 0.08 }}
            startSoftness={0.08}
            endSoftness={0.12}
            opacity={isStrong ? 0.16 : 0.09}
          />
        )}
      />
    );
  }

  return (
    <ShaderSurface
      className={baseClassName}
      style={animationStyle}
      renderShader={({ reducedMotion }) => (
        <>
          <Glow
            intensity={variant === "section" ? 0.28 : 0.22}
            threshold={0.84}
            size={variant === "section" ? 4 : 3}
          >
            <Beam
              startPosition={{ x: 0.06, y: 0.04 }}
              endPosition={{ x: 0.34, y: 0.26 }}
              insideColor="#FFFFFF"
              outsideColor={accentColor}
              startThickness={reducedMotion ? 0.018 : { type: "auto-animate", mode: "ping-pong", outputMin: 0.015, outputMax: 0.022, speed: 0.06 }}
              endThickness={reducedMotion ? 0.03 : { type: "auto-animate", mode: "ping-pong", outputMin: 0.024, outputMax: 0.034, speed: 0.06 }}
              startSoftness={0.12}
              endSoftness={0.18}
              opacity={variant === "section" ? 0.17 : 0.12}
            />
          </Glow>

          <Beam
            startPosition={{ x: 0.12, y: 0.02 }}
            endPosition={{ x: 0.28, y: 0.2 }}
            insideColor="#FFFFFF"
            outsideColor="#DDD6FE"
            startThickness={0.008}
            endThickness={0.014}
            startSoftness={0.06}
            endSoftness={0.08}
            opacity={variant === "section" ? 0.1 : 0.07}
          />
        </>
      )}
    />
  );
}
