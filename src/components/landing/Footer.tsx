const Footer = () => {
  return (
    <footer className="border-t border-[var(--color-border-subtle)] py-8 px-10">
      <div className="flex items-center justify-between max-w-[1400px] mx-auto">
        <span className="font-heading font-bold text-base tracking-[-0.02em] text-[var(--color-text-primary)]">
          clypt
        </span>
        <div className="flex items-center gap-6 font-sans text-[13px] text-[var(--color-text-muted)]">
          <a href="#" className="hover:text-[var(--color-text-secondary)] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[var(--color-text-secondary)] transition-colors">Terms</a>
          <a href="#" className="hover:text-[var(--color-text-secondary)] transition-colors">Status</a>
          <span>© 2026</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
