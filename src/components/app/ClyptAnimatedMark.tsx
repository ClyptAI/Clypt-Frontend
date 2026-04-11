import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ClyptAnimatedMarkProps {
  size?: number;
  animate?: boolean;
  color?: string;
  className?: string;
}

export function ClyptAnimatedMark({
  size = 40,
  animate = true,
  color = "#A78BFA",
  className,
}: ClyptAnimatedMarkProps) {
  const [animationStarted, setAnimationStarted] = useState(false);
  const [showCDots, setShowCDots] = useState(false);
  const [showScissorDots, setShowScissorDots] = useState(false);

  useEffect(() => {
    if (!animate) return;
    // Gate 1: SVG mount (matches original exactly)
    const t0 = setTimeout(() => setAnimationStarted(true), 300);
    // C arcs: delay 1s + duration 1.2s = done at 2.2s after SVG mount
    // SVG mounts at 300ms, so 300 + 2100 = 2400ms from component mount
    const t1 = setTimeout(() => setShowCDots(true), 300 + 2100);
    // Scissor outward arcs: delay 3.4s + duration 1.2s = done at 4.6s after SVG mount
    const t2 = setTimeout(() => setShowScissorDots(true), 300 + 4500);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [animate]);

  const STROKE_WIDTH = 12;

  // ── Static (settled) version ─────────────────────────────────────────────
  if (!animate) {
    const cOutwardTop    = "M 0 0 A 100 100 0 0 1 100 -100";
    const cOutwardBottom = "M 0 0 A 100 100 0 0 0 100 100";
    const petalInwardTop    = "M 100 -100 A 100 100 0 0 1 0 0";
    const petalInwardBottom = "M 100 100 A 100 100 0 0 0 0 0";
    const scissorOutwardTop    = "M 0 0 A 150 150 0 0 0 -120 -60";
    const scissorOutwardBottom = "M 0 0 A 150 150 0 0 1 -120 60";
    const scissorInwardTop    = "M -120 -60 A 150 150 0 0 0 0 0";
    const scissorInwardBottom = "M -120 60 A 150 150 0 0 1 0 0";

    return (
      <div
        className={`select-none flex-shrink-0 ${className ?? ""}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="-200 -200 400 400"
          fill="none"
          style={{ display: "block", transform: "rotate(45deg)" }}
        >
          {[cOutwardTop, cOutwardBottom, petalInwardTop, petalInwardBottom,
            scissorOutwardTop, scissorOutwardBottom, scissorInwardTop, scissorInwardBottom
          ].map((d, i) => (
            <path key={i} d={d} fill="transparent"
              stroke={color} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
          ))}
          <circle cx="0"    cy="0"    r="18" fill={color} />
          <circle cx="100"  cy="-100" r="14" fill={color} />
          <circle cx="100"  cy="100"  r="14" fill={color} />
          <circle cx="-120" cy="-60"  r="14" fill={color} />
          <circle cx="-120" cy="60"   r="14" fill={color} />
        </svg>
      </div>
    );
  }

  // ── Placeholder — nothing visible until animationStarted ─────────────────
  if (!animationStarted) {
    return (
      <div
        className={`select-none flex-shrink-0 ${className ?? ""}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // ── Animated version (exact copy of original, sized) ─────────────────────
  const cOutwardTop    = "M 0 0 A 100 100 0 0 1 100 -100";
  const cOutwardBottom = "M 0 0 A 100 100 0 0 0 100 100";
  const petalInwardTop    = "M 100 -100 A 100 100 0 0 1 0 0";
  const petalInwardBottom = "M 100 100 A 100 100 0 0 0 0 0";
  const scissorOutwardTop    = "M 0 0 A 150 150 0 0 0 -120 -60";
  const scissorOutwardBottom = "M 0 0 A 150 150 0 0 1 -120 60";
  const scissorInwardTop    = "M -120 -60 A 150 150 0 0 0 0 0";
  const scissorInwardBottom = "M -120 60 A 150 150 0 0 1 0 0";

  return (
    <div
      className={`select-none flex-shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <motion.svg
        viewBox="-200 -200 400 400"
        width={size}
        height={size}
        style={{ display: "block" }}
        initial={{ rotate: 0 }}
        animate={{ rotate: 45 }}
        transition={{
          rotate: { delay: 3.4, duration: 1.2, ease: "easeInOut" }
        }}
      >
        {/* Stage 2 & 3: The C & Petals */}
        <motion.path
          d={cOutwardTop}
          fill="transparent"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1, duration: 1.2, ease: "easeInOut" }}
        />
        <motion.path
          d={cOutwardBottom}
          fill="transparent"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1, duration: 1.2, ease: "easeInOut" }}
        />
        <motion.path
          d={petalInwardTop}
          fill="transparent"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 2.2, duration: 1.2, ease: "easeInOut" }}
        />
        <motion.path
          d={petalInwardBottom}
          fill="transparent"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 2.2, duration: 1.2, ease: "easeInOut" }}
        />

        {/* Stage 4 & 5: Scissor Blades */}
        <motion.path
          d={scissorOutwardTop}
          fill="transparent"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 3.4, duration: 1.2, ease: "easeInOut" }}
        />
        <motion.path
          d={scissorOutwardBottom}
          fill="transparent"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 3.4, duration: 1.2, ease: "easeInOut" }}
        />
        <motion.path
          d={scissorInwardTop}
          fill="transparent"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 4.6, duration: 1.2, ease: "easeInOut" }}
        />
        <motion.path
          d={scissorInwardBottom}
          fill="transparent"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 4.6, duration: 1.2, ease: "easeInOut" }}
        />

        {/* Nodes */}
        {/* Node 1: Center */}
        <motion.circle
          cx="0"
          cy="0"
          r="18"
          fill={color}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 1,
            scale: [0, 1.5, 1]
          }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        />

        {/* Node 2 & 3: C Endpoints — not in DOM until arcs complete */}
        {showCDots && <>
          <motion.circle cx="100" cy="-100" r="14" fill={color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          />
          <motion.circle cx="100" cy="100" r="14" fill={color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          />
        </>}

        {/* Node 4 & 5: Scissor Endpoints — not in DOM until arcs complete */}
        {showScissorDots && <>
          <motion.circle cx="-120" cy="-60" r="14" fill={color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          />
          <motion.circle cx="-120" cy="60" r="14" fill={color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          />
        </>}
      </motion.svg>
    </div>
  );
}

export default ClyptAnimatedMark;
