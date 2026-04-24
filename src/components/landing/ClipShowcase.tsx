import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ShaderBackground from "./ShaderBackground";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

type Card = {
  gradient: string;
  timestamp: string;
  title: string;
  videoSrc: string;
  featured?: boolean;
};

const cards: Card[] = [
  {
    gradient: "linear-gradient(170deg, #12091f 0%, #0a0a14 50%, #14090c 100%)",
    timestamp: "1:07 - 1:55",
    title: "Why most editing tools get this wrong",
    videoSrc: "/videos/landing/pete_sg_0008_cand_01_vertical_rfdetr_karaoke.mp4",
  },
  {
    gradient: "linear-gradient(170deg, #0f1a10 0%, #090f0a 50%, #0c0c0a 100%)",
    timestamp: "3:34 - 4:10",
    title: "The audience question that changed everything",
    videoSrc: "/videos/landing/mrbeast_sg_0001_cand_01_vertical_rfdetr_karaoke.mp4",
  },
  {
    gradient: "linear-gradient(170deg, #1a0f28 0%, #0d0a1a 40%, #0a0a12 100%)",
    timestamp: "1:09:21 - 1:10:42",
    title: "Building tension before the reveal moment",
    videoSrc: "/videos/landing/dwarkesh_sg_0007_cand_01_vertical_rfdetr_karaoke.mp4",
    featured: true,
  },
  {
    gradient: "linear-gradient(170deg, #1a1000 0%, #0f0c00 50%, #0a0908 100%)",
    timestamp: "1:36:40 - 1:37:44",
    title: "The story behind the original concept",
    videoSrc: "/videos/landing/dwarkesh_sg_0015_cand_01_vertical_rfdetr_karaoke.mp4",
  },
  {
    gradient: "linear-gradient(170deg, #1a0a00 0%, #100800 50%, #0c0806 100%)",
    timestamp: "11:49 - 12:33",
    title: "Pushing back on conventional wisdom",
    videoSrc: "/videos/landing/pete_sg_0012_cand_01_vertical_rfdetr_karaoke.mp4",
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

  const display = target >= 1000 ? `${(value / 1000).toFixed(target >= 10000 ? 0 : 1)}K+` : `${value}${suffix}`;

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
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  const resetVideo = (video: HTMLVideoElement | null) => {
    if (!video) return;
    video.pause();
    video.muted = true;
    try {
      video.currentTime = 0;
    } catch {
      // Ignore reset failures while metadata is still loading.
    }
  };

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      const shouldPlay = activeCard === index && hoveredCard === index;
      video.muted = !shouldPlay;
      if (shouldPlay) {
        void video.play().catch(() => {
          setActiveCard((current) => (current === index ? null : current));
        });
        return;
      }

      video.pause();
    });
  }, [activeCard, hoveredCard]);

  return (
    <section
      id="features"
      style={{ padding: "100px 24px", position: "relative", isolation: "isolate" }}
      data-cursor-bg="amber"
    >
      <ShaderBackground variant="showcase" intensity="normal" className="shader-layer" />
      <div className="text-center content-layer" style={{ marginBottom: 56 }}>
        <motion.h2
          className="font-heading font-bold"
          style={{ fontSize: 42, color: "#fff" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
        >
          Clips cut from what{" "}
          <span style={{ color: "hsl(var(--primary))" }}>
            matters
          </span>
          .
        </motion.h2>
        <motion.p
          className="font-sans mx-auto"
          style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 520, marginTop: 12 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
        >
          Every clip is built from the moments that actually carry your video — the claims, the reactions, the payoffs. No scrubbing, no guesswork.
        </motion.p>
      </div>

      {/* Card fan */}
      <div
        className="flex justify-center items-center gap-4 mx-auto content-layer"
        style={{ perspective: "1200px", perspectiveOrigin: "50% 60%", maxWidth: 1000 }}
        onMouseLeave={() => {
          videoRefs.current.forEach((video) => resetVideo(video));
          setHoveredCard(null);
          setActiveCard(null);
        }}
      >
        {cards.map((card, i) => {
          const t = cardTransforms[i];
          const isCenter = i === 2;
          const isHovered = hoveredCard === i;
          const isPlaying = activeCard === i && isHovered;
          const someHovered = hoveredCard !== null;
          const orderIdx = staggerOrder.indexOf(i);
          const posterSrc = card.videoSrc.replace("/videos/landing/", "/images/landing-posters/").replace(/\.mp4$/, ".jpg");

          return (
            <motion.div
              key={i}
              data-cursor={card.featured ? "play" : undefined}
              className="relative flex-shrink-0"
              role="button"
              tabIndex={0}
              aria-label={`Play clip preview: ${card.title}`}
              style={{
                width: 160,
                aspectRatio: "9/16",
                borderRadius: 14,
                overflow: "visible",
                border: isCenter
                  ? "1px solid rgba(167,139,250,0.5)"
                  : "1px solid rgba(255,255,255,0.12)",
                boxShadow: isCenter
                  ? "0 0 60px -8px rgba(167,139,250,0.35), 0 32px 64px rgba(0,0,0,0.6)"
                  : "0 32px 64px rgba(0,0,0,0.6)",
                transformStyle: "preserve-3d",
                cursor: "pointer",
                outline: "none",
                WebkitTapHighlightColor: "transparent",
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
              onMouseLeave={() => {
                resetVideo(videoRefs.current[i]);
                setHoveredCard((current) => (current === i ? null : current));
                setActiveCard((current) => (current === i ? null : current));
              }}
              onClick={() => setActiveCard((current) => (current === i ? null : i))}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveCard((current) => (current === i ? null : i));
                }
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  borderRadius: 14,
                  overflow: "hidden",
                  clipPath: "inset(0 round 14px)",
                  transform: "translateZ(0)",
                  WebkitMaskImage: "-webkit-radial-gradient(white, black)",
                }}
              >
                <div className="absolute inset-0" style={{ background: card.gradient }} />
                <video
                  ref={(element) => {
                    videoRefs.current[i] = element;
                  }}
                  src={card.videoSrc}
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ pointerEvents: "none", borderRadius: 14 }}
                />
                {!isPlaying ? (
                  <img
                    src={posterSrc}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ pointerEvents: "none", borderRadius: 14 }}
                  />
                ) : null}
              </div>

              {/* Timestamp */}
              <div
                className="absolute font-mono"
                style={{
                  top: 8,
                  left: 8,
                  fontSize: 9,
                  color: "rgba(255,255,255,0.85)",
                  background: "rgba(10,9,9,0.65)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  letterSpacing: "0.06em",
                  backdropFilter: "blur(6px)",
                }}
              >
                {card.timestamp}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Stats row */}
      <div
        className="flex justify-center items-center mx-auto content-layer"
        style={{ gap: 80, marginTop: 80 }}
      >
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
