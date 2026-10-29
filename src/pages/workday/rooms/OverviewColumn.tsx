import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { type Occupancy, type RoomStatus } from "@/pages/workday/data";
import { RoomCard } from "@/pages/workday/rooms/RoomCard";
import { type RoomModuleId } from "@/pages/workday/rooms/RoomModuleModal";
import { SectionTitle } from "@/pages/workday/rooms/SectionTitle";
import {
  filterRooms,
  useRoomsStore,
  type OccupancyFilter,
  type StatusFilter,
} from "@/pages/workday/rooms/store";
import { IconChevron, IconCross, IconSearch } from "@/pages/workday/icons";

const STATUS_OPTIONS: StatusFilter[] = ["all", "dirty", "cleaned", "inspected"];
const OCCUPANCY_OPTIONS: OccupancyFilter[] = [
  "all",
  "stayover",
  "empty",
  "departure",
  "outOfOrder",
];

function FilterSelect<T extends string>({
  label,
  value,
  options,
  optionLabel,
  onChange,
  buttonClassName,
}: {
  label: string;
  value: T;
  options: T[];
  optionLabel: (value: T) => string;
  onChange: (value: T) => void;
  buttonClassName?: string;
}) {
  return (
    <div className={cn("relative", buttonClassName)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={label}
        className={cn(
          "w-full cursor-pointer appearance-none rounded border px-3 py-2 pr-8 text-sm outline-none",
          value === "all"
            ? "border-gray-200 bg-white text-gray-600"
            : "border-teal-500 bg-teal-50 text-teal-700",
        )}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? `${label}: ${optionLabel(option)}` : optionLabel(option)}
          </option>
        ))}
      </select>
      <IconChevron
        direction="down"
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}

function FilterChip({
  label,
  ariaLabel,
  onRemove,
}: {
  label: string;
  ariaLabel: string;
  onRemove: () => void;
}) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-medium text-teal-700">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={ariaLabel}
        className="cursor-pointer text-teal-400 hover:text-teal-700"
      >
        <IconCross size={9} />
      </button>
    </span>
  );
}

export function OverviewColumn({
  onOpenModule,
  notify,
}: {
  onOpenModule: (module: RoomModuleId, room: number) => void;
  notify: (message: string) => void;
}) {
  const { t } = useTranslation();
  const rooms = useRoomsStore((s) => s.rooms);
  const search = useRoomsStore((s) => s.search);
  const setSearch = useRoomsStore((s) => s.setSearch);
  const statusFilter = useRoomsStore((s) => s.statusFilter);
  const setStatusFilter = useRoomsStore((s) => s.setStatusFilter);
  const occupancyFilter = useRoomsStore((s) => s.occupancyFilter);
  const setOccupancyFilter = useRoomsStore((s) => s.setOccupancyFilter);
  const floorFilter = useRoomsStore((s) => s.floorFilter);
  const toggleFloorFilter = useRoomsStore((s) => s.toggleFloorFilter);
  const housekeeperFilter = useRoomsStore((s) => s.housekeeperFilter);
  const toggleHousekeeperFilter = useRoomsStore((s) => s.toggleHousekeeperFilter);
  const clearFilters = useRoomsStore((s) => s.clearFilters);
  const resetDemo = useRoomsStore((s) => s.resetDemo);

  const filters = { search, statusFilter, occupancyFilter, floorFilter, housekeeperFilter };
  const visibleRooms = useMemo(
    () => filterRooms(rooms, filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rooms, search, statusFilter, occupancyFilter, floorFilter, housekeeperFilter],
  );

  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (search.trim()) {
    chips.push({
      key: "search",
      label: t("workday.rooms.searchChip", { q: search.trim() }),
      onRemove: () => setSearch(""),
    });
  }
  if (statusFilter !== "all") {
    chips.push({
      key: "status",
      label: t(`workday.rooms.statuses.${statusFilter as RoomStatus}`),
      onRemove: () => setStatusFilter("all"),
    });
  }
  if (occupancyFilter !== "all") {
    chips.push({
      key: "occupancy",
      label: t(`workday.rooms.occupancies.${occupancyFilter as Occupancy}`),
      onRemove: () => setOccupancyFilter("all"),
    });
  }
  if (floorFilter !== null) {
    chips.push({
      key: "floor",
      label: t("workday.rooms.floor", { num: floorFilter }),
      onRemove: () => toggleFloorFilter(floorFilter),
    });
  }
  if (housekeeperFilter !== null) {
    chips.push({
      key: "housekeeper",
      label: housekeeperFilter,
      onRemove: () => toggleHousekeeperFilter(housekeeperFilter),
    });
  }

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex w-[340px] items-center gap-2 rounded border border-gray-200 bg-white px-3 py-2">
          <IconSearch size={15} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("workday.rooms.searchPlaceholder")}
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterSelect
            label={t("workday.rooms.cleanliness")}
            value={statusFilter}
            options={STATUS_OPTIONS}
            optionLabel={(v) =>
              v === "all"
                ? t("workday.rooms.all")
                : t(`workday.rooms.statuses.${v as RoomStatus}`)
            }
            onChange={setStatusFilter}
            buttonClassName="w-40"
          />
          <FilterSelect
            label={t("workday.rooms.occupancyFilter")}
            value={occupancyFilter}
            options={OCCUPANCY_OPTIONS}
            optionLabel={(v) =>
              v === "all"
                ? t("workday.rooms.all")
                : t(`workday.rooms.occupancies.${v as Occupancy}`)
            }
            onChange={setOccupancyFilter}
            buttonClassName="w-44"
          />
        </div>
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <SectionTitle>{t("workday.rooms.overview")}</SectionTitle>
        <div className="-mt-2 flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <FilterChip
              key={chip.key}
              label={chip.label}
              ariaLabel={t("workday.rooms.removeFilterAria", { name: chip.label })}
              onRemove={chip.onRemove}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => resetDemo()}
          className="-mt-2 ml-auto cursor-pointer text-[11px] text-gray-400 underline-offset-2 hover:text-teal-600 hover:underline"
        >
          {t("workday.rooms.resetDemo")}
        </button>
      </div>
      {visibleRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded border border-dashed border-gray-300 bg-white py-16">
          <div className="text-sm text-gray-500">{t("workday.rooms.noResults")}</div>
          <button
            type="button"
            onClick={clearFilters}
            className="cursor-pointer rounded bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600"
          >
            {t("workday.rooms.clearFilters")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {visibleRooms.map((room) => (
            <RoomCard
              key={room.number}
              room={room}
              onOpenModule={onOpenModule}
              notify={notify}
            />
          ))}
        </div>
      )}
    </div>
  );
}
