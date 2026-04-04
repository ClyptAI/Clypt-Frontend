import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { ArrowRight } from "lucide-react";
import WaveformBand from "./WaveformBand";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const wordVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease },
  },
};

const lineContainer = (delay: number) => ({
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: delay } },
});

/* ── Floating clip cards data ── */
const clipCards = [
  {
    gradient: "linear-gradient(160deg, rgba(88,28,135,0.6) 0%, rgba(30,27,75,0.8) 100%)",
    dotColor: "#A78BFA",
    label: "setup_payoff",
    title: "The moment before the pivot",
    time: "1:24",
    position: { left: "8%", top: "15%" } as const,
    rotate: -6,
    width: 140,
    floatY: [-12, 0, -12],
    floatDur: 5,
    floatDelay: 0,
    entranceDelay: 0.2,
    pxFactor: -0.015,
    pyFactor: -0.015,
  },
  {
    gradient: "linear-gradient(160deg, rgba(6,78,59,0.6) 0%, rgba(5,46,22,0.85) 100%)",
    dotColor: "#4ADE80",
    label: "claim",
    title: "Why this always works",
    time: "0:42",
    position: { right: "5%", top: "8%" } as const,
    rotate: 5,
    width: 155,
    floatY: [-10, 0, -10],
    floatDur: 4.3,
    floatDelay: 0.8,
    entranceDelay: 0.4,
    pxFactor: 0.02,
    pyFactor: -0.012,
  },
  {
    gradient: "linear-gradient(160deg, rgba(120,53,15,0.6) 0%, rgba(69,26,3,0.85) 100%)",
    dotColor: "#FBB249",
    label: "reaction_beat",
    title: "The audience didn't see it coming",
    time: "2:05",
    position: { right: "10%", top: "55%" } as const,
    rotate: 3,
    width: 140,
    floatY: [-8, 0, -8],
    floatDur: 5.8,
    floatDelay: 1.6,
    entranceDelay: 0.6,
    pxFactor: 0.025,
    pyFactor: -0.018,
  },
];

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const mx = (e.clientX - cx) / rect.width;
      const my = (e.clientY - cy) / rect.height;
      mouseX.set(mx);
      mouseY.set(my);
      setMouse({ x: mx, y: my });
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [mouseX, mouseY]);

  const line1Words = ["Break", "the", "video."];
  const line2Words = ["Keep", "the", "moment."];

  return (
    <section
      ref={heroRef}
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{ minHeight: "100vh", paddingTop: 100, paddingBottom: 80 }}
    >
      {/* LAYER 1 — Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 90% 60% at 50% 0%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 60% at 50% 0%, black 30%, transparent 100%)",
        }}
      />

      {/* LAYER 2 — Violet ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          zIndex: 0,
          top: -60,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 600,
          background: "radial-gradient(ellipse at center, rgba(167,139,250,0.12) 0%, transparent 68%)",
          filter: "blur(48px)",
        }}
      />

      {/* LAYER 3 — Waveform band */}
      <WaveformBand />

      {/* Floating clip cards */}
      {clipCards.map((card, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            ...card.position,
            width: card.width,
            aspectRatio: "9/16",
            zIndex: 2,
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
            transform: `rotate(${card.rotate}deg) translateX(${mouse.x * card.pxFactor * 100}px) translateY(${mouse.y * card.pyFactor * 100}px)`,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease, delay: card.entranceDelay }}
        >
          <motion.div
            animate={{ y: card.floatY }}
            transition={{ duration: card.floatDur, ease: "easeInOut", repeat: Infinity, delay: card.floatDelay }}
            style={{ width: "100%", height: "100%", position: "relative" }}
          >
            {/* Background */}
            <div className="absolute inset-0" style={{ background: card.gradient }} />

            {/* Timestamp */}
            <div
              className="absolute font-mono"
              style={{
                top: 8,
                right: 8,
                fontSize: 9,
                color: "rgba(255,255,255,0.4)",
                background: "rgba(0,0,0,0.5)",
                padding: "2px 5px",
                borderRadius: 3,
              }}
            >
              {card.time}
            </div>

            {/* Bottom overlay */}
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: 72,
                background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
                padding: "0 8px 8px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                gap: 4,
              }}
            >
              <div className="flex items-center gap-1">
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: card.dotColor }} />
                <span className="font-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.7)" }}>
                  {card.label}
                </span>
              </div>
              <span className="font-sans font-medium" style={{ fontSize: 11, color: "#fff" }}>
                {card.title}
              </span>
            </div>
          </motion.div>
        </motion.div>
      ))}

      {/* ── CONTENT ── */}
      <div className="relative z-10 flex flex-col items-center text-center" data-cursor="text">
        {/* Badge */}
        <motion.div
          className="flex items-center gap-2 font-sans"
          style={{
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.04em",
            color: "#C4B5FD",
            border: "1px solid rgba(167,139,250,0.35)",
            background: "rgba(167,139,250,0.1)",
            padding: "6px 14px",
            borderRadius: 9999,
            marginBottom: 28,
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
        >
          <div
            className="animate-pulse"
            style={{ width: 4, height: 4, borderRadius: "50%", background: "#A78BFA" }}
          />
          AI-powered video intelligence
        </motion.div>

        {/* Line 1 */}
        <motion.div
          className="flex gap-[0.3em] flex-wrap justify-center"
          variants={lineContainer(0.2)}
          initial="hidden"
          animate="visible"
        >
          {line1Words.map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              className="font-display italic leading-none"
              style={{
                fontSize: "clamp(52px, 7vw, 88px)",
                lineHeight: 1.05,
                color: word === "Break" ? "#A78BFA" : "#fff",
                filter: word === "Break" ? "drop-shadow(0 0 22px rgba(167,139,250,0.55))" : undefined,
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>

        {/* Line 2 */}
        <motion.div
          className="flex gap-[0.3em] flex-wrap justify-center mt-1"
          variants={lineContainer(0.35)}
          initial="hidden"
          animate="visible"
        >
          {line2Words.map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              className="font-display italic leading-none"
              style={{ fontSize: "clamp(52px, 7vw, 88px)", lineHeight: 1.05, color: "#fff" }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>

        {/* Subheading */}
        <motion.p
          className="font-sans font-normal text-center"
          style={{ fontSize: 18, color: "rgba(255,255,255,0.65)", maxWidth: 560, lineHeight: 1.65, marginTop: 20 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.45 }}
        >
          Clypt finds and frames the clips that matter, using the semantic structure of your content.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="flex items-center justify-center"
          style={{ gap: 12, marginTop: 36 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          <a
            href="/signup"
            className="font-heading font-semibold flex items-center transition-all active:scale-[0.98]"
            style={{
              fontSize: 15,
              color: "#0A0909",
              backgroundColor: "#A78BFA",
              padding: "13px 14px 13px 24px",
              borderRadius: 9999,
              boxShadow: "0 0 32px -4px rgba(167,139,250,0.5)",
              gap: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#C4B5FD";
              e.currentTarget.style.boxShadow = "0 0 48px -4px rgba(167,139,250,0.65)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#A78BFA";
              e.currentTarget.style.boxShadow = "0 0 32px -4px rgba(167,139,250,0.5)";
            }}
            data-cursor="pointer"
          >
            Get started free
            <span
              className="flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <ArrowRight size={16} />
            </span>
          </a>
          <a
            href="#demo"
            className="font-sans transition-colors"
            style={{ fontSize: 15, color: "rgba(255,255,255,0.7)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            data-cursor="pointer"
          >
            See a demo →
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="flex items-center font-sans"
          style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 24 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <span>Used by creators at</span>
          <span style={{ margin: "0 8px", color: "rgba(255,255,255,0.2)" }}>·</span>
          <span className="font-heading font-medium">Nebula</span>
          <span style={{ margin: "0 8px", color: "rgba(255,255,255,0.2)" }}>·</span>
          <span className="font-heading font-medium">Dropout</span>
          <span style={{ margin: "0 8px", color: "rgba(255,255,255,0.2)" }}>·</span>
          <span className="font-heading font-medium">Corridor</span>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
