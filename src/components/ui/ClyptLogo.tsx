import { motion } from "framer-motion"
import { useState } from "react"

type LogoSize = "sm" | "md" | "lg"

const sizeMap: Record<LogoSize, number> = {
  sm: 14,
  md: 20,
  lg: 28,
}

const VIEWBOX_W = 76
const VIEWBOX_H = 24
const MARK_W = 16

interface ClyptLogoProps {
  size?: LogoSize
  defaultExpanded?: boolean
  className?: string
}

export const ClyptLogo = ({
  size = "md",
  defaultExpanded = false,
  className,
}: ClyptLogoProps) => {
  const [hovered, setHovered] = useState(false)
  const expanded = defaultExpanded || hovered

  const displayH = sizeMap[size]
  const scale    = displayH / VIEWBOX_H
  const fullW    = VIEWBOX_W * scale
  const compactW = MARK_W    * scale

  const expandEase   = [0.22, 1, 0.36, 1] as const
  const collapseEase = [0.4, 0, 1, 0.6]  as const

  const edge = (expandDelay: number, collapseDelay: number) => ({
    initial:    { pathLength: 0 },
    animate:    { pathLength: expanded ? 1 : 0 },
    transition: {
      duration: expanded ? 0.14 : 0.09,
      delay:    expanded ? expandDelay : collapseDelay,
      ease:     expanded ? expandEase  : collapseEase,
    },
  })

  const node = (expandDelay: number, collapseDelay: number) => ({
    initial:    { scale: 0 },
    animate:    { scale: expanded ? 1 : 0 },
    transition: {
      duration: 0.07,
      delay:    expanded ? expandDelay : collapseDelay,
      ease:     expanded ? expandEase  : collapseEase,
    },
  })

  const N  = "#A78BFA"
  const SW = 2
  const R  = 3

  return (
    <motion.div
      className={`cursor-pointer select-none overflow-hidden ${className ?? ""}`}
      style={{ height: displayH }}
      animate={{ width: expanded ? fullW : compactW }}
      transition={{
        duration: expanded ? 0.95 : 0.4,
        ease: expanded ? expandEase : collapseEase,
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <svg
        width={fullW}
        height={displayH}
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", overflow: "visible" }}
      >

        {/* C MARK — always fully visible */}
        <path
          d="M 13 2 Q 2 2 2 12"
          stroke={N} strokeWidth={SW} strokeLinecap="round"
        />
        <path
          d="M 2 12 Q 2 22 13 22"
          stroke={N} strokeWidth={SW} strokeLinecap="round"
        />
        <circle cx={13} cy={2}  r={R} fill={N} />
        <circle cx={2}  cy={12} r={R} fill={N} />
        <circle cx={13} cy={22} r={R} fill={N} />

        {/* BRIDGE EDGE */}
        <motion.path
          d="M 13 2 L 21 3"
          stroke={N} strokeWidth={SW} strokeLinecap="round"
          {...edge(0.00, 0.36)}
        />

        {/* LETTER l */}
        <motion.circle cx={21} cy={3}  r={R} fill={N}
          style={{ transformOrigin: "21px 3px" }}
          {...node(0.12, 0.32)}
        />
        <motion.path
          d="M 21 3 L 21 17"
          stroke={N} strokeWidth={SW} strokeLinecap="round"
          {...edge(0.15, 0.29)}
        />
        <motion.circle cx={21} cy={17} r={R} fill={N}
          style={{ transformOrigin: "21px 17px" }}
          {...node(0.27, 0.27)}
        />

        {/* LETTER y */}
        <motion.circle cx={28} cy={3}  r={R} fill={N}
          style={{ transformOrigin: "28px 3px" }}
          {...node(0.30, 0.23)}
        />
        <motion.circle cx={38} cy={3}  r={R} fill={N}
          style={{ transformOrigin: "38px 3px" }}
          {...node(0.30, 0.23)}
        />
        <motion.path
          d="M 28 3 L 33 11"
          stroke={N} strokeWidth={SW} strokeLinecap="round"
          {...edge(0.32, 0.20)}
        />
        <motion.path
          d="M 38 3 L 33 11"
          stroke={N} strokeWidth={SW} strokeLinecap="round"
          {...edge(0.32, 0.20)}
        />
        <motion.circle cx={33} cy={11} r={R} fill={N}
          style={{ transformOrigin: "33px 11px" }}
          {...node(0.44, 0.17)}
        />
        <motion.path
          d="M 33 11 L 33 22"
          stroke={N} strokeWidth={SW} strokeLinecap="round"
          {...edge(0.46, 0.15)}
        />
        <motion.circle cx={33} cy={22} r={R} fill={N}
          style={{ transformOrigin: "33px 22px" }}
          {...node(0.58, 0.12)}
        />

        {/* LETTER p */}
        <motion.circle cx={43} cy={3}  r={R} fill={N}
          style={{ transformOrigin: "43px 3px" }}
          {...node(0.60, 0.10)}
        />
        <motion.path
          d="M 43 3 L 43 22"
          stroke={N} strokeWidth={SW} strokeLinecap="round"
          {...edge(0.62, 0.08)}
        />
        <motion.path
          d="M 43 3 C 57 3 57 14 43 14"
          stroke={N} strokeWidth={SW} strokeLinecap="round"
          {...edge(0.62, 0.08)}
        />
        <motion.circle cx={43} cy={22} r={R} fill={N}
          style={{ transformOrigin: "43px 22px" }}
          {...node(0.72, 0.06)}
        />
        <motion.circle cx={52} cy={8}  r={R} fill={N}
          style={{ transformOrigin: "52px 8px" }}
          {...node(0.72, 0.06)}
        />
        <motion.circle cx={43} cy={14} r={R} fill={N}
          style={{ transformOrigin: "43px 14px" }}
          {...node(0.76, 0.05)}
        />

        {/* LETTER t */}
        <motion.circle cx={63} cy={2}  r={R} fill={N}
          style={{ transformOrigin: "63px 2px" }}
          {...node(0.80, 0.03)}
        />
        <motion.path
          d="M 63 2 L 63 17"
          stroke={N} strokeWidth={SW} strokeLinecap="round"
          {...edge(0.82, 0.02)}
        />
        <motion.path
          d="M 57 8 L 71 8"
          stroke={N} strokeWidth={SW} strokeLinecap="round"
          {...edge(0.82, 0.02)}
        />
        <motion.circle cx={57} cy={8}  r={R} fill={N}
          style={{ transformOrigin: "57px 8px" }}
          {...node(0.93, 0.01)}
        />
        <motion.circle cx={71} cy={8}  r={R} fill={N}
          style={{ transformOrigin: "71px 8px" }}
          {...node(0.93, 0.01)}
        />
        <motion.circle cx={63} cy={17} r={R} fill={N}
          style={{ transformOrigin: "63px 17px" }}
          {...node(0.93, 0.00)}
        />

      </svg>
    </motion.div>
  )
}

export default ClyptLogo
