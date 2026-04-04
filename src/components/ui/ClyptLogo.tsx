import { motion } from "framer-motion";
import { useState } from "react";
import { ClyptMark } from "./ClyptMark";

type LogoSize = "sm" | "md" | "lg";

const sizeConfig = {
  sm: { markSize: 14, textClass: "text-sm" },
  md: { markSize: 18, textClass: "text-base" },
  lg: { markSize: 24, textClass: "text-xl" },
};

interface ClyptLogoProps {
  size?: LogoSize;
  defaultExpanded?: boolean;
  className?: string;
}

export const ClyptLogo = ({
  size = "md",
  defaultExpanded = false,
  className,
}: ClyptLogoProps) => {
  const [hovered, setHovered] = useState(false);
  const expanded = defaultExpanded || hovered;
  const { markSize, textClass } = sizeConfig[size];

  return (
    <motion.div
      className={`flex items-center cursor-pointer select-none ${className ?? ""}`}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <ClyptMark size={markSize} color="#A78BFA" />
      <div style={{ overflow: "hidden" }}>
        <motion.span
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "#FFFFFF",
            display: "inline-block",
          }}
          className={textClass}
          initial={{ x: -10, opacity: 0 }}
          animate={
            expanded
              ? { x: 0, opacity: 1 }
              : { x: -10, opacity: 0 }
          }
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          lypt
        </motion.span>
      </div>
    </motion.div>
  );
};

export default ClyptLogo;
