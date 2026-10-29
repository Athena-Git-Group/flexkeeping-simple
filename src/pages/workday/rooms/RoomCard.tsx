import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { housekeepers, type WorkdayRoom } from "@/pages/workday/data";
import { TEAL, RED } from "@/pages/workday/WorkdayShell";
import {
  ROOM_MODULE_IDS,
  type RoomModuleId,
} from "@/pages/workday/rooms/RoomModuleModal";
import { useRoomsStore } from "@/pages/workday/rooms/store";
import {
  IconCheck,
  IconCross,
  IconDoc,
  IconGlass,
  IconPerson,
  IconServiceBell,
  IconSpray,
  IconTray,
  IconWrench,
} from "@/pages/workday/icons";

/** Icons for the six module cells, index-aligned with ROOM_MODULE_IDS. */
const cellIcons: Record<RoomModuleId, ReactNode> = {
  minibar: <IconGlass size={16} />,
  service: <IconServiceBell size={16} />,
  roomService: <IconTray size={16} />,
  cleaning: <IconSpray size={16} />,
  maintenance: <IconWrench size={16} />,
  notes: <IconDoc size={16} />,
};

function RoomBar({
  room,
  notify,
}: {
  room: WorkdayRoom;
  notify: (message: string) => void;
}) {
  const { t } = useTranslation();
  const cycleStatus = useRoomsStore((s) => s.cycleStatus);
  // "cleaned" keeps a white bar, so it needs its own border + dark text to stay
  // visible against the white card body; colored bars rely on white strokes.
  const bg =
    room.status === "dirty" ? RED : room.status === "inspected" ? TEAL : "#FFFFFF";
  return (
    <div
      className={cn(
        "flex h-10 items-center px-2",
        room.status === "cleaned"
          ? "border-b border-gray-200 text-gray-600"
          : "text-white",
      )}
      style={{ backgroundColor: bg }}
    >
      <span className="w-5">
        {room.occupancy === "stayover" && <IconPerson size={14} />}
      </span>
      <span className="flex-1 text-center text-lg font-semibold">{room.number}</span>
      <button
        type="button"
        onClick={() => {
          const next = cycleStatus(room.number);
          notify(
            t("workday.rooms.toastStatus", {
              room: room.number,
              status: t(`workday.rooms.statuses.${next}`),
            }),
          );
        }}
        aria-label={t("workday.rooms.cycleStatusAria", { room: room.number })}
        className={cn(
          "flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm border",
          room.status === "cleaned"
            ? "border-gray-400 hover:bg-gray-100"
            : "border-white/80 hover:bg-white/20",
        )}
      >
        {room.status === "dirty" ? <IconCross size={12} /> : <IconCheck size={12} />}
      </button>
    </div>
  );
}

export function RoomCard({
  room,
  onOpenModule,
  notify,
}: {
  room: WorkdayRoom;
  onOpenModule: (module: RoomModuleId, room: number) => void;
  notify: (message: string) => void;
}) {
  const { t } = useTranslation();
  const assignHousekeeper = useRoomsStore((s) => s.assignHousekeeper);
  const removeUrgentTask = useRoomsStore((s) => s.removeUrgentTask);
  const highlighted = useRoomsStore((s) => s.highlightRoom === room.number);
  const [assignOpen, setAssignOpen] = useState(false);

  const cleanLabel = `${t(
    room.cleanType === "light" ? "workday.rooms.lightClean" : "workday.rooms.noClean",
  )}: ${t("workday.rooms.credits", { count: room.credits })}`;

  return (
    <div
      id={`room-card-${room.number}`}
      className={cn(
        "flex flex-col rounded-sm border border-gray-200 bg-white transition-shadow",
        highlighted && "animate-pulse ring-2 ring-teal-400 ring-offset-1",
      )}
    >
      <RoomBar room={room} notify={notify} />
      <div className="py-1.5 text-center text-xs text-gray-400">{cleanLabel}</div>
      <div className="pb-1 text-center text-[13px] font-bold uppercase text-gray-600">
        {t(`workday.rooms.occupancies.${room.occupancy}`)}
        {room.occupancy === "empty" && (
          <div className="font-normal normal-case text-gray-400">/</div>
        )}
      </div>
      {room.guests && (
        <div className="border-t border-gray-100">
          <div className="bg-gray-50 px-2 py-1 text-[10px] uppercase tracking-wide text-gray-400">
            {t("workday.rooms.guests")}
          </div>
          <div className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-600">
            <IconPerson size={13} className="text-gray-500" />
            <span>{room.guests}</span>
          </div>
        </div>
      )}
      {room.urgentTasks.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 border-t border-gray-100 px-2 py-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
          {room.urgentTasks.map((task) => {
            const taskLabel = t(`workday.rooms.${task}`);
            return (
              <span
                key={task}
                className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600"
              >
                {taskLabel}
                <button
                  type="button"
                  onClick={() => {
                    removeUrgentTask(room.number, task);
                    notify(
                      t("workday.rooms.toastTaskDone", {
                        task: taskLabel,
                        room: room.number,
                      }),
                    );
                  }}
                  aria-label={t("workday.rooms.completeTaskAria", {
                    task: taskLabel,
                    room: room.number,
                  })}
                  className="text-red-400 hover:text-red-600"
                >
                  <IconCross size={9} />
                </button>
              </span>
            );
          })}
        </div>
      )}
      <div className="grid grid-cols-3 border-t border-gray-200">
        {ROOM_MODULE_IDS.map((moduleId, i) => {
          const moduleName = t(`workday.rooms.modules.${moduleId}`);
          return (
            <button
              key={moduleId}
              type="button"
              onClick={() => onOpenModule(moduleId, room.number)}
              title={moduleName}
              aria-label={moduleName}
              className={cn(
                "flex h-9 cursor-pointer items-center justify-center text-gray-400 hover:bg-teal-50 hover:text-teal-600",
                i % 3 !== 2 && "border-r border-gray-200",
                i < 3 && "border-b border-gray-200",
              )}
            >
              {cellIcons[moduleId]}
            </button>
          );
        })}
      </div>
      <div className="relative mt-auto border-t border-gray-200">
        <button
          type="button"
          onClick={() => setAssignOpen((open) => !open)}
          title={t("workday.rooms.assignHousekeeper")}
          className="flex h-8 w-full cursor-pointer items-center gap-1.5 px-2 hover:bg-gray-50"
        >
          <IconPerson size={13} className="text-gray-400" />
          <span className="truncate text-xs text-gray-500">{room.housekeeper}</span>
        </button>
        {assignOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setAssignOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute bottom-full left-0 z-20 mb-1 w-44 overflow-hidden rounded border border-gray-200 bg-white shadow-lg">
              <div className="border-b border-gray-100 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {t("workday.rooms.assignHousekeeper")}
              </div>
              {housekeepers.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setAssignOpen(false);
                    if (name === room.housekeeper) return;
                    assignHousekeeper(room.number, name);
                    notify(
                      t("workday.rooms.toastReassigned", {
                        room: room.number,
                        name,
                      }),
                    );
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-teal-50",
                    name === room.housekeeper && "font-semibold text-teal-600",
                  )}
                >
                  {name}
                  {name === room.housekeeper && <IconCheck size={11} />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
