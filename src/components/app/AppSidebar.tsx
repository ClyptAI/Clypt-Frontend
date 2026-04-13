import { LayoutGrid, Film, Plus, Settings, ChevronDown, Search } from "lucide-react";
import { useMatch, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { ClyptAnimatedMark } from "@/components/app/ClyptAnimatedMark";

const navItems = [
  { title: "Library", icon: LayoutGrid, path: "/library" },
  { title: "Clips", icon: Film, path: "/library/clips" },
];

const bottomNavItems = [
  { title: "Settings", icon: Settings, path: "/settings" },
];

const RUN_TABS = [
  { label: "Overview",        path: ""           },
  { label: "Timeline",        path: "/timeline"  },
  { label: "Cortex Graph",    path: "/graph"     },
  { label: "Search",          path: "/search"    },
  { label: "Clip Candidates", path: "/clips"     },
  { label: "Grounding",       path: "/grounding" },
  { label: "Render",          path: "/render"    },
];

const navLinkBase =
  "w-full flex items-center gap-[10px] px-[10px] py-[8px] rounded-[6px] text-[14px] font-heading font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors";
const navLinkActive =
  "bg-[var(--color-surface-2)] text-[var(--color-text-primary)] [&_svg]:text-[var(--color-violet)]";

const runTabBase =
  "w-full flex items-center px-[10px] py-[6px] pl-[18px] rounded-[6px] text-[13px] font-heading font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-secondary)] transition-colors";
const runTabActive =
  "text-[var(--color-text-primary)] bg-[var(--color-surface-2)] border-l-2 border-[var(--color-violet)] pl-[16px]";

export default function AppSidebar() {
  const navigate = useNavigate();
  const runMatch = useMatch("/runs/:id/*");
  const runId = runMatch?.params?.id;

  return (
    <aside
      className="w-[220px] h-screen sticky top-0 flex flex-col bg-[var(--color-surface-1)] border-r border-[var(--color-border)]"
      style={{ padding: "8px 12px" }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-center border-b border-[var(--color-border-subtle)] cursor-pointer overflow-hidden"
        style={{ padding: "6px 14px", paddingBottom: 8 }}
        onClick={() => navigate("/")}
      >
        <div style={{ margin: "-40px 0" }}>
          <ClyptAnimatedMark size={160} animate={false} />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-[2px] flex-1 mt-[12px]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
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
          onClick={() => navigate("/runs/new")}
        >
          <Plus size={16} />
          <span className="font-heading font-semibold text-[14px]">New Run</span>
        </Button>

        {runId && (
          <div className="mt-[16px] flex flex-col gap-[1px]">
            <span
              className="px-[10px] pb-[6px] font-heading font-semibold text-[10px] uppercase tracking-[0.08em]"
              style={{ color: "var(--color-text-muted)" }}
            >
              Current Run
            </span>
            {RUN_TABS.map((tab) => (
              <NavLink
                key={tab.label}
                to={`/runs/${runId}${tab.path}`}
                end={tab.path === ""}
                className={runTabBase}
                activeClassName={runTabActive}
              >
                {tab.label}
              </NavLink>
            ))}
          </div>
        )}
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
