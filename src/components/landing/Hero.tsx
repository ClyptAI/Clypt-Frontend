import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ShaderBackground from "./ShaderBackground";
import HeroFragments from "./HeroFragments";

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
      <ShaderBackground variant="hero" className="shader-layer" style={{ opacity: 0.85 }} />

      {/* LAYER 1 — Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
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
          zIndex: 1,
          top: "20%",
          right: "-10%",
          width: 800,
          height: 600,
          background: "radial-gradient(ellipse at center, rgba(167,139,250,0.18) 0%, transparent 70%)",
          filter: "blur(48px)",
        }}
      />

      {/* LAYER 3 — Floating product fragments */}
      <HeroFragments />

      {/* ── CONTENT (left-aligned column) ── */}
      <div
        className="relative z-10 flex flex-col items-start text-left"
        style={{
          paddingLeft: "max(5vw, 32px)",
          paddingRight: "max(5vw, 32px)",
          maxWidth: 620,
          width: "100%",
        }}
        data-cursor="text"
      >
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
          className="flex gap-[0.25em] whitespace-nowrap mt-1"
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
          className="font-sans font-normal text-left"
          style={{ fontSize: 17, color: "rgba(255,255,255,0.65)", maxWidth: 480, lineHeight: 1.65, marginTop: 24 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.45 }}
        >
          Clypt maps semantic structure against <em style={{ color: "#fff", fontStyle: "italic" }}>&nbsp;real&nbsp;&nbsp;</em>audience engagement and <em style={{ color: "#fff", fontStyle: "italic" }}>&nbsp;live&nbsp;&nbsp;</em>trends, mining the moments worth clipping.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="flex items-center"
          style={{ gap: 12, marginTop: 36 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          <a
            href="/signup"
          className="font-heading font-semibold flex items-center active:scale-[0.97]"
            style={{
              fontSize: 15,
              color: "#0A0909",
              backgroundColor: "#A78BFA",
              padding: "13px 14px 13px 24px",
              borderRadius: 9999,
              boxShadow: "0 0 32px -4px rgba(167,139,250,0.5)",
              gap: 10,
            transition: "background-color 160ms ease, box-shadow 200ms ease, transform 120ms ease",
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
          className="font-sans active:scale-[0.97]"
          style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", transition: "color 160ms ease, transform 120ms ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            data-cursor="pointer"
          >
            See a demo →
          </Link>
        </motion.div>

        {/* Tagline */}
        <motion.div
          className="flex items-center gap-2"
          style={{ marginTop: 36 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <span style={{ color: "#A78BFA", fontSize: 14 }}>✦</span>
          <span
            className="font-display italic"
            style={{
              fontSize: 17,
              color: "#C4B5FD",
              letterSpacing: "0.01em",
            }}
          >
            Clypt is how creators think.
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
