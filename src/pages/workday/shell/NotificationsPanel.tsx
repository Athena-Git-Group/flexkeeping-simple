import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/cn";
import {
  IconBell,
  IconChecklist,
  IconGear,
  IconWrench,
} from "@/pages/workday/icons";
import {
  useNotificationsStore,
  type NotificationType,
} from "@/pages/workday/shell/store";
import { useDismissable } from "@/pages/workday/shell/useDismissable";

// Brand accent per design spec for these dropdowns (#16A3A3) — deliberately
// not the shell's TEAL sidebar constant, same reasoning: standalone mock,
// exact hex inline instead of extending tailwind.config.
const ACCENT = "#16A3A3";
const INK = "#37474F";

const TYPE_STYLES: Record<NotificationType, { chip: string; icon: JSX.Element }> = {
  task: { chip: "bg-[#16A3A3]/10 text-[#16A3A3]", icon: <IconChecklist size={14} /> },
  repair: { chip: "bg-amber-50 text-amber-600", icon: <IconWrench size={14} /> },
  urgent: { chip: "bg-red-50 text-red-500", icon: <IconBell size={14} /> },
  system: { chip: "bg-gray-100 text-gray-500", icon: <IconGear size={14} /> },
};

export function NotificationsPanel({
  open,
  onToggle,
  onClose,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const notifications = useNotificationsStore((s) => s.notifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  useDismissable(open, onClose, rootRef);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={cn("relative block", open ? "text-gray-700" : "text-gray-500 hover:text-gray-700")}
        aria-label={t("workday.shell.notificationsTitle")}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <IconBell size={18} />
        {unread > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={t("workday.shell.notificationsTitle")}
          className="absolute right-0 top-full z-50 mt-3 flex max-h-[480px] w-[380px] flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
            <span className="text-sm font-semibold" style={{ color: INK }}>
              {t("workday.shell.notificationsTitle")}
            </span>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unread === 0}
              className="text-xs text-[#16A3A3] hover:underline disabled:text-gray-300 disabled:no-underline"
            >
              {t("workday.shell.markAllRead")}
            </button>
          </div>
          <ul className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto">
            {notifications.map((n) => {
              const style = TYPE_STYLES[n.type];
              return (
                <li key={n.id} className="relative">
                  {!n.read && (
                    <span
                      className="absolute inset-y-0 left-0 w-[3px]"
                      style={{ backgroundColor: ACCENT }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left",
                      n.read
                        ? "hover:bg-gray-50"
                        : "bg-[#16A3A3]/5 hover:bg-[#16A3A3]/10",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        style.chip,
                      )}
                    >
                      {style.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn("block truncate text-sm", !n.read && "font-medium")}
                        style={{ color: INK }}
                      >
                        {t(`workday.shell.${n.titleKey}`)}
                      </span>
                      <span className="block truncate text-xs text-gray-500">
                        {t(`workday.shell.${n.detailKey}`)}
                      </span>
                    </span>
                    <span className="shrink-0 pt-0.5 text-xs text-gray-400">
                      {t(`workday.shell.${n.timeKey}`)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="shrink-0 border-t border-gray-200 py-2 text-center">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate("/tasks");
              }}
              className="text-xs text-[#16A3A3] hover:underline"
            >
              {t("workday.shell.viewAll")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
