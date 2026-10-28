import { useTranslation } from "react-i18next";
import type { Space } from "@/domain/types";
import { useLabels } from "@/domain/labels";
import { occupancyTone, roomCleanlinessTone } from "@/domain/colors";
import { Badge, Chip } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

interface RoomCardProps {
  space: Space;
  onClick: (space: Space) => void;
}

type TFunc = ReturnType<typeof useTranslation>["t"];

/** Attribute chips rendered in a stable order. */
function attributeChips(space: Space, t: TFunc) {
  const chips: Array<{ key: string; label: string; className: string }> = [];
  if (space.cleanliness === "do_not_disturb") {
    chips.push({ key: "dnd", label: t("housekeeping.chip.dnd"), className: "bg-violet-100 text-violet-700" });
  }
  if (space.attributes.vip) chips.push({ key: "vip", label: t("housekeeping.chip.vip"), className: "bg-amber-100 text-amber-700" });
  if (space.attributes.linenChange) chips.push({ key: "linen", label: t("housekeeping.chip.linen"), className: "bg-sky-100 text-sky-700" });
  if (space.attributes.towelChange) chips.push({ key: "towel", label: t("housekeeping.chip.towel"), className: "bg-sky-100 text-sky-700" });
  if (space.attributes.eco) chips.push({ key: "eco", label: t("housekeeping.chip.eco"), className: "bg-emerald-100 text-emerald-700" });
  if (space.attributes.guestDeclinedCleaning) {
    chips.push({ key: "declined", label: t("housekeeping.chip.declined"), className: "bg-rose-100 text-rose-700" });
  }
  return chips;
}

export function RoomCard({ space, onClick }: RoomCardProps) {
  const { t } = useTranslation();
  const labels = useLabels();
  const clean = roomCleanlinessTone[space.cleanliness];
  const chips = attributeChips(space, t);

  return (
    <button
      onClick={() => onClick(space)}
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-line bg-surface p-3 text-left shadow-card transition-shadow hover:shadow-md",
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-lg font-semibold text-ink">{space.number}</span>
        <span className={cn("h-3 w-3 rounded-full", clean.dot)} title={labels.roomCleanliness[space.cleanliness]} />
      </div>
      <Badge
        label={labels.roomCleanliness[space.cleanliness]}
        className={clean.badge}
      />
      <div className="flex items-center gap-1.5 text-xs text-ink-soft">
        <span className={cn("h-1.5 w-1.5 rounded-full", occupancyTone[space.occupancy].dot)} />
        {labels.occupancy[space.occupancy]}
        {space.isStayover && space.occupancy !== "stayover"
          ? t("housekeeping.stayoverSuffix")
          : ""}
      </div>
      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {chips.map((c) => (
            <Chip key={c.key} label={c.label} className={c.className} />
          ))}
        </div>
      ) : null}
    </button>
  );
}
