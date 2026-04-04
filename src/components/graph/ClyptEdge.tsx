import { memo } from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

const edgeColorMap: Record<string, string> = {
  supports: "rgba(167,139,250,0.85)",
  elaborates: "rgba(96,165,250,0.80)",
  challenges: "rgba(251,146,60,0.80)",
  setup_for: "rgba(251,178,73,0.80)",
  payoff_of: "rgba(251,178,73,0.80)",
  answers: "rgba(74,222,128,0.80)",
  escalates: "rgba(251,146,60,0.80)",
  callback_to: "rgba(167,139,250,0.60)",
  topic_recurrence: "rgba(96,165,250,0.60)",
  triggers: "rgba(74,222,128,0.70)",
};

function ClyptEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  label,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeLabel = (data?.label as string) ?? (label as string) ?? "";
  const color = edgeColorMap[edgeLabel] ?? "rgba(167,139,250,0.7)";
  const isDashed =
    data?.dashed === true ||
    edgeLabel === "callback_to" ||
    edgeLabel === "topic_recurrence";

  // Hover flags from parent graph component
  const isHoverHighlighted = !!(data as any)?._isHoverHighlighted;
  const isEdgeHovered = !!(data as any)?._isEdgeHovered;
  const hasHover = !!(data as any)?._hasHover;

  const showGlow = isHoverHighlighted || isEdgeHovered;
  const isDimmed = hasHover && !isHoverHighlighted && !isEdgeHovered;

  // Ambient streaming for animated edges (callback_to etc) — subtle always-on
  const isAmbientAnimated = data?.animated === true && !showGlow;

  const edgeOpacity = showGlow ? 1.0 : isDimmed ? 0.1 : 0.55;

  return (
    <g style={{ transition: "opacity 150ms ease" }} opacity={edgeOpacity}>
      {/* Glow halo — only on hover */}
      {showGlow && (
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeOpacity={0.3}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      )}
      {/* Main edge line */}
      <BaseEdge
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: showGlow ? 2.5 : isDashed ? 1 : 1.5,
          strokeDasharray: isDashed ? "6 4" : undefined,
        }}
      />
      {/* Edge label */}
      {edgeLabel && (
        <foreignObject
          x={labelX - 40}
          y={labelY - 10}
          width={80}
          height={20}
          style={{ overflow: "visible", pointerEvents: "none" }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 9,
                background: "rgba(10,9,9,0.9)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 4,
                padding: "2px 5px",
                color: "rgba(255,255,255,0.5)",
                whiteSpace: "nowrap",
              }}
            >
              {edgeLabel}
            </span>
          </div>
        </foreignObject>
      )}
      {/* Streaming dot — on hover */}
      {showGlow && (
        <circle r={3} fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
          <animateMotion dur="1.5s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
      {/* Ambient streaming dot for animated edges (callback_to etc) */}
      {isAmbientAnimated && (
        <circle r={2.5} fill={color} opacity={0.4} style={{ filter: `drop-shadow(0 0 3px ${color})` }}>
          <animateMotion dur="3s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
    </g>
  );
}

export const ClyptEdge = memo(ClyptEdgeComponent);
