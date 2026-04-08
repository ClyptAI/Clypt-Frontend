type LogoSize = "sm" | "md" | "lg"

const sizeMap: Record<LogoSize, number> = {
  sm: 22,
  md: 32,
  lg: 46,
}

// Shared nodes
//  (32,  5) = C top        = L top       = Y left arm       (3-way)
//  (32, 31) = C bottom     = L corner                       (2-way)
//  (50, 31) = L foot end   = Y bottom                       (2-way)
//  (68,  5) = Y right arm  = P stem top  = T left crossbar  (3-way)
//  (86,  5) = P arc apex → T center      = T stem top       (edge connects them)
const VIEWBOX_W = 116
const VIEWBOX_H = 36

interface ClyptLogoProps {
  size?: LogoSize
  defaultExpanded?: boolean
  className?: string
}

export const ClyptLogo = ({ size = "md", className }: ClyptLogoProps) => {
  const displayH = sizeMap[size]
  const scale    = displayH / VIEWBOX_H
  const fullW    = VIEWBOX_W * scale

  const N  = "#A78BFA"
  const SW = 2.8
  const R  = 4

  return (
    <div
      className={`select-none ${className ?? ""}`}
      style={{ width: fullW, height: displayH, flexShrink: 0 }}
    >
      <svg
        width={fullW}
        height={displayH}
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        fill="none"
        overflow="visible"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        {/*
          ── C ── wide arc: opens at (32,5) and (32,31), apex at (4,18)
            top/bottom nodes SHARED with L's top and corner respectively
            No bridge line needed — C ends ARE L's corners
        */}
        <path d="M 32 5 Q 4 5 4 18"   stroke={N} strokeWidth={SW} strokeLinecap="round" />
        <path d="M 4 18 Q 4 31 32 31" stroke={N} strokeWidth={SW} strokeLinecap="round" />
        <circle cx={4}  cy={18} r={R} fill={N} />
        {/* (32,5) and (32,31) rendered under L below */}

        {/*
          ── L ── stem from (32,5) down to (32,31), foot to (50,31)
            (32, 5) shared with C top   + Y left arm
            (32,31) shared with C bottom
            (50,31) shared with Y bottom
        */}
        <circle cx={32} cy={5}  r={R} fill={N} />  {/* C-top / L-top / Y-left */}
        <circle cx={32} cy={31} r={R} fill={N} />  {/* C-bottom / L-corner */}
        {/* (50,31) rendered under Y below */}
        <path d="M 32 5 L 32 31"  stroke={N} strokeWidth={SW} strokeLinecap="round" />
        <path d="M 32 31 L 50 31" stroke={N} strokeWidth={SW} strokeLinecap="round" />

        {/*
          ── Y ── wide low-slope arms (Δx=18, Δy=12 → slope 0.67)
            left  (32, 5)  ← shared C-top / L-top
            right (68, 5)  ← shared P-top / T-left
            junc  (50,17)
            base  (50,31)  ← shared L-foot-end
        */}
        <circle cx={50} cy={17} r={R} fill={N} />
        <circle cx={50} cy={31} r={R} fill={N} />  {/* L-foot-end / Y-bottom */}
        {/* (68,5) rendered under P below */}
        <path d="M 32 5 L 50 17"  stroke={N} strokeWidth={SW} strokeLinecap="round" />
        <path d="M 68 5 L 50 17"  stroke={N} strokeWidth={SW} strokeLinecap="round" />
        <path d="M 50 17 L 50 31" stroke={N} strokeWidth={SW} strokeLinecap="round" />

        {/*
          ── P ── vertical stem with midpoint node; midpoint connects to T center
            top    (68, 5)  ← shared Y-right / T-left
            mid    (68,18)  → edge to T-center (86,5)
            bottom (68,31)
        */}
        <circle cx={68} cy={5}  r={R} fill={N} />  {/* Y-right / P-top / T-left */}
        <circle cx={68} cy={21} r={R} fill={N} />
        <circle cx={68} cy={31} r={R} fill={N} />
        {/* (88,5) rendered under T below */}
        <path d="M 68 5 L 68 31"  stroke={N} strokeWidth={SW} strokeLinecap="round" />
        <path d="M 68 21 L 88 5"  stroke={N} strokeWidth={SW} strokeLinecap="round" />

        {/*
          ── T ── asymmetric crossbar (left 18px, right 14px)
            left   (68, 5)  ← shared Y-right / P-top   [18px left arm]
            center (86, 5)  ← T stem, also P-apex landing point
            right  (100,5)                               [14px right arm]
            base   (86,31)
        */}
        <circle cx={88}  cy={5}  r={R} fill={N} />  {/* T-center / P-mid target */}
        <circle cx={108} cy={5}  r={R} fill={N} />
        <circle cx={88}  cy={31} r={R} fill={N} />
        <path d="M 68 5 L 108 5"  stroke={N} strokeWidth={SW} strokeLinecap="round" />
        <path d="M 88 5 L 88 31"  stroke={N} strokeWidth={SW} strokeLinecap="round" />
      </svg>
    </div>
  )
}

export default ClyptLogo
