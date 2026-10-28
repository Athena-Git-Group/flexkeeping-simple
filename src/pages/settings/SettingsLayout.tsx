import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";

const TABS = [
  { to: "/settings/staff", labelKey: "settings.subnav.staff" },
  { to: "/settings/roles", labelKey: "settings.subnav.roles" },
  { to: "/settings/property", labelKey: "settings.subnav.property" },
];

export function SettingsLayout() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-ink">{t("settings.title")}</h1>
      <nav className="mb-6 flex gap-1 border-b border-line">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-brand text-brand"
                  : "border-transparent text-ink-soft hover:text-ink",
              )
            }
          >
            {t(tab.labelKey)}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
