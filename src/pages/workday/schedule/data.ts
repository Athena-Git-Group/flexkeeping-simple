// Structured mock data for the weekly schedule page (SchedulePage).
// Tasks are stored flat ({ week, room, day, task, status, credits, housekeeper? })
// so the same dataset can be regrouped by room or by housekeeper.

import { housekeepers } from "@/pages/workday/data";

export type ChipVariant = "blue" | "orange" | "purple" | "ochre" | "pink" | "teal";

export type TaskStatus = "dirty" | "inspected" | "cleaned";

export type TaskKey =
  | "lightClean"
  | "departureClean"
  | "familyClean"
  | "roomCheck"
  | "departureLight"
  | "legionellaCheck"
  | "noClean";

export interface ScheduleTask {
  id: number;
  /** Week index: 0 = previous week, 1 = this week, 2 = next week */
  week: number;
  room: string;
  /** Day column, 0 (Monday) .. 6 (Sunday) */
  day: number;
  task: TaskKey;
  status: TaskStatus;
  credits: number;
  housekeeper?: string;
  ep?: boolean;
  bottle?: boolean;
  dot?: boolean;
}

export interface StaySpan {
  week: number;
  room: string;
  from: number; // 0-based day
  to: number;
}

/** Week ids used as i18n suffixes (workday.schedule.weeks.*) */
export const WEEK_IDS = ["w0", "w1", "w2"] as const;
export const THIS_WEEK = 1;

export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export const ROOMS = [
  "100", "101", "102", "103", "104", "105", "106",
  "107", "108", "109", "110", "111", "112", "113",
];

export const scheduleHousekeepers = housekeepers;

export const taskVariant: Record<TaskKey, ChipVariant> = {
  lightClean: "blue",
  departureClean: "orange",
  familyClean: "ochre",
  roomCheck: "purple",
  departureLight: "pink",
  legionellaCheck: "purple",
  noClean: "teal",
};

export const chipPalette: Record<ChipVariant, { bg: string; bar: string; text: string }> = {
  blue: { bg: "#E3F4F8", bar: "#9AD4E4", text: "#37474F" },
  orange: { bg: "#FDEDE4", bar: "#F0956A", text: "#37474F" },
  purple: { bg: "#EFEAF7", bar: "#9575CD", text: "#37474F" },
  ochre: { bg: "#F7F0DC", bar: "#C9A94E", text: "#37474F" },
  pink: { bg: "#FBE8EE", bar: "#E58BAA", text: "#37474F" },
  teal: { bg: "#DDF0EF", bar: "#4DB6AC", text: "#37474F" },
};

export const statusColor: Record<TaskStatus, string> = {
  dirty: "#E2574C",
  inspected: "#16A3A3",
  cleaned: "#4DB6AC",
};

export const STAY_SPANS: StaySpan[] = [{ week: 1, room: "102", from: 1, to: 4 }];

type Seed = [
  room: string,
  day: number,
  task: TaskKey,
  status: TaskStatus,
  credits: number,
  flags?: Partial<Pick<ScheduleTask, "ep" | "bottle" | "dot">>,
];

// This week (January 29 - February 4)
const week1Seeds: Seed[] = [
  ["100", 0, "lightClean", "inspected", 13],
  ["100", 1, "lightClean", "dirty", 13, { ep: true }],
  ["100", 2, "departureClean", "dirty", 30],
  ["101", 0, "lightClean", "dirty", 15],
  ["101", 6, "legionellaCheck", "inspected", 10],
  ["102", 5, "departureClean", "dirty", 30],
  ["103", 0, "lightClean", "dirty", 13],
  ["103", 6, "legionellaCheck", "inspected", 10],
  ["104", 0, "lightClean", "inspected", 15],
  ["104", 1, "lightClean", "dirty", 15, { ep: true }],
  ["104", 2, "lightClean", "dirty", 15],
  ["104", 3, "lightClean", "dirty", 15],
  ["104", 4, "lightClean", "dirty", 15],
  ["104", 5, "lightClean", "dirty", 13],
  ["105", 0, "lightClean", "inspected", 15],
  ["105", 6, "legionellaCheck", "inspected", 10],
  ["106", 0, "lightClean", "dirty", 13, { bottle: true }],
  ["106", 1, "lightClean", "dirty", 13, { ep: true }],
  ["106", 2, "lightClean", "dirty", 13],
  ["106", 3, "familyClean", "dirty", 20],
  ["106", 4, "lightClean", "dirty", 13],
  ["106", 5, "familyClean", "dirty", 20],
  ["107", 0, "lightClean", "dirty", 13],
  ["107", 6, "legionellaCheck", "inspected", 10],
  ["108", 0, "lightClean", "dirty", 15],
  ["108", 1, "lightClean", "dirty", 15, { ep: true }],
  ["108", 2, "lightClean", "dirty", 15],
  ["108", 3, "roomCheck", "dirty", 25],
  ["108", 4, "departureLight", "dirty", 40],
  ["109", 0, "lightClean", "dirty", 13],
  ["109", 6, "legionellaCheck", "inspected", 10],
  ["110", 0, "departureClean", "cleaned", 40],
  ["110", 1, "departureClean", "dirty", 40, { ep: true }],
  ["111", 0, "lightClean", "inspected", 15],
  ["111", 1, "lightClean", "dirty", 15, { ep: true }],
  ["111", 2, "lightClean", "dirty", 15],
  ["111", 3, "lightClean", "dirty", 15],
  ["111", 4, "lightClean", "dirty", 15],
  ["111", 5, "lightClean", "dirty", 15],
  ["112", 0, "lightClean", "inspected", 15, { dot: true }],
  ["112", 1, "lightClean", "dirty", 15, { ep: true }],
  ["112", 2, "lightClean", "dirty", 15],
  ["112", 3, "lightClean", "dirty", 15],
  ["112", 4, "lightClean", "dirty", 15],
  ["112", 5, "lightClean", "dirty", 15],
  ["113", 0, "departureClean", "inspected", 35],
  ["113", 1, "departureClean", "dirty", 35, { ep: true }],
];

// Next week (February 5 - February 11) — sparse
const week2Seeds: Seed[] = [
  ["100", 0, "lightClean", "dirty", 13],
  ["102", 1, "departureClean", "dirty", 30],
  ["104", 0, "lightClean", "dirty", 15],
  ["104", 3, "lightClean", "dirty", 15],
  ["106", 2, "familyClean", "dirty", 20],
  ["108", 4, "roomCheck", "dirty", 25],
  ["110", 0, "departureClean", "dirty", 40],
  ["111", 1, "lightClean", "dirty", 15],
  ["111", 2, "lightClean", "dirty", 15],
  ["113", 5, "departureClean", "dirty", 35],
];

/**
 * Fresh copy of the schedule demo data.
 * Tasks on the first two days of this week come pre-assigned (round-robin);
 * the rest are left unassigned so "Auto Assign" has work to do.
 */
export function createScheduleTasks(): ScheduleTask[] {
  let id = 0;
  let hkIndex = 0;
  const build = (week: number) => (seed: Seed): ScheduleTask => {
    const [room, day, task, status, credits, flags] = seed;
    const assigned = week === THIS_WEEK && day <= 1;
    return {
      id: ++id,
      week,
      room,
      day,
      task,
      status,
      credits,
      housekeeper: assigned
        ? housekeepers[hkIndex++ % housekeepers.length]
        : undefined,
      ...flags,
    };
  };
  return [...week1Seeds.map(build(1)), ...week2Seeds.map(build(2))];
}
