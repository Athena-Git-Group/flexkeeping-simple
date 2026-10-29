// Structured demo records backing the CleaningFlawPage / RepairsAnalyticsPage
// dashboards, plus the generic facet cross-filter engine shared by both.
//
// Label convention: `code` / `title` / `category` / `createdByGroup` hold i18n
// key suffixes under the `workday.analytics` subtree (e.g. "facets.tooCold").
// Values that are not keys (person names, room numbers, free-text titles from
// quick-action tasks) are stored raw; `resolveLabel` decides at render time.

import type { Task } from "@/pages/workday/tasks/store";

export const DEMO_DATE = "30.01.2026";

export interface AnalyticsRecord {
  id: string;
  /** Flaw/repair code — i18n key suffix, or a raw room code for quick-action rows */
  code: string;
  /** i18n key suffix for seed rows, raw text for quick-action rows */
  title: string;
  room: string;
  category: string;
  priority: string;
  createdBy: string;
  createdByGroup: string;
  completedBy?: string;
  date: string;
  fromQuickAction?: boolean;
}

/** i18n key prefixes that `resolveLabel` treats as translatable. */
const KEY_PREFIXES = ["facets.", "items.", "groups.", "common."];

/** Translate i18n-key-shaped values, pass raw strings through untouched. */
export function resolveLabel(
  ta: (key: string) => string,
  value: string,
): string {
  return KEY_PREFIXES.some((p) => value.startsWith(p)) ? ta(value) : value;
}

type Seed = [
  room: string,
  code: string,
  title: string,
  category: string,
  priority: string,
  createdBy: string,
  createdByGroup: string,
  completedBy?: string,
];

function toRecords(prefix: string, seeds: Seed[]): AnalyticsRecord[] {
  return seeds.map(
    ([room, code, title, category, priority, createdBy, createdByGroup, completedBy], i) => ({
      id: `${prefix}-${i + 1}`,
      room,
      code,
      title,
      category,
      priority,
      createdBy,
      createdByGroup,
      completedBy,
      date: DEMO_DATE,
    }),
  );
}

/** 10 cleaning-flaw records (mirrors the original static dashboard counts). */
export const CLEANING_FLAW_RECORDS: AnalyticsRecord[] = toRecords("flaw", [
  ["404", "items.dustOnTable", "items.dustOnTable", "facets.room", "facets.medium", "Jessica Scott", "groups.housekeepingManager"],
  ["304", "facets.missingHangers", "facets.missingHangers", "facets.room", "facets.medium", "Jessica Scott", "groups.housekeepingManager"],
  ["414", "facets.missingBathrobe", "facets.missingBathrobe", "facets.room", "facets.medium", "Till Christoph", "groups.housekeepingManager"],
  ["115", "facets.badSmell", "facets.badSmell", "facets.bathroom", "facets.medium", "Jessica Scott", "groups.housekeepingManager"],
  ["315", "facets.tooCold", "facets.tooCold", "facets.room", "facets.medium", "Valorie Randall", "groups.housekeepingManager"],
  ["212", "facets.missingDndCard", "facets.missingDndCard", "facets.room", "facets.medium", "Jessica Scott", "groups.housekeepingManager"],
  ["115", "facets.tooCold", "facets.tooCold", "facets.room", "facets.medium", "Till Christoph", "groups.housekeepingManager"],
  ["112", "facets.badSmell", "facets.badSmell", "facets.bathroom", "facets.medium", "Jesse Sophia", "groups.housekeepingManager"],
  ["112", "facets.missingToiletPaper", "facets.missingToiletPaper", "facets.room", "facets.medium", "Jesse Sophia", "groups.housekeepingManager"],
  ["421", "facets.stainedCarpet", "facets.stainedCarpet", "facets.room", "facets.medium", "Kristine Jodie", "groups.housekeepingManager"],
]);

/** 19 repair records (the original screen listed a subset of these). */
export const REPAIR_RECORDS: AnalyticsRecord[] = toRecords("repair", [
  ["120", "facets.ac", "items.acNotCooling", "facets.hvac", "facets.high", "Dietmar Rudolf", "groups.maintenanceTechnicians"],
  ["220", "facets.mirror", "items.vanityMirrorBroken", "facets.bathroom", "facets.medium", "Jesse Sophia", "groups.housekeepingManager"],
  ["320", "facets.heating", "items.heatingRoomCold", "facets.hvac", "facets.high", "Chris Russell", "groups.receptionists"],
  ["308", "facets.wifi", "items.wifiCannotConnect", "facets.wifi", "facets.medium", "Lori Porter", "groups.frontOfficeManager"],
  ["315", "facets.tv", "items.tvNoSignal", "facets.electronics", "facets.high", "Pierrick Yves", "groups.housekeepers"],
  ["209", "facets.lightbulb", "items.lightbulbBlown", "facets.lighting", "facets.medium", "Wanda Jones", "groups.housekeepers", "Dietmar Rudolf"],
  ["308", "facets.wifi", "items.wifiRouterOffline", "facets.wifi", "facets.medium", "Serena Virgil", "groups.housekeepers", "Dietmar Rudolf"],
  ["414", "facets.ac", "items.acRemoteMissing", "facets.hvac", "facets.medium", "Lori Porter", "groups.frontOfficeManager"],
  ["413", "facets.shower", "items.showerDraining", "facets.plumbing", "facets.medium", "Alina Hampton", "groups.housekeepers"],
  ["409", "facets.doorLock", "items.doorLockJammed", "facets.furniture", "facets.high", "Chris Russell", "groups.receptionists", "Ben Hardy"],
  ["401", "facets.curtain", "items.curtainRailLoose", "facets.furniture", "facets.medium", "Emily Flores", "groups.housekeepers"],
  ["313", "facets.safe", "items.safeNotLocking", "facets.electronics", "facets.medium", "Lori Porter", "groups.frontOfficeManager"],
  ["312", "facets.kettle", "items.kettleBroken", "facets.electronics", "facets.medium", "Patricia Reed", "groups.housekeepers", "Ben Hardy"],
  ["302", "facets.faucet", "items.faucetDripping", "facets.plumbing", "facets.medium", "Wanda Jones", "groups.housekeepers"],
  ["218", "facets.window", "items.windowStuck", "facets.furniture", "facets.medium", "Jessica Scott", "groups.housekeepingManager"],
  ["213", "facets.tv", "items.tvRemoteMissing", "facets.electronics", "facets.medium", "Valorie Randall", "groups.housekeepingManager", "Dietmar Rudolf"],
  ["202", "facets.phone", "items.phoneNoDialTone", "facets.electronics", "facets.medium", "Serena Virgil", "groups.housekeepers"],
  ["112", "facets.balconyDoor", "items.balconyDoorSqueaks", "facets.furniture", "facets.medium", "Pierrick Yves", "groups.housekeepers"],
  ["105", "facets.toilet", "items.toiletRunning", "facets.plumbing", "facets.high", "Aaron Kasimira", "groups.housekeepers", "Ben Hardy"],
]);

/**
 * Converts quick-action tasks of one module ("maintenance" / "cleaning") into
 * analytics records so the dashboards reflect what was sent from room cards.
 */
export function tasksToRecords(tasks: Task[], module: string): AnalyticsRecord[] {
  return tasks
    .filter((task) => task.source === "quickAction" && task.module === module)
    .map((task) => ({
      id: `qa-${task.id}`,
      code: task.room != null ? String(task.room) : "-",
      title: task.title,
      room: task.room != null ? String(task.room) : "-",
      category: "facets.room",
      priority: `facets.${task.priority}`,
      createdBy: "Kristine",
      createdByGroup: "groups.housekeepingManager",
      completedBy: task.status === "done" ? "Kristine" : undefined,
      date: DEMO_DATE,
      fromQuickAction: true,
    }));
}

export type FacetField =
  | "code"
  | "category"
  | "priority"
  | "date"
  | "createdBy"
  | "createdByGroup"
  | "room"
  | "completed"
  | "completedBy";

/** Per-field selected values; values within a field OR, across fields AND. */
export type FacetFilters = Partial<Record<FacetField, string[]>>;

export function fieldValue(record: AnalyticsRecord, field: FacetField): string {
  switch (field) {
    case "code":
      return record.code;
    case "category":
      return record.category;
    case "priority":
      return record.priority;
    case "date":
      return record.date;
    case "createdBy":
      return record.createdBy;
    case "createdByGroup":
      return record.createdByGroup;
    case "room":
      return record.room;
    case "completed":
      return record.completedBy ? "common.completed" : "facets.uncompleted";
    case "completedBy":
      return record.completedBy ?? "facets.uncompleted";
  }
}

/**
 * Applies all facet filters; `exclude` leaves one field's own filter out so a
 * panel's counts react to the *other* panels only (typical BI behavior).
 */
export function applyFilters(
  records: AnalyticsRecord[],
  filters: FacetFilters,
  exclude?: FacetField,
): AnalyticsRecord[] {
  return records.filter((record) =>
    (Object.keys(filters) as FacetField[]).every((field) => {
      if (field === exclude) return true;
      const values = filters[field];
      return !values || values.length === 0 || values.includes(fieldValue(record, field));
    }),
  );
}

export interface FacetCount {
  value: string;
  count: number;
}

/** Distinct values of `field` with counts, descending, then alphabetical. */
export function facetCounts(
  records: AnalyticsRecord[],
  field: FacetField,
): FacetCount[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    const value = fieldValue(record, field);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export function toggleFilterValue(
  filters: FacetFilters,
  field: FacetField,
  value: string,
): FacetFilters {
  const current = filters[field] ?? [];
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
  const result = { ...filters };
  if (next.length === 0) delete result[field];
  else result[field] = next;
  return result;
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function downloadCsv(filename: string, headers: string[], rows: string[][]): void {
  const lines = [headers, ...rows].map((row) => row.map(csvEscape).join(","));
  // BOM so Excel opens the UTF-8 CSV (CJK labels) correctly.
  const blob = new Blob(["﻿" + lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
