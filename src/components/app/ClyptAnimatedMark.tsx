import { useMemo } from "react";
import { motion } from "framer-motion";

const WAVEFORM_LAYERS = [
  {
    color: "#7C3AED",
    getHeight: (dx: number) => {
      const xLeft = 250 - dx;
      if (xLeft < 165) return 0;
      const t = (140 - Math.sqrt(Math.max(0, 19600 - 220 * (xLeft - 165)))) / 110;
      return 30 * t + 55 * t * t;
    },
  },
  {
    color: "#8B5CF6",
    getHeight: (dx: number) => {
      const xLeft = 250 - dx;
      if (xLeft < 185) return 0;
      const t = (110 - Math.sqrt(Math.max(0, 12100 - 180 * (xLeft - 185)))) / 90;
      return 20 * t + 45 * t * t;
    },
  },
  {
    color: "#A78BFA",
    getHeight: (dx: number) => {
      const xLeft = 250 - dx;
      if (xLeft < 205) return 0;
      const t = (80 - Math.sqrt(Math.max(0, 6400 - 140 * (xLeft - 205)))) / 70;
      return 10 * t + 35 * t * t;
    },
  },
  {
    color: "#C4B5FD",
    getHeight: (dx: number) => {
      const xLeft = 250 - dx;
      if (xLeft < 225) return 0;
      const t = (46 - Math.sqrt(Math.max(0, 2116 - 84 * (xLeft - 225)))) / 42;
      return 4 * t + 21 * t * t;
    },
  },
];

const BRACKET_EASE = [0.175, 0.885, 0.32, 1.1] as const;
const BAR_EASE = [0.175, 0.885, 0.32, 1.2] as const;

interface ClyptAnimatedMarkProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

export function ClyptAnimatedMark({
  size = 40,
  animate = true,
  className,
}: ClyptAnimatedMarkProps) {
  const staticBars = useMemo(() => {
    const result: React.ReactElement[] = [];
    for (let x = 162; x <= 338; x += 8) {
      const dx = Math.abs(x - 250);
      WAVEFORM_LAYERS.forEach((layer, i) => {
        const h = layer.getHeight(dx);
        if (h > 0.5) {
          result.push(
            <line
              key={`${x}-${i}`}
              x1={x}
              y1={250 - h}
              x2={x}
              y2={250 + h}
              stroke={layer.color}
              strokeWidth={4.8}
              strokeLinecap="round"
            />
          );
        }
      });
    }
    return result;
  }, []);

  const animatedBars = useMemo(() => {
    if (!animate) return null;
    const result: React.ReactElement[] = [];
    for (let x = 162; x <= 338; x += 8) {
      const dx = Math.abs(x - 250);
      const index = (x - 162) / 8;
      const staggerDelay = 1.6 + index * 0.04;
      WAVEFORM_LAYERS.forEach((layer, i) => {
        const h = layer.getHeight(dx);
        if (h > 0.5) {
          result.push(
            <motion.line
              key={`${x}-${i}`}
              x1={x}
              y1={250 - h}
              x2={x}
              y2={250 + h}
              stroke={layer.color}
              strokeWidth={4.8}
              strokeLinecap="round"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              style={{ transformOrigin: `${x}px 250px` }}
              transition={{
                delay: staggerDelay,
                duration: 0.4,
                ease: BAR_EASE as never,
              }}
            />
          );
        }
      });
    }
    return result;
  }, [animate]);

  if (!animate) {
    return (
      <div
        className={`select-none flex-shrink-0 ${className ?? ""}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 500 500"
          fill="none"
          style={{ display: "block" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            stroke="#F4F1EE"
            strokeWidth="8"
            fill="none"
            strokeLinecap="square"
            strokeLinejoin="miter"
          >
            <path d="M 160 210 L 160 160 L 210 160" />
            <path d="M 290 160 L 340 160 L 340 210" />
            <path d="M 340 290 L 340 340 L 290 340" />
            <path d="M 210 340 L 160 340 L 160 290" />
          </g>
          <g>{staticBars}</g>
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`select-none flex-shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 500 500"
        width={size}
        height={size}
        fill="none"
        style={{ display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Starting white square that radiates outwards */}
        <motion.rect
          x={236}
          y={236}
          width={28}
          height={28}
          fill="#F4F1EE"
          rx={4}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 1.2,
            times: [0, 0.3, 0.8, 1],
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "250px 250px" }}
        />

        {/* Viewfinder brackets */}
        <g
          stroke="#F4F1EE"
          strokeWidth="8"
          fill="none"
          strokeLinecap="square"
          strokeLinejoin="miter"
        >
          <motion.path
            d="M 160 210 L 160 160 L 210 160"
            initial={{ x: 90, y: 90, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{
              delay: 0.96,
              duration: 0.6,
              ease: BRACKET_EASE as never,
            }}
          />
          <motion.path
            d="M 290 160 L 340 160 L 340 210"
            initial={{ x: -90, y: 90, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{
              delay: 0.96,
              duration: 0.6,
              ease: BRACKET_EASE as never,
            }}
          />
          <motion.path
            d="M 340 290 L 340 340 L 290 340"
            initial={{ x: -90, y: -90, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{
              delay: 0.96,
              duration: 0.6,
              ease: BRACKET_EASE as never,
            }}
          />
          <motion.path
            d="M 210 340 L 160 340 L 160 290"
            initial={{ x: 90, y: -90, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{
              delay: 0.96,
              duration: 0.6,
              ease: BRACKET_EASE as never,
            }}
          />
        </g>

        {/* Sparkle waveform bars */}
        <g>{animatedBars}</g>
      </svg>
    </div>
  );
}

export default ClyptAnimatedMark;
