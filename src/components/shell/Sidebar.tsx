import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { navItems } from "./nav";
import { cn } from "@/lib/cn";

export function Sidebar() {
  const { t } = useTranslation();
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-surface">
      <div className="flex h-14 items-center gap-2 border-b border-line px-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
          T
        </span>
        <span className="text-sm font-semibold text-ink">TMS Ops</span>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-soft text-brand"
                  : "text-ink-soft hover:bg-canvas hover:text-ink",
              )
            }
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-line px-5 py-3 text-xs text-ink-faint">
        Mock data · no backend
      </div>
    </aside>
  );
}
