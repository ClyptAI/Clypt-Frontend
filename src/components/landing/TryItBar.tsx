import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { LandingAtmosphereShader } from "@/components/shaders";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const TryItBar = () => {
  return (
    <motion.section
      style={{ padding: "100px 24px" }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease }}
    >
      <div
        className="max-w-[760px] mx-auto text-center relative overflow-hidden rounded-[28px]"
        style={{
          padding: "40px 32px",
          background: "rgba(12,11,17,0.82)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.35)",
        }}
      >
        <LandingAtmosphereShader variant="cta" intensity="subtle" className="absolute inset-0" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,8,12,0.18) 0%, rgba(8,8,12,0.48) 100%)",
          }}
        />
        <div className="relative z-10">
        <motion.h2
          className="font-heading font-bold"
          style={{ fontSize: 30, color: "#fff", marginBottom: 8 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
        >
          Try it with any video
        </motion.h2>
        <p className="font-sans" style={{ fontSize: 15, color: "rgba(255,255,255,0.76)", marginBottom: 32 }}>
          No account needed for demo runs.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="youtube.com/watch?v=..."
            className="flex-1 font-sans outline-none transition-all"
            style={{
              height: 52,
              fontSize: 15,
              color: "#fff",
              background: "rgba(8,8,12,0.58)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 14,
              padding: "14px 20px",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(167,139,250,0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          <button
            className="font-heading font-semibold flex-shrink-0 transition-colors"
            style={{
              height: 52,
              fontSize: 13,
              color: "#0A0909",
              background: "#A78BFA",
              borderRadius: 10,
              padding: "8px 18px",
              border: "none",
              cursor: "pointer",
            }}
            data-cursor="pointer"
          >
            Analyze →
          </button>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-4">
          <ShieldCheck size={13} color="#4ADE80" />
          <span className="font-sans" style={{ fontSize: 12, color: "rgba(255,255,255,0.58)" }}>
            No account needed · Demo runs are free · No video is stored
          </span>
        </div>
        </div>
      </div>
    </motion.section>
  );
};

export default TryItBar;
