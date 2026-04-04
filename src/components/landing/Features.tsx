import { GitBranch, UserCheck, Scissors } from "lucide-react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const columns = [
  {
    icon: GitBranch,
    heading: "Graph-first understanding",
    body: "Every video becomes a navigable semantic graph. Explore narrative structure, rhetorical relationships, and clip candidates in one surface.",
  },
  {
    icon: UserCheck,
    heading: "Human-directed grounding",
    body: "AI proposes. You decide. Assign speakers to tracklets, set camera intent, and override any automated framing with a manual crop.",
  },
  {
    icon: Scissors,
    heading: "Precise 9:16 rendering",
    body: "Follow, reaction, split, wide, or manual crop — every shot gets an explicit layout instruction before the renderer touches it.",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-10">
      <div className="max-w-[1100px] mx-auto grid grid-cols-3 gap-8">
        {columns.map((col, i) => (
          <motion.div
            key={col.heading}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease, delay: i * 0.12 }}
          >
            <motion.div
              className="inline-flex items-center justify-center rounded-lg transition-shadow"
              style={{ width: 48, height: 48, background: "var(--color-surface-2)" }}
              whileHover={{
                scale: 1.15,
                rotate: 8,
                boxShadow: "0 0 0 6px rgba(167,139,250,0.12)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <col.icon size={24} color="var(--color-violet)" />
            </motion.div>
            <h3 className="font-heading font-semibold text-[var(--color-text-primary)] mt-4" style={{ fontSize: 20 }}>
              {col.heading}
            </h3>
            <p className="font-sans font-normal text-[var(--color-text-secondary)] mt-2 leading-relaxed" style={{ fontSize: 15 }}>
              {col.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;
