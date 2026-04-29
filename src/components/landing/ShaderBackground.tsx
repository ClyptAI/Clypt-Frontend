import { useEffect, useState, type CSSProperties } from "react";
import {
  MeshGradient,
  Warp,
  GodRays,
  GemSmoke,
  PulsingBorder,
  DotGrid,
  NeuroNoise,
  Spiral,
} from "@paper-design/shaders-react";

/**
 * Variant library — every variant echoes the section's existing accent.
 * Palettes pull from Clypt's index.css token values:
 *   violet  #A78BFA   amber  #FBB249   cyan  #22D3EE   bg  #0A0909
 */
export type ShaderVariant =
  | "hero"
  | "auth"
  | "how-it-works"
  | "pipeline-cool"
  | "pipeline-warm"
  | "pipeline-deep"
  | "showcase"
  | "try-it"
  | "onboard-aurora"
  | "onboard-analyzing"
  | "onboard-ready";

export type ShaderIntensity = "subtle" | "normal" | "bold";

interface ShaderBackgroundProps {
  variant?: ShaderVariant;
  intensity?: ShaderIntensity;
  className?: string;
  /** Pause WebGL work and show a static fallback until the layer is near the viewport. */
  pauseWhenOffscreen?: boolean;
  /** IntersectionObserver root margin used when pauseWhenOffscreen is enabled. */
  viewportMargin?: string;
  /** Larger IntersectionObserver margin used to pre-mount shader canvases before they are active. */
  prewarmMargin?: string;
  /** Delay before unmounting an offscreen shader, preventing boundary flicker during scroll. */
  unmountDelayMs?: number;
  /** When false, render one high-resolution shader frame and stop the animation loop. */
  animated?: boolean;
  /** Static shader frame to render when animated is false. */
  frame?: number;
  /** Paper shader pixel-ratio floor. Lower values reduce GPU fill-rate on large canvases. */
  minPixelRatio?: number;
  /** Paper shader physical-pixel cap. Lower values reduce recurring WebGL work. */
  maxPixelCount?: number;
  /** Inline style overrides (positioning, opacity, zIndex). */
  style?: CSSProperties;
}

const BG = "#0A0909";
const VIOLET = "#A78BFA";
const VIOLET_DEEP = "#241452";
const VIOLET_DIM = "#1a1035";
const AMBER = "#FBB249";
const CYAN = "#22D3EE";
const SKY = "#38BDF8";

const intensityMap: Record<ShaderIntensity, number> = {
  subtle: 0.55,
  normal: 1,
  bold: 1.35,
};

/**
 * Animated Paper Design shader background. Sits behind content
 * (pointer-events: none) and falls back to a static gradient
 * when prefers-reduced-motion is on.
 */
const ShaderBackground = ({
  variant = "hero",
  intensity = "normal",
  className,
  pauseWhenOffscreen = false,
  viewportMargin = "0px",
  prewarmMargin = "35% 0px 35% 0px",
  unmountDelayMs = 450,
  animated = true,
  frame = 0,
  minPixelRatio = 1,
  maxPixelCount = 1920 * 1080,
  style,
}: ShaderBackgroundProps) => {
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(!pauseWhenOffscreen);
  const [shouldRenderShader, setShouldRenderShader] = useState(!pauseWhenOffscreen);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (!pauseWhenOffscreen) {
      setInView(true);
      setShouldRenderShader(true);
      return;
    }

    if (!rootEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      {
        root: null,
        rootMargin: viewportMargin,
        threshold: 0.01,
      }
    );

    observer.observe(rootEl);
    return () => observer.disconnect();
  }, [pauseWhenOffscreen, rootEl, viewportMargin]);

  useEffect(() => {
    if (!pauseWhenOffscreen) {
      setShouldRenderShader(true);
      return;
    }

    if (!rootEl) return;

    let unmountTimeout: ReturnType<typeof window.setTimeout> | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (unmountTimeout) {
            window.clearTimeout(unmountTimeout);
            unmountTimeout = undefined;
          }
          setShouldRenderShader(true);
          return;
        }

        unmountTimeout = window.setTimeout(() => {
          setShouldRenderShader(false);
          unmountTimeout = undefined;
        }, unmountDelayMs);
      },
      {
        root: null,
        rootMargin: prewarmMargin,
        threshold: 0.01,
      }
    );

    observer.observe(rootEl);
    return () => {
      if (unmountTimeout) window.clearTimeout(unmountTimeout);
      observer.disconnect();
    };
  }, [pauseWhenOffscreen, prewarmMargin, rootEl, unmountDelayMs]);

  const opacityScale = intensityMap[intensity];

  const baseStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    overflow: "hidden",
    ...style,
  };

  const fallbackBg = staticFallback(variant);
  const shaderRootStyle: CSSProperties = {
    ...baseStyle,
    background: fallbackBg,
  };
  const fillStyle: CSSProperties = { width: "100%", height: "100%" };
  const shaderPerfProps = {
    minPixelRatio,
    maxPixelCount,
  };
  const shaderMotionProps = (speed: number) => ({
    speed: animated && inView ? speed : 0,
    frame: animated ? undefined : frame,
  });

  // ── Static fallbacks: reduced motion or fully offscreen paused state ──
  if (reduced || !shouldRenderShader) {
    return (
      <div
        ref={setRootEl}
        aria-hidden
        className={className}
        style={{ ...baseStyle, background: fallbackBg, opacity: opacityScale }}
      />
    );
  }

  // ── Variant render ──
  switch (variant) {
    case "auth": {
      return (
        <div ref={setRootEl} aria-hidden className={className} style={shaderRootStyle}>
          <MeshGradient
            {...shaderPerfProps}
            colors={[BG, VIOLET_DIM, VIOLET_DEEP, "#5B21B6", "#1a1035"]}
            distortion={0.9}
            swirl={0.6}
            {...shaderMotionProps(0.32)}
            style={fillStyle}
          />
          <Overlay
            background="linear-gradient(180deg, rgba(10,9,9,0.32) 0%, rgba(10,9,9,0.42) 100%)"
          />
        </div>
      );
    }

    case "how-it-works": {
      return (
        <div ref={setRootEl} aria-hidden className={className} style={shaderRootStyle}>
          <Warp
            {...shaderPerfProps}
            colors={[BG, VIOLET_DIM, VIOLET, BG]}
            proportion={0.45}
            softness={0.95}
            distortion={0.55}
            swirl={0.35}
            swirlIterations={6}
            shapeScale={0.5}
            {...shaderMotionProps(0.18)}
            style={{ ...fillStyle, opacity: 0.55 * opacityScale }}
          />
          <Overlay background="radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(10,9,9,0.65) 100%)" />
        </div>
      );
    }

    case "pipeline-cool": {
      return (
        <div ref={setRootEl} aria-hidden className={className} style={shaderRootStyle}>
          <MeshGradient
            {...shaderPerfProps}
            colors={[BG, VIOLET_DIM, VIOLET, CYAN, BG]}
            distortion={0.7}
            swirl={0.4}
            {...shaderMotionProps(0.18)}
            style={{ ...fillStyle, opacity: 0.6 * opacityScale }}
          />
          <Overlay background="rgba(10,9,9,0.45)" />
        </div>
      );
    }

    case "pipeline-warm": {
      return (
        <div ref={setRootEl} aria-hidden className={className} style={shaderRootStyle}>
          <MeshGradient
            {...shaderPerfProps}
            colors={[BG, VIOLET_DIM, VIOLET, AMBER, BG]}
            distortion={0.75}
            swirl={0.45}
            {...shaderMotionProps(0.2)}
            style={{ ...fillStyle, opacity: 0.55 * opacityScale }}
          />
          <Overlay background="rgba(10,9,9,0.5)" />
        </div>
      );
    }

    case "pipeline-deep": {
      return (
        <div ref={setRootEl} aria-hidden className={className} style={shaderRootStyle}>
          <MeshGradient
            {...shaderPerfProps}
            colors={[BG, BG, "#1a1035", "#2A1758", "#A78BFA"]}
            distortion={0.85}
            swirl={0.5}
            {...shaderMotionProps(0.18)}
            style={{ ...fillStyle, opacity: 0.65 * opacityScale }}
          />
          <Overlay background="radial-gradient(ellipse 90% 70% at 50% 50%, transparent 20%, rgba(10,9,9,0.7) 100%)" />
        </div>
      );
    }

    case "showcase": {
      return (
        <div ref={setRootEl} aria-hidden className={className} style={shaderRootStyle}>
          <GodRays
            {...shaderPerfProps}
            colorBack={BG}
            colorBloom={VIOLET}
            colors={[VIOLET, AMBER, "#7C3AED"]}
            bloom={0.45}
            intensity={0.35}
            density={0.55}
            spotty={0.35}
            midSize={0.45}
            midIntensity={0.4}
            offsetY={-0.4}
            {...shaderMotionProps(0.3)}
            style={{ ...fillStyle, opacity: 0.7 * opacityScale }}
          />
          <Overlay background="radial-gradient(ellipse 80% 60% at 50% 40%, transparent 20%, rgba(10,9,9,0.7) 90%)" />
        </div>
      );
    }

    case "try-it": {
      return (
        <div ref={setRootEl} aria-hidden className={className} style={shaderRootStyle}>
          <DotGrid
            {...shaderPerfProps}
            colorBack="#00000000"
            colorFill={VIOLET}
            colorStroke="#00000000"
            size={2}
            gapX={28}
            gapY={28}
            strokeWidth={0}
            sizeRange={0.4}
            opacityRange={0.7}
            shape="circle"
            style={{ ...fillStyle, opacity: 0.25 * opacityScale }}
          />
          <PulsingBorder
            {...shaderPerfProps}
            colorBack="#00000000"
            colors={[VIOLET, "#7C3AED", CYAN]}
            roundness={0.45}
            thickness={0.06}
            softness={0.9}
            intensity={0.5}
            bloom={0.6}
            spots={3}
            spotSize={0.35}
            pulse={0.45}
            smoke={0.35}
            smokeSize={0.4}
            marginLeft={0.05}
            marginRight={0.05}
            marginTop={0.05}
            marginBottom={0.05}
            {...shaderMotionProps(0.4)}
            style={{ ...fillStyle, opacity: 0.85 * opacityScale }}
          />
          <Overlay background="radial-gradient(ellipse 70% 70% at 50% 50%, transparent 35%, rgba(10,9,9,0.55) 100%)" />
        </div>
      );
    }

    case "onboard-aurora": {
      return (
        <div ref={setRootEl} aria-hidden className={className} style={shaderRootStyle}>
          <MeshGradient
            {...shaderPerfProps}
            colors={[BG, VIOLET_DEEP, "#7C5CD9", "#2a5b8c", BG]}
            distortion={0.85}
            swirl={0.5}
            {...shaderMotionProps(0.22)}
            style={fillStyle}
          />
          <Overlay background="linear-gradient(180deg, rgba(10,9,9,0.35) 0%, rgba(10,9,9,0.5) 100%)" />
        </div>
      );
    }

    case "onboard-analyzing": {
      return (
        <div ref={setRootEl} aria-hidden className={className} style={shaderRootStyle}>
          <MeshGradient
            {...shaderPerfProps}
            colors={[BG, VIOLET_DEEP, "#7C5CD9", "#2a5b8c", BG]}
            distortion={0.85}
            swirl={0.55}
            {...shaderMotionProps(0.4)}
            style={fillStyle}
          />
          <Overlay background="radial-gradient(ellipse 80% 65% at 50% 50%, transparent 25%, rgba(10,9,9,0.55) 90%)" />
        </div>
      );
    }

    case "onboard-ready": {
      return (
        <div ref={setRootEl} aria-hidden className={className} style={shaderRootStyle}>
          <Spiral
            {...shaderPerfProps}
            colorBack={BG}
            colorFront="#7C5CD9"
            density={0.5}
            distortion={0.35}
            noiseFrequency={0.3}
            noise={0.25}
            softness={0.8}
            {...shaderMotionProps(0.35)}
            style={fillStyle}
          />
          <Overlay background="linear-gradient(180deg, rgba(10,9,9,0.35) 0%, rgba(10,9,9,0.5) 100%)" />
        </div>
      );
    }

    case "hero":
    default: {
      return (
        <div ref={setRootEl} aria-hidden className={className} style={shaderRootStyle}>
          <GemSmoke
            {...shaderPerfProps}
            colorBack={BG}
            colorInner="#09050F"
            colors={[VIOLET_DEEP, VIOLET_DIM, "#5B21B6", "#7C3AED", VIOLET, "#DDD6FE"]}
            outerGlow={0.78}
            innerGlow={0.86}
            innerDistortion={0.56}
            outerDistortion={0.74}
            offset={0.12}
            angle={-18}
            size={0.92}
            shape="diamond"
            scale={1.45}
            {...shaderMotionProps(0.18)}
            style={{ ...fillStyle, opacity: 0.82 * opacityScale }}
          />
          <Overlay background="linear-gradient(90deg, hsl(var(--background) / 0.76) 0%, hsl(var(--background) / 0.48) 42%, hsl(var(--background) / 0.2) 100%), radial-gradient(ellipse 86% 72% at 72% 42%, transparent 0%, hsl(var(--background) / 0.22) 58%, hsl(var(--background) / 0.82) 100%)" />
        </div>
      );
    }
  }
};

/** Absolute-positioned legibility / fade overlay. */
const Overlay = ({ background }: { background: string }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background,
      pointerEvents: "none",
    }}
  />
);

function staticFallback(variant: ShaderVariant): string {
  switch (variant) {
    case "auth":
      return "radial-gradient(ellipse at 30% 20%, rgba(167,139,250,0.25) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(34,211,238,0.18) 0%, transparent 60%), #0A0909";
    case "how-it-works":
      return "radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.12) 0%, transparent 65%), #0A0909";
    case "pipeline-cool":
      return "radial-gradient(ellipse at 30% 50%, rgba(167,139,250,0.16) 0%, transparent 60%), radial-gradient(ellipse at 75% 50%, rgba(34,211,238,0.12) 0%, transparent 60%), #0A0909";
    case "pipeline-warm":
      return "radial-gradient(ellipse at 30% 50%, rgba(167,139,250,0.16) 0%, transparent 60%), radial-gradient(ellipse at 75% 50%, rgba(251,178,73,0.14) 0%, transparent 60%), #0A0909";
    case "showcase":
      return "radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.22) 0%, transparent 65%), radial-gradient(ellipse at 50% 100%, rgba(251,178,73,0.14) 0%, transparent 60%), #0A0909";
    case "try-it":
      return "radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.22) 0%, transparent 60%), #0A0909";
    case "onboard-aurora":
      return "radial-gradient(ellipse at 30% 20%, rgba(167,139,250,0.22) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(34,211,238,0.16) 0%, transparent 60%), #0A0909";
    case "onboard-analyzing":
      return "radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.32) 0%, transparent 60%), #0A0909";
    case "onboard-ready":
      return "radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.28) 0%, transparent 55%), radial-gradient(ellipse at 60% 70%, rgba(34,211,238,0.18) 0%, transparent 60%), #0A0909";
    case "hero":
    default:
      return "radial-gradient(ellipse 72% 62% at 72% 42%, rgba(167,139,250,0.3) 0%, rgba(124,58,237,0.2) 36%, rgba(91,33,182,0.12) 52%, transparent 72%), radial-gradient(ellipse at 42% 20%, rgba(36,20,82,0.44) 0%, transparent 64%), hsl(var(--background))";
  }
}

export default ShaderBackground;
