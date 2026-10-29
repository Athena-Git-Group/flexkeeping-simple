export type RoomStatus = "dirty" | "cleaned" | "inspected";

export type Occupancy = "stayover" | "empty" | "departure" | "outOfOrder";

export type UrgentTaskType = "minibar" | "room";

export interface WorkdayRoom {
  number: number;
  /** Floor the room belongs to (1–4), used for sector stats and filtering */
  floor: number;
  /** Cleaning status: dirty = red bar, cleaned = white bar, inspected = teal bar */
  status: RoomStatus;
  occupancy: Occupancy;
  /** Guests row content, e.g. "1 · V3" (stayover/departure rooms) */
  guests?: string;
  /** Assigned housekeeper (one of `housekeepers`) */
  housekeeper: string;
  /** Clean type for the small gray credits line under the color bar */
  cleanType: "light" | "none";
  /** Credit cost shown next to the clean type */
  credits: number;
  /** Urgent task tags pinned on the room from the urgent-tasks panel */
  urgentTasks: UrgentTaskType[];
}

export const housekeepers: string[] = [
  "Alina Hampton",
  "Aaron Kasimira",
  "Elizabeth Price",
  "Emily Flores",
  "Patricia Reed",
  "Shelagh Blakely",
  "Serena Virgil",
];

export const FLOORS = [1, 2, 3, 4] as const;

/** [number, status, occupancy, guests, cleanType, credits] */
type RoomSeed = [
  number,
  RoomStatus,
  Occupancy,
  string | undefined,
  "light" | "none",
  number,
];

const seeds: RoomSeed[] = [
  // 1. floor — 100–108
  [100, "cleaned", "stayover", "1 · V3", "light", 13],
  [101, "dirty", "empty", undefined, "light", 15],
  [102, "cleaned", "stayover", "2", "none", 0],
  [103, "dirty", "departure", "1", "light", 13],
  [104, "cleaned", "stayover", "2 · V3", "light", 15],
  [105, "inspected", "empty", undefined, "light", 15],
  [106, "dirty", "stayover", "5", "light", 13],
  [107, "dirty", "departure", "1", "light", 15],
  [108, "dirty", "stayover", "2", "light", 15],
  // 2. floor — 201–206
  [201, "inspected", "empty", undefined, "light", 12],
  [202, "dirty", "stayover", "2", "light", 14],
  [203, "cleaned", "departure", "1", "light", 13],
  [204, "dirty", "outOfOrder", undefined, "none", 0],
  [205, "cleaned", "stayover", "1 · V1", "light", 12],
  [206, "inspected", "empty", undefined, "none", 0],
  // 3. floor — 301–306
  [301, "dirty", "departure", "2", "light", 15],
  [302, "cleaned", "stayover", "3", "light", 14],
  [303, "dirty", "empty", undefined, "light", 13],
  [304, "inspected", "stayover", "1 · V2", "light", 12],
  [305, "cleaned", "empty", undefined, "none", 0],
  [306, "dirty", "outOfOrder", undefined, "none", 0],
  // 4. floor — 401–407
  [401, "cleaned", "stayover", "2", "light", 13],
  [402, "dirty", "departure", "4", "light", 16],
  [403, "inspected", "empty", undefined, "light", 12],
  [404, "cleaned", "stayover", "1", "light", 13],
  [405, "dirty", "stayover", "2 · V3", "light", 15],
  [406, "cleaned", "empty", undefined, "none", 0],
  [407, "dirty", "departure", "1", "light", 14],
];

/** Fresh copy of the demo room data (housekeepers assigned round-robin). */
export function createInitialRooms(): WorkdayRoom[] {
  return seeds.map(([number, status, occupancy, guests, cleanType, credits], i) => ({
    number,
    floor: Math.floor(number / 100),
    status,
    occupancy,
    guests,
    housekeeper: housekeepers[i % housekeepers.length],
    cleanType,
    credits,
    urgentTasks: [],
  }));
}
