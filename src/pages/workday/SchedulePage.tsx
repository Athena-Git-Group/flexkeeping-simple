// Weekly schedule timeline page (Flexkeeping-style prototype, interactive demo)

import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  chipPalette,
  createScheduleTasks,
  DAY_KEYS,
  ROOMS,
  STAY_SPANS,
  scheduleHousekeepers,
  statusColor,
  taskVariant,
  THIS_WEEK,
  WEEK_IDS,
  type ScheduleTask,
  type TaskKey,
} from "@/pages/workday/schedule/data";

const COLS = 7;

type ViewMode = "housekeepers" | "rooms";

interface Toast {
  id: number;
  message: string;
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={dir === "left" ? "" : "rotate-180"}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function CaretDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z" />
    </svg>
  );
}

function SquaresIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  );
}

function HousekeeperIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </svg>
  );
}

function RoomsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V8l9-5 9 5v13" />
      <rect x="9" y="13" width="6" height="8" />
    </svg>
  );
}

function BottleIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="#78909C">
      <path d="M10 2h4v4l2 3v13a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l2-3z" />
    </svg>
  );
}

function Chip({
  task,
  showRoom,
  selected,
  onClick,
}: {
  task: ScheduleTask;
  showRoom?: boolean;
  selected?: boolean;
  onClick: (task: ScheduleTask) => void;
}) {
  const { t } = useTranslation();
  const pal = chipPalette[taskVariant[task.task]];
  return (
    <button
      type="button"
      onClick={() => onClick(task)}
      className="flex h-10 w-full items-stretch gap-1 text-left"
    >
      {task.ep && (
        <span className="flex h-10 w-5 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-[9px] font-semibold text-[#37474F]">
          EP
        </span>
      )}
      <div
        className={
          "flex min-w-0 flex-1 items-stretch overflow-hidden rounded " +
          (selected ? "ring-2 ring-[#16A3A3]" : "")
        }
        style={{ backgroundColor: pal.bg }}
      >
        <span className="w-1.5 shrink-0" style={{ backgroundColor: pal.bar }} />
        <div className="flex min-w-0 flex-1 flex-col justify-center px-1.5 py-0.5 leading-tight">
          <span className="flex items-center gap-1 truncate text-[10px] font-semibold" style={{ color: pal.text }}>
            {task.bottle && <BottleIcon />}
            {task.dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#37474F]" />}
            {showRoom && <span className="shrink-0 text-gray-500">{task.room}</span>}
            <span className="truncate">{t(`workday.schedule.tasks.${task.task}`)}</span>
          </span>
          <span className="flex items-center gap-1 truncate text-[9px] text-gray-500">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: statusColor[task.status] }}
            />
            {t(`workday.schedule.status.${task.status}`)}
          </span>
        </div>
        {task.credits > 0 && (
          <span className="flex shrink-0 items-center pr-1.5 text-[10px] font-semibold text-gray-500">
            {task.credits}
          </span>
        )}
      </div>
    </button>
  );
}

function HeaderScore({ hk, credits, bold }: { hk: string; credits: string; bold?: boolean }) {
  const textCls = bold ? "text-[10px] font-bold text-[#37474F]" : "text-[10px] font-medium text-gray-500";
  return (
    <div className="flex items-center justify-center gap-3 py-1">
      <span className="flex items-center gap-1">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E2574C]">
          <PersonIcon />
        </span>
        <span className={textCls}>{hk}</span>
      </span>
      <span className="flex items-center gap-1">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#16A3A3]">
          <SquaresIcon />
        </span>
        <span className={textCls}>{credits}</span>
      </span>
    </div>
  );
}

export function SchedulePage() {
  const { t } = useTranslation();

  const [tasks, setTasks] = useState<ScheduleTask[]>(() => createScheduleTasks());
  const [weekIndex, setWeekIndex] = useState(THIS_WEEK);
  const [selectedDay, setSelectedDay] = useState(3); // Thursday
  const [dayMenuOpen, setDayMenuOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("rooms");
  const [creditsPerDay, setCreditsPerDay] = useState(300);
  const [creditOpen, setCreditOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const notify = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2500);
  }, []);

  const weekTasks = useMemo(
    () => tasks.filter((task) => task.week === weekIndex),
    [tasks, weekIndex],
  );

  const selectedTask = useMemo(
    () => (selectedTaskId === null ? null : tasks.find((task) => task.id === selectedTaskId) ?? null),
    [tasks, selectedTaskId],
  );

  // Per-day header stats: assigned housekeepers / total, done credits / total credits
  const headerStats = useMemo(
    () =>
      Array.from({ length: COLS }, (_, day) => {
        const dayTasks = weekTasks.filter((task) => task.day === day);
        const assigned = new Set(
          dayTasks.filter((task) => task.housekeeper).map((task) => task.housekeeper),
        ).size;
        const total = dayTasks.reduce((sum, task) => sum + task.credits, 0);
        const done = dayTasks
          .filter((task) => task.status !== "dirty")
          .reduce((sum, task) => sum + task.credits, 0);
        return {
          hk: `${assigned}/${scheduleHousekeepers.length}`,
          credits: `${done}/${total}`,
        };
      }),
    [weekTasks],
  );

  // Credit details summary for the current week
  const creditSummary = useMemo(() => {
    const byTask = new Map<TaskKey, { num: number; credits: number }>();
    for (const task of weekTasks) {
      const entry = byTask.get(task.task) ?? { num: 0, credits: 0 };
      entry.num += 1;
      entry.credits += task.credits;
      byTask.set(task.task, entry);
    }
    const assignedHks = new Set(
      weekTasks.filter((task) => task.housekeeper).map((task) => task.housekeeper),
    ).size;
    const total = weekTasks.reduce((sum, task) => sum + task.credits, 0);
    const done = weekTasks
      .filter((task) => task.status !== "dirty")
      .reduce((sum, task) => sum + task.credits, 0);
    // Housekeepers whose credits exceed the daily limit on at least one day
    const perHkDay = new Map<string, number>();
    for (const task of weekTasks) {
      if (!task.housekeeper) continue;
      const key = `${task.housekeeper}|${task.day}`;
      perHkDay.set(key, (perHkDay.get(key) ?? 0) + task.credits);
    }
    const overLimit: Array<{ name: string; credits: number }> = [];
    for (const [key, credits] of perHkDay) {
      if (credits > creditsPerDay) {
        const name = key.split("|")[0];
        const existing = overLimit.find((o) => o.name === name);
        if (existing) existing.credits = Math.max(existing.credits, credits);
        else overLimit.push({ name, credits });
      }
    }
    return {
      items: [...byTask.entries()].map(([task, entry]) => ({ task, ...entry })),
      assignedHks,
      total,
      done,
      overLimit,
    };
  }, [weekTasks, creditsPerDay]);

  const changeWeek = (delta: number) => {
    setWeekIndex((prev) => Math.min(WEEK_IDS.length - 1, Math.max(0, prev + delta)));
    setSelectedTaskId(null);
  };

  const handleAutoAssign = () => {
    const unassigned = weekTasks.filter((task) => !task.housekeeper);
    if (unassigned.length === 0) {
      notify(t("workday.schedule.autoAssignNone"));
      return;
    }
    const assignment = new Map(
      unassigned.map((task, i) => [
        task.id,
        scheduleHousekeepers[i % scheduleHousekeepers.length],
      ]),
    );
    setTasks((prev) =>
      prev.map((task) =>
        assignment.has(task.id) ? { ...task, housekeeper: assignment.get(task.id) } : task,
      ),
    );
    notify(t("workday.schedule.autoAssignToast", { count: unassigned.length }));
  };

  const handleMarkDone = () => {
    if (!selectedTask) return;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === selectedTask.id ? { ...task, status: "cleaned" } : task,
      ),
    );
  };

  const openTask = useCallback((task: ScheduleTask) => {
    setSelectedTaskId((prev) => (prev === task.id ? null : task.id));
  }, []);

  const rowLabels = view === "rooms" ? ROOMS : scheduleHousekeepers;

  const tasksForCell = (label: string, day: number): ScheduleTask[] =>
    weekTasks.filter(
      (task) =>
        task.day === day &&
        (view === "rooms" ? task.room === label : task.housekeeper === label),
    );

  const unassignedWeekTasks = weekTasks.filter((task) => !task.housekeeper);

  const dayColClass = (day: number) =>
    day === 0 ? "w-56 border-r-2 border-dashed border-gray-300" : "w-36";

  const renderRow = (label: string, getTasks: (day: number) => ScheduleTask[], key: string) => {
    const span =
      view === "rooms"
        ? STAY_SPANS.find((s) => s.week === weekIndex && s.room === label)
        : undefined;
    return (
      <div key={key} className="flex border-b border-gray-100" style={{ minHeight: 52 }}>
        <div className="sticky left-0 z-10 flex w-40 shrink-0 items-center border-r border-gray-200 bg-white px-4 text-sm font-medium text-[#37474F]">
          <span className="truncate">{label}</span>
        </div>
        {Array.from({ length: COLS }, (_, day) => {
          const cellTasks = getTasks(day);
          const inSpan = span && day >= span.from && day <= span.to;
          return (
            <div
              key={day}
              className={
                "relative flex shrink-0 items-center px-1 " +
                dayColClass(day) +
                (day === selectedDay ? " bg-[#EFF8F7]" : "")
              }
            >
              {inSpan && (
                <div
                  className={
                    "absolute inset-y-3.5 bg-[#DDF0EF] " +
                    (day === span!.from ? "left-1 rounded-l " : "left-0 ") +
                    (day === span!.to ? "right-1 rounded-r" : "right-0")
                  }
                />
              )}
              {cellTasks.length > 0 && (
                <div className="relative flex w-full flex-col gap-1 py-1">
                  {cellTasks.map((task) => (
                    <Chip
                      key={task.id}
                      task={task}
                      showRoom={view === "housekeepers"}
                      selected={task.id === selectedTaskId}
                      onClick={openTask}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative flex h-full flex-col gap-3 bg-[#F7F9FB] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#37474F]">
            {t(`workday.schedule.weeks.${WEEK_IDS[weekIndex]}`)}
          </h1>
          <button
            type="button"
            disabled={weekIndex === 0}
            onClick={() => changeWeek(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
            aria-label={t("workday.schedule.prevWeek")}
          >
            <ChevronIcon dir="left" />
          </button>
          <button
            type="button"
            onClick={() => {
              setWeekIndex(THIS_WEEK);
              setSelectedTaskId(null);
            }}
            className="h-8 rounded border border-gray-300 bg-white px-3 text-sm text-[#37474F] hover:bg-gray-50"
          >
            {t("workday.schedule.thisWeek")}
          </button>
          <button
            type="button"
            disabled={weekIndex === WEEK_IDS.length - 1}
            onClick={() => changeWeek(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
            aria-label={t("workday.schedule.nextWeek")}
          >
            <ChevronIcon dir="right" />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDayMenuOpen((open) => !open)}
              className="flex h-8 items-center gap-2 rounded border border-gray-300 bg-white px-3 text-sm text-[#37474F] hover:bg-gray-50"
            >
              {t(`workday.schedule.days.${DAY_KEYS[selectedDay]}`)}
              <CaretDownIcon />
            </button>
            {dayMenuOpen && (
              <div className="absolute left-0 top-9 z-30 w-36 rounded border border-gray-200 bg-white py-1 shadow-lg">
                {DAY_KEYS.map((dayKey, day) => (
                  <button
                    key={dayKey}
                    type="button"
                    onClick={() => {
                      setSelectedDay(day);
                      setDayMenuOpen(false);
                    }}
                    className={
                      "block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 " +
                      (day === selectedDay
                        ? "font-semibold text-[#16A3A3]"
                        : "text-[#37474F]")
                    }
                  >
                    {t(`workday.schedule.days.${dayKey}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-500" htmlFor="credits-per-hk">
            {t("workday.schedule.creditsPerDay")}
          </label>
          <input
            id="credits-per-hk"
            type="number"
            min={0}
            value={creditsPerDay}
            onChange={(e) => setCreditsPerDay(Math.max(0, Number(e.target.value) || 0))}
            className="h-8 w-20 rounded border border-gray-300 px-2 text-sm text-[#37474F] focus:border-[#16A3A3] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAutoAssign}
            className="h-8 rounded border border-gray-300 bg-white px-3 text-sm font-medium text-[#37474F] hover:bg-gray-50"
          >
            {t("workday.schedule.autoAssign")}
          </button>
          <button
            type="button"
            onClick={() => setCreditOpen((open) => !open)}
            className={
              "h-8 rounded border px-3 text-sm font-medium " +
              (creditOpen
                ? "border-[#16A3A3] bg-[#EFF8F7] text-[#16A3A3]"
                : "border-gray-300 bg-white text-[#37474F] hover:bg-gray-50")
            }
          >
            {t("workday.schedule.creditDetails")}
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex overflow-hidden rounded border border-gray-300">
          <button
            type="button"
            onClick={() => {
              setView("housekeepers");
              setSelectedTaskId(null);
            }}
            className={
              "flex items-center gap-2 px-4 py-1.5 text-sm " +
              (view === "housekeepers"
                ? "bg-[#37474F] text-white"
                : "bg-white text-[#37474F] hover:bg-gray-50")
            }
          >
            <HousekeeperIcon />
            {t("workday.schedule.housekeepers")}
          </button>
          <button
            type="button"
            onClick={() => {
              setView("rooms");
              setSelectedTaskId(null);
            }}
            className={
              "flex items-center gap-2 px-4 py-1.5 text-sm " +
              (view === "rooms"
                ? "bg-[#37474F] text-white"
                : "bg-white text-[#37474F] hover:bg-gray-50")
            }
          >
            <RoomsIcon />
            {t("workday.schedule.rooms")}
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="h-full overflow-x-auto overflow-y-auto">
          <div className="min-w-[1180px]">
            <div className="flex border-b border-gray-200">
              <div className="sticky left-0 z-10 w-40 shrink-0 border-r border-gray-200 bg-white px-3 py-2">
                <div className="flex h-8 items-center gap-2 rounded border border-gray-300 px-2 text-gray-400">
                  <SearchIcon />
                  <span className="text-sm">{t("workday.schedule.search")}</span>
                </div>
              </div>
              {headerStats.map((s, day) => (
                <div
                  key={day}
                  className={
                    "shrink-0 " +
                    dayColClass(day) +
                    (day === selectedDay ? " bg-[#EFF8F7]" : "")
                  }
                >
                  <div
                    className={
                      "pt-1 text-center text-[10px] " +
                      (day === selectedDay
                        ? "font-bold text-[#16A3A3]"
                        : "text-gray-400")
                    }
                  >
                    {t(`workday.schedule.days.${DAY_KEYS[day]}`)}
                  </div>
                  <HeaderScore hk={s.hk} credits={s.credits} bold={day === selectedDay} />
                </div>
              ))}
            </div>

            {rowLabels.map((label) =>
              renderRow(label, (day) => tasksForCell(label, day), `${view}-${label}`),
            )}
            {view === "housekeepers" &&
              unassignedWeekTasks.length > 0 &&
              renderRow(
                t("workday.schedule.taskDetails.unassigned"),
                (day) => unassignedWeekTasks.filter((task) => task.day === day),
                "unassigned",
              )}
          </div>
        </div>

        {creditOpen && (
          <div className="absolute right-6 top-4 z-20 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-[#37474F]">
                {t("workday.schedule.creditDetails")}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {t(`workday.schedule.weeks.${WEEK_IDS[weekIndex]}`)}
                </span>
                <button
                  type="button"
                  onClick={() => setCreditOpen(false)}
                  aria-label={t("workday.schedule.taskDetails.close")}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="rounded border border-gray-200 p-2">
                <div className="text-[10px] text-gray-500">
                  {t("workday.schedule.housekeepers")}
                </div>
                <div className="text-lg font-semibold text-[#16A3A3]">
                  {creditSummary.assignedHks}{" "}
                  <span className="text-xs font-normal text-gray-400">
                    /{scheduleHousekeepers.length}
                  </span>
                </div>
              </div>
              <div className="rounded border border-gray-200 p-2">
                <div className="text-[10px] text-gray-500">{t("workday.schedule.credits")}</div>
                <div className="text-lg font-semibold text-[#16A3A3]">
                  {creditSummary.done}{" "}
                  <span className="text-xs font-normal text-gray-400">
                    /{creditSummary.total}
                  </span>
                </div>
              </div>
            </div>
            <ul className="space-y-1.5">
              {creditSummary.items.map((it) => (
                <li
                  key={it.task}
                  className="flex items-center justify-between text-xs text-[#37474F]"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: chipPalette[taskVariant[it.task]].bar }}
                    />
                    {t("workday.schedule.creditItem", {
                      num: it.num,
                      type: t(`workday.schedule.tasks.${it.task}`),
                    })}
                  </span>
                  <span className="font-medium text-gray-500">{it.credits}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
              <span className="text-gray-500">{t("workday.schedule.totalCredits")}</span>
              <span className="font-semibold text-[#37474F]">{creditSummary.total}</span>
            </div>
            {creditSummary.overLimit.length > 0 && (
              <ul className="mt-2 space-y-1">
                {creditSummary.overLimit.map((o) => (
                  <li key={o.name} className="text-[10px] font-medium text-[#E2574C]">
                    {t("workday.schedule.overLimit", {
                      name: o.name,
                      credits: o.credits,
                      limit: creditsPerDay,
                    })}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {selectedTask && (
          <div className="absolute right-6 bottom-4 z-20 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-[#37474F]">
                {t("workday.schedule.taskDetails.title")}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTaskId(null)}
                aria-label={t("workday.schedule.taskDetails.close")}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <dl className="space-y-1.5 text-xs">
              {[
                {
                  label: t("workday.schedule.taskDetails.room"),
                  value: selectedTask.room,
                },
                {
                  label: t("workday.schedule.taskDetails.type"),
                  value: t(`workday.schedule.tasks.${selectedTask.task}`),
                },
                {
                  label: t("workday.schedule.taskDetails.creditsLabel"),
                  value: String(selectedTask.credits),
                },
                {
                  label: t("workday.schedule.taskDetails.housekeeper"),
                  value:
                    selectedTask.housekeeper ??
                    t("workday.schedule.taskDetails.unassigned"),
                },
                {
                  label: t("workday.schedule.taskDetails.date"),
                  value: `${t(`workday.schedule.weeks.${WEEK_IDS[selectedTask.week]}`)} · ${t(
                    `workday.schedule.days.${DAY_KEYS[selectedTask.day]}`,
                  )}`,
                },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <dt className="shrink-0 text-gray-500">{row.label}</dt>
                  <dd className="truncate text-right font-medium text-[#37474F]">{row.value}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3">
                <dt className="shrink-0 text-gray-500">
                  {t("workday.schedule.taskDetails.statusLabel")}
                </dt>
                <dd className="flex items-center gap-1.5 font-medium text-[#37474F]">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: statusColor[selectedTask.status] }}
                  />
                  {t(`workday.schedule.status.${selectedTask.status}`)}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              disabled={selectedTask.status !== "dirty"}
              onClick={handleMarkDone}
              className="mt-3 h-8 w-full rounded bg-[#16A3A3] text-sm font-medium text-white hover:bg-[#128C8C] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
              {selectedTask.status === "dirty"
                ? t("workday.schedule.taskDetails.markDone")
                : t("workday.schedule.taskDetails.done")}
            </button>
          </div>
        )}
      </div>

      <div className="pointer-events-none fixed bottom-6 right-6 z-50 space-y-2" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="rounded-lg bg-gray-800 px-4 py-2.5 text-sm text-white shadow-lg"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
