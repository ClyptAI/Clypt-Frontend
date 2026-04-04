import { ClyptLogo } from "@/components/ui/ClyptLogo";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
];

const Navbar = () => {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center"
      style={{
        height: 56,
        backgroundColor: "rgba(10,9,9,0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center justify-between w-full max-w-6xl px-6">
        <ClyptLogo size="md" />

        <div className="flex items-center" style={{ gap: 32 }}>
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="font-sans transition-colors"
              style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="font-sans transition-colors"
            style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          >
            Sign in
          </a>
          <a
            href="/signup"
            className="font-sans font-semibold transition-all active:scale-[0.97]"
            style={{
              fontSize: 14,
              color: "#0A0909",
              backgroundColor: "#A78BFA",
              padding: "10px 20px",
              borderRadius: 9999,
              boxShadow: "0 0 24px -4px rgba(167,139,250,0.5)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#C4B5FD";
              e.currentTarget.style.boxShadow = "0 0 36px -4px rgba(167,139,250,0.65)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#A78BFA";
              e.currentTarget.style.boxShadow = "0 0 24px -4px rgba(167,139,250,0.5)";
            }}
          >
            Get started free
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
