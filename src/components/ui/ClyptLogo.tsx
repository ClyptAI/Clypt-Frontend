import { motion } from "framer-motion";
import { useState } from "react";

type LogoSize = "sm" | "md" | "lg";

const sizeMap: Record<LogoSize, number> = {
  sm: 14,
  md: 20,
  lg: 28,
};

const VIEWBOX_W = 65;
const VIEWBOX_H = 20;
const MARK_W = 14;

interface ClyptLogoProps {
  size?: LogoSize;
  defaultExpanded?: boolean;
  className?: string;
}

const S = "#A78BFA";
const SW = 2;
const R = 2.5;

const easeIn = [0.22, 1, 0.36, 1] as const;
const easeOut = [0.4, 0, 1, 0.6] as const;

const Node = ({ cx, cy, expanded, dIn, dOut }: { cx: number; cy: number; expanded: boolean; dIn: number; dOut: number }) => (
  <motion.circle
    cx={cx} cy={cy} r={R} fill={S}
    initial={{ scale: 0 }}
    animate={{ scale: expanded ? 1 : 0 }}
    transition={{ duration: 0.08, delay: expanded ? dIn : dOut }}
    style={{ transformOrigin: `${cx}px ${cy}px` }}
  />
);

const Edge = ({ d, expanded, dIn, dOut, dur = 0.12 }: { d: string; expanded: boolean; dIn: number; dOut: number; dur?: number }) => (
  <motion.path
    d={d} stroke={S} strokeWidth={SW} strokeLinecap="round" fill="none"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: expanded ? 1 : 0 }}
    transition={{ duration: dur, delay: expanded ? dIn : dOut, ease: expanded ? easeIn : easeOut }}
  />
);

export const ClyptLogo = ({ size = "md", defaultExpanded = false, className }: ClyptLogoProps) => {
  const [hovered, setHovered] = useState(false);
  const expanded = defaultExpanded || hovered;

  const displayH = sizeMap[size];
  const scale = displayH / VIEWBOX_H;
  const fullW = VIEWBOX_W * scale;
  const compactW = MARK_W * scale;

  return (
    <motion.div
      className={`cursor-pointer select-none overflow-hidden ${className ?? ""}`}
      style={{ height: displayH }}
      animate={{ width: expanded ? fullW : compactW }}
      transition={{ duration: expanded ? 0.9 : 0.4, ease: expanded ? easeIn : easeOut }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <svg width={fullW} height={displayH} viewBox="0 0 65 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", overflow: "visible" }}>
        {/* C mark — permanent */}
        <path d="M 10 1 L 2 10" stroke={S} strokeWidth={SW} strokeLinecap="round" />
        <path d="M 2 10 L 10 19" stroke={S} strokeWidth={SW} strokeLinecap="round" />
        <circle cx={10} cy={1} r={R} fill={S} />
        <circle cx={2} cy={10} r={R} fill={S} />
        <circle cx={10} cy={19} r={R} fill={S} />

        {/* Bridge */}
        <Edge d="M 10 1 L 21 2" expanded={expanded} dIn={0} dOut={0.35} dur={0.15} />

        {/* l */}
        <Node cx={21} cy={2} expanded={expanded} dIn={0.10} dOut={0.32} />
        <Edge d="M 21 2 L 21 14" expanded={expanded} dIn={0.15} dOut={0.30} />
        <Node cx={21} cy={14} expanded={expanded} dIn={0.25} dOut={0.28} />

        {/* y */}
        <Node cx={27} cy={2} expanded={expanded} dIn={0.27} dOut={0.24} />
        <Node cx={35} cy={2} expanded={expanded} dIn={0.27} dOut={0.24} />
        <Edge d="M 27 2 L 31 9" expanded={expanded} dIn={0.29} dOut={0.22} dur={0.13} />
        <Edge d="M 35 2 L 31 9" expanded={expanded} dIn={0.29} dOut={0.22} dur={0.13} />
        <Node cx={31} cy={9} expanded={expanded} dIn={0.40} dOut={0.19} />
        <Edge d="M 31 9 L 31 19" expanded={expanded} dIn={0.42} dOut={0.17} />
        <Node cx={31} cy={19} expanded={expanded} dIn={0.52} dOut={0.14} />

        {/* p */}
        <Node cx={40} cy={2} expanded={expanded} dIn={0.54} dOut={0.12} />
        <Edge d="M 40 2 L 40 19" expanded={expanded} dIn={0.56} dOut={0.10} />
        <Edge d="M 40 2 L 47 2" expanded={expanded} dIn={0.56} dOut={0.10} dur={0.10} />
        <Node cx={40} cy={19} expanded={expanded} dIn={0.64} dOut={0.09} />
        <Node cx={47} cy={2} expanded={expanded} dIn={0.64} dOut={0.09} />
        <Edge d="M 47 2 L 47 9" expanded={expanded} dIn={0.66} dOut={0.07} dur={0.09} />
        <Node cx={47} cy={9} expanded={expanded} dIn={0.74} dOut={0.06} />
        <Edge d="M 47 9 L 40 9" expanded={expanded} dIn={0.75} dOut={0.05} dur={0.09} />
        <Node cx={40} cy={9} expanded={expanded} dIn={0.82} dOut={0.04} />

        {/* t */}
        <Node cx={56} cy={1} expanded={expanded} dIn={0.84} dOut={0.02} />
        <Edge d="M 56 1 L 56 14" expanded={expanded} dIn={0.85} dOut={0.01} />
        <Edge d="M 51 6 L 62 6" expanded={expanded} dIn={0.85} dOut={0.01} />
        <Node cx={51} cy={6} expanded={expanded} dIn={0.95} dOut={0} />
        <Node cx={62} cy={6} expanded={expanded} dIn={0.95} dOut={0} />
        <Node cx={56} cy={14} expanded={expanded} dIn={0.95} dOut={0} />
      </svg>
    </motion.div>
  );
};

export default ClyptLogo;
