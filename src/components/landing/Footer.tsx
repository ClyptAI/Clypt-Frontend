import { ClyptLogo } from "@/components/ui/ClyptLogo";

const Footer = () => {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "8px 24px",
      }}
    >
      <div className="flex items-center justify-between max-w-[1100px] mx-auto">
        <ClyptLogo size="lg" />
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
