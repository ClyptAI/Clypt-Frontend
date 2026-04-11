import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { X, Pencil, Play, Pause } from "lucide-react";
import RunContextBar from "@/components/app/RunContextBar";
import { TimeRuler, VideoPlayer, WaveformLane } from "@/components/timeline";
import { useTimelineStore } from "@/stores/timeline-store";
import { useRunDetail } from "@/hooks/api/useRuns";
import { useTimelineData } from "@/hooks/api/useTimeline";
import { useTimelineKeyboard } from "@/hooks/useTimelineKeyboard";
import { formatTimecode } from "@/lib/timeline-utils";
import type { TimelineSpeakerTurn, EmotionLabel } from "@/types/clypt";

/* ─── constants ─── */
const VIDEO_DURATION = 24 * 60 + 31; // 24:31 in seconds
const PPS_BASE = 8; // pixels per second at 1×

const LAYER_TOGGLES = ["Shots", "Tracklets", "Speakers", "Transcript", "Emotion", "Audio Events"] as const;

const SPEAKER_COLORS = ["#4A9EFF", "#FF7A5C", "#5CCD8F", "#C98EFF"];

const EMOTION_COLORS: Record<string, string> = {
  neutral: "var(--color-surface-3)",
  happy: "rgba(251,178,73,0.5)",
  surprised: "rgba(34,211,238,0.5)",
  angry: "rgba(251,113,133,0.5)",
  sad: "rgba(96,165,250,0.5)",
  fearful: "rgba(167,139,250,0.5)",
  disgusted: "rgba(249,115,22,0.5)",
};

/* ─── internal turn shape (seconds) used by WaveformLane / InfoPanel ─── */
interface Turn {
  id: string;
  speaker: number;
  start: number;
  end: number;
  transcript: string;
  emotion: { primary: EmotionLabel; score: number; secondary: { label: EmotionLabel; score: number }[] };
}

interface Speaker {
  id: number;
  name: string;
  turns: Turn[];
}

/* ─── helpers ─── */
function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
function fmtTimePrecise(s: number) {
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(1);
  return `${m}:${parseFloat(sec) < 10 ? "0" : ""}${sec}`;
}

/* ─── tooltip — follows cursor so it always appears above the mouse ─── */
function TT({ children, tip }: { children: React.ReactNode; tip: string }) {
  const [cursorX, setCursorX] = useState<number | null>(null);
  return (
    <div
      className="relative"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCursorX(e.clientX - rect.left);
      }}
      onMouseLeave={() => setCursorX(null)}
    >
      {children}
      {cursorX !== null && (
        <div
          className="absolute z-50 bottom-full mb-1 px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap pointer-events-none"
          style={{
            left: cursorX,
            transform: "translateX(-50%)",
            background: "var(--color-surface-3)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
          }}
        >
          {tip}
        </div>
      )}
    </div>
  );
}

/* ─── info panel ─── */
type Selection = { type: "turn"; data: Turn; speakerName: string } | null;

function InfoPanel({ selection, onClose }: { selection: Selection; onClose: () => void }) {
  const [editing, setEditing] = useState(false);

  if (!selection) {
    return (
      <div style={{ padding: "16px", color: "var(--color-text-muted)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13 }}>
        Click any lane segment to inspect it.
      </div>
    );
  }

  const { data: turn, speakerName } = selection;
  const emo = turn.emotion;

  return (
    <div className="flex flex-col">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--color-border-subtle)" }}>
        <span className="label-caps">Speaker turn</span>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--color-surface-2)]">
          <X size={16} style={{ color: "var(--color-text-muted)" }} />
        </button>
      </div>

      {/* content */}
      <div className="p-4 flex flex-col gap-4">
        {/* identity */}
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[12px]" style={{ color: "var(--color-text-muted)" }}>{turn.id}</span>
          <div className="flex items-center gap-2 group">
            {editing ? (
              <div className="flex items-center gap-2">
                <input defaultValue={speakerName} className="font-heading font-semibold text-[16px] bg-transparent border-b outline-none" style={{ color: "var(--color-text-primary)", borderColor: "var(--color-violet)" }} />
                <button onClick={() => setEditing(false)} className="font-body text-[12px]" style={{ color: "var(--color-violet)" }}>Save</button>
              </div>
            ) : (
              <>
                <span className="font-heading font-semibold text-[16px]" style={{ color: "var(--color-text-primary)" }}>{speakerName}</span>
                <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5">
                  <Pencil size={12} style={{ color: "var(--color-text-muted)" }} />
                </button>
              </>
            )}
          </div>
          <span className="font-mono text-[13px]" style={{ color: "var(--color-text-muted)" }}>
            {fmtTimePrecise(turn.start)} → {fmtTimePrecise(turn.end)} ({(turn.end - turn.start).toFixed(1)}s)
          </span>
        </div>

        {/* transcript */}
        <div>
          <span className="label-caps mb-2 block">Transcript</span>
          <p className="font-body text-[14px] leading-relaxed max-h-[120px] overflow-y-auto" style={{ color: "var(--color-text-primary)" }}>
            {turn.transcript}
          </p>
        </div>

        {/* emotion */}
        <div>
          <span className="label-caps mb-2 block">Emotion</span>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="font-body text-[13px] w-20" style={{ color: "var(--color-text-primary)" }}>{emo.primary}</span>
              <div className="flex-1 h-1 rounded-full" style={{ background: "var(--color-surface-3)" }}>
                <div className="h-full rounded-full" style={{ width: `${emo.score * 100}%`, background: EMOTION_COLORS[emo.primary] || "var(--color-surface-3)" }} />
              </div>
              <span className="font-mono text-[12px]" style={{ color: "var(--color-text-muted)" }}>{(emo.score * 100).toFixed(0)}%</span>
            </div>
            {emo.secondary.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="font-body text-[13px] w-20" style={{ color: "var(--color-text-secondary)" }}>{s.label}</span>
                <div className="flex-1 h-1 rounded-full" style={{ background: "var(--color-surface-3)" }}>
                  <div className="h-full rounded-full" style={{ width: `${s.score * 100}%`, background: EMOTION_COLORS[s.label] || "var(--color-surface-3)" }} />
                </div>
                <span className="font-mono text-[12px]" style={{ color: "var(--color-text-muted)" }}>{(s.score * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


/* ─── page ─── */
export default function RunTimeline() {
  const { id } = useParams();
  const runId = id || "demo";

  const DEMO_VIDEO_URL = "/videos/joeroganflagrant.mp4";

  // ── Timeline store ──────────────────────────────────────────────────────────
  const playheadPosition = useTimelineStore(s => s.playheadPosition);
  const seekTo           = useTimelineStore(s => s.seekTo);
  const pixelsPerSecond  = useTimelineStore(s => s.pixelsPerSecond);
  const setStorePps      = useTimelineStore(s => s.setZoom);
  const scrollX          = useTimelineStore(s => s.scrollX);
  const setScrollX       = useTimelineStore(s => s.setScrollX);
  const play             = useTimelineStore(s => s.play);
  const pause            = useTimelineStore(s => s.pause);
  const playbackState    = useTimelineStore(s => s.playbackState);

  const isPlaying = playbackState === "playing";

  // ── Run metadata + timeline data ─────────────────────────────────────────────
  const { data: runDetail } = useRunDetail(runId);
  const { data: timelineBundle } = useTimelineData(runId);

  // Adapt bundle → page-internal shapes (seconds).
  const shots = (timelineBundle?.shots ?? []).map((s) => ({
    id: s.shot_id,
    start: s.start_ms / 1000,
    end: s.end_ms / 1000,
  }));
  const shotTracklets = (timelineBundle?.shot_tracklets ?? []).map((st) => ({
    shotId: st.shot_id,
    start: st.start_ms / 1000,
    end: st.end_ms / 1000,
    letters: st.tracklet_letters,
  }));
  const speakers: Speaker[] = (timelineBundle?.speakers ?? []).map((sp, idx) => ({
    id: idx,
    name: sp.display_name,
    turns: sp.turns.map((t: TimelineSpeakerTurn) => ({
      id: t.turn_id,
      speaker: idx,
      start: t.start_ms / 1000,
      end: t.end_ms / 1000,
      transcript: t.transcript_text,
      emotion: {
        primary: t.emotion_primary,
        score: t.emotion_score,
        secondary: t.emotion_secondary,
      },
    })),
  }));
  const emotions = (timelineBundle?.emotions ?? []).map((e) => ({
    start: e.start_ms / 1000,
    end: e.end_ms / 1000,
    label: e.label,
  }));
  const audioEvents = (timelineBundle?.audio_events ?? []).map((ev) => ({
    start: ev.start_ms / 1000,
    end: ev.end_ms / 1000,
    label: ev.label,
    confidence: ev.confidence,
  }));

  const completedPhases = runDetail?.phases.filter(p => p.status === "completed").length ?? 0;
  const runningPhase    = runDetail?.phases.find(p => p.status === "running");
  const currentPhase    = runningPhase?.phase ?? (completedPhases + 1);

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [layers, setLayers] = useState<Record<string, boolean>>(
    Object.fromEntries(LAYER_TOGGLES.map((l) => [l, true]))
  );
  const [selection, setSelection] = useState<Selection>(null);
  const [videoHeightPx, setVideoHeightPx] = useState<number>(() => Math.round(window.innerHeight * 0.55));
  const [isDividerDragging, setIsDividerDragging] = useState(false);
  const dividerDragRef = useRef<{ startY: number; startH: number } | null>(null);
  const scrollRef     = useRef<HTMLDivElement>(null);
  const togglesRef    = useRef<HTMLDivElement>(null);
  const legendRef     = useRef<HTMLDivElement>(null);
  const scrubBarRef   = useRef<HTMLDivElement>(null);
  const previewVidRef = useRef<HTMLVideoElement>(null);
  const [minVideoH, setMinVideoH]       = useState(200);
  const [hoverPct,      setHoverPct]      = useState<number | null>(null);
  const [hoverClientX,  setHoverClientX]  = useState(0);
  const [scrubberTopY,  setScrubberTopY]  = useState(0);
  const [isScrubbing,   setIsScrubbing]   = useState(false);
  // Actual duration read from the video element — drives all scrubber/ruler math.
  const [videoDuration, setVideoDuration] = useState(VIDEO_DURATION);

  const pps        = pixelsPerSecond;
  const totalWidth = videoDuration * pps;
  const LABEL_W    = 100;

  // ── Speaker grouping (max 5 primary + 1 minor) ──────────────────────────────
  const MAX_PRIMARY_SPEAKERS = 5;
  const sortedSpeakers  = [...speakers].sort((a, b) => b.turns.length - a.turns.length);
  const primarySpeakers = sortedSpeakers.slice(0, MAX_PRIMARY_SPEAKERS);
  const minorSpeakers   = sortedSpeakers.slice(MAX_PRIMARY_SPEAKERS);
  const hasMinorSpeakers = minorSpeakers.length > 0;
  const minorTurns       = minorSpeakers.flatMap(s => s.turns);
  const minorSpeakerObj  = { id: 99, name: "Minor Speakers", turns: minorTurns };

  // ── Dynamic lane heights + drag limits ──────────────────────────────────────
  const LANE_MIN_H = 22;

  const numSpeakerLanes = primarySpeakers.length + (hasMinorSpeakers ? 1 : 0);
  const numVisibleLanes =
    (layers["Shots"]        ? 1 : 0) +
    (layers["Tracklets"]    ? 1 : 0) +
    (layers["Speakers"]     ? numSpeakerLanes : 0) +
    (layers["Transcript"]   ? 1 : 0) +
    (layers["Emotion"]      ? 1 : 0) +
    (layers["Audio Events"] ? 1 : 0);

  // Measure the actual rendered height of the lanes container so laneH fills it exactly.
  const [lanesContainerH, setLanesContainerH] = useState(400);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setLanesContainerH(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Measure both floating control panels and use the taller one as the drag floor.
  useEffect(() => {
    const update = () => {
      const h = Math.max(
        togglesRef.current?.offsetHeight ?? 0,
        legendRef.current?.offsetHeight ?? 0,
      );
      if (h > 0) setMinVideoH(h + 24); // 24px top+bottom breathing room
    };
    update();
    const ro = new ResizeObserver(update);
    if (togglesRef.current) ro.observe(togglesRef.current);
    if (legendRef.current)  ro.observe(legendRef.current);
    return () => ro.disconnect();
  }, []);

  const laneH = numVisibleLanes > 0
    ? Math.max(LANE_MIN_H, Math.floor(lanesContainerH / numVisibleLanes))
    : LANE_MIN_H;

  // 48 = context bar, 6 = drag handle, 52 = transport, 32 = ruler.
  const MAX_VIDEO_H = Math.max(
    minVideoH + 80,
    window.innerHeight - 48 - 6 - 52 - 32 - numVisibleLanes * LANE_MIN_H - 4,
  );

  // Viewport width approximation — avoids a ResizeObserver on the lanes div.
  // Subtracting LABEL_W aligns with the scrollable content region.
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth - LABEL_W : 1200;

  // Ruler viewport width — generous fallback so ticks render immediately.
  const rulerViewportWidth = Math.max(viewportWidth, 1200);

  // Keyboard shortcuts for timeline navigation
  useTimelineKeyboard({ seekStep: 5 })

  // Initialise store zoom to match the page's base PPS on first mount
  useEffect(() => { setStorePps(PPS_BASE) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scroll sync: store scrollX → DOM ───────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (el && Math.abs(el.scrollLeft - scrollX) > 1) {
      el.scrollLeft = scrollX;
    }
  }, [scrollX]);

  // ── Scroll sync: DOM → store ────────────────────────────────────────────────
  // Keep divider drags alive even if the pointer crosses the iframe-backed player.
  useEffect(() => {
    if (!isDividerDragging) return;

    const onMove = (ev: PointerEvent) => {
      const drag = dividerDragRef.current;
      if (!drag) return;
      const nextHeight = drag.startH + (ev.clientY - drag.startY);
      setVideoHeightPx(Math.max(minVideoH, Math.min(MAX_VIDEO_H, nextHeight)));
    };

    const onStop = () => {
      dividerDragRef.current = null;
      setIsDividerDragging(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onStop);
    window.addEventListener("pointercancel", onStop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onStop);
      window.removeEventListener("pointercancel", onStop);
    };
  }, [isDividerDragging, minVideoH, MAX_VIDEO_H]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrollX(scrollRef.current.scrollLeft);
    }
  }, [setScrollX]);

  const toggleLayer = (l: string) => setLayers((p) => ({ ...p, [l]: !p[l] }));

  const selectTurn = (turn: Turn, speakerName: string) => {
    setSelection({ type: "turn", data: turn, speakerName });
  };

  // The seeded "demo" run carries a fake YouTube source_url for display, but
  // the actual playable file is the local mp4 — always prefer that for the demo.
  const videoUrl = runId === "demo" ? DEMO_VIDEO_URL : (runDetail?.source_url ?? "");
  const isLocalVideo = videoUrl.startsWith('/') || videoUrl.startsWith('./') || videoUrl.startsWith('blob:');

  const getPctFromClientX = useCallback((clientX: number) => {
    const rect = scrubBarRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  const startScrub = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsScrubbing(true);
    const pct = getPctFromClientX(e.clientX);
    if (pct !== null) {
      seekTo(pct * videoDuration);
      setHoverPct(pct);
      setHoverClientX(e.clientX);
      if (previewVidRef.current) previewVidRef.current.currentTime = pct * videoDuration;
    }
    const onMove = (ev: MouseEvent) => {
      const p = getPctFromClientX(ev.clientX);
      if (p === null) return;
      setHoverPct(p);
      setHoverClientX(ev.clientX);
      seekTo(p * videoDuration);
      if (previewVidRef.current) previewVidRef.current.currentTime = p * videoDuration;
    };
    const onUp = (ev: MouseEvent) => {
      const p = getPctFromClientX(ev.clientX);
      if (p !== null) seekTo(p * videoDuration);
      setIsScrubbing(false);
      setHoverPct(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [getPctFromClientX, seekTo, videoDuration]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <RunContextBar
        runId={runId}
        runName={runDetail?.display_name ?? "Loading…"}
        videoUrl={runId === "demo" ? "Joe Rogan × Flagrant (demo)" : (runDetail?.source_url ?? "")}
        currentPhase={currentPhase}
        completedPhases={completedPhases}
      />

      {/* ── VIDEO AREA — controls float in the black bars on either side ── */}
      <div style={{
        flexShrink: 0,
        height: videoHeightPx,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}>
        {videoUrl ? (
          <VideoPlayer
            videoUrl={videoUrl}
            className="h-full w-auto max-w-full"
            onDurationChange={setVideoDuration}
          />
        ) : (
          <span className="font-mono text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>No video</span>
        )}

        {/* Layer toggles — left black bar */}
        <div ref={togglesRef} style={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}>
          {LAYER_TOGGLES.map((l) => (
            <button
              key={l}
              onClick={() => toggleLayer(l)}
              className="font-heading font-medium text-[11px] px-2 py-0.5 rounded transition-colors"
              style={{
                background: layers[l] ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.5)",
                color: layers[l] ? "var(--color-text-primary)" : "var(--color-text-muted)",
                border: layers[l] ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(4px)",
                whiteSpace: "nowrap",
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Zoom + keyboard hint — right black bar */}
        <div ref={legendRef} style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 4,
        }}>
          <button
            onClick={() => setStorePps(PPS_BASE)}
            className="font-heading font-medium text-[11px] px-2 py-0.5 rounded"
            style={{
              background: "rgba(0,0,0,0.5)",
              color: "var(--color-text-muted)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(4px)",
            }}
          >
            Fit
          </button>
          {([1, 2, 4] as const).map((z) => {
            const isActive = Math.round(pps / PPS_BASE) === z;
            return (
              <button
                key={z}
                onClick={() => setStorePps(PPS_BASE * z)}
                className="font-heading font-medium text-[11px] px-2 py-0.5 rounded transition-colors"
                style={{
                  background: isActive ? "rgba(167,139,250,0.25)" : "rgba(0,0,0,0.5)",
                  color: isActive ? "var(--color-violet)" : "var(--color-text-muted)",
                  border: isActive ? "1px solid rgba(167,139,250,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {z}×
              </button>
            );
          })}
          <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.25)", marginTop: 8, writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: "0.05em" }}>
            Space · J/K/L · ←/→ · +/−
          </span>
        </div>
      </div>

      {/* ── DRAG HANDLE ── */}
      <div
        style={{
          flexShrink: 0,
          height: 6,
          background: 'var(--color-border-subtle)',
          cursor: 'ns-resize',
          position: 'relative',
          zIndex: 10,
          touchAction: 'none',
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          dividerDragRef.current = { startY: e.clientY, startH: videoHeightPx };
          setIsDividerDragging(true);
          e.currentTarget.setPointerCapture?.(e.pointerId);
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-violet-muted)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-border-subtle)'; }}
      >
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 32,
          height: 3,
          borderRadius: 2,
          background: 'var(--color-border)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── TRANSPORT BAR ── */}
      {isDividerDragging && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            cursor: 'ns-resize',
            userSelect: 'none',
          }}
        />
      )}

      <div style={{
        flexShrink: 0,
        height: 52,
        background: "var(--color-surface-1)",
        borderTop: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 16px",
      }}>
        <button
          onClick={() => isPlaying ? pause() : play()}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 4,
            background: "var(--color-surface-3)",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-primary)",
            flexShrink: 0,
          }}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <span style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 13,
          color: "var(--color-text-primary)",
          minWidth: 80,
          flexShrink: 0,
        }}>
          {formatTimecode(playheadPosition)}
        </span>

        {/* scrubber */}
        <div
          ref={scrubBarRef}
          style={{
            flex: 1,
            height: 16,
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            position: "relative",
            userSelect: "none",
          }}
          onMouseDown={startScrub}
          onMouseMove={(e) => {
            if (isScrubbing) return;
            const p = getPctFromClientX(e.clientX);
            setHoverPct(p);
            setHoverClientX(e.clientX);
            setScrubberTopY(e.currentTarget.getBoundingClientRect().top);
            if (p !== null && previewVidRef.current) previewVidRef.current.currentTime = p * videoDuration;
          }}
          onMouseLeave={() => { if (!isScrubbing) setHoverPct(null); }}
        >
          {/* track */}
          <div style={{ position: "absolute", left: 0, right: 0, height: 4, borderRadius: 2, background: "var(--color-surface-3)" }}>
            <div style={{
              width: `${(playheadPosition / videoDuration) * 100}%`,
              height: "100%",
              background: "var(--color-violet)",
              borderRadius: 2,
            }} />
          </div>

          {/* dot */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: `${(playheadPosition / videoDuration) * 100}%`,
            transform: "translate(-50%, -50%)",
            width: isScrubbing || hoverPct !== null ? 14 : 10,
            height: isScrubbing || hoverPct !== null ? 14 : 10,
            borderRadius: "50%",
            background: "var(--color-violet)",
            boxShadow: isScrubbing ? "0 0 0 3px rgba(167,139,250,0.3)" : "none",
            transition: isScrubbing ? "none" : "width 0.1s, height 0.1s",
            pointerEvents: "none",
          }} />

        </div>

        <span style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 12,
          color: "var(--color-text-muted)",
          flexShrink: 0,
        }}>
          {fmtTime(videoDuration)}
        </span>
      </div>

      {/* ── TIME RULER — fixed above lanes, scrolls horizontally with lanes ── */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          background: "var(--color-surface-1)",
          borderBottom: "1px solid var(--color-border-subtle)",
          height: 32,
        }}
      >
        {/* label column spacer */}
        <div style={{
          flexShrink: 0,
          width: LABEL_W,
          background: "var(--color-surface-1)",
          borderRight: "1px solid var(--color-border-subtle)",
        }} />
        {/* ruler wrapper — parentElement.parentElement chain for TimeRuler hit-testing */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <div>
            <TimeRuler
              duration={videoDuration}
              pixelsPerSecond={pps}
              scrollX={scrollX}
              viewportWidth={rulerViewportWidth}
              onSeek={seekTo}
            />
          </div>
          {/* playhead line in ruler */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 1,
              left: playheadPosition * pps - scrollX,
              background: "var(--color-violet)",
              pointerEvents: "none",
              zIndex: 20,
            }}
          />
        </div>
      </div>

      {/* ── LANES — stretches to fill remaining viewport, horizontal scroll only ── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowX: "auto",
          overflowY: "hidden",
          background: "var(--color-bg)",
        }}
        onScroll={handleScroll}
      >
        <div style={{ width: LABEL_W + totalWidth, minHeight: "100%" }}>

          {/* shots lane */}
          {layers["Shots"] && (
            <div className="flex border-b" style={{ height: laneH, borderColor: "var(--color-border-subtle)" }}>
              <div className="flex-shrink-0 sticky left-0 z-[5] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }}>
                <span className="font-heading font-medium text-[12px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>Shots</span>
              </div>
              <div className="relative flex" style={{ width: totalWidth }}>
                {shots.map((shot, i) => (
                  <TT key={shot.id} tip={`Shot ${shot.id}: ${fmtTime(shot.start)} → ${fmtTime(shot.end)}`}>
                    <div
                      className="flex items-center px-1 border-r"
                      style={{
                        height: laneH,
                        width: (shot.end - shot.start) * pps,
                        background: i % 2 === 0 ? "var(--color-surface-2)" : "var(--color-surface-3)",
                        borderColor: "var(--color-border)",
                      }}
                    >
                      {(shot.end - shot.start) * pps > 40 && (
                        <span className="font-mono text-[10px] truncate" style={{ color: "var(--color-text-muted)" }}>Shot {shot.id}</span>
                      )}
                    </div>
                  </TT>
                ))}
              </div>
            </div>
          )}

          {/* tracklets lane */}
          {layers["Tracklets"] && (
            <div className="flex border-b" style={{ height: laneH, borderColor: "var(--color-border-subtle)" }}>
              <div className="flex-shrink-0 sticky left-0 z-[5] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }}>
                <span className="font-heading font-medium text-[12px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>Tracklets</span>
              </div>
              <div className="relative" style={{ width: totalWidth, height: laneH }}>
                {shotTracklets.map((st) => (
                  <TT key={st.shotId} tip={`Shot ${st.shotId} · ${fmtTime(st.start)} → ${fmtTime(st.end)} · tracklets: ${st.letters.join(", ")}`}>
                    <div
                      className="absolute flex items-center justify-center rounded-sm border"
                      style={{
                        left: st.start * pps,
                        width: Math.max((st.end - st.start) * pps, 16),
                        top: Math.round(laneH * 0.15),
                        height: Math.round(laneH * 0.70),
                        background: "var(--color-surface-3)",
                        borderColor: "var(--color-border)",
                      }}
                    >
                      <span className="font-mono text-[10px]" style={{ color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "0 3px" }}>
                        {st.letters.join(", ")}
                      </span>
                    </div>
                  </TT>
                ))}
              </div>
            </div>
          )}

          {/* speaker lanes — canvas waveform: gray in silence, colored in speech */}
          {layers["Speakers"] && primarySpeakers.map((speaker) => {
            const spColor = SPEAKER_COLORS[speaker.id % SPEAKER_COLORS.length];
            return (
              <div key={speaker.id} className="flex border-b" style={{ height: laneH, borderColor: "var(--color-border-subtle)" }}>
                <div className="flex-shrink-0 sticky left-0 z-[5] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }}>
                  <span className="font-heading font-medium text-[12px] uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>{speaker.name}</span>
                </div>
                <WaveformLane
                  turns={speaker.turns}
                  color={spColor}
                  speakerId={speaker.id}
                  totalDuration={videoDuration}
                  pixelsPerSecond={pps}
                  scrollX={scrollX}
                  viewportWidth={viewportWidth}
                  totalWidth={totalWidth}
                  laneH={laneH}
                  onClickTurn={(turn) => selectTurn(turn as Turn, speaker.name)}
                />
              </div>
            );
          })}
          {layers["Speakers"] && hasMinorSpeakers && (
            <div className="flex border-b" style={{ height: laneH, borderColor: "var(--color-border-subtle)" }}>
              <div className="flex-shrink-0 sticky left-0 z-[5] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }}>
                <span className="font-heading font-medium text-[12px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>Minor Speakers</span>
              </div>
              <WaveformLane
                turns={minorSpeakerObj.turns}
                color="#71717A"
                speakerId={99}
                totalDuration={videoDuration}
                pixelsPerSecond={pps}
                scrollX={scrollX}
                viewportWidth={viewportWidth}
                totalWidth={totalWidth}
                laneH={laneH}
                onClickTurn={(turn) => {
                  const sp = minorSpeakers.find(s => s.turns.some(t => t.id === turn.id));
                  selectTurn(turn as Turn, sp?.name ?? "Minor Speakers");
                }}
              />
            </div>
          )}

          {/* transcript lane */}
          {layers["Transcript"] && (
            <div className="flex border-b" style={{ height: laneH, borderColor: "var(--color-border-subtle)" }}>
              <div className="flex-shrink-0 sticky left-0 z-[20] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)", boxShadow: "2px 0 0 var(--color-surface-1)" }}>
                <span className="font-heading font-medium text-[12px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>Transcript</span>
              </div>
              <div className="relative" style={{ width: totalWidth, height: laneH }}>
                {speakers.flatMap((sp) => sp.turns).sort((a, b) => a.start - b.start).slice(0, 60).map((turn) => (
                  <div
                    key={turn.id}
                    className="absolute inline-flex items-center px-1 rounded-sm cursor-pointer hover:brightness-110"
                    style={{
                      height: Math.round(laneH * 0.65),
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "var(--color-surface-2)",
                      left: turn.start * pps,
                      maxWidth: Math.max((turn.end - turn.start) * pps - 2, 24),
                      overflow: "hidden",
                    }}
                    onClick={() => selectTurn(turn, speakers.find(s => s.id === turn.speaker)?.name || "Unknown")}
                  >
                    <span className="font-mono text-[9px] truncate whitespace-nowrap" style={{ color: "var(--color-text-muted)" }}>
                      {turn.transcript}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* emotion lane */}
          {layers["Emotion"] && (
            <div className="flex border-b" style={{ height: laneH, borderColor: "var(--color-border-subtle)" }}>
              <div className="flex-shrink-0 sticky left-0 z-[20] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)", boxShadow: "2px 0 0 var(--color-surface-1)" }}>
                <span className="font-heading font-medium text-[12px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>Emotion</span>
              </div>
              <div className="relative" style={{ width: totalWidth, height: laneH }}>
                {emotions.map((emo, i) => (
                  <TT key={i} tip={`${emo.label} · ${fmtTime(emo.start)} → ${fmtTime(emo.end)}`}>
                    <div
                      className="absolute flex items-center px-1"
                      style={{
                        left: emo.start * pps,
                        height: laneH,
                        width: (emo.end - emo.start) * pps,
                        background: EMOTION_COLORS[emo.label] || "var(--color-surface-2)",
                      }}
                    >
                      {(emo.end - emo.start) * pps > 50 && (
                        <span className="font-mono text-[9px]" style={{ color: "var(--color-text-muted)" }}>{emo.label}</span>
                      )}
                    </div>
                  </TT>
                ))}
              </div>
            </div>
          )}

          {/* audio events lane */}
          {layers["Audio Events"] && (
            <div className="flex border-b" style={{ height: laneH, borderColor: "var(--color-border-subtle)" }}>
              <div className="flex-shrink-0 sticky left-0 z-[5] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }}>
                <span className="font-heading font-medium text-[12px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>Audio</span>
              </div>
              <div className="relative" style={{ width: totalWidth, height: laneH }}>
                {audioEvents.map((ev, i) => (
                  <TT key={i} tip={`${ev.label} · ${(ev.confidence * 100).toFixed(0)}% · ${fmtTime(ev.start)}`}>
                    <div
                      className="absolute top-0 flex flex-col items-center"
                      style={{ left: ev.start * pps, height: laneH }}
                    >
                      <div className="w-[2px] h-full rounded-sm" style={{ background: "var(--color-amber)" }} />
                      <span className="absolute top-1/2 -translate-y-1/2 left-1 font-mono text-[9px] whitespace-nowrap" style={{ color: "var(--color-amber)" }}>
                        {ev.label}
                      </span>
                    </div>
                  </TT>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── SCRUB PREVIEW — fixed so no parent overflow can clip it ── */}
      {isLocalVideo && (
        <div style={{
          position: "fixed",
          left: Math.min(Math.max(hoverClientX - 80, 8), window.innerWidth - 168),
          top: scrubberTopY - 90 - 24 - 8, // 90px thumb + 24px label + 8px gap above scrubber dot
          pointerEvents: "none",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          opacity: hoverPct !== null ? 1 : 0,
          transition: "opacity 0.1s",
        }}>
          <video
            ref={previewVidRef}
            src={videoUrl}
            style={{
              width: 160,
              height: 90,
              objectFit: "cover",
              borderRadius: 4,
              border: "1px solid var(--color-border)",
              background: "#000",
              display: "block",
            }}
            preload="metadata"
            muted
            onLoadedMetadata={() => {
              if (previewVidRef.current) setVideoDuration(previewVidRef.current.duration);
            }}
          />
          <span style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10,
            color: "var(--color-text-muted)",
            background: "var(--color-surface-2)",
            padding: "2px 6px",
            borderRadius: 3,
          }}>
            {hoverPct !== null ? formatTimecode(hoverPct * videoDuration) : ""}
          </span>
        </div>
      )}

      {/* ── FLOATING INSPECTOR — overlays the video area when a segment is selected ── */}
      {selection && (
        <div style={{
          position: "fixed",
          top: 48, // context bar height
          right: 0,
          width: 320,
          height: videoHeightPx,
          background: "var(--color-surface-1)",
          borderLeft: "1px solid var(--color-border)",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          <InfoPanel selection={selection} onClose={() => setSelection(null)} />
        </div>
      )}
    </div>
  );
}
