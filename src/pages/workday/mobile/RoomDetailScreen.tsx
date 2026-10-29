import { ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRoomsStore } from "@/pages/workday/rooms/store";
import type { Occupancy, RoomStatus } from "@/pages/workday/data";
import { useMobileStore } from "./mobileStore";
import {
  IconArrowRight,
  IconBack,
  IconBottle,
  IconCheck,
  IconClipboard,
  IconDocAlert,
  IconDocSearch,
  IconPersonArrow,
  IconPlus,
  IconSparkle,
  IconWasher,
  IconWrench,
  NAVY,
  MobileScreen,
  ScreenProps,
  StatusBar,
  TabBar,
} from "./shared";

const TILES: { key: string; icon: ReactNode; target?: MobileScreen }[] = [
  { key: "amenities", icon: <IconSparkle /> },
  { key: "minibar", icon: <IconBottle /> },
  { key: "linen", icon: <IconWasher /> },
  { key: "tasks", icon: <IconClipboard /> },
  { key: "maintenance", icon: <IconWrench />, target: "addRepair" },
  { key: "cleaningFlaws", icon: <IconDocAlert /> },
  { key: "audits", icon: <IconDocSearch />, target: "inspection" },
];

const STATUS_KEY: Record<RoomStatus, string> = {
  dirty: "mobile.roomDetail.statusDirty",
  cleaned: "mobile.roomDetail.statusCleaned",
  inspected: "mobile.roomDetail.statusInspected",
};

const OCC_KEY: Record<Occupancy, string> = {
  stayover: "mobile.roomDetail.occStayover",
  empty: "mobile.roomDetail.occEmpty",
  departure: "mobile.roomDetail.occDeparture",
  outOfOrder: "mobile.roomDetail.occOutOfOrder",
};

const BANNER_BG: Record<RoomStatus, string> = {
  dirty: "bg-red-500",
  cleaned: "bg-gray-500",
  inspected: "bg-teal-600",
};

export function RoomDetailScreen({ go }: ScreenProps) {
  const { t } = useTranslation();
  const rooms = useRoomsStore((s) => s.rooms);
  const cycleStatus = useRoomsStore((s) => s.cycleStatus);
  const currentRoom = useMobileStore((s) => s.currentRoom);
  const toast = useMobileStore((s) => s.toast);
  const clearToast = useMobileStore((s) => s.clearToast);

  const room = rooms.find((r) => r.number === currentRoom) ?? rooms[0];

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(clearToast, 2500);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  if (!room) return null;

  return (
    <div className="relative flex h-full flex-col bg-gray-50">
      <div className="bg-white">
        <StatusBar />
        <div className="flex items-center px-3 pb-2 pt-1">
          <button
            className="flex items-center gap-0.5 text-[15px] font-medium text-teal-600"
            onClick={() => go("rooms")}
          >
            <IconBack className="h-5 w-5" />
            {t("mobile.rooms.title")}
          </button>
          <div className="flex-1 text-center text-[16px] font-bold text-gray-900">
            {room.housekeeper}
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center text-gray-600"
            aria-label={t("mobile.a11y.assign")}
          >
            <IconPersonArrow />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        <div className={`${BANNER_BG[room.status]} px-5 py-4 text-white transition-colors`}>
          <div className="flex items-start">
            <span className="mt-1 h-5 w-5 rounded bg-white/90" />
            <span className="flex-1 text-right text-[13px] italic text-white/80">
              {t("mobile.roomDetail.roomType")}
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-8" />
            <span className="flex-1 text-center text-[52px] font-extrabold leading-tight">
              {room.number}
            </span>
            <button
              className="w-10 rounded-lg p-0.5 active:bg-white/20"
              onClick={() => cycleStatus(room.number)}
              aria-label={t(STATUS_KEY[room.status])}
            >
              <IconCheck />
            </button>
          </div>
        </div>
        <div className="bg-teal-50 py-2 text-center text-[13px] text-teal-900">
          <span className="font-bold">
            {t(
              room.cleanType === "light"
                ? "mobile.roomDetail.cleanLight"
                : "mobile.roomDetail.cleanNone",
            )}
          </span>{" "}
          {room.credits > 0 && t("mobile.roomDetail.credits", { count: room.credits })}
        </div>
        <div className="flex items-center justify-between bg-white px-5 py-2.5 text-[12px] text-gray-600">
          <div className="flex items-center gap-3">
            <span>
              {t("mobile.roomDetail.statusLabel")}{" "}
              <span className="font-medium text-gray-800">{t(STATUS_KEY[room.status])}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: NAVY }} />
              {t(OCC_KEY[room.occupancy])}
            </span>
          </div>
          <span className="font-medium text-gray-800">{room.guests ?? "—"}</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 px-4">
          {TILES.map((tile) => (
            <button
              key={tile.key}
              className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-4 text-left shadow-sm active:bg-gray-50"
              onClick={tile.target ? () => go(tile.target as MobileScreen) : undefined}
            >
              <span style={{ color: NAVY }}>{tile.icon}</span>
              <span className="flex-1 text-[12px] font-semibold leading-tight text-gray-800">
                {t(`mobile.roomDetail.${tile.key}`)}
              </span>
              <span className="text-teal-600">
                <IconPlus size={16} />
              </span>
            </button>
          ))}
        </div>

        <div className="mt-3 px-4">
          <button className="flex w-full items-center rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm active:bg-gray-50">
            <span className="flex-1 text-left text-[13px] font-semibold text-gray-800">
              {t("mobile.roomDetail.roomSops")}
            </span>
            <span className="text-teal-600">
              <IconArrowRight />
            </span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="pointer-events-none absolute inset-x-0 bottom-20 flex justify-center">
          <div className="rounded-full bg-gray-900/90 px-4 py-2 text-[13px] font-medium text-white shadow-lg">
            {t(toast.key, toast.params)}
          </div>
        </div>
      )}

      <TabBar go={go} active="roomDetail" />
    </div>
  );
}
