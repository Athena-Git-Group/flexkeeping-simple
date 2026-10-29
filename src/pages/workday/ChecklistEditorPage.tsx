import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useChecklistsStore,
  type ChecklistSection,
  type ChecklistTemplate,
} from "./checklists/store";
import { IconChecklist } from "./icons";

const TEAL = "#16A3A3";

interface Toast {
  id: number;
  message: string;
}

export function ChecklistEditorPage() {
  const { t } = useTranslation();

  const templates = useChecklistsStore((s) => s.templates);
  const selectedId = useChecklistsStore((s) => s.selectedId);
  const select = useChecklistsStore((s) => s.select);
  const addTemplate = useChecklistsStore((s) => s.addTemplate);
  const duplicateTemplate = useChecklistsStore((s) => s.duplicateTemplate);
  const deleteTemplate = useChecklistsStore((s) => s.deleteTemplate);
  const resetDemo = useChecklistsStore((s) => s.resetDemo);

  const selected = templates.find((tpl) => tpl.id === selectedId) ?? null;

  // "Saving… → Saved ✓" purely visual indicator
  const [saving, setSaving] = useState(false);
  const savingTimer = useRef<number | null>(null);
  const touch = useCallback(() => {
    setSaving(true);
    if (savingTimer.current !== null) window.clearTimeout(savingTimer.current);
    savingTimer.current = window.setTimeout(() => setSaving(false), 700);
  }, []);
  useEffect(
    () => () => {
      if (savingTimer.current !== null) window.clearTimeout(savingTimer.current);
    },
    [],
  );

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const notify = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2500);
  }, []);

  const handleNew = () => {
    addTemplate(t("workday.checklists.untitledTemplate"));
    touch();
  };

  const handleDuplicate = () => {
    if (selected === null) return;
    duplicateTemplate(selected.id, t("workday.checklists.copySuffix"));
    notify(t("workday.checklists.toastDuplicated"));
    touch();
  };

  const handleDeleteTemplate = () => {
    if (selected === null) return;
    if (
      !window.confirm(
        t("workday.checklists.confirmDeleteTemplate", { name: selected.name }),
      )
    )
      return;
    deleteTemplate(selected.id);
    notify(t("workday.checklists.toastDeleted"));
    touch();
  };

  return (
    <div className="flex h-full flex-col p-6">
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">
          {t("workday.checklists.title")}
        </h1>
        <div className="flex items-center gap-4">
          <span
            className={`text-xs ${saving ? "text-gray-400" : "text-[#16A3A3]"}`}
            aria-live="polite"
          >
            {saving
              ? t("workday.checklists.saving")
              : t("workday.checklists.saved")}
          </span>
          <button
            type="button"
            onClick={() => {
              resetDemo();
              touch();
            }}
            className="text-xs text-gray-400 underline hover:text-gray-600"
          >
            {t("workday.checklists.resetDemo")}
          </button>
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={selected === null}
            className="rounded-lg border border-[#16A3A3] px-4 py-2 text-sm font-semibold text-[#16A3A3] hover:bg-[#16A3A3]/5 disabled:opacity-40"
          >
            {t("workday.checklists.duplicate")}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        {/* left column: template list */}
        <aside className="flex w-[300px] flex-shrink-0 flex-col rounded-xl border border-line bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
            <span className="text-xs text-gray-400">
              {t("workday.checklists.templateCount", {
                count: templates.length,
              })}
            </span>
            <button
              type="button"
              onClick={handleNew}
              className="rounded-md px-2.5 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: TEAL }}
            >
              {t("workday.checklists.newTemplate")}
            </button>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto p-2">
            {templates.map((tpl) => {
              const itemCount = tpl.sections.reduce(
                (n, sec) => n + sec.items.length,
                0,
              );
              return (
                <li key={tpl.id}>
                  <button
                    type="button"
                    onClick={() => select(tpl.id)}
                    className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left ${
                      tpl.id === selectedId
                        ? "bg-[#16A3A3]/10"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <IconChecklist
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                        tpl.id === selectedId
                          ? "text-[#16A3A3]"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm font-medium ${
                          tpl.id === selectedId ? "text-[#16A3A3]" : "text-ink"
                        }`}
                      >
                        {tpl.name ||
                          t("workday.checklists.untitledTemplate")}
                      </span>
                      <span className="block text-xs text-gray-400">
                        {t("workday.checklists.stats", {
                          sections: tpl.sections.length,
                          items: itemCount,
                        })}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* right column: editor */}
        <section className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-line bg-surface shadow-card">
          {selected === null ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-400">
              <IconChecklist className="mb-2 h-10 w-10" />
              <p className="text-sm font-medium">
                {t("workday.checklists.emptyTitle")}
              </p>
              <p className="text-xs">{t("workday.checklists.emptyHint")}</p>
            </div>
          ) : (
            <TemplateEditor
              key={selected.id}
              template={selected}
              onDeleteTemplate={handleDeleteTemplate}
              touch={touch}
            />
          )}
        </section>
      </div>

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

// --- editor ---------------------------------------------------------------------

function TemplateEditor({
  template,
  onDeleteTemplate,
  touch,
}: {
  template: ChecklistTemplate;
  onDeleteTemplate: () => void;
  touch: () => void;
}) {
  const { t } = useTranslation();
  const renameTemplate = useChecklistsStore((s) => s.renameTemplate);
  const addSection = useChecklistsStore((s) => s.addSection);
  const deleteSection = useChecklistsStore((s) => s.deleteSection);

  const itemCount = useMemo(
    () => template.sections.reduce((n, sec) => n + sec.items.length, 0),
    [template],
  );

  return (
    <div className="p-6">
      <div className="mb-1 flex items-center justify-between gap-3">
        <input
          type="text"
          value={template.name}
          aria-label={t("workday.checklists.templateNameAria")}
          placeholder={t("workday.checklists.untitledTemplate")}
          onChange={(e) => {
            renameTemplate(template.id, e.target.value);
            touch();
          }}
          className="-ml-2 w-full max-w-md rounded-md border border-transparent px-2 py-1 text-lg font-bold text-ink hover:border-gray-300 focus:border-[#16A3A3] focus:outline-none"
        />
        <button
          type="button"
          onClick={onDeleteTemplate}
          className="flex-shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
        >
          {t("workday.checklists.deleteTemplate")}
        </button>
      </div>
      <p className="mb-5 text-xs text-gray-400">
        {t("workday.checklists.stats", {
          sections: template.sections.length,
          items: itemCount,
        })}
      </p>

      <div className="space-y-4">
        {template.sections.map((section) => (
          <SectionEditor
            key={section.id}
            templateId={template.id}
            section={section}
            onDelete={() => {
              if (
                !window.confirm(
                  t("workday.checklists.confirmDeleteSection", {
                    name: section.name,
                  }),
                )
              )
                return;
              deleteSection(template.id, section.id);
              touch();
            }}
            touch={touch}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          addSection(template.id, t("workday.checklists.newSectionName"));
          touch();
        }}
        className="mt-4 w-full rounded-lg border border-dashed border-gray-300 px-3 py-2.5 text-sm font-medium text-ink-soft hover:border-[#16A3A3] hover:text-[#16A3A3]"
      >
        {t("workday.checklists.addSection")}
      </button>
    </div>
  );
}

// --- section ---------------------------------------------------------------------

function SectionEditor({
  templateId,
  section,
  onDelete,
  touch,
}: {
  templateId: string;
  section: ChecklistSection;
  onDelete: () => void;
  touch: () => void;
}) {
  const { t } = useTranslation();
  const renameSection = useChecklistsStore((s) => s.renameSection);
  const addItem = useChecklistsStore((s) => s.addItem);
  const updateItem = useChecklistsStore((s) => s.updateItem);
  const deleteItem = useChecklistsStore((s) => s.deleteItem);

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      {/* dark section header bar */}
      <div className="flex items-center gap-2 bg-gray-800 px-3 py-2">
        <input
          type="text"
          value={section.name}
          placeholder={t("workday.checklists.sectionNamePlaceholder")}
          onChange={(e) => {
            renameSection(templateId, section.id, e.target.value);
            touch();
          }}
          className="w-full rounded border border-transparent bg-transparent px-1.5 py-0.5 text-sm font-semibold text-white placeholder-gray-400 hover:border-gray-600 focus:border-[#16A3A3] focus:outline-none"
        />
        <button
          type="button"
          aria-label={t("workday.checklists.deleteSectionAria", {
            name: section.name,
          })}
          onClick={onDelete}
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-sm text-gray-400 hover:bg-gray-700 hover:text-red-400"
        >
          ✕
        </button>
      </div>

      {/* items */}
      <ul className="divide-y divide-line bg-white">
        {section.items.map((it) => (
          <li key={it.id} className="flex items-center gap-2 px-3 py-2">
            <input
              type="text"
              value={it.name}
              placeholder={t("workday.checklists.itemNamePlaceholder")}
              onChange={(e) => {
                updateItem(templateId, section.id, it.id, {
                  name: e.target.value,
                });
                touch();
              }}
              className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-[#16A3A3] focus:outline-none"
            />
            <input
              type="number"
              min={0}
              value={it.qty ?? ""}
              placeholder={t("workday.checklists.qtyPlaceholder")}
              onChange={(e) => {
                const raw = e.target.value;
                updateItem(templateId, section.id, it.id, {
                  qty: raw === "" ? null : Math.max(0, Number(raw)),
                });
                touch();
              }}
              className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-[#16A3A3] focus:outline-none"
            />
            <button
              type="button"
              aria-label={t("workday.checklists.deleteItemAria", {
                name: it.name,
              })}
              onClick={() => {
                deleteItem(templateId, section.id, it.id);
                touch();
              }}
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-sm text-gray-400 hover:bg-red-50 hover:text-red-500"
            >
              ✕
            </button>
          </li>
        ))}
        <li className="px-3 py-2">
          <button
            type="button"
            onClick={() => {
              addItem(templateId, section.id, "");
              touch();
            }}
            className="text-sm font-medium text-[#16A3A3] hover:underline"
          >
            {t("workday.checklists.addItem")}
          </button>
        </li>
      </ul>
    </div>
  );
}
