import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AssignmentType, ID, Priority } from "@/domain/types";
import { useLabels } from "@/domain/labels";
import { FIELD_COLORS } from "@/domain/fieldStatus";
import { useCreateAssignment, useSpaces } from "@/hooks/queries";
import { cn } from "@/lib/cn";

const ASSIGNMENT_TYPES: AssignmentType[] = [
  "task",
  "repair",
  "issue",
  "flaw_cleaning",
  "room_order",
];

const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];

interface NewAssignmentSheetProps {
  open: boolean;
  /** When opened from a room, preselect that space. */
  prefillSpaceId?: ID;
  onClose: () => void;
  /** Called after a successful create, so the caller can confirm or switch tab. */
  onCreated: () => void;
}

export function NewAssignmentSheet({
  open,
  prefillSpaceId,
  onClose,
  onCreated,
}: NewAssignmentSheetProps) {
  const { t } = useTranslation();
  const labels = useLabels();
  const { data: spaces } = useSpaces();
  const create = useCreateAssignment();

  const [type, setType] = useState<AssignmentType>("task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [spaceId, setSpaceId] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [reportedByGuest, setReportedByGuest] = useState(false);

  // Reset the form each time the sheet opens so a prefilled room lands cleanly.
  useEffect(() => {
    if (open) {
      setType("task");
      setTitle("");
      setDescription("");
      setSpaceId(prefillSpaceId ?? "");
      setPriority("medium");
      setReportedByGuest(false);
    }
  }, [open, prefillSpaceId]);

  const sortedSpaces = useMemo(
    () => [...(spaces ?? [])].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })),
    [spaces],
  );

  if (!open) return null;

  const canSubmit = title.trim().length > 0 && !create.isPending;

  function submit() {
    if (!canSubmit) return;
    create.mutate(
      {
        type,
        title: title.trim(),
        description: description.trim() || undefined,
        spaceId: spaceId || undefined,
        priority,
        reportedByGuest,
      },
      { onSuccess: () => onCreated() },
    );
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <button
        type="button"
        aria-label={t("common.close")}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative max-h-[92%] overflow-y-auto rounded-t-2xl bg-surface px-4 pb-6 pt-3 shadow-panel">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{t("field.new.title")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-ink-faint hover:bg-canvas"
            aria-label={t("common.close")}
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-faint">
          {t("field.new.type")}
        </label>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {ASSIGNMENT_TYPES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                type === value
                  ? "border-transparent text-white"
                  : "border-line bg-surface text-ink-soft",
              )}
              style={type === value ? { backgroundColor: FIELD_COLORS.action } : undefined}
            >
              {labels.assignmentType[value]}
            </button>
          ))}
        </div>

        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-faint">
          {t("field.new.titleLabel")}
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("field.new.titlePlaceholder")}
          className="mb-4 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none focus:border-[#52c2b6]"
        />

        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-faint">
          {t("field.new.description")}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("field.new.descriptionPlaceholder")}
          rows={3}
          className="mb-4 w-full resize-none rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none focus:border-[#52c2b6]"
        />

        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-faint">
          {t("field.new.room")}
        </label>
        <select
          value={spaceId}
          onChange={(e) => setSpaceId(e.target.value)}
          className="mb-4 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none focus:border-[#52c2b6]"
        >
          <option value="">{t("field.new.roomNone")}</option>
          {sortedSpaces.map((space) => (
            <option key={space.id} value={space.id}>
              {t("field.tasks.roomPrefix", { number: space.number })}
            </option>
          ))}
        </select>

        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-faint">
          {t("field.new.priority")}
        </label>
        <div className="mb-4 inline-flex w-full rounded-lg bg-canvas p-0.5 text-sm">
          {PRIORITIES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setPriority(value)}
              className={cn(
                "flex-1 rounded-md px-2 py-1.5 font-medium transition-colors",
                priority === value ? "bg-white text-ink shadow-card" : "text-ink-faint",
              )}
            >
              {labels.priority[value]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setReportedByGuest((v) => !v)}
          className="mb-5 flex w-full items-center justify-between rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm"
        >
          <span className="font-medium text-ink">{t("field.new.reportedByGuest")}</span>
          <span
            className={cn(
              "relative h-6 w-10 rounded-full transition-colors",
              reportedByGuest ? "bg-[#52c2b6]" : "bg-line",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                reportedByGuest ? "translate-x-[1.125rem]" : "translate-x-0.5",
              )}
            />
          </span>
        </button>

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: FIELD_COLORS.action }}
        >
          {t("field.new.submit")}
        </button>
      </div>
    </div>
  );
}
