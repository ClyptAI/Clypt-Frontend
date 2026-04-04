import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const TryItBar = () => {
  return (
    <motion.section
      className="bg-[var(--color-surface-1)] py-20 px-10"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-[600px] mx-auto text-center">
        <h2 className="font-heading font-bold text-[var(--color-text-primary)] mb-2" style={{ fontSize: 30 }}>
          Try it with any video
        </h2>
        <p className="font-sans font-normal text-[var(--color-text-secondary)] mb-8" style={{ fontSize: 15 }}>
          No account needed for demo runs.
        </p>
        <div className="flex items-center gap-3">
          <Input
            placeholder="youtube.com/watch?v=..."
            className="h-[52px] text-base flex-1 transition-shadow duration-200 focus:shadow-[0_0_0_3px_rgba(167,139,250,0.15)]"
          />
          <Button variant="default" className="h-[52px] px-7 flex-shrink-0" data-cursor="pointer">
            <span>Analyze</span>
            <motion.span
              className="inline-block ml-1"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              →
            </motion.span>
          </Button>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-4">
          <ShieldCheck size={13} color="var(--color-green)" />
          <span className="font-sans text-xs" style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
            No account needed  ·  Demo runs are free  ·  No video is stored
          </span>
        </div>
      </div>
    </motion.section>
  );
};

export default TryItBar;
