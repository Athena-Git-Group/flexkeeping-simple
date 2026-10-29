import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type SVGProps,
} from "react";
import { useTranslation } from "react-i18next";
import { useAllocationStore } from "@/pages/workday/allocation/store";
import { housekeepers } from "@/pages/workday/data";
import type { WorkdayRoom } from "@/pages/workday/data";
import { IconCheck, IconChevron, IconGlass, IconPerson } from "./icons";
import { useRoomsStore } from "@/pages/workday/rooms/store";

type LocalIconProps = SVGProps<SVGSVGElement> & { size?: number };

// icons.tsx 不可修改，頁面獨有的 icon 只能在本檔自建，沿用相同的 stroke 基底
function svgBase({ size = 16, ...props }: LocalIconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

function IconPrinter(props: LocalIconProps) {
  return (
    <svg {...svgBase(props)}>
      <path d="M7 8V3h10v5" />
      <rect x="4" y="8" width="16" height="8" rx="1" />
      <path d="M7 13h10v8H7z" />
    </svg>
  );
}

function IconAutoAssign(props: LocalIconProps) {
  return (
    <svg {...svgBase(props)}>
      <path d="M4 9a7 7 0 0 1 13-2" />
      <path d="M17 3v4h-4" />
      <path d="M20 15a7 7 0 0 1-13 2" />
      <path d="M7 21v-4h4" />
    </svg>
  );
}

function IconArrowUpRight(props: LocalIconProps) {
  return (
    <svg {...svgBase(props)}>
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

function IconEye(props: LocalIconProps) {
  return (
    <svg {...svgBase(props)}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconDownloadCircle(props: LocalIconProps) {
  return (
    <svg {...svgBase(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v7M9 11.5L12 14.5l3-3" />
    </svg>
  );
}

function IconDoorEmpty(props: LocalIconProps) {
  return (
    <svg {...svgBase(props)}>
      <rect x="6" y="3" width="12" height="18" rx="1" />
      <path d="M14.5 12h.01" />
    </svg>
  );
}

function IconMoon(props: LocalIconProps) {
  return (
    <svg {...svgBase(props)}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />
    </svg>
  );
}

function IconArrowIn(props: LocalIconProps) {
  return (
    <svg {...svgBase(props)}>
      <path d="M3 12h12M11 8l4 4-4 4" />
      <path d="M19 4v16" />
    </svg>
  );
}

function IconArrowOut(props: LocalIconProps) {
  return (
    <svg {...svgBase(props)}>
      <path d="M5 4v16" />
      <path d="M9 12h12M17 8l4 4-4 4" />
    </svg>
  );
}

function IconSuitcase(props: LocalIconProps) {
  return (
    <svg {...svgBase(props)}>
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M9 8V5h6v3" />
    </svg>
  );
}

function IconBroomSmall(props: LocalIconProps) {
  return (
    <svg {...svgBase(props)}>
      <path d="M15 3l-4 8M7 13l8-2 3 7-9 2z" />
    </svg>
  );
}

function IconBan(props: LocalIconProps) {
  return (
    <svg {...svgBase(props)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M6.5 6.5l11 11" />
    </svg>
  );
}

const RED = "#E2574C";
const TEAL = "#4DB6AC";
const TEAL_DARK = "#26897F";
const SLATE = "#37474F";

// 示意用的「今天」固定在 demo 資料的日期，而不是真實系統時間
const DEMO_TODAY = new Date(2026, 0, 30);

function formatDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function addDays(d: Date, delta: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + delta);
  return next;
}

// guests 欄位形如 "2 · V3"，開頭數字即住客數
function guestCount(guests?: string): number {
  if (!guests) return 0;
  const n = parseInt(guests, 10);
  return Number.isNaN(n) ? 0 : n;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

interface Toast {
  id: number;
  message: string;
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex-1 overflow-hidden rounded-md border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-3 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </div>
      <div className="px-3 py-3">{children}</div>
    </div>
  );
}

function StatusCell({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400">{icon}</span>
      <span className="text-base font-bold text-[#37474F]">{value}</span>
      <span className="text-[11px] leading-tight text-gray-400">{label}</span>
    </div>
  );
}

function BigStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-bold text-[#37474F]">{value}</span>
      <span className="text-center text-[11px] leading-tight text-gray-400">
        {label}
      </span>
    </div>
  );
}

// 下拉選單共用殼：全螢幕透明層負責點外關閉，免掛 document listener
function Dropdown({
  open,
  onClose,
  align = "left",
  children,
}: {
  open: boolean;
  onClose: () => void;
  align?: "left" | "right";
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div
        className={`absolute z-40 mt-1 min-w-[12rem] rounded-md border border-gray-200 bg-white py-1 shadow-lg ${
          align === "right" ? "right-0" : "left-0"
        }`}
      >
        {children}
      </div>
    </>
  );
}

function RoomChip({
  room,
  selected,
  onClick,
}: {
  room: WorkdayRoom;
  selected?: boolean;
  onClick?: () => void;
}) {
  const { t } = useTranslation();
  // 斜紋沒有對應的 Tailwind utility，只能用 inline repeating-linear-gradient
  const blockStyle: CSSProperties =
    room.status === "dirty"
      ? { backgroundColor: RED }
      : room.status === "inspected"
        ? { backgroundColor: TEAL_DARK }
        : {
            backgroundImage: `repeating-linear-gradient(45deg, ${TEAL}, ${TEAL} 6px, #63C2B8 6px, #63C2B8 12px)`,
          };
  return (
    <div className="flex flex-col">
      <span className="pb-0.5 text-[9px] leading-none text-gray-400">
        {t("workday.allocation.card.credits", { value: room.credits })}
      </span>
      <button
        type="button"
        onClick={onClick}
        className={`relative flex h-11 w-full items-center justify-center rounded-sm text-white ${
          selected ? "ring-2 ring-[#37474F] ring-offset-1" : ""
        }`}
        style={blockStyle}
      >
        <span className="text-sm font-bold">{room.number}</span>
        {guestCount(room.guests) > 0 ? (
          <span className="absolute bottom-0.5 left-1 text-white/90">
            <IconPerson size={9} strokeWidth={2.4} />
          </span>
        ) : null}
        {room.urgentTasks.includes("minibar") ? (
          <span className="absolute right-1 top-0.5 text-white/90">
            <IconGlass size={9} strokeWidth={2.4} />
          </span>
        ) : null}
        {room.occupancy === "outOfOrder" ? (
          <span className="absolute right-0.5 top-0.5 h-2 w-2 bg-[#37474F]" />
        ) : null}
      </button>
    </div>
  );
}

function AssignmentCard({
  name,
  assignedRooms,
  visibleRooms,
  unassignedDirty,
  selection,
  onToggleSelect,
  onAddRooms,
  onMoveSelection,
  moveTargets,
}: {
  name: string;
  /** 全部指派房（統計用，不受區域篩選影響） */
  assignedRooms: WorkdayRoom[];
  /** 通過區域篩選、實際顯示的 chip */
  visibleRooms: WorkdayRoom[];
  unassignedDirty: WorkdayRoom[];
  selection: number[];
  onToggleSelect: (room: number) => void;
  onAddRooms: (rooms: number[]) => void;
  onMoveSelection: (to: string) => void;
  moveTargets: string[];
}) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [checked, setChecked] = useState<number[]>([]);

  const totalCredits = assignedRooms.reduce((sum, r) => sum + r.credits, 0);
  const totalGuests = assignedRooms.reduce(
    (sum, r) => sum + guestCount(r.guests),
    0,
  );
  const departures = assignedRooms.filter(
    (r) => r.occupancy === "departure",
  ).length;
  const inspected = assignedRooms.filter((r) => r.status === "inspected").length;

  const toggleChecked = (room: number) =>
    setChecked((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room],
    );

  const applyAdd = () => {
    if (checked.length > 0) onAddRooms(checked);
    setChecked([]);
    setAddOpen(false);
  };

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
      <div className="flex items-center justify-between bg-[#37474F] px-3 py-2 text-white">
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span>
            {t("workday.allocation.card.total", { value: assignedRooms.length })}
          </span>
          <span>
            {t("workday.allocation.card.credits", { value: totalCredits })}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <IconPerson size={12} /> {pad2(totalGuests)}
          </span>
          <span className="flex items-center gap-1">
            <IconArrowUpRight size={12} /> {pad2(departures)}
          </span>
          <span className="flex items-center gap-1">
            <IconEye size={12} /> {pad2(inspected)}
          </span>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            className="text-white/90 hover:text-white"
          >
            <IconChevron direction={collapsed ? "down" : "up"} size={14} />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        <span className="normal-case">{name}</span>
        <span>
          {t("workday.allocation.card.turndownSummary", {
            rooms: assignedRooms.length,
            credits: 0,
          })}
        </span>
      </div>
      {!collapsed && (
        <div className="p-3">
          <div className="relative mb-3">
            <button
              type="button"
              onClick={() => setAddOpen((v) => !v)}
              className="flex w-full items-center justify-center gap-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-[#37474F] hover:bg-gray-50"
            >
              {t("workday.allocation.card.addSelectedRooms")}
              <IconDownloadCircle size={14} className="text-gray-400" />
            </button>
            <Dropdown open={addOpen} onClose={() => setAddOpen(false)}>
              {unassignedDirty.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-400">
                  {t("workday.allocation.card.noUnassignedRooms")}
                </div>
              ) : (
                <>
                  <div className="max-h-48 overflow-y-auto">
                    {unassignedDirty.map((room) => (
                      <label
                        key={room.number}
                        className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs text-[#37474F] hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked.includes(room.number)}
                          onChange={() => toggleChecked(room.number)}
                          className="accent-[#37474F]"
                        />
                        <span className="font-semibold">{room.number}</span>
                        <span className="text-gray-400">
                          {t("workday.allocation.card.credits", {
                            value: room.credits,
                          })}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 px-3 py-1.5">
                    <button
                      type="button"
                      onClick={applyAdd}
                      disabled={checked.length === 0}
                      className="w-full rounded bg-[#37474F] px-2 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {t("workday.allocation.card.add")}
                    </button>
                  </div>
                </>
              )}
            </Dropdown>
          </div>
          {visibleRooms.length === 0 ? (
            <div className="py-4 text-center text-xs text-gray-400">
              {t("workday.allocation.noRoomsFound")}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-1.5">
              {visibleRooms.map((room) => (
                <RoomChip
                  key={room.number}
                  room={room}
                  selected={selection.includes(room.number)}
                  onClick={() => onToggleSelect(room.number)}
                />
              ))}
            </div>
          )}
          {selection.length > 0 && moveTargets.length > 0 && (
            <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-2">
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {t("workday.allocation.card.moveTo")}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {moveTargets.map((target) => (
                  <button
                    key={target}
                    type="button"
                    onClick={() => onMoveSelection(target)}
                    className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] text-[#37474F] hover:bg-gray-100"
                  >
                    {target}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AllocationPage() {
  const { t } = useTranslation();

  const rooms = useRoomsStore((s) => s.rooms);
  const onDuty = useAllocationStore((s) => s.onDuty);
  const assignments = useAllocationStore((s) => s.assignments);
  const toggleOnDuty = useAllocationStore((s) => s.toggleOnDuty);
  const assignRoom = useAllocationStore((s) => s.assignRoom);
  const moveRoom = useAllocationStore((s) => s.moveRoom);
  const autoAssign = useAllocationStore((s) => s.autoAssign);
  const resetSchedule = useAllocationStore((s) => s.resetSchedule);

  const [date, setDate] = useState(DEMO_TODAY);
  const [openMenu, setOpenMenu] = useState<
    "housekeepers" | "sectors" | null
  >(null);
  const [sectorFilter, setSectorFilter] = useState<number | null>(null);
  const [selection, setSelection] = useState<{
    owner: string;
    rooms: number[];
  } | null>(null);
  const [assignMenuRoom, setAssignMenuRoom] = useState<number | null>(null);
  const [confirmedFlash, setConfirmedFlash] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const notify = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2500);
  }, []);

  const roomByNumber = useMemo(
    () => new Map(rooms.map((r) => [r.number, r])),
    [rooms],
  );

  const assignedNumbers = useMemo(() => {
    const set = new Set<number>();
    for (const list of Object.values(assignments)) {
      for (const n of list) set.add(n);
    }
    return set;
  }, [assignments]);

  const unassignedDirty = useMemo(
    () =>
      rooms.filter((r) => r.status === "dirty" && !assignedNumbers.has(r.number)),
    [rooms, assignedNumbers],
  );

  const matchesSector = useCallback(
    (room: WorkdayRoom) => sectorFilter === null || room.floor === sectorFilter,
    [sectorFilter],
  );

  const visibleUnassigned = unassignedDirty.filter(matchesSector);

  // 有指派但被勾掉值班的房務員：卡片隱藏，只留一行提示避免房間「憑空消失」
  const offDutyAssigned = useMemo(
    () =>
      Object.entries(assignments)
        .filter(([name, list]) => list.length > 0 && !onDuty.includes(name))
        .map(([name]) => name),
    [assignments, onDuty],
  );

  const totalAssigned = assignedNumbers.size;

  // --- 統計面板（能從 rooms store 推導的即時算，其餘為固定 demo 值） ---
  const count = (fn: (r: WorkdayRoom) => boolean) => rooms.filter(fn).length;
  const emptyCount = count((r) => r.occupancy === "empty");
  const stayoverCount = count((r) => r.occupancy === "stayover");
  const dueOutCount = count((r) => r.occupancy === "departure");
  const outOfOrderCount = count((r) => r.occupancy === "outOfOrder");
  const dirtyCount = count((r) => r.status === "dirty");
  const cleanedCount = count((r) => r.status === "cleaned");
  const inspectedCount = count((r) => r.status === "inspected");
  const guestsTotal = rooms.reduce((sum, r) => sum + guestCount(r.guests), 0);

  const handleAutoAssign = () => {
    const result = autoAssign();
    if (!result) {
      notify(t("workday.allocation.toasts.noOnDuty"));
      return;
    }
    setSelection(null);
    notify(
      t("workday.allocation.toasts.autoAssigned", {
        rooms: result.rooms,
        housekeepers: result.housekeepers,
      }),
    );
  };

  const handleReset = () => {
    if (!window.confirm(t("workday.allocation.confirmResetMessage"))) return;
    resetSchedule();
    setSelection(null);
    notify(t("workday.allocation.toasts.reset"));
  };

  const handleConfirm = () => {
    notify(t("workday.allocation.toasts.confirmed"));
    setConfirmedFlash(true);
    window.setTimeout(() => setConfirmedFlash(false), 2000);
  };

  const toggleSelect = (owner: string, room: number) => {
    setSelection((prev) => {
      // 跨卡選取沒有意義（移動是整批移給同一人），換卡就重新起算
      if (!prev || prev.owner !== owner) return { owner, rooms: [room] };
      const next = prev.rooms.includes(room)
        ? prev.rooms.filter((r) => r !== room)
        : [...prev.rooms, room];
      return next.length === 0 ? null : { ...prev, rooms: next };
    });
  };

  const handleMoveSelection = (to: string) => {
    if (!selection) return;
    for (const room of selection.rooms) moveRoom(room, to);
    notify(
      t("workday.allocation.toasts.moved", {
        count: selection.rooms.length,
        name: to,
      }),
    );
    setSelection(null);
  };

  const handleAddRooms = (name: string, roomNumbers: number[]) => {
    for (const room of roomNumbers) assignRoom(name, room);
    notify(
      t("workday.allocation.toasts.added", {
        count: roomNumbers.length,
        name,
      }),
    );
  };

  const handleAssignUnassigned = (name: string, room: number) => {
    assignRoom(name, room);
    setAssignMenuRoom(null);
    notify(t("workday.allocation.toasts.added", { count: 1, name }));
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="border-b border-gray-300 pb-1 text-xl font-bold text-[#37474F]">
          {t("workday.allocation.title")}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
            aria-label={t("workday.allocation.print")}
          >
            <IconPrinter size={15} />
          </button>
          <button
            type="button"
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-[#37474F] hover:bg-gray-50"
          >
            {t("workday.allocation.toggleColors")}
          </button>
          <button
            type="button"
            disabled={totalAssigned === 0}
            onClick={handleConfirm}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold text-white transition-colors ${
              totalAssigned === 0
                ? "cursor-not-allowed bg-gray-300"
                : confirmedFlash
                  ? "bg-[#4DB6AC]"
                  : "bg-[#37474F] hover:bg-[#2c3a40]"
            }`}
          >
            <IconCheck size={13} />{" "}
            {confirmedFlash
              ? t("workday.allocation.confirmed")
              : t("workday.allocation.confirm")}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDate((d) => addDays(d, -1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
            aria-label={t("workday.allocation.previousDay")}
          >
            <IconChevron direction="left" size={14} />
          </button>
          <span className="px-1 text-sm font-semibold text-[#37474F]">
            {formatDate(date)}
          </span>
          <button
            type="button"
            onClick={() => setDate((d) => addDays(d, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
            aria-label={t("workday.allocation.nextDay")}
          >
            <IconChevron direction="right" size={14} />
          </button>
          <button
            type="button"
            onClick={() => setDate(DEMO_TODAY)}
            className="ml-1 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs text-[#37474F] hover:bg-gray-50"
          >
            {t("workday.allocation.today")}
          </button>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-[#37474F] hover:bg-gray-50"
        >
          {t("workday.allocation.dayView")}
          <IconChevron direction="down" size={13} className="text-gray-400" />
        </button>
      </div>

      <div className="flex gap-3">
        <Panel title={t("workday.allocation.panels.roomStatus")}>
          <div className="grid grid-cols-4 gap-x-4 gap-y-3">
            <StatusCell
              icon={<IconDoorEmpty size={14} />}
              value={pad2(emptyCount)}
              label={t("workday.allocation.stats.empty")}
            />
            <StatusCell
              icon={<IconMoon size={14} />}
              value={pad2(stayoverCount)}
              label={t("workday.allocation.stats.stayover")}
            />
            <StatusCell
              icon={<IconArrowIn size={14} />}
              value="03"
              label={t("workday.allocation.stats.dueIn")}
            />
            <StatusCell
              icon={<IconPerson size={14} />}
              value="00"
              label={t("workday.allocation.stats.arrived")}
            />
            <StatusCell
              icon={<IconArrowOut size={14} />}
              value={pad2(dueOutCount)}
              label={t("workday.allocation.stats.dueOut")}
            />
            <StatusCell
              icon={<IconSuitcase size={14} />}
              value="08"
              label={t("workday.allocation.stats.departed")}
            />
            <StatusCell
              icon={<IconBroomSmall size={14} />}
              value="00"
              label={t("workday.allocation.stats.generalCleaning")}
            />
            <StatusCell
              icon={<IconBan size={14} />}
              value={pad2(outOfOrderCount)}
              label={t("workday.allocation.stats.outOfOrder")}
            />
          </div>
        </Panel>
        <Panel title={t("workday.allocation.panels.cleanliness")}>
          <div className="grid grid-cols-3 gap-3 pt-1">
            <BigStat
              value={pad2(dirtyCount)}
              label={t("workday.allocation.stats.dirty")}
            />
            <BigStat
              value={pad2(cleanedCount)}
              label={t("workday.allocation.stats.cleaned")}
            />
            <BigStat
              value={pad2(inspectedCount)}
              label={t("workday.allocation.stats.inspected")}
            />
          </div>
        </Panel>
        <Panel title={t("workday.allocation.panels.attributes")}>
          <div className="grid grid-cols-6 gap-2 pt-1">
            <BigStat value="05" label={t("workday.allocation.stats.dueIn")} />
            <BigStat
              value={pad2(cleanedCount)}
              label={t("workday.allocation.stats.roomsForInspection")}
            />
            <BigStat value="01" label={t("workday.allocation.stats.changeLinen")} />
            <BigStat value="08" label={t("workday.allocation.stats.checkedOut")} />
            <BigStat
              value={pad2(guestsTotal)}
              label={t("workday.allocation.stats.guests")}
            />
            <BigStat value="00" label={t("workday.allocation.stats.towelChange")} />
          </div>
        </Panel>
      </div>

      <div className="flex items-end gap-6 border-b border-gray-200">
        <button
          type="button"
          className="-mb-px border-b-2 border-[#37474F] pb-2 text-xs font-bold uppercase tracking-wider text-[#37474F]"
        >
          {t("workday.allocation.tabs.roomList")}
        </button>
        <button
          type="button"
          className="pb-2 text-xs font-bold uppercase tracking-wider text-gray-300"
        >
          {t("workday.allocation.tabs.turndown")}
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((m) => (m === "housekeepers" ? null : "housekeepers"))
            }
            className="flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-[#37474F] hover:bg-gray-50"
          >
            {t("workday.allocation.chooseHousekeepers", {
              onDuty: onDuty.length,
              total: housekeepers.length,
            })}
            <IconChevron direction="down" size={13} className="text-gray-400" />
          </button>
          <Dropdown
            open={openMenu === "housekeepers"}
            onClose={() => setOpenMenu(null)}
          >
            {housekeepers.map((name) => (
              <label
                key={name}
                className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs text-[#37474F] hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={onDuty.includes(name)}
                  onChange={() => toggleOnDuty(name)}
                  className="accent-[#37474F]"
                />
                {name}
              </label>
            ))}
          </Dropdown>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoAssign}
            className="flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-[#37474F] hover:bg-gray-50"
          >
            <IconAutoAssign size={13} className="text-gray-400" />
            {t("workday.allocation.autoAssign")}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded bg-[#E8766A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#e2635a]"
          >
            {t("workday.allocation.resetSchedule")}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenMenu((m) => (m === "sectors" ? null : "sectors"))
              }
              className="flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-[#37474F] hover:bg-gray-50"
            >
              {sectorFilter === null
                ? t("workday.allocation.filterSectors")
                : t("workday.allocation.sectors.floor", { floor: sectorFilter })}
              <IconChevron direction="down" size={13} className="text-gray-400" />
            </button>
            <Dropdown
              open={openMenu === "sectors"}
              onClose={() => setOpenMenu(null)}
              align="right"
            >
              {[null, 1, 2, 3, 4].map((floor) => (
                <button
                  key={floor ?? "all"}
                  type="button"
                  onClick={() => {
                    setSectorFilter(floor);
                    setOpenMenu(null);
                  }}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs text-[#37474F] hover:bg-gray-50"
                >
                  {floor === null
                    ? t("workday.allocation.sectors.all")
                    : t("workday.allocation.sectors.floor", { floor })}
                  {sectorFilter === floor ? (
                    <IconCheck size={12} style={{ color: SLATE }} />
                  ) : null}
                </button>
              ))}
            </Dropdown>
          </div>
          <button
            type="button"
            className="flex w-28 items-center justify-end rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-[#37474F] hover:bg-gray-50"
            aria-label={t("workday.allocation.filter")}
          >
            <IconChevron direction="down" size={13} className="text-gray-400" />
          </button>
        </div>
      </div>

      {offDutyAssigned.length > 0 && (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {t("workday.allocation.offDutyNotice", {
            names: offDutyAssigned.join(", "),
          })}
        </div>
      )}

      <div className="grid grid-cols-3 items-start gap-4">
        {onDuty.map((name) => {
          const assignedRooms = (assignments[name] ?? [])
            .map((n) => roomByNumber.get(n))
            .filter((r): r is WorkdayRoom => r !== undefined);
          return (
            <AssignmentCard
              key={name}
              name={name}
              assignedRooms={assignedRooms}
              visibleRooms={assignedRooms.filter(matchesSector)}
              unassignedDirty={unassignedDirty}
              selection={selection?.owner === name ? selection.rooms : []}
              onToggleSelect={(room) => toggleSelect(name, room)}
              onAddRooms={(roomNumbers) => handleAddRooms(name, roomNumbers)}
              onMoveSelection={handleMoveSelection}
              moveTargets={onDuty.filter((n) => n !== name)}
            />
          );
        })}

        {visibleUnassigned.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">
            {t("workday.allocation.noRoomsFound")}
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-dashed border-gray-300 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {t("workday.allocation.unassigned")}
            </div>
            <div className="p-3">
              <div className="grid grid-cols-5 gap-1.5">
                {visibleUnassigned.map((room) => (
                  <RoomChip
                    key={room.number}
                    room={room}
                    selected={assignMenuRoom === room.number}
                    onClick={() =>
                      setAssignMenuRoom((prev) =>
                        prev === room.number ? null : room.number,
                      )
                    }
                  />
                ))}
              </div>
              {assignMenuRoom !== null && onDuty.length > 0 && (
                <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-2">
                  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    {t("workday.allocation.assignTo")}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {onDuty.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleAssignUnassigned(name, assignMenuRoom)}
                        className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] text-[#37474F] hover:bg-gray-100"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div
        className="pointer-events-none fixed bottom-6 right-6 z-50 space-y-2"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="rounded-lg bg-gray-800 px-4 py-2.5 text-sm text-white shadow-lg"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
