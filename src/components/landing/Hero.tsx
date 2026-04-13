import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import WaveformBand from "./WaveformBand";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const entryEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

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

/* ── Node type → color + short display label ── */
const nodeColors: Record<string, string> = {
  claim: "#A78BFA",
  qa_exchange: "#38BDF8",
  setup_payoff: "#E879F9",
  anecdote: "#F0A64A",
  reaction_beat: "#4ADE80",
  explanation: "#7DD3FC",
  example: "#FBBF24",
};

const nodeDisplay: Record<string, string> = {
  claim: "claim",
  qa_exchange: "Q&A",
  setup_payoff: "payoff",
  anecdote: "anecdote",
  reaction_beat: "reaction",
  explanation: "explain",
  example: "example",
};

/* ── Floating clip cards data ── */
/* Each card is a CLIP composed of multiple semantic nodes.
   `nodes` lists the node types that make up the clip. */
const clipCards = [
  {
    gradient: "linear-gradient(160deg, #1a1035 0%, #0d0d14 40%, #1a1520 100%)",
    nodes: ["setup_payoff", "reaction_beat"],
    title: "The moment before the pivot",
    time: "1:24",
    position: { left: "12%", top: "15%" } as React.CSSProperties,
    rotate: -9,
    width: 120,
    floatY: [0, -14, 0],
    floatDur: 6.5,
    floatDelay: 0,
    entranceDelay: 0.8,
    pxFactor: 0.03,
  },
  {
    gradient: "linear-gradient(160deg, #0a1a1a 0%, #0d1410 40%, #0a0909 100%)",
    nodes: ["reaction_beat", "qa_exchange"],
    title: "The audience didn't see it coming",
    time: "0:38",
    position: { left: "11%", top: "57%" } as React.CSSProperties,
    rotate: -3,
    width: 120,
    floatY: [0, -10, 0],
    floatDur: 5.5,
    floatDelay: 1.5,
    entranceDelay: 1.1,
    pxFactor: 0.015,
  },
  {
    gradient: "linear-gradient(160deg, #1a1008 0%, #1a0d0d 40%, #100a14 100%)",
    nodes: ["claim", "explanation"],
    title: "Why this always works",
    time: "8:42",
    position: { right: "12%", top: "15%" } as React.CSSProperties,
    rotate: 7,
    width: 120,
    floatY: [0, -16, 0],
    floatDur: 7,
    floatDelay: 0.5,
    entranceDelay: 1.0,
    pxFactor: -0.02,
  },
  {
    gradient: "linear-gradient(160deg, #0a1a1a 0%, #091018 40%, #080c12 100%)",
    nodes: ["qa_exchange", "anecdote"],
    title: "The follow-up no one asked",
    time: "2:05",
    position: { right: "11%", top: "54%" } as React.CSSProperties,
    rotate: 5,
    width: 120,
    floatY: [0, -12, 0],
    floatDur: 6,
    floatDelay: 2,
    entranceDelay: 1.3,
    pxFactor: -0.025,
  },
];

function FloatingCard({ card }: { card: typeof clipCards[0] }) {
  const [entered, setEntered] = useState(false);
  const springX = useSpring(0, { stiffness: 60, damping: 20 });
  const accentColor = nodeColors[card.nodes[0]] ?? "#A78BFA";

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const mx = (e.clientX - cx) / window.innerWidth;
      springX.set(mx * card.pxFactor * 100);
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [springX, card.pxFactor]);

  return (
    <motion.div
      data-cursor="play"
      style={{
        position: "absolute",
        ...card.position,
        width: card.width,
        aspectRatio: "9/16",
        zIndex: 2,
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
        background: card.gradient,
        rotate: card.rotate,
        x: springX,
      }}
      initial={{ opacity: 0, y: 40 }}
      animate={
        entered
          ? { opacity: 1, y: card.floatY }
          : { opacity: 1, y: 0 }
      }
      transition={
        entered
          ? { y: { duration: card.floatDur, ease: "easeInOut", repeat: Infinity, delay: card.floatDelay }, opacity: { duration: 0 } }
          : { duration: 0.9, ease: entryEase, delay: card.entranceDelay }
      }
      onAnimationComplete={() => {
        if (!entered) setEntered(true);
      }}
      whileHover={{ scale: 1.04, borderColor: `${accentColor}80` }}
    >
      {/* Timestamp */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          fontFamily: "'Geist Mono', monospace",
          fontSize: 9,
          color: "rgba(255,255,255,0.5)",
          background: "rgba(0,0,0,0.5)",
          padding: "2px 5px",
          borderRadius: 3,
        }}
      >
        {card.time}
      </div>

      {/* Bottom gradient overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "55%",
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)",
          pointerEvents: "none",
        }}
      />

      {/* Node chips — the nodes that compose this clip */}
      <div
        style={{
          position: "absolute",
          left: 8,
          right: 8,
          bottom: 36,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        {card.nodes.map((n, ni) => (
          <div key={ni} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: nodeColors[n] ?? "#A78BFA",
              }}
            />
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.6)" }}>
              {nodeDisplay[n] ?? n}
            </span>
          </div>
        ))}
      </div>

      {/* Caption */}
      <div
        style={{
          position: "absolute",
          left: 8,
          right: 8,
          bottom: 10,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 500,
          fontSize: 10,
          color: "rgba(255,255,255,0.8)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          lineHeight: 1.3,
        }}
      >
        {card.title}
      </div>
    </motion.div>
  );
}

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);

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
        <FloatingCard key={i} card={card} />
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
          Creator-first content intelligence
        </motion.div>

        {/* Line 1 */}
        <motion.div
          className="flex gap-[0.35em] flex-wrap justify-center"
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
          className="flex gap-[0.35em] flex-wrap justify-center mt-1"
          variants={lineContainer(0.35)}
          initial="hidden"
          animate="visible"
        >
          {line2Words.map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              className="font-display italic leading-none"
              style={{
                fontSize: "clamp(52px, 7vw, 88px)",
                lineHeight: 1.05,
                color: word === "moment." ? "#A78BFA" : "#fff",
                filter: word === "moment." ? "drop-shadow(0 0 22px rgba(167,139,250,0.55))" : undefined,
              }}
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
          <Link
            to="/runs/demo/timeline"
            className="font-sans transition-colors"
            style={{ fontSize: 15, color: "rgba(255,255,255,0.7)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            data-cursor="pointer"
          >
            See a demo →
          </Link>
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
