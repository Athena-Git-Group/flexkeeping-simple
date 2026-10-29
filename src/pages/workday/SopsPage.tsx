import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  SOP_CATEGORIES,
  useSopsStore,
  type Sop,
  type SopCategory,
} from "./sops/store";
import { IconChecklist, IconDoc, IconSearch } from "./icons";

const TEAL = "#16A3A3";

const CATEGORY_KEY: Record<SopCategory, string> = {
  rooms: "workday.sops.categories.rooms",
  public: "workday.sops.categories.public",
  frontdesk: "workday.sops.categories.frontdesk",
  safety: "workday.sops.categories.safety",
};

interface Toast {
  id: number;
  message: string;
}

export function SopsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sops = useSopsStore((s) => s.sops);
  const addSop = useSopsStore((s) => s.addSop);
  const deleteSop = useSopsStore((s) => s.deleteSop);
  const resetDemo = useSopsStore((s) => s.resetDemo);

  const [selectedId, setSelectedId] = useState<string | null>(
    sops[0]?.id ?? null,
  );
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const notify = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2500);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sops;
    return sops.filter((sop) => sop.title.toLowerCase().includes(q));
  }, [sops, query]);

  const grouped = useMemo(
    () =>
      SOP_CATEGORIES.map((category) => ({
        category,
        sops: filtered.filter((sop) => sop.category === category),
      })).filter((group) => group.sops.length > 0),
    [filtered],
  );

  const selected = sops.find((sop) => sop.id === selectedId) ?? null;

  const handleDelete = (sop: Sop) => {
    if (!window.confirm(t("workday.sops.confirmDelete", { title: sop.title })))
      return;
    deleteSop(sop.id);
    if (selectedId === sop.id) setSelectedId(null);
    notify(t("workday.sops.toastDeleted"));
  };

  const handleCreate = (input: {
    title: string;
    category: SopCategory;
    steps: string[];
  }) => {
    const sop = addSop({
      title: input.title,
      category: input.category,
      steps: input.steps.map((line) => ({ title: line, description: "" })),
    });
    setSelectedId(sop.id);
    setModalOpen(false);
    notify(t("workday.sops.toastCreated", { title: sop.title }));
  };

  return (
    <div className="flex h-full flex-col p-6">
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">{t("workday.sops.title")}</h1>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              resetDemo();
              setSelectedId(null);
            }}
            className="text-xs text-gray-400 underline hover:text-gray-600"
          >
            {t("workday.sops.resetDemo")}
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-card hover:opacity-90"
            style={{ backgroundColor: TEAL }}
          >
            {t("workday.sops.newSop")}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        {/* left column: list */}
        <aside className="flex w-[300px] flex-shrink-0 flex-col rounded-xl border border-line bg-surface shadow-card">
          <div className="border-b border-line p-3">
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("workday.sops.searchPlaceholder")}
                className="w-full rounded-md border border-gray-300 py-1.5 pl-8 pr-2 text-sm focus:border-[#16A3A3] focus:outline-none"
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {grouped.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-gray-400">
                {t("workday.sops.noResults")}
              </p>
            ) : (
              grouped.map((group) => (
                <div key={group.category} className="mb-3">
                  <h2 className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {t(CATEGORY_KEY[group.category])}
                  </h2>
                  <ul>
                    {group.sops.map((sop) => (
                      <li key={sop.id} className="group relative">
                        <button
                          type="button"
                          onClick={() => setSelectedId(sop.id)}
                          className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left ${
                            sop.id === selectedId
                              ? "bg-[#16A3A3]/10"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <IconDoc
                            className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                              sop.id === selectedId
                                ? "text-[#16A3A3]"
                                : "text-gray-400"
                            }`}
                          />
                          <span className="min-w-0 flex-1 pr-5">
                            <span
                              className={`block truncate text-sm font-medium ${
                                sop.id === selectedId
                                  ? "text-[#16A3A3]"
                                  : "text-ink"
                              }`}
                            >
                              {sop.title}
                            </span>
                            <span className="block text-xs text-gray-400">
                              {t("workday.sops.updatedLabel", {
                                date: sop.updatedAt,
                              })}
                            </span>
                          </span>
                        </button>
                        <button
                          type="button"
                          aria-label={t("workday.sops.deleteAria", {
                            title: sop.title,
                          })}
                          onClick={() => handleDelete(sop)}
                          className="absolute right-1.5 top-2 hidden h-6 w-6 items-center justify-center rounded text-sm text-gray-400 hover:bg-red-50 hover:text-red-500 group-hover:flex"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* right column: detail */}
        <section className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-line bg-surface shadow-card">
          {selected === null ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-400">
              <IconDoc className="mb-2 h-10 w-10" />
              <p className="text-sm font-medium">
                {t("workday.sops.emptyTitle")}
              </p>
              <p className="text-xs">{t("workday.sops.emptyHint")}</p>
            </div>
          ) : (
            <SopDetail
              sop={selected}
              onGoChecklists={() => navigate("/checklists")}
            />
          )}
        </section>
      </div>

      {modalOpen && (
        <NewSopModal onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
      )}

      <div
        className="pointer-events-none fixed bottom-6 right-6 z-50 space-y-2"
        aria-live="polite"
      >
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

// --- detail view ---------------------------------------------------------------

function SopDetail({
  sop,
  onGoChecklists,
}: {
  sop: Sop;
  onGoChecklists: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="p-6">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold text-ink">{sop.title}</h2>
        <span className="rounded-full bg-[#16A3A3]/10 px-2.5 py-0.5 text-xs font-medium text-[#16A3A3]">
          {t(CATEGORY_KEY[sop.category])}
        </span>
      </div>
      <p className="mb-5 text-xs text-gray-400">
        {t("workday.sops.versionLabel", { version: sop.version })}
        {" · "}
        {t("workday.sops.updatedLabel", { date: sop.updatedAt })}
        {" · "}
        {t("workday.sops.stepCount", { count: sop.steps.length })}
      </p>

      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {t("workday.sops.stepsTitle")}
      </h3>
      <ol className="space-y-3">
        {sop.steps.map((step, index) => (
          <li
            key={index}
            className="flex gap-3 rounded-lg border border-line bg-canvas p-4"
          >
            <span
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: TEAL }}
            >
              {index + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-ink">{step.title}</p>
              {step.description && (
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {step.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {sop.relatedChecklists.length > 0 && (
        <div className="mt-6 border-t border-line pt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t("workday.sops.relatedChecklists")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {sop.relatedChecklists.map((name) => (
              <button
                key={name}
                type="button"
                onClick={onGoChecklists}
                className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-sm text-[#16A3A3] hover:border-[#16A3A3] hover:bg-[#16A3A3]/5"
              >
                <IconChecklist className="h-4 w-4" />
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- new SOP modal ---------------------------------------------------------------

function NewSopModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: {
    title: string;
    category: SopCategory;
    steps: string[];
  }) => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<SopCategory>("rooms");
  const [stepsText, setStepsText] = useState("");

  const steps = stepsText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const valid = title.trim().length > 0 && steps.length > 0;

  const submit = () => {
    if (!valid) return;
    onSubmit({ title: title.trim(), category, steps });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("workday.sops.modal.title")}
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">
            {t("workday.sops.modal.title")}
          </h2>
          <button
            type="button"
            aria-label={t("workday.sops.modal.close")}
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium text-ink-soft">
            {t("workday.sops.modal.nameLabel")}
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("workday.sops.modal.namePlaceholder")}
            className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-[#16A3A3] focus:outline-none"
          />
        </label>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium text-ink-soft">
            {t("workday.sops.modal.categoryLabel")}
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as SopCategory)}
            className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:border-[#16A3A3] focus:outline-none"
          >
            {SOP_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(CATEGORY_KEY[c])}
              </option>
            ))}
          </select>
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-medium text-ink-soft">
            {t("workday.sops.modal.stepsLabel")}
            <span className="ml-1 font-normal text-gray-400">
              ({t("workday.sops.modal.stepsHint")})
            </span>
          </span>
          <textarea
            value={stepsText}
            onChange={(e) => setStepsText(e.target.value)}
            placeholder={t("workday.sops.modal.stepsPlaceholder")}
            rows={6}
            className="w-full resize-y rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-[#16A3A3] focus:outline-none"
          />
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-ink-soft hover:bg-gray-50"
          >
            {t("workday.sops.modal.cancel")}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!valid}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ backgroundColor: TEAL }}
          >
            {t("workday.sops.modal.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
