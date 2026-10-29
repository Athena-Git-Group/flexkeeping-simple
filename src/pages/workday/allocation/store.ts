import { create } from "zustand";
import { persist } from "zustand/middleware";
import { housekeepers } from "@/pages/workday/data";
import { useRoomsStore } from "@/pages/workday/rooms/store";

/**
 * 房間分配頁的指派狀態。
 * 房間本身的資料（status/credits/…）一律唯讀取自 useRoomsStore，
 * 這裡只保存「誰值班」與「哪間房指派給誰」，避免兩個 store 各存一份房間而失同步。
 */
export interface AllocationStore {
  onDuty: string[];
  /** 房務員 → 指派房號陣列 */
  assignments: Record<string, number[]>;

  toggleOnDuty: (name: string) => void;
  assignRoom: (name: string, room: number) => void;
  unassignRoom: (room: number) => void;
  moveRoom: (room: number, to: string) => void;
  autoAssign: () => { rooms: number; housekeepers: number } | null;
  resetSchedule: () => void;
}

// 一間房同時只能屬於一個人，所以任何指派前都先全域清掉這間房
function withoutRoom(
  assignments: Record<string, number[]>,
  room: number,
): Record<string, number[]> {
  const next: Record<string, number[]> = {};
  for (const [name, rooms] of Object.entries(assignments)) {
    next[name] = rooms.filter((r) => r !== room);
  }
  return next;
}

const defaultOnDuty = housekeepers.slice(0, 4);

export const useAllocationStore = create<AllocationStore>()(
  persist(
    (set, get) => ({
      onDuty: defaultOnDuty,
      assignments: {},

      toggleOnDuty: (name) =>
        set((s) => ({
          onDuty: s.onDuty.includes(name)
            ? s.onDuty.filter((n) => n !== name)
            : [...s.onDuty, name],
        })),

      assignRoom: (name, room) =>
        set((s) => {
          const cleared = withoutRoom(s.assignments, room);
          return {
            assignments: {
              ...cleared,
              [name]: [...(cleared[name] ?? []), room].sort((a, b) => a - b),
            },
          };
        }),

      unassignRoom: (room) =>
        set((s) => ({ assignments: withoutRoom(s.assignments, room) })),

      moveRoom: (room, to) => get().assignRoom(to, room),

      autoAssign: () => {
        const onDuty = get().onDuty;
        // 沒人值班時不能把 assignments 洗成空的，交給呼叫端提示使用者
        if (onDuty.length === 0) return null;

        const dirty = useRoomsStore
          .getState()
          .rooms.filter((r) => r.status === "dirty");

        // 貪婪裝箱：credits 大的先發、每次發給總和最低的人，讓各人負擔盡量接近。
        // 同分與人選順序刻意隨機，使「再點一次自動指派」會重新洗牌而非回到原樣。
        const order = [...onDuty].sort(() => Math.random() - 0.5);
        const queue = [...dirty].sort(
          (a, b) => b.credits - a.credits || Math.random() - 0.5,
        );
        const totals = new Map<string, number>(order.map((n) => [n, 0]));
        const next: Record<string, number[]> = Object.fromEntries(
          order.map((n) => [n, [] as number[]]),
        );
        for (const room of queue) {
          let best = order[0];
          for (const name of order) {
            if ((totals.get(name) ?? 0) < (totals.get(best) ?? 0)) best = name;
          }
          next[best].push(room.number);
          totals.set(best, (totals.get(best) ?? 0) + room.credits);
        }
        for (const rooms of Object.values(next)) rooms.sort((a, b) => a - b);

        set({ assignments: next });
        return { rooms: dirty.length, housekeepers: order.length };
      },

      resetSchedule: () => set({ assignments: {} }),
    }),
    {
      name: "tms-workday-allocation",
      version: 1,
      // 舊的/未知的持久化形狀一律丟棄，回到預設 demo 狀態
      migrate: () => ({ onDuty: defaultOnDuty, assignments: {} }),
      partialize: (state) => ({
        onDuty: state.onDuty,
        assignments: state.assignments,
      }),
    },
  ),
);
