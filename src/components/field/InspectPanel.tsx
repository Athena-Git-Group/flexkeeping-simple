import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLabels } from "@/domain/labels";
import { fieldTileStyle, tileBackground } from "@/domain/fieldStatus";
import { useSectors, useSetCleanliness, useSpaces } from "@/hooks/queries";

interface InspectPanelProps {
  /** Only rooms in this sector are listed; empty lists the whole facility. */
  sectorId: string;
}

export function InspectPanel({ sectorId }: InspectPanelProps) {
  const { t } = useTranslation();
  const labels = useLabels();
  const { data: spaces } = useSpaces();
  const { data: sectors } = useSectors();
  const setCleanliness = useSetCleanliness();

  const sectorName = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of sectors ?? []) map.set(s.id, s.name);
    return map;
  }, [sectors]);

  const pending = useMemo(
    () =>
      (spaces ?? []).filter(
        (s) => s.cleanliness === "awaiting_inspection" && (!sectorId || s.sectorId === sectorId),
      ),
    [spaces, sectorId],
  );

  if (pending.length === 0) {
    return <p className="py-10 text-center text-sm text-ink-faint">{t("field.inspect.empty")}</p>;
  }

  const style = fieldTileStyle.awaiting_inspection;

  return (
    <ul className="space-y-2">
      {pending.map((space) => (
        <li
          key={space.id}
          className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 shadow-card"
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-base font-semibold tabular-nums"
            style={{ background: tileBackground(style), color: style.foreground }}
          >
            {space.number}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">
              {sectorName.get(space.sectorId) ?? ""}
            </span>
            <span className="block text-xs text-ink-faint">
              {labels.occupancy[space.occupancy]}
            </span>
          </span>
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              disabled={setCleanliness.isPending}
              onClick={() => setCleanliness.mutate({ id: space.id, cleanliness: "inspected" })}
              className="rounded-lg bg-[#52c2b6] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {t("field.inspect.approve")}
            </button>
            <button
              type="button"
              disabled={setCleanliness.isPending}
              onClick={() => setCleanliness.mutate({ id: space.id, cleanliness: "dirty" })}
              className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink-soft disabled:opacity-50"
            >
              {t("field.inspect.reject")}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
