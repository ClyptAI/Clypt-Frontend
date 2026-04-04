import { memo, useState } from "react";
import {
  BaseEdge,
  getBezierPath,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";

/* ── Structural edge ── */
export const StructuralEdge = memo(function StructuralEdge(props: EdgeProps) {
  const [path] = getStraightPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
  });

  const hasHover = !!(props.data as any)?._hasHover;
  const isHighlighted = !!(props.data as any)?._isHoverHighlighted;
  const isEdgeHovered = !!(props.data as any)?._isEdgeHovered;
  const showGlow = isHighlighted || isEdgeHovered;
  const isDimmed = hasHover && !showGlow;

  return (
    <g style={{ transition: "opacity 150ms ease" }} opacity={showGlow ? 1 : isDimmed ? 0.1 : 0.5}>
      <BaseEdge
        {...props}
        path={path}
        style={{ stroke: "#302D35", strokeWidth: 1, opacity: showGlow ? 1 : 0.5 }}
        markerEnd="url(#arrow-structural)"
      />
    </g>
  );
});

/* ── Rhetorical edge helper ── */
function RhetoricalEdge({
  props,
  color,
  opacity: baseOpacity,
  markerEnd,
  dash,
  wide,
}: {
  props: EdgeProps;
  color: string;
  opacity: number;
  markerEnd: string;
  dash?: string;
  wide?: boolean;
}) {
  const [localHovered, setLocalHovered] = useState(false);

  const curvature = wide ? 0.6 : 0.25;
  const [path, labelX, labelY] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    curvature,
  });

  // Hover flags from parent
  const isHighlighted = !!(props.data as any)?._isHoverHighlighted;
  const isEdgeHovered = !!(props.data as any)?._isEdgeHovered;
  const hasHover = !!(props.data as any)?._hasHover;
  const showGlow = isHighlighted || isEdgeHovered || localHovered;
  const isDimmed = hasHover && !isHighlighted && !isEdgeHovered && !localHovered;

  const edgeOpacity = showGlow ? 1.0 : isDimmed ? 0.1 : baseOpacity;

  return (
    <g
      onMouseEnter={() => setLocalHovered(true)}
      onMouseLeave={() => setLocalHovered(false)}
      style={{ transition: "opacity 150ms ease" }}
      opacity={edgeOpacity}
    >
      {/* Wider invisible hit area */}
      <path d={path} fill="none" stroke="transparent" strokeWidth={12} />
      {/* Glow halo — visible on hover */}
      {showGlow && (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeOpacity={0.3}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      )}
      <BaseEdge
        {...props}
        path={path}
        style={{
          stroke: color,
          strokeWidth: showGlow ? 2.5 : 1.5,
          opacity: 1,
          strokeDasharray: dash,
        }}
        markerEnd={markerEnd}
      />
      {showGlow && props.label && (
        <foreignObject
          x={labelX - 50}
          y={labelY - 12}
          width={100}
          height={24}
          style={{ overflow: "visible", pointerEvents: "none" }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10,
                color,
                background: "rgba(10,9,9,0.9)",
                padding: "2px 6px",
                borderRadius: 3,
                whiteSpace: "nowrap",
              }}
            >
              {props.label}
            </span>
          </div>
        </foreignObject>
      )}
      {/* Streaming dot on hover */}
      {showGlow && (
        <circle r={3} fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
          <animateMotion dur="1.5s" repeatCount="indefinite" path={path} />
        </circle>
      )}
    </g>
  );
}

export const StrongRhetoricalEdge = memo(function StrongRhetoricalEdge(props: EdgeProps) {
  return (
    <RhetoricalEdge
      props={props}
      color="#A78BFA"
      opacity={0.8}
      markerEnd="url(#arrow-violet)"
    />
  );
});

export const ModerateRhetoricalEdge = memo(function ModerateRhetoricalEdge(props: EdgeProps) {
  return (
    <RhetoricalEdge
      props={props}
      color="#60A5FA"
      opacity={0.7}
      markerEnd="url(#arrow-blue)"
    />
  );
});

export const LongRangeEdge = memo(function LongRangeEdge(props: EdgeProps) {
  return (
    <RhetoricalEdge
      props={props}
      color="#FBB249"
      opacity={0.75}
      markerEnd="url(#arrow-amber)"
      dash="6 4"
      wide
    />
  );
});
