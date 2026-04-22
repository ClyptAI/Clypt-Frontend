import { ReactNode } from "react";
import { motion } from "framer-motion";
import ShaderBackground, { type ShaderVariant } from "./ShaderBackground";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

interface DemoSectionLayoutProps {
  layout: "odd" | "even" | "full";
  copy: ReactNode;
  ui: ReactNode;
  id?: string;
  shader?: ShaderVariant;
}

export default function DemoSectionLayout({ layout, copy, ui, id, shader }: DemoSectionLayoutProps) {
  // Map the shader variant to its dominant ambient tone so the cursor can pick a contrast color.
  const cursorBg =
    shader === "pipeline-warm"
      ? "amber"
      : shader === "pipeline-cool"
        ? "cyan"
        : "violet";
  // Full-bleed section so the shader covers the entire viewport width.
  // Inner wrapper constrains content to a comfortable reading width.
  const sectionStyle = {
    width: "100%",
    padding: "120px 0",
    position: "relative" as const,
    isolation: "isolate" as const,
    overflow: "hidden" as const,
  };

  const innerStyle = {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 32px",
    position: "relative" as const,
    zIndex: 10,
  };

  if (layout === "full") {
    return (
      <section id={id} style={sectionStyle} data-cursor-bg={cursorBg}>
        {shader && (
          <ShaderBackground variant={shader} intensity="subtle" className="shader-layer" />
        )}
        <div style={innerStyle}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
          >
            {copy}
          </motion.div>
          <div style={{ marginTop: 56 }}>{ui}</div>
        </div>
      </section>
    );
  }

  const copyFirst = layout === "odd";
  const copyAnim = {
    initial: { opacity: 0, x: copyFirst ? -24 : 24 },
    whileInView: { opacity: 1, x: 0 },
  };
  const uiAnim = {
    initial: { opacity: 0, x: copyFirst ? 24 : -24 },
    whileInView: { opacity: 1, x: 0 },
  };

  const copyEl = (
    <motion.div
      {...copyAnim}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: copyFirst ? 0 : 0.1, ease }}
      style={{ display: "flex", alignItems: "center" }}
    >
      <div style={{ maxWidth: 420 }}>{copy}</div>
    </motion.div>
  );

  const uiEl = (
    <motion.div
      {...uiAnim}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: copyFirst ? 0.1 : 0, ease }}
    >
      {ui}
    </motion.div>
  );

  return (
    <section id={id} style={sectionStyle} data-cursor-bg={cursorBg}>
      {shader && (
        <ShaderBackground variant={shader} intensity="subtle" className="shader-layer" />
      )}
      <div
        style={{
          ...innerStyle,
          display: "grid",
          gridTemplateColumns: copyFirst ? "40% 60%" : "60% 40%",
          gap: 56,
          alignItems: "center",
        }}
      >
        {copyFirst ? (
          <>
            {copyEl}
            {uiEl}
          </>
        ) : (
          <>
            {uiEl}
            {copyEl}
          </>
        )}
      </div>
    </section>
  );
}
