import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Link as LinkIcon } from "lucide-react";
import ShaderBackground from "./ShaderBackground";
import ClyptHeroAnimation from "./ClyptHeroAnimation";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
};

const lineContainer = (delay: number) => ({
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: delay } },
});

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);

  const line1Words = ["Break", "the", "video."];
  const line2Words = ["Keep", "the", "gems."];

  return (
    <section
      ref={heroRef}
      className="relative flex items-center overflow-hidden"
      style={{ minHeight: "100vh", paddingTop: 100, paddingBottom: 80 }}
      data-cursor-bg="violet"
    >
      {/* LAYER 0 — Animated shader background (slightly softened so fragments read crisply) */}
      <ShaderBackground
        variant="hero"
        className="shader-layer"
        pauseWhenOffscreen
        viewportMargin="-15% 0px -15% 0px"
        minPixelRatio={2}
        maxPixelCount={1920 * 1080 * 4}
        style={{ opacity: 0.85 }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1640px] items-center gap-10 px-6 sm:px-8 lg:grid-cols-[minmax(500px,0.95fr)_minmax(560px,1.05fr)] lg:px-[max(5vw,32px)]">
        {/* ── CONTENT (left-aligned column) ── */}
        <div className="flex w-full max-w-[760px] flex-col items-start text-left" data-cursor="text">
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
            An all-in-one knowledge graph for creators
          </motion.div>

          {/* Line 1 */}
          <motion.div
            className="flex gap-[0.25em] whitespace-nowrap"
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
                  fontSize: "clamp(44px, 5.4vw, 76px)",
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
            className="mt-1 flex gap-[0.25em] whitespace-nowrap"
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
                  fontSize: "clamp(44px, 5.4vw, 76px)",
                  lineHeight: 1.05,
                  color: word === "gems." ? "#A78BFA" : "#fff",
                  filter: word === "gems." ? "drop-shadow(0 0 22px rgba(167,139,250,0.55))" : undefined,
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.div>

          {/* Subheading */}
          <motion.p
            className="text-left font-sans font-normal"
            style={{ fontSize: 17, color: "rgba(255,255,255,0.65)", maxWidth: 640, lineHeight: 1.6, marginTop: 24 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.45 }}
          >
            Clypt maps semantic structure against real audience engagement and live trends, mining the moments worth
            clipping.
          </motion.p>

          {/* URL paste bar + CTA buttons */}
          <motion.div
            className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            style={{
              maxWidth: 780,
              marginTop: 36,
              border: "1px solid hsl(var(--border) / 0.72)",
              background: "hsl(var(--card) / 0.78)",
              borderRadius: 28,
              padding: 12,
              boxShadow: "0 32px 90px hsl(0 0% 0% / 0.35)",
              backdropFilter: "blur(22px)",
            }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.55 }}
          >
            <div
              className="flex min-h-12 flex-1 items-center gap-3 whitespace-nowrap px-4 text-left font-sans"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              <LinkIcon size={18} color="hsl(var(--primary))" />
              Paste a YouTube or podcast link
            </div>
            <Link
              to="/signup"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 font-heading font-semibold transition-transform active:scale-[0.98]"
              style={{
                fontSize: 15,
                color: "hsl(var(--primary-foreground))",
                backgroundColor: "hsl(var(--primary))",
              }}
              data-cursor="pointer"
            >
              Try free now
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/runs/demo/timeline"
              className="inline-flex min-h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-5 font-heading font-semibold transition-colors"
              style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))", fontSize: 15 }}
              data-cursor="pointer"
            >
              See demo
            </Link>
          </motion.div>

          <motion.div
            className="flex items-center gap-3 font-display italic"
            style={{ color: "hsl(var(--primary))", fontSize: 24, marginTop: 28 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease, delay: 0.68 }}
          >
            <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>
              ✦
            </span>
            <span>Clypt is how creators think.</span>
          </motion.div>
        </div>

        <motion.div
          className="relative z-20 w-full justify-self-center lg:self-center"
          style={{ transformOrigin: "center", scale: 0.96 }}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0, scale: 0.96 }}
          transition={{ duration: 0.8, ease, delay: 0.25 }}
        >
          <ClyptHeroAnimation />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
