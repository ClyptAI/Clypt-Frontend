import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, ArrowLeftToLine, ArrowRightToLine } from "lucide-react";

/**
 * Compact clip boundary editor — the "basic editor" surface used inside the
 * Clips page detail panel. Renders a <video> preview that loops within the
 * current [startMs, endMs] range, plus a mini-timeline strip with draggable
 * start/end handles.
 *
 * Because the mock pipeline doesn't actually host cut source videos, we reuse
 * the placeholder video at /videos/joeroganflagrant.mp4 and treat its full
 * duration as the "window" the clip boundaries can move within. When a real
 * backend wires this up, swap `videoSrc` for the per-clip preview stream.
 */
export interface ClipBoundaryEditorProps {
  initialStartMs: number;
  initialEndMs: number;
  onBoundaryChange?: (startMs: number, endMs: number) => void;
  videoSrc?: string;
}

const DEFAULT_VIDEO = "/videos/joeroganflagrant.mp4";
const MIN_CLIP_MS = 500;

function fmt(ms: number): string {
  const total = Math.max(0, ms);
  const m = Math.floor(total / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const t = Math.floor((total % 1000) / 100);
  return `${m}:${s.toString().padStart(2, "0")}.${t}`;
}

export function ClipBoundaryEditor({
  initialStartMs,
  initialEndMs,
  onBoundaryChange,
  videoSrc = DEFAULT_VIDEO,
}: ClipBoundaryEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // The window the boundaries can move within, measured in ms. We learn this
  // from the loaded video's duration — until that lands we guess 60s so the
  // handles have somewhere to live.
  const [windowMs, setWindowMs] = useState<number>(60_000);

  // Clip boundaries, expressed as offsets within [0, windowMs]. We normalize
  // the incoming wire values so the UI is consistent even when the caller
  // passes start_ms well beyond the placeholder's duration.
  const [startMs, setStartMs] = useState<number>(0);
  const [endMs, setEndMs] = useState<number>(MIN_CLIP_MS);

  const [playing, setPlaying] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  const [wordSnap, setWordSnap] = useState(false);
  const [dragging, setDragging] = useState<null | "start" | "end">(null);

  // The effective snap grid. Word snap is a 500ms grid (stand-in for real
  // word boundaries, which the mock doesn't carry). Without snap we still
  // quantize to 100ms so dragging feels deliberate and numbers stay clean.
  const snapMs = wordSnap ? 500 : 100;

  const quantize = useCallback(
    (ms: number) => Math.round(ms / snapMs) * snapMs,
    [snapMs],
  );

  // Seed local boundaries once we know the window. We map the incoming clip
  // range to a position within the placeholder window so the user has
  // something to drag. When a real source video is wired up the mapping
  // becomes 1:1 and this block becomes a no-op.
  const hasInit = useRef(false);
  useEffect(() => {
    if (hasInit.current) return;
    if (windowMs <= 0) return;
    const desiredLen = Math.max(MIN_CLIP_MS, initialEndMs - initialStartMs);
    const len = Math.min(desiredLen, windowMs);
    const start = Math.min(initialStartMs, Math.max(0, windowMs - len));
    const fits = start + len <= windowMs;
    const s = fits ? start : 0;
    const e = s + len;
    setStartMs(quantize(s));
    setEndMs(quantize(e));
    hasInit.current = true;
  }, [windowMs, initialStartMs, initialEndMs, quantize]);

  // Notify parent when the user changes the range (but not on the initial
  // seed — parent already knows those values).
  useEffect(() => {
    if (!hasInit.current) return;
    onBoundaryChange?.(startMs, endMs);
  }, [startMs, endMs, onBoundaryChange]);

  // ─── Video element wiring ─────────────────────────────────────────────────

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => {
      const durMs = Math.floor((v.duration || 0) * 1000);
      if (durMs > 0) setWindowMs(durMs);
    };
    const onTime = () => {
      const nowMs = Math.floor(v.currentTime * 1000);
      setCurrentMs(nowMs);
      // Loop within the selected range
      if (nowMs >= endMs) {
        v.currentTime = startMs / 1000;
      }
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    if (v.readyState >= 1) onMeta();
    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [startMs, endMs]);

  // If the user drags the start handle past the playhead, snap the playhead
  // forward so we don't sit outside the clip.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const nowMs = Math.floor(v.currentTime * 1000);
    if (nowMs < startMs - 50 || nowMs > endMs + 50) {
      v.currentTime = startMs / 1000;
    }
  }, [startMs, endMs]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      if (v.currentTime * 1000 < startMs || v.currentTime * 1000 >= endMs) {
        v.currentTime = startMs / 1000;
      }
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [startMs, endMs]);

  // Space to play/pause while the editor is focused
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      togglePlay();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay]);

  // ─── Drag handling for the handles ────────────────────────────────────────

  const pointerToMs = useCallback(
    (clientX: number): number => {
      const strip = stripRef.current;
      if (!strip) return 0;
      const rect = strip.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return quantize(pct * windowMs);
    },
    [windowMs, quantize],
  );

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const ms = pointerToMs(e.clientX);
      if (dragging === "start") {
        setStartMs((prev) => {
          const next = Math.min(ms, endMs - MIN_CLIP_MS);
          return Math.max(0, next);
        });
      } else {
        setEndMs((prev) => {
          const next = Math.max(ms, startMs + MIN_CLIP_MS);
          return Math.min(windowMs, next);
        });
      }
    };
    const onUp = () => setDragging(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, pointerToMs, startMs, endMs, windowMs]);

  // Clicking the strip body seeks the playhead (without changing boundaries).
  const onStripClick = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) return;
    const target = e.target as HTMLElement;
    if (target.dataset.role === "handle") return;
    const ms = pointerToMs(e.clientX);
    const clamped = Math.max(startMs, Math.min(endMs - 1, ms));
    const v = videoRef.current;
    if (v) v.currentTime = clamped / 1000;
  };

  // ─── Layout helpers ───────────────────────────────────────────────────────

  const pct = (ms: number) => `${(ms / Math.max(1, windowMs)) * 100}%`;
  const durationMs = Math.max(0, endMs - startMs);

  const bumpStart = (delta: number) =>
    setStartMs((prev) => {
      const next = Math.max(0, Math.min(endMs - MIN_CLIP_MS, prev + delta));
      return quantize(next);
    });
  const bumpEnd = (delta: number) =>
    setEndMs((prev) => {
      const next = Math.max(startMs + MIN_CLIP_MS, Math.min(windowMs, prev + delta));
      return quantize(next);
    });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: "var(--color-surface-1)",
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: 12,
      }}
    >
      {/* Video preview */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: "#000", borderRadius: 6, overflow: "hidden" }}>
        <video
          ref={videoRef}
          src={videoSrc}
          preload="metadata"
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Mini-timeline strip with handles */}
      <div
        ref={stripRef}
        onPointerDown={onStripClick}
        style={{
          position: "relative",
          height: 36,
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: 4,
          cursor: "pointer",
          userSelect: "none",
          touchAction: "none",
        }}
      >
        {/* Selected range */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: pct(startMs),
            width: `calc(${pct(endMs)} - ${pct(startMs)})`,
            background: "rgba(167,139,250,0.25)",
            borderLeft: "2px solid var(--color-violet)",
            borderRight: "2px solid var(--color-violet)",
            pointerEvents: "none",
          }}
        />

        {/* Playhead */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: pct(Math.max(0, Math.min(windowMs, currentMs))),
            width: 2,
            background: "var(--color-cyan)",
            pointerEvents: "none",
            transform: "translateX(-1px)",
          }}
        />

        {/* Start handle */}
        <div
          data-role="handle"
          onPointerDown={(e) => {
            e.stopPropagation();
            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
            setDragging("start");
          }}
          style={{
            position: "absolute",
            top: -3,
            bottom: -3,
            left: pct(startMs),
            width: 10,
            background: "var(--color-violet)",
            borderRadius: 2,
            transform: "translateX(-5px)",
            cursor: "ew-resize",
          }}
          title={`Start · ${fmt(startMs)}`}
        />

        {/* End handle */}
        <div
          data-role="handle"
          onPointerDown={(e) => {
            e.stopPropagation();
            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
            setDragging("end");
          }}
          style={{
            position: "absolute",
            top: -3,
            bottom: -3,
            left: pct(endMs),
            width: 10,
            background: "var(--color-violet)",
            borderRadius: 2,
            transform: "translateX(-5px)",
            cursor: "ew-resize",
          }}
          title={`End · ${fmt(endMs)}`}
        />
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={togglePlay}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: 4,
            border: "1px solid var(--color-border)",
            background: "var(--color-surface-2)",
            color: "var(--color-text-primary)",
            cursor: "pointer",
          }}
          title="Play/pause (space)"
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>
          {fmt(currentMs)} / {fmt(endMs)}
        </span>

        <div style={{ flex: 1 }} />

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--color-text-secondary)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={wordSnap}
            onChange={(e) => setWordSnap(e.target.checked)}
            style={{ accentColor: "var(--color-violet)" }}
          />
          Word snap
        </label>
      </div>

      {/* Boundary fine-tune row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <BoundaryField
          label="Start"
          icon={<ArrowLeftToLine size={12} />}
          ms={startMs}
          onBump={bumpStart}
        />
        <BoundaryField
          label="End"
          icon={<ArrowRightToLine size={12} />}
          ms={endMs}
          onBump={bumpEnd}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 11, color: "var(--color-text-muted)" }}>
            Duration
          </span>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, color: "var(--color-text-primary)", padding: "6px 10px" }}>
            {fmt(durationMs)}
          </span>
        </div>
      </div>
    </div>
  );
}

function BoundaryField({
  label,
  icon,
  ms,
  onBump,
}: {
  label: string;
  icon: React.ReactNode;
  ms: number;
  onBump: (delta: number) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 11, color: "var(--color-text-muted)" }}>
        {icon}
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          onClick={() => onBump(-1000)}
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 500,
            fontSize: 11,
            padding: "4px 8px",
            borderRadius: 3,
            border: "1px solid var(--color-border)",
            background: "var(--color-surface-2)",
            color: "var(--color-text-muted)",
            cursor: "pointer",
          }}
        >
          −1s
        </button>
        <div
          style={{
            minWidth: 80,
            textAlign: "center",
            fontFamily: "'Geist Mono', monospace",
            fontSize: 13,
            color: "var(--color-text-primary)",
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderRadius: 4,
            padding: "4px 10px",
          }}
        >
          {fmt(ms)}
        </div>
        <button
          onClick={() => onBump(1000)}
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 500,
            fontSize: 11,
            padding: "4px 8px",
            borderRadius: 3,
            border: "1px solid var(--color-border)",
            background: "var(--color-surface-2)",
            color: "var(--color-text-muted)",
            cursor: "pointer",
          }}
        >
          +1s
        </button>
      </div>
    </div>
  );
}
