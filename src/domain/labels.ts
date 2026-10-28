/**
 * Enum display strings, resolved through i18n. `useLabels()` returns one record
 * per enum whose values come from the active locale, so switching language
 * re-renders every caller. Keys match the domain values exactly.
 */

import { useTranslation } from "react-i18next";
import type {
  AssignmentState,
  AssignmentType,
  CleanupState,
  CleanupType,
  ConsumptionCategory,
  FeedbackType,
  LostAndFoundState,
  Occupancy,
  Priority,
  QuestionType,
  RoomCleanliness,
  UserRole,
} from "./types";

const ROOM_CLEANLINESS: readonly RoomCleanliness[] = [
  "dirty",
  "stripped",
  "awaiting_inspection",
  "inspected",
  "out_of_order",
  "do_not_disturb",
];

const OCCUPANCY: readonly Occupancy[] = [
  "empty",
  "arrival",
  "arrived",
  "stayover",
  "due_out",
  "departed",
  "departure_tomorrow",
];

const CLEANUP_STATE: readonly CleanupState[] = [
  "pending",
  "in_progress",
  "on_pause",
  "completed",
  "inspection_approved",
  "cancelled",
];

const CLEANUP_TYPE: readonly CleanupType[] = ["daily", "turndown"];

const ASSIGNMENT_TYPE: readonly AssignmentType[] = [
  "task",
  "repair",
  "issue",
  "flaw_cleaning",
  "room_order",
];

const ASSIGNMENT_STATE: readonly AssignmentState[] = [
  "submitted",
  "fixed",
  "approved",
  "done",
  "archived",
  "cancelled",
  "on_hold",
  "standby",
];

const PRIORITY: readonly Priority[] = ["low", "medium", "high", "urgent"];

const LOST_AND_FOUND_STATE: readonly LostAndFoundState[] = [
  "submitted",
  "sent",
  "returned",
  "archived",
  "written_off",
];

const QUESTION_TYPE: readonly QuestionType[] = [
  "checkbox",
  "number",
  "date",
  "time",
  "datetime",
  "text_single",
  "text_multi",
  "single_select",
  "multi_select",
  "reference",
];

const FEEDBACK_TYPE: readonly FeedbackType[] = ["compliment", "complaint"];

const USER_ROLE: readonly UserRole[] = [
  "housekeeper",
  "supervisor",
  "maintenance",
  "front_desk",
  "manager",
];

const CONSUMPTION_CATEGORY: readonly ConsumptionCategory[] = [
  "minibar",
  "amenity",
  "laundry",
];

const SATISFACTION: readonly number[] = [0, 1, 2, 3, 4];

export interface Labels {
  roomCleanliness: Record<RoomCleanliness, string>;
  occupancy: Record<Occupancy, string>;
  cleanupState: Record<CleanupState, string>;
  cleanupType: Record<CleanupType, string>;
  assignmentType: Record<AssignmentType, string>;
  assignmentState: Record<AssignmentState, string>;
  priority: Record<Priority, string>;
  lostAndFoundState: Record<LostAndFoundState, string>;
  questionType: Record<QuestionType, string>;
  feedbackType: Record<FeedbackType, string>;
  userRole: Record<UserRole, string>;
  consumptionCategory: Record<ConsumptionCategory, string>;
  satisfaction: Record<number, string>;
}

export function useLabels(): Labels {
  const { t } = useTranslation();

  const record = <K extends string | number>(
    group: string,
    keys: readonly K[],
  ): Record<K, string> => {
    const out = {} as Record<K, string>;
    for (const key of keys) {
      out[key] = t(`enums.${group}.${key}`);
    }
    return out;
  };

  return {
    roomCleanliness: record("roomCleanliness", ROOM_CLEANLINESS),
    occupancy: record("occupancy", OCCUPANCY),
    cleanupState: record("cleanupState", CLEANUP_STATE),
    cleanupType: record("cleanupType", CLEANUP_TYPE),
    assignmentType: record("assignmentType", ASSIGNMENT_TYPE),
    assignmentState: record("assignmentState", ASSIGNMENT_STATE),
    priority: record("priority", PRIORITY),
    lostAndFoundState: record("lostAndFoundState", LOST_AND_FOUND_STATE),
    questionType: record("questionType", QUESTION_TYPE),
    feedbackType: record("feedbackType", FEEDBACK_TYPE),
    userRole: record("userRole", USER_ROLE),
    consumptionCategory: record("consumptionCategory", CONSUMPTION_CATEGORY),
    satisfaction: record("satisfaction", SATISFACTION),
  };
}
