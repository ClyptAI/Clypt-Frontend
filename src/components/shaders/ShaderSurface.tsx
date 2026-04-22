import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { Shader } from "shaders/react";
import { cn } from "@/lib/utils";

interface ShaderRenderContext {
  interactive: boolean;
  reducedMotion: boolean;
}

interface ShaderSurfaceProps {
  className?: string;
  style?: CSSProperties;
  fallback?: CSSProperties;
  interactive?: boolean;
  children?: ReactNode;
  contentClassName?: string;
  renderShader: (context: ShaderRenderContext) => ReactNode;
}

export default function ShaderSurface({
  className,
  style,
  fallback,
  interactive = false,
  children,
  contentClassName,
  renderShader,
}: ShaderSurfaceProps) {
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn("relative overflow-hidden", className)} style={style}>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={fallback}
      />

      {mounted ? (
        <Shader
          aria-hidden="true"
          disableTelemetry={true}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            interactive ? undefined : "pointer-events-none",
          )}
          style={{ opacity: ready ? 1 : 0 }}
          onReady={() => setReady(true)}
        >
          {renderShader({ interactive, reducedMotion })}
        </Shader>
      ) : null}

      {children ? (
        <div className={cn("relative z-10", contentClassName)}>{children}</div>
      ) : null}
    </div>
  );
}
