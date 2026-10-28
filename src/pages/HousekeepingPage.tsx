import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { RoomCleanliness, Space } from "@/domain/types";
import { useLabels } from "@/domain/labels";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { RoomCard } from "@/components/RoomCard";
import { SpaceDetailPanel } from "@/components/SpaceDetailPanel";
import { useSectors, useSpaces } from "@/hooks/queries";

const CLEANLINESS_VALUES: RoomCleanliness[] = [
  "dirty",
  "stripped",
  "awaiting_inspection",
  "inspected",
  "do_not_disturb",
  "out_of_order",
];

export function HousekeepingPage() {
  const { t } = useTranslation();
  const labels = useLabels();
  const [cleanliness, setCleanliness] = useState<string>("");
  const [sectorId, setSectorId] = useState<string>("");
  const [selected, setSelected] = useState<Space | null>(null);

  const { data: sectors } = useSectors();
  const { data: spaces, isLoading } = useSpaces({
    cleanliness: (cleanliness || undefined) as RoomCleanliness | undefined,
    sectorId: sectorId || undefined,
  });

  const cleanlinessOptions = useMemo(
    () => CLEANLINESS_VALUES.map((v) => ({ value: v, label: labels.roomCleanliness[v] })),
    [labels],
  );

  return (
    <div>
      <PageHeader
        title={t("housekeeping.title")}
        description={t("housekeeping.description")}
        actions={
          <div className="flex items-end gap-2">
            <Select
              label={t("housekeeping.floorSector")}
              value={sectorId}
              onChange={setSectorId}
              placeholder={t("housekeeping.allSectors")}
              options={(sectors ?? []).map((s) => ({ value: s.id, label: s.name }))}
            />
            <Select
              label={t("housekeeping.cleanliness")}
              value={cleanliness}
              onChange={setCleanliness}
              placeholder={t("housekeeping.allStatuses")}
              options={cleanlinessOptions}
            />
          </div>
        }
      />

      {isLoading ? (
        <EmptyState message={t("housekeeping.loading")} />
      ) : spaces && spaces.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {spaces.map((space) => (
            <RoomCard key={space.id} space={space} onClick={setSelected} />
          ))}
        </div>
      ) : (
        <EmptyState message={t("housekeeping.noMatch")} />
      )}

      <SpaceDetailPanel space={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
