import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { housekeepers } from "@/pages/workday/data";
import { useRoomsStore } from "@/pages/workday/rooms/store";
import {
  CURRENT_USER,
  overdueDays,
  useTasksStore,
  type Task,
  type TaskPriority,
} from "@/pages/workday/tasks/store";

function ChevronDownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <circle cx="9" cy="9" r="5.5" />
      <path d="M13.5 13.5L17 17" strokeLinecap="round" />
    </svg>
  );
}

function ArrowUpIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M10 16V4M10 4l-4.5 4.5M10 4l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoleculeIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="5" cy="15" r="2.2" />
      <circle cx="10" cy="5" r="2.2" />
      <circle cx="15" cy="15" r="2.2" />
      <path d="M8.9 7l-2.8 5.8M11.1 7l2.8 5.8" strokeLinecap="round" />
    </svg>
  );
}

function SparkleIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2l1.6 4.8L16 8.4l-4.4 1.6L10 15l-1.6-5L4 8.4l4.4-1.6L10 2z" />
      <path d="M16 13l.8 2.2L19 16l-2.2.8L16 19l-.8-2.2L13 16l2.2-.8L16 13z" />
    </svg>
  );
}

function ClipboardIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="4.5" y="3.5" width="11" height="14" rx="1.5" />
      <rect x="7.5" y="1.8" width="5" height="3.2" rx="1" fill="white" />
      <path d="M7.5 9h5M7.5 12h3.5" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="4.5" width="14" height="12.5" rx="1.5" />
      <path d="M3 8.5h14M7 2.5v3.5M13 2.5v3.5" strokeLinecap="round" />
    </svg>
  );
}

function PersonPlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="8" cy="6.5" r="3" />
      <path d="M2.5 17c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8" strokeLinecap="round" />
      <path d="M15.5 6.5v5M13 9h5" strokeLinecap="round" />
    </svg>
  );
}

function GiftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="8" width="14" height="9" rx="1" />
      <path d="M3 8h14M10 8v9M10 8s-3.5.2-4.5-1.2C4.6 5.5 5.5 4 7 4c2 0 3 4 3 4s1-4 3-4c1.5 0 2.4 1.5 1.5 2.8C13.5 8.2 10 8 10 8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DotsVerticalIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <circle cx="10" cy="4" r="1.4" />
      <circle cx="10" cy="10" r="1.4" />
      <circle cx="10" cy="16" r="1.4" />
    </svg>
  );
}

function CloseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7}>
      <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 5h14M5.5 10h9M8 15h4" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type TabId = "pending" | "all" | "myTasks" | "done" | "onHold" | "future";
type SortField = "createdAt" | "priority" | "room";

const TAB_IDS: TabId[] = ["pending", "all", "myTasks", "done", "onHold", "future"];

const TAB_LABEL_KEYS: Record<TabId, string> = {
  pending: "workday.tasks.tabPending",
  all: "workday.tasks.tabAll",
  myTasks: "workday.tasks.tabMyTasks",
  done: "workday.tasks.tabDone",
  onHold: "workday.tasks.tabOnHold",
  future: "workday.tasks.tabFuture",
};

function matchesTab(task: Task, tab: TabId): boolean {
  switch (tab) {
    case "all":
      return true;
    case "pending":
      return task.status === "pending";
    case "myTasks":
      return task.assignee === CURRENT_USER;
    case "done":
      return task.status === "done";
    case "onHold":
      return task.status === "onHold";
    case "future":
      return task.status === "future";
  }
}

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 };
const PRIORITY_CYCLE: Record<TaskPriority, TaskPriority> = {
  low: "medium",
  medium: "high",
  high: "low",
};

function barColor(task: Task): string {
  if (task.status === "done") return "#C3CBD1";
  if (overdueDays(task) > 0) return "#F2B544";
  if (task.priority === "high") return "#E2574C";
  if (task.priority === "low") return "#9AA5AD";
  return "#4A90D9";
}

function PriorityChip({
  level,
  onClick,
}: {
  level: TaskPriority;
  onClick?: () => void;
}) {
  const { t } = useTranslation();
  const styles: Record<TaskPriority, string> = {
    high: "bg-[#E2574C] text-white",
    medium: "bg-[#4A90D9] text-white",
    low: "bg-gray-200 text-gray-600",
  };
  const labels: Record<TaskPriority, string> = {
    high: t("workday.tasks.priorityHigh"),
    medium: t("workday.tasks.priorityMedium"),
    low: t("workday.tasks.priorityLow"),
  };
  const className = `inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${styles[level]} ${
    onClick ? "cursor-pointer hover:opacity-80" : ""
  }`;
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {labels[level]}
      </button>
    );
  }
  return <span className={className}>{labels[level]}</span>;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="shrink-0 text-xs text-gray-400">{label}</span>
      <span className="text-right text-xs font-medium text-[#37474F]">{children}</span>
    </div>
  );
}

interface TaskFormValues {
  title: string;
  room: string;
  note: string;
  priority: TaskPriority;
  assignee: string;
  dueAt: string;
}

const EMPTY_FORM: TaskFormValues = {
  title: "",
  room: "",
  note: "",
  priority: "medium",
  assignee: "",
  dueAt: "",
};

function AddTaskModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial: TaskFormValues;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
}) {
  const { t } = useTranslation();
  const [values, setValues] = useState<TaskFormValues>(initial);
  const rooms = useRoomsStore((s) => s.rooms);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const set = <K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const canSubmit = values.title.trim().length > 0;
  const titleId = "add-task-modal-title";
  const fieldClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm outline-none focus:border-teal-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-[440px] max-w-full rounded-xl bg-white shadow-xl outline-none"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 id={titleId} className="text-[16px] font-bold text-gray-900">
            {t("workday.tasks.addTask")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("workday.tasks.closePanel")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-col gap-3 px-5 py-4">
          <label className="block">
            <span className="mb-1 block text-[13px] font-bold text-gray-800">
              {t("workday.tasks.fieldTitle")} *
            </span>
            <input
              type="text"
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              className={fieldClass}
              autoFocus
            />
          </label>

          <div className="flex gap-3">
            <label className="block flex-1">
              <span className="mb-1 block text-[13px] font-bold text-gray-800">
                {t("workday.tasks.fieldRoom")}
              </span>
              <select
                value={values.room}
                onChange={(e) => set("room", e.target.value)}
                className={fieldClass}
              >
                <option value="">{t("workday.tasks.roomNone")}</option>
                {rooms.map((room) => (
                  <option key={room.number} value={room.number}>
                    {room.number}
                  </option>
                ))}
              </select>
            </label>
            <label className="block flex-1">
              <span className="mb-1 block text-[13px] font-bold text-gray-800">
                {t("workday.tasks.priority")}
              </span>
              <select
                value={values.priority}
                onChange={(e) => set("priority", e.target.value as TaskPriority)}
                className={fieldClass}
              >
                <option value="low">{t("workday.tasks.priorityLow")}</option>
                <option value="medium">{t("workday.tasks.priorityMedium")}</option>
                <option value="high">{t("workday.tasks.priorityHigh")}</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-[13px] font-bold text-gray-800">
              {t("workday.tasks.fieldNote")}
            </span>
            <textarea
              value={values.note}
              onChange={(e) => set("note", e.target.value)}
              rows={3}
              className={`${fieldClass} resize-none`}
            />
          </label>

          <div className="flex gap-3">
            <label className="block flex-1">
              <span className="mb-1 block text-[13px] font-bold text-gray-800">
                {t("workday.tasks.fieldAssignee")}
              </span>
              <select
                value={values.assignee}
                onChange={(e) => set("assignee", e.target.value)}
                className={fieldClass}
              >
                <option value="">{t("workday.tasks.unassigned")}</option>
                <option value={CURRENT_USER}>{t("workday.tasks.assigneeMe")}</option>
                {housekeepers.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block flex-1">
              <span className="mb-1 block text-[13px] font-bold text-gray-800">
                {t("workday.tasks.dueDate")}
              </span>
              <input
                type="date"
                value={values.dueAt}
                onChange={(e) => set("dueAt", e.target.value)}
                className={fieldClass}
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-gray-600 hover:bg-gray-50"
          >
            {t("workday.tasks.cancel")}
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => canSubmit && onSubmit(values)}
            className="rounded-xl bg-teal-500 px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("workday.tasks.create")}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ToastItem {
  id: number;
  message: string;
}

/** Demo templates offered in the split-button menu (task data stays free text). */
const TEMPLATES: { labelKey: string; values: TaskFormValues }[] = [
  {
    labelKey: "workday.tasks.templateChampagne",
    values: {
      ...EMPTY_FORM,
      title: "Welcome champagne",
      note: "Deliver chilled champagne before guest arrival",
      priority: "medium",
    },
  },
  {
    labelKey: "workday.tasks.templateExtraBed",
    values: {
      ...EMPTY_FORM,
      title: "Extra bed",
      note: "Set up an extra bed with fresh linen",
      priority: "low",
    },
  },
];

export function TasksShowcasePage() {
  const { t, i18n } = useTranslation();
  const tasks = useTasksStore((s) => s.tasks);
  const addTask = useTasksStore((s) => s.addTask);
  const setStatus = useTasksStore((s) => s.setStatus);
  const setPriority = useTasksStore((s) => s.setPriority);
  const assign = useTasksStore((s) => s.assign);
  const removeTask = useTasksStore((s) => s.removeTask);

  const [activeTab, setActiveTab] = useState<TabId>("pending");
  const [selectedId, setSelectedId] = useState<string | null>(tasks[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<TaskFormValues | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);

  const notify = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2500);
  }, []);

  const formatDateTime = useCallback(
    (iso?: string) => {
      if (!iso) return "—";
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return "—";
      return date.toLocaleString(i18n.language, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    },
    [i18n.language],
  );

  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(q) ||
        (task.note ?? "").toLowerCase().includes(q) ||
        (task.room !== null && String(task.room).includes(q)),
    );
  }, [tasks, search]);

  const counts = useMemo(() => {
    const result = {} as Record<TabId, number>;
    for (const tab of TAB_IDS) {
      result[tab] = searched.filter((task) => matchesTab(task, tab)).length;
    }
    return result;
  }, [searched]);

  const visible = useMemo(() => {
    const list = searched.filter((task) => matchesTab(task, activeTab));
    const dir = sortAsc ? 1 : -1;
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === "createdAt") {
        cmp = a.createdAt.localeCompare(b.createdAt);
      } else if (sortField === "priority") {
        cmp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      } else {
        cmp = (a.room ?? Number.POSITIVE_INFINITY) - (b.room ?? Number.POSITIVE_INFINITY);
        if (Number.isNaN(cmp)) cmp = 0;
      }
      if (cmp === 0) cmp = a.createdAt.localeCompare(b.createdAt);
      return cmp * dir;
    });
  }, [searched, activeTab, sortField, sortAsc]);

  const selected = tasks.find((task) => task.id === selectedId) ?? null;

  const sortFieldLabel: Record<SortField, string> = {
    createdAt: t("workday.tasks.createdAt"),
    priority: t("workday.tasks.priority"),
    room: t("workday.tasks.sortRoom"),
  };

  const openAddModal = (values: TaskFormValues) => {
    setAddMenuOpen(false);
    setModalInitial(values);
  };

  const submitAdd = (values: TaskFormValues) => {
    const task = addTask({
      room: values.room ? Number(values.room) : null,
      title: values.title.trim(),
      note: values.note.trim() || undefined,
      priority: values.priority,
      dueAt: values.dueAt ? `${values.dueAt}T12:00:00` : undefined,
      assignee: values.assignee || undefined,
      source: "manual",
    });
    setModalInitial(null);
    setSelectedId(task.id);
    notify(t("workday.tasks.toastAdded"));
  };

  const completeTask = (task: Task) => {
    setStatus(task.id, "done");
    notify(t("workday.tasks.toastDone"));
  };

  const holdTask = (task: Task) => {
    setStatus(task.id, "onHold");
    notify(t("workday.tasks.toastOnHold"));
  };

  const deleteTask = (task: Task) => {
    if (!window.confirm(t("workday.tasks.confirmDelete"))) return;
    removeTask(task.id);
    if (selectedId === task.id) setSelectedId(null);
    notify(t("workday.tasks.toastDeleted"));
  };

  const statusLabelKeys: Record<Task["status"], string> = {
    pending: "workday.tasks.tabPending",
    done: "workday.tasks.tabDone",
    onHold: "workday.tasks.tabOnHold",
    future: "workday.tasks.tabFuture",
  };

  return (
    <div className="flex h-full flex-col gap-4 bg-[#F7F9FB] p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#37474F]">{t("workday.tasks.title")}</h1>
        <div className="relative flex items-stretch">
          <button
            onClick={() => openAddModal(EMPTY_FORM)}
            className="rounded-l-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-[#37474F] hover:bg-gray-50"
          >
            {t("workday.tasks.addTask")}
          </button>
          <button
            aria-label={t("workday.tasks.addTaskOptions")}
            onClick={() => setAddMenuOpen((open) => !open)}
            className="-ml-px rounded-r-md border border-gray-300 bg-white px-1.5 text-gray-500 hover:bg-gray-50"
          >
            <ChevronDownIcon />
          </button>
          {addMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setAddMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  onClick={() => openAddModal(EMPTY_FORM)}
                  className="block w-full px-3 py-2 text-left text-sm text-[#37474F] hover:bg-gray-50"
                >
                  {t("workday.tasks.addTask")}
                </button>
                <div className="my-1 border-t border-gray-100" />
                {TEMPLATES.map((template) => (
                  <button
                    key={template.labelKey}
                    onClick={() => openAddModal(template.values)}
                    className="block w-full px-3 py-2 text-left text-sm text-[#37474F] hover:bg-gray-50"
                  >
                    {t(template.labelKey)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex w-[280px] items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5">
          <SearchIcon className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("workday.tasks.searchPlaceholder")}
            className="w-full bg-transparent text-sm text-[#37474F] outline-none placeholder:text-gray-400"
          />
        </div>
        <button
          aria-label={t("workday.tasks.sortDirection")}
          onClick={() => setSortAsc((asc) => !asc)}
          className="rounded-md border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowUpIcon className={`h-4 w-4 transition-transform ${sortAsc ? "" : "rotate-180"}`} />
        </button>
        <div className="relative">
          <button
            onClick={() => setSortMenuOpen((open) => !open)}
            className="flex items-center gap-1.5 rounded-md bg-transparent px-1 py-1.5 text-sm"
          >
            <span className="rounded border border-[#16A3A3] px-2 py-0.5 text-xs font-medium text-[#16A3A3]">
              {sortFieldLabel[sortField]}
            </span>
            <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400" />
          </button>
          {sortMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setSortMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute left-0 top-full z-20 mt-1 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                {(["createdAt", "priority", "room"] as SortField[]).map((field) => (
                  <button
                    key={field}
                    onClick={() => {
                      setSortField(field);
                      setSortMenuOpen(false);
                    }}
                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      field === sortField ? "font-semibold text-[#16A3A3]" : "text-[#37474F]"
                    }`}
                  >
                    {sortFieldLabel[field]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <button className="flex items-center gap-1.5 rounded-md bg-transparent px-1 py-1.5 text-sm">
          <span className="flex items-center gap-1 rounded border border-[#16A3A3] px-2 py-0.5 text-xs font-medium text-[#16A3A3]">
            <MoleculeIcon className="h-3.5 w-3.5" />
            {t("workday.tasks.defaultView")}
          </span>
          <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400" />
        </button>
        <div className="flex-1" />
        <button className="flex w-44 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-50">
          <FilterIcon className="h-4 w-4 text-gray-400" />
          <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400" />
        </button>
      </div>

      <div className="flex items-center gap-6 border-b border-gray-200">
        {TAB_IDS.map((tab) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`-mb-px flex items-center gap-1.5 border-b-2 pb-2 pt-1 text-sm font-medium ${
                active
                  ? "border-[#16A3A3] text-[#16A3A3]"
                  : "border-transparent text-gray-500 hover:text-[#37474F]"
              }`}
            >
              {t(TAB_LABEL_KEYS[tab])}
              <span
                className={`flex h-5 min-w-[20px] items-center justify-center rounded-full border px-1 text-[11px] ${
                  active ? "border-[#16A3A3] text-[#16A3A3]" : "border-gray-300 text-gray-500"
                }`}
              >
                {counts[tab]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex min-h-0 flex-1 items-start gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {visible.length === 0 && (
            <div className="rounded-md border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-400">
              {t("workday.tasks.emptyList")}
            </div>
          )}
          {visible.map((task) => {
            const isSelected = task.id === selectedId;
            const isDone = task.status === "done";
            const days = overdueDays(task);
            return (
              <div
                key={task.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(task.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelectedId(task.id);
                }}
                className={`group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-md border bg-white py-3 pl-4 pr-3 text-left shadow-sm transition-colors ${
                  isSelected
                    ? "border-[#F2B544] ring-1 ring-[#F2B544]/60"
                    : "border-gray-200 hover:border-gray-300"
                } ${isDone ? "opacity-60" : ""}`}
              >
                <span
                  className="absolute inset-y-0 left-0 w-1"
                  style={{ backgroundColor: barColor(task) }}
                />
                <SparkleIcon className="h-3.5 w-3.5 shrink-0 text-[#16A3A3]" />
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-500">
                  <ClipboardIcon />
                </span>
                <span className="text-sm text-gray-500">{task.room ?? "—"}</span>
                <span
                  className={`truncate text-sm font-semibold text-[#37474F] ${
                    isDone ? "line-through" : ""
                  }`}
                >
                  {task.title}
                </span>
                {task.note && (
                  <span className="hidden truncate text-sm text-gray-400 md:inline">
                    {task.note}
                  </span>
                )}
                <span className="flex-1" />
                {!isDone && (
                  <button
                    aria-label={t("workday.tasks.markDone")}
                    title={t("workday.tasks.markDone")}
                    onClick={(e) => {
                      e.stopPropagation();
                      completeTask(task);
                    }}
                    className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full border border-teal-500 text-teal-600 hover:bg-teal-50 group-hover:flex"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}
                <PriorityChip level={task.priority} />
                {task.dueAt && <CalendarIcon className="h-4 w-4 shrink-0 text-gray-400" />}
                {days > 0 && (
                  <span className="shrink-0 text-xs font-semibold text-[#E2574C]">
                    {t("workday.tasks.overdueDays", { count: days })}
                  </span>
                )}
                {task.assignee ? (
                  <span
                    title={task.assignee}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#16A3A3]/10 text-[10px] font-semibold text-[#16A3A3]"
                  >
                    {task.assignee
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                ) : (
                  <PersonPlusIcon className="h-4 w-4 shrink-0 text-gray-400" />
                )}
              </div>
            );
          })}
        </div>

        {selected && (
          <aside className="relative w-[300px] shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
            <span
              className="absolute inset-y-0 left-0 w-1.5"
              style={{ backgroundColor: barColor(selected) }}
            />
            <div className="flex flex-col gap-3 p-4 pl-5">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#F2B544] px-3 py-1 text-xs font-semibold text-white">
                  {selected.id === "t1"
                    ? t("workday.tasks.preArrivalRequest")
                    : selected.source === "quickAction"
                      ? t("workday.tasks.sourceQuickAction")
                      : t("workday.tasks.sourceManual")}
                </span>
                <div className="flex items-center gap-1 text-gray-400">
                  <button aria-label={t("workday.tasks.moreOptions")} className="rounded p-1 hover:bg-gray-100">
                    <DotsVerticalIcon />
                  </button>
                  <button
                    aria-label={t("workday.tasks.closePanel")}
                    className="rounded p-1 hover:bg-gray-100"
                    onClick={() => setSelectedId(null)}
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {overdueDays(selected) > 0 && (
                  <span className="rounded border border-[#E2574C]/40 bg-[#E2574C]/10 px-2 py-0.5 text-[11px] font-semibold text-[#E2574C]">
                    {t("workday.tasks.overdueDays", { count: overdueDays(selected) })}
                  </span>
                )}
                {(selected.id === "t1" || selected.source === "quickAction") && (
                  <span className="flex items-center gap-1 rounded bg-[#16A3A3]/10 px-2 py-0.5 text-[11px] font-medium text-[#16A3A3]">
                    <SparkleIcon className="h-3 w-3" />
                    {t("workday.tasks.automation")}
                  </span>
                )}
              </div>

              <section>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-[#37474F]">
                    <ClipboardIcon className="h-4 w-4 text-gray-500" />
                    {t("workday.tasks.details")}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </div>
                <div className="divide-y divide-gray-50 pt-1">
                  <DetailRow label={t("workday.tasks.priority")}>
                    <PriorityChip
                      level={selected.priority}
                      onClick={() =>
                        setPriority(selected.id, PRIORITY_CYCLE[selected.priority])
                      }
                    />
                  </DetailRow>
                  <DetailRow label={t("workday.tasks.statusLabel")}>
                    {t(statusLabelKeys[selected.status])}
                  </DetailRow>
                  <DetailRow label={t("workday.tasks.createdLabel")}>
                    {formatDateTime(selected.createdAt)}
                  </DetailRow>
                  <DetailRow label={t("workday.tasks.dueDate")}>
                    <span className="inline-flex flex-wrap items-center justify-end gap-1.5">
                      {formatDateTime(selected.dueAt)}
                      {overdueDays(selected) > 0 && (
                        <span className="rounded border border-[#E2574C]/40 bg-[#E2574C]/10 px-1.5 py-px text-[10px] font-semibold text-[#E2574C]">
                          {t("workday.tasks.overdueDays", { count: overdueDays(selected) })}
                        </span>
                      )}
                    </span>
                  </DetailRow>
                  <DetailRow label={t("workday.tasks.roomLabel")}>
                    {selected.room ?? "—"}
                  </DetailRow>
                  <DetailRow label={t("workday.tasks.idLabel")}>{selected.id}</DetailRow>
                </div>
                <div className="pt-2">
                  <span className="mb-1 block text-xs text-gray-400">
                    {t("workday.tasks.fieldAssignee")}
                  </span>
                  <select
                    value={selected.assignee ?? ""}
                    onChange={(e) => assign(selected.id, e.target.value || undefined)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800 outline-none focus:border-teal-500"
                  >
                    <option value="">{t("workday.tasks.unassigned")}</option>
                    <option value={CURRENT_USER}>{t("workday.tasks.assigneeMe")}</option>
                    {housekeepers.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </section>

              {selected.id === "t1" && (
                <section>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="flex items-center gap-2 text-sm font-semibold text-[#37474F]">
                      <GiftIcon className="h-4 w-4 text-gray-500" />
                      {t("workday.tasks.guestInfo")}
                    </span>
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="divide-y divide-gray-50 pt-1">
                    <DetailRow label={t("workday.tasks.guest")}>Maynord Alvey</DetailRow>
                    <DetailRow label={t("workday.tasks.lengthOfStay")}>
                      {t("workday.tasks.stayStartValue")}
                      <br />
                      <span className="text-gray-400">→</span> {t("workday.tasks.stayEndValue")}
                    </DetailRow>
                  </div>
                </section>
              )}

              <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
                {selected.status !== "done" && (
                  <button
                    onClick={() => completeTask(selected)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-teal-500 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-600"
                  >
                    <CheckIcon className="h-4 w-4" />
                    {t("workday.tasks.markDone")}
                  </button>
                )}
                {selected.status !== "onHold" && selected.status !== "done" && (
                  <button
                    onClick={() => holdTask(selected)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    {t("workday.tasks.putOnHold")}
                  </button>
                )}
                <button
                  onClick={() => deleteTask(selected)}
                  className="rounded-lg border border-[#E2574C]/40 bg-white px-3 py-2 text-sm font-semibold text-[#E2574C] hover:bg-[#E2574C]/10"
                >
                  {t("workday.tasks.deleteTask")}
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {modalInitial && (
        <AddTaskModal
          initial={modalInitial}
          onClose={() => setModalInitial(null)}
          onSubmit={submitAdd}
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
