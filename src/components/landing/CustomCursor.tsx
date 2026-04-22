import { useEffect, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Play } from "lucide-react";

type CursorState = "default" | "pointer" | "play" | "text" | "clicking";
type CursorTone = "violet" | "cyan" | "amber";

const TONE_COLOR: Record<CursorTone, string> = {
  violet: "#A78BFA",
  cyan: "#22D3EE",
  amber: "#FBB249",
};

/** Pick a contrasting accent for the local background tone. */
const contrastFor = (tone: CursorTone): CursorTone => {
  if (tone === "violet") return "cyan";
  if (tone === "cyan") return "violet";
  return "violet"; // amber → violet
};

const CustomCursor = () => {
  const [cursorState, setCursorState] = useState<CursorState>("default");
  const [isClicking, setIsClicking] = useState(false);
  const [tone, setTone] = useState<CursorTone>("cyan");

  // Dot position — direct, no lag
  const dotX = useMotionValue(0);
  const dotY = useMotionValue(0);

  // Ring position — springy lag
  const ringX = useSpring(0, { stiffness: 150, damping: 20 });
  const ringY = useSpring(0, { stiffness: 150, damping: 20 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    dotX.set(e.clientX);
    dotY.set(e.clientY);
    ringX.set(e.clientX);
    ringY.set(e.clientY);
  }, [dotX, dotY, ringX, ringY]);

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const cursorEl = target.closest("[data-cursor]");
    if (cursorEl) {
      const val = cursorEl.getAttribute("data-cursor") as CursorState;
      setCursorState(val);
    } else {
      setCursorState("default");
    }

    // Walk up looking for a section that declares its dominant tone.
    const toneEl = target.closest("[data-cursor-bg]");
    const localTone = (toneEl?.getAttribute("data-cursor-bg") as CursorTone) || "violet";
    setTone(contrastFor(localTone));
  }, []);

  const handleMouseDown = useCallback(() => setIsClicking(true), []);
  const handleMouseUp = useCallback(() => setIsClicking(false), []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseOver, handleMouseDown, handleMouseUp]);

  const active = isClicking ? "clicking" : cursorState;

  // Ring size/style per state
  const ringSize = active === "clicking" ? 24 : active === "pointer" ? 48 : active === "play" ? 56 : active === "text" ? 4 : 32;
  const ringOpacity = active === "text" ? 0.4 : active === "default" ? 0.6 : 1;
  // White on difference blend = inverts the background color underneath,
  // guaranteeing contrast against violet, amber, dark, or light areas.
  const accent = TONE_COLOR[tone];
  const ringBg = active === "pointer" ? `${accent}40` : "transparent";
  const ringBorder = `1.5px solid ${accent}`;

  // Dot style per state
  const dotW = active === "text" ? 2 : active === "play" ? 0 : active === "pointer" ? 4 : 6;
  const dotH = active === "text" ? 20 : active === "play" ? 0 : active === "pointer" ? 4 : 6;
  const dotRadius = active === "text" ? "1px" : "50%";
  const dotOpacity = active === "play" ? 0 : 1;

  return (
    <>
      {/* Dot */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: dotX,
          y: dotY,
          pointerEvents: "none",
          zIndex: 9999,
        }}
      >
        <motion.div
          animate={{ width: dotW, height: dotH, borderRadius: dotRadius, opacity: dotOpacity }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{
            background: accent,
            transform: "translate(-50%, -50%)",
            transition: "background 0.25s ease",
          }}
        />
      </motion.div>

      {/* Ring */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: ringX,
          y: ringY,
          pointerEvents: "none",
          zIndex: 9999,
        }}
      >
        <motion.div
          animate={{
            width: ringSize,
            height: ringSize,
            opacity: ringOpacity,
            background: ringBg,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{
            border: ringBorder,
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "border-color 0.25s ease",
          }}
        >
          {active === "play" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <Play size={16} color={accent} fill={accent} />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

export default CustomCursor;
