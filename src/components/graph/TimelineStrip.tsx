import { useEffect, useRef, useState } from "react";
import type { Node } from "@xyflow/react";
import { formatRulerTime, getTickConfig } from "@/components/timeline/TimeRuler";

const NODE_TYPE_COLORS: Record<string, string> = {
  claim: "#A78BFA", explanation: "#60A5FA", example: "#2DD4BF", anecdote: "#FBB249",
  reaction_beat: "#FB7185", qa_exchange: "#4ADE80", challenge_exchange: "#FB923C",
  setup_payoff: "#E879F9", reveal: "#FACC15", transition: "#71717A",
};

function timeToSec(t: string): number {
  if (!t) return 0;
  const parts = t.split(":").map(Number);
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
}


interface TimelineStripProps {
  nodes: Node[];
  onSelectNode?: (node: Node) => void;
}

// How much wider the scrollable track is vs the viewport (3 = 3× zoom)
const SCROLL_FACTOR = 3;

export default function TimelineStrip({ nodes, onSelectNode }: TimelineStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      setContainerW(entries[0].contentRect.width);
    });
    obs.observe(el);
    setContainerW(el.clientWidth);
    return () => obs.disconnect();
  }, []);

  const times = nodes.map((n) => {
    const d = n.data as any;
    return timeToSec(d.timeEnd ?? d.timeStart ?? "0:00");
  }).filter(Boolean);

  const maxTime = Math.max(60, ...times);

  const allZero = nodes.every((n) => {
    const d = n.data as any;
    return timeToSec(d.timeStart ?? "0:00") === 0;
  });

  // Pixels-per-second: fill SCROLL_FACTOR × the viewport width
  const pxPerSec = containerW > 0 ? (containerW * SCROLL_FACTOR) / maxTime : 4;
  const trackW = Math.ceil(maxTime * pxPerSec);

  const config = getTickConfig(pxPerSec);

  const ticks: Array<{ px: number; isMajor: boolean; label: string | null }> = [];
  if (!allZero || maxTime > 60) {
    for (
      let t = 0;
      t <= maxTime + config.minor;
      t = Math.round((t + config.minor) * 1e10) / 1e10
    ) {
      if (t < 0 || t > maxTime) continue;
      const isMajor = Math.abs(Math.round(t / config.major) * config.major - t) < config.minor * 0.01;
      const showLabel = isMajor && Math.abs(Math.round(t / config.label) * config.label - t) < config.minor * 0.01;
      ticks.push({
        px: Math.round(t * pxPerSec),
        isMajor,
        label: showLabel ? formatRulerTime(t) : null,
      });
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 88,
        zIndex: 20,
        pointerEvents: "auto",
        background: "var(--color-surface-1)",
        borderTop: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header row (non-scrolling) ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 14px",
          height: 28,
          flexShrink: 0,
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          Timeline
        </span>
        {nodes.length > 0 && (
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 10,
              color: "rgba(161,161,170,0.35)",
            }}
          >
            · click a marker to select node · scroll to pan
          </span>
        )}
      </div>

      {/* ── Scrollable body (ruler + bars) ── */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowX: "auto",
          overflowY: "hidden",
          // Hide scrollbar on Chrome/Safari while still scrollable
          scrollbarWidth: "none",
        }}
        // Also hide on WebKit
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.scrollbarWidth = "thin";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.scrollbarWidth = "none";
        }}
      >
        {allZero && maxTime <= 60 ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Geist Mono', monospace",
              fontSize: 10,
              color: "rgba(161,161,170,0.5)",
            }}
          >
            Timeline unavailable — no timestamp data
          </div>
        ) : (
          <div style={{ width: trackW, height: "100%", position: "relative" }}>

            {/* ── Ruler row ── */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 26,
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {ticks.map(({ px, isMajor, label }) => (
                <div
                  key={px}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: px,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 1,
                      height: isMajor ? 8 : 4,
                      background: isMajor
                        ? "rgba(161,161,170,0.45)"
                        : "rgba(161,161,170,0.18)",
                    }}
                  />
                  {label && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 9,
                        left: 3,
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: 9,
                        color: "rgba(161,161,170,0.6)",
                        whiteSpace: "nowrap",
                        userSelect: "none",
                      }}
                    >
                      {label}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* ── Node bars ── */}
            <div
              style={{
                position: "absolute",
                top: 27,
                left: 0,
                right: 0,
                bottom: 4,
              }}
            >
              {nodes.map((n) => {
                const d = n.data as any;
                const startSec = timeToSec(d.timeStart ?? "0:00");
                const endSec   = timeToSec(d.timeEnd ?? d.timeStart ?? "0:00");
                const left  = Math.round(startSec * pxPerSec);
                const width = Math.max(Math.round((endSec - startSec) * pxPerSec), 4);
                const color = NODE_TYPE_COLORS[d.node_type] ?? "#71717A";
                return (
                  <div
                    key={n.id}
                    title={`${d.summary ?? d.label ?? n.id} · ${formatRulerTime(startSec)}`}
                    onClick={() => onSelectNode?.(n)}
                    style={{
                      position: "absolute",
                      left,
                      top: 0,
                      width,
                      bottom: 0,
                      borderRadius: 3,
                      background: color,
                      opacity: 0.72,
                      cursor: onSelectNode ? "pointer" : "default",
                      transition: "opacity 100ms, filter 100ms",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.opacity = "1";
                      (e.currentTarget as HTMLDivElement).style.filter = `drop-shadow(0 0 4px ${color})`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.opacity = "0.72";
                      (e.currentTarget as HTMLDivElement).style.filter = "none";
                    }}
                  />
                );
              })}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
