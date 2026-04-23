import { ClyptLogo } from "@/components/ui/ClyptLogo";

const Footer = () => {
  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "8px 24px",
      }}
    >
      <div className="flex items-center justify-between max-w-[1100px] mx-auto">
        <button
          onClick={scrollTop}
          aria-label="Scroll to top"
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
            transformOrigin: "left center",
            transition: "transform 120ms ease",
          }}
          className="active:scale-[0.97]"
        >
          <ClyptLogo size="lg" />
        </button>
        <div className="flex items-center gap-6 font-sans" style={{ fontSize: 13 }}>
          <a
            href="#"
            style={{ color: "rgba(255,255,255,0.35)" }}
            className="transition-colors hover:!text-white/70"
          >
            Privacy
          </a>
          <a
            href="#"
            style={{ color: "rgba(255,255,255,0.35)" }}
            className="transition-colors hover:!text-white/70"
          >
            Terms
          </a>
          <a
            href="#"
            style={{ color: "rgba(255,255,255,0.35)" }}
            className="transition-colors hover:!text-white/70"
          >
            Contact
          </a>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>© 2026 Clypt</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
