import { ClyptAnimatedMark } from "@/components/app/ClyptAnimatedMark";

type LogoSize = "sm" | "md" | "lg" | "xl"

// mark px, font size px, gap px — mark is the clear focus
const sizeMap: Record<LogoSize, { mark: number; fontSize: number; gap: number }> = {
  sm: { mark: 38, fontSize: 15, gap: 6  },
  md: { mark: 52, fontSize: 20, gap: 8  },
  lg: { mark: 70, fontSize: 27, gap: 9  },
  xl: { mark: 110, fontSize: 46, gap: 14 },
}

interface ClyptLogoProps {
  size?: LogoSize
  /** Play the intro draw animation. Only pass true on the landing page Navbar. */
  animate?: boolean
  defaultExpanded?: boolean
  className?: string
}

export const ClyptLogo = ({
  size = "md",
  animate = false,
  className,
}: ClyptLogoProps) => {
  const { mark, fontSize, gap } = sizeMap[size]

  return (
    <div
      className={`select-none flex items-center flex-shrink-0 ${className ?? ""}`}
      style={{ gap }}
    >
      <ClyptAnimatedMark size={mark} animate={animate} color="#A78BFA" />
      <span
        style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 700,
          fontSize,
          letterSpacing: "-0.03em",
          color: "#A78BFA",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        clypt
      </span>
    </div>
  )
}

export default ClyptLogo
