import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { FLOORS, housekeepers } from "@/pages/workday/data";
import { SectionTitle } from "@/pages/workday/rooms/SectionTitle";
import { roomMatchesFilters, useRoomsStore } from "@/pages/workday/rooms/store";
import { IconChevron } from "@/pages/workday/icons";

/**
 * Renders a sector summary like "S = 13 D = 4 E = 6 OO = 0", wrapping each
 * code segment in a hover tooltip that shows the status full name.
 */
function SectorSummary({
  counts,
}: {
  counts: { s: number; d: number; e: number; oo: number };
}) {
  const { t } = useTranslation();
  const codes = [
    ["s", "S", counts.s],
    ["d", "D", counts.d],
    ["e", "E", counts.e],
    ["oo", "OO", counts.oo],
  ] as const;
  return (
    <div className="mt-0.5 text-xs text-gray-400">
      {codes.map(([key, label, value], i) => (
        <span key={key}>
          {i > 0 && " "}
          <span className="group relative cursor-default">
            {label} = {value}
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-[11px] text-white shadow group-hover:block"
            >
              {t(`workday.rooms.tooltips.${key}`)}
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}

export function SectorsColumn() {
  const { t } = useTranslation();
  const rooms = useRoomsStore((s) => s.rooms);
  const floorFilter = useRoomsStore((s) => s.floorFilter);
  const toggleFloorFilter = useRoomsStore((s) => s.toggleFloorFilter);
  const housekeeperFilter = useRoomsStore((s) => s.housekeeperFilter);
  const toggleHousekeeperFilter = useRoomsStore((s) => s.toggleHousekeeperFilter);
  const clearFilters = useRoomsStore((s) => s.clearFilters);
  const setHighlightRoom = useRoomsStore((s) => s.setHighlightRoom);
  const [expanded, setExpanded] = useState<number | null>(null);

  const jumpToRoom = (roomNumber: number) => {
    // If current filters hide the room, clear them so the card exists to scroll to.
    const state = useRoomsStore.getState();
    const target = state.rooms.find((r) => r.number === roomNumber);
    if (target && !roomMatchesFilters(target, state)) clearFilters();
    setHighlightRoom(roomNumber);
    window.setTimeout(() => {
      document
        .getElementById(`room-card-${roomNumber}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    window.setTimeout(() => {
      const { highlightRoom } = useRoomsStore.getState();
      if (highlightRoom === roomNumber) setHighlightRoom(null);
    }, 2000);
  };

  return (
    <div className="w-[210px] shrink-0">
      <SectionTitle>{t("workday.rooms.sectors")}</SectionTitle>
      <div className="space-y-2">
        {FLOORS.map((floor) => {
          const floorRooms = rooms.filter((r) => r.floor === floor);
          const counts = {
            s: floorRooms.filter((r) => r.occupancy === "stayover").length,
            d: floorRooms.filter((r) => r.occupancy === "departure").length,
            e: floorRooms.filter((r) => r.occupancy === "empty").length,
            oo: floorRooms.filter((r) => r.occupancy === "outOfOrder").length,
          };
          const floorLabel = t("workday.rooms.floor", { num: floor });
          const selected = floorFilter === floor;
          const isExpanded = expanded === floor;
          return (
            <div
              key={floor}
              className={cn(
                "rounded border bg-white",
                selected ? "border-teal-500 ring-1 ring-teal-500" : "border-gray-200",
              )}
            >
              <div className="flex items-center justify-between px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => toggleFloorFilter(floor)}
                  aria-pressed={selected}
                  aria-label={t("workday.rooms.filterSector", { name: floorLabel })}
                  className="cursor-pointer text-left"
                >
                  <div
                    className={cn(
                      "text-sm font-semibold",
                      selected ? "text-teal-600" : "text-gray-700",
                    )}
                  >
                    {floorLabel}
                  </div>
                  <SectorSummary counts={counts} />
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : floor)}
                  aria-expanded={isExpanded}
                  aria-label={t("workday.rooms.expandSector", { name: floorLabel })}
                  className="cursor-pointer p-1 text-gray-400 hover:text-gray-600"
                >
                  <IconChevron direction={isExpanded ? "up" : "down"} size={14} />
                </button>
              </div>
              {isExpanded && (
                <div className="flex flex-wrap gap-1 border-t border-gray-100 px-3 py-2">
                  {floorRooms.map((r) => (
                    <button
                      key={r.number}
                      type="button"
                      onClick={() => jumpToRoom(r.number)}
                      className="cursor-pointer rounded-full border border-gray-200 px-2 py-0.5 text-[11px] text-gray-600 hover:border-teal-400 hover:text-teal-600"
                    >
                      {r.number}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <SectionTitle>{t("workday.rooms.housekeepers")}</SectionTitle>
        <div className="overflow-hidden rounded border border-gray-200 bg-white">
          {housekeepers.map((name, i) => {
            const count = rooms.filter((r) => r.housekeeper === name).length;
            const selected = housekeeperFilter === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleHousekeeperFilter(name)}
                aria-pressed={selected}
                aria-label={t("workday.rooms.housekeeperRoomsAria", { name, count })}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left text-sm",
                  i > 0 && "border-t border-gray-100",
                  selected
                    ? "bg-teal-50 font-semibold text-teal-700"
                    : "text-gray-700 hover:bg-gray-50",
                )}
              >
                <span className="truncate">{name}</span>
                <span
                  className={cn(
                    "ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
                    selected ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-500",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
