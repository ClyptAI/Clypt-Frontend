import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Check, Lock, Play, Pause, Zap, TriangleAlert, Crop, X } from "lucide-react";
import { toast } from "sonner";

/* ── Types ── */
interface QueueClip {
  id: string;
  label: string;
  timeStart: string;
  timeEnd: string;
  duration: string;
  status: "partial" | "not_started" | "complete" | "locked";
  speakers?: string;
  camera?: string;
}

interface Tracklet { id: string; letter: string; durationPct: number }
interface Turn { speakerIdx: number; startPct: number; widthPct: number }
interface ShotData {
  idx: number;
  timeStart: string;
  timeEnd: string;
  duration: string;
  startMs: number;
  endMs: number;
  tracklets: Tracklet[];
  turns: Turn[];
  speakers: number[];
  transcript: string[];
  voiceprintSuggestion?: { speakerIdx: number; name: string; confidence: number };
  conflict?: { speaker0: number; speaker1: number; tracklet: string; time: string };
}

interface Binding {
  tracklet_id: string;
  speaker_id: number;
  start_ms: number;
  end_ms: number;
  method: "drag" | "word" | "range";
}

/* ── Mock data ── */
const QUEUE: QueueClip[] = [
  { id: "001", label: "Clip 001", timeStart: "0:42", timeEnd: "1:18", duration: "35s", status: "partial", speakers: "3/4", camera: "4/4" },
  { id: "002", label: "Clip 002", timeStart: "3:22", timeEnd: "4:05", duration: "43s", status: "not_started" },
  { id: "003", label: "Clip 003", timeStart: "1:50", timeEnd: "2:31", duration: "41s", status: "not_started" },
  { id: "004", label: "Clip 004", timeStart: "6:10", timeEnd: "6:48", duration: "38s", status: "not_started" },
  { id: "005", label: "Clip 005", timeStart: "8:05", timeEnd: "8:44", duration: "39s", status: "not_started" },
  { id: "006", label: "Clip 006", timeStart: "11:22", timeEnd: "12:00", duration: "38s", status: "locked" },
  { id: "007", label: "Clip 007", timeStart: "14:33", timeEnd: "15:10", duration: "37s", status: "locked" },
  { id: "008", label: "Clip 008", timeStart: "17:02", timeEnd: "17:38", duration: "36s", status: "locked" },
];

const SPEAKER_COLORS = ["#4A9EFF", "#FF7A5C", "#5CCD8F"];

const SHOTS: ShotData[] = [
  {
    idx: 1, timeStart: "0:42.0", timeEnd: "0:51.3", duration: "9.3s", startMs: 42000, endMs: 51300,
    tracklets: [{ id: "tracklet_001", letter: "A", durationPct: 100 }, { id: "tracklet_002", letter: "B", durationPct: 100 }],
    turns: [{ speakerIdx: 0, startPct: 0, widthPct: 100 }, { speakerIdx: 1, startPct: 33, widthPct: 67 }],
    speakers: [0, 1],
    transcript: ["I", "think", "we're", "at", "an", "inflection", "point", "with", "AI", "that", "most", "people", "don't", "fully", "appreciate", "yet"],
    voiceprintSuggestion: { speakerIdx: 0, name: "Rithvik — Host", confidence: 83 },
  },
  {
    idx: 2, timeStart: "0:51.3", timeEnd: "1:04.1", duration: "12.8s", startMs: 51300, endMs: 64100,
    tracklets: [{ id: "tracklet_001", letter: "A", durationPct: 100 }],
    turns: [{ speakerIdx: 1, startPct: 0, widthPct: 100 }],
    speakers: [1],
    transcript: ["The", "capabilities", "are", "advancing", "faster", "than", "our", "institutions", "can", "adapt", "to", "them"],
  },
  {
    idx: 3, timeStart: "1:04.1", timeEnd: "1:11.8", duration: "7.7s", startMs: 64100, endMs: 71800,
    tracklets: [{ id: "tracklet_001", letter: "A", durationPct: 50 }, { id: "tracklet_002", letter: "B", durationPct: 50 }],
    turns: [{ speakerIdx: 0, startPct: 0, widthPct: 65 }, { speakerIdx: 1, startPct: 39, widthPct: 61 }],
    speakers: [0, 1],
    transcript: ["Let", "me", "show", "you", "what", "happens", "when", "you", "ask", "the", "model"],
  },
  {
    idx: 4, timeStart: "1:11.8", timeEnd: "1:18.1", duration: "6.3s", startMs: 71800, endMs: 78100,
    tracklets: [{ id: "tracklet_001", letter: "A", durationPct: 50 }, { id: "tracklet_002", letter: "B", durationPct: 50 }],
    turns: [{ speakerIdx: 0, startPct: 0, widthPct: 100 }, { speakerIdx: 1, startPct: 19, widthPct: 81 }],
    speakers: [0, 1],
    transcript: ["It", "fails", "consistently", "and", "not", "in", "a", "random", "way"],
  },
];

/* Initial bindings matching original mock */
function getInitialBindings(): Record<number, Binding[]> {
  return {
    1: [{ tracklet_id: "tracklet_001", speaker_id: 0, start_ms: 42000, end_ms: 51300, method: "drag" }],
    2: [],
    3: [],
    4: [{ tracklet_id: "tracklet_001", speaker_id: 0, start_ms: 71800, end_ms: 78100, method: "drag" }],
  };
}

/* ── Helpers ── */
function msToTimestamp(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(1);
  return `${minutes}:${seconds.padStart(4, "0")}`;
}

function computeGroundingProgress(bindings: Record<number, Binding[]>): { grounded: number; total: number } {
  let grounded = 0;
  const total = SHOTS.length;
  for (const shot of SHOTS) {
    const shotBindings = bindings[shot.idx] || [];
    const allTrackletsBound = shot.tracklets.every((t) => shotBindings.some((b) => b.tracklet_id === t.id));
    if (allTrackletsBound) grounded++;
  }
  return { grounded, total };
}

/* ── StatusIcon ── */
function StatusIcon({ status }: { status: QueueClip["status"] }) {
  const base: React.CSSProperties = { width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
  switch (status) {
    case "complete":
      return <span style={{ ...base, background: "var(--color-green-muted)", border: "1px solid var(--color-green)" }}><Check size={12} color="var(--color-green)" /></span>;
    case "partial":
      return (
        <span style={{ ...base, border: "2px solid var(--color-amber)", background: "var(--color-amber-muted)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-amber)" }} />
        </span>
      );
    case "locked":
      return <span style={{ ...base, border: "1px solid var(--color-border)", opacity: 0.3 }}><Lock size={10} color="var(--color-text-muted)" /></span>;
    default:
      return <span style={{ ...base, border: "1px solid var(--color-border)" }} />;
  }
}

/* ── Video Player (unchanged) ── */
function InlineVideoPlayer() {
  const [playing, setPlaying] = useState(false);
  const [progress] = useState(25);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [speed, setSpeed] = useState("1×");

  return (
    <div style={{ height: 160, flexShrink: 0, background: "#000", borderBottom: "1px solid var(--color-border)", position: "relative", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 228, height: 128, background: "var(--color-surface-3)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Play size={32} color="var(--color-text-muted)" />
        </div>
      </div>
      <div style={{ height: 32, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", gap: 12, padding: "0 12px" }}>
        <button onClick={() => setPlaying(!playing)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "#fff" }}>
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "#fff" }}>0:42.4 / 1:18.1</span>
        <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.2)", borderRadius: 2, position: "relative", cursor: "pointer" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "var(--color-violet)", borderRadius: 2 }} />
          <div style={{ position: "absolute", top: -3.5, left: `${progress}%`, transform: "translateX(-50%)", width: 10, height: 10, borderRadius: "50%", background: "var(--color-violet)" }} />
        </div>
        <div style={{ position: "relative" }}>
          <button onClick={() => setSpeedOpen(!speedOpen)} style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "#fff", background: "none", border: "none", cursor: "pointer" }}>{speed}</button>
          {speedOpen && (
            <div style={{ position: "absolute", bottom: "100%", right: 0, background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: 6, padding: 4, zIndex: 10 }}>
              {["0.5×", "0.75×", "1×", "1.25×", "1.5×"].map((s) => (
                <button key={s} onClick={() => { setSpeed(s); setSpeedOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "4px 10px", fontFamily: "'Geist Mono', monospace", fontSize: 11, color: speed === s ? "var(--color-text-primary)" : "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer", borderRadius: 3 }}>{s}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Shot Lane Section (with interactions) ── */
function ShotSection({
  shot,
  shotBindings,
  onAddBinding,
  onRemoveBinding,
}: {
  shot: ShotData;
  shotBindings: Binding[];
  onAddBinding: (shotIdx: number, binding: Binding) => void;
  onRemoveBinding: (shotIdx: number, trackletId: string, speakerId: number) => void;
}) {
  const [vpAccepted, setVpAccepted] = useState(false);
  const [vpDismissed, setVpDismissed] = useState(false);
  const [showRegistry, setShowRegistry] = useState(false);

  /* Drag state */
  const [dragOverTracklet, setDragOverTracklet] = useState<string | null>(null);

  /* Word popover */
  const [wordPopover, setWordPopover] = useState<{ wordIdx: number; speakerIdx: number } | null>(null);

  /* Time range selection */
  const trackletLaneRef = useRef<HTMLDivElement>(null);
  const [rangeSelect, setRangeSelect] = useState<{ startX: number; currentX: number } | null>(null);
  const [rangePopover, setRangePopover] = useState<{ x: number; startPct: number; endPct: number } | null>(null);
  const isDraggingRange = useRef(false);

  /* Context menu for unbinding */
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; trackletId: string; speakerId: number } | null>(null);

  /* Close popovers on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-popover]")) {
        setWordPopover(null);
        setRangePopover(null);
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Method 1: Drag speaker to tracklet ── */
  const handleSpeakerDragStart = (e: React.DragEvent, speakerIdx: number) => {
    e.dataTransfer.setData("speaker_idx", String(speakerIdx));
    e.dataTransfer.effectAllowed = "link";
    // Create drag ghost pill
    const ghost = document.createElement("div");
    ghost.textContent = `Speaker_0${speakerIdx}`;
    ghost.style.cssText = `
      padding: 4px 10px; border-radius: 12px; font-family: 'Bricolage Grotesque', sans-serif;
      font-size: 12px; font-weight: 600; color: #0A0909;
      background: ${SPEAKER_COLORS[speakerIdx]}; position: absolute; top: -1000px;
    `;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 40, 14);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleTrackletDragOver = (e: React.DragEvent, trackletId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "link";
    setDragOverTracklet(trackletId);
  };

  const handleTrackletDrop = (e: React.DragEvent, trackletId: string) => {
    e.preventDefault();
    setDragOverTracklet(null);
    const speakerIdx = parseInt(e.dataTransfer.getData("speaker_idx"), 10);
    if (isNaN(speakerIdx)) return;
    onAddBinding(shot.idx, {
      tracklet_id: trackletId,
      speaker_id: speakerIdx,
      start_ms: shot.startMs,
      end_ms: shot.endMs,
      method: "drag",
    });
    toast.success(`Speaker_0${speakerIdx} assigned to ${trackletId}`);
  };

  /* ── Method 2: Click word token ── */
  const handleWordClick = (wordIdx: number) => {
    // Assign word to speaker 0 for first half of transcript, speaker 1 for second half (mock)
    const speakerIdx = wordIdx < shot.transcript.length / 2 ? (shot.speakers[0] ?? 0) : (shot.speakers[1] ?? shot.speakers[0] ?? 0);
    setWordPopover({ wordIdx, speakerIdx });
    setRangePopover(null);
    setContextMenu(null);
  };

  const handleWordAssign = (trackletId: string, speakerIdx: number) => {
    const wordFraction = 1 / shot.transcript.length;
    const shotDur = shot.endMs - shot.startMs;
    const startMs = shot.startMs + Math.floor(wordFraction * (wordPopover?.wordIdx ?? 0) * shotDur);
    const endMs = startMs + Math.floor(wordFraction * shotDur);
    onAddBinding(shot.idx, {
      tracklet_id: trackletId,
      speaker_id: speakerIdx,
      start_ms: startMs,
      end_ms: endMs,
      method: "word",
    });
    setWordPopover(null);
    toast.success(`Speaker_0${speakerIdx} assigned to ${trackletId}`);
  };

  /* ── Method 3: Click-drag time range in tracklet lane ── */
  const handleTrackletLaneMouseDown = (e: React.MouseEvent) => {
    if (!trackletLaneRef.current) return;
    const rect = trackletLaneRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    isDraggingRange.current = true;
    setRangeSelect({ startX: x, currentX: x });
    setRangePopover(null);
    setWordPopover(null);
    setContextMenu(null);
  };

  const handleTrackletLaneMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRange.current || !rangeSelect || !trackletLaneRef.current) return;
    const rect = trackletLaneRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setRangeSelect({ ...rangeSelect, currentX: x });
  };

  const handleTrackletLaneMouseUp = () => {
    if (!isDraggingRange.current || !rangeSelect || !trackletLaneRef.current) return;
    isDraggingRange.current = false;
    const rect = trackletLaneRef.current.getBoundingClientRect();
    const minX = Math.min(rangeSelect.startX, rangeSelect.currentX);
    const maxX = Math.max(rangeSelect.startX, rangeSelect.currentX);
    if (maxX - minX < 10) {
      setRangeSelect(null);
      return;
    }
    const startPct = (minX / rect.width) * 100;
    const endPct = (maxX / rect.width) * 100;
    setRangePopover({ x: maxX, startPct, endPct });
    setRangeSelect(null);
  };

  const handleRangeAssign = (speakerIdx: number) => {
    if (!rangePopover) return;
    const shotDur = shot.endMs - shot.startMs;
    const startMs = shot.startMs + Math.floor((rangePopover.startPct / 100) * shotDur);
    const endMs = shot.startMs + Math.floor((rangePopover.endPct / 100) * shotDur);
    // Find the tracklet that overlaps this range most
    const trackletId = shot.tracklets[0]?.id ?? "tracklet_001";
    onAddBinding(shot.idx, {
      tracklet_id: trackletId,
      speaker_id: speakerIdx,
      start_ms: startMs,
      end_ms: endMs,
      method: "range",
    });
    setRangePopover(null);
    toast.success(`Speaker_0${speakerIdx} assigned to ${trackletId}`);
  };

  /* ── Unbind context menu ── */
  const handleTrackletContextMenu = (e: React.MouseEvent, trackletId: string) => {
    e.preventDefault();
    const binding = shotBindings.find((b) => b.tracklet_id === trackletId);
    if (!binding) return;
    setContextMenu({ x: e.clientX, y: e.clientY, trackletId, speakerId: binding.speaker_id });
    setWordPopover(null);
    setRangePopover(null);
  };

  return (
    <div style={{ borderBottom: "2px solid var(--color-border)", paddingBottom: 4, position: "relative" }}>
      {/* Shot header */}
      <div style={{ height: 36, background: "var(--color-surface-1)", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center", padding: "0 16px", gap: 12, position: "sticky", top: 0, zIndex: 5 }}>
        <div style={{ width: 48, height: 27, borderRadius: 3, background: "var(--color-surface-3)", flexShrink: 0 }} />
        <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>Shot {shot.idx}</span>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>{shot.timeStart} – {shot.timeEnd}</span>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>({shot.duration})</span>
      </div>

      {/* Tracklet lane */}
      <div style={{ height: 44, display: "flex", alignItems: "center", padding: "0 16px", background: "var(--color-bg)", borderBottom: "1px solid var(--color-border-subtle)", position: "relative" }}>
        <span className="label-caps" style={{ width: 80, flexShrink: 0, fontSize: 10 }}>TRACKLETS</span>
        <div
          ref={trackletLaneRef}
          style={{ flex: 1, display: "flex", gap: 2, alignItems: "center", height: 32, position: "relative", cursor: "crosshair" }}
          onMouseDown={handleTrackletLaneMouseDown}
          onMouseMove={handleTrackletLaneMouseMove}
          onMouseUp={handleTrackletLaneMouseUp}
          onMouseLeave={() => { if (isDraggingRange.current) { isDraggingRange.current = false; setRangeSelect(null); } }}
        >
          {shot.tracklets.map((t) => {
            const bound = shotBindings.find((b) => b.tracklet_id === t.id);
            const speakerColor = bound ? SPEAKER_COLORS[bound.speaker_id] : undefined;
            const isDragTarget = dragOverTracklet === t.id;
            return (
              <div
                key={t.id}
                onDragOver={(e) => handleTrackletDragOver(e, t.id)}
                onDragLeave={() => setDragOverTracklet(null)}
                onDrop={(e) => { e.stopPropagation(); handleTrackletDrop(e, t.id); }}
                onContextMenu={(e) => handleTrackletContextMenu(e, t.id)}
                style={{
                  flex: t.durationPct,
                  minWidth: 60,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: isDragTarget ? "var(--color-violet-muted)" : "var(--color-surface-2)",
                  border: isDragTarget ? "2px dashed var(--color-violet)" : "1px solid var(--color-border)",
                  borderLeft: speakerColor ? `3px solid ${speakerColor}` : isDragTarget ? "2px dashed var(--color-violet)" : "1px solid var(--color-border)",
                  borderRadius: 4,
                  padding: "4px 8px",
                  cursor: "grab",
                  userSelect: "none",
                  transition: "border 100ms, background 100ms",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--color-surface-3)", flexShrink: 0 }} />
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-primary)" }}>{t.letter}</span>
              </div>
            );
          })}

          {/* Range selection overlay */}
          {rangeSelect && (() => {
            const minX = Math.min(rangeSelect.startX, rangeSelect.currentX);
            const maxX = Math.max(rangeSelect.startX, rangeSelect.currentX);
            return (
              <div style={{
                position: "absolute", left: minX, width: maxX - minX, top: 0, height: "100%",
                background: "rgba(139, 92, 246, 0.15)", border: "1px solid var(--color-violet)",
                borderRadius: 2, pointerEvents: "none", zIndex: 3,
              }} />
            );
          })()}
        </div>

        {/* Range popover */}
        {rangePopover && (
          <div
            data-popover
            style={{
              position: "absolute", top: 44, left: 80 + rangePopover.x - 80, zIndex: 30,
              background: "var(--color-surface-1)", border: "1px solid var(--color-border)",
              borderRadius: 8, padding: 12, minWidth: 200, boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)", marginBottom: 4 }}>
              Assign time range to speaker
            </div>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)", marginBottom: 10 }}>
              {msToTimestamp(shot.startMs + (rangePopover.startPct / 100) * (shot.endMs - shot.startMs))} → {msToTimestamp(shot.startMs + (rangePopover.endPct / 100) * (shot.endMs - shot.startMs))}
            </div>
            {shot.speakers.map((sIdx) => (
              <button
                key={sIdx}
                onClick={() => handleRangeAssign(sIdx)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "6px 10px", border: "1px solid var(--color-border)", borderRadius: 6,
                  background: "transparent", cursor: "pointer", marginBottom: 4,
                  fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 12,
                  color: "var(--color-text-primary)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-3)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: SPEAKER_COLORS[sIdx], flexShrink: 0 }} />
                Speaker_0{sIdx}
              </button>
            ))}
            <button
              onClick={() => setRangePopover(null)}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer", marginTop: 4 }}
            >Cancel</button>
          </div>
        )}
      </div>

      {/* Binding indicators */}
      {shotBindings.length > 0 && (
        <svg style={{ width: "100%", height: 12, display: "block" }} preserveAspectRatio="none">
          {shotBindings.map((b, i) => {
            const color = SPEAKER_COLORS[b.speaker_id];
            const xStart = 126;
            const tIdx = shot.tracklets.findIndex((t) => t.id === b.tracklet_id);
            const xEnd = 96 + 40 + tIdx * 80;
            return <line key={i} x1={xStart} y1={10} x2={xEnd} y2={2} stroke={color} strokeWidth={1} opacity={0.6} strokeDasharray="4 3" />;
          })}
        </svg>
      )}

      {/* Speaker lanes */}
      {shot.speakers.map((sIdx) => {
        const turn = shot.turns.find((t) => t.speakerIdx === sIdx);
        const color = SPEAKER_COLORS[sIdx];
        const hasVp = shot.voiceprintSuggestion?.speakerIdx === sIdx && !vpAccepted && !vpDismissed;
        return (
          <div key={sIdx}>
            <div style={{ height: 32, display: "flex", alignItems: "center", padding: "0 16px", background: "var(--color-bg)", borderBottom: "1px solid var(--color-border-subtle)" }}>
              <div
                draggable
                onDragStart={(e) => handleSpeakerDragStart(e, sIdx)}
                style={{ width: 80, flexShrink: 0, display: "flex", alignItems: "center", gap: 6, cursor: "grab" }}
              >
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 12, color: "var(--color-text-secondary)" }}>
                  {vpAccepted && sIdx === shot.voiceprintSuggestion?.speakerIdx ? shot.voiceprintSuggestion.name.split(" — ")[0] : `Speaker_0${sIdx}`}
                </span>
                {hasVp && <Zap size={10} color="var(--color-amber)" />}
              </div>
              <div style={{ flex: 1, position: "relative", height: 20 }}>
                {turn && (
                  <div style={{ position: "absolute", left: `${turn.startPct}%`, width: `${turn.widthPct}%`, height: "100%", background: `${color}66`, borderRadius: 2, cursor: "pointer" }} />
                )}
              </div>
            </div>
            {hasVp && (
              <div style={{ padding: "4px 8px 4px 96px", display: "flex", alignItems: "center", gap: 8, background: "var(--color-bg)", borderBottom: "1px solid var(--color-border-subtle)" }}>
                <Zap size={12} color="var(--color-amber)" />
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-text-secondary)" }}>
                  Likely: {shot.voiceprintSuggestion!.name} ({shot.voiceprintSuggestion!.confidence}%)
                </span>
                <button onClick={() => { setVpAccepted(true); setShowRegistry(true); }} style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 11, color: "var(--color-green)", background: "none", border: "none", cursor: "pointer" }}>Accept</button>
                <button onClick={() => setVpDismissed(true)} style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 11, color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-rose)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                >Reject</button>
              </div>
            )}
            {showRegistry && sIdx === shot.voiceprintSuggestion?.speakerIdx && (
              <div style={{ padding: "6px 8px 6px 96px", display: "flex", alignItems: "center", gap: 8, background: "var(--color-surface-1)", borderBottom: "1px solid var(--color-border-subtle)" }}>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-text-secondary)" }}>
                  Save &apos;{shot.voiceprintSuggestion!.name}&apos; to your voiceprint registry?
                </span>
                <button onClick={() => setShowRegistry(false)} style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 11, padding: "3px 8px", borderRadius: 4, background: "var(--color-violet)", color: "#0A0909", border: "none", cursor: "pointer" }}>Save to registry</button>
                <button onClick={() => setShowRegistry(false)} style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 11, color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer" }}>This run only</button>
              </div>
            )}
          </div>
        );
      })}

      {/* Conflict */}
      {shot.conflict && (
        <div style={{ padding: "6px 16px", display: "flex", alignItems: "center", gap: 8, background: "var(--color-rose-muted)", borderLeft: "3px solid var(--color-rose)" }}>
          <TriangleAlert size={14} color="var(--color-rose)" />
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 13, color: "var(--color-rose)" }}>
            Conflict: Speaker_0{shot.conflict.speaker0} and Speaker_0{shot.conflict.speaker1} both assigned to {shot.conflict.tracklet} at {shot.conflict.time}
          </span>
        </div>
      )}

      {/* Transcript lane */}
      <div style={{ minHeight: 36, padding: "8px 16px 8px 96px", background: "var(--color-surface-1)", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", flexWrap: "wrap", gap: 2, alignContent: "flex-start", position: "relative" }}>
        {shot.transcript.map((word, i) => {
          const isSelected = wordPopover?.wordIdx === i;
          const speakerIdx = i < shot.transcript.length / 2 ? (shot.speakers[0] ?? 0) : (shot.speakers[1] ?? shot.speakers[0] ?? 0);
          const hasBoundWord = shotBindings.some((b) => b.method === "word" && b.speaker_id === speakerIdx);
          return (
            <span
              key={i}
              style={{
                padding: "1px 3px", borderRadius: 2,
                fontFamily: "'Geist Mono', monospace", fontSize: 11,
                color: isSelected ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                cursor: "pointer", position: "relative",
                background: isSelected ? "var(--color-violet-muted)" : hasBoundWord ? `${SPEAKER_COLORS[speakerIdx]}22` : "transparent",
                border: isSelected ? "1px solid var(--color-violet)" : "1px solid transparent",
              }}
              onClick={(e) => { e.stopPropagation(); handleWordClick(i); }}
              onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.background = "var(--color-surface-3)"; e.currentTarget.style.color = "var(--color-text-primary)"; } }}
              onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.background = hasBoundWord ? `${SPEAKER_COLORS[speakerIdx]}22` : "transparent"; e.currentTarget.style.color = "var(--color-text-secondary)"; } }}
            >
              {word}
              {/* Word popover */}
              {isSelected && wordPopover && (
                <div
                  data-popover
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute", bottom: "100%", left: 0, marginBottom: 6, zIndex: 30,
                    background: "var(--color-surface-1)", border: "1px solid var(--color-border)",
                    borderRadius: 8, padding: 12, minWidth: 200, boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)", marginBottom: 8 }}>
                    Assign word span to tracklet
                  </div>
                  {shot.tracklets.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleWordAssign(t.id, speakerIdx)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8, width: "100%",
                        padding: "6px 10px", border: "1px solid var(--color-border)", borderRadius: 6,
                        background: "transparent", cursor: "pointer", marginBottom: 4,
                        fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 12,
                        color: "var(--color-text-primary)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-3)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--color-surface-3)", flexShrink: 0 }} />
                      <span>{t.letter}</span>
                      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)", marginLeft: "auto" }}>{shot.duration}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setWordPopover(null)}
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer", marginTop: 4 }}
                  >Cancel</button>
                </div>
              )}
            </span>
          );
        })}
      </div>

      {/* Context menu for unbinding */}
      {contextMenu && (
        <div
          data-popover
          style={{
            position: "fixed", left: contextMenu.x, top: contextMenu.y, zIndex: 50,
            background: "var(--color-surface-1)", border: "1px solid var(--color-border)",
            borderRadius: 6, padding: 4, minWidth: 240, boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <button
            onClick={() => {
              onRemoveBinding(shot.idx, contextMenu.trackletId, contextMenu.speakerId);
              setContextMenu(null);
              toast("Assignment removed");
            }}
            style={{
              display: "block", width: "100%", textAlign: "left", padding: "8px 12px",
              fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13,
              color: "var(--color-text-primary)", background: "none", border: "none",
              cursor: "pointer", borderRadius: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-3)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Remove assignment: Speaker_0{contextMenu.speakerId} → {contextMenu.trackletId}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Shot Lane Editor ── */
function ShotLaneEditor({
  bindings,
  onAddBinding,
  onRemoveBinding,
}: {
  bindings: Record<number, Binding[]>;
  onAddBinding: (shotIdx: number, binding: Binding) => void;
  onRemoveBinding: (shotIdx: number, trackletId: string, speakerId: number) => void;
}) {
  return (
    <>
      <InlineVideoPlayer />
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", background: "var(--color-bg)" }}>
        {SHOTS.map((s) => (
          <ShotSection
            key={s.idx}
            shot={s}
            shotBindings={bindings[s.idx] || []}
            onAddBinding={onAddBinding}
            onRemoveBinding={onRemoveBinding}
          />
        ))}
      </div>
    </>
  );
}

/* ── Camera Intent Types ── */
type IntentType = "Follow" | "Reaction" | "Split" | "Wide" | "Manual";

interface ShotIntent {
  intent: IntentType;
  follow?: number;
  reactOn?: number;
  reactFollow?: number;
  splitLeft?: number;
  splitRight?: number;
  wideIncludes?: number[];
  cropSet?: boolean;
}

const INTENT_OPTIONS: IntentType[] = ["Follow", "Reaction", "Split", "Wide", "Manual"];

function getInitialIntents(): ShotIntent[] {
  return [
    { intent: "Follow", follow: 0 },
    { intent: "Reaction", reactOn: 1, reactFollow: 0 },
    { intent: "Split", splitLeft: 0, splitRight: 1 },
    { intent: "Wide", wideIncludes: [0, 1] },
  ];
}

function isShotIntentComplete(si: ShotIntent, speakers: number[]): boolean {
  if (!si.intent) return false;
  switch (si.intent) {
    case "Follow": return si.follow != null;
    case "Reaction": return si.reactOn != null && si.reactFollow != null;
    case "Split": return si.splitLeft != null && si.splitRight != null;
    case "Wide": return (si.wideIncludes ?? []).length > 0;
    case "Manual": return true;
    default: return false;
  }
}

const SPEAKER_NAMES: Record<number, string> = { 0: "Rithvik — Host", 1: "Speaker_01", 2: "Speaker_02" };

const CameraIntentPanel = () => {
  const [intents, setIntents] = useState<ShotIntent[]>(getInitialIntents);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const completedCount = SHOTS.reduce((acc, shot, i) => {
    const si = intents[i];
    return acc + (si && isShotIntentComplete(si, shot.speakers) ? 1 : 0);
  }, 0);

  const updateIntent = (idx: number, patch: Partial<ShotIntent>) => {
    setIntents((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  return (
    <div
      style={{
        height: 200,
        flexShrink: 0,
        background: "var(--color-surface-1)",
        borderTop: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 40,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        <span className="label-caps">Camera intent</span>
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 12,
            color: completedCount === SHOTS.length ? "var(--color-green)" : "var(--color-amber)",
          }}
        >
          {completedCount}/{SHOTS.length} shots
        </span>
      </div>

      <div style={{ flex: 1, overflowX: "auto", overflowY: "hidden", display: "flex", gap: 0, alignItems: "stretch" }}>
        {SHOTS.map((shot, i) => {
          const si = intents[i] ?? { intent: "Follow" as IntentType };
          const complete = isShotIntentComplete(si, shot.speakers);
          const hasIntent = !!si.intent;

          return (
            <div
              key={shot.idx}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              style={{
                minWidth: 240,
                maxWidth: 280,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                padding: "10px 14px",
                borderRight: "1px solid var(--color-border-subtle)",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <div style={{ width: 32, height: 18, borderRadius: 2, background: "var(--color-surface-3)", flexShrink: 0 }} />
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 12, color: "var(--color-text-primary)" }}>
                  Shot {shot.idx}
                </span>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "var(--color-text-muted)" }}>
                  {shot.timeStart.split(".")[0]} – {shot.timeEnd.split(".")[0]}
                </span>
              </div>

              <div style={{ display: "flex", gap: 4, flexShrink: 0, flexWrap: "wrap" }}>
                {INTENT_OPTIONS.map((opt) => {
                  const active = si.intent === opt;

                  return (
                    <button
                      key={opt}
                      onClick={() => updateIntent(i, { intent: opt })}
                      style={{
                        height: 26,
                        padding: "0 8px",
                        borderRadius: 4,
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontWeight: 500,
                        fontSize: 11,
                        background: active ? "var(--color-violet-muted)" : "var(--color-surface-2)",
                        color: active ? "var(--color-violet)" : "var(--color-text-muted)",
                        border: active ? "1px solid rgba(167,139,250,0.4)" : "1px solid var(--color-border)",
                        cursor: "pointer",
                        transition: "all 100ms",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div style={{ flex: 1, overflow: "hidden" }}>
                <IntentConfig intent={si} shot={shot} onChange={(patch) => updateIntent(i, patch)} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: complete ? "var(--color-green)" : hasIntent ? "var(--color-amber)" : "var(--color-surface-3)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Intent Config sub-component ── */
function IntentConfig({ intent, shot, onChange }: { intent: ShotIntent; shot: ShotData; onChange: (patch: Partial<ShotIntent>) => void }) {
  const speakers = shot.speakers;

  const SpeakerSelect = ({ value, onSelect, label }: { value?: number; onSelect: (v: number) => void; label: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
      <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 11, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onSelect(Number(e.target.value))}
        style={{
          flex: 1, height: 28, background: "var(--color-surface-2)", border: "1px solid var(--color-border)",
          borderRadius: 4, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 12,
          color: "var(--color-text-primary)", padding: "0 8px", cursor: "pointer", outline: "none",
        }}
      >
        <option value="" disabled>Select…</option>
        {speakers.map((s) => (
          <option key={s} value={s}>{SPEAKER_NAMES[s] ?? `Speaker_0${s}`}</option>
        ))}
      </select>
    </div>
  );

  switch (intent.intent) {
    case "Follow":
      return <SpeakerSelect label="Follow speaker" value={intent.follow} onSelect={(v) => onChange({ follow: v })} />;

    case "Reaction":
      return (
        <>
          <SpeakerSelect label="React on" value={intent.reactOn} onSelect={(v) => onChange({ reactOn: v })} />
          <SpeakerSelect label="Speaker talking" value={intent.reactFollow} onSelect={(v) => onChange({ reactFollow: v })} />
        </>
      );

    case "Split":
      return (
        <>
          <SpeakerSelect label="Left" value={intent.splitLeft} onSelect={(v) => onChange({ splitLeft: v })} />
          <SpeakerSelect label="Right" value={intent.splitRight} onSelect={(v) => onChange({ splitRight: v })} />
        </>
      );

    case "Wide":
      return (
        <div>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 11, color: "var(--color-text-secondary)" }}>Includes</span>
          {speakers.map((s) => {
            const checked = (intent.wideIncludes ?? []).includes(s);
            return (
              <label key={s} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const current = intent.wideIncludes ?? [];
                    onChange({ wideIncludes: checked ? current.filter((x) => x !== s) : [...current, s] });
                  }}
                  style={{ accentColor: "var(--color-violet)", width: 14, height: 14 }}
                />
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 12, color: "var(--color-text-primary)" }}>
                  {SPEAKER_NAMES[s] ?? `Speaker_0${s}`}
                </span>
              </label>
            );
          })}
        </div>
      );

    case "Manual":
      return (
        <div>
          <button
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 4,
              background: "transparent", border: "none", cursor: "pointer",
              fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 12, color: "var(--color-violet)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Crop size={12} />
            Edit crop position →
          </button>
          {intent.cropSet && (
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "var(--color-green)", marginTop: 4, display: "block" }}>Crop set ✓</span>
          )}
        </div>
      );

    default:
      return null;
  }
}


export default function RunGrounding() {
  const { id, clipId } = useParams();
  const [activeClip, setActiveClip] = useState(clipId ?? "001");

  /* ── Binding state ── */
  const [bindings, setBindings] = useState<Record<number, Binding[]>>(getInitialBindings);

  const handleAddBinding = useCallback((shotIdx: number, binding: Binding) => {
    setBindings((prev) => {
      const existing = prev[shotIdx] || [];
      // Replace if same tracklet+speaker already exists
      const filtered = existing.filter((b) => !(b.tracklet_id === binding.tracklet_id && b.speaker_id === binding.speaker_id));
      return { ...prev, [shotIdx]: [...filtered, binding] };
    });
  }, []);

  const handleRemoveBinding = useCallback((shotIdx: number, trackletId: string, speakerId: number) => {
    setBindings((prev) => {
      const existing = prev[shotIdx] || [];
      return { ...prev, [shotIdx]: existing.filter((b) => !(b.tracklet_id === trackletId && b.speaker_id === speakerId)) };
    });
  }, []);

  /* ── Derived grounding progress ── */
  const progress = computeGroundingProgress(bindings);
  const speakerLabel = `${progress.grounded}/${progress.total}`;
  const cameraLabel = "4/4"; // camera is static for now

  const clipStatus: QueueClip["status"] =
    progress.grounded === progress.total ? "complete" :
    progress.grounded > 0 ? "partial" : "not_started";

  const isComplete = clipStatus === "complete";

  const current = QUEUE.find((c) => c.id === activeClip) ?? QUEUE[0];

  return (
    <div className="flex flex-col" style={{ height: "100vh" }}>
      {/* ── Header bar ── */}
      <div style={{ height: 56, flexShrink: 0, background: "var(--color-surface-1)", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", padding: "0 20px", justifyContent: "space-between" }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            to={`/runs/${id ?? "demo"}/clips`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            ← Clip Candidates
          </Link>
          <span style={{ width: 1, height: 16, background: "var(--color-border)" }} />
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>Lex ep. 412 — Sam Altman</span>
          <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>›</span>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 14, color: "var(--color-text-secondary)" }}>Grounding</span>
        </div>

        {/* Center */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>Clip {current.id}</span>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 14, color: "var(--color-text-muted)" }}>·  {current.timeStart} → {current.timeEnd}  ·  {current.duration}</span>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {[
              { label: `Speakers ${speakerLabel}`, done: progress.grounded === progress.total },
              { label: `Camera ${cameraLabel}`, done: true },
            ].map((p) => (
              <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.done ? "var(--color-green)" : "var(--color-amber)" }} />
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-text-muted)" }}>{p.label}</span>
              </div>
            ))}
          </div>
          <button style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid var(--color-border)", background: "var(--color-surface-2)", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)", cursor: "pointer" }}>Save</button>
          <button
            disabled={!isComplete}
            style={{
              padding: "6px 14px", borderRadius: 6, border: "none",
              background: isComplete ? "var(--color-violet)" : "var(--color-surface-3)",
              fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 13,
              color: isComplete ? "#0A0909" : "var(--color-text-muted)",
              cursor: isComplete ? "pointer" : "not-allowed",
            }}
          >Done →</button>
        </div>
      </div>

      {/* ── Main work area ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left clip sidebar */}
        <div style={{ width: 220, flexShrink: 0, background: "var(--color-surface-1)", borderRight: "1px solid var(--color-border)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center" }}>
            <span className="label-caps">Grounding queue</span>
            <span style={{ marginLeft: 6, fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>8 clips</span>
          </div>
          {QUEUE.map((clip) => {
            const isActive = clip.id === activeClip;
            const isLocked = clip.status === "locked";
            const displayStatus: QueueClip["status"] = isActive ? clipStatus : clip.status;
            return (
              <div
                key={clip.id}
                onClick={() => !isLocked && setActiveClip(clip.id)}
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  cursor: isLocked ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: isActive ? "var(--color-surface-2)" : "transparent",
                  borderLeft: isActive ? "3px solid var(--color-violet)" : "3px solid transparent",
                  transition: "background 100ms",
                }}
                onMouseEnter={(e) => { if (!isActive && !isLocked) e.currentTarget.style.background = "var(--color-surface-2)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <StatusIcon status={displayStatus} />
                <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>{clip.label}</span>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>{clip.timeStart} → {clip.timeEnd}  ·  {clip.duration}</span>
                  {isActive && (
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 11, color: "var(--color-text-muted)" }}>
                      Speakers: {speakerLabel}  ·  Camera: {cameraLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center + right */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Center column */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ShotLaneEditor
              bindings={bindings}
              onAddBinding={handleAddBinding}
              onRemoveBinding={handleRemoveBinding}
            />
            <CameraIntentPanel />
          </div>

          {/* Right details placeholder */}
          <div style={{ width: 360, flexShrink: 0, background: "var(--color-surface-1)", borderLeft: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 14, color: "var(--color-text-muted)" }}>
              Details panel loads here
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
