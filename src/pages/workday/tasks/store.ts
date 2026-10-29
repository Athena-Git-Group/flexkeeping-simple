import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "done" | "onHold" | "future";
export type TaskSource = "manual" | "quickAction";

export interface Task {
  id: string;
  /** Room number, or null for tasks not tied to a room */
  room: number | null;
  /** Free-text title (user input is never translated) */
  title: string;
  note?: string;
  priority: TaskPriority;
  status: TaskStatus;
  /** ISO string */
  createdAt: string;
  /** ISO string */
  dueAt?: string;
  assignee?: string;
  source: TaskSource;
  /** Quick-action module key (minibar, service, …) when source = quickAction */
  module?: string;
  overdue?: boolean;
}

/** Demo "current user" — the "My tasks" tab filters on this assignee. */
export const CURRENT_USER = "Kristine";

/** Fixed demo "today" used for overdue computation (matches the demo dataset). */
export const DEMO_TODAY = "2026-01-30T00:00:00";

export function overdueDays(task: Pick<Task, "dueAt" | "status">): number {
  if (!task.dueAt || task.status === "done") return 0;
  const due = new Date(task.dueAt).getTime();
  const today = new Date(DEMO_TODAY).getTime();
  if (Number.isNaN(due) || due >= today) return 0;
  return Math.ceil((today - due) / 86_400_000);
}

export interface AddTaskInput {
  room: number | null;
  title: string;
  note?: string;
  priority: TaskPriority;
  status?: TaskStatus;
  dueAt?: string;
  assignee?: string;
  source: TaskSource;
  module?: string;
}

/**
 * Seed tasks mirror the original static demo rows. Titles/notes are stored as
 * plain English strings (task data is user input and is not translated).
 */
function createInitialTasks(): Task[] {
  return [
    {
      id: "t1",
      room: 503,
      title: "Iron and ironing board",
      note: "Early check-in 2026-01-28",
      priority: "medium",
      status: "pending",
      createdAt: "2026-01-27T09:15:00",
      dueAt: "2026-01-28T01:00:00",
      assignee: CURRENT_USER,
      source: "manual",
      overdue: true,
    },
    {
      id: "t2",
      room: 109,
      title: "Champagne",
      note: "Please deliver the best Champagne in the house",
      priority: "medium",
      status: "pending",
      createdAt: "2026-01-28T10:40:00",
      source: "manual",
    },
    {
      id: "t3",
      room: 328,
      title: "Birthday",
      note: "Deliver a cake to the room",
      priority: "medium",
      status: "pending",
      createdAt: "2026-01-29T08:05:00",
      source: "manual",
    },
    {
      id: "t4",
      room: 305,
      title: "Partial guest departure",
      priority: "low",
      status: "pending",
      createdAt: "2026-01-29T14:30:00",
      source: "manual",
    },
    {
      id: "t5",
      room: 201,
      title: "Prepare VIP welcome amenities",
      note: "Arrival scheduled for next week",
      priority: "medium",
      status: "future",
      createdAt: "2026-01-29T16:00:00",
      dueAt: "2026-02-03T12:00:00",
      source: "manual",
    },
  ];
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `task-${Date.now().toString(36)}-${idCounter}`;
}

interface TasksStore {
  tasks: Task[];
  addTask: (input: AddTaskInput) => Task;
  setStatus: (id: string, status: TaskStatus) => void;
  setPriority: (id: string, priority: TaskPriority) => void;
  assign: (id: string, assignee: string | undefined) => void;
  removeTask: (id: string) => void;
  resetDemo: () => void;
}

export const useTasksStore = create<TasksStore>()(
  persist(
    (set) => ({
      tasks: createInitialTasks(),

      addTask: (input) => {
        const task: Task = {
          id: nextId(),
          room: input.room,
          title: input.title,
          note: input.note || undefined,
          priority: input.priority,
          status: input.status ?? "pending",
          createdAt: new Date().toISOString(),
          dueAt: input.dueAt || undefined,
          assignee: input.assignee || undefined,
          source: input.source,
          module: input.module,
        };
        set((s) => ({ tasks: [task, ...s.tasks] }));
        return task;
      },

      setStatus: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
        })),

      setPriority: (id, priority) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, priority } : t)),
        })),

      assign: (id, assignee) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, assignee: assignee || undefined } : t,
          ),
        })),

      removeTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      resetDemo: () => set({ tasks: createInitialTasks() }),
    }),
    {
      name: "tms-workday-tasks",
      version: 1,
      // Old/unknown persisted shapes are discarded in favor of fresh demo data.
      migrate: () => ({ tasks: createInitialTasks() }),
      partialize: (state) => ({ tasks: state.tasks }),
    },
  ),
);
