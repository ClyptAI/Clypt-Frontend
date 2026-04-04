import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const wordEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

const cards = [
  {
    gradient: "linear-gradient(170deg, #12091f 0%, #0a0a14 50%, #14090c 100%)",
    accent: "#A78BFA",
    nodeLabel: "claim",
    time: "0:18",
    title: "Why most editing tools get this wrong",
    duration: "22s",
  },
  {
    gradient: "linear-gradient(170deg, #0f1a10 0%, #090f0a 50%, #0c0c0a 100%)",
    accent: "#4ADE80",
    nodeLabel: "q&a",
    time: "1:42",
    title: "The audience question that changed everything",
    duration: "18s",
  },
  {
    gradient: "linear-gradient(170deg, #1a0f28 0%, #0d0a1a 40%, #0a0a12 100%)",
    accent: "#E879F9",
    nodeLabel: "setup",
    time: "3:05",
    title: "Building tension before the reveal moment",
    duration: "31s",
    featured: true,
  },
  {
    gradient: "linear-gradient(170deg, #1a1000 0%, #0f0c00 50%, #0a0908 100%)",
    accent: "#FBB249",
    nodeLabel: "anecdote",
    time: "4:28",
    title: "The story behind the original concept",
    duration: "26s",
  },
  {
    gradient: "linear-gradient(170deg, #1a0a00 0%, #100800 50%, #0c0806 100%)",
    accent: "#FB923C",
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

// Stagger order: center first, then outward
const staggerOrder = [2, 1, 3, 0, 4];

const headingWords = ["Clips", "that", "stand", "alone."];

/* ── Animated counter ── */
const AnimatedCounter = ({ target, suffix, label }: { target: number; suffix: string; label: string }) => {
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
            const eased = 1 - Math.pow(1 - t, 3); // easeOut
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

  const display = target >= 1000 ? `${(value / 1000).toFixed(1)}${suffix}` : `${value}${suffix}`;

  return (
    <div ref={ref} className="flex flex-col items-center">
      <span className="font-heading font-extrabold" style={{ fontSize: 36, color: "var(--color-text-primary)" }}>
        {display}
      </span>
      <span className="font-sans font-normal mt-1" style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
        {label}
      </span>
    </div>
  );
};

/* ── ClipShowcase ── */
const ClipShowcase = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section className="py-24 px-10" style={{ background: "var(--color-surface-1)" }}>
      {/* Header */}
      <div className="text-center mb-16">
        <p className="label-caps mb-3">What Clypt makes</p>
        <motion.h2
          className="font-heading font-extrabold text-[var(--color-text-primary)] flex justify-center gap-[0.3em] flex-wrap"
          style={{ fontSize: 42 }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
        >
          {headingWords.map((w, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: wordEase } },
              }}
            >
              {w}
            </motion.span>
          ))}
        </motion.h2>
        <p className="font-sans font-normal mx-auto mt-3" style={{ color: "var(--color-text-secondary)", fontSize: 16, maxWidth: 480 }}>
          Every output is fully grounded — speaker-assigned, framed, and render-planned.
        </p>
      </div>

      {/* Card fan */}
      <div
        className="flex justify-center items-center gap-4 mx-auto"
        style={{ perspective: "1200px", perspectiveOrigin: "50% 60%", maxWidth: 1000 }}
        onMouseLeave={() => setHoveredCard(null)}
      >
        {cards.map((card, i) => {
          const t = cardTransforms[i];
          const isHovered = hoveredCard === i;
          const someHovered = hoveredCard !== null;
          const orderIdx = staggerOrder.indexOf(i);

          return (
            <motion.div
              key={i}
              data-cursor={card.featured ? "play" : undefined}
              className="relative flex-shrink-0"
              style={{
                width: 160,
                aspectRatio: "9/16",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.07)",
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
                scale: isHovered ? t.s * 1.04 : someHovered && !isHovered ? t.s * 0.97 : t.s,
                translateX: t.tx,
                translateZ: isHovered ? 20 : 0,
              }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease, delay: orderIdx * 0.07 }}
              onMouseEnter={() => setHoveredCard(i)}
            >
              {/* Background */}
              <div
                className="absolute inset-0"
                style={{
                  background: card.featured
                    ? `${card.gradient}, repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)`
                    : card.gradient,
                }}
              />

              {/* Top accent strip */}
              <div className="absolute top-0 left-0 right-0" style={{ height: 3, background: card.accent }} />

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

              {/* Bottom gradient overlay */}
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{ height: "50%", background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)" }}
              />

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5 flex flex-col gap-1.5">
                {/* Node chip */}
                <div className="flex items-center gap-1">
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: card.accent }} />
                  <span className="font-mono" style={{ fontSize: 10, color: card.accent }}>{card.nodeLabel}</span>
                </div>
                {/* Title */}
                <span
                  className="font-heading font-medium leading-tight"
                  style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                >
                  {card.title}
                </span>
                {/* Duration */}
                <span className="font-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{card.duration}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {cards.map((_, i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: i === 2 ? 8 : 6,
              height: i === 2 ? 8 : 6,
              background: i === 2 ? "var(--color-violet)" : "var(--color-surface-3)",
            }}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-12 mt-14 max-w-[600px] mx-auto">
        <AnimatedCounter target={2400} suffix="K+" label="Nodes constructed" />
        <AnimatedCounter target={180} suffix="K+" label="Clips grounded" />
        <AnimatedCounter target={99} suffix="ms" label="Median Phase 4 latency" />
      </div>
    </section>
  );
};

export default ClipShowcase;
