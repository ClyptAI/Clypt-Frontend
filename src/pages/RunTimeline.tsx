import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { X, Pencil, Play, Pause } from "lucide-react";
import RunContextBar from "@/components/app/RunContextBar";
import { TimeRuler, VideoPlayer } from "@/components/timeline";
import { useTimelineStore } from "@/stores/timeline-store";
import { useRunDetail } from "@/hooks/api/useRuns";
import { useTimelineKeyboard } from "@/hooks/useTimelineKeyboard";
import { useVisibleSegments } from "@/hooks";
import { formatTimecode } from "@/lib/timeline-utils";

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

/* ─── mock data ─── */
const MOCK_SHOTS = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  start: (VIDEO_DURATION / 42) * i,
  end: (VIDEO_DURATION / 42) * (i + 1),
}));

const MOCK_TRACKLETS = MOCK_SHOTS.slice(0, 20).flatMap((shot, si) => {
  const dur = shot.end - shot.start;
  const count = si % 3 === 0 ? 2 : 1;
  return Array.from({ length: count }, (_, ti) => ({
    id: `T${si}-${String.fromCharCode(65 + ti)}`,
    shotId: shot.id,
    letter: String.fromCharCode(65 + ti),
    start: shot.start + (dur / count) * ti,
    end: shot.start + (dur / count) * (ti + 1),
  }));
});

const generateTurns = (speaker: number, count: number) => {
  const gap = VIDEO_DURATION / (count + 1);
  return Array.from({ length: count }, (_, i) => {
    const start = gap * (i + 0.5) + speaker * 3;
    const duration = 8 + Math.random() * 28;
    return {
      id: `turn_${speaker}_${i}`,
      speaker,
      start: Math.min(start, VIDEO_DURATION - duration),
      end: Math.min(start + duration, VIDEO_DURATION),
      transcript: speaker === 0
        ? "So the question really becomes, how do you scale that kind of reasoning across all of these different modalities?"
        : "I think the interesting thing about this approach is that it fundamentally changes how we think about the problem space.",
      emotion: { primary: i % 2 === 0 ? "happy" : "neutral", score: 0.6 + Math.random() * 0.3, secondary: [{ label: "surprised", score: 0.2 }] },
    };
  });
};

const MOCK_SPEAKERS = [
  { id: 0, name: "Speaker 0", turns: generateTurns(0, 18) },
  { id: 1, name: "Speaker 1", turns: generateTurns(1, 14) },
];

const MOCK_EMOTIONS = [
  { start: 0, end: 120, label: "neutral" },
  { start: 120, end: 280, label: "happy" },
  { start: 280, end: 420, label: "surprised" },
  { start: 420, end: 600, label: "neutral" },
  { start: 600, end: 780, label: "angry" },
  { start: 780, end: 1000, label: "happy" },
  { start: 1000, end: 1200, label: "neutral" },
  { start: 1200, end: VIDEO_DURATION, label: "sad" },
];

const MOCK_AUDIO_EVENTS = [
  { start: 45, end: 46, label: "laughter", confidence: 0.92 },
  { start: 190, end: 191, label: "applause", confidence: 0.78 },
  { start: 380, end: 381, label: "music", confidence: 0.85 },
  { start: 540, end: 541, label: "laughter", confidence: 0.88 },
  { start: 720, end: 721, label: "silence", confidence: 0.95 },
  { start: 890, end: 891, label: "laughter", confidence: 0.81 },
  { start: 1100, end: 1101, label: "applause", confidence: 0.73 },
  { start: 1300, end: 1301, label: "music", confidence: 0.69 },
];

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

/* ─── tooltip ─── */
function TT({ children, tip }: { children: React.ReactNode; tip: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap pointer-events-none"
          style={{ background: "var(--color-surface-3)", color: "var(--color-text-primary)", border: "1px solid var(--color-border)" }}>
          {tip}
        </div>
      )}
    </div>
  );
}

/* ─── info panel ─── */
type Selection = { type: "turn"; data: typeof MOCK_SPEAKERS[0]["turns"][0]; speakerName: string } | null;

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

/* ─── virtualized speaker lane ─── */
interface SpeakerLaneProps {
  speaker: typeof MOCK_SPEAKERS[0]
  pixelsPerSecond: number
  scrollX: number
  viewportWidth: number
  totalWidth: number
  onSelectTurn: (turn: typeof MOCK_SPEAKERS[0]["turns"][0], speakerName: string) => void
}

function SpeakerLane({ speaker, pixelsPerSecond, scrollX, viewportWidth, totalWidth, onSelectTurn }: SpeakerLaneProps) {
  const segments = speaker.turns.map(t => ({
    ...t,
    startTime: t.start,
    endTime: t.end,
  }))

  const { visibleSegments } = useVisibleSegments(segments, pixelsPerSecond, scrollX, viewportWidth)
  const color = SPEAKER_COLORS[speaker.id % SPEAKER_COLORS.length]

  return (
    <div className="relative" style={{ width: totalWidth, height: 28 }}>
      {visibleSegments.map((turn) => (
        <TT key={turn.id} tip={`${turn.id} · ${fmtTime(turn.start)} → ${fmtTime(turn.end)} · "${turn.transcript.slice(0, 40)}…"`}>
          <div
            className="absolute top-1 rounded-sm border cursor-pointer hover:brightness-125"
            style={{
              left: turn.start * pixelsPerSecond,
              width: Math.max((turn.end - turn.start) * pixelsPerSecond, 4),
              height: 20,
              background: `${color}66`,
              borderColor: `${color}cc`,
            }}
            onClick={() => onSelectTurn(turn, speaker.name)}
          />
        </TT>
      ))}
    </div>
  )
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

  // ── Run metadata ────────────────────────────────────────────────────────────
  const { data: runDetail } = useRunDetail(runId);

  const completedPhases = runDetail?.phases.filter(p => p.status === "completed").length ?? 0;
  const runningPhase    = runDetail?.phases.find(p => p.status === "running");
  const currentPhase    = runningPhase?.phase ?? (completedPhases + 1);

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [layers, setLayers] = useState<Record<string, boolean>>(
    Object.fromEntries(LAYER_TOGGLES.map((l) => [l, true]))
  );
  const [selection, setSelection] = useState<Selection>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pps        = pixelsPerSecond;
  const totalWidth = VIDEO_DURATION * pps;
  const LABEL_W    = 100;

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
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrollX(scrollRef.current.scrollLeft);
    }
  }, [setScrollX]);

  const toggleLayer = (l: string) => setLayers((p) => ({ ...p, [l]: !p[l] }));

  const selectTurn = (turn: typeof MOCK_SPEAKERS[0]["turns"][0], speakerName: string) => {
    setSelection({ type: "turn", data: turn, speakerName });
  };

  const videoUrl = runDetail?.source_url ?? (runId === "demo" ? DEMO_VIDEO_URL : "");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <RunContextBar
        runId={runId}
        runName={runDetail?.display_name ?? "Loading…"}
        videoUrl={runDetail?.source_url ?? (runId === "demo" ? "Joe Rogan × Flagrant (demo)" : "")}
        currentPhase={currentPhase}
        completedPhases={completedPhases}
      />

      {/* ── VIDEO AREA — controls float in the black bars on either side ── */}
      <div style={{
        flex: 1,
        minHeight: 0,
        maxHeight: "52vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}>
        {videoUrl ? (
          <VideoPlayer videoUrl={videoUrl} className="h-full w-auto max-w-full" />
        ) : (
          <span className="font-mono text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>No video</span>
        )}

        {/* Layer toggles — left black bar */}
        <div style={{
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
        <div style={{
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

      {/* ── TRANSPORT BAR ── */}
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
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: "var(--color-surface-3)",
            cursor: "pointer",
            position: "relative",
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            seekTo(pct * VIDEO_DURATION);
          }}
        >
          <div style={{
            width: `${(playheadPosition / VIDEO_DURATION) * 100}%`,
            height: "100%",
            background: "var(--color-violet)",
            borderRadius: 2,
          }} />
          <div style={{
            position: "absolute",
            top: "50%",
            left: `${(playheadPosition / VIDEO_DURATION) * 100}%`,
            transform: "translate(-50%, -50%)",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "var(--color-violet)",
            pointerEvents: "none",
          }} />
        </div>

        <span style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 12,
          color: "var(--color-text-muted)",
          flexShrink: 0,
        }}>
          {fmtTime(VIDEO_DURATION)}
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
              duration={VIDEO_DURATION}
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

      {/* ── LANES — fixed height, horizontal scroll only ── */}
      <div
        ref={scrollRef}
        style={{
          flexShrink: 0,
          height: 200,
          overflowX: "auto",
          overflowY: "hidden",
          background: "var(--color-bg)",
        }}
        onScroll={handleScroll}
      >
        <div style={{ width: LABEL_W + totalWidth, minHeight: "100%" }}>

          {/* shots lane */}
          {layers["Shots"] && (
            <div className="flex border-b" style={{ height: 32, borderColor: "var(--color-border-subtle)" }}>
              <div className="flex-shrink-0 sticky left-0 z-[5] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }}>
                <span className="font-heading font-medium text-[12px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>Shots</span>
              </div>
              <div className="relative flex" style={{ width: totalWidth }}>
                {MOCK_SHOTS.map((shot, i) => (
                  <TT key={shot.id} tip={`Shot ${shot.id}: ${fmtTime(shot.start)} → ${fmtTime(shot.end)}`}>
                    <div
                      className="h-8 flex items-center px-1 border-r"
                      style={{
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
            <div className="flex border-b" style={{ height: 28, borderColor: "var(--color-border-subtle)" }}>
              <div className="flex-shrink-0 sticky left-0 z-[5] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }}>
                <span className="font-heading font-medium text-[12px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>Tracklets</span>
              </div>
              <div className="relative" style={{ width: totalWidth, height: 28 }}>
                {MOCK_TRACKLETS.map((t) => (
                  <TT key={t.id} tip={`${t.id} · Shot ${t.shotId} · ${fmtTime(t.start)} → ${fmtTime(t.end)}`}>
                    <div
                      className="absolute top-1 flex items-center justify-center rounded-sm border"
                      style={{
                        left: t.start * pps,
                        width: Math.max((t.end - t.start) * pps, 8),
                        height: 20,
                        background: "var(--color-surface-3)",
                        borderColor: "var(--color-border)",
                      }}
                    >
                      <span className="font-mono text-[10px]" style={{ color: "var(--color-text-primary)" }}>{t.letter}</span>
                    </div>
                  </TT>
                ))}
              </div>
            </div>
          )}

          {/* speaker lanes — virtualized: only visible turns are rendered */}
          {layers["Speakers"] && MOCK_SPEAKERS.map((speaker) => (
            <div key={speaker.id} className="flex border-b" style={{ height: 28, borderColor: "var(--color-border-subtle)" }}>
              <div className="flex-shrink-0 sticky left-0 z-[5] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }}>
                <span className="font-heading font-medium text-[12px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>{speaker.name}</span>
              </div>
              <SpeakerLane
                speaker={speaker}
                pixelsPerSecond={pps}
                scrollX={scrollX}
                viewportWidth={viewportWidth}
                totalWidth={totalWidth}
                onSelectTurn={selectTurn}
              />
            </div>
          ))}

          {/* transcript lane */}
          {layers["Transcript"] && (
            <div className="flex border-b" style={{ height: 40, borderColor: "var(--color-border-subtle)" }}>
              <div className="flex-shrink-0 sticky left-0 z-[5] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }}>
                <span className="font-heading font-medium text-[12px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>Transcript</span>
              </div>
              <div className="relative flex items-center gap-0.5 px-1" style={{ width: totalWidth }}>
                {MOCK_SPEAKERS.flatMap((sp) => sp.turns).sort((a, b) => a.start - b.start).slice(0, 60).map((turn) => {
                  const words = turn.transcript.split(" ").slice(0, pixelsPerSecond >= 4 * PPS_BASE ? 6 : 2);
                  return words.map((w, wi) => (
                    <div
                      key={`${turn.id}-${wi}`}
                      className="inline-flex items-center px-1 rounded-sm flex-shrink-0 cursor-pointer hover:bg-[var(--color-surface-3)]"
                      style={{
                        height: 18,
                        background: "var(--color-surface-2)",
                        position: "absolute",
                        left: (turn.start + wi * 1.2) * pps,
                      }}
                      onClick={() => selectTurn(turn, MOCK_SPEAKERS.find(s => s.id === turn.speaker)?.name || "Unknown")}
                    >
                      <span className="font-mono text-[9px] truncate" style={{ color: "var(--color-text-muted)" }}>{w}</span>
                    </div>
                  ));
                })}
              </div>
            </div>
          )}

          {/* emotion lane */}
          {layers["Emotion"] && (
            <div className="flex border-b" style={{ height: 28, borderColor: "var(--color-border-subtle)" }}>
              <div className="flex-shrink-0 sticky left-0 z-[5] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }}>
                <span className="font-heading font-medium text-[12px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>Emotion</span>
              </div>
              <div className="relative flex" style={{ width: totalWidth }}>
                {MOCK_EMOTIONS.map((emo, i) => (
                  <TT key={i} tip={`${emo.label} · ${fmtTime(emo.start)} → ${fmtTime(emo.end)}`}>
                    <div
                      className="h-7 flex items-center px-1"
                      style={{
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
            <div className="flex border-b" style={{ height: 32, borderColor: "var(--color-border-subtle)" }}>
              <div className="flex-shrink-0 sticky left-0 z-[5] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }}>
                <span className="font-heading font-medium text-[12px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>Audio</span>
              </div>
              <div className="relative" style={{ width: totalWidth, height: 32 }}>
                {MOCK_AUDIO_EVENTS.map((ev, i) => (
                  <TT key={i} tip={`${ev.label} · ${(ev.confidence * 100).toFixed(0)}% · ${fmtTime(ev.start)}`}>
                    <div
                      className="absolute top-0 flex flex-col items-center"
                      style={{ left: ev.start * pps, height: 32 }}
                    >
                      <div className="w-[2px] h-full rounded-sm" style={{ background: "var(--color-amber)" }} />
                      <span className="absolute bottom-0.5 left-1 font-mono text-[9px] whitespace-nowrap" style={{ color: "var(--color-amber)" }}>
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

      {/* ── FLOATING INSPECTOR — overlays the video area when a segment is selected ── */}
      {selection && (
        <div style={{
          position: "fixed",
          top: 100,
          right: 0,
          width: 320,
          bottom: 284, // transport(52) + ruler(32) + lanes(200)
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
