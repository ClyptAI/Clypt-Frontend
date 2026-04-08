type LogoSize = "sm" | "md" | "lg"

const sizeMap: Record<LogoSize, number> = {
  sm: 14,
  md: 20,
  lg: 28,
}

const VIEWBOX_W = 76
const VIEWBOX_H = 24

interface ClyptLogoProps {
  size?: LogoSize
  defaultExpanded?: boolean   // kept for API compat, ignored
  className?: string
}

export const ClyptLogo = ({ size = "md", className }: ClyptLogoProps) => {
  const displayH = sizeMap[size]
  const scale    = displayH / VIEWBOX_H
  const displayW = VIEWBOX_W * scale

  const N  = "#A78BFA"
  const SW = 2
  const R  = 3

  return (
    <div
      className={`select-none ${className ?? ""}`}
      style={{ width: displayW, height: displayH, flexShrink: 0 }}
    >
      <svg
        width={displayW}
        height={displayH}
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", overflow: "visible" }}
      >
        {/* ── C ── */}
        <path d="M 13 2 Q 2 2 2 12"   stroke={N} strokeWidth={SW} strokeLinecap="round" />
        <path d="M 2 12 Q 2 22 13 22" stroke={N} strokeWidth={SW} strokeLinecap="round" />
        <circle cx={13} cy={2}  r={R} fill={N} />
        <circle cx={2}  cy={12} r={R} fill={N} />
        <circle cx={13} cy={22} r={R} fill={N} />

        {/* bridge C → L */}
        <path d="M 13 2 L 21 3" stroke={N} strokeWidth={SW} strokeLinecap="round" />

        {/* ── L ── */}
        <circle cx={21} cy={3}  r={R} fill={N} />
        <path   d="M 21 3 L 21 17" stroke={N} strokeWidth={SW} strokeLinecap="round" />
        <circle cx={21} cy={17} r={R} fill={N} />

        {/* ── Y ── */}
        <circle cx={28} cy={3}  r={R} fill={N} />
        <circle cx={38} cy={3}  r={R} fill={N} />
        <path   d="M 28 3 L 33 11" stroke={N} strokeWidth={SW} strokeLinecap="round" />
        <path   d="M 38 3 L 33 11" stroke={N} strokeWidth={SW} strokeLinecap="round" />
        <circle cx={33} cy={11} r={R} fill={N} />
        <path   d="M 33 11 L 33 22" stroke={N} strokeWidth={SW} strokeLinecap="round" />
        <circle cx={33} cy={22} r={R} fill={N} />

        {/* ── P ── */}
        <circle cx={43} cy={3}  r={R} fill={N} />
        <path   d="M 43 3 L 43 22" stroke={N} strokeWidth={SW} strokeLinecap="round" />
        <path   d="M 43 3 C 57 3 57 14 43 14" stroke={N} strokeWidth={SW} strokeLinecap="round" />
        <circle cx={43} cy={22} r={R} fill={N} />
        <circle cx={52} cy={8}  r={R} fill={N} />
        <circle cx={43} cy={14} r={R} fill={N} />

        {/* ── T ── */}
        <circle cx={63} cy={2}  r={R} fill={N} />
        <path   d="M 63 2 L 63 17"  stroke={N} strokeWidth={SW} strokeLinecap="round" />
        <path   d="M 57 8 L 71 8"   stroke={N} strokeWidth={SW} strokeLinecap="round" />
        <circle cx={57} cy={8}  r={R} fill={N} />
        <circle cx={71} cy={8}  r={R} fill={N} />
        <circle cx={63} cy={17} r={R} fill={N} />
      </svg>
    </div>
  )
}

export default ClyptLogo
