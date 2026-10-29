import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/cn";
import { totalUnread, useChatStore } from "@/pages/workday/chat/store";
import { IconChatBubble } from "@/pages/workday/chat/shared";
import { ActivityPanel } from "@/pages/workday/shell/ActivityPanel";
import { NotificationsPanel } from "@/pages/workday/shell/NotificationsPanel";
import {
  IconBed,
  IconBook,
  IconBox,
  IconBroom,
  IconBuilding,
  IconChart,
  IconChecklist,
  IconChevron,
  IconFlow,
  IconGear,
  IconGrid,
  IconHelp,
  IconSearch,
  IconTasks,
  IconWrench,
} from "@/pages/workday/icons";

// Spec colors from the Flexkeeping demo screenshot; not part of the Tailwind
// theme on purpose — this shell is a standalone mock, so we avoid touching
// tailwind.config and keep the exact hex values inline.
export const TEAL = "#4DB6AC";
export const RED = "#E2574C";

const itemBase =
  "relative flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm";
const itemIdle = "text-[#444] hover:bg-gray-100";
const itemActive = "bg-teal-50 font-medium text-teal-600";

function ActiveBar() {
  return (
    <span
      className="absolute inset-y-0 left-0 w-[3px]"
      style={{ backgroundColor: TEAL }}
    />
  );
}

interface LeafItem {
  labelKey: string; // suffix under workday.shell.*
  icon: JSX.Element;
  to?: string; // undefined → pure display ("#")
  end?: boolean;
}

const topItems: LeafItem[] = [
  { labelKey: "rooms", icon: <IconBed size={16} />, to: "/", end: true },
  { labelKey: "tasks", icon: <IconTasks size={16} />, to: "/tasks" },
  { labelKey: "maintenance", icon: <IconWrench size={16} />, to: "/maintenance" },
  { labelKey: "housekeeping", icon: <IconBroom size={16} />, to: "/allocation" },
  { labelKey: "sops", icon: <IconBook size={16} />, to: "/sops" },
  { labelKey: "workflowBuilder", icon: <IconFlow size={16} />, to: "/workflow" },
  { labelKey: "checklistEditor", icon: <IconChecklist size={16} />, to: "/checklists" },
  { labelKey: "lostAndFound", icon: <IconBox size={16} />, to: "/lost-found" },
];

function NavLeaf({ item }: { item: LeafItem }) {
  const { t } = useTranslation();
  const label = t(`workday.shell.${item.labelKey}`);
  if (!item.to) {
    return (
      <button type="button" className={cn(itemBase, itemIdle)}>
        <span className="text-gray-500">{item.icon}</span>
        <span className="flex-1">{label}</span>
      </button>
    );
  }
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) => cn(itemBase, isActive ? itemActive : itemIdle)}
    >
      {({ isActive }) => (
        <>
          {isActive && <ActiveBar />}
          <span className={isActive ? "text-teal-600" : "text-gray-500"}>
            {item.icon}
          </span>
          <span className="flex-1">{label}</span>
        </>
      )}
    </NavLink>
  );
}

// Chat gets its own nav leaf (not a `topItems` entry) because it is the only
// item whose rendering depends on store state — the unread badge.
function ChatNavLeaf() {
  const { t } = useTranslation();
  const unread = totalUnread(useChatStore((s) => s.conversations));
  return (
    <NavLink
      to="/chat"
      className={({ isActive }) => cn(itemBase, isActive ? itemActive : itemIdle)}
    >
      {({ isActive }) => (
        <>
          {isActive && <ActiveBar />}
          <span className={isActive ? "text-teal-600" : "text-gray-500"}>
            <IconChatBubble size={16} />
          </span>
          <span className="flex-1">{t("workday.shell.chat")}</span>
          {unread > 0 && (
            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

interface SubItem {
  labelKey: string; // suffix under workday.shell.*
  to?: string;
}

function NavGroup({
  labelKey,
  icon,
  items,
  forceOpen,
}: {
  labelKey: string;
  icon: JSX.Element;
  items: SubItem[];
  forceOpen?: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const expanded = open || !!forceOpen;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(itemBase, itemIdle)}
      >
        <span className="text-gray-500">{icon}</span>
        <span className="flex-1">{t(`workday.shell.${labelKey}`)}</span>
        <IconChevron
          direction={expanded ? "up" : "down"}
          size={14}
          className="text-gray-400"
        />
      </button>
      {expanded &&
        items.map((sub) =>
          sub.to ? (
            <NavLink
              key={sub.labelKey}
              to={sub.to}
              className={({ isActive }) =>
                cn(
                  "relative flex w-full items-center py-2 pl-[52px] pr-5 text-left text-xs",
                  isActive ? itemActive : itemIdle,
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <ActiveBar />}
                  {t(`workday.shell.${sub.labelKey}`)}
                </>
              )}
            </NavLink>
          ) : (
            <button
              key={sub.labelKey}
              type="button"
              className="flex w-full items-center py-2 pl-[52px] pr-5 text-left text-xs text-[#444] hover:bg-gray-100"
            >
              {t(`workday.shell.${sub.labelKey}`)}
            </button>
          ),
        )}
    </>
  );
}

const analyticsItems: SubItem[] = [
  { labelKey: "kpis" },
  { labelKey: "allEvents" },
  { labelKey: "rooms" },
  { labelKey: "cleaningTimesDashboard", to: "/analytics/cleaning-times" },
  { labelKey: "turndown" },
  { labelKey: "cleaningFlaw", to: "/analytics/cleaning-flaw" },
  { labelKey: "tasks" },
  { labelKey: "repairs", to: "/analytics/repairs" },
  { labelKey: "maintenance" },
];

function Sidebar() {
  const { pathname } = useLocation();
  const inAnalytics = pathname.startsWith("/analytics");
  const inModules = pathname.startsWith("/modules");
  return (
    <aside className="flex w-[224px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center px-5">
        <span className="text-lg font-bold text-gray-800">tms-web</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-1">
        {topItems.map((item) => (
          <Fragment key={item.labelKey}>
            <NavLeaf item={item} />
            {item.labelKey === "tasks" && <ChatNavLeaf />}
          </Fragment>
        ))}
        <NavGroup
          labelKey="modules"
          icon={<IconGrid size={16} />}
          items={[{ labelKey: "modulesOverview", to: "/modules" }]}
          forceOpen={inModules}
        />
        <NavGroup
          labelKey="flexBi"
          icon={<IconChart size={16} />}
          items={[{ labelKey: "dashboards", to: "/bi" }]}
        />
        <NavGroup
          labelKey="analytics"
          icon={<IconChart size={16} />}
          items={analyticsItems}
          forceOpen={inAnalytics}
        />
        <NavGroup
          labelKey="administration"
          icon={<IconGear size={16} />}
          items={[{ labelKey: "users" }]}
        />
      </nav>
      <div className="border-t border-gray-200 p-3">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-gray-100"
          aria-label="Collapse sidebar"
        >
          <IconChevron direction="left" size={16} />
        </button>
      </div>
    </aside>
  );
}

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "zh-TW", label: "繁中" },
  { code: "ja", label: "日本語" },
] as const;

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage;
  return (
    <div className="flex items-center gap-1 text-xs">
      {LANGUAGES.map((lang, idx) => (
        <span key={lang.code} className="flex items-center gap-1">
          {idx > 0 && <span className="text-gray-300">｜</span>}
          <button
            type="button"
            onClick={() => void i18n.changeLanguage(lang.code)}
            className={cn(
              "px-0.5",
              current === lang.code
                ? "font-semibold text-teal-600"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            {lang.label}
          </button>
        </span>
      ))}
    </div>
  );
}

function TopBar() {
  const { t } = useTranslation();
  // One slot for both dropdowns so opening one always closes the other.
  const [openPanel, setOpenPanel] = useState<"activity" | "notifications" | null>(null);
  const toggle = (panel: "activity" | "notifications") =>
    setOpenPanel((cur) => (cur === panel ? null : panel));
  const close = () => setOpenPanel(null);
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-2">
        <IconBuilding size={18} className="text-gray-600" />
        <h1 className="text-base font-bold text-gray-800">{t("workday.shell.plazaHotel")}</h1>
      </div>
      <div className="flex items-center gap-5">
        <button type="button" className="text-gray-500 hover:text-gray-700" aria-label="Search">
          <IconSearch size={18} />
        </button>
        <button type="button" className="text-gray-500 hover:text-gray-700" aria-label="Help">
          <IconHelp size={18} />
        </button>
        <ActivityPanel
          open={openPanel === "activity"}
          onToggle={() => toggle("activity")}
          onClose={close}
        />
        <NotificationsPanel
          open={openPanel === "notifications"}
          onToggle={() => toggle("notifications")}
          onClose={close}
        />
        <LanguageSwitcher />
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: TEAL }}
          >
            KJ
          </span>
          <span className="text-sm text-gray-700">Kristine</span>
        </div>
      </div>
    </header>
  );
}

// Standalone full-screen layout: this shell intentionally does NOT render
// inside AppShell — it carries its own sidebar/topbar to mirror the demo.
// Child routes render inside <Outlet />.
export function WorkdayShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F9FB] text-gray-800">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
