import { NavLink, useLocation } from "react-router-dom";
import { User, Mic, Link as LinkIcon, Bell } from "lucide-react";

const NAV = [
  { label: "Profile", icon: User, path: "/settings", exact: true },
  { label: "Voiceprints", icon: Mic, path: "/settings/voiceprints" },
  { label: "Integrations", icon: LinkIcon, path: "/settings/integrations", soon: true },
  { label: "Notifications", icon: Bell, path: "/settings/notifications", soon: true },
];

const linkBase =
  "w-full flex items-center gap-[10px] px-[10px] py-[8px] rounded-[6px] text-[14px] font-heading font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors no-underline";
const linkActive =
  "bg-[var(--color-surface-2)] text-[var(--color-text-primary)] [&_svg]:text-[var(--color-violet)]";

export default function SettingsNav() {
  const location = useLocation();

  return (
    <div
      style={{
        width: 200,
        flexShrink: 0,
        borderRight: "1px solid var(--color-border)",
        background: "var(--color-surface-1)",
        padding: "24px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <h2
        style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: "var(--color-text-primary)",
          margin: 0,
          padding: "0 10px",
          marginBottom: 16,
        }}
      >
        Settings
      </h2>

      {NAV.map((item) => {
        const isActive = item.exact
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path);

        return (
          <NavLink
            key={item.path}
            to={item.soon ? "#" : item.path}
            onClick={item.soon ? (e) => e.preventDefault() : undefined}
            className={`${linkBase} ${isActive && !item.soon ? linkActive : ""}`}
            style={item.soon ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
          >
            <item.icon
              size={18}
              className="shrink-0"
              style={{ color: isActive && !item.soon ? undefined : "var(--color-text-muted)" }}
            />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.soon && (
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: 10,
                  color: "var(--color-text-muted)",
                  background: "var(--color-surface-3)",
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                Soon
              </span>
            )}
          </NavLink>
        );
      })}
    </div>
  );
}
