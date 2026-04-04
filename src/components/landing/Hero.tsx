import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useSpring } from "framer-motion";

/* ── Waveform path generators ── */
const generateWavePath = (amplitude: number, frequency: number, phase: number, yOffset: number) => {
  const width = 1400;
  const points: string[] = [];
  for (let x = 0; x <= width; x += 2) {
    const y = yOffset + amplitude * Math.sin((x / width) * Math.PI * frequency + phase);
    points.push(`${x === 0 ? "M" : "L"} ${x} ${y}`);
  }
  return points.join(" ");
};

const wave1 = generateWavePath(24, 3, 0, 60);
const wave2 = generateWavePath(14, 3, Math.PI / 3, 60);
const wave3 = generateWavePath(7, 5, 1.5, 60);

/* ── Animation variants ── */
const wordVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const lineContainer = (delayChildren: number) => ({
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren } },
});

/* ── Floating clip card data ── */
const clipCards = [
  {
    gradient: "linear-gradient(160deg, #1a1035 0%, #0d0d14 40%, #1a1520 100%)",
    time: "0:42",
    nodeColor: "#E879F9",
    nodeLabel: "setup",
    position: { left: "4%", top: "12%" } as const,
    rotate: -8,
    floatY: [-12, 0, -12],
    floatDur: 6,
    floatDelay: 0,
    entranceDelay: 0.8,
    parallaxFactor: 3,
  },
  {
    gradient: "linear-gradient(160deg, #0a1a1a 0%, #0d1410 40%, #0a0909 100%)",
    time: "1:15",
    nodeColor: "#FB7185",
    nodeLabel: "react",
    position: { right: "5%", top: "8%" } as const,
    rotate: 6,
    floatY: [-16, 0, -16],
    floatDur: 7,
    floatDelay: 1,
    entranceDelay: 1.0,
    parallaxFactor: -2,
  },
  {
    gradient: "linear-gradient(160deg, #1a1008 0%, #1a0d0d 40%, #100a14 100%)",
    time: "2:33",
    nodeColor: "#A78BFA",
    nodeLabel: "claim",
    position: { left: "8%", bottom: "10%" } as const,
    rotate: -4,
    floatY: [-10, 0, -10],
    floatDur: 5.5,
    floatDelay: 2,
    entranceDelay: 1.2,
    parallaxFactor: 1.5,
  },
];

/* ── ClipCard component ── */
const ClipCard = ({
  card,
  mouseX,
}: {
  card: (typeof clipCards)[0];
  mouseX: ReturnType<typeof useSpring>;
}) => {
  return (
    <motion.div
      data-cursor="play"
      className="absolute"
      style={{
        ...card.position,
        width: 120,
        aspectRatio: "9/16",
        zIndex: 0,
        pointerEvents: "auto",
      }}
      initial={{ opacity: 0, y: 40, rotate: card.rotate }}
      animate={{ opacity: 1, y: 0, rotate: card.rotate }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: card.entranceDelay }}
      whileHover={{ scale: 1.04, borderColor: "rgba(167,139,250,0.4)" }}
    >
      {/* Float wrapper */}
      <motion.div
        animate={{ y: card.floatY }}
        transition={{ duration: card.floatDur, ease: "easeInOut", repeat: Infinity, delay: card.floatDelay }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Parallax wrapper */}
        <motion.div
          style={{ x: useSpring(useMotionValue(0), { stiffness: 60, damping: 20 }), width: "100%", height: "100%" }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: card.gradient,
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
              position: "relative",
            }}
          >
            {/* Timestamp chip */}
            <div
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                background: "rgba(0,0,0,0.5)",
                padding: "2px 5px",
                borderRadius: 3,
                fontSize: 9,
                color: "var(--color-text-muted)",
                fontFamily: "'Geist Mono', monospace",
              }}
            >
              {card.time}
            </div>

            {/* Node type chip */}
            <div
              style={{
                position: "absolute",
                bottom: 36,
                left: 8,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: card.nodeColor }} />
              <span
                style={{
                  fontSize: 9,
                  color: "var(--color-text-muted)",
                  fontFamily: "'Geist Mono', monospace",
                }}
              >
                {card.nodeLabel}
              </span>
            </div>

            {/* Fake caption / transcript bars */}
            <div style={{ position: "absolute", bottom: 8, left: 8, right: 8, display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ width: "80%", height: 2, background: "rgba(255,255,255,0.12)", borderRadius: 2 }} />
              <div style={{ width: "50%", height: 2, background: "rgba(255,255,255,0.12)", borderRadius: 2 }} />
              <div style={{ width: "60%", height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 2 }} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

/* ── Hero ── */
const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      mouseX.set((e.clientX - centerX) / rect.width);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX]);

  const line1Words = ["Break", "the", "video."];
  const line2Words = ["Keep", "the", "moment."];

  return (
    <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* ── Ambient glow ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ width: 900, height: 600, borderRadius: "50%", top: "50%", left: "50%", marginLeft: -450, marginTop: -300, zIndex: 0 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
      >
        <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(167,139,250,0.09) 0%, transparent 70%)" }} />
      </motion.div>

      <motion.div
        className="absolute pointer-events-none"
        style={{ width: 500, height: 400, borderRadius: "50%", top: "50%", left: "50%", marginLeft: -250 + 120, marginTop: -200 + 80, zIndex: 0 }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: [1, 1.08, 1] }}
        transition={{ opacity: { duration: 1.8, ease: "easeOut", delay: 0.5 }, scale: { duration: 8, ease: "easeInOut", repeat: Infinity, delay: 0.5 } }}
      >
        <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(251,178,73,0.05) 0%, transparent 70%)" }} />
      </motion.div>

      {/* ── Enhanced waveform ── */}
      <svg
        className="absolute top-1/2 left-0 right-0 w-full pointer-events-none"
        style={{ transform: "translateY(-50%)", opacity: 0.25, zIndex: 0 }}
        viewBox="0 0 1400 120"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="waveGrad1e" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(244,241,238,0.15)" />
            <stop offset="49.9%" stopColor="rgba(244,241,238,0.15)" />
            <stop offset="50.1%" stopColor="var(--color-violet)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--color-violet)" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        <motion.g
          animate={{ y: [0, 10, 0, -10, 0] }}
          transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
        >
          <path d={wave1} stroke="url(#waveGrad1e)" strokeWidth="1.5" />
        </motion.g>
        <motion.g
          animate={{ y: [0, 6, 0, -6, 0] }}
          transition={{ duration: 9, ease: "easeInOut", repeat: Infinity, delay: 1 }}
        >
          <path d={wave2} stroke="rgba(167,139,250,0.08)" strokeWidth="1" />
        </motion.g>
        <motion.g
          animate={{ y: [0, 4, 0, -4, 0] }}
          transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, delay: 2 }}
        >
          <path d={wave3} stroke="rgba(251,178,73,0.06)" strokeWidth="0.5" />
        </motion.g>

        {/* Cut mark */}
        <line x1="700" y1="20" x2="700" y2="100" stroke="var(--color-violet)" strokeWidth="1.5" opacity="0.7" />
        <rect x="697" y="57" width="6" height="6" fill="var(--color-violet)" opacity="0.8" transform="rotate(45, 700, 60)" />
      </svg>

      {/* ── Floating clip cards ── */}
      {clipCards.map((card, i) => (
        <ClipCard key={i} card={card} mouseX={smoothMouseX} />
      ))}

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center text-center" data-cursor="text">
        {/* Line 1 */}
        <motion.div
          className="flex gap-[0.3em]"
          variants={lineContainer(0.3)}
          initial="hidden"
          animate="visible"
        >
          {line1Words.map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              className="font-display italic leading-none"
              style={{ fontSize: "clamp(60px, 8vw, 96px)", color: "var(--color-text-primary)" }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>

        {/* Line 2 */}
        <motion.div
          className="flex gap-[0.3em] mt-1"
          variants={lineContainer(0.6)}
          initial="hidden"
          animate="visible"
        >
          {line2Words.map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              className="font-display italic leading-none"
              style={{ fontSize: "clamp(60px, 8vw, 96px)", color: "var(--color-text-primary)" }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>

        {/* Subtext */}
        <motion.p
          className="font-sans font-normal text-lg max-w-[520px] mt-6"
          style={{ color: "var(--color-text-secondary)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 1.1 }}
        >
          Clypt finds and frames the clips that matter, using the semantic structure of your content.
        </motion.p>

        {/* CTA row */}
        <motion.div
          className="flex items-center gap-4 mt-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          data-cursor="pointer"
        >
          <Button variant="default" data-cursor="pointer">Get started free</Button>
          <a
            href="#demo"
            className="font-sans font-normal hover:underline transition-all"
            style={{ color: "var(--color-violet)" }}
            data-cursor="pointer"
          >
            See a demo →
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="mt-12 flex items-center gap-0 text-[13px]"
          style={{ color: "var(--color-text-muted)" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.6 }}
        >
          <span className="font-sans">Used by creators at</span>
          <span className="mx-2">·</span>
          <span className="font-heading font-medium">Nebula</span>
          <span className="mx-2">·</span>
          <span className="font-heading font-medium">Dropout</span>
          <span className="mx-2">·</span>
          <span className="font-heading font-medium">Corridor</span>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
