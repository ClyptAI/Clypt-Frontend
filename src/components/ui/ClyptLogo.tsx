import { ClyptAnimatedMark } from "@/components/app/ClyptAnimatedMark";

type LogoSize = "sm" | "md" | "lg" | "xl"

// trim: negative right margin that eats into the SVG's built-in whitespace,
// pulling the wordmark closer to the visible mark content.
const sizeMap: Record<LogoSize, { mark: number; fontSize: number; gap: number; trim: number }> = {
  sm: { mark: 58,  fontSize: 15, gap: 2, trim: 15 },
  md: { mark: 80,  fontSize: 20, gap: 2, trim: 20 },
  lg: { mark: 108, fontSize: 27, gap: 2, trim: 28 },
  xl: { mark: 180, fontSize: 46, gap: 3, trim: 50 },
}

interface ClyptLogoProps {
  size?: LogoSize
  animate?: boolean
  defaultExpanded?: boolean
  className?: string
}

export const ClyptLogo = ({
  size = "md",
  animate = false,
  className,
}: ClyptLogoProps) => {
  const { mark, fontSize, gap, trim } = sizeMap[size]

  return (
    <div
      className={`select-none flex items-center flex-shrink-0 ${className ?? ""}`}
      style={{ gap }}
    >
      <div style={{ marginRight: -trim }}>
        <ClyptAnimatedMark size={mark} animate={animate} />
      </div>
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
