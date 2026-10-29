import { useState } from "react";
import { useTranslation } from "react-i18next";
import { InspectionVerdict, useMobileStore } from "./mobileStore";
import { IconBack, ScreenProps, StatusBar } from "./shared";

const SECTIONS: { key: string; items: string[] }[] = [
  { key: "bedroom", items: ["hangers", "dndCard", "bin", "bedMade"] },
  { key: "bathroom", items: ["mirror", "towels", "amenitiesRefill", "shower"] },
];

const ALL_ITEMS = SECTIONS.flatMap((s) => s.items);

function VerdictButton({
  kind,
  active,
  onClick,
  label,
}: {
  kind: InspectionVerdict;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  const activeCls =
    kind === "pass"
      ? "border-teal-600 bg-teal-600 text-white"
      : "border-red-500 bg-red-500 text-white";
  return (
    <button
      className={`flex h-8 w-8 items-center justify-center rounded-full border text-[14px] font-bold transition-colors ${
        active ? activeCls : "border-gray-300 bg-white text-gray-400"
      }`}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
    >
      {kind === "pass" ? "✓" : "✗"}
    </button>
  );
}

export function InspectionScreen({ go }: ScreenProps) {
  const { t } = useTranslation();
  const currentRoom = useMobileStore((s) => s.currentRoom);
  const showToast = useMobileStore((s) => s.showToast);
  const draft = useMobileStore((s) => s.inspectionDrafts[currentRoom]);
  const saveInspectionDraft = useMobileStore((s) => s.saveInspectionDraft);
  const clearInspectionDraft = useMobileStore((s) => s.clearInspectionDraft);

  const [results, setResults] = useState<Record<string, InspectionVerdict>>(
    () => ({ ...(draft?.results ?? {}) }),
  );
  const [comment, setComment] = useState(draft?.comment ?? "");

  const judged = Object.keys(results).length;
  const passed = Object.values(results).filter((v) => v === "pass").length;
  const total = ALL_ITEMS.length;
  const allJudged = judged === total;

  const setVerdict = (item: string, verdict: InspectionVerdict) => {
    setResults((prev) => {
      const next = { ...prev };
      if (next[item] === verdict) delete next[item];
      else next[item] = verdict;
      return next;
    });
  };

  const goBack = () => {
    if (judged > 0) {
      if (window.confirm(t("mobile.inspection.saveDraft"))) {
        saveInspectionDraft(currentRoom, { results, comment });
        go("roomDetail");
      }
      return;
    }
    go("roomDetail");
  };

  const confirm = () => {
    if (!allJudged) return;
    clearInspectionDraft(currentRoom);
    showToast("mobile.inspection.doneToast", { passed, total });
    go("roomDetail");
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="bg-white">
        <StatusBar />
        <div className="flex items-center px-3 pb-2 pt-1">
          <button
            className="flex h-9 w-9 items-center justify-center text-teal-600"
            onClick={goBack}
            aria-label={t("mobile.a11y.back")}
          >
            <IconBack className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center text-[16px] font-bold text-gray-900">
            {t("mobile.inspection.title", { room: currentRoom })}
          </div>
          <span className="w-9" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="mx-4 mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="text-[12px] font-bold uppercase tracking-wide text-gray-500">
            {t("mobile.inspection.summary")}
          </div>
          <div className="mt-1 text-[15px] font-semibold text-gray-900">
            {t("mobile.inspection.passed", { passed, total })}
          </div>
          <textarea
            placeholder={t("mobile.inspection.commentPlaceholder")}
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-800 outline-none placeholder:text-gray-400 focus:border-teal-500"
          />
        </div>

        {SECTIONS.map((section) => (
          <div key={section.key} className="mt-4">
            <div className="bg-gray-800 px-4 py-2 text-[13px] font-bold uppercase tracking-wide text-white">
              {t(`mobile.inspection.${section.key}`)}
            </div>
            <div className="divide-y divide-gray-100 bg-white">
              {section.items.map((item) => (
                <div key={item} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex-1 text-[14px] text-gray-800">
                    {t(`mobile.inspection.items.${item}`)}
                  </span>
                  <VerdictButton
                    kind="pass"
                    active={results[item] === "pass"}
                    onClick={() => setVerdict(item, "pass")}
                    label={`${t(`mobile.inspection.items.${item}`)} ✓`}
                  />
                  <VerdictButton
                    kind="fail"
                    active={results[item] === "fail"}
                    onClick={() => setVerdict(item, "fail")}
                    label={`${t(`mobile.inspection.items.${item}`)} ✗`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-6 px-4">
          <button
            className={`w-full rounded-xl py-3.5 text-[15px] font-bold text-white transition-colors ${
              allJudged ? "bg-teal-600 active:bg-teal-700" : "bg-gray-300"
            }`}
            disabled={!allJudged}
            onClick={confirm}
          >
            {t("mobile.inspection.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
