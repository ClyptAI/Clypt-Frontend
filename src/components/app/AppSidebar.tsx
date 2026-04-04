import { LayoutGrid, Film, Plus, Settings, ChevronDown } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { ClyptLogo } from "@/components/ui/ClyptLogo";

const navItems = [
  { title: "Library", icon: LayoutGrid, path: "/library" },
  { title: "Clips", icon: Film, path: "/library/clips" },
];

const bottomNavItems = [
  { title: "Settings", icon: Settings, path: "/settings" },
];

const navLinkBase =
  "w-full flex items-center gap-[10px] px-[10px] py-[8px] rounded-[6px] text-[14px] font-heading font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors";
const navLinkActive =
  "bg-[var(--color-surface-2)] text-[var(--color-text-primary)] [&_svg]:text-[var(--color-violet)]";

export default function AppSidebar() {
  return (
    <aside
      className="w-[220px] h-screen sticky top-0 flex flex-col bg-[var(--color-surface-1)] border-r border-[var(--color-border)]"
      style={{ padding: "20px 12px" }}
    >
      {/* Logo */}
      <div className="flex items-center px-[8px] pb-[20px] border-b border-[var(--color-border-subtle)]" style={{ padding: "16px 14px", paddingBottom: 20 }}>
        <ClyptLogo size="sm" />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-[2px] flex-1 mt-[12px]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={navLinkBase}
            activeClassName={navLinkActive}
          >
            <item.icon size={18} className="text-[var(--color-text-muted)] shrink-0" />
            <span>{item.title}</span>
          </NavLink>
        ))}

        <Button
          className="mt-[12px] w-full flex items-center justify-center gap-[8px]"
          variant="default"
        >
          <Plus size={16} />
          <span className="font-heading font-semibold text-[14px]">New Run</span>
        </Button>
      </nav>

      {/* Bottom */}
      <div className="pt-[16px] border-t border-[var(--color-border-subtle)] flex flex-col gap-[8px]">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={navLinkBase}
            activeClassName={navLinkActive}
          >
            <item.icon size={18} className="text-[var(--color-text-muted)] shrink-0" />
            <span>{item.title}</span>
          </NavLink>
        ))}

        <div className="flex items-center gap-[10px] px-[10px] py-[8px]">
          <div className="w-[28px] h-[28px] rounded-full bg-[var(--color-surface-3)] flex items-center justify-center shrink-0">
            <span className="font-heading font-semibold text-[12px] text-[var(--color-text-secondary)]">
              RK
            </span>
          </div>
          <span className="font-heading font-medium text-[13px] text-[var(--color-text-primary)] flex-1 truncate">
            Rithvik K.
          </span>
          <ChevronDown size={14} className="text-[var(--color-text-muted)] shrink-0" />
        </div>
      </div>
    </aside>
  );
}
