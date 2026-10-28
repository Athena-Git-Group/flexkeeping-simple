/**
 * Status color tokens. Each entry is a Tailwind class set for a pill/badge, kept
 * here so every screen reads the same status with the same color.
 */

import type {
  AssignmentState,
  CleanupState,
  LostAndFoundState,
  Occupancy,
  Priority,
  RoomCleanliness,
} from "./types";

export type Tone = {
  /** Badge/pill classes (bg + text + optional ring). */
  badge: string;
  /** Solid dot/accent color for compact indicators. */
  dot: string;
};

const tone = (badge: string, dot: string): Tone => ({ badge, dot });

export const roomCleanlinessTone: Record<RoomCleanliness, Tone> = {
  dirty: tone("bg-rose-50 text-rose-700 ring-1 ring-rose-200", "bg-rose-500"),
  stripped: tone(
    "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
    "bg-orange-500",
  ),
  awaiting_inspection: tone(
    "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    "bg-amber-500",
  ),
  inspected: tone(
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    "bg-emerald-500",
  ),
  out_of_order: tone(
    "bg-slate-200 text-slate-700 ring-1 ring-slate-300",
    "bg-slate-500",
  ),
  do_not_disturb: tone(
    "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    "bg-violet-500",
  ),
};

export const occupancyTone: Record<Occupancy, Tone> = {
  empty: tone("bg-slate-50 text-slate-600 ring-1 ring-slate-200", "bg-slate-400"),
  arrival: tone("bg-sky-50 text-sky-700 ring-1 ring-sky-200", "bg-sky-500"),
  arrived: tone("bg-sky-50 text-sky-700 ring-1 ring-sky-200", "bg-sky-600"),
  stayover: tone(
    "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
    "bg-indigo-500",
  ),
  due_out: tone("bg-amber-50 text-amber-700 ring-1 ring-amber-200", "bg-amber-500"),
  departed: tone(
    "bg-slate-50 text-slate-600 ring-1 ring-slate-200",
    "bg-slate-400",
  ),
  departure_tomorrow: tone(
    "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
    "bg-teal-500",
  ),
};

export const priorityTone: Record<Priority, Tone> = {
  low: tone("bg-slate-50 text-slate-600 ring-1 ring-slate-200", "bg-slate-400"),
  medium: tone("bg-sky-50 text-sky-700 ring-1 ring-sky-200", "bg-sky-500"),
  high: tone("bg-orange-50 text-orange-700 ring-1 ring-orange-200", "bg-orange-500"),
  urgent: tone("bg-rose-50 text-rose-700 ring-1 ring-rose-200", "bg-rose-600"),
};

export const assignmentStateTone: Record<AssignmentState, Tone> = {
  submitted: tone("bg-sky-50 text-sky-700 ring-1 ring-sky-200", "bg-sky-500"),
  fixed: tone("bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200", "bg-indigo-500"),
  approved: tone(
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    "bg-emerald-500",
  ),
  done: tone(
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    "bg-emerald-600",
  ),
  archived: tone("bg-slate-100 text-slate-600 ring-1 ring-slate-200", "bg-slate-400"),
  cancelled: tone("bg-slate-100 text-slate-500 ring-1 ring-slate-200", "bg-slate-300"),
  on_hold: tone("bg-amber-50 text-amber-700 ring-1 ring-amber-200", "bg-amber-500"),
  standby: tone("bg-violet-50 text-violet-700 ring-1 ring-violet-200", "bg-violet-500"),
};

export const lostAndFoundStateTone: Record<LostAndFoundState, Tone> = {
  submitted: tone("bg-sky-50 text-sky-700 ring-1 ring-sky-200", "bg-sky-500"),
  sent: tone("bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200", "bg-indigo-500"),
  returned: tone(
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    "bg-emerald-500",
  ),
  archived: tone("bg-slate-100 text-slate-600 ring-1 ring-slate-200", "bg-slate-400"),
  written_off: tone("bg-rose-50 text-rose-700 ring-1 ring-rose-200", "bg-rose-500"),
};

export const cleanupStateTone: Record<CleanupState, Tone> = {
  pending: tone("bg-slate-50 text-slate-600 ring-1 ring-slate-200", "bg-slate-400"),
  in_progress: tone("bg-sky-50 text-sky-700 ring-1 ring-sky-200", "bg-sky-500"),
  on_pause: tone("bg-amber-50 text-amber-700 ring-1 ring-amber-200", "bg-amber-500"),
  completed: tone(
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    "bg-emerald-500",
  ),
  inspection_approved: tone(
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    "bg-emerald-600",
  ),
  cancelled: tone("bg-slate-100 text-slate-500 ring-1 ring-slate-200", "bg-slate-300"),
};
