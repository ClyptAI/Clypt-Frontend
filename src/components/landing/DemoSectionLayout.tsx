import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LandingAtmosphereShader, MetallicSweepShader, type LandingAtmosphereVariant } from "@/components/shaders";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

function getSectionChrome(variant?: LandingAtmosphereVariant) {
  switch (variant) {
    case "section-timeline":
      return {
        background:
          "linear-gradient(180deg, rgba(13,11,22,0.84) 0%, rgba(11,11,18,0.9) 100%)",
        border: "rgba(151,132,255,0.2)",
        innerBorder: "rgba(196,181,253,0.08)",
        shadow:
          "0 36px 104px rgba(0,0,0,0.48), 0 0 0 1px rgba(103,232,249,0.08)",
      };
    case "section-retrieval":
      return {
        background:
          "linear-gradient(180deg, rgba(19,11,26,0.84) 0%, rgba(11,11,18,0.92) 100%)",
        border: "rgba(167,139,250,0.2)",
        innerBorder: "rgba(196,181,253,0.08)",
        shadow:
          "0 36px 104px rgba(0,0,0,0.5), 0 0 0 1px rgba(251,178,73,0.06)",
      };
    case "section-grounding":
      return {
        background:
          "linear-gradient(180deg, rgba(21,12,28,0.86) 0%, rgba(11,11,18,0.92) 100%)",
        border: "rgba(176,143,255,0.24)",
        innerBorder: "rgba(216,180,254,0.08)",
        shadow:
          "0 36px 104px rgba(0,0,0,0.52), 0 0 0 1px rgba(216,180,254,0.08)",
      };
    case "section-render":
      return {
        background:
          "linear-gradient(180deg, rgba(18,11,28,0.84) 0%, rgba(11,11,18,0.92) 100%)",
        border: "rgba(167,139,250,0.22)",
        innerBorder: "rgba(196,181,253,0.08)",
        shadow:
          "0 36px 104px rgba(0,0,0,0.5), 0 0 0 1px rgba(147,197,253,0.06)",
      };
    case "section-graph":
    default:
      return {
        background:
          "linear-gradient(180deg, rgba(16,12,25,0.84) 0%, rgba(11,11,18,0.92) 100%)",
        border: "rgba(167,139,250,0.2)",
        innerBorder: "rgba(196,181,253,0.08)",
        shadow:
          "0 36px 104px rgba(0,0,0,0.5), 0 0 0 1px rgba(167,139,250,0.08)",
      };
  }
}

interface DemoSectionLayoutProps {
  layout: "odd" | "even" | "full";
  copy: ReactNode;
  ui: ReactNode;
  id?: string;
  shaderVariant?: LandingAtmosphereVariant;
}

export default function DemoSectionLayout({ layout, copy, ui, id, shaderVariant }: DemoSectionLayoutProps) {
  const chrome = getSectionChrome(shaderVariant);

  if (layout === "full") {
      return (
      <section
        id={id}
        className="relative overflow-hidden"
        style={{ maxWidth: 1220, margin: "0 auto 34px", padding: "116px 28px" }}
      >
        {shaderVariant ? (
          <LandingAtmosphereShader
            variant={shaderVariant}
            intensity="subtle"
            className="absolute inset-0 rounded-[28px]"
          />
        ) : null}
        <div
          className="absolute inset-0 rounded-[28px]"
          style={{
            background: chrome.background,
            border: `1px solid ${chrome.border}`,
            boxShadow: chrome.shadow,
          }}
        />
        <MetallicSweepShader
          variant="section"
          accentColor="#D8B4FE"
          delayMs={450}
          className="rounded-[28px]"
        />
        <div
          className="absolute inset-[10px] rounded-[22px] pointer-events-none"
          style={{
            border: `1px solid ${chrome.innerBorder}`,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 28%, rgba(9,9,15,0.12) 100%)",
          }}
        />
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
          >
            {copy}
          </motion.div>
          <div style={{ marginTop: 56 }}>
            {ui}
          </div>
        </div>
      </section>
    );
  }

  const copyFirst = layout === "odd";
  const copyAnim = { initial: { opacity: 0, x: copyFirst ? -24 : 24 }, whileInView: { opacity: 1, x: 0 } };
  const uiAnim = { initial: { opacity: 0, x: copyFirst ? 24 : -24 }, whileInView: { opacity: 1, x: 0 } };

  const copyEl = (
    <motion.div
      {...copyAnim}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: copyFirst ? 0 : 0.1, ease }}
      style={{ display: "flex", alignItems: "center" }}
    >
      <div style={{ maxWidth: 400 }}>{copy}</div>
    </motion.div>
  );

  const uiEl = (
    <motion.div
      {...uiAnim}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: copyFirst ? 0.1 : 0, ease }}
      style={{ minWidth: 0 }}
    >
      {ui}
    </motion.div>
  );

  return (
    <section
      id={id}
      className="relative overflow-hidden"
      style={{ maxWidth: 1220, margin: "0 auto 34px", padding: "116px 28px" }}
    >
      {shaderVariant ? (
        <LandingAtmosphereShader
          variant={shaderVariant}
          intensity="subtle"
          className="absolute inset-0 rounded-[28px]"
        />
      ) : null}
      <div
        className="absolute inset-0 rounded-[28px]"
        style={{
          background: chrome.background,
          border: `1px solid ${chrome.border}`,
          boxShadow: chrome.shadow,
        }}
      />
      <MetallicSweepShader
        variant="section"
        accentColor="#D8B4FE"
        delayMs={layout === "odd" ? 250 : 900}
        className="rounded-[28px]"
      />
      <div
        className="absolute inset-[10px] rounded-[22px] pointer-events-none"
        style={{
          border: `1px solid ${chrome.innerBorder}`,
          background:
              "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 28%, rgba(9,9,15,0.12) 100%)",
        }}
      />
      <div className="relative z-10">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: copyFirst
              ? "minmax(0, 0.82fr) minmax(0, 1.18fr)"
              : "minmax(0, 1.18fr) minmax(0, 0.82fr)",
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
      </div>
    </section>
  );
}
