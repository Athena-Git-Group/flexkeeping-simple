import { useTranslation } from "react-i18next";
import type { RoomCleanliness, Space } from "@/domain/types";
import { useLabels } from "@/domain/labels";
import { occupancyTone, roomCleanlinessTone } from "@/domain/colors";
import { Badge } from "@/components/ui/Badge";
import { SidePanel } from "@/components/ui/SidePanel";
import { useConsumption, useSetCleanliness } from "@/hooks/queries";
import { cn } from "@/lib/cn";

const CLEANLINESS_OPTIONS: RoomCleanliness[] = [
  "dirty",
  "stripped",
  "awaiting_inspection",
  "inspected",
  "do_not_disturb",
  "out_of_order",
];

export function SpaceDetailPanel({
  space,
  onClose,
}: {
  space: Space | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const labels = useLabels();
  const setCleanliness = useSetCleanliness();
  const { data: consumption } = useConsumption(space?.id);

  if (!space) return null;

  const attrs = space.attributes;
  const attributeList: Array<[string, boolean]> = [
    [t("housekeeping.detail.attr.vip"), attrs.vip],
    [t("housekeeping.detail.attr.linenChange"), attrs.linenChange],
    [t("housekeeping.detail.attr.towelChange"), attrs.towelChange],
    [t("housekeeping.detail.attr.eco"), attrs.eco],
    [t("housekeeping.detail.attr.guestDeclined"), attrs.guestDeclinedCleaning],
    [t("housekeeping.detail.attr.minibarChecked"), attrs.minibarChecked],
  ];

  return (
    <SidePanel
      open
      title={t("housekeeping.detail.roomTitle", { number: space.number })}
      subtitle={t("housekeeping.detail.subtitle")}
      onClose={onClose}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Badge
            label={labels.roomCleanliness[space.cleanliness]}
            className={roomCleanlinessTone[space.cleanliness].badge}
          />
          <Badge
            label={labels.occupancy[space.occupancy]}
            className={occupancyTone[space.occupancy].badge}
          />
        </div>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("housekeeping.detail.changeCleanliness")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {CLEANLINESS_OPTIONS.map((option) => {
              const active = option === space.cleanliness;
              return (
                <button
                  key={option}
                  disabled={active || setCleanliness.isPending}
                  onClick={() => setCleanliness.mutate({ id: space.id, cleanliness: option })}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-line bg-surface text-ink-soft hover:border-brand hover:text-brand",
                  )}
                >
                  {labels.roomCleanliness[option]}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("housekeeping.detail.attributes")}
          </h3>
          <ul className="grid grid-cols-2 gap-1.5 text-sm">
            {attributeList.map(([label, on]) => (
              <li key={label} className="flex items-center gap-2 text-ink-soft">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    on ? "bg-emerald-500" : "bg-slate-300",
                  )}
                />
                <span className={on ? "text-ink" : "text-ink-faint"}>{label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("housekeeping.detail.consumption")}
          </h3>
          {consumption && consumption.length > 0 ? (
            <ul className="divide-y divide-line rounded-lg border border-line">
              {consumption.map((item) => (
                <li key={item.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-ink">
                    {item.name}
                    <span className="ml-1 text-xs text-ink-faint">
                      ({labels.consumptionCategory[item.category]})
                    </span>
                  </span>
                  <span className="text-ink-soft">
                    {item.quantity} × {item.unitPrice.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-faint">{t("housekeeping.detail.noConsumption")}</p>
          )}
        </section>
      </div>
    </SidePanel>
  );
}
