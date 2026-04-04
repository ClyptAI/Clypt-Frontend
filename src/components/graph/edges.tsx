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
  return (
    <BaseEdge
      {...props}
      path={path}
      style={{ stroke: "#302D35", strokeWidth: 1, opacity: 0.5 }}
      markerEnd="url(#arrow-structural)"
    />
  );
});

/* ── Rhetorical edge helper ── */
function RhetoricalEdge({
  props,
  color,
  opacity,
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
  const [hovered, setHovered] = useState(false);

  const curvature = wide ? 0.6 : 0.25;
  const [path, labelX, labelY] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    curvature,
  });

  const isStrongArc = props.label === "setup_for" || props.label === "payoff_of" || props.label === "callback_to";

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Wider invisible hit area */}
      <path d={path} fill="none" stroke="transparent" strokeWidth={12} />
      {/* Glow halo — visible on hover */}
      {hovered && (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeOpacity={0.2}
          strokeLinecap="round"
        />
      )}
      <BaseEdge
        {...props}
        path={path}
        style={{
          stroke: color,
          strokeWidth: 1.5,
          opacity,
          strokeDasharray: dash,
        }}
        markerEnd={markerEnd}
      />
      {hovered && props.label && (
        <foreignObject
          x={labelX - 50}
          y={labelY - 12}
          width={100}
          height={24}
          style={{ overflow: "visible", pointerEvents: "none" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10,
                color,
                background: "var(--color-surface-1)",
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
      {hovered && (
        <circle r={3} fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
          <animateMotion dur="2s" repeatCount="indefinite" path={path} />
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
