import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import type { EmbedPoint } from "@/hooks/api/useEmbeddings";

const NODE_TYPE_COLORS: Record<string, string> = {
  claim:             "#A78BFA",
  explanation:       "#60A5FA",
  anecdote:          "#FBB249",
  reaction_beat:     "#4ADE80",
  setup_payoff:      "#FB923C",
  qa_exchange:       "#38BDF8",
  challenge_exchange:"#FB923C",
  reveal:            "#FACC15",
  transition:        "#71717A",
  hook:              "#4ADE80",
  conflict:          "#EF4444",
  punchline:         "#FBB249",
  payoff:            "#4ADE80",
  insight:           "#A78BFA",
  topic_shift:       "#60A5FA",
  speaker_beat:      "#E879F9",
};

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

interface TooltipState {
  point: EmbedPoint;
  svgX: number;  // position in SVG space
  svgY: number;
}

interface EmbedScatterProps {
  points: EmbedPoint[];
  selectedId: string | null;
  onSelect: (point: EmbedPoint | null) => void;
  fitSignal: number;  // increment to trigger fit-to-view
  zoomDelta?: number; // non-zero = programmatic zoom step
  onZoomHandled?: () => void;
}

const DOT_R = 5;
const DOT_R_HOVER = 7.5;
const PADDING = 60;  // px of margin around the point cloud

export default function EmbedScatter({
  points,
  selectedId,
  onSelect,
  fitSignal,
  zoomDelta,
  onZoomHandled,
}: EmbedScatterProps) {
  const containerRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const dragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, tx: 0, ty: 0 });

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: r.width, h: r.height });
    });
    obs.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => obs.disconnect();
  }, []);

  // Compute fit-to-view transform from current points + container size
  const computeFit = useCallback((w: number, h: number): Transform => {
    if (!points.length) return { x: 0, y: 0, scale: 1 };
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const scaleX = (w - PADDING * 2) / rangeX;
    const scaleY = (h - PADDING * 2) / rangeY;
    const scale = Math.min(scaleX, scaleY);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return {
      scale,
      x: w / 2 - cx * scale,
      y: h / 2 - cy * scale,
    };
  }, [points]);

  // Apply fit whenever fitSignal increments or size/points change
  useEffect(() => {
    setTransform(computeFit(size.w, size.h));
  }, [fitSignal, size.w, size.h, computeFit]);

  // Handle programmatic zoom step
  useEffect(() => {
    if (!zoomDelta) return;
    setTransform((t) => {
      const cx = size.w / 2;
      const cy = size.h / 2;
      const nextScale = Math.max(0.3, Math.min(20, t.scale * (1 + zoomDelta)));
      const ratio = nextScale / t.scale;
      return {
        scale: nextScale,
        x: cx + (t.x - cx) * ratio,
        y: cy + (t.y - cy) * ratio,
      };
    });
    onZoomHandled?.();
  }, [zoomDelta, size.w, size.h, onZoomHandled]);

  // Project a data point to SVG pixel space
  const project = useCallback((p: EmbedPoint): [number, number] => {
    return [
      p.x * transform.scale + transform.x,
      -p.y * transform.scale + transform.y,
    ];
  }, [transform]);

  // Wheel → zoom centered on cursor
  const onWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const rect = containerRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    setTransform((t) => {
      const nextScale = Math.max(0.3, Math.min(20, t.scale * factor));
      const ratio = nextScale / t.scale;
      return {
        scale: nextScale,
        x: mx + (t.x - mx) * ratio,
        y: my + (t.y - my) * ratio,
      };
    });
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as SVGElement).closest(".embed-dot")) return;
    dragging.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, tx: transform.x, ty: transform.y };
  }, [transform]);

  const onMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    setTransform((t) => ({ ...t, x: dragStart.current.tx + dx, y: dragStart.current.ty + dy }));
  }, []);

  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  // Build a background grid of faint dots
  const gridDots = useMemo(() => {
    const dots: { x: number; y: number }[] = [];
    const step = 48;
    const cols = Math.ceil(size.w / step) + 1;
    const rows = Math.ceil(size.h / step) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({ x: c * step, y: r * step });
      }
    }
    return dots;
  }, [size.w, size.h]);

  return (
    <svg
      ref={containerRef}
      width="100%"
      height="100%"
      style={{ display: "block", cursor: dragging.current ? "grabbing" : "grab", background: "#0A0909", userSelect: "none" }}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Background dot grid */}
      {gridDots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={0.75} fill="rgba(255,255,255,0.055)" />
      ))}

      {/* Data points */}
      {points.map((p) => {
        const [cx, cy] = project(p);
        const color = NODE_TYPE_COLORS[p.node_type] ?? "#71717A";
        const isHovered = hoveredId === p.node_id;
        const isSelected = selectedId === p.node_id;
        const r = isHovered ? DOT_R_HOVER : DOT_R;

        return (
          <g
            key={p.node_id}
            className="embed-dot"
            style={{ cursor: "pointer" }}
            onMouseEnter={() => { setHoveredId(p.node_id); setTooltip({ point: p, svgX: cx, svgY: cy }); }}
            onMouseLeave={() => { setHoveredId(null); setTooltip(null); }}
            onClick={(e) => { e.stopPropagation(); onSelect(isSelected ? null : p); }}
          >
            {/* Candidate outer glow ring */}
            {p.is_candidate && (
              <circle
                cx={cx} cy={cy}
                r={r + 4}
                fill="none"
                stroke={color}
                strokeWidth={1}
                opacity={0.3}
                style={{ filter: `drop-shadow(0 0 3px ${color})` }}
              />
            )}

            {/* Selection ring */}
            {isSelected && (
              <circle
                cx={cx} cy={cy}
                r={r + 5.5}
                fill="none"
                stroke="#fff"
                strokeWidth={1.5}
                opacity={0.9}
              />
            )}

            {/* Main dot */}
            <circle
              cx={cx} cy={cy}
              r={r}
              fill={color}
              opacity={isHovered || isSelected ? 1 : 0.82}
              style={{
                transition: "r 80ms ease",
                filter: isHovered || isSelected ? `drop-shadow(0 0 5px ${color})` : undefined,
              }}
            />
          </g>
        );
      })}

      {/* Click-away to deselect */}
      <rect
        x={0} y={0} width={size.w} height={size.h}
        fill="transparent"
        style={{ pointerEvents: "none" }}
        onClick={() => onSelect(null)}
      />

      {/* Tooltip — rendered last so it's on top */}
      {tooltip && (() => {
        const { point: p, svgX, svgY } = tooltip;
        const color = NODE_TYPE_COLORS[p.node_type] ?? "#71717A";
        const tipW = 200;
        const tipH = 54;
        const tipX = Math.min(svgX - tipW / 2, size.w - tipW - 8);
        const tipY = svgY - DOT_R_HOVER - tipH - 8;
        return (
          <g style={{ pointerEvents: "none" }}>
            <rect
              x={Math.max(4, tipX)} y={Math.max(4, tipY)}
              width={tipW} height={tipH}
              rx={6}
              fill="rgba(10,9,9,0.94)"
              stroke={`${color}55`}
              strokeWidth={1}
            />
            {/* Type pill */}
            <rect
              x={Math.max(4, tipX) + 8} y={Math.max(4, tipY) + 8}
              width={p.node_type.length * 7 + 10} height={17}
              rx={3}
              fill={`${color}22`}
              stroke={`${color}55`}
              strokeWidth={1}
            />
            <text
              x={Math.max(4, tipX) + 13} y={Math.max(4, tipY) + 20}
              style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, fill: color }}
            >
              {p.node_type}
            </text>
            {/* Summary */}
            <foreignObject
              x={Math.max(4, tipX) + 8} y={Math.max(4, tipY) + 30}
              width={tipW - 16} height={18}
            >
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.7)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {p.summary}
              </div>
            </foreignObject>
          </g>
        );
      })()}
    </svg>
  );
}
