import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useSpring } from "framer-motion";
import CortexFragment from "./CortexFragment";
import TimelineFragment from "./TimelineFragment";
import ClipChip from "./ClipChip";
import { getLandingClipPosterSrc, getLandingClipVideoSrc } from "../landingMedia";

const ENTRY = [0.23, 1, 0.32, 1] as [number, number, number, number];

type FragmentDef = {
  id: string;
  Render: () => ReactNode;
  position: { left: number; top: number };
  rotate: number;
  pxFactor: number;
  delay: number;
  z: number;
};

/* Baked-in layout from drag editor session. */
const fragments: FragmentDef[] = [
  { id: "cortex",   Render: CortexFragment,   position: { left: -96, top:  86 }, rotate: -0.8, pxFactor:  0.014, delay: 0.55, z: 3 },
  { id: "clip-a",   Render: () => (
      <ClipChip title="The pivot moment that changes everything." range="0:00 - 0:20"
        bgFrom="rgba(70,40,30,0.9)" bgTo="rgba(20,10,18,0.95)"
        videoSrc={getLandingClipVideoSrc("sg_0002_cand_01_vertical_rfdetr_karaoke")}
        posterSrc={getLandingClipPosterSrc("sg_0002_cand_01_vertical_rfdetr_karaoke")} />
    ),                                         position: { left:  560, top: 124 }, rotate:  1.8, pxFactor: -0.014, delay: 0.70, z: 6 },
  { id: "clip-b",   Render: () => (
      <ClipChip title="That's the unlock right there." range="2:27 - 3:43"
        bgFrom="rgba(28,32,52,0.9)" bgTo="rgba(12,12,22,0.95)"
        videoSrc={getLandingClipVideoSrc("sg_0003_cand_01_vertical_rfdetr_karaoke")}
        posterSrc={getLandingClipPosterSrc("sg_0003_cand_01_vertical_rfdetr_karaoke")} />
    ),                                         position: { left:  376, top:  108 }, rotate: -1.6, pxFactor:  0.016, delay: 0.78, z: 8 },
  { id: "timeline", Render: TimelineFragment, position: { left:  332, top: 430 }, rotate:  0.9, pxFactor: -0.016, delay: 0.86, z: 5 },
];

const LS_KEY = "clypt:hero-layout";
type LayoutOverrides = Record<string, { left: number; top: number; rotate?: number }>;

function loadOverrides(): LayoutOverrides {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
}
function saveOverrides(o: LayoutOverrides) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(o)); } catch { return; }
}

function Fragment({
  def, hovered, anyHovered, reduced, override, onHoverStart, onHoverEnd,
}: {
  def: FragmentDef; hovered: boolean; anyHovered: boolean; reduced: boolean;
  override?: { left: number; top: number; rotate?: number };
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const sx = useSpring(0, { stiffness: 60, damping: 18 });
  const sy = useSpring(0, { stiffness: 60, damping: 18 });

  useEffect(() => {
    if (reduced) return;
    const handle = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      sx.set(((e.clientX - cx) / window.innerWidth) * def.pxFactor * 240);
      sy.set(((e.clientY - cy) / window.innerHeight) * def.pxFactor * 140);
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [sx, sy, def.pxFactor, reduced]);

  const left = override?.left ?? def.position.left;
  const top  = override?.top  ?? def.position.top;
  const rot  = override?.rotate ?? def.rotate;

  return (
    <motion.div
      data-cursor={def.id.startsWith("clip") ? "play" : undefined}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      style={{
        position: "absolute",
        left, top,
        zIndex: hovered ? 20 : def.z,
        x: sx, y: sy,
        rotate: rot,
        pointerEvents: "auto",
        filter: anyHovered && !hovered ? "blur(2px)" : "blur(0px)",
        opacity: anyHovered && !hovered ? 0.55 : 1,
        transition: "filter 220ms cubic-bezier(0.23,1,0.32,1), opacity 220ms cubic-bezier(0.23,1,0.32,1)",
      }}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: hovered ? 1.03 : 1 }}
      transition={{
        opacity: { duration: 0.7, delay: def.delay, ease: ENTRY },
        y:       { duration: 0.7, delay: def.delay, ease: ENTRY },
        scale:   { duration: 0.18, ease: ENTRY },
      }}
    >
      {def.Render()}
    </motion.div>
  );
}

function DraggableFragment({
  def, override, onChange,
}: {
  def: FragmentDef;
  override: { left: number; top: number; rotate?: number };
  onChange: (next: { left: number; top: number; rotate?: number }) => void;
}) {
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: override.left, oy: override.top };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    onChange({ ...override, left: dragStart.current.ox + dx, top: dragStart.current.oy + dy });
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    dragStart.current = null;
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: "absolute",
        left: override.left,
        top:  override.top,
        zIndex: def.z,
        cursor: "grab",
        outline: "1px dashed rgba(167,139,250,0.4)",
        outlineOffset: 2,
        touchAction: "none",
        userSelect: "none",
        transform: `rotate(${override.rotate ?? def.rotate}deg)`,
      }}
    >
      <div style={{ pointerEvents: "none" }}>{def.Render()}</div>
      <div
        style={{
          position: "absolute",
          left: 0, top: -22,
          fontFamily: "'Geist Mono', monospace",
          fontSize: 10,
          color: "#A78BFA",
          background: "rgba(10,9,9,0.85)",
          padding: "2px 6px",
          borderRadius: 4,
          whiteSpace: "nowrap",
        }}
      >
        {def.id} · L:{Math.round(override.left)} T:{Math.round(override.top)}
      </div>
    </div>
  );
}

function btnStyle(color: string): React.CSSProperties {
  return {
    background: color + "22",
    border: `1px solid ${color}`,
    color,
    padding: "4px 10px",
    borderRadius: 4,
    fontFamily: "'Geist Mono', monospace",
    fontSize: 10,
    cursor: "pointer",
  };
}

function EditorHUD({
  overrides, onReset,
}: {
  overrides: LayoutOverrides; onReset: () => void;
}) {
  const json = JSON.stringify(overrides, null, 2);
  const download = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hero-layout.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(json); alert("Copied layout JSON to clipboard"); }
    catch { alert("Copy failed — use Download instead."); }
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 16, bottom: 16,
        zIndex: 9999,
        background: "rgba(10,9,9,0.9)",
        border: "1px solid rgba(167,139,250,0.4)",
        borderRadius: 10,
        padding: 12,
        fontFamily: "'Geist Mono', monospace",
        fontSize: 11,
        color: "#fff",
        backdropFilter: "blur(12px)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
        maxWidth: 360,
        pointerEvents: "auto",
      }}
    >
      <div style={{ color: "#A78BFA", marginBottom: 6, letterSpacing: "0.08em" }}>
        ✦ HERO LAYOUT EDITOR
      </div>
      <div style={{ color: "rgba(255,255,255,0.6)", marginBottom: 8, fontSize: 10 }}>
        Drag any card. Coords saved to localStorage. Reload preserves them.
      </div>
      <pre
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 6,
          padding: 8,
          margin: 0,
          maxHeight: 220,
          overflow: "auto",
          fontSize: 10,
          color: "rgba(255,255,255,0.9)",
        }}
      >
{json}
      </pre>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={download} style={btnStyle("#A78BFA")}>Download JSON</button>
        <button onClick={copy} style={btnStyle("#7DD3FC")}>Copy</button>
        <button onClick={onReset} style={btnStyle("#FF7A5C")}>Reset</button>
      </div>
    </div>
  );
}

export default function HeroFragments() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [overrides, setOverrides] = useState<LayoutOverrides>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEditMode(params.get("layout") === "edit");
  }, []);

  useEffect(() => {
    const stored = loadOverrides();
    const merged: LayoutOverrides = {};
    fragments.forEach((f) => {
      merged[f.id] = stored[f.id] ?? {
        left: f.position.left,
        top:  f.position.top,
        rotate: f.rotate,
      };
    });
    setOverrides(merged);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  const setOne = (id: string, next: { left: number; top: number; rotate?: number }) => {
    setOverrides((cur) => {
      const updated = { ...cur, [id]: next };
      saveOverrides(updated);
      return updated;
    });
  };

  const reset = () => {
    localStorage.removeItem(LS_KEY);
    const fresh: LayoutOverrides = {};
    fragments.forEach((f) => {
      fresh[f.id] = { left: f.position.left, top: f.position.top, rotate: f.rotate };
    });
    setOverrides(fresh);
  };

  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none hidden lg:block"
        style={{ zIndex: 2 }}
        aria-hidden
      >
        <div
          style={{
            position: "absolute",
            right: "max(1.5vw, 16px)",
            top: "50%",
            transform: "translateY(-50%)",
            width: 880,
            height: 900,
            maxWidth: "64vw",
            outline: editMode ? "1px dashed rgba(167,139,250,0.25)" : undefined,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 0,
              transform: "translateX(-50%)",
              width: 800,
              height: 320,
              background:
                "radial-gradient(ellipse at center, rgba(167,139,250,0.24) 0%, transparent 70%)",
              filter: "blur(60px)",
              pointerEvents: "none",
            }}
          />
          {fragments.map((def) => {
            const ov = overrides[def.id] ?? {
              left: def.position.left,
              top: def.position.top,
              rotate: def.rotate,
            };
            if (editMode) {
              return (
                <div key={def.id} style={{ pointerEvents: "auto" }}>
                  <DraggableFragment
                    def={def}
                    override={ov}
                    onChange={(n) => setOne(def.id, n)}
                  />
                </div>
              );
            }
            return (
              <Fragment
                key={def.id}
                def={def}
                hovered={hoveredId === def.id}
                anyHovered={!!hoveredId}
                reduced={reduced}
                override={ov}
                onHoverStart={() => setHoveredId(def.id)}
                onHoverEnd={() => setHoveredId((cur) => (cur === def.id ? null : cur))}
              />
            );
          })}
        </div>
      </div>

      {editMode && <EditorHUD overrides={overrides} onReset={reset} />}
    </>
  );
}
