import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRoomsStore } from "@/pages/workday/rooms/store";
import type { RoomStatus, WorkdayRoom } from "@/pages/workday/data";
import { useMobileStore } from "./mobileStore";
import {
  IconChevronRight,
  IconChevronUp,
  IconFunnel,
  IconMenu,
  IconPlus,
  IconSearch,
  IconSortAZ,
  ScreenProps,
  StatusBar,
  TabBar,
} from "./shared";

const STATUS_DOT: Record<RoomStatus, string> = {
  dirty: "bg-red-500",
  cleaned: "border border-gray-300 bg-white",
  inspected: "bg-teal-500",
};

export function RoomsScreen({ go }: ScreenProps) {
  const { t } = useTranslation();
  const rooms = useRoomsStore((s) => s.rooms);
  const setCurrentRoom = useMobileStore((s) => s.setCurrentRoom);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const query = search.trim();

  const floors = useMemo(() => {
    const byFloor = new Map<number, WorkdayRoom[]>();
    for (const room of rooms) {
      const list = byFloor.get(room.floor) ?? [];
      list.push(room);
      byFloor.set(room.floor, list);
    }
    return [...byFloor.entries()]
      .sort(([a], [b]) => a - b)
      .map(([num, floorRooms]) => ({
        num,
        rooms: floorRooms,
        matches: query
          ? floorRooms.filter((r) => String(r.number).includes(query))
          : floorRooms,
        e: floorRooms.filter((r) => r.occupancy === "empty").length,
        d: floorRooms.filter((r) => r.occupancy === "departure").length,
        oo: floorRooms.filter((r) => r.occupancy === "outOfOrder").length,
        s: floorRooms.filter((r) => r.occupancy === "stayover").length,
      }));
  }, [rooms, query]);

  const visibleFloors = query ? floors.filter((f) => f.matches.length > 0) : floors;

  const toggleFloor = (num: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const openRoom = (room: number) => {
    setCurrentRoom(room);
    go("roomDetail");
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <StatusBar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-4 pt-2">
          <button
            className="flex h-9 w-9 items-center justify-center text-gray-700"
            aria-label={t("mobile.a11y.menu")}
          >
            <IconMenu />
          </button>
          <div className="flex flex-1 justify-center">
            <div className="flex rounded-lg bg-gray-100 p-0.5 text-[13px] font-medium">
              <button className="rounded-md bg-white px-4 py-1.5 text-gray-900 shadow-sm">
                {t("mobile.rooms.roomList")}
              </button>
              <button className="px-4 py-1.5 text-gray-400">{t("mobile.rooms.turndown")}</button>
            </div>
          </div>
          <button
            className="flex h-9 w-8 items-center justify-center text-gray-600"
            aria-label={t("mobile.a11y.sort")}
          >
            <IconSortAZ />
          </button>
          <button
            className="flex h-9 w-8 items-center justify-center text-gray-600"
            aria-label={t("mobile.a11y.filter")}
          >
            <IconFunnel />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-24">
          <h1 className="mt-3 text-[34px] font-extrabold text-gray-900">
            {t("mobile.rooms.title")}
          </h1>

          <div className="mt-3 flex items-center gap-2 rounded-xl bg-gray-100 px-3.5 py-2.5 text-gray-400">
            <IconSearch />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("mobile.rooms.search")}
              className="w-full bg-transparent text-[14px] text-gray-800 outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="mt-4 space-y-3">
            {visibleFloors.length === 0 && (
              <div className="rounded-2xl bg-gray-100 px-4 py-6 text-center text-[13px] text-gray-500">
                {t("mobile.rooms.noResults")}
              </div>
            )}
            {visibleFloors.map((f) => {
              const isOpen = query.length > 0 || expanded.has(f.num);
              return (
                <div key={f.num} className="overflow-hidden rounded-2xl bg-gray-100">
                  <button
                    className="flex w-full items-center px-4 py-4 text-left active:bg-gray-200"
                    onClick={() => toggleFloor(f.num)}
                  >
                    <span className="flex-1 text-[16px] font-semibold text-gray-900">
                      {t("mobile.rooms.floor", { num: f.num })}
                    </span>
                    <span className="mr-3 grid grid-cols-2 gap-x-4 text-[11px] font-medium text-gray-500">
                      <span>E={f.e}</span>
                      <span>D={f.d}</span>
                      <span>OO={f.oo}</span>
                      <span>S={f.s}</span>
                    </span>
                    <span className={`text-gray-400 transition-transform ${isOpen ? "" : "rotate-180"}`}>
                      <IconChevronUp />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="divide-y divide-gray-200 border-t border-gray-200 bg-white">
                      {f.matches.map((room) => (
                        <button
                          key={room.number}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-gray-50"
                          onClick={() => openRoom(room.number)}
                        >
                          <span
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[room.status]}`}
                          />
                          <span className="w-12 text-[15px] font-bold text-gray-900">
                            {room.number}
                          </span>
                          <span className="flex-1 truncate text-[13px] text-gray-500">
                            {room.housekeeper}
                          </span>
                          <span className="text-gray-300">
                            <IconChevronRight />
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          className="absolute bottom-5 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg active:bg-teal-700"
          aria-label={t("mobile.a11y.add")}
        >
          <IconPlus size={24} />
        </button>
      </div>
      <TabBar go={go} active="rooms" />
    </div>
  );
}
