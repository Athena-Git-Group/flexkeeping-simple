import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { IconBox, IconGrid } from "@/pages/workday/icons";
import { useTasksStore } from "@/pages/workday/tasks/store";
import { SEED_ACTIVITIES, useActivityStore } from "@/pages/workday/shell/store";
import { useDismissable } from "@/pages/workday/shell/useDismissable";

// Same inline design tokens as NotificationsPanel: accent #16A3A3, ink #37474F
// (standalone mock — exact hex inline instead of extending tailwind.config).
const ACCENT = "#16A3A3";
const INK = "#37474F";

interface ActivityRow {
  id: string;
  /** Already-resolved display strings (seeds from i18n, quickActions from task data) */
  actor: string;
  text: string;
  time: string;
  highlight: boolean;
}

export function ActivityPanel({
  open,
  onToggle,
  onClose,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const tasks = useTasksStore((s) => s.tasks);
  const seedsCleared = useActivityStore((s) => s.seedsCleared);
  const clearedQuickActionIds = useActivityStore((s) => s.clearedQuickActionIds);
  const clear = useActivityStore((s) => s.clear);
  useDismissable(open, onClose, rootRef);

  const quickActions = tasks.filter(
    (task) => task.source === "quickAction" && !clearedQuickActionIds.includes(task.id),
  );

  // quickAction rows first (they are "live" events), demo seeds after — the
  // seeds carry hand-written relative times so a real timestamp sort is moot.
  const rows: ActivityRow[] = [
    ...quickActions.map((task) => ({
      id: task.id,
      actor: t("workday.shell.actQuickActionActor"),
      text:
        task.room !== null
          ? t("workday.shell.actQuickActionText", { title: task.title, room: task.room })
          : t("workday.shell.actQuickActionTextNoRoom", { title: task.title }),
      time: t("workday.shell.actTimeJustNow"),
      highlight: true,
    })),
    ...(seedsCleared
      ? []
      : SEED_ACTIVITIES.map((a) => ({
          id: a.id,
          actor: t(`workday.shell.${a.actorKey}`),
          text: t(`workday.shell.${a.textKey}`),
          time: t(`workday.shell.${a.timeKey}`),
          highlight: false,
        }))),
  ];

  const badge = quickActions.length + (seedsCleared ? 0 : SEED_ACTIVITIES.length);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={cn("relative block", open ? "text-gray-700" : "text-gray-500 hover:text-gray-700")}
        aria-label={t("workday.shell.activityTitle")}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <IconGrid size={18} />
        {badge > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-semibold text-white">
            {badge}
          </span>
        )}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={t("workday.shell.activityTitle")}
          className="absolute right-0 top-full z-50 mt-3 flex max-h-[480px] w-[380px] flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
            <span className="text-sm font-semibold" style={{ color: INK }}>
              {t("workday.shell.activityTitle")}
            </span>
            <button
              type="button"
              onClick={() => clear(quickActions.map((task) => task.id))}
              disabled={badge === 0}
              className="text-xs text-[#16A3A3] hover:underline disabled:text-gray-300 disabled:no-underline"
            >
              {t("workday.shell.clearActivity")}
            </button>
          </div>
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <IconBox size={24} className="text-gray-300" />
              <span className="text-xs text-gray-400">
                {t("workday.shell.noActivity")}
              </span>
            </div>
          ) : (
            <ul className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto">
              {rows.map((row) => (
                <li key={row.id} className="relative">
                  {row.highlight && (
                    <span
                      className="absolute inset-y-0 left-0 w-[3px]"
                      style={{ backgroundColor: ACCENT }}
                    />
                  )}
                  <div
                    className={cn(
                      "flex items-start gap-3 px-4 py-3",
                      row.highlight && "bg-[#16A3A3]/5",
                    )}
                  >
                    <span className="min-w-0 flex-1 text-sm text-gray-600">
                      <span className="font-semibold" style={{ color: INK }}>
                        {row.actor}
                      </span>{" "}
                      {row.text}
                    </span>
                    <span className="shrink-0 pt-0.5 text-xs text-gray-400">
                      {row.time}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
