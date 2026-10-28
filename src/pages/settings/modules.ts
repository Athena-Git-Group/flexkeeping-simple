import type { ModuleKey } from "@/domain/types";

/** Every module a role can grant, in the order shown across settings. */
export const MODULE_KEYS: readonly ModuleKey[] = [
  "dashboard",
  "housekeeping",
  "room_allocation",
  "tasks",
  "lost_found",
  "guest_relations",
  "audits",
  "settings",
];
