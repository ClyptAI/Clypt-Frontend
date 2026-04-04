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
    data?.animated === true ||
    data?.dashed === true ||
    edgeLabel === "callback_to" ||
    edgeLabel === "topic_recurrence";
  const shouldStream = data?.animated === true || edgeLabel === "callback_to";

  return (
    <g>
      {/* Glow halo */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeOpacity={0.15}
        strokeLinecap="round"
      />
      {/* Main edge line */}
      <BaseEdge
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: isDashed ? 1 : 1.5,
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
      {/* Streaming dot */}
      {shouldStream && (
        <circle r={3} fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
          <animateMotion dur="2.5s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
    </g>
  );
}

export const ClyptEdge = memo(ClyptEdgeComponent);
