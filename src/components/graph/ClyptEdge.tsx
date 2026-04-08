import { memo } from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

const edgeColorMap: Record<string, string> = {
  supports:         "#A78BFA",
  elaborates:       "#60A5FA",
  challenges:       "#FB923C",
  setup_for:        "#FBB249",
  payoff_of:        "#FBB249",
  answers:          "#4ADE80",
  escalates:        "#FB923C",
  callback_to:      "#A78BFA",
  topic_recurrence: "#60A5FA",
  triggers:         "#4ADE80",
};

function ClyptEdgeInner({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data, label,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const edgeLabel = (data?.label as string) ?? (label as string) ?? "";
  const color     = edgeColorMap[edgeLabel] ?? "#A78BFA";
  const isDashed  = (data as any)?.dashed === true
    || edgeLabel === "callback_to"
    || edgeLabel === "topic_recurrence";

  const isHighlighted = !!(data as any)?._isHoverHighlighted;
  const isEdgeHovered = !!(data as any)?._isEdgeHovered;
  const hasHover      = !!(data as any)?._hasHover;
  const showGlow      = isHighlighted || isEdgeHovered;
  const isDimmed      = hasHover && !showGlow;

  return (
    <>
      {/* Glow halo — conditionally mounted, no looping animation to restart */}
      {showGlow && (
        <BaseEdge
          id={`${id}-glow`}
          path={edgePath}
          style={{
            stroke: color,
            strokeWidth: isEdgeHovered ? 8 : 6,
            opacity: isEdgeHovered ? 0.4 : 0.28,
            filter: `drop-shadow(0 0 ${isEdgeHovered ? "6px" : "4px"} ${color})`,
          }}
        />
      )}

      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: showGlow ? 2.5 : 1.5,
          strokeDasharray: isDashed ? "6 4" : undefined,
          opacity: isDimmed ? 0.08 : showGlow ? 1 : 0.55,
          transition: "opacity 0.15s, stroke-width 0.15s",
        }}
      />

      {/*
        Moving dot — ONLY mounts on connected (highlighted) edges.
        Fresh mount on each hover = no restart glitch.
        Matches cortexfinal/NarrativeEdge.tsx exactly.
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
          <animateMotion dur="1.5s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}

      {/* Label chip — only when hovered */}
      {edgeLabel && showGlow && (
        <foreignObject
          x={labelX - 40} y={labelY - 12}
          width={80} height={24}
          style={{ overflow: "visible", pointerEvents: "none" }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <span style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 9,
              background: "rgba(10,9,9,0.92)",
              border: `1px solid ${color}`,
              borderRadius: 4,
              padding: "2px 5px",
              color,
              whiteSpace: "nowrap",
            }}>
              {edgeLabel}
            </span>
          </div>
        </foreignObject>
      )}
    </>
  );
}

export const ClyptEdge = memo(ClyptEdgeInner);
