import { useRef, useEffect, useMemo, useCallback } from "react";

interface Turn {
  id: string;
  start: number;
  end: number;
  [key: string]: unknown;
}

interface WaveformLaneProps {
  turns: Turn[];
  color: string;
  speakerId: number;
  totalDuration: number;
  pixelsPerSecond: number;
  scrollX: number;
  viewportWidth: number;
  totalWidth: number;
  laneH: number;
  onClickTurn?: (turn: Turn) => void;
}

/** Mulberry32 seeded PRNG — deterministic per speaker so peaks are stable across renders. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PEAKS_PER_SECOND = 150;

/**
 * Generates a mock waveform for one speaker.
 * Amplitude is high (0.2–1.0) during speaking turns and very low (<0.15) during silence,
 * with a smoothed random walk so the result looks like a real speech waveform.
 */
function generatePeaks(
  speakerId: number,
  turns: Turn[],
  durationS: number
): Float32Array {
  const rng = mulberry32(speakerId * 2053 + 137);
  const n = Math.ceil(durationS * PEAKS_PER_SECOND);
  const raw = new Float32Array(n);

  let val = 0.25 + rng() * 0.35;
  for (let i = 0; i < n; i++) {
    const t = i / PEAKS_PER_SECOND;
    const speaking = turns.some((tu) => t >= tu.start && t <= tu.end);
    const stepSize = speaking ? 0.15 : 0.05;
    val += (rng() - 0.5) * stepSize;
    val = Math.max(0, Math.min(1, val));
    raw[i] = speaking ? Math.max(0.1, val) : val * 0.18;
  }

  // Mild smoothing (window=3) so adjacent bars blend naturally
  const smoothed = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const lo = Math.max(0, i - 3);
    const hi = Math.min(n - 1, i + 3);
    let sum = 0;
    for (let j = lo; j <= hi; j++) sum += raw[j];
    smoothed[i] = sum / (hi - lo + 1);
  }
  return smoothed;
}

export default function WaveformLane({
  turns,
  color,
  speakerId,
  totalDuration,
  pixelsPerSecond,
  scrollX,
  viewportWidth,
  totalWidth,
  laneH,
  onClickTurn,
}: WaveformLaneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Peaks are stable per (speakerId, totalDuration) — turns only affect amplitude envelope
  const peaks = useMemo(
    () => generatePeaks(speakerId, turns, totalDuration),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [speakerId, totalDuration]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewportWidth <= 0 || laneH <= 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = viewportWidth * dpr;
    canvas.height = laneH * dpr;
    canvas.style.width = `${viewportWidth}px`;
    canvas.style.height = `${laneH}px`;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, viewportWidth, laneH);

    const centerY = laneH / 2;

    for (let x = 0; x < viewportWidth; x++) {
      const t = (x + scrollX) / pixelsPerSecond;
      if (t < 0 || t > totalDuration) continue;

      const idx = Math.min(Math.floor(t * PEAKS_PER_SECOND), peaks.length - 1);
      const peak = peaks[idx];
      const barH = Math.max(1, peak * centerY * 0.9);

      const isSpeaking = turns.some((tu) => t >= tu.start && t <= tu.end);
      ctx.fillStyle = isSpeaking ? color : "#363636";

      ctx.fillRect(x, centerY - barH, 1, barH * 2);
    }
  }, [scrollX, pixelsPerSecond, viewportWidth, laneH, peaks, color, turns, totalDuration]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onClickTurn) return;
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const t = (localX + scrollX) / pixelsPerSecond;
      const hit = turns.find((tu) => t >= tu.start && t <= tu.end);
      if (hit) onClickTurn(hit);
    },
    [turns, scrollX, pixelsPerSecond, onClickTurn]
  );

  return (
    <div className="relative" style={{ width: totalWidth, height: laneH }}>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          left: scrollX,
          top: 0,
        }}
        onClick={handleClick}
      />

      {/* Translucent clickable overlays — one per speaking turn */}
      {onClickTurn && turns.map((turn) => (
        <div
          key={turn.id}
          style={{
            position: "absolute",
            left: turn.start * pixelsPerSecond,
            width: Math.max((turn.end - turn.start) * pixelsPerSecond, 2),
            top: 0,
            height: laneH,
            background: color,
            opacity: 0.22,
            cursor: "pointer",
            borderRadius: 2,
            transition: "opacity 0.1s",
          }}
          onClick={() => onClickTurn(turn)}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.45"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.22"; }}
        />
      ))}
    </div>
  );
}
