import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTasksStore } from "@/pages/workday/tasks/store";
import { useMobileStore } from "./mobileStore";
import {
  IconCamera,
  IconCheck,
  IconChevronRight,
  IconClose,
  IconDots,
  IconLines,
  IconMic,
  IconPaperclip,
  NAVY,
  ScreenProps,
  StatusBar,
} from "./shared";

const REPAIR_CODES = ["plumbing", "electrical", "furniture", "hvac"] as const;

export function AddRepairScreen({ go }: ScreenProps) {
  const { t } = useTranslation();
  const addTask = useTasksStore((s) => s.addTask);
  const currentRoom = useMobileStore((s) => s.currentRoom);
  const showToast = useMobileStore((s) => s.showToast);

  const [code, setCode] = useState<string | null>(null);
  const [codesOpen, setCodesOpen] = useState(false);
  const [text, setText] = useState("");

  const canSubmit = code !== null || text.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    const codeLabel = code ? t(`mobile.repair.codes.${code}`) : "";
    const trimmed = text.trim();
    const title =
      codeLabel && trimmed ? `${codeLabel}: ${trimmed}` : codeLabel || trimmed;
    addTask({
      room: currentRoom,
      title,
      priority: "medium",
      source: "quickAction",
      module: "maintenance",
    });
    showToast("mobile.repair.created");
    go("roomDetail");
  };

  return (
    <div className="flex h-full flex-col bg-gray-500/60">
      <StatusBar light />
      <div className="mt-2 flex min-h-0 flex-1 flex-col rounded-t-3xl bg-white">
        <div className="flex items-center px-4 pb-2 pt-4">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600"
            onClick={() => go("roomDetail")}
            aria-label={t("mobile.a11y.close")}
          >
            <IconClose size={14} />
          </button>
          <div className="flex-1 text-center text-[16px] font-bold text-gray-900">
            {t("mobile.repair.title")}
          </div>
          <button
            className={`w-12 text-right text-[15px] font-bold ${
              canSubmit ? "text-teal-600" : "text-gray-300"
            }`}
            disabled={!canSubmit}
            onClick={submit}
          >
            {t("mobile.repair.done")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-700 py-3 text-[15px] font-semibold text-white shadow">
            <IconMic />
            {t("mobile.repair.assistant")}
          </button>

          <div className="mt-5 flex items-center gap-2 text-gray-800">
            <IconLines />
            <span className="text-[13px] font-bold">{t("mobile.repair.repairStatus")}</span>
          </div>
          <button className="relative mt-2 flex w-full items-center gap-3 overflow-hidden rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <span className="absolute inset-y-0 left-0 w-1 bg-teal-500" />
            <span
              className="flex h-7 w-7 items-center justify-center rounded text-[13px] font-bold text-white"
              style={{ backgroundColor: NAVY }}
            >
              M
            </span>
            <span className="flex-1 text-left text-[14px] text-gray-800">
              {t("mobile.repair.internalRepair")}
            </span>
            <span className="text-gray-400">
              <IconChevronRight />
            </span>
          </button>

          <div className="mt-5 text-[13px] font-bold text-gray-800">
            {t("mobile.repair.general")}
          </div>
          <button
            className="mt-2 flex w-full items-center rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
            onClick={() => setCodesOpen((v) => !v)}
          >
            <span
              className={`flex-1 text-left text-[14px] ${code ? "text-gray-800" : "text-gray-400"}`}
            >
              {code ? t(`mobile.repair.codes.${code}`) : t("mobile.repair.selectCode")}
            </span>
            <span className={`text-gray-400 transition-transform ${codesOpen ? "rotate-90" : ""}`}>
              <IconChevronRight />
            </span>
          </button>
          {codesOpen && (
            <div className="mt-1 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
              {REPAIR_CODES.map((c) => (
                <button
                  key={c}
                  className="flex w-full items-center px-4 py-2.5 text-left active:bg-gray-50"
                  onClick={() => {
                    setCode(c);
                    setCodesOpen(false);
                  }}
                >
                  <span className="flex-1 text-[14px] text-gray-800">
                    {t(`mobile.repair.codes.${c}`)}
                  </span>
                  {code === c && (
                    <span className="text-teal-600">
                      <IconCheck size={18} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          <textarea
            placeholder={t("mobile.repair.startTyping")}
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-800 shadow-sm outline-none placeholder:text-gray-400 focus:border-teal-500"
          />

          <div className="mt-4 flex items-center gap-2 text-gray-800">
            <IconPaperclip />
            <span className="text-[13px] font-bold">{t("mobile.repair.attachments")}</span>
          </div>
          <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500 py-3 text-[14px] font-semibold text-teal-600">
            <IconCamera />
            {t("mobile.repair.addPhotoOrVideo")}
          </button>

          <div className="mt-5 text-[13px] font-bold text-gray-800">
            {t("mobile.repair.selectSpace")}
          </div>
          <button className="mt-2 flex w-full items-center rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <span className="flex flex-1 items-center">
              <span className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1 text-[13px] text-gray-700">
                {currentRoom}
                <IconClose size={11} />
              </span>
            </span>
            <span className="text-gray-400">
              <IconChevronRight />
            </span>
          </button>

          <button className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl bg-teal-50 py-3 text-[14px] font-semibold text-teal-700">
            <IconDots />
            {t("mobile.repair.addMoreOptions")}
          </button>
        </div>
      </div>
    </div>
  );
}
