import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const signalColors: Record<string, string> = {
  claim: "#A78BFA",
  "q&a": "#60A5FA",
  qa_exchange: "#60A5FA",
  setup: "#FBB249",
  setup_payoff: "#FBB249",
  anecdote: "#FBB249",
  challenge: "#F87171",
  challenge_exchange: "#F87171",
};

const cards = [
  {
    gradient: "linear-gradient(170deg, #12091f 0%, #0a0a14 50%, #14090c 100%)",
    nodeLabel: "claim",
    time: "0:18",
    title: "Why most editing tools get this wrong",
    duration: "22s",
  },
  {
    gradient: "linear-gradient(170deg, #0f1a10 0%, #090f0a 50%, #0c0c0a 100%)",
    nodeLabel: "q&a",
    time: "1:42",
    title: "The audience question that changed everything",
    duration: "18s",
  },
  {
    gradient: "linear-gradient(170deg, #1a0f28 0%, #0d0a1a 40%, #0a0a12 100%)",
    nodeLabel: "setup",
    time: "3:05",
    title: "Building tension before the reveal moment",
    duration: "31s",
    featured: true,
  },
  {
    gradient: "linear-gradient(170deg, #1a1000 0%, #0f0c00 50%, #0a0908 100%)",
    nodeLabel: "anecdote",
    time: "4:28",
    title: "The story behind the original concept",
    duration: "26s",
  },
  {
    gradient: "linear-gradient(170deg, #1a0a00 0%, #100800 50%, #0c0806 100%)",
    nodeLabel: "challenge",
    time: "5:51",
    title: "Pushing back on conventional wisdom",
    duration: "14s",
  },
];

const cardTransforms = [
  { tx: -40, ry: 18, rz: -3, s: 0.88 },
  { tx: -20, ry: 8, rz: -1.5, s: 0.94 },
  { tx: 0, ry: 0, rz: 0, s: 1.0 },
  { tx: 20, ry: -8, rz: 1.5, s: 0.94 },
  { tx: 40, ry: -18, rz: 3, s: 0.88 },
];

const staggerOrder = [2, 1, 3, 0, 4];

/* ── Count-up hook ── */
const AnimatedCounter = ({
  target,
  suffix,
  label,
  color,
  shadow,
}: {
  target: number;
  suffix: string;
  label: string;
  color: string;
  shadow: string;
}) => {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const dur = 1500;
          const tick = (now: number) => {
            const t = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(eased * target));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  const display = target >= 1000 ? `${(value / 1000).toFixed(1)}K+` : `${value}${suffix}`;

  return (
    <div ref={ref} className="flex flex-col items-center">
      <span
        className="font-heading font-bold"
        style={{ fontSize: 52, color, filter: `drop-shadow(${shadow})` }}
      >
        {display}
      </span>
      <span className="font-sans" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
        {label}
      </span>
    </div>
  );
};

const ClipShowcase = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section id="features" style={{ padding: "100px 24px" }}>
      <div className="text-center" style={{ marginBottom: 56 }}>
        <motion.h2
          className="font-heading font-bold"
          style={{ fontSize: 42, color: "#fff" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
        >
          Clips that{" "}
          <span style={{ color: "#A78BFA", filter: "drop-shadow(0 0 20px rgba(167,139,250,0.5))" }}>
            stand
          </span>{" "}
          alone.
        </motion.h2>
        <motion.p
          className="font-sans mx-auto"
          style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 480, marginTop: 12 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
        >
          Every output is fully grounded — speaker-assigned, framed, and render-planned.
        </motion.p>
      </div>

      {/* Card fan */}
      <div
        className="flex justify-center items-center gap-4 mx-auto"
        style={{ perspective: "1200px", perspectiveOrigin: "50% 60%", maxWidth: 1000 }}
        onMouseLeave={() => setHoveredCard(null)}
      >
        {cards.map((card, i) => {
          const t = cardTransforms[i];
          const isCenter = i === 2;
          const isHovered = hoveredCard === i;
          const someHovered = hoveredCard !== null;
          const orderIdx = staggerOrder.indexOf(i);
          const dotColor = signalColors[card.nodeLabel] || "#A78BFA";

          return (
            <motion.div
              key={i}
              data-cursor={card.featured ? "play" : undefined}
              className="relative flex-shrink-0"
              style={{
                width: 160,
                aspectRatio: "9/16",
                borderRadius: 14,
                overflow: "hidden",
                border: isCenter
                  ? "1px solid rgba(167,139,250,0.5)"
                  : "1px solid rgba(255,255,255,0.12)",
                boxShadow: isCenter
                  ? "0 0 60px -8px rgba(167,139,250,0.35), 0 32px 64px rgba(0,0,0,0.6)"
                  : "0 32px 64px rgba(0,0,0,0.6)",
                transformStyle: "preserve-3d",
              }}
              initial={{
                opacity: 0,
                y: 60,
                rotateY: t.ry * 1.5,
                rotateZ: t.rz,
                scale: t.s,
                translateX: t.tx,
              }}
              whileInView={{
                opacity: someHovered && !isHovered ? 0.7 : 1,
                y: 0,
                rotateY: isHovered ? t.ry * 0.5 : t.ry,
                rotateZ: t.rz,
                scale: isCenter
                  ? isHovered ? 1.08 : 1.05
                  : isHovered ? t.s * 1.04 : someHovered && !isHovered ? t.s * 0.97 : t.s,
                translateX: t.tx,
                translateZ: isHovered ? 20 : 0,
              }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease, delay: orderIdx * 0.07 }}
              onMouseEnter={() => setHoveredCard(i)}
            >
              <div className="absolute inset-0" style={{ background: card.gradient }} />

              {/* Timestamp */}
              <div
                className="absolute font-mono"
                style={{
                  top: 8,
                  right: 8,
                  fontSize: 9,
                  color: "rgba(255,255,255,0.5)",
                  background: "rgba(0,0,0,0.5)",
                  padding: "2px 5px",
                  borderRadius: 3,
                }}
              >
                {card.time}
              </div>

              {/* Bottom gradient */}
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{ height: "50%", background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)" }}
              />

              {/* Signal tag */}
              <div
                className="absolute bottom-2 left-2 right-2 flex flex-col gap-1"
                style={{
                  background: "rgba(0,0,0,0.7)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "6px 10px",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor }} />
                  <span className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                    {card.nodeLabel}
                  </span>
                </div>
                <span className="font-sans font-medium" style={{ fontSize: 12, color: "#fff" }}>
                  {card.title}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="flex justify-center items-center mx-auto" style={{ gap: 80, marginTop: 80 }}>
        <AnimatedCounter
          target={2400}
          suffix="K+"
          label="Nodes constructed"
          color="#A78BFA"
          shadow="0 0 16px rgba(167,139,250,0.4)"
        />
        <AnimatedCounter
          target={180000}
          suffix="K+"
          label="Clips grounded"
          color="#FBB249"
          shadow="0 0 16px rgba(251,178,73,0.4)"
        />
        <AnimatedCounter
          target={99}
          suffix="ms"
          label="Median Phase 4 latency"
          color="#4ADE80"
          shadow="0 0 16px rgba(74,222,128,0.35)"
        />
      </div>
    </section>
  );
};

export default ClipShowcase;
