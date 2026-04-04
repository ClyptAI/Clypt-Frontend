import ClyptMark from "./ClyptMark";

const sizeConfig = {
  sm: { markSize: 18, fontSize: 16, gap: 9 },
  md: { markSize: 22, fontSize: 20, gap: 10 },
  lg: { markSize: 32, fontSize: 28, gap: 14 },
};

interface ClyptLogoProps {
  size?: "sm" | "md" | "lg";
  markOnly?: boolean;
  wordmarkColor?: string;
  topColor?: string;
  bottomColor?: string;
  className?: string;
}

const ClyptLogo = ({
  size = "sm",
  markOnly = false,
  wordmarkColor = "var(--color-text-primary)",
  topColor,
  bottomColor,
  className,
}: ClyptLogoProps) => {
  const config = sizeConfig[size];

  return (
    <div
      className={className}
      style={{ display: "flex", alignItems: "center", gap: config.gap }}
    >
      <ClyptMark size={config.markSize} topColor={topColor} bottomColor={bottomColor} />
      {!markOnly && (
        <span
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 700,
            fontSize: config.fontSize,
            letterSpacing: "-0.03em",
            color: wordmarkColor,
            lineHeight: 1,
          }}
        >
          clypt
        </span>
      )}
    </div>
  );
};

export default ClyptLogo;
