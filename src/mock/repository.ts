/**
 * Mock repository. Every method returns a Promise with a small artificial delay,
 * so the UI exercises real loading/async paths. This whole module is the seam to
 * replace with a real API client: keep the method signatures, swap the bodies.
 */

import { buildMockDB, type MockDB } from "./data";
import type {
  Assignment,
  AssignmentState,
  AssignmentType,
  Cleanup,
  ConsumptionItem,
  Facility,
  GuestFeedback,
  ID,
  LostAndFoundItem,
  ModuleKey,
  Priority,
  Questionnaire,
  Realm,
  Reservation,
  Role,
  RoomCleanliness,
  Sector,
  Space,
  User,
} from "@/domain/types";

const db: MockDB = buildMockDB();

const LATENCY_MS = 180;

function settle<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(value)), LATENCY_MS);
  });
}

function byFacility<T extends { facilityId: ID }>(rows: T[], facilityId: ID): T[] {
  return rows.filter((r) => r.facilityId === facilityId);
}

export const facilityRepository = {
  list(): Promise<Facility[]> {
    return settle(db.facilities);
  },

  setActive(id: ID, isActive: boolean): Promise<Facility> {
    const row = db.facilities.find((f) => f.id === id);
    if (!row) return Promise.reject(new Error(`Unknown facility ${id}`));
    row.isActive = isActive;
    return settle(row);
  },
};

export const realmRepository = {
  list(): Promise<Realm[]> {
    return settle(db.realms);
  },
};

export interface SpaceFilter {
  cleanliness?: RoomCleanliness;
  sectorId?: ID;
}

export const spaceRepository = {
  list(facilityId: ID, filter: SpaceFilter = {}): Promise<Space[]> {
    let rows = byFacility(db.spaces, facilityId);
    if (filter.cleanliness) rows = rows.filter((s) => s.cleanliness === filter.cleanliness);
    if (filter.sectorId) rows = rows.filter((s) => s.sectorId === filter.sectorId);
    return settle(rows);
  },

  get(id: ID): Promise<Space | undefined> {
    return settle(db.spaces.find((s) => s.id === id));
  },

  setCleanliness(id: ID, cleanliness: RoomCleanliness): Promise<Space> {
    const space = db.spaces.find((s) => s.id === id);
    if (!space) return Promise.reject(new Error(`Unknown space ${id}`));
    space.cleanliness = cleanliness;
    return settle(space);
  },

  /** Room count per sector, used by the property-structure tree. */
  countsBySector(): Promise<Record<ID, number>> {
    const counts: Record<ID, number> = {};
    for (const s of db.spaces) {
      counts[s.sectorId] = (counts[s.sectorId] ?? 0) + 1;
    }
    return settle(counts);
  },
};

export const sectorRepository = {
  list(): Promise<Sector[]> {
    return settle(db.sectors);
  },

  listByFacility(facilityId: ID): Promise<Sector[]> {
    const realmIds = new Set(
      db.realms.filter((r) => r.facilityId === facilityId).map((r) => r.id),
    );
    return settle(db.sectors.filter((s) => realmIds.has(s.realmId)));
  },
};

export interface AssignmentFilter {
  type?: AssignmentType;
  state?: AssignmentState;
  priority?: Priority;
}

export interface AssignmentCreateInput {
  facilityId: ID;
  type: AssignmentType;
  title: string;
  description?: string;
  spaceId?: ID;
  priority: Priority;
  reportedByGuest: boolean;
}

export const assignmentRepository = {
  list(facilityId: ID, filter: AssignmentFilter = {}): Promise<Assignment[]> {
    let rows = byFacility(db.assignments, facilityId);
    if (filter.type) rows = rows.filter((a) => a.type === filter.type);
    if (filter.state) rows = rows.filter((a) => a.state === filter.state);
    if (filter.priority) rows = rows.filter((a) => a.priority === filter.priority);
    return settle(rows);
  },

  get(id: ID): Promise<Assignment | undefined> {
    return settle(db.assignments.find((a) => a.id === id));
  },

  create(input: AssignmentCreateInput): Promise<Assignment> {
    const row: Assignment = {
      id: `asg-${Date.now()}`,
      facilityId: input.facilityId,
      type: input.type,
      state: "submitted",
      priority: input.priority,
      title: input.title,
      description: input.description,
      spaceId: input.spaceId,
      assigneeId: undefined,
      dueDate: undefined,
      isOutsourced: false,
      reportedByGuest: input.reportedByGuest,
      isRepeating: false,
      attachments: [],
      todoItems: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };
    db.assignments.push(row);
    return settle(row);
  },

  setState(id: ID, state: AssignmentState): Promise<Assignment> {
    const row = db.assignments.find((a) => a.id === id);
    if (!row) return Promise.reject(new Error(`Unknown assignment ${id}`));
    row.state = state;
    return settle(row);
  },

  toggleTodo(assignmentId: ID, todoId: ID): Promise<Assignment> {
    const row = db.assignments.find((a) => a.id === assignmentId);
    if (!row) return Promise.reject(new Error(`Unknown assignment ${assignmentId}`));
    const todo = row.todoItems.find((t) => t.id === todoId);
    if (todo) todo.done = !todo.done;
    return settle(row);
  },
};

export const roleRepository = {
  list(): Promise<Role[]> {
    return settle(db.roles);
  },

  get(id: ID): Promise<Role | undefined> {
    return settle(db.roles.find((r) => r.id === id));
  },

  create(title: string): Promise<Role> {
    const role: Role = { id: `role-${Date.now()}`, title, menuItems: [] };
    db.roles.push(role);
    return settle(role);
  },

  update(id: ID, patch: { title?: string; menuItems?: ModuleKey[] }): Promise<Role> {
    const row = db.roles.find((r) => r.id === id);
    if (!row) return Promise.reject(new Error(`Unknown role ${id}`));
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.menuItems !== undefined) row.menuItems = patch.menuItems;
    return settle(row);
  },
};

export interface UserPatch {
  roleId?: ID;
  isActive?: boolean;
  visibleFacilityIds?: ID[];
  defaultFacilityId?: ID;
}

export const userRepository = {
  list(): Promise<User[]> {
    return settle(db.users);
  },

  listByFacility(facilityId: ID): Promise<User[]> {
    return settle(byFacility(db.users, facilityId));
  },

  update(id: ID, patch: UserPatch): Promise<User> {
    const row = db.users.find((u) => u.id === id);
    if (!row) return Promise.reject(new Error(`Unknown user ${id}`));
    if (patch.roleId !== undefined) row.roleId = patch.roleId;
    if (patch.isActive !== undefined) row.isActive = patch.isActive;
    if (patch.visibleFacilityIds !== undefined) {
      row.visibleFacilityIds = patch.visibleFacilityIds;
      if (!row.visibleFacilityIds.includes(row.defaultFacilityId)) {
        row.defaultFacilityId = row.visibleFacilityIds[0] ?? row.defaultFacilityId;
      }
    }
    if (patch.defaultFacilityId !== undefined) row.defaultFacilityId = patch.defaultFacilityId;
    return settle(row);
  },
};

export const cleanupRepository = {
  listByFacility(facilityId: ID): Promise<Cleanup[]> {
    return settle(byFacility(db.cleanups, facilityId));
  },

  /** Cleans handed to one housekeeper within a facility. */
  listByAssignee(facilityId: ID, assigneeId: ID): Promise<Cleanup[]> {
    return settle(
      byFacility(db.cleanups, facilityId).filter((c) => c.assigneeId === assigneeId),
    );
  },

  /** Assign one housekeeper to a set of pending spaces. */
  assign(spaceIds: ID[], assigneeId: ID): Promise<Cleanup[]> {
    for (const sid of spaceIds) {
      const existing = db.cleanups.find((c) => c.spaceId === sid);
      if (existing) {
        existing.assigneeId = assigneeId;
      } else {
        const space = db.spaces.find((s) => s.id === sid);
        if (!space) continue;
        db.cleanups.push({
          id: `cl-${sid}`,
          facilityId: space.facilityId,
          spaceId: sid,
          type: "daily",
          state: "pending",
          assigneeId,
        });
      }
    }
    return settle(db.cleanups);
  },

  clearAssignments(facilityId: ID): Promise<Cleanup[]> {
    for (const c of db.cleanups) {
      if (c.facilityId === facilityId && c.state === "pending") c.assigneeId = undefined;
    }
    return settle(byFacility(db.cleanups, facilityId));
  },
};

export const lostAndFoundRepository = {
  listByFacility(facilityId: ID): Promise<LostAndFoundItem[]> {
    return settle(byFacility(db.lostAndFound, facilityId));
  },
};

export const questionnaireRepository = {
  listByFacility(facilityId: ID): Promise<Questionnaire[]> {
    return settle(byFacility(db.questionnaires, facilityId));
  },
};

export const feedbackRepository = {
  listByFacility(facilityId: ID): Promise<GuestFeedback[]> {
    return settle(byFacility(db.feedback, facilityId));
  },
};

export const reservationRepository = {
  listByFacility(facilityId: ID): Promise<Reservation[]> {
    return settle(byFacility(db.reservations, facilityId));
  },
};

export const consumptionRepository = {
  listBySpace(spaceId: ID): Promise<ConsumptionItem[]> {
    return settle(db.consumption.filter((c) => c.spaceId === spaceId));
  },
};
