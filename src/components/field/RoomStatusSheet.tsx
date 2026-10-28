import { useTranslation } from "react-i18next";
import type { Cleanup, RoomCleanliness, Space } from "@/domain/types";
import { useLabels } from "@/domain/labels";
import { fieldTileStyle, tileBackground } from "@/domain/fieldStatus";
import { useSetCleanliness } from "@/hooks/queries";

const CLEANLINESS_OPTIONS: RoomCleanliness[] = [
  "dirty",
  "stripped",
  "awaiting_inspection",
  "inspected",
  "out_of_order",
  "do_not_disturb",
];

interface RoomStatusSheetProps {
  space: Space | null;
  sectorName: string;
  cleanup?: Cleanup;
  assigneeName?: string;
  onClose: () => void;
  /** Open the new-assignment form prefilled with this room. */
  onReport: (spaceId: string) => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-ink-faint">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

export function RoomStatusSheet({
  space,
  sectorName,
  cleanup,
  assigneeName,
  onClose,
  onReport,
}: RoomStatusSheetProps) {
  const { t } = useTranslation();
  const labels = useLabels();
  const setCleanliness = useSetCleanliness();

  if (!space) return null;

  const attrs = space.attributes;
  const activeAttrs = [
    attrs.vip ? t("field.attr.vip") : null,
    attrs.linenChange ? t("field.attr.linenChange") : null,
    attrs.towelChange ? t("housekeeping.detail.attr.towelChange") : null,
    attrs.eco ? t("field.attr.eco") : null,
    attrs.guestDeclinedCleaning ? t("field.attr.declined") : null,
  ].filter((v): v is string => v !== null);

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end">
      <button
        type="button"
        aria-label={t("common.close")}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative max-h-[85%] overflow-y-auto rounded-t-2xl bg-surface px-4 pb-6 pt-3 shadow-panel">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />

        <div className="mb-3 flex items-start justify-between">
          <div>
            <div className="text-3xl font-semibold leading-none text-ink">
              {space.number}
            </div>
            <div className="mt-1 text-xs text-ink-faint">{sectorName}</div>
          </div>
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

        <div className="divide-y divide-line border-y border-line">
          <Row label={t("field.sheet.cleanliness")} value={labels.roomCleanliness[space.cleanliness]} />
          <Row label={t("field.sheet.occupancy")} value={labels.occupancy[space.occupancy]} />
          <Row
            label={t("field.sheet.cleanupType")}
            value={cleanup ? labels.cleanupType[cleanup.type] : t("field.sheet.noCleanup")}
          />
          {cleanup ? (
            <Row label={t("field.sheet.cleanupState")} value={labels.cleanupState[cleanup.state]} />
          ) : null}
          <Row
            label={t("field.sheet.assignee")}
            value={assigneeName ?? t("field.sheet.unassigned")}
          />
          <Row
            label={t("field.sheet.attributes")}
            value={activeAttrs.length > 0 ? activeAttrs.join(" · ") : t("field.sheet.none")}
          />
        </div>

        <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-ink-faint">
          {t("field.sheet.changeStatus")}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {CLEANLINESS_OPTIONS.map((option) => {
            const style = fieldTileStyle[option];
            const active = option === space.cleanliness;
            return (
              <button
                key={option}
                type="button"
                disabled={active || setCleanliness.isPending}
                onClick={() => setCleanliness.mutate({ id: space.id, cleanliness: option })}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-100 enabled:hover:opacity-90"
                style={{
                  background: tileBackground(style),
                  color: style.foreground,
                  outline: active ? `2px solid ${style.foreground}` : undefined,
                  outlineOffset: active ? "-4px" : undefined,
                }}
              >
                {labels.roomCleanliness[option]}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onReport(space.id)}
          className="mt-4 w-full rounded-lg border border-line py-2.5 text-sm font-semibold text-ink-soft hover:bg-canvas"
        >
          {t("field.sheet.report")}
        </button>
      </div>
    </div>
  );
}
