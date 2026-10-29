import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTasksStore, type Task, type TaskPriority } from "@/pages/workday/tasks/store";
import { useRoomsStore } from "@/pages/workday/rooms/store";
import { REPAIR_RECORDS, resolveLabel, type AnalyticsRecord } from "@/pages/workday/analytics/data";
import { housekeepers } from "@/pages/workday/data";
import { IconCross, IconSearch, IconWrench } from "@/pages/workday/icons";

/** Repair-order display status (demo semantics: onHold tasks read as "assigned"). */
type RepairStatus = "pending" | "assigned" | "done";

const STATUS_CYCLE: Record<RepairStatus, RepairStatus> = {
  pending: "assigned",
  assigned: "done",
  done: "pending",
};

/** Maps a tasks-store status onto the repair display status. */
function taskToRepairStatus(status: Task["status"]): RepairStatus {
  if (status === "done") return "done";
  if (status === "onHold") return "assigned";
  return "pending";
}

/** Maps a repair display status back onto a tasks-store status. */
function repairToTaskStatus(status: RepairStatus): Task["status"] {
  if (status === "done") return "done";
  if (status === "assigned") return "onHold";
  return "pending";
}

const TECHNICIANS = ["Dietmar Rudolf", "Ben Hardy", "Marco Diaz"];

const REPAIR_CODES = ["ac", "tv", "wifi", "lightbulb", "plumbing", "other"] as const;
type RepairCode = (typeof REPAIR_CODES)[number];

const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

interface RepairRow {
  key: string;
  /** Seed rows come from the analytics dataset, task rows from the live store */
  kind: "seed" | "task";
  taskId?: string;
  displayId: string;
  room: string;
  title: string;
  priority: TaskPriority;
  createdBy: string;
  technician?: string;
  status: RepairStatus;
  quickAction: boolean;
}

function seedPriority(record: AnalyticsRecord): TaskPriority {
  if (record.priority === "facets.high") return "high";
  if (record.priority === "facets.low") return "low";
  return "medium";
}

const PRIORITY_CHIP: Record<TaskPriority, string> = {
  high: "bg-[#E2574C]/10 text-[#E2574C]",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-500",
};

const STATUS_CHIP: Record<RepairStatus, string> = {
  pending: "bg-[#E2574C]/10 text-[#E2574C]",
  assigned: "bg-amber-100 text-amber-700",
  done: "bg-[#16A3A3]/10 text-[#16A3A3]",
};

interface ToastItem {
  id: number;
  message: string;
}

export function MaintenancePage() {
  const { t } = useTranslation();
  const tasks = useTasksStore((s) => s.tasks);
  const addTask = useTasksStore((s) => s.addTask);
  const setTaskStatus = useTasksStore((s) => s.setStatus);
  const assignTask = useTasksStore((s) => s.assign);
  const rooms = useRoomsStore((s) => s.rooms);

  // Local demo state for seed rows (the analytics dataset is read-only).
  const [seedStatus, setSeedStatus] = useState<Record<string, RepairStatus>>({});
  const [seedTech, setSeedTech] = useState<Record<string, string>>({});

  // Filters
  const [statusFilter, setStatusFilter] = useState<RepairStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);
  const notify = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2500);
  }, []);

  // Values under `workday.analytics.*` (seed titles/names) resolve via the
  // shared label convention; raw strings pass through untouched.
  const ta = useCallback(
    (key: string) => t(`workday.analytics.${key}`),
    [t],
  );

  const rows = useMemo<RepairRow[]>(() => {
    const taskRows: RepairRow[] = tasks
      .filter((task) => task.module === "maintenance")
      .map((task, i) => ({
        key: `task-${task.id}`,
        kind: "task" as const,
        taskId: task.id,
        displayId: `M-${String(i + 1).padStart(2, "0")}`,
        room: task.room != null ? String(task.room) : "—",
        title: task.title,
        priority: task.priority,
        createdBy: "Kristine",
        technician: task.assignee,
        status: taskToRepairStatus(task.status),
        quickAction: task.source === "quickAction",
      }));

    const seedRows: RepairRow[] = REPAIR_RECORDS.map((record, i) => ({
      key: record.id,
      kind: "seed" as const,
      displayId: `R-${String(i + 1).padStart(2, "0")}`,
      room: record.room,
      title: resolveLabel(ta, record.title),
      priority: seedPriority(record),
      createdBy: record.createdBy,
      technician: seedTech[record.id] ?? record.completedBy,
      status: seedStatus[record.id] ?? (record.completedBy ? "done" : "pending"),
      quickAction: false,
    }));

    return [...taskRows, ...seedRows];
  }, [tasks, ta, seedStatus, seedTech]);

  const stats = useMemo(() => {
    const byStatus = { pending: 0, assigned: 0, done: 0 };
    for (const row of rows) byStatus[row.status] += 1;
    // Demo semantics: live task rows count as "created today".
    const today = rows.filter((row) => row.kind === "task").length;
    return { ...byStatus, today };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (priorityFilter !== "all" && row.priority !== priorityFilter) return false;
      if (q && !row.room.toLowerCase().includes(q) && !row.title.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [rows, statusFilter, priorityFilter, search]);

  const hasFilters = statusFilter !== "all" || priorityFilter !== "all" || search.trim() !== "";
  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setSearch("");
  };

  const cycleStatus = (row: RepairRow) => {
    const next = STATUS_CYCLE[row.status];
    if (row.kind === "task" && row.taskId) {
      setTaskStatus(row.taskId, repairToTaskStatus(next));
    } else {
      setSeedStatus((prev) => ({ ...prev, [row.key]: next }));
    }
    notify(t("workday.maintenance.toastStatus", { status: t(`workday.maintenance.statuses.${next}`) }));
  };

  const assignTechnician = (row: RepairRow, name: string) => {
    if (row.kind === "task" && row.taskId) {
      assignTask(row.taskId, name || undefined);
    } else {
      setSeedTech((prev) => ({ ...prev, [row.key]: name }));
    }
    if (name) {
      notify(t("workday.maintenance.toastAssigned", { title: row.title, name }));
    }
  };

  const submitRepair = (input: { room: number; code: RepairCode; description: string; priority: TaskPriority }) => {
    const codeLabel = t(`workday.maintenance.codes.${input.code}`);
    const desc = input.description.trim();
    const title = desc ? `${codeLabel}: ${desc.slice(0, 20)}` : codeLabel;
    addTask({
      room: input.room,
      title,
      note: desc || undefined,
      priority: input.priority,
      source: "manual",
      module: "maintenance",
    });
    setModalOpen(false);
    notify(t("workday.maintenance.toastCreated"));
  };

  const assigneeOptions = [...TECHNICIANS, ...housekeepers];

  return (
    <div className="h-full overflow-y-auto bg-[#F7F9FB] p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {t("workday.maintenance.title")}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {t("workday.maintenance.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-[#16A3A3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#128a8a]"
        >
          <IconWrench size={15} />
          {t("workday.maintenance.addRepair")}
        </button>
      </div>

      {/* Stat cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(
          [
            ["statPending", stats.pending, "text-[#E2574C]"],
            ["statAssigned", stats.assigned, "text-amber-600"],
            ["statDone", stats.done, "text-[#16A3A3]"],
            ["statToday", stats.today, "text-gray-800"],
          ] as const
        ).map(([key, value, color]) => (
          <div key={key} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {t(`workday.maintenance.${key}`)}
            </div>
            <div className={`mt-1 text-2xl font-semibold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RepairStatus | "all")}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
        >
          <option value="all">{t("workday.maintenance.filterStatusAll")}</option>
          {(["pending", "assigned", "done"] as const).map((s) => (
            <option key={s} value={s}>
              {t(`workday.maintenance.statuses.${s}`)}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "all")}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
        >
          <option value="all">{t("workday.maintenance.filterPriorityAll")}</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {t(`workday.maintenance.priorities.${p}`)}
            </option>
          ))}
        </select>
        <div className="flex min-w-[220px] items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
          <IconSearch size={14} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("workday.maintenance.searchPlaceholder")}
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* List */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
              <th className="px-4 py-3 font-medium">{t("workday.maintenance.colOrder")}</th>
              <th className="px-4 py-3 font-medium">{t("workday.maintenance.colTitle")}</th>
              <th className="px-4 py-3 font-medium">{t("workday.maintenance.colPriority")}</th>
              <th className="px-4 py-3 font-medium">{t("workday.maintenance.colCreatedBy")}</th>
              <th className="px-4 py-3 font-medium">{t("workday.maintenance.colTechnician")}</th>
              <th className="px-4 py-3 font-medium">{t("workday.maintenance.colStatus")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.key} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-700">{row.displayId}</div>
                  <div className="text-xs text-gray-400">
                    {row.room === "—"
                      ? t("workday.maintenance.noRoom")
                      : t("workday.maintenance.roomLabel", { room: row.room })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">{row.title}</span>
                    {row.quickAction && (
                      <span className="rounded-full bg-[#16A3A3]/10 px-2 py-0.5 text-[11px] font-medium text-[#16A3A3]">
                        {t("workday.maintenance.quickAction")}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_CHIP[row.priority]}`}
                  >
                    {t(`workday.maintenance.priorities.${row.priority}`)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{row.createdBy}</td>
                <td className="px-4 py-3">
                  <select
                    value={row.technician ?? ""}
                    onChange={(e) => assignTechnician(row, e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700"
                  >
                    <option value="">{t("workday.maintenance.unassigned")}</option>
                    {assigneeOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => cycleStatus(row)}
                    aria-label={t("workday.maintenance.cycleStatusAria", { title: row.title })}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold transition hover:opacity-80 ${STATUS_CHIP[row.status]}`}
                  >
                    {t(`workday.maintenance.statuses.${row.status}`)}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <div className="text-sm font-medium text-gray-500">
              {t("workday.maintenance.emptyTitle")}
            </div>
            <div className="text-xs text-gray-400">{t("workday.maintenance.emptyHint")}</div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#16A3A3] hover:bg-gray-50"
              >
                {t("workday.maintenance.clearFilters")}
              </button>
            )}
          </div>
        )}
      </div>

      {modalOpen && (
        <AddRepairModal
          roomNumbers={rooms.map((r) => r.number)}
          onClose={() => setModalOpen(false)}
          onSubmit={submitRepair}
        />
      )}

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

function AddRepairModal({
  roomNumbers,
  onClose,
  onSubmit,
}: {
  roomNumbers: number[];
  onClose: () => void;
  onSubmit: (input: {
    room: number;
    code: RepairCode;
    description: string;
    priority: TaskPriority;
  }) => void;
}) {
  const { t } = useTranslation();
  const [room, setRoom] = useState<number>(roomNumbers[0] ?? 100);
  const [code, setCode] = useState<RepairCode | "">("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");

  const canSubmit = code !== "";

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("workday.maintenance.modalTitle")}
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {t("workday.maintenance.modalTitle")}
          </h2>
          <button
            onClick={onClose}
            aria-label={t("workday.maintenance.cancel")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            <IconCross size={14} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {t("workday.maintenance.fieldRoom")}
            </span>
            <select
              value={room}
              onChange={(e) => setRoom(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
            >
              {roomNumbers.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {t("workday.maintenance.fieldCode")}
            </span>
            <select
              value={code}
              onChange={(e) => setCode(e.target.value as RepairCode | "")}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
            >
              <option value="">{t("workday.maintenance.selectCode")}</option>
              {REPAIR_CODES.map((c) => (
                <option key={c} value={c}>
                  {t(`workday.maintenance.codes.${c}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {t("workday.maintenance.fieldDescription")}
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("workday.maintenance.descriptionPlaceholder")}
              rows={3}
              className="mt-1 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#16A3A3]"
            />
          </label>

          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {t("workday.maintenance.fieldPriority")}
            </span>
            <div className="mt-1 flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    priority === p
                      ? "border-[#16A3A3] bg-[#16A3A3]/10 text-[#16A3A3]"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t(`workday.maintenance.priorities.${p}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            {t("workday.maintenance.cancel")}
          </button>
          <button
            onClick={() =>
              canSubmit && onSubmit({ room, code: code as RepairCode, description, priority })
            }
            disabled={!canSubmit}
            className="rounded-lg bg-[#16A3A3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#128a8a] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("workday.maintenance.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
