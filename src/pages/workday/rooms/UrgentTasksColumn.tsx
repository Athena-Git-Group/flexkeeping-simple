import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { type UrgentTaskType } from "@/pages/workday/data";
import { useRoomsStore } from "@/pages/workday/rooms/store";
import { TEAL } from "@/pages/workday/WorkdayShell";
import { IconCheck, IconChevron, IconSearch } from "@/pages/workday/icons";

export function UrgentTasksColumn({
  notify,
}: {
  notify: (message: string) => void;
}) {
  const { t } = useTranslation();
  const rooms = useRoomsStore((s) => s.rooms);
  const addUrgentTasks = useRoomsStore((s) => s.addUrgentTasks);

  const [minibar, setMinibar] = useState(false);
  const [roomChecked, setRoomChecked] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [roomSearch, setRoomSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const tasks: UrgentTaskType[] = [
    ...(minibar ? (["minibar"] as const) : []),
    ...(roomChecked ? (["room"] as const) : []),
  ];
  const canSave = tasks.length > 0 && selected.length > 0;

  const pickerRooms = rooms.filter((r) =>
    String(r.number).includes(roomSearch.trim()),
  );

  const toggleRoom = (num: number) =>
    setSelected((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num],
    );

  const handleSave = () => {
    if (!canSave) return;
    addUrgentTasks(selected, tasks);
    notify(t("workday.rooms.toastUrgent", { count: selected.length }));
    setMinibar(false);
    setRoomChecked(false);
    setSelected([]);
    setRoomSearch("");
    setPickerOpen(false);
  };

  return (
    <div className="w-[210px] shrink-0">
      <div className="overflow-hidden rounded border border-gray-200 bg-white">
        <div className="bg-[#37474F] px-3 py-2.5 text-sm font-medium text-white">
          {t("workday.rooms.urgentTasks")}
        </div>
        <div className="space-y-2 p-3">
          <label className="flex cursor-pointer items-center gap-2 rounded border border-gray-200 px-3 py-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={minibar}
              onChange={(e) => setMinibar(e.target.checked)}
              className="h-4 w-4 rounded-sm border-gray-300 accent-teal-500"
            />
            {t("workday.rooms.minibar")}
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded border border-gray-200 px-3 py-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={roomChecked}
              onChange={(e) => setRoomChecked(e.target.checked)}
              className="h-4 w-4 rounded-sm border-gray-300 accent-teal-500"
            />
            {t("workday.rooms.room")}
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setPickerOpen((open) => !open)}
              aria-expanded={pickerOpen}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2 rounded border border-gray-200 px-3 py-2 text-left text-sm",
                selected.length > 0 ? "text-gray-700" : "text-gray-400",
              )}
            >
              <span
                className="h-4 w-4 shrink-0 rounded-sm"
                style={{ backgroundColor: TEAL }}
              />
              <span className="flex-1 truncate">
                {selected.length > 0
                  ? t("workday.rooms.selectedCount", { count: selected.length })
                  : t("workday.rooms.chooseSpace")}
              </span>
              <IconChevron
                direction={pickerOpen ? "up" : "down"}
                size={12}
                className="text-gray-400"
              />
            </button>
            {pickerOpen && (
              <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded border border-gray-200 bg-white shadow-lg">
                <div className="flex items-center gap-1.5 border-b border-gray-100 px-2 py-1.5">
                  <IconSearch size={12} className="shrink-0 text-gray-400" />
                  <input
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    placeholder={t("workday.rooms.searchPlaceholder")}
                    className="w-full bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {pickerRooms.map((r) => {
                    const checked = selected.includes(r.number);
                    return (
                      <label
                        key={r.number}
                        className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-teal-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRoom(r.number)}
                          className="h-3.5 w-3.5 rounded-sm border-gray-300 accent-teal-500"
                        />
                        <span className="flex-1">{r.number}</span>
                        {checked && <IconCheck size={10} className="text-teal-500" />}
                      </label>
                    );
                  })}
                  {pickerRooms.length === 0 && (
                    <div className="px-3 py-2 text-xs text-gray-400">
                      {t("workday.rooms.noResults")}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className={cn(
              "w-full rounded py-2 text-sm font-semibold",
              canSave
                ? "cursor-pointer text-white hover:opacity-90"
                : "cursor-not-allowed bg-gray-200 text-gray-400",
            )}
            style={canSave ? { backgroundColor: TEAL } : undefined}
          >
            {t("workday.rooms.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
