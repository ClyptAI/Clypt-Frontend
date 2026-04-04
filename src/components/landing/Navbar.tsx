import { ClyptLogo } from "@/components/ui/ClyptLogo";

const Navbar = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-[var(--color-border-subtle)] flex items-center justify-between px-10" style={{ backgroundColor: 'rgba(10, 9, 9, 0.9)', backdropFilter: 'blur(8px)' }}>
      <div
        className="flex items-center"
        style={{ gap: 9 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <ClyptMark
            size={18}
            bottomColor={hovered ? "#C4B5FD" : "#A78BFA"}
          />
        </motion.div>
        <span
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: "-0.03em",
            color: "var(--color-text-primary)",
            lineHeight: 1,
          }}
        >
          clypt
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button className="bg-transparent text-[var(--color-text-secondary)] border-none font-heading font-medium text-sm px-4 py-2 rounded-[6px] transition-colors hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]">
          Sign in
        </button>
        <button className="bg-[var(--color-violet)] text-[var(--color-bg)] font-heading font-semibold text-sm px-4 py-2 rounded-[6px] transition-colors hover:bg-[var(--color-violet-dim)]">
          Get started free
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
