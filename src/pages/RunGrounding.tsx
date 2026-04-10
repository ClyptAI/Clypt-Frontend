/*
 * TODO — Grounding page known issues (to fix later):
 *  1. Internal colored bars (speaker turn segments) do not scale proportionally
 *     with their outer lane height when dragging the divider.
 *  2. Clip 008 can still get cut off when dragging the divider up — MIN_VIDEO_H
 *     does not perfectly match the queue panel's rendered height on all viewports.
 *  3. Camera intent: only the header row scales with laneH. The content row
 *     (intent buttons + Follow/Reaction/Split/Wide selectors) does not resize
 *     proportionally — buttons and selects stay fixed-size.
 */
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Check, Lock, Play, Pause, TriangleAlert, Crop, X,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { TimeRuler } from "@/components/timeline/TimeRuler";
import { toast } from "sonner";
import { useClipList } from "@/hooks/api/useClips";
import { useGroundingState, useUpdateGrounding } from "@/hooks/api/useGrounding";
import { useClipStore } from "@/stores/clip-store";
import type {
  GroundingClipState, GroundingShotState, GroundingTracklet,
  GroundingIntent,
} from "@/types/clypt";

/* ═══════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════ */

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
  conflict?: { speaker0: number; speaker1: number; tracklet: string; time: string };
}

interface Binding {
  tracklet_id: string;
  speaker_id: number;
  start_ms: number;
  end_ms: number;
  method: "drag" | "word" | "range";
}

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

interface CropPosition { x_percent: number; y_percent: number; height_percent: number }

/* ═══════════════════════════════════════════════════════════
   Mock data — per-shot grounding detail (static; no API source)
   ═══════════════════════════════════════════════════════════ */

const SPEAKER_COLORS = ["#4A9EFF", "#FF7A5C", "#5CCD8F"];
const SPEAKER_NAMES: Record<number, string> = { 0: "Speaker_00", 1: "Speaker_01", 2: "Speaker_02" };
const DEMO_VIDEO_URL = "/videos/joeroganflagrant.mp4";

const SHOTS: ShotData[] = [
  {
    idx: 1, timeStart: "0:42.0", timeEnd: "0:51.3", duration: "9.3s", startMs: 42000, endMs: 51300,
    tracklets: [{ id: "tracklet_001", letter: "A", durationPct: 100 }, { id: "tracklet_002", letter: "B", durationPct: 100 }],
    turns: [{ speakerIdx: 0, startPct: 0, widthPct: 100 }, { speakerIdx: 1, startPct: 33, widthPct: 67 }],
    speakers: [0, 1],
    transcript: ["I", "think", "we're", "at", "an", "inflection", "point", "with", "AI", "that", "most", "people", "don't", "fully", "appreciate", "yet"],
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

function getInitialBindings(): Record<number, Binding[]> {
  return {
    1: [{ tracklet_id: "tracklet_001", speaker_id: 0, start_ms: 42000, end_ms: 51300, method: "drag" }],
    2: [],
    3: [],
    4: [{ tracklet_id: "tracklet_001", speaker_id: 0, start_ms: 71800, end_ms: 78100, method: "drag" }],
  };
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

/* Local <-> wire converters for camera intent. The local UI uses camelCase
   field names (`reactOn`, `splitLeft`, …); the persisted GroundingIntent uses
   snake_case (`react_on`, `split_left`, …) so it can travel through the
   grounding API unchanged. Bindings and CropPositions already share the wire
   shape, so they don't need converters. */
function intentToWire(local: ShotIntent): GroundingIntent {
  const wire: GroundingIntent = { intent: local.intent };
  if (local.follow !== undefined) wire.follow = local.follow;
  if (local.reactOn !== undefined) wire.react_on = local.reactOn;
  if (local.reactFollow !== undefined) wire.react_follow = local.reactFollow;
  if (local.splitLeft !== undefined) wire.split_left = local.splitLeft;
  if (local.splitRight !== undefined) wire.split_right = local.splitRight;
  if (local.wideIncludes !== undefined) wire.wide_includes = local.wideIncludes;
  if (local.cropSet !== undefined) wire.crop_set = local.cropSet;
  return wire;
}

function intentFromWire(wire: GroundingIntent): ShotIntent {
  const local: ShotIntent = { intent: wire.intent };
  if (wire.follow !== undefined) local.follow = wire.follow;
  if (wire.react_on !== undefined) local.reactOn = wire.react_on;
  if (wire.react_follow !== undefined) local.reactFollow = wire.react_follow;
  if (wire.split_left !== undefined) local.splitLeft = wire.split_left;
  if (wire.split_right !== undefined) local.splitRight = wire.split_right;
  if (wire.wide_includes !== undefined) local.wideIncludes = wire.wide_includes;
  if (wire.crop_set !== undefined) local.cropSet = wire.crop_set;
  return local;
}

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */

function msToTimestamp(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(1);
  return `${minutes}:${seconds.padStart(4, "0")}`;
}

/** Short m:ss formatter used by the queue panel timestamps. */
function fmtShort(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
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

function isShotIntentComplete(si: ShotIntent): boolean {
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

/* ═══════════════════════════════════════════════════════════
   StatusIcon (queue)
   ═══════════════════════════════════════════════════════════ */

function StatusIcon({ status }: { status: QueueClip["status"] }) {
  const base: React.CSSProperties = { width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
  switch (status) {
    case "complete":
      return <span style={{ ...base, background: "var(--color-green-muted)", border: "1px solid var(--color-green)" }}><Check size={10} color="var(--color-green)" /></span>;
    case "partial":
      return <span style={{ ...base, border: "2px solid var(--color-amber)", background: "var(--color-amber-muted)" }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-amber)" }} /></span>;
    case "locked":
      return <span style={{ ...base, border: "1px solid var(--color-border)", opacity: 0.3 }}><Lock size={9} color="var(--color-text-muted)" /></span>;
    default:
      return <span style={{ ...base, border: "1px solid var(--color-border)" }} />;
  }
}

/* ═══════════════════════════════════════════════════════════
   BoundingBoxOverlay — draws tracklet boxes on video
   ═══════════════════════════════════════════════════════════

   The boxes are positioned in normalized 0..1 coordinates relative to the
   overlay's bounding rect (which tracks the video container, not the
   <video> element itself — the overlay fills the letterboxed black area).
   When `editMode` is on the user can drag/resize/delete boxes and add new
   tracklets via `onAddBox`. Original tracklet positions fall back to a
   small set of defaults if no rect has been set yet, so existing shots
   render the same way they did before this editor landed. */

type BoxRect = { x: number; y: number; w: number; h: number };
type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const DEFAULT_BOX_POSITIONS: BoxRect[] = [
  { x: 0.18, y: 0.22, w: 0.28, h: 0.56 },
  { x: 0.54, y: 0.20, w: 0.28, h: 0.58 },
  { x: 0.36, y: 0.25, w: 0.26, h: 0.50 },
];
const DEFAULT_NEW_BOX: BoxRect = { x: 0.375, y: 0.25, w: 0.25, h: 0.5 };
const MIN_BOX_SIZE = 0.04;

function clampRect(r: BoxRect): BoxRect {
  let { x, y, w, h } = r;
  w = Math.max(MIN_BOX_SIZE, Math.min(1, w));
  h = Math.max(MIN_BOX_SIZE, Math.min(1, h));
  x = Math.max(0, Math.min(1 - w, x));
  y = Math.max(0, Math.min(1 - h, y));
  return { x, y, w, h };
}

interface EditableBoxProps {
  rect: BoxRect;
  color: string;
  letter: string;
  speakerName: string | null;
  isSelected: boolean;
  editMode: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  onChange: (next: BoxRect) => void;
  onSelect: () => void;
  onDelete: () => void;
}

function EditableBox({
  rect, color, letter, speakerName, isSelected, editMode, containerRef,
  onChange, onSelect, onDelete,
}: EditableBoxProps) {
  // Drag state lives in a ref so the move handlers don't have to re-bind
  // every render. Mirrors the timeline divider's pattern.
  const dragRef = useRef<{
    mode: "move" | ResizeHandle;
    startX: number;
    startY: number;
    startRect: BoxRect;
    cw: number;
    ch: number;
  } | null>(null);

  const beginDrag = (mode: "move" | ResizeHandle, e: React.PointerEvent<HTMLDivElement>) => {
    if (!editMode) return;
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    if (cRect.width === 0 || cRect.height === 0) return;
    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startRect: rect,
      cw: cRect.width,
      ch: cRect.height,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    onSelect();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = (e.clientX - drag.startX) / drag.cw;
    const dy = (e.clientY - drag.startY) / drag.ch;
    const next: BoxRect = { ...drag.startRect };
    if (drag.mode === "move") {
      next.x = drag.startRect.x + dx;
      next.y = drag.startRect.y + dy;
    } else {
      const m = drag.mode;
      if (m.includes("n")) {
        next.y = drag.startRect.y + dy;
        next.h = drag.startRect.h - dy;
      }
      if (m.includes("s")) {
        next.h = drag.startRect.h + dy;
      }
      if (m.includes("w")) {
        next.x = drag.startRect.x + dx;
        next.w = drag.startRect.w - dx;
      }
      if (m.includes("e")) {
        next.w = drag.startRect.w + dx;
      }
    }
    onChange(clampRect(next));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      dragRef.current = null;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    }
  };

  // Each handle (and the box body) gets its own copy of the drag handlers
  // so pointer capture works on the element the user actually clicked.
  // They all share the same dragRef, so they coordinate through it.
  const dragProps = (mode: "move" | ResizeHandle) => ({
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => beginDrag(mode, e),
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
  });

  const handleStyle: React.CSSProperties = {
    position: "absolute",
    background: color,
    border: "1px solid rgba(0,0,0,0.6)",
    width: 8,
    height: 8,
    borderRadius: 2,
    touchAction: "none",
  };

  return (
    <div
      {...dragProps("move")}
      style={{
        position: "absolute",
        left: `${rect.x * 100}%`,
        top: `${rect.y * 100}%`,
        width: `${rect.w * 100}%`,
        height: `${rect.h * 100}%`,
        border: `2px solid ${color}`,
        borderRadius: 3,
        boxShadow: isSelected ? `0 0 0 1px ${color}, 0 0 12px rgba(167,139,250,0.4)` : "none",
        cursor: editMode ? "grab" : "default",
        pointerEvents: editMode ? "auto" : "none",
        touchAction: "none",
        transition: "border-color 150ms",
      }}
    >
      {/* Letter label */}
      <div style={{
        position: "absolute", top: -1, left: -1,
        background: color, color: "#0A0909",
        fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700,
        padding: "1px 5px", borderRadius: "0 0 3px 0", lineHeight: "14px",
        pointerEvents: "none",
      }}>
        {letter}
      </div>

      {/* Speaker name badge (if bound) */}
      {speakerName && (
        <div style={{
          position: "absolute", bottom: -1, left: "50%", transform: "translateX(-50%)",
          background: "rgba(10,9,9,0.85)", border: `1px solid ${color}`,
          borderRadius: 3, padding: "1px 6px",
          fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 9, fontWeight: 600,
          color, whiteSpace: "nowrap",
          pointerEvents: "none",
        }}>
          {speakerName}
        </div>
      )}

      {/* Delete button — only when selected and in edit mode */}
      {editMode && isSelected && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute", top: -10, right: -10,
            width: 18, height: 18, borderRadius: "50%",
            background: "var(--color-rose)", border: "1px solid #0A0909",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", padding: 0, color: "#0A0909", zIndex: 4,
          }}
          title="Delete box"
        >
          <X size={11} />
        </button>
      )}

      {/* 8 resize handles — only when selected and in edit mode */}
      {editMode && isSelected && (
        <>
          <div {...dragProps("nw")} style={{ ...handleStyle, top: -5, left: -5,  cursor: "nwse-resize" }} />
          <div {...dragProps("ne")} style={{ ...handleStyle, top: -5, right: -5, cursor: "nesw-resize" }} />
          <div {...dragProps("sw")} style={{ ...handleStyle, bottom: -5, left: -5,  cursor: "nesw-resize" }} />
          <div {...dragProps("se")} style={{ ...handleStyle, bottom: -5, right: -5, cursor: "nwse-resize" }} />
          <div {...dragProps("n")}  style={{ ...handleStyle, top: -5, left: "50%", marginLeft: -4, cursor: "ns-resize" }} />
          <div {...dragProps("s")}  style={{ ...handleStyle, bottom: -5, left: "50%", marginLeft: -4, cursor: "ns-resize" }} />
          <div {...dragProps("w")}  style={{ ...handleStyle, top: "50%", left: -5,  marginTop: -4, cursor: "ew-resize" }} />
          <div {...dragProps("e")}  style={{ ...handleStyle, top: "50%", right: -5, marginTop: -4, cursor: "ew-resize" }} />
        </>
      )}
    </div>
  );
}

interface BoundingBoxOverlayProps {
  shot: ShotData;
  bindings: Binding[];
  speakerNames: Record<number, string>;
  /** Extra tracklets the user added on top of the original tracker output. */
  userTracklets: Tracklet[];
  /** Original tracklet IDs the user removed via the editor. */
  hiddenIds: string[];
  /** trackletId -> rect, both originals and user-added. */
  rects: Record<string, BoxRect>;
  editMode: boolean;
  selectedTrackletId: string | null;
  onUpdateRect: (trackletId: string, rect: BoxRect) => void;
  onSelect: (trackletId: string | null) => void;
  onDelete: (trackletId: string) => void;
}

function BoundingBoxOverlay({
  shot, bindings, speakerNames, userTracklets, hiddenIds, rects,
  editMode, selectedTrackletId, onUpdateRect, onSelect, onDelete,
}: BoundingBoxOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Effective tracklet list = originals (minus hidden) ∪ user-added.
  const effective = useMemo(() => {
    const originals = shot.tracklets
      .filter((t) => !hiddenIds.includes(t.id))
      .map((t, i) => ({ tracklet: t, originalIdx: i }));
    const extras = userTracklets.map((t) => ({ tracklet: t, originalIdx: -1 }));
    return [...originals, ...extras];
  }, [shot.tracklets, userTracklets, hiddenIds]);

  return (
    <div
      ref={overlayRef}
      onPointerDown={(e) => {
        // Click on the empty overlay background = deselect (only in edit mode)
        if (editMode && e.target === e.currentTarget) onSelect(null);
      }}
      style={{
        position: "absolute", inset: 0,
        pointerEvents: editMode ? "auto" : "none",
        zIndex: 2,
      }}
    >
      {effective.map(({ tracklet, originalIdx }) => {
        const bound = bindings.find((b) => b.tracklet_id === tracklet.id);
        const color = bound ? SPEAKER_COLORS[bound.speaker_id] : "rgba(255,255,255,0.6)";
        const rect =
          rects[tracklet.id] ??
          (originalIdx >= 0
            ? DEFAULT_BOX_POSITIONS[originalIdx % DEFAULT_BOX_POSITIONS.length]
            : DEFAULT_NEW_BOX);
        const speakerName = bound
          ? speakerNames[bound.speaker_id] ?? `Spk_0${bound.speaker_id}`
          : null;
        return (
          <EditableBox
            key={tracklet.id}
            rect={rect}
            color={color}
            letter={tracklet.letter}
            speakerName={speakerName}
            isSelected={selectedTrackletId === tracklet.id}
            editMode={editMode}
            containerRef={overlayRef}
            onChange={(next) => onUpdateRect(tracklet.id, next)}
            onSelect={() => onSelect(tracklet.id)}
            onDelete={() => onDelete(tracklet.id)}
          />
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ManualCropModal (preserved from original)
   ═══════════════════════════════════════════════════════════ */

function ManualCropModal({
  shotIdx, initial, onSave, onClose,
}: {
  shotIdx: number; initial?: CropPosition;
  onSave: (shotIdx: number, crop: CropPosition) => void; onClose: () => void;
}) {
  const ASPECT = 9 / 16;
  const FRAME_W = 520;
  const FRAME_H = Math.round(FRAME_W / (16 / 9));

  const defaultH = FRAME_H * 0.8;
  const defaultW = defaultH * ASPECT;
  const defaultX = (FRAME_W - defaultW) / 2;
  const defaultY = (FRAME_H - defaultH) / 2;

  const initFromSaved = (saved?: CropPosition) => {
    if (!saved) return { x: defaultX, y: defaultY, w: defaultW, h: defaultH };
    const h = saved.height_percent / 100 * FRAME_H;
    const w = h * ASPECT;
    const x = saved.x_percent / 100 * FRAME_W;
    const y = saved.y_percent / 100 * FRAME_H;
    return { x, y, w, h };
  };

  const [box, setBox] = useState(initFromSaved(initial));
  const [dragging, setDragging] = useState<null | "move" | "tl" | "tr" | "bl" | "br">(null);
  const dragStart = useRef({ mx: 0, my: 0, bx: 0, by: 0, bw: 0, bh: 0 });

  const clampBox = useCallback((b: { x: number; y: number; w: number; h: number }) => {
    let { x, y, w, h } = b;
    w = Math.max(36, Math.min(w, FRAME_W));
    h = w / ASPECT;
    if (h > FRAME_H) { h = FRAME_H; w = h * ASPECT; }
    x = Math.max(0, Math.min(x, FRAME_W - w));
    y = Math.max(0, Math.min(y, FRAME_H - h));
    return { x, y, w, h };
  }, []);

  const onMouseDown = (e: React.MouseEvent, mode: "move" | "tl" | "tr" | "bl" | "br") => {
    e.preventDefault(); e.stopPropagation();
    setDragging(mode);
    dragStart.current = { mx: e.clientX, my: e.clientY, bx: box.x, by: box.y, bw: box.w, bh: box.h };
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      const { bx, by, bw, bh } = dragStart.current;
      if (dragging === "move") {
        setBox(clampBox({ x: bx + dx, y: by + dy, w: bw, h: bh }));
      } else {
        let newH = bh, newX = bx, newY = by;
        if (dragging === "br") newH = bh + dy;
        else if (dragging === "bl") { newH = bh + dy; newX = bx + dx; }
        else if (dragging === "tr") { newH = bh - dy; newY = by + dy; }
        else if (dragging === "tl") { newH = bh - dy; newX = bx + dx; newY = by + dy; }
        setBox(clampBox({ x: newX, y: newY, w: Math.max(36, newH * ASPECT), h: newH }));
      }
    };
    const onUp = () => setDragging(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging, clampBox]);

  const handleSave = () => {
    onSave(shotIdx, { x_percent: (box.x / FRAME_W) * 100, y_percent: (box.y / FRAME_H) * 100, height_percent: (box.h / FRAME_H) * 100 });
    toast.success(`Crop position saved for Shot ${shotIdx}.`);
  };

  const previewW = 108, previewH = 192;
  const scaleX = previewW / box.w, scaleY = previewH / box.h;
  const iL = box.x, iT = box.y, iR = box.x + box.w, iB = box.y + box.h;
  const clipPath = `polygon(0 0,${FRAME_W}px 0,${FRAME_W}px ${FRAME_H}px,0 ${FRAME_H}px,0 0,${iL}px ${iT}px,${iL}px ${iB}px,${iR}px ${iB}px,${iR}px ${iT}px,${iL}px ${iT}px)`;
  const corner = (cursor: string): React.CSSProperties => ({ position: "absolute", width: 10, height: 10, background: "var(--color-violet)", borderRadius: 1, cursor, zIndex: 3 });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(10,9,9,0.80)" }}>
      <div style={{ width: 720, maxHeight: "90vh", background: "var(--color-surface-1)", border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: "1px solid var(--color-border-subtle)" }}>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--color-text-primary)" }}>Manual crop — Shot {shotIdx}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}><X size={18} style={{ color: "var(--color-text-muted)" }} /></button>
        </div>
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <div style={{ flex: 1, position: "relative", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: FRAME_W, height: FRAME_H, position: "relative", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Shot {shotIdx} frame</span>
              </div>
              <div style={{ position: "absolute", inset: 0, background: "rgba(10,9,9,0.55)", pointerEvents: "none", clipPath, zIndex: 1 }} />
              <div onMouseDown={(e) => onMouseDown(e, "move")} style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, border: "2px solid var(--color-violet)", borderRadius: 2, cursor: dragging === "move" ? "grabbing" : "grab", zIndex: 2, boxSizing: "border-box" }}>
                {dragging && (
                  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                    <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
                    <line x1="66.66%" y1="0" x2="66.66%" y2="100%" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
                    <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
                    <line x1="0" y1="66.66%" x2="100%" y2="66.66%" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
                  </svg>
                )}
                <div onMouseDown={(e) => onMouseDown(e, "tl")} style={{ ...corner("nwse-resize"), top: -5, left: -5 }} />
                <div onMouseDown={(e) => onMouseDown(e, "tr")} style={{ ...corner("nesw-resize"), top: -5, right: -5 }} />
                <div onMouseDown={(e) => onMouseDown(e, "bl")} style={{ ...corner("nesw-resize"), bottom: -5, left: -5 }} />
                <div onMouseDown={(e) => onMouseDown(e, "br")} style={{ ...corner("nwse-resize"), bottom: -5, right: -5 }} />
              </div>
            </div>
          </div>
          <div style={{ width: 140, flexShrink: 0, background: "var(--color-surface-2)", borderLeft: "1px solid var(--color-border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 16 }}>
            <span className="label-caps" style={{ textAlign: "center" }}>Preview</span>
            <div style={{ width: previewW, height: previewH, borderRadius: 4, overflow: "hidden", background: "#000", border: "1px solid var(--color-border)", position: "relative" }}>
              <div style={{ width: FRAME_W, height: FRAME_H, position: "absolute", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", transformOrigin: "0 0", transform: `scale(${scaleX}, ${scaleY}) translate(${-box.x}px, ${-box.y}px)` }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Shot {shotIdx}</span>
                </div>
              </div>
            </div>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "var(--color-text-muted)" }}>1080 × 1920</span>
          </div>
        </div>
        <div style={{ height: 56, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderTop: "1px solid var(--color-border-subtle)" }}>
          <button onClick={() => setBox({ x: defaultX, y: defaultY, w: defaultW, h: defaultH })} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "var(--color-text-secondary)" }}>Reset to center</button>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid var(--color-border)", background: "var(--color-surface-2)", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)", cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSave} style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: "var(--color-violet)", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 13, color: "#0A0909", cursor: "pointer" }}>Save crop</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   IntentConfig — camera intent controls for a single shot
   ═══════════════════════════════════════════════════════════ */

function IntentConfig({ intent, shot, onChange, onOpenCrop }: {
  intent: ShotIntent; shot: ShotData;
  onChange: (patch: Partial<ShotIntent>) => void; onOpenCrop?: () => void;
}) {
  const speakers = shot.speakers;
  const Sel = ({ value, onSelect, label }: { value?: number; onSelect: (v: number) => void; label: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
      <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 11, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{label}</span>
      <select value={value ?? ""} onChange={(e) => onSelect(Number(e.target.value))} style={{ flex: 1, height: 26, background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: 4, fontFamily: "'Bricolage Grotesque'", fontWeight: 500, fontSize: 11, color: "var(--color-text-primary)", padding: "0 6px", cursor: "pointer", outline: "none" }}>
        <option value="" disabled>Select…</option>
        {speakers.map((s) => <option key={s} value={s}>{SPEAKER_NAMES[s] ?? `Spk_0${s}`}</option>)}
      </select>
    </div>
  );

  switch (intent.intent) {
    case "Follow": return <Sel label="Follow" value={intent.follow} onSelect={(v) => onChange({ follow: v })} />;
    case "Reaction": return (
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}><Sel label="React on" value={intent.reactOn} onSelect={(v) => onChange({ reactOn: v })} /></div>
        <div style={{ flex: 1 }}><Sel label="Talking" value={intent.reactFollow} onSelect={(v) => onChange({ reactFollow: v })} /></div>
      </div>
    );
    case "Split": return (
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}><Sel label="Top" value={intent.splitLeft} onSelect={(v) => onChange({ splitLeft: v })} /></div>
        <div style={{ flex: 1 }}><Sel label="Bottom" value={intent.splitRight} onSelect={(v) => onChange({ splitRight: v })} /></div>
      </div>
    );
    case "Wide": return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {speakers.map((s) => {
          const checked = (intent.wideIncludes ?? []).includes(s);
          return (
            <label key={s} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
              <input type="checkbox" checked={checked} onChange={() => onChange({ wideIncludes: checked ? (intent.wideIncludes ?? []).filter((x) => x !== s) : [...(intent.wideIncludes ?? []), s] })} style={{ accentColor: "var(--color-violet)", width: 13, height: 13 }} />
              <span style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 500, fontSize: 11, color: "var(--color-text-primary)" }}>{SPEAKER_NAMES[s] ?? `Spk_0${s}`}</span>
            </label>
          );
        })}
      </div>
    );
    case "Manual": return (
      <button onClick={onOpenCrop} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 7px", borderRadius: 4, background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Bricolage Grotesque'", fontWeight: 500, fontSize: 11, color: "var(--color-violet)" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
        <Crop size={11} /> Edit crop →
        {intent.cropSet && <span style={{ color: "var(--color-green)", marginLeft: 4 }}>✓</span>}
      </button>
    );
    default: return null;
  }
}

/* ═══════════════════════════════════════════════════════════
   ActiveShotWorkspace — tracklets + speakers + transcript
   for the currently selected shot
   ═══════════════════════════════════════════════════════════ */

function ActiveShotWorkspace({
  shot, shotBindings, onAddBinding, onRemoveBinding, speakerNames, laneH,
}: {
  shot: ShotData; shotBindings: Binding[];
  onAddBinding: (shotIdx: number, binding: Binding) => void;
  onRemoveBinding: (shotIdx: number, trackletId: string, speakerId: number) => void;
  speakerNames: Record<number, string>;
  laneH: number;
}) {
  const [dragOverTracklet, setDragOverTracklet] = useState<string | null>(null);
  const [wordPopover, setWordPopover] = useState<{ wordIdx: number; speakerIdx: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; trackletId: string; speakerId: number } | null>(null);

  const trackletLaneRef = useRef<HTMLDivElement>(null);
  const [rangeSelect, setRangeSelect] = useState<{ startX: number; currentX: number } | null>(null);
  const [rangePopover, setRangePopover] = useState<{ x: number; startPct: number; endPct: number } | null>(null);
  const isDraggingRange = useRef(false);

  const trackletH = laneH;
  const speakerH = laneH;
  const transcriptH = laneH;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-popover]")) {
        setWordPopover(null); setRangePopover(null); setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Drag speaker → tracklet */
  const handleSpeakerDragStart = (e: React.DragEvent, sIdx: number) => {
    e.dataTransfer.setData("speaker_idx", String(sIdx));
    e.dataTransfer.effectAllowed = "link";
    const ghost = document.createElement("div");
    ghost.textContent = speakerNames[sIdx] ?? `Speaker_0${sIdx}`;
    ghost.style.cssText = `padding:4px 10px;border-radius:12px;font-family:'Bricolage Grotesque',sans-serif;font-size:12px;font-weight:600;color:#0A0909;background:${SPEAKER_COLORS[sIdx]};position:absolute;top:-1000px`;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 40, 14);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleTrackletDrop = (e: React.DragEvent, trackletId: string) => {
    e.preventDefault(); setDragOverTracklet(null);
    const sIdx = parseInt(e.dataTransfer.getData("speaker_idx"), 10);
    if (isNaN(sIdx)) return;
    onAddBinding(shot.idx, { tracklet_id: trackletId, speaker_id: sIdx, start_ms: shot.startMs, end_ms: shot.endMs, method: "drag" });
    toast.success(`${speakerNames[sIdx] ?? `Speaker_0${sIdx}`} → ${trackletId}`);
  };

  /* Word click */
  const handleWordClick = (wordIdx: number) => {
    const sIdx = wordIdx < shot.transcript.length / 2 ? (shot.speakers[0] ?? 0) : (shot.speakers[1] ?? shot.speakers[0] ?? 0);
    setWordPopover({ wordIdx, speakerIdx: sIdx }); setRangePopover(null); setContextMenu(null);
  };

  const handleWordAssign = (trackletId: string, sIdx: number) => {
    const frac = 1 / shot.transcript.length;
    const dur = shot.endMs - shot.startMs;
    const startMs = shot.startMs + Math.floor(frac * (wordPopover?.wordIdx ?? 0) * dur);
    onAddBinding(shot.idx, { tracklet_id: trackletId, speaker_id: sIdx, start_ms: startMs, end_ms: startMs + Math.floor(frac * dur), method: "word" });
    setWordPopover(null); toast.success(`${speakerNames[sIdx] ?? `Speaker_0${sIdx}`} → ${trackletId}`);
  };

  /* Range select */
  const handleRangeDown = (e: React.MouseEvent) => {
    if (!trackletLaneRef.current) return;
    const rect = trackletLaneRef.current.getBoundingClientRect();
    isDraggingRange.current = true;
    setRangeSelect({ startX: e.clientX - rect.left, currentX: e.clientX - rect.left });
    setRangePopover(null); setWordPopover(null); setContextMenu(null);
  };
  const handleRangeMove = (e: React.MouseEvent) => {
    if (!isDraggingRange.current || !rangeSelect || !trackletLaneRef.current) return;
    const rect = trackletLaneRef.current.getBoundingClientRect();
    setRangeSelect({ ...rangeSelect, currentX: Math.max(0, Math.min(e.clientX - rect.left, rect.width)) });
  };
  const handleRangeUp = () => {
    if (!isDraggingRange.current || !rangeSelect || !trackletLaneRef.current) return;
    isDraggingRange.current = false;
    const rect = trackletLaneRef.current.getBoundingClientRect();
    const minX = Math.min(rangeSelect.startX, rangeSelect.currentX);
    const maxX = Math.max(rangeSelect.startX, rangeSelect.currentX);
    if (maxX - minX < 10) { setRangeSelect(null); return; }
    setRangePopover({ x: maxX, startPct: (minX / rect.width) * 100, endPct: (maxX / rect.width) * 100 });
    setRangeSelect(null);
  };
  const handleRangeAssign = (sIdx: number) => {
    if (!rangePopover) return;
    const dur = shot.endMs - shot.startMs;
    onAddBinding(shot.idx, { tracklet_id: shot.tracklets[0]?.id ?? "tracklet_001", speaker_id: sIdx, start_ms: shot.startMs + Math.floor((rangePopover.startPct / 100) * dur), end_ms: shot.startMs + Math.floor((rangePopover.endPct / 100) * dur), method: "range" });
    setRangePopover(null); toast.success(`${speakerNames[sIdx] ?? `Speaker_0${sIdx}`} assigned`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Tracklet lane */}
      <div style={{ height: trackletH, display: "flex", alignItems: "center", padding: "0 12px", background: "var(--color-bg)", borderBottom: "1px solid var(--color-border-subtle)", position: "relative" }}>
        <span className="label-caps" style={{ width: 72, flexShrink: 0, fontSize: 9 }}>TRACKLETS</span>
        <div ref={trackletLaneRef} style={{ flex: 1, display: "flex", gap: 2, alignItems: "center", height: Math.max(20, trackletH - 12), position: "relative", cursor: "crosshair" }}
          onMouseDown={handleRangeDown} onMouseMove={handleRangeMove} onMouseUp={handleRangeUp}
          onMouseLeave={() => { if (isDraggingRange.current) { isDraggingRange.current = false; setRangeSelect(null); } }}
        >
          {shot.tracklets.map((t) => {
            const bound = shotBindings.find((b) => b.tracklet_id === t.id);
            const sColor = bound ? SPEAKER_COLORS[bound.speaker_id] : undefined;
            const isDT = dragOverTracklet === t.id;
            return (
              <div key={t.id}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "link"; setDragOverTracklet(t.id); }}
                onDragLeave={() => setDragOverTracklet(null)}
                onDrop={(e) => { e.stopPropagation(); handleTrackletDrop(e, t.id); }}
                onContextMenu={(e) => { e.preventDefault(); if (bound) setContextMenu({ x: e.clientX, y: e.clientY, trackletId: t.id, speakerId: bound.speaker_id }); }}
                style={{
                  flex: t.durationPct, minWidth: 54, display: "flex", alignItems: "center", gap: 5,
                  background: isDT ? "var(--color-violet-muted)" : "var(--color-surface-2)",
                  border: isDT ? "2px dashed var(--color-violet)" : "1px solid var(--color-border)",
                  borderLeft: sColor ? `3px solid ${sColor}` : isDT ? "2px dashed var(--color-violet)" : "1px solid var(--color-border)",
                  borderRadius: 4, padding: "3px 7px", cursor: "grab", userSelect: "none",
                  transition: "border 100ms, background 100ms", position: "relative", zIndex: 2,
                }}
              >
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: sColor ?? "var(--color-surface-3)", border: sColor ? `2px solid ${sColor}` : "none", flexShrink: 0 }} />
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-primary)" }}>{t.letter}</span>
                {bound && <span style={{ fontFamily: "'Geist Mono'", fontSize: 9, color: "var(--color-text-muted)" }}>{speakerNames[bound.speaker_id]?.split(" ")[0] ?? `Spk_0${bound.speaker_id}`}</span>}
              </div>
            );
          })}
          {rangeSelect && (() => {
            const minX = Math.min(rangeSelect.startX, rangeSelect.currentX);
            const maxX = Math.max(rangeSelect.startX, rangeSelect.currentX);
            return <div style={{ position: "absolute", left: minX, width: maxX - minX, top: 0, height: "100%", background: "rgba(139,92,246,0.15)", border: "1px solid var(--color-violet)", borderRadius: 2, pointerEvents: "none", zIndex: 3 }} />;
          })()}
        </div>
        {rangePopover && (
          <div data-popover style={{ position: "absolute", top: 40, left: 72 + rangePopover.x - 60, zIndex: 30, background: "var(--color-surface-1)", border: "1px solid var(--color-border)", borderRadius: 8, padding: 10, minWidth: 180, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
            <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 600, fontSize: 12, color: "var(--color-text-primary)", marginBottom: 3 }}>Assign range to speaker</div>
            <div style={{ fontFamily: "'Geist Mono'", fontSize: 11, color: "var(--color-text-muted)", marginBottom: 8 }}>
              {msToTimestamp(shot.startMs + (rangePopover.startPct / 100) * (shot.endMs - shot.startMs))} → {msToTimestamp(shot.startMs + (rangePopover.endPct / 100) * (shot.endMs - shot.startMs))}
            </div>
            {shot.speakers.map((sIdx) => (
              <button key={sIdx} onClick={() => handleRangeAssign(sIdx)} style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "5px 8px", border: "1px solid var(--color-border)", borderRadius: 5, background: "transparent", cursor: "pointer", marginBottom: 3, fontFamily: "'Bricolage Grotesque'", fontWeight: 500, fontSize: 11, color: "var(--color-text-primary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-3)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: SPEAKER_COLORS[sIdx] }} />{speakerNames[sIdx] ?? `Speaker_0${sIdx}`}
              </button>
            ))}
            <button onClick={() => setRangePopover(null)} style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 11, color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer", marginTop: 2 }}>Cancel</button>
          </div>
        )}
      </div>

      {/* Speaker lanes */}
      {shot.speakers.map((sIdx) => {
        const turn = shot.turns.find((t) => t.speakerIdx === sIdx);
        const color = SPEAKER_COLORS[sIdx];
        return (
          <div key={sIdx}>
            <div style={{ height: speakerH, display: "flex", alignItems: "center", padding: "0 12px", background: "var(--color-bg)", borderBottom: "1px solid var(--color-border-subtle)" }}>
              <div draggable onDragStart={(e) => handleSpeakerDragStart(e, sIdx)} style={{ width: 72, flexShrink: 0, display: "flex", alignItems: "center", gap: 5, cursor: "grab" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                <span style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 500, fontSize: 11, color: "var(--color-text-secondary)" }}>{speakerNames[sIdx]?.split("—")[0]?.trim() ?? `Spk_0${sIdx}`}</span>
              </div>
              <div style={{ flex: 1, position: "relative", height: 18 }}>
                {turn && <div style={{ position: "absolute", left: `${turn.startPct}%`, width: `${turn.widthPct}%`, height: "100%", background: `${color}66`, borderRadius: 2 }} />}
              </div>
            </div>
          </div>
        );
      })}

      {/* Conflict */}
      {shot.conflict && (
        <div style={{ padding: "4px 12px", display: "flex", alignItems: "center", gap: 6, background: "var(--color-rose-muted)", borderLeft: "3px solid var(--color-rose)" }}>
          <TriangleAlert size={12} color="var(--color-rose)" />
          <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 12, color: "var(--color-rose)" }}>
            Conflict: Speaker_0{shot.conflict.speaker0} & Speaker_0{shot.conflict.speaker1} both on {shot.conflict.tracklet} at {shot.conflict.time}
          </span>
        </div>
      )}

      {/* Transcript lane */}
      <div style={{ height: transcriptH, padding: "6px 12px 6px 84px", background: "var(--color-surface-1)", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", flexWrap: "wrap", gap: 2, alignContent: "flex-start", position: "relative", overflow: "hidden" }}>
        {shot.transcript.map((word, i) => {
          const isSelected = wordPopover?.wordIdx === i;
          const sIdx = i < shot.transcript.length / 2 ? (shot.speakers[0] ?? 0) : (shot.speakers[1] ?? shot.speakers[0] ?? 0);
          const hasBoundWord = shotBindings.some((b) => b.method === "word" && b.speaker_id === sIdx);
          return (
            <span key={i} onClick={(e) => { e.stopPropagation(); handleWordClick(i); }}
              style={{
                padding: "1px 3px", borderRadius: 2, fontFamily: "'Geist Mono', monospace", fontSize: 11,
                color: isSelected ? "var(--color-text-primary)" : "var(--color-text-secondary)", cursor: "pointer", position: "relative",
                background: isSelected ? "var(--color-violet-muted)" : hasBoundWord ? `${SPEAKER_COLORS[sIdx]}22` : "transparent",
                border: isSelected ? "1px solid var(--color-violet)" : "1px solid transparent",
              }}
              onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.background = "var(--color-surface-3)"; e.currentTarget.style.color = "var(--color-text-primary)"; } }}
              onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.background = hasBoundWord ? `${SPEAKER_COLORS[sIdx]}22` : "transparent"; e.currentTarget.style.color = "var(--color-text-secondary)"; } }}
            >
              {word}
              {isSelected && wordPopover && (
                <div data-popover onClick={(e) => e.stopPropagation()} style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: 4, zIndex: 30, background: "var(--color-surface-1)", border: "1px solid var(--color-border)", borderRadius: 6, padding: 10, minWidth: 170, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                  <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 600, fontSize: 12, color: "var(--color-text-primary)", marginBottom: 6 }}>Assign word → tracklet</div>
                  {shot.tracklets.map((t) => (
                    <button key={t.id} onClick={() => handleWordAssign(t.id, sIdx)} style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "5px 8px", border: "1px solid var(--color-border)", borderRadius: 5, background: "transparent", cursor: "pointer", marginBottom: 3, fontFamily: "'Bricolage Grotesque'", fontWeight: 500, fontSize: 11, color: "var(--color-text-primary)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-3)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--color-surface-3)" }} />{t.letter} <span style={{ fontFamily: "'Geist Mono'", fontSize: 10, color: "var(--color-text-muted)", marginLeft: "auto" }}>{shot.duration}</span>
                    </button>
                  ))}
                  <button onClick={() => setWordPopover(null)} style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 11, color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer", marginTop: 2 }}>Cancel</button>
                </div>
              )}
            </span>
          );
        })}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div data-popover style={{ position: "fixed", left: contextMenu.x, top: contextMenu.y, zIndex: 50, background: "var(--color-surface-1)", border: "1px solid var(--color-border)", borderRadius: 6, padding: 4, minWidth: 220, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
          <button onClick={() => { onRemoveBinding(shot.idx, contextMenu.trackletId, contextMenu.speakerId); setContextMenu(null); toast("Assignment removed"); }}
            style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 10px", fontFamily: "'Bricolage Grotesque'", fontWeight: 500, fontSize: 12, color: "var(--color-text-primary)", background: "none", border: "none", cursor: "pointer", borderRadius: 4 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-3)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            Remove: {speakerNames[contextMenu.speakerId] ?? `Spk_0${contextMenu.speakerId}`} → {contextMenu.trackletId}
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Component — RunGrounding
   ═══════════════════════════════════════════════════════════ */

export default function RunGrounding() {
  const { id, clipId } = useParams();
  const runId = id ?? "";

  // Queue is derived from the run's clip candidates, filtered through the
  // clip-store approval state — only clips the user marked "approved" on the
  // Clips page flow into grounding. Until the mock list lands we render an
  // empty panel; the rest of the layout can still boot because `current`
  // falls back to a stub clip below.
  const { data: apiClips } = useClipList(runId);
  const approvalOverrides = useClipStore((s) => s.approvalOverrides);

  const queue = useMemo<QueueClip[]>(() => {
    if (!apiClips) return [];
    const approved = apiClips.filter((c) => {
      if (!c.clip_id) return false;
      // Default to approved so mock runs show something even before the user
      // explicitly approves on the Clips page. Once the user rejects a clip
      // it disappears from grounding; approvals are a no-op.
      return (approvalOverrides[c.clip_id] ?? "approved") !== "rejected";
    });
    return approved.map((c, idx): QueueClip => {
      const durSec = Math.max(0, Math.round((c.end_ms - c.start_ms) / 1000));
      return {
        id: c.clip_id ?? `clip-${idx}`,
        label: `Clip ${String(idx + 1).padStart(3, "0")}`,
        timeStart: fmtShort(c.start_ms),
        timeEnd: fmtShort(c.end_ms),
        duration: `${durSec}s`,
        status: "not_started",
      };
    });
  }, [apiClips, approvalOverrides]);

  const [activeClip, setActiveClip] = useState<string>(clipId ?? "");
  const [activeShotIdx, setActiveShotIdx] = useState(1);
  const [cameraOpen, setCameraOpen] = useState(true);

  // Self-heal: if the active clip isn't in the (possibly empty) queue yet,
  // snap to the first queue entry once it's loaded.
  useEffect(() => {
    if (queue.length === 0) return;
    if (!queue.some((c) => c.id === activeClip)) {
      setActiveClip(queue[0].id);
    }
  }, [queue, activeClip]);

  /* Crop modal — pure UI state (which modal is open). Persisted crop values
     themselves live in the grounding state via effectiveCrops below. */
  const [cropModal, setCropModal] = useState<number | null>(null);

  /* Speaker naming */
  const [speakerNames, setSpeakerNames] = useState<Record<number, string>>({ ...SPEAKER_NAMES });

  /* Manual bounding box editor (per shot)
     The persisted state (rects, user-added tracklets, hidden originals) lives
     server-side via the grounding API; we read it through useGroundingState
     and write it through useUpdateGrounding. The mutation hook does optimistic
     cache updates so the editor stays snappy across drag/resize.

     Pure UI state (toolbar toggle + current selection) stays local because it
     should not survive a navigation. */
  const groundingClipKey = activeClip || clipId || "";
  const { data: groundingState } = useGroundingState(runId, groundingClipKey);
  const updateGrounding = useUpdateGrounding(runId, groundingClipKey);

  const [boxEditMode, setBoxEditMode] = useState(false);
  const [selectedBoxKey, setSelectedBoxKey] = useState<string | null>(null);

  // Empty placeholder so the rest of the page can render before the first
  // GET resolves (the mock layer returns instantly, but real-mode might not).
  const safeGrounding: GroundingClipState = useMemo(
    () => groundingState ?? {
      run_id: runId,
      clip_id: groundingClipKey,
      shots: [],
      updated_at: new Date(0).toISOString(),
    },
    [groundingState, runId, groundingClipKey],
  );

  /** Read the saved state for one shot (returns an empty stub if untouched). */
  const getShotState = useCallback((state: GroundingClipState, shotIdx: number): GroundingShotState => {
    return state.shots.find((s) => s.shot_idx === shotIdx) ?? {
      shot_idx: shotIdx,
      rects: {},
      user_tracklets: [],
      hidden_tracklet_ids: [],
    };
  }, []);

  /** Immutable upsert of one shot inside the GroundingClipState. */
  const replaceShot = useCallback((state: GroundingClipState, shotIdx: number, fn: (shot: GroundingShotState) => GroundingShotState): GroundingClipState => {
    const existing = state.shots.find((s) => s.shot_idx === shotIdx);
    const updated = fn(existing ?? {
      shot_idx: shotIdx,
      rects: {},
      user_tracklets: [],
      hidden_tracklet_ids: [],
    });
    const nextShots = existing
      ? state.shots.map((s) => (s.shot_idx === shotIdx ? updated : s))
      : [...state.shots, updated];
    return { ...state, shots: nextShots };
  }, []);

  const handleUpdateRect = useCallback((shotIdx: number, trackletId: string, rect: BoxRect) => {
    const next = replaceShot(safeGrounding, shotIdx, (shot) => ({
      ...shot,
      rects: { ...shot.rects, [trackletId]: rect },
    }));
    updateGrounding.mutate(next);
  }, [safeGrounding, replaceShot, updateGrounding]);

  const handleSelectBox = useCallback((shotIdx: number, trackletId: string | null) => {
    setSelectedBoxKey(trackletId ? `${shotIdx}:${trackletId}` : null);
  }, []);

  const handleDeleteBox = useCallback((shotIdx: number, trackletId: string) => {
    // Originals (from SHOTS) get hidden so they can in principle come back later;
    // user-added tracklets get fully removed. Bindings against the deleted
    // tracklet are cascaded out in the same mutation so a stale speaker badge
    // doesn't linger after the box disappears.
    const isOriginal = SHOTS.find((s) => s.idx === shotIdx)?.tracklets.some((t) => t.id === trackletId) ?? false;
    const next = replaceShot(safeGrounding, shotIdx, (shot) => {
      const { [trackletId]: _removed, ...remainingRects } = shot.rects;
      const currentBindings = shot.bindings ?? (getInitialBindings()[shotIdx] ?? []);
      const filteredBindings = currentBindings.filter((b) => b.tracklet_id !== trackletId);
      const bindingsChanged = filteredBindings.length !== currentBindings.length;
      return {
        ...shot,
        rects: remainingRects,
        user_tracklets: isOriginal
          ? shot.user_tracklets
          : shot.user_tracklets.filter((t) => t.id !== trackletId),
        hidden_tracklet_ids: isOriginal
          ? [...shot.hidden_tracklet_ids, trackletId]
          : shot.hidden_tracklet_ids,
        // Only mark bindings as user-touched if we actually removed any —
        // otherwise leave the field undefined so it keeps falling through
        // to the seed default.
        ...(bindingsChanged ? { bindings: filteredBindings } : {}),
      };
    });
    updateGrounding.mutate(next);
    setSelectedBoxKey((prev) => (prev === `${shotIdx}:${trackletId}` ? null : prev));
  }, [safeGrounding, replaceShot, updateGrounding]);

  const handleAddBox = useCallback((shotIdx: number) => {
    const shot = SHOTS.find((s) => s.idx === shotIdx);
    const existingLetters = new Set<string>();
    shot?.tracklets.forEach((t) => existingLetters.add(t.letter));
    const currentShotState = getShotState(safeGrounding, shotIdx);
    currentShotState.user_tracklets.forEach((t) => existingLetters.add(t.letter));
    let nextCode = "A".charCodeAt(0);
    while (existingLetters.has(String.fromCharCode(nextCode)) && nextCode < "Z".charCodeAt(0)) {
      nextCode++;
    }
    const letter = String.fromCharCode(nextCode);
    const newId = `tracklet_user_${shotIdx}_${Date.now()}`;
    const newTracklet: GroundingTracklet = { id: newId, letter, duration_pct: 100 };
    const next = replaceShot(safeGrounding, shotIdx, (s) => ({
      ...s,
      user_tracklets: [...s.user_tracklets, newTracklet],
      rects: { ...s.rects, [newId]: DEFAULT_NEW_BOX },
    }));
    updateGrounding.mutate(next);
    setSelectedBoxKey(`${shotIdx}:${newId}`);
    setBoxEditMode(true);
  }, [safeGrounding, getShotState, replaceShot, updateGrounding]);

  /* ─── Effective bindings / intents / crops ──────────────────────────
     The persisted GroundingShotState records *only* what the user touched —
     anything they haven't edited falls back to a per-shot seed (the same
     mock data that lived in useState before this turned into a server-
     persisted thing). The three memos below merge seed defaults with any
     persisted overrides so the rest of the page can read a single source
     of truth without caring whether a value came from the seed or the API. */
  const SEED_BINDINGS = useMemo(() => getInitialBindings(), []);
  const SEED_INTENTS = useMemo(() => getInitialIntents(), []);

  const effectiveBindings: Record<number, Binding[]> = useMemo(() => {
    const result: Record<number, Binding[]> = { ...SEED_BINDINGS };
    for (const shot of safeGrounding.shots) {
      if (shot.bindings !== undefined) result[shot.shot_idx] = shot.bindings;
    }
    return result;
  }, [safeGrounding, SEED_BINDINGS]);

  const effectiveIntents: ShotIntent[] = useMemo(() => {
    return SHOTS.map((s, i) => {
      const persisted = safeGrounding.shots.find((p) => p.shot_idx === s.idx);
      if (persisted?.intent) return intentFromWire(persisted.intent);
      return SEED_INTENTS[i];
    });
  }, [safeGrounding, SEED_INTENTS]);

  const effectiveCrops: Record<number, CropPosition> = useMemo(() => {
    const result: Record<number, CropPosition> = {};
    for (const shot of safeGrounding.shots) {
      if (shot.manual_crop) result[shot.shot_idx] = shot.manual_crop;
    }
    return result;
  }, [safeGrounding]);

  const handleAddBinding = useCallback((shotIdx: number, binding: Binding) => {
    const next = replaceShot(safeGrounding, shotIdx, (shot) => {
      const current = shot.bindings ?? (SEED_BINDINGS[shotIdx] ?? []);
      return { ...shot, bindings: [...current, binding] };
    });
    updateGrounding.mutate(next);
  }, [safeGrounding, replaceShot, updateGrounding, SEED_BINDINGS]);

  const handleRemoveBinding = useCallback((shotIdx: number, trackletId: string, speakerId: number) => {
    const next = replaceShot(safeGrounding, shotIdx, (shot) => {
      const current = shot.bindings ?? (SEED_BINDINGS[shotIdx] ?? []);
      return {
        ...shot,
        bindings: current.filter((b) => !(b.tracklet_id === trackletId && b.speaker_id === speakerId)),
      };
    });
    updateGrounding.mutate(next);
  }, [safeGrounding, replaceShot, updateGrounding, SEED_BINDINGS]);

  const updateIntent = useCallback((arrayIdx: number, patch: Partial<ShotIntent>) => {
    const shot = SHOTS[arrayIdx];
    if (!shot) return;
    const current = effectiveIntents[arrayIdx] ?? SEED_INTENTS[arrayIdx] ?? { intent: "Follow" as IntentType };
    const merged: ShotIntent = { ...current, ...patch };
    const next = replaceShot(safeGrounding, shot.idx, (s) => ({
      ...s,
      intent: intentToWire(merged),
    }));
    updateGrounding.mutate(next);
  }, [safeGrounding, replaceShot, updateGrounding, effectiveIntents, SEED_INTENTS]);

  const handleSaveCrop = useCallback((shotIdx: number, crop: CropPosition) => {
    const arrayIdx = SHOTS.findIndex((s) => s.idx === shotIdx);
    const currentIntent = arrayIdx >= 0
      ? (effectiveIntents[arrayIdx] ?? SEED_INTENTS[arrayIdx] ?? { intent: "Manual" as IntentType })
      : { intent: "Manual" as IntentType };
    const next = replaceShot(safeGrounding, shotIdx, (shot) => ({
      ...shot,
      manual_crop: crop,
      intent: intentToWire({ ...currentIntent, cropSet: true }),
    }));
    updateGrounding.mutate(next);
    setCropModal(null);
  }, [safeGrounding, replaceShot, updateGrounding, effectiveIntents, SEED_INTENTS]);

  /* Progress */
  const progress = computeGroundingProgress(effectiveBindings);
  const completedIntents = SHOTS.reduce((a, _, i) => a + (effectiveIntents[i] && isShotIntentComplete(effectiveIntents[i]) ? 1 : 0), 0);
  const clipStatus: QueueClip["status"] = progress.grounded === progress.total ? "complete" : progress.grounded > 0 ? "partial" : "not_started";
  const isComplete = clipStatus === "complete";
  // Fallback stub keeps the rest of the layout renderable while apiClips is
  // still loading or the user hasn't approved anything yet.
  const FALLBACK_CURRENT: QueueClip = { id: "—", label: "Clip —", timeStart: "0:00", timeEnd: "0:00", duration: "0s", status: "not_started" };
  const current = queue.find((c) => c.id === activeClip) ?? queue[0] ?? FALLBACK_CURRENT;
  const activeShot = SHOTS.find((s) => s.idx === activeShotIdx) ?? SHOTS[0];
  const activeShotIntentIdx = SHOTS.findIndex((s) => s.idx === activeShotIdx);
  const activeShotIntent = effectiveIntents[activeShotIntentIdx] ?? { intent: "Follow" as IntentType };

  /* Video player */
  const videoRef    = useRef<HTMLVideoElement>(null);
  const previewRef  = useRef<HTMLVideoElement>(null);
  const scrubBarRef = useRef<HTMLDivElement>(null);
  const [playing,       setPlaying]       = useState(false);
  const [currentTime,   setCurrentTime]   = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [hoverPct,      setHoverPct]      = useState<number | null>(null);
  const [hoverClientX,  setHoverClientX]  = useState(0);
  const [scrubberTopY,  setScrubberTopY]  = useState(0);
  const [isScrubbing,   setIsScrubbing]   = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrentTime(v.currentTime);
    const onMeta = () => { if (v.duration && isFinite(v.duration)) setVideoDuration(v.duration); };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    return () => { v.removeEventListener("timeupdate", onTime); v.removeEventListener("loadedmetadata", onMeta); };
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  }, []);

  // Jump to shot start when shot changes
  useEffect(() => {
    const v = videoRef.current;
    if (v && activeShot) { v.currentTime = activeShot.startMs / 1000; setCurrentTime(activeShot.startMs / 1000); }
  }, [activeShotIdx, activeShot]);

  const getPctFromClientX = useCallback((clientX: number) => {
    const rect = scrubBarRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  const seekToPct = useCallback((pct: number) => {
    const v = videoRef.current;
    if (!v || videoDuration === 0) return;
    v.currentTime = pct * videoDuration;
    if (previewRef.current) previewRef.current.currentTime = pct * videoDuration;
  }, [videoDuration]);

  const startScrub = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsScrubbing(true);
    const pct = getPctFromClientX(e.clientX);
    if (pct !== null) {
      seekToPct(pct);
      setHoverPct(pct);
      setHoverClientX(e.clientX);
    }
    const onMove = (ev: MouseEvent) => {
      const p = getPctFromClientX(ev.clientX);
      if (p === null) return;
      seekToPct(p);
      setHoverPct(p);
      setHoverClientX(ev.clientX);
    };
    const onUp = (ev: MouseEvent) => {
      const p = getPctFromClientX(ev.clientX);
      if (p !== null) seekToPct(p);
      setIsScrubbing(false);
      setHoverPct(null);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [getPctFromClientX, seekToPct]);

  /* Drag divider — same pattern as Timeline: inline window listeners, no useEffect */
  // Queue needs: header(32) + items(queue.length * 34) + insets(16). Floor to
  // a sane minimum so the panel has room even when the queue is empty.
  const MIN_VIDEO_H = 32 + Math.max(1, queue.length) * 34 + 16;
  // Lane counting: tracklet(1) + speakers(activeShot.speakers.length) + transcript(1) + camera header(1) + camera content(1 if open)
  const numLanes = 1 + activeShot.speakers.length + 1 + 1 + (cameraOpen ? 1 : 0);
  const LANE_MIN_H = 24;
  // Chrome below video: divider(6) + transport(48) + ruler(32) + shot-strip(40) = 126. Context bar: 48.
  // MAX ensures each lane >= LANE_MIN_H
  const MAX_VIDEO_H = window.innerHeight - 48 - 126 - numLanes * LANE_MIN_H;
  const [videoH, setVideoH] = useState(() => Math.round(window.innerHeight * 0.50));
  const isDraggingDivider = useRef(false);
  const rulerContainerRef = useRef<HTMLDivElement>(null);
  const [rulerWidth, setRulerWidth] = useState(800);
  const queuePanelRef = useRef<HTMLDivElement>(null);
  const workspaceContainerRef = useRef<HTMLDivElement>(null);
  const [workspaceContainerH, setWorkspaceContainerH] = useState(300);
  const parseTimeStr = (t: string) => { const [m, s] = t.split(":"); return parseInt(m) * 60 + parseInt(s); };
  const clipStartS = parseTimeStr(current.timeStart);
  const clipEndS   = parseTimeStr(current.timeEnd);
  const clipDurationS = Math.max(1, clipEndS - clipStartS);

  useEffect(() => {
    const el = rulerContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setRulerWidth(entry.contentRect.width));
    ro.observe(el);
    setRulerWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = workspaceContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWorkspaceContainerH(entry.contentRect.height));
    ro.observe(el);
    setWorkspaceContainerH(el.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, []);

  // Dynamic lane height — exactly like Timeline: measured container ÷ total lanes
  const laneH = numLanes > 0
    ? Math.max(LANE_MIN_H, Math.floor(workspaceContainerH / numLanes))
    : LANE_MIN_H;

  /* Scrubber derived state */
  const scrubPct = videoDuration > 0
    ? Math.max(0, Math.min(100, (currentTime / videoDuration) * 100))
    : 0;

  return (
    <div className="flex flex-col" style={{ height: "100vh", overflow: "hidden" }}>
      {/* ── Context bar ── */}
      <div style={{ height: 48, flexShrink: 0, background: "var(--color-surface-1)", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to={`/runs/${id ?? "demo"}/clips`} style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 12, color: "var(--color-text-muted)", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")} onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}>
            ← Clips
          </Link>
          <span style={{ width: 1, height: 14, background: "var(--color-border)" }} />
          <span style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>Grounding</span>
          <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>·</span>
          <span style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 500, fontSize: 13, color: "var(--color-text-secondary)" }}>Clip {current.id}</span>
          <span style={{ fontFamily: "'Geist Mono'", fontSize: 11, color: "var(--color-text-muted)" }}>{current.timeStart} → {current.timeEnd} · {current.duration}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {[
            { label: `Speakers ${progress.grounded}/${progress.total}`, done: progress.grounded === progress.total },
            { label: `Camera ${completedIntents}/${SHOTS.length}`, done: completedIntents === SHOTS.length },
          ].map((p) => (
            <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.done ? "var(--color-green)" : "var(--color-amber)" }} />
              <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 11, color: "var(--color-text-muted)" }}>{p.label}</span>
            </div>
          ))}
          <button style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid var(--color-border)", background: "var(--color-surface-2)", fontFamily: "'Bricolage Grotesque'", fontWeight: 600, fontSize: 12, color: "var(--color-text-primary)", cursor: "pointer" }}>Save</button>
          <button disabled={!isComplete} style={{ padding: "5px 12px", borderRadius: 5, border: "none", background: isComplete ? "var(--color-violet)" : "var(--color-surface-3)", fontFamily: "'Bricolage Grotesque'", fontWeight: 600, fontSize: 12, color: isComplete ? "#0A0909" : "var(--color-text-muted)", cursor: isComplete ? "pointer" : "not-allowed" }}>Done →</button>
        </div>
      </div>

      {/* ── Main area ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Work area (full width) ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Video player + queue in left black bar */}
          <div style={{ height: videoH, flexShrink: 0, background: "#000", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <video ref={videoRef} src={`${DEMO_VIDEO_URL}#t=${activeShot.startMs / 1000}`} preload="metadata"
              style={{ height: "100%", width: "auto", maxWidth: "100%", objectFit: "contain" }}
            />
            {(() => {
              const activeShotState = getShotState(safeGrounding, activeShot.idx);
              const overlayUserTracklets: Tracklet[] = activeShotState.user_tracklets.map((t) => ({
                id: t.id,
                letter: t.letter,
                durationPct: t.duration_pct,
              }));
              return (
                <BoundingBoxOverlay
                  shot={activeShot}
                  bindings={effectiveBindings[activeShot.idx] || []}
                  speakerNames={speakerNames}
                  userTracklets={overlayUserTracklets}
                  hiddenIds={activeShotState.hidden_tracklet_ids}
                  rects={activeShotState.rects}
                  editMode={boxEditMode}
                  selectedTrackletId={
                    selectedBoxKey?.startsWith(`${activeShot.idx}:`)
                      ? selectedBoxKey.split(":").slice(1).join(":")
                      : null
                  }
                  onUpdateRect={(id, rect) => handleUpdateRect(activeShot.idx, id, rect)}
                  onSelect={(id) => handleSelectBox(activeShot.idx, id)}
                  onDelete={(id) => handleDeleteBox(activeShot.idx, id)}
                />
              );
            })()}

            {/* Floating box-editor toolbar — top-right of the video container,
                mirrors the queue panel's glass styling on the left. */}
            <div style={{
              position: "absolute", right: 8, top: 8, zIndex: 4,
              display: "flex", gap: 6, alignItems: "center",
              padding: 4,
              background: "rgba(10,9,9,0.72)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8,
            }}>
              <button
                onClick={() => {
                  setBoxEditMode((v) => {
                    if (v) setSelectedBoxKey(null);
                    return !v;
                  });
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 9px", borderRadius: 5,
                  border: `1px solid ${boxEditMode ? "var(--color-violet)" : "rgba(255,255,255,0.12)"}`,
                  background: boxEditMode ? "rgba(139,92,246,0.18)" : "transparent",
                  color: boxEditMode ? "var(--color-violet)" : "var(--color-text-primary)",
                  fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 11,
                  cursor: "pointer",
                }}
                title="Toggle bounding box editor"
              >
                <Crop size={12} />
                {boxEditMode ? "Editing boxes" : "Edit boxes"}
              </button>
              <button
                onClick={() => handleAddBox(activeShot.idx)}
                disabled={!boxEditMode}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "5px 9px", borderRadius: 5,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent",
                  color: boxEditMode ? "var(--color-text-primary)" : "var(--color-text-muted)",
                  fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 11,
                  cursor: boxEditMode ? "pointer" : "not-allowed",
                  opacity: boxEditMode ? 1 : 0.55,
                }}
                title={boxEditMode ? "Add a new tracklet box" : "Enable Edit boxes first"}
              >
                + Add box
              </button>
            </div>

            {/* Queue — floats in the left black bar, same pattern as Timeline layer toggles */}
            <div style={{
              position: "absolute", left: 8, top: 8,
              width: 172, zIndex: 4,
              maxHeight: "calc(100% - 16px)",
              display: "flex", flexDirection: "column",
              background: "rgba(10,9,9,0.72)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8,
              overflow: "hidden",
            }}>
              {/* Header */}
              <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <span className="label-caps" style={{ fontSize: 9, color: "var(--color-text-muted)" }}>Queue</span>
                <span style={{ fontFamily: "'Geist Mono'", fontSize: 10, color: "var(--color-text-muted)" }}>{queue.length}</span>
              </div>
              {/* Items */}
              <div style={{ flex: 1, overflowY: "auto" }}>
                {queue.length === 0 && (
                  <div style={{ padding: "12px 10px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, color: "var(--color-text-muted)", textAlign: "center" }}>
                    No approved clips.
                  </div>
                )}
                {queue.map((clip) => {
                  const isActive = clip.id === activeClip;
                  const isLocked = clip.status === "locked";
                  const dStatus: QueueClip["status"] = isActive ? clipStatus : clip.status;
                  return (
                    <div key={clip.id} onClick={() => !isLocked && setActiveClip(clip.id)}
                      style={{
                        padding: "7px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)",
                        cursor: isLocked ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7,
                        background: isActive ? "rgba(139,92,246,0.15)" : "transparent",
                        borderLeft: isActive ? "2px solid var(--color-violet)" : "2px solid transparent",
                        transition: "background 100ms",
                      }}
                      onMouseEnter={(e) => { if (!isActive && !isLocked) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                    >
                      <StatusIcon status={dStatus} />
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 600, fontSize: 11, color: "var(--color-text-primary)" }}>{clip.label}</div>
                        <div style={{ fontFamily: "'Geist Mono'", fontSize: 10, color: "var(--color-text-muted)" }}>{clip.timeStart} → {clip.timeEnd}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Drag divider — exact Timeline pattern: inline window listeners */}
          <div
            style={{ flexShrink: 0, height: 6, background: "var(--color-border-subtle)", cursor: "ns-resize", position: "relative", zIndex: 10 }}
            onMouseDown={(e) => {
              e.preventDefault();
              isDraggingDivider.current = true;
              const startY = e.clientY;
              const startH = videoH;
              const onMove = (ev: MouseEvent) => {
                if (!isDraggingDivider.current) return;
                setVideoH(Math.max(MIN_VIDEO_H, Math.min(MAX_VIDEO_H, startH + (ev.clientY - startY))));
              };
              const onUp = () => {
                isDraggingDivider.current = false;
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
              };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-violet-muted)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-border-subtle)"; }}
          >
            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 32, height: 3, borderRadius: 2, background: "var(--color-border)", pointerEvents: "none" }} />
          </div>

          {/* Transport bar */}
          <div style={{ height: 48, flexShrink: 0, background: "var(--color-surface-1)", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 12, padding: "0 16px" }}>
            <button onClick={togglePlay} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, background: "var(--color-surface-3)", border: "none", cursor: "pointer", color: "var(--color-text-primary)", flexShrink: 0 }}>
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, color: "var(--color-text-primary)", minWidth: 80, flexShrink: 0 }}>
              {msToTimestamp(currentTime * 1000)}
            </span>
            {/* Scrubber */}
            <div
              ref={scrubBarRef}
              onMouseDown={startScrub}
              onMouseMove={(e) => {
                if (isScrubbing) return;
                const p = getPctFromClientX(e.clientX);
                setHoverPct(p);
                setHoverClientX(e.clientX);
                setScrubberTopY(e.currentTarget.getBoundingClientRect().top);
                if (p !== null && previewRef.current) previewRef.current.currentTime = p * videoDuration;
              }}
              onMouseLeave={() => { if (!isScrubbing) setHoverPct(null); }}
              style={{ flex: 1, height: 16, display: "flex", alignItems: "center", cursor: "pointer", position: "relative", userSelect: "none" }}
            >
              {/* Track */}
              <div style={{ position: "absolute", left: 0, right: 0, height: 4, borderRadius: 2, background: "var(--color-surface-3)" }}>
                <div style={{ width: `${scrubPct}%`, height: "100%", background: "var(--color-violet)", borderRadius: 2 }} />
              </div>
              {/* Dot */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: `${scrubPct}%`,
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
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)", flexShrink: 0 }}>
              {msToTimestamp(videoDuration * 1000)}
            </span>
          </div>

          {/* Bottom workspace */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Time ruler — identical structure to the Timeline page */}
            <div ref={rulerContainerRef} style={{
              flexShrink: 0, height: 32,
              background: "var(--color-surface-1)",
              borderBottom: "1px solid var(--color-border-subtle)",
              display: "flex",
            }}>
              <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                <div>
                  <TimeRuler
                    duration={clipDurationS}
                    pixelsPerSecond={clipDurationS > 0 ? rulerWidth / clipDurationS : 1}
                    scrollX={0}
                    viewportWidth={rulerWidth}
                    onSeek={(t) => {
                      const v = videoRef.current;
                      if (v) { v.currentTime = clipStartS + t; setCurrentTime(clipStartS + t); }
                    }}
                  />
                </div>
                {/* Playhead line — same as Timeline */}
                <div style={{
                  position: "absolute", top: 0, bottom: 0, width: 1,
                  left: Math.max(0, (currentTime - clipStartS) / clipDurationS) * rulerWidth,
                  background: "var(--color-violet)",
                  pointerEvents: "none", zIndex: 20,
                }} />
              </div>
            </div>

            {/* Shot strip */}
            <div style={{ height: 40, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 12px", gap: 4, background: "var(--color-surface-1)", borderBottom: "1px solid var(--color-border)", overflowX: "auto" }}>
              <span className="label-caps" style={{ fontSize: 9, marginRight: 4, flexShrink: 0 }}>SHOTS</span>
              {SHOTS.map((s) => {
                const isActive = s.idx === activeShotIdx;
                const shotBound = (effectiveBindings[s.idx] || []).length > 0;
                const allBound = s.tracklets.every((t) => (effectiveBindings[s.idx] || []).some((b) => b.tracklet_id === t.id));
                return (
                  <button key={s.idx} onClick={() => setActiveShotIdx(s.idx)}
                    style={{
                      height: 28, padding: "0 10px", borderRadius: 4, flexShrink: 0,
                      display: "flex", alignItems: "center", gap: 5,
                      fontFamily: "'Bricolage Grotesque'", fontWeight: 600, fontSize: 11,
                      background: isActive ? "var(--color-violet-muted)" : "var(--color-surface-2)",
                      color: isActive ? "var(--color-violet)" : "var(--color-text-secondary)",
                      border: isActive ? "1px solid rgba(167,139,250,0.4)" : "1px solid var(--color-border)",
                      cursor: "pointer", transition: "all 100ms",
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: allBound ? "var(--color-green)" : shotBound ? "var(--color-amber)" : "var(--color-surface-3)" }} />
                    Shot {s.idx}
                    <span style={{ fontFamily: "'Geist Mono'", fontSize: 9, color: "var(--color-text-muted)", fontWeight: 400 }}>{s.duration}</span>
                  </button>
                );
              })}
            </div>

            {/* Unified workspace — lanes fill container exactly, same as Timeline */}
            <div ref={workspaceContainerRef} style={{ flex: 1, overflow: "hidden" }}>
                  <ActiveShotWorkspace
                    shot={activeShot}
                    shotBindings={effectiveBindings[activeShot.idx] || []}
                    onAddBinding={handleAddBinding}
                    onRemoveBinding={handleRemoveBinding}
                    speakerNames={speakerNames}
                    laneH={laneH}
                  />

                {/* Camera intent — uses same laneH as all other lanes */}
                <div style={{ height: laneH, display: "flex", alignItems: "center", padding: "0 12px", background: "var(--color-surface-1)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border-subtle)", cursor: "pointer" }}
                  onClick={() => setCameraOpen(!cameraOpen)}>
                  {cameraOpen ? <ChevronDown size={12} color="var(--color-text-muted)" /> : <ChevronRight size={12} color="var(--color-text-muted)" />}
                  <span className="label-caps" style={{ fontSize: 9, marginLeft: 6 }}>Camera Intent — Shot {activeShot.idx}</span>
                  <span style={{ fontFamily: "'Geist Mono'", fontSize: 10, color: isShotIntentComplete(activeShotIntent) ? "var(--color-green)" : "var(--color-amber)", marginLeft: "auto" }}>
                    {isShotIntentComplete(activeShotIntent) ? "Set" : "Needs input"}
                  </span>
                </div>
                {cameraOpen && (
                  <div style={{ height: laneH, display: "flex", alignItems: "center", gap: 8, padding: "0 12px", background: "var(--color-surface-1)", borderBottom: "1px solid var(--color-border-subtle)", overflow: "hidden" }}>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      {INTENT_OPTIONS.map((opt) => {
                        const active = activeShotIntent.intent === opt;
                        return (
                          <button key={opt} onClick={() => updateIntent(activeShotIntentIdx, { intent: opt })}
                            style={{
                              height: 22, padding: "0 7px", borderRadius: 4,
                              fontFamily: "'Bricolage Grotesque'", fontWeight: 500, fontSize: 10,
                              background: active ? "var(--color-violet-muted)" : "var(--color-surface-2)",
                              color: active ? "var(--color-violet)" : "var(--color-text-muted)",
                              border: active ? "1px solid rgba(167,139,250,0.4)" : "1px solid var(--color-border)",
                              cursor: "pointer", transition: "all 100ms",
                            }}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ flex: 1 }}>
                      <IntentConfig intent={activeShotIntent} shot={activeShot} onChange={(p) => updateIntent(activeShotIntentIdx, p)} onOpenCrop={() => setCropModal(activeShot.idx)} />
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {cropModal !== null && (
        <ManualCropModal shotIdx={cropModal} initial={effectiveCrops[cropModal]} onSave={handleSaveCrop} onClose={() => setCropModal(null)} />
      )}

      {/* ── Scrub preview — fixed so no parent overflow clips it ── */}
      <div style={{
        position: "fixed",
        left: Math.min(Math.max(hoverClientX - 80, 8), window.innerWidth - 168),
        top: scrubberTopY - 90 - 24 - 8,
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
          ref={previewRef}
          src={DEMO_VIDEO_URL}
          style={{ width: 160, height: 90, objectFit: "cover", borderRadius: 4, border: "1px solid var(--color-border)", background: "#000", display: "block" }}
          preload="metadata"
          muted
          onLoadedMetadata={() => {
            if (previewRef.current && previewRef.current.duration && isFinite(previewRef.current.duration))
              setVideoDuration(previewRef.current.duration);
          }}
        />
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "var(--color-text-muted)", background: "var(--color-surface-2)", padding: "2px 6px", borderRadius: 3 }}>
          {hoverPct !== null ? msToTimestamp(hoverPct * videoDuration * 1000) : ""}
        </span>
      </div>
    </div>
  );
}
