import { ReactNode } from "react";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

interface DemoSectionLayoutProps {
  layout: "odd" | "even" | "full";
  copy: ReactNode;
  ui: ReactNode;
}

export default function DemoSectionLayout({ layout, copy, ui }: DemoSectionLayoutProps) {
  if (layout === "full") {
    return (
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
        >
          {copy}
        </motion.div>
        <motion.div
          style={{ marginTop: 56 }}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.15, ease }}
        >
          {ui}
        </motion.div>
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
    >
      {ui}
    </motion.div>
  );

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 24px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: copyFirst ? "40% 60%" : "60% 40%",
          gap: 48,
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
