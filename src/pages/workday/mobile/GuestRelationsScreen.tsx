import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FeedbackType, useMobileStore } from "./mobileStore";
import {
  Face,
  IconCalendar,
  IconClose,
  IconMenu,
  IconPlus,
  ScreenProps,
  StatusBar,
  TabBar,
} from "./shared";

type Tab = FeedbackType | "coq";

const COST_PER_CASE = 40;

export function GuestRelationsScreen({ go }: ScreenProps) {
  const { t } = useTranslation();
  const feedback = useMobileStore((s) => s.feedback);
  const addFeedback = useMobileStore((s) => s.addFeedback);
  const toggleResolved = useMobileStore((s) => s.toggleResolved);

  const [tab, setTab] = useState<Tab>("negative");
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<FeedbackType>("negative");
  const [note, setNote] = useState("");

  const negatives = feedback.filter((f) => f.type === "negative");
  const visible = tab === "coq" ? [] : feedback.filter((f) => f.type === tab);

  const submit = () => {
    if (!title.trim()) return;
    addFeedback({
      title: title.trim(),
      note: note.trim() || undefined,
      type,
      resolved: false,
      mood: type === "negative" ? "sad" : "neutral",
      score: type === "negative" ? 2 : 4,
    });
    setTab(type);
    setTitle("");
    setNote("");
    setType("negative");
    setFormOpen(false);
  };

  const tabBtn = (id: Tab, label: string) => (
    <button
      className={`flex-1 rounded-md py-1.5 ${
        tab === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
      }`}
      onClick={() => setTab(id)}
    >
      {label}
    </button>
  );

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="bg-white">
        <StatusBar />
        <div className="px-4 pt-1">
          <button
            className="flex h-9 w-9 items-center justify-center text-gray-700"
            aria-label={t("mobile.a11y.menu")}
          >
            <IconMenu />
          </button>
          <h1 className="mt-1 text-[30px] font-extrabold text-gray-900">
            {t("mobile.guest.title")}
          </h1>
          <div className="mt-3 flex rounded-lg bg-gray-100 p-0.5 text-[12px] font-medium">
            {tabBtn("negative", t("mobile.guest.negative"))}
            {tabBtn("positive", t("mobile.guest.positive"))}
            {tabBtn("coq", t("mobile.guest.costOfQuality"))}
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div className="h-full space-y-3 overflow-y-auto px-4 pb-24 pt-4">
          {tab === "coq" ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
              <div className="text-[14px] font-bold text-gray-900">
                {t("mobile.guest.costOfQuality")}
              </div>
              <div className="mt-3 space-y-2 text-[13px] text-gray-700">
                <div className="flex items-center justify-between">
                  <span>{t("mobile.guest.coq.cases")}</span>
                  <span className="font-semibold">{negatives.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("mobile.guest.coq.perCase")}</span>
                  <span className="font-semibold">€{COST_PER_CASE}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-[14px]">
                  <span className="font-bold">{t("mobile.guest.coq.total")}</span>
                  <span className="font-bold text-red-500">
                    €{negatives.length * COST_PER_CASE}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            visible.map((f) => (
              <div
                key={f.id}
                className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm"
              >
                <span
                  className={`absolute inset-y-0 left-0 w-1.5 ${
                    f.type === "negative" ? "bg-orange-400" : "bg-teal-500"
                  }`}
                />
                <div className="flex items-start justify-between gap-2 pl-1">
                  <div className="text-[14px] font-semibold text-gray-900">
                    {f.titleKey ? t(`mobile.guest.items.${f.titleKey}`) : f.title}
                  </div>
                  <button
                    className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                      f.resolved
                        ? "border-green-500 text-green-600"
                        : "border-red-500 text-red-500"
                    }`}
                    onClick={() => toggleResolved(f.id)}
                  >
                    {f.resolved ? t("mobile.guest.resolved") : t("mobile.guest.unresolved")}
                  </button>
                </div>
                {f.note && (
                  <div className="mt-1.5 pl-1 text-[12px] text-gray-500">{f.note}</div>
                )}
                <div className="mt-2.5 flex items-center gap-4 pl-1 text-[12px] text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <IconCalendar />
                    {t("mobile.guest.date")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Face mood={f.mood} />
                    {f.score}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {!formOpen && (
          <button
            className="absolute bottom-5 right-4 flex items-center gap-2 rounded-full bg-teal-600 px-5 py-3 text-[14px] font-semibold text-white shadow-lg active:bg-teal-700"
            onClick={() => setFormOpen(true)}
          >
            <IconPlus size={16} />
            {t("mobile.guest.addFeedback")}
          </button>
        )}

        {formOpen && (
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-gray-200 bg-white px-4 pb-6 pt-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-bold text-gray-900">
                {t("mobile.guest.addFeedback")}
              </div>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600"
                onClick={() => setFormOpen(false)}
                aria-label={t("mobile.a11y.close")}
              >
                <IconClose size={14} />
              </button>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("mobile.guest.form.titlePlaceholder")}
              className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] text-gray-800 outline-none placeholder:text-gray-400 focus:border-teal-500"
            />
            <div className="mt-2 flex rounded-lg bg-gray-100 p-0.5 text-[12px] font-medium">
              {(["negative", "positive"] as const).map((v) => (
                <button
                  key={v}
                  className={`flex-1 rounded-md py-1.5 ${
                    type === v ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
                  }`}
                  onClick={() => setType(v)}
                >
                  {t(`mobile.guest.${v}`)}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("mobile.guest.form.notePlaceholder")}
              rows={2}
              className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] text-gray-800 outline-none placeholder:text-gray-400 focus:border-teal-500"
            />
            <button
              className={`mt-3 w-full rounded-xl py-3 text-[14px] font-bold text-white ${
                title.trim() ? "bg-teal-600 active:bg-teal-700" : "bg-gray-300"
              }`}
              disabled={!title.trim()}
              onClick={submit}
            >
              {t("mobile.guest.form.submit")}
            </button>
          </div>
        )}
      </div>

      <TabBar go={go} active="guest" />
    </div>
  );
}
