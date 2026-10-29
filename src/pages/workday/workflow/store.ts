import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TriggerEntity = "reservation" | "roomStatus" | "task";
export type TriggerEvent =
  | "updated"
  | "created"
  | "cancelled"
  | "checkout"
  | "dirty"
  | "completed";
export type ConditionField = "property" | "guestCount" | "guestTag";
export type ConditionOperator = "is" | "greaterThan" | "contains";
export type ActionType = "createTask" | "createRepair" | "sendNotification";

export interface WorkflowCondition {
  field: ConditionField;
  operator: ConditionOperator;
  value: string;
}

export interface WorkflowAction {
  type: ActionType;
  item: string;
  note: string;
}

export interface Workflow {
  id: string;
  name: string;
  enabled: boolean;
  trigger: { entity: TriggerEntity; event: TriggerEvent };
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
}

export const ENTITY_OPTIONS: TriggerEntity[] = ["reservation", "roomStatus", "task"];

/** Events that make sense per trigger entity (2–3 each). */
export const EVENTS_BY_ENTITY: Record<TriggerEntity, TriggerEvent[]> = {
  reservation: ["updated", "created", "cancelled"],
  roomStatus: ["checkout", "dirty"],
  task: ["created", "completed"],
};

export const CONDITION_FIELDS: ConditionField[] = ["property", "guestCount", "guestTag"];
export const CONDITION_OPERATORS: ConditionOperator[] = ["is", "greaterThan", "contains"];
export const ACTION_TYPES: ActionType[] = ["createTask", "createRepair", "sendNotification"];

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `wf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptyWorkflow(): Workflow {
  return {
    id: newId(),
    name: "",
    enabled: true,
    trigger: { entity: "reservation", event: "created" },
    conditions: [],
    actions: [],
  };
}

/** Demo workflow names / item texts are data, kept in zh-TW on purpose. */
function createDemoWorkflows(): Workflow[] {
  return [
    {
      id: "demo-extra-bed",
      name: "住客 > 3：加床",
      enabled: true,
      trigger: { entity: "reservation", event: "updated" },
      conditions: [
        { field: "property", operator: "is", value: "Mews Berlin" },
        { field: "guestCount", operator: "greaterThan", value: "3" },
      ],
      actions: [{ type: "createTask", item: "加床", note: "請準備一張加床" }],
    },
    {
      id: "demo-vip-champagne",
      name: "VIP 抵達：香檳",
      enabled: true,
      trigger: { entity: "reservation", event: "created" },
      conditions: [{ field: "guestTag", operator: "is", value: "VIP" }],
      actions: [{ type: "createTask", item: "送香檳", note: "" }],
    },
    {
      id: "demo-checkout-minibar",
      name: "退房：迷你吧檢查",
      enabled: false,
      trigger: { entity: "roomStatus", event: "checkout" },
      conditions: [],
      actions: [{ type: "createTask", item: "檢查迷你吧", note: "" }],
    },
  ];
}

interface WorkflowStore {
  workflows: Workflow[];
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (workflow: Workflow) => void;
  toggleEnabled: (id: string) => void;
  deleteWorkflow: (id: string) => void;
  resetDemo: () => void;
}

export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    (set) => ({
      workflows: createDemoWorkflows(),

      addWorkflow: (workflow) =>
        set((s) => ({ workflows: [...s.workflows, workflow] })),

      updateWorkflow: (workflow) =>
        set((s) => ({
          workflows: s.workflows.map((w) => (w.id === workflow.id ? workflow : w)),
        })),

      toggleEnabled: (id) =>
        set((s) => ({
          workflows: s.workflows.map((w) =>
            w.id === id ? { ...w, enabled: !w.enabled } : w,
          ),
        })),

      deleteWorkflow: (id) =>
        set((s) => ({ workflows: s.workflows.filter((w) => w.id !== id) })),

      resetDemo: () => set({ workflows: createDemoWorkflows() }),
    }),
    {
      name: "tms-workday-workflows",
      version: 1,
    },
  ),
);
