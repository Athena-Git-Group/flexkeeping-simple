import { useCallback, useRef, useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  IconBed,
  IconBox,
  IconChecklist,
  IconFlow,
  IconGlass,
  IconPerson,
  IconSpray,
  IconTray,
  IconWrench,
} from "@/pages/workday/icons";

const MODULE_IDS = [
  "minibar",
  "roomService",
  "laundry",
  "guestRelations",
  "lostFound",
  "turndown",
  "checklists",
  "repairs",
  "automation",
] as const;

type ModuleId = (typeof MODULE_IDS)[number];

const MODULE_ICONS: Record<ModuleId, ComponentType<{ size?: number }>> = {
  minibar: IconGlass,
  roomService: IconTray,
  laundry: IconSpray,
  guestRelations: IconPerson,
  lostFound: IconBox,
  turndown: IconBed,
  checklists: IconChecklist,
  repairs: IconWrench,
  automation: IconFlow,
};

interface ModulesStore {
  enabled: Record<ModuleId, boolean>;
  /** Flips one module; returns the new enabled state. */
  toggle: (id: ModuleId) => boolean;
}

function allEnabled(): Record<ModuleId, boolean> {
  return Object.fromEntries(MODULE_IDS.map((id) => [id, true])) as Record<ModuleId, boolean>;
}

const useModulesStore = create<ModulesStore>()(
  persist(
    (set, get) => ({
      enabled: allEnabled(),
      toggle: (id) => {
        const next = !get().enabled[id];
        set((s) => ({ enabled: { ...s.enabled, [id]: next } }));
        return next;
      },
    }),
    {
      name: "tms-workday-modules",
      version: 1,
      // Old/unknown persisted shapes are discarded in favor of fresh demo data.
      migrate: () => ({ enabled: allEnabled() }),
      partialize: (state) => ({ enabled: state.enabled }),
    },
  ),
);

interface ToastItem {
  id: number;
  message: string;
}

export function ModulesPage() {
  const { t } = useTranslation();
  const enabled = useModulesStore((s) => s.enabled);
  const toggle = useModulesStore((s) => s.toggle);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);
  const notify = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2500);
  }, []);

  const enabledCount = MODULE_IDS.filter((id) => enabled[id]).length;

  const onToggle = (id: ModuleId) => {
    const name = t(`workday.modules.items.${id}.name`);
    const nowEnabled = toggle(id);
    notify(
      nowEnabled
        ? t("workday.modules.toastEnabled", { name })
        : t("workday.modules.toastDisabled", { name }),
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F7F9FB] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {t("workday.modules.title")}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">{t("workday.modules.subtitle")}</p>
        </div>
        <div className="rounded-full bg-[#16A3A3]/10 px-3 py-1.5 text-sm font-semibold text-[#16A3A3]">
          {t("workday.modules.enabledCount", {
            count: enabledCount,
            total: MODULE_IDS.length,
          })}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MODULE_IDS.map((id) => {
          const Icon = MODULE_ICONS[id];
          const isOn = enabled[id];
          const name = t(`workday.modules.items.${id}.name`);
          return (
            <div
              key={id}
              className={`rounded-xl border border-gray-200 bg-white p-5 transition ${
                isOn ? "" : "opacity-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#16A3A3]/10 text-[#16A3A3]">
                  <Icon size={20} />
                </div>
                <button
                  role="switch"
                  aria-checked={isOn}
                  aria-label={t("workday.modules.toggleAria", { name })}
                  onClick={() => onToggle(id)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    isOn ? "bg-[#16A3A3]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      isOn ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
              <div className="mt-3 text-base font-semibold text-gray-800">{name}</div>
              <p className="mt-1 text-sm text-gray-500">
                {t(`workday.modules.items.${id}.desc`)}
              </p>
            </div>
          );
        })}
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
