import { memo, useState } from "react";
import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

/* ── Structural edge ── */
export const StructuralEdge = memo(function StructuralEdge(props: EdgeProps) {
  const [path] = getBezierPath({
    sourceX: props.sourceX, sourceY: props.sourceY, sourcePosition: props.sourcePosition,
    targetX: props.targetX, targetY: props.targetY, targetPosition: props.targetPosition,
    curvature: 0.2,
  });

  const hasHover      = !!(props.data as any)?._hasHover;
  const isHighlighted = !!(props.data as any)?._isHoverHighlighted;
  const isEdgeHovered = !!(props.data as any)?._isEdgeHovered;
  const showGlow      = isHighlighted || isEdgeHovered;
  const isDimmed      = hasHover && !showGlow;

  return (
    <g style={{ transition: "opacity 0.15s" }} opacity={showGlow ? 1 : isDimmed ? 0.08 : 0.5}>
      <BaseEdge
        {...props}
        path={path}
        style={{ stroke: "#302D35", strokeWidth: showGlow ? 1.5 : 1 }}
      />
    </g>
  );
});

/* ── Rhetorical edge (shared logic) ── */
function RhetoricalEdgeInner({
  props,
  color,
  opacity: baseOpacity,
  dash,
  wide,
}: {
  props: EdgeProps;
  color: string;
  opacity: number;
  dash?: string;
  wide?: boolean;
}) {
  const [localHovered, setLocalHovered] = useState(false);

  const [path, labelX, labelY] = getBezierPath({
    sourceX: props.sourceX, sourceY: props.sourceY, sourcePosition: props.sourcePosition,
    targetX: props.targetX, targetY: props.targetY, targetPosition: props.targetPosition,
    curvature: wide ? 0.6 : 0.25,
  });

  const isHighlighted = !!(props.data as any)?._isHoverHighlighted;
  const isEdgeHovered = !!(props.data as any)?._isEdgeHovered;
  const hasHover      = !!(props.data as any)?._hasHover;
  const showGlow      = isHighlighted || isEdgeHovered || localHovered;
  const isDimmed      = hasHover && !isHighlighted && !isEdgeHovered && !localHovered;
  const edgeOpacity   = showGlow ? 1.0 : isDimmed ? 0.08 : baseOpacity;

  return (
    <g
      onMouseEnter={() => setLocalHovered(true)}
      onMouseLeave={() => setLocalHovered(false)}
      style={{ opacity: edgeOpacity, transition: "opacity 0.15s" }}
    >
      {/* Wider invisible hit area */}
      <path d={path} fill="none" stroke="transparent" strokeWidth={12} />

      {/* Glow halo — conditionally mounted */}
      {showGlow && (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={isEdgeHovered ? 8 : 6}
          strokeLinecap="round"
          style={{
            opacity: isEdgeHovered ? 0.4 : 0.28,
            filter: `drop-shadow(0 0 ${isEdgeHovered ? "6px" : "4px"} ${color})`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Main edge */}
      <BaseEdge
        {...props}
        path={path}
        style={{
          stroke: color,
          strokeWidth: showGlow ? 2.5 : 1.5,
          strokeDasharray: dash,
          transition: "stroke-width 0.15s",
        }}
      />

      {/*
        Moving dot — only mounts on highlighted (connected) edges.
        Conditional mount = starts fresh each time = no restart glitch.
      */}
      {isHighlighted && (
        <circle
          r="3"
          fill={color}
          filter={`drop-shadow(0 0 3px ${color})`}
          style={{
            opacity: 0,
            animationName: "clypt-dot-appear",
            animationDuration: "0.001s",
            animationDelay: "0.075s",
            animationFillMode: "forwards",
            animationTimingFunction: "linear",
          }}
        >
          <animateMotion dur="1.5s" repeatCount="indefinite" path={path} />
        </circle>
      )}

      {/* Edge label — visible when hovered */}
      {props.label && showGlow && (
        <foreignObject
          x={labelX - 50} y={labelY - 12}
          width={100} height={24}
          style={{ overflow: "visible", pointerEvents: "none" }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <span style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 10,
              color,
              background: "rgba(10,9,9,0.92)",
              border: `1px solid ${color}`,
              padding: "2px 6px",
              borderRadius: 3,
              whiteSpace: "nowrap",
            }}>
              {props.label}
            </span>
          </div>
        </foreignObject>
      )}
    </g>
  );
}

export const StrongRhetoricalEdge = memo(function StrongRhetoricalEdge(props: EdgeProps) {
  return <RhetoricalEdgeInner props={props} color="#A78BFA" opacity={0.8} />;
});

export const ModerateRhetoricalEdge = memo(function ModerateRhetoricalEdge(props: EdgeProps) {
  return <RhetoricalEdgeInner props={props} color="#60A5FA" opacity={0.7} />;
});

export const LongRangeEdge = memo(function LongRangeEdge(props: EdgeProps) {
  return <RhetoricalEdgeInner props={props} color="#FBB249" opacity={0.75} dash="6 4" wide />;
});
