import { ClyptLogo } from "@/components/ui/ClyptLogo";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-[var(--color-border-subtle)] flex items-center justify-between px-10" style={{ backgroundColor: 'rgba(10, 9, 9, 0.9)', backdropFilter: 'blur(8px)' }}>
      <ClyptLogo size="md" />
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
