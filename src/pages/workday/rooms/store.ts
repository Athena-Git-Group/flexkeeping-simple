import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createInitialRooms,
  type Occupancy,
  type RoomStatus,
  type UrgentTaskType,
  type WorkdayRoom,
} from "@/pages/workday/data";

export type StatusFilter = RoomStatus | "all";
export type OccupancyFilter = Occupancy | "all";

const STATUS_CYCLE: Record<RoomStatus, RoomStatus> = {
  dirty: "cleaned",
  cleaned: "inspected",
  inspected: "dirty",
};

interface RoomsStore {
  rooms: WorkdayRoom[];

  // --- filters (not persisted) ---
  search: string;
  statusFilter: StatusFilter;
  occupancyFilter: OccupancyFilter;
  floorFilter: number | null;
  housekeeperFilter: string | null;
  /** Room number briefly ring-highlighted after a sector-chip jump */
  highlightRoom: number | null;

  // --- room actions ---
  /** dirty → cleaned → inspected → dirty; returns the new status */
  cycleStatus: (room: number) => RoomStatus;
  assignHousekeeper: (room: number, name: string) => void;
  addUrgentTasks: (roomNumbers: number[], tasks: UrgentTaskType[]) => void;
  removeUrgentTask: (room: number, task: UrgentTaskType) => void;
  resetDemo: () => void;

  // --- filter actions ---
  setSearch: (value: string) => void;
  setStatusFilter: (value: StatusFilter) => void;
  setOccupancyFilter: (value: OccupancyFilter) => void;
  toggleFloorFilter: (floor: number) => void;
  toggleHousekeeperFilter: (name: string) => void;
  clearFilters: () => void;
  setHighlightRoom: (room: number | null) => void;
}

const emptyFilters = {
  search: "",
  statusFilter: "all" as StatusFilter,
  occupancyFilter: "all" as OccupancyFilter,
  floorFilter: null,
  housekeeperFilter: null,
};

export const useRoomsStore = create<RoomsStore>()(
  persist(
    (set, get) => ({
      rooms: createInitialRooms(),
      ...emptyFilters,
      highlightRoom: null,

      cycleStatus: (room) => {
        const current = get().rooms.find((r) => r.number === room);
        const next = STATUS_CYCLE[current?.status ?? "dirty"];
        set((s) => ({
          rooms: s.rooms.map((r) => (r.number === room ? { ...r, status: next } : r)),
        }));
        return next;
      },

      assignHousekeeper: (room, name) =>
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.number === room ? { ...r, housekeeper: name } : r,
          ),
        })),

      addUrgentTasks: (roomNumbers, tasks) =>
        set((s) => ({
          rooms: s.rooms.map((r) =>
            roomNumbers.includes(r.number)
              ? {
                  ...r,
                  urgentTasks: [
                    ...r.urgentTasks,
                    ...tasks.filter((task) => !r.urgentTasks.includes(task)),
                  ],
                }
              : r,
          ),
        })),

      removeUrgentTask: (room, task) =>
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.number === room
              ? { ...r, urgentTasks: r.urgentTasks.filter((t) => t !== task) }
              : r,
          ),
        })),

      resetDemo: () =>
        set({ rooms: createInitialRooms(), ...emptyFilters, highlightRoom: null }),

      setSearch: (value) => set({ search: value }),
      setStatusFilter: (value) => set({ statusFilter: value }),
      setOccupancyFilter: (value) => set({ occupancyFilter: value }),
      toggleFloorFilter: (floor) =>
        set((s) => ({ floorFilter: s.floorFilter === floor ? null : floor })),
      toggleHousekeeperFilter: (name) =>
        set((s) => ({
          housekeeperFilter: s.housekeeperFilter === name ? null : name,
        })),
      clearFilters: () => set(emptyFilters),
      setHighlightRoom: (room) => set({ highlightRoom: room }),
    }),
    {
      name: "tms-workday-rooms",
      version: 1,
      // Old/unknown persisted shapes are discarded in favor of fresh demo data.
      migrate: () => ({ rooms: createInitialRooms() }),
      partialize: (state) => ({ rooms: state.rooms }),
    },
  ),
);

export interface RoomFilters {
  search: string;
  statusFilter: StatusFilter;
  occupancyFilter: OccupancyFilter;
  floorFilter: number | null;
  housekeeperFilter: string | null;
}

export function roomMatchesFilters(room: WorkdayRoom, f: RoomFilters): boolean {
  const q = f.search.trim().toLowerCase();
  if (
    q &&
    !String(room.number).includes(q) &&
    !room.housekeeper.toLowerCase().includes(q)
  ) {
    return false;
  }
  if (f.statusFilter !== "all" && room.status !== f.statusFilter) return false;
  if (f.occupancyFilter !== "all" && room.occupancy !== f.occupancyFilter) return false;
  if (f.floorFilter !== null && room.floor !== f.floorFilter) return false;
  if (f.housekeeperFilter !== null && room.housekeeper !== f.housekeeperFilter) {
    return false;
  }
  return true;
}

export function filterRooms(rooms: WorkdayRoom[], f: RoomFilters): WorkdayRoom[] {
  return rooms.filter((room) => roomMatchesFilters(room, f));
}
