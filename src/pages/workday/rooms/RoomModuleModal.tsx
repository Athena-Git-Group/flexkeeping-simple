import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconChevron, IconCross } from "@/pages/workday/icons";
import { useTasksStore, type TaskPriority } from "@/pages/workday/tasks/store";

/** The six room-card icon cells, in render order (glass → bell → tray → spray → wrench → doc). */
export const ROOM_MODULE_IDS = [
  "minibar",
  "service",
  "roomService",
  "cleaning",
  "maintenance",
  "notes",
] as const;

export type RoomModuleId = (typeof ROOM_MODULE_IDS)[number];

/** Demo code options per module, resolved as `workday.rooms.codes.<module>.<option>`. */
const CODE_OPTIONS: Record<RoomModuleId, string[]> = {
  minibar: ["restock", "checkout"],
  service: ["delivery", "taxi", "wakeup"],
  roomService: ["breakfast", "drinks", "extraBed"],
  cleaning: ["dust", "odor", "missingAmenities", "other"],
  maintenance: ["ac", "tv", "wifi", "lightbulb", "other"],
  notes: [],
};

const HAS_ATTACHMENTS: ReadonlySet<RoomModuleId> = new Set(["maintenance", "cleaning"]);

function FieldLabel({ children }: { children: string }) {
  return <div className="mb-1.5 text-[13px] font-bold text-gray-800">{children}</div>;
}

export function RoomModuleModal({
  module,
  room,
  onClose,
  onSubmit,
}: {
  module: RoomModuleId;
  room: number;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  const addTask = useTasksStore((s) => s.addTask);
  const panelRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState("");
  const [priority, setPriority] = useState("medium");
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const moduleName = t(`workday.rooms.modules.${module}`);
    const codeLabel = code ? t(`workday.rooms.codes.${module}.${code}`) : "";
    addTask({
      room,
      title: codeLabel ? `${moduleName}: ${codeLabel}` : moduleName,
      note: text.trim() || undefined,
      priority: module === "service" ? (priority as TaskPriority) : "medium",
      source: "quickAction",
      module,
    });
    onSubmit();
  };

  useEffect(() => {
    panelRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const codes = CODE_OPTIONS[module];
  const titleId = "room-module-modal-title";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-[480px] max-w-full rounded-xl bg-white shadow-xl outline-none"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 id={titleId} className="text-[16px] font-bold text-gray-900">
            {t(`workday.rooms.modal.titles.${module}`)}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("workday.rooms.modal.close")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            <IconCross size={14} />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1 text-[13px] text-gray-700">
              {room}
              <IconCross size={11} />
            </span>
            <span className="text-[13px] text-gray-500">
              {t("workday.rooms.modal.roomLabel", { room })}
            </span>
          </div>

          {codes.length > 0 && (
            <div className="mt-4">
              <FieldLabel>{t("workday.rooms.modal.codeLabel")}</FieldLabel>
              <div className="relative">
                <select
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-9 text-[14px] text-gray-800 shadow-sm outline-none focus:border-teal-500"
                >
                  <option value="">{t("workday.rooms.modal.codeLabel")}</option>
                  {codes.map((c) => (
                    <option key={c} value={c}>
                      {t(`workday.rooms.codes.${module}.${c}`)}
                    </option>
                  ))}
                </select>
                <IconChevron
                  direction="down"
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
          )}

          {module === "service" && (
            <div className="mt-4">
              <FieldLabel>{t("workday.rooms.modal.priorityLabel")}</FieldLabel>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-9 text-[14px] text-gray-800 shadow-sm outline-none focus:border-teal-500"
                >
                  <option value="low">{t("workday.rooms.modal.priorityLow")}</option>
                  <option value="medium">{t("workday.rooms.modal.priorityMedium")}</option>
                  <option value="high">{t("workday.rooms.modal.priorityHigh")}</option>
                </select>
                <IconChevron
                  direction="down"
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
          )}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("workday.rooms.modal.startTyping")}
            rows={3}
            className="mt-4 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-800 shadow-sm outline-none placeholder:text-gray-400 focus:border-teal-500"
          />

          {HAS_ATTACHMENTS.has(module) && (
            <button
              type="button"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500 py-3 text-[14px] font-semibold text-teal-600 hover:bg-teal-50"
            >
              {t("workday.rooms.modal.addPhotoOrVideo")}
            </button>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-gray-600 hover:bg-gray-50"
          >
            {t("workday.rooms.modal.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-xl bg-teal-500 px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-teal-600"
          >
            {t("workday.rooms.modal.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
