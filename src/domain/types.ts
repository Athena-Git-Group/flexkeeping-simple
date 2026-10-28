/**
 * TMS domain model.
 *
 * Enum values come from a real hotel task-management system, but names here are
 * clean and honest: a value means what it says. (The source product deliberately
 * mislabels some states in its UI; we do not carry that over.)
 *
 * Property hierarchy: Facility -> Realm -> Sector -> Space.
 */

export type ID = string;

export interface Facility {
  id: ID;
  name: string;
  timezone: string;
  isActive: boolean;
}

/**
 * The modules a role can reveal. This is the whole permission surface: a role is
 * the set of modules it lets a user see, nothing finer.
 */
export type ModuleKey =
  | "dashboard"
  | "housekeeping"
  | "room_allocation"
  | "tasks"
  | "lost_found"
  | "guest_relations"
  | "audits"
  | "settings";

/**
 * A role (the source product calls it a user_group). It carries no permission
 * matrix: `menuItems` alone decides which modules a user holding this role sees.
 *
 * Future extensions, deliberately out of scope here: per-facility group flags
 * (who may cancel work, who sees outsourced work), per-role workflow-state
 * overrides for each assignment type, and per-questionnaire access control.
 */
export interface Role {
  id: ID;
  title: string;
  menuItems: ModuleKey[];
}

/** A building or zone within a facility. */
export interface Realm {
  id: ID;
  facilityId: ID;
  name: string;
}

/** A floor or wing within a realm. */
export interface Sector {
  id: ID;
  realmId: ID;
  name: string;
  floor: number;
}

export type RoomCleanliness =
  | "dirty"
  | "stripped"
  | "awaiting_inspection"
  | "inspected"
  | "out_of_order"
  | "do_not_disturb";

export type Occupancy =
  | "empty"
  | "arrival"
  | "arrived"
  | "stayover"
  | "due_out"
  | "departed"
  | "departure_tomorrow";

/** Per-space flags that drive card chips and filters. */
export interface SpaceAttributes {
  linenChange: boolean;
  towelChange: boolean;
  eco: boolean;
  vip: boolean;
  guestDeclinedCleaning: boolean;
  minibarChecked: boolean;
}

export interface Space {
  id: ID;
  facilityId: ID;
  sectorId: ID;
  /** Guest-facing room number, e.g. "402". */
  number: string;
  cleanliness: RoomCleanliness;
  occupancy: Occupancy;
  /** Guest is staying another night; modifies how cleanliness is read. */
  isStayover: boolean;
  attributes: SpaceAttributes;
}

export type CleanupState =
  | "pending"
  | "in_progress"
  | "on_pause"
  | "completed"
  | "inspection_approved"
  | "cancelled";

export type CleanupType = "daily" | "turndown";

/** A single cleaning job carried out on a space. */
export interface Cleanup {
  id: ID;
  facilityId: ID;
  spaceId: ID;
  type: CleanupType;
  state: CleanupState;
  assigneeId?: ID;
  startedAt?: string;
  completedAt?: string;
}

export type AssignmentType =
  | "task"
  | "repair"
  | "issue"
  | "flaw_cleaning"
  | "room_order";

export type AssignmentState =
  | "submitted"
  | "fixed"
  | "approved"
  | "done"
  | "archived"
  | "cancelled"
  | "on_hold"
  | "standby";

export type Priority = "low" | "medium" | "high" | "urgent";

export interface TodoItem {
  id: ID;
  text: string;
  done: boolean;
}

export interface Comment {
  id: ID;
  authorId: ID;
  text: string;
  createdAt: string;
}

export interface Attachment {
  id: ID;
  kind: "photo" | "video";
  name: string;
}

/** The unified work item: tasks, repairs, issues, cleaning flaws, room orders. */
export interface Assignment {
  id: ID;
  facilityId: ID;
  type: AssignmentType;
  state: AssignmentState;
  priority: Priority;
  title: string;
  description?: string;
  spaceId?: ID;
  guestId?: ID;
  assigneeId?: ID;
  dueDate?: string;
  isOutsourced: boolean;
  reportedByGuest: boolean;
  isRepeating: boolean;
  attachments: Attachment[];
  todoItems: TodoItem[];
  comments: Comment[];
  createdAt: string;
}

export type LostAndFoundState =
  | "submitted"
  | "sent"
  | "returned"
  | "archived"
  | "written_off";

export interface LostAndFoundItem {
  id: ID;
  facilityId: ID;
  title: string;
  category: string;
  state: LostAndFoundState;
  spaceId?: ID;
  guestId?: ID;
  storageLocation?: string;
  foundAt: string;
}

export type QuestionType =
  | "checkbox"
  | "number"
  | "date"
  | "time"
  | "datetime"
  | "text_single"
  | "text_multi"
  | "single_select"
  | "multi_select"
  | "reference";

export interface Question {
  id: ID;
  type: QuestionType;
  prompt: string;
  options?: string[];
}

export interface Questionnaire {
  id: ID;
  facilityId: ID;
  title: string;
  questions: Question[];
  /** How many audit runs are still open against this questionnaire. */
  openAuditCount: number;
}

export type FeedbackType = "compliment" | "complaint";

export interface GuestFeedback {
  id: ID;
  facilityId: ID;
  type: FeedbackType;
  title: string;
  /** Guest satisfaction, 0 (angry) .. 4 (happy). */
  satisfaction: 0 | 1 | 2 | 3 | 4;
  /** Severity, 1 (minor) .. 5 (critical). */
  severity: 1 | 2 | 3 | 4 | 5;
  responsibleDepartment: string;
  compensationItems: string[];
  guestId?: ID;
  resolved: boolean;
  createdAt: string;
}

export type UserRole =
  | "housekeeper"
  | "supervisor"
  | "maintenance"
  | "front_desk"
  | "manager";

export interface User {
  id: ID;
  facilityId: ID;
  name: string;
  role: UserRole;
  onDutyToday: boolean;
  roleId: ID;
  isActive: boolean;
  username: string;
  /** Facilities this user may open and switch between. */
  visibleFacilityIds: ID[];
  /** Facility opened by default; always one of `visibleFacilityIds`. */
  defaultFacilityId: ID;
  phone?: string;
}

export interface Reservation {
  id: ID;
  facilityId: ID;
  spaceId: ID;
  guestId: ID;
  guestName: string;
  checkIn: string;
  checkOut: string;
  isVip: boolean;
}

export type ConsumptionCategory = "minibar" | "amenity" | "laundry";

export interface ConsumptionItem {
  id: ID;
  facilityId: ID;
  spaceId: ID;
  category: ConsumptionCategory;
  name: string;
  quantity: number;
  unitPrice: number;
  reservationId?: ID;
}
