import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ACTION_TYPES,
  CONDITION_FIELDS,
  CONDITION_OPERATORS,
  createEmptyWorkflow,
  ENTITY_OPTIONS,
  EVENTS_BY_ENTITY,
  useWorkflowStore,
  type ActionType,
  type ConditionField,
  type ConditionOperator,
  type TriggerEntity,
  type TriggerEvent,
  type Workflow,
} from "@/pages/workday/workflow/store";

const TEAL = "#16A3A3";
const TEAL_LIGHT = "#4DB6AC";
const SLATE = "#37474F";

// --- i18n key maps -----------------------------------------------------------

const ENTITY_KEY: Record<TriggerEntity, string> = {
  reservation: "workday.workflow.entityReservation",
  roomStatus: "workday.workflow.entityRoomStatus",
  task: "workday.workflow.entityTask",
};

const EVENT_KEY: Record<TriggerEvent, string> = {
  updated: "workday.workflow.eventUpdated",
  created: "workday.workflow.eventCreated",
  cancelled: "workday.workflow.eventCancelled",
  checkout: "workday.workflow.eventCheckout",
  dirty: "workday.workflow.eventDirty",
  completed: "workday.workflow.eventCompleted",
};

const FIELD_KEY: Record<ConditionField, string> = {
  property: "workday.workflow.fieldProperty",
  guestCount: "workday.workflow.fieldGuestCount",
  guestTag: "workday.workflow.fieldGuestTag",
};

const OPERATOR_KEY: Record<ConditionOperator, string> = {
  is: "workday.workflow.opIs",
  greaterThan: "workday.workflow.opGreaterThan",
  contains: "workday.workflow.opContains",
};

const ACTION_KEY: Record<ActionType, string> = {
  createTask: "workday.workflow.actionCreateTask",
  createRepair: "workday.workflow.actionCreateRepair",
  sendNotification: "workday.workflow.actionSendNotification",
};

// --- icons -------------------------------------------------------------------

function IconArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SLATE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function IconSparkle({ size = 14, color = SLATE }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2l2.1 5.6L20 9.7l-5.9 2.1L12 17.4l-2.1-5.6L4 9.7l5.9-2.1L12 2z" />
      <path d="M19 15l.9 2.4 2.4.9-2.4.9L19 21.6l-.9-2.4-2.4-.9 2.4-.9L19 15z" />
    </svg>
  );
}

function IconGear() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={SLATE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconBranch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={SLATE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="4" r="2.2" />
      <circle cx="6" cy="20" r="2.2" />
      <circle cx="18" cy="12" r="2.2" />
      <path d="M6 6.2v11.6" />
      <path d="M6 9c0 3 9.8 0 9.8 3" />
    </svg>
  );
}

function IconDots() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#90A4AE">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SLATE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function IconZoomIn() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SLATE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
      <path d="M11 8v6M8 11h6" />
    </svg>
  );
}

function IconZoomOut() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SLATE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
      <path d="M8 11h6" />
    </svg>
  );
}

function IconEraser() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SLATE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20H9" />
      <path d="M5.5 14.5L14 6a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8l-8.5 8.5a2 2 0 0 1-2.8 0l-2.2-2.2a2 2 0 0 1 0-2.8z" />
      <path d="M11 9.5l4.5 4.5" />
    </svg>
  );
}

// --- small building blocks ---------------------------------------------------

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="relative h-6 w-11 flex-shrink-0 rounded-full transition-colors"
      style={{ backgroundColor: checked ? TEAL : "#CFD8DC" }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
        style={{ left: checked ? 22 : 2 }}
      />
    </button>
  );
}

const SELECT_CLASS =
  "rounded-md border border-gray-300 bg-white px-1.5 py-1 text-xs font-medium focus:border-[#16A3A3] focus:outline-none";
const INPUT_CLASS =
  "min-w-0 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:border-[#16A3A3] focus:outline-none";

function NodeCard({
  icon,
  title,
  style,
  nodeRef,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  style: React.CSSProperties;
  nodeRef?: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={nodeRef}
      className="absolute w-[380px] rounded-xl border border-gray-200 bg-white shadow-md"
      style={style}
    >
      <div className="flex items-center gap-2 px-4 py-2.5">
        {icon}
        <span className="text-sm font-semibold" style={{ color: SLATE }}>
          {title}
        </span>
        <button className="ml-auto rounded p-1 hover:bg-gray-100" aria-label="More options">
          <IconDots />
        </button>
      </div>
      <div className="border-t border-gray-100 px-4 py-3">{children}</div>
    </div>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-sm text-gray-400 hover:bg-red-50 hover:text-red-500"
    >
      ✕
    </button>
  );
}

// --- toast -------------------------------------------------------------------

interface Toast {
  id: number;
  message: string;
}

// --- page --------------------------------------------------------------------

export function WorkflowBuilderPage() {
  const { t } = useTranslation();
  const workflows = useWorkflowStore((s) => s.workflows);
  const addWorkflow = useWorkflowStore((s) => s.addWorkflow);
  const updateWorkflow = useWorkflowStore((s) => s.updateWorkflow);
  const toggleEnabled = useWorkflowStore((s) => s.toggleEnabled);

  // null = list view; otherwise the draft being edited
  const [draft, setDraft] = useState<Workflow | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const notify = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2500);
  }, []);

  const mutateDraft = useCallback((fn: (d: Workflow) => Workflow) => {
    setDraft((d) => (d === null ? d : fn(d)));
    setDirty(true);
  }, []);

  const openEdit = (workflow: Workflow) => {
    setDraft(JSON.parse(JSON.stringify(workflow)) as Workflow);
    setIsNew(false);
    setDirty(false);
  };

  const openNew = () => {
    setDraft(createEmptyWorkflow());
    setIsNew(true);
    setDirty(false);
  };

  const closeEdit = () => {
    if (dirty && !window.confirm(t("workday.workflow.confirmLeave"))) return;
    setDraft(null);
    setDirty(false);
  };

  const save = () => {
    if (draft === null) return;
    const workflow: Workflow = {
      ...draft,
      name: draft.name.trim() || t("workday.workflow.untitled"),
    };
    if (isNew) addWorkflow(workflow);
    else updateWorkflow(workflow);
    notify(t("workday.workflow.toastUpdated"));
    setDraft(null);
    setDirty(false);
  };

  const summarize = (workflow: Workflow): string => {
    const parts: string[] = [
      t("workday.workflow.summaryWhen", {
        entity: t(ENTITY_KEY[workflow.trigger.entity]),
        event: t(EVENT_KEY[workflow.trigger.event]),
      }),
    ];
    if (workflow.conditions.length > 0) {
      parts.push(
        t("workday.workflow.summaryIf", {
          conditions: workflow.conditions
            .map((c) => `${t(FIELD_KEY[c.field])} ${t(OPERATOR_KEY[c.operator])} ${c.value}`)
            .join(t("workday.workflow.listJoin")),
        }),
      );
    }
    if (workflow.actions.length > 0) {
      parts.push(
        t("workday.workflow.summaryThen", {
          actions: workflow.actions
            .map((a) => (a.item ? `${t(ACTION_KEY[a.type])}: ${a.item}` : t(ACTION_KEY[a.type])))
            .join(t("workday.workflow.listJoin")),
        }),
      );
    }
    return parts.join(t("workday.workflow.summaryJoin"));
  };

  return (
    <div className="flex h-full flex-col p-6">
      {draft === null ? (
        <ListView
          workflows={workflows}
          summarize={summarize}
          onToggle={toggleEnabled}
          onEdit={openEdit}
          onNew={openNew}
        />
      ) : (
        <EditView
          draft={draft}
          mutateDraft={mutateDraft}
          onBack={closeEdit}
          onSave={save}
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

// --- list view ---------------------------------------------------------------

function ListView({
  workflows,
  summarize,
  onToggle,
  onEdit,
  onNew,
}: {
  workflows: Workflow[];
  summarize: (workflow: Workflow) => string;
  onToggle: (id: string) => void;
  onEdit: (workflow: Workflow) => void;
  onNew: () => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-lg font-bold" style={{ color: SLATE }}>
          {t("workday.workflow.builderTitle")}
        </h1>
        <button
          onClick={onNew}
          className="ml-auto flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-white hover:opacity-90"
          style={{ backgroundColor: TEAL }}
        >
          {t("workday.workflow.newWorkflow")}
          <IconSparkle color="#fff" />
        </button>
      </div>

      <div className="space-y-3">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold" style={{ color: SLATE }}>
                {workflow.name}
              </div>
              <div className="mt-0.5 truncate text-xs text-gray-500">
                {summarize(workflow)}
              </div>
            </div>
            <Toggle
              checked={workflow.enabled}
              onChange={() => onToggle(workflow.id)}
              label={t("workday.workflow.enableToggle")}
            />
            <button
              onClick={() => onEdit(workflow)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
              style={{ color: SLATE }}
            >
              <IconPencil />
              {t("workday.workflow.edit")}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

// --- edit view ---------------------------------------------------------------

const NODE_WIDTH = 380;
const WHEN_LEFT = 60;
const WHEN_TOP = 48;
const IF_LEFT = 240;
const THEN_LEFT = 430;
const NODE_GAP = 72;

function EditView({
  draft,
  mutateDraft,
  onBack,
  onSave,
}: {
  draft: Workflow;
  mutateDraft: (fn: (d: Workflow) => Workflow) => void;
  onBack: () => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  const [editingName, setEditingName] = useState(false);

  // Measure node heights so the connectors and node tops follow the content
  // (condition/action rows grow and shrink the If / Then cards).
  const whenRef = useRef<HTMLDivElement>(null);
  const ifRef = useRef<HTMLDivElement>(null);
  const [heights, setHeights] = useState({ when: 100, if: 150 });
  useLayoutEffect(() => {
    const when = whenRef.current?.offsetHeight ?? 100;
    const ifH = ifRef.current?.offsetHeight ?? 150;
    setHeights((h) => (h.when === when && h.if === ifH ? h : { when, if: ifH }));
  });

  const ifTop = WHEN_TOP + heights.when + NODE_GAP;
  const thenTop = ifTop + heights.if + NODE_GAP;

  // connector anchors (bottom-center of a node → top-center of the next)
  const a1 = { x: WHEN_LEFT + NODE_WIDTH / 2, y: WHEN_TOP + heights.when };
  const b1 = { x: IF_LEFT + NODE_WIDTH / 2, y: ifTop };
  const a2 = { x: IF_LEFT + NODE_WIDTH / 2, y: ifTop + heights.if };
  const b2 = { x: THEN_LEFT + NODE_WIDTH / 2, y: thenTop };

  const curve = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    `M ${a.x} ${a.y} C ${a.x} ${a.y + (b.y - a.y) * 0.65}, ${b.x} ${b.y - (b.y - a.y) * 0.6}, ${b.x} ${b.y}`;

  const addAction = () =>
    mutateDraft((d) => ({
      ...d,
      actions: [...d.actions, { type: "createTask", item: "", note: "" }],
    }));

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
          aria-label="Back"
        >
          <IconArrowLeft />
        </button>
        {editingName ? (
          <input
            autoFocus
            value={draft.name}
            placeholder={t("workday.workflow.untitled")}
            onChange={(e) => mutateDraft((d) => ({ ...d, name: e.target.value }))}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") setEditingName(false);
            }}
            className="w-72 rounded-md border border-gray-300 px-2 py-1 text-lg font-bold focus:border-[#16A3A3] focus:outline-none"
            style={{ color: SLATE }}
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="group flex items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-100"
            title={t("workday.workflow.edit")}
          >
            <h1 className="text-lg font-bold" style={{ color: SLATE }}>
              {draft.name.trim() === "" ? t("workday.workflow.untitled") : draft.name}
            </h1>
            <span className="opacity-0 transition-opacity group-hover:opacity-100">
              <IconPencil />
            </span>
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={addAction}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium hover:bg-gray-50"
            style={{ color: SLATE }}
          >
            {t("workday.workflow.addConsequence")}
            <IconSparkle />
          </button>
          <button
            onClick={onSave}
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-white hover:opacity-90"
            style={{ backgroundColor: TEAL }}
          >
            {t("workday.workflow.updateWorkflow")}
          </button>
        </div>
      </div>

      <div
        className="relative flex-1 overflow-auto rounded-xl border border-gray-200"
        style={{
          minHeight: "70vh",
          backgroundColor: "#FAFBFC",
          backgroundImage: "radial-gradient(#D8DEE4 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <svg
          className="pointer-events-none absolute left-0 top-0"
          width={THEN_LEFT + NODE_WIDTH + 60}
          height={thenTop + 400}
        >
          <path d={curve(a1, b1)} stroke={TEAL_LIGHT} strokeWidth="1.5" fill="none" />
          <circle cx={a1.x} cy={a1.y} r="3" fill={TEAL_LIGHT} />
          <circle cx={b1.x} cy={b1.y} r="3" fill={TEAL_LIGHT} />
          <path d={curve(a2, b2)} stroke={TEAL_LIGHT} strokeWidth="1.5" fill="none" />
          <circle cx={a2.x} cy={a2.y} r="3" fill={TEAL_LIGHT} />
          <circle cx={b2.x} cy={b2.y} r="3" fill={TEAL_LIGHT} />
        </svg>

        {/* When */}
        <NodeCard
          icon={<IconGear />}
          title={t("workday.workflow.when")}
          style={{ left: WHEN_LEFT, top: WHEN_TOP }}
          nodeRef={whenRef}
        >
          <div className="flex items-center gap-2">
            <select
              value={draft.trigger.entity}
              aria-label={t("workday.workflow.when")}
              onChange={(e) => {
                const entity = e.target.value as TriggerEntity;
                mutateDraft((d) => ({
                  ...d,
                  trigger: { entity, event: EVENTS_BY_ENTITY[entity][0] },
                }));
              }}
              className={SELECT_CLASS}
              style={{ color: TEAL, backgroundColor: "rgba(22,163,163,0.08)" }}
            >
              {ENTITY_OPTIONS.map((entity) => (
                <option key={entity} value={entity}>
                  {t(ENTITY_KEY[entity])}
                </option>
              ))}
            </select>
            <select
              value={draft.trigger.event}
              aria-label={t("workday.workflow.when")}
              onChange={(e) =>
                mutateDraft((d) => ({
                  ...d,
                  trigger: { ...d.trigger, event: e.target.value as TriggerEvent },
                }))
              }
              className={SELECT_CLASS}
              style={{ color: SLATE }}
            >
              {EVENTS_BY_ENTITY[draft.trigger.entity].map((event) => (
                <option key={event} value={event}>
                  {t(EVENT_KEY[event])}
                </option>
              ))}
            </select>
          </div>
        </NodeCard>

        {/* If */}
        <NodeCard
          icon={<IconBranch />}
          title={t("workday.workflow.if")}
          style={{ left: IF_LEFT, top: ifTop }}
          nodeRef={ifRef}
        >
          <div className="space-y-2">
            {draft.conditions.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 px-3 py-2.5 text-center text-xs text-gray-400">
                {t("workday.workflow.noConditions")}
              </div>
            )}
            {draft.conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <select
                  value={condition.field}
                  aria-label={t("workday.workflow.if")}
                  onChange={(e) =>
                    mutateDraft((d) => ({
                      ...d,
                      conditions: d.conditions.map((c, i) =>
                        i === index ? { ...c, field: e.target.value as ConditionField } : c,
                      ),
                    }))
                  }
                  className={SELECT_CLASS}
                  style={{ color: SLATE, maxWidth: 118 }}
                >
                  {CONDITION_FIELDS.map((field) => (
                    <option key={field} value={field}>
                      {t(FIELD_KEY[field])}
                    </option>
                  ))}
                </select>
                <select
                  value={condition.operator}
                  aria-label={t("workday.workflow.if")}
                  onChange={(e) =>
                    mutateDraft((d) => ({
                      ...d,
                      conditions: d.conditions.map((c, i) =>
                        i === index
                          ? { ...c, operator: e.target.value as ConditionOperator }
                          : c,
                      ),
                    }))
                  }
                  className={SELECT_CLASS}
                  style={{ color: SLATE, maxWidth: 90 }}
                >
                  {CONDITION_OPERATORS.map((operator) => (
                    <option key={operator} value={operator}>
                      {t(OPERATOR_KEY[operator])}
                    </option>
                  ))}
                </select>
                <input
                  type={condition.field === "guestCount" ? "number" : "text"}
                  value={condition.value}
                  placeholder={t("workday.workflow.valuePlaceholder")}
                  onChange={(e) =>
                    mutateDraft((d) => ({
                      ...d,
                      conditions: d.conditions.map((c, i) =>
                        i === index ? { ...c, value: e.target.value } : c,
                      ),
                    }))
                  }
                  className={`${INPUT_CLASS} flex-1`}
                  style={{ color: TEAL, fontWeight: 500 }}
                />
                <RemoveButton
                  label={t("workday.workflow.removeRow")}
                  onClick={() =>
                    mutateDraft((d) => ({
                      ...d,
                      conditions: d.conditions.filter((_, i) => i !== index),
                    }))
                  }
                />
              </div>
            ))}
            <button
              onClick={() =>
                mutateDraft((d) => ({
                  ...d,
                  conditions: [
                    ...d.conditions,
                    { field: "property", operator: "is", value: "" },
                  ],
                }))
              }
              className="w-full rounded-md border border-dashed border-gray-300 px-2 py-1.5 text-xs font-medium hover:border-[#16A3A3] hover:bg-gray-50"
              style={{ color: TEAL }}
            >
              {t("workday.workflow.addCondition")}
            </button>
          </div>
        </NodeCard>

        {/* Then */}
        <NodeCard
          icon={<IconSparkle color={TEAL} />}
          title={t("workday.workflow.thenCreate")}
          style={{ left: THEN_LEFT, top: thenTop }}
        >
          <div className="space-y-2">
            {draft.actions.map((action, index) => (
              <div
                key={index}
                className="space-y-1.5 rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm"
                style={{ borderLeft: `3px solid ${SLATE}` }}
              >
                <div className="flex items-center gap-1.5">
                  <select
                    value={action.type}
                    aria-label={t("workday.workflow.thenCreate")}
                    onChange={(e) =>
                      mutateDraft((d) => ({
                        ...d,
                        actions: d.actions.map((a, i) =>
                          i === index ? { ...a, type: e.target.value as ActionType } : a,
                        ),
                      }))
                    }
                    className={`${SELECT_CLASS} flex-1`}
                    style={{ color: SLATE }}
                  >
                    {ACTION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {t(ACTION_KEY[type])}
                      </option>
                    ))}
                  </select>
                  <RemoveButton
                    label={t("workday.workflow.removeRow")}
                    onClick={() =>
                      mutateDraft((d) => ({
                        ...d,
                        actions: d.actions.filter((_, i) => i !== index),
                      }))
                    }
                  />
                </div>
                <input
                  value={action.item}
                  placeholder={t("workday.workflow.itemPlaceholder")}
                  onChange={(e) =>
                    mutateDraft((d) => ({
                      ...d,
                      actions: d.actions.map((a, i) =>
                        i === index ? { ...a, item: e.target.value } : a,
                      ),
                    }))
                  }
                  className={`${INPUT_CLASS} w-full font-semibold`}
                  style={{ color: SLATE }}
                />
                <input
                  value={action.note}
                  placeholder={t("workday.workflow.notePlaceholder")}
                  onChange={(e) =>
                    mutateDraft((d) => ({
                      ...d,
                      actions: d.actions.map((a, i) =>
                        i === index ? { ...a, note: e.target.value } : a,
                      ),
                    }))
                  }
                  className={`${INPUT_CLASS} w-full text-gray-500`}
                />
              </div>
            ))}
            <button
              onClick={addAction}
              className="w-full rounded-md border border-dashed border-gray-300 px-2 py-1.5 text-xs font-medium hover:border-[#16A3A3] hover:bg-gray-50"
              style={{ color: TEAL }}
            >
              {t("workday.workflow.addAction")}
            </button>
          </div>
        </NodeCard>

        <div className="absolute bottom-4 left-4 flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
          <button className="flex h-8 w-8 items-center justify-center hover:bg-gray-50" aria-label="Zoom in">
            <IconZoomIn />
          </button>
          <button className="flex h-8 w-8 items-center justify-center border-t border-gray-100 hover:bg-gray-50" aria-label="Zoom out">
            <IconZoomOut />
          </button>
          <button className="flex h-8 w-8 items-center justify-center border-t border-gray-100 hover:bg-gray-50" aria-label="Clear">
            <IconEraser />
          </button>
        </div>

        <span className="absolute bottom-2 right-3 text-[10px] text-gray-400">React Flow</span>
      </div>
    </>
  );
}
