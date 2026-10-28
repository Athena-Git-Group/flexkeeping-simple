/**
 * Seed data for the mock backend. Everything is generated once at module load
 * and then mutated in place by the repository layer, so the UI behaves like it
 * talks to a stateful server for the length of a session.
 */

import type {
  Assignment,
  Cleanup,
  ConsumptionItem,
  Facility,
  GuestFeedback,
  ID,
  LostAndFoundItem,
  Occupancy,
  Questionnaire,
  Realm,
  Reservation,
  Role,
  RoomCleanliness,
  Sector,
  Space,
  User,
  UserRole,
} from "@/domain/types";

export interface MockDB {
  facilities: Facility[];
  realms: Realm[];
  sectors: Sector[];
  spaces: Space[];
  cleanups: Cleanup[];
  assignments: Assignment[];
  lostAndFound: LostAndFoundItem[];
  questionnaires: Questionnaire[];
  feedback: GuestFeedback[];
  roles: Role[];
  users: User[];
  reservations: Reservation[];
  consumption: ConsumptionItem[];
}

const FACILITY_A = "fac-harbor";
const FACILITY_B = "fac-summit";

const facilities: Facility[] = [
  { id: FACILITY_A, name: "Harbor Grand Hotel", timezone: "Europe/Lisbon", isActive: true },
  { id: FACILITY_B, name: "Summit Resort & Spa", timezone: "America/Denver", isActive: true },
];

const roles: Role[] = [
  { id: "role-housekeeper", title: "Housekeeper", menuItems: ["housekeeping"] },
  {
    id: "role-supervisor",
    title: "Supervisor",
    menuItems: ["housekeeping", "room_allocation", "audits", "tasks"],
  },
  { id: "role-maintenance", title: "Maintenance", menuItems: ["tasks"] },
  {
    id: "role-front-desk",
    title: "Front desk",
    menuItems: ["guest_relations", "lost_found", "tasks"],
  },
  {
    id: "role-manager",
    title: "Manager",
    menuItems: [
      "dashboard",
      "housekeeping",
      "room_allocation",
      "tasks",
      "lost_found",
      "guest_relations",
      "audits",
      "settings",
    ],
  },
];

const roleIdByRole: Record<UserRole, string> = {
  housekeeper: "role-housekeeper",
  supervisor: "role-supervisor",
  maintenance: "role-maintenance",
  front_desk: "role-front-desk",
  manager: "role-manager",
};

const realms: Realm[] = [
  { id: "realm-a-main", facilityId: FACILITY_A, name: "Main Tower" },
  { id: "realm-a-annex", facilityId: FACILITY_A, name: "Garden Annex" },
  { id: "realm-b-lodge", facilityId: FACILITY_B, name: "Lodge" },
];

const sectors: Sector[] = [
  { id: "sec-a-3", realmId: "realm-a-main", name: "Floor 3", floor: 3 },
  { id: "sec-a-4", realmId: "realm-a-main", name: "Floor 4", floor: 4 },
  { id: "sec-a-g", realmId: "realm-a-annex", name: "Garden Level", floor: 1 },
  { id: "sec-b-2", realmId: "realm-b-lodge", name: "Floor 2", floor: 2 },
];

const sectorFacility: Record<string, string> = {
  "sec-a-3": FACILITY_A,
  "sec-a-4": FACILITY_A,
  "sec-a-g": FACILITY_A,
  "sec-b-2": FACILITY_B,
};

const cleanlinessCycle: RoomCleanliness[] = [
  "dirty",
  "stripped",
  "awaiting_inspection",
  "inspected",
  "do_not_disturb",
  "out_of_order",
];

const occupancyCycle: Occupancy[] = [
  "due_out",
  "stayover",
  "arrival",
  "arrived",
  "empty",
  "departed",
  "departure_tomorrow",
];

function makeSpaces(): Space[] {
  const spaces: Space[] = [];
  const layout: Array<{ sectorId: string; floor: number; count: number }> = [
    { sectorId: "sec-a-3", floor: 3, count: 14 },
    { sectorId: "sec-a-4", floor: 4, count: 16 },
    { sectorId: "sec-a-g", floor: 1, count: 12 },
    { sectorId: "sec-b-2", floor: 2, count: 14 },
  ];

  let seed = 7;
  const next = (mod: number) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed % mod;
  };

  for (const { sectorId, floor, count } of layout) {
    for (let i = 1; i <= count; i++) {
      const number = `${floor}${String(i).padStart(2, "0")}`;
      const cleanliness = cleanlinessCycle[next(cleanlinessCycle.length)];
      const occupancy = occupancyCycle[next(occupancyCycle.length)];
      spaces.push({
        id: `space-${sectorId}-${number}`,
        facilityId: sectorFacility[sectorId],
        sectorId,
        number,
        cleanliness,
        occupancy,
        isStayover: occupancy === "stayover",
        attributes: {
          linenChange: next(3) === 0,
          towelChange: next(3) === 0,
          eco: next(4) === 0,
          vip: next(6) === 0,
          guestDeclinedCleaning: next(8) === 0,
          minibarChecked: next(2) === 0,
        },
      });
    }
  }
  return spaces;
}

const spaces = makeSpaces();

interface UserSeed {
  id: ID;
  facilityId: ID;
  name: string;
  role: UserRole;
  onDutyToday: boolean;
  isActive?: boolean;
  visibleFacilityIds?: ID[];
  phone?: string;
}

function makeUser(seed: UserSeed): User {
  const username = seed.name.toLowerCase().replace(/\s+/g, ".");
  const visibleFacilityIds = seed.visibleFacilityIds ?? [seed.facilityId];
  return {
    id: seed.id,
    facilityId: seed.facilityId,
    name: seed.name,
    role: seed.role,
    onDutyToday: seed.onDutyToday,
    roleId: roleIdByRole[seed.role],
    isActive: seed.isActive ?? true,
    username,
    visibleFacilityIds,
    defaultFacilityId: seed.facilityId,
    phone: seed.phone,
  };
}

const users: User[] = [
  makeUser({ id: "u-ana", facilityId: FACILITY_A, name: "Ana Marques", role: "housekeeper", onDutyToday: true, phone: "+351 912 000 101" }),
  makeUser({ id: "u-bruno", facilityId: FACILITY_A, name: "Bruno Silva", role: "housekeeper", onDutyToday: true }),
  makeUser({ id: "u-carla", facilityId: FACILITY_A, name: "Carla Nunes", role: "housekeeper", onDutyToday: false, isActive: false }),
  makeUser({ id: "u-diego", facilityId: FACILITY_A, name: "Diego Alves", role: "housekeeper", onDutyToday: true }),
  makeUser({ id: "u-sofia", facilityId: FACILITY_A, name: "Sofia Reis", role: "supervisor", onDutyToday: true, phone: "+351 912 000 205" }),
  makeUser({ id: "u-marco", facilityId: FACILITY_A, name: "Marco Dias", role: "maintenance", onDutyToday: true }),
  makeUser({ id: "u-ines", facilityId: FACILITY_A, name: "Ines Costa", role: "front_desk", onDutyToday: true }),
  makeUser({ id: "u-rui", facilityId: FACILITY_A, name: "Rui Pereira", role: "manager", onDutyToday: true, visibleFacilityIds: [FACILITY_A, FACILITY_B], phone: "+351 912 000 900" }),
  makeUser({ id: "u-emma", facilityId: FACILITY_B, name: "Emma Johnson", role: "housekeeper", onDutyToday: true }),
  makeUser({ id: "u-liam", facilityId: FACILITY_B, name: "Liam Carter", role: "supervisor", onDutyToday: true }),
];

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const assignments: Assignment[] = [
  {
    id: "asg-1",
    facilityId: FACILITY_A,
    type: "repair",
    state: "submitted",
    priority: "urgent",
    title: "Leaking shower head",
    description: "Guest reports steady drip from the shower; floor getting wet.",
    spaceId: "space-sec-a-4-401",
    assigneeId: "u-marco",
    dueDate: daysFromNow(0),
    isOutsourced: false,
    reportedByGuest: true,
    isRepeating: false,
    attachments: [{ id: "att-1", kind: "photo", name: "shower.jpg" }],
    todoItems: [
      { id: "td-1", text: "Shut off water", done: true },
      { id: "td-2", text: "Replace cartridge", done: false },
    ],
    comments: [
      { id: "cm-1", authorId: "u-ines", text: "Guest called twice.", createdAt: daysFromNow(0) },
    ],
    createdAt: daysFromNow(0),
  },
  {
    id: "asg-2",
    facilityId: FACILITY_A,
    type: "task",
    state: "submitted",
    priority: "medium",
    title: "Extra towels to 302",
    spaceId: "space-sec-a-3-302",
    assigneeId: "u-ana",
    dueDate: daysFromNow(0),
    isOutsourced: false,
    reportedByGuest: true,
    isRepeating: false,
    attachments: [],
    todoItems: [],
    comments: [],
    createdAt: daysFromNow(0),
  },
  {
    id: "asg-3",
    facilityId: FACILITY_A,
    type: "flaw_cleaning",
    state: "on_hold",
    priority: "high",
    title: "Carpet stain not removed",
    description: "Reinspection failed; needs deep extraction.",
    spaceId: "space-sec-a-3-305",
    assigneeId: "u-bruno",
    dueDate: daysFromNow(1),
    isOutsourced: false,
    reportedByGuest: false,
    isRepeating: false,
    attachments: [],
    todoItems: [{ id: "td-3", text: "Book extraction machine", done: false }],
    comments: [],
    createdAt: daysFromNow(-1),
  },
  {
    id: "asg-4",
    facilityId: FACILITY_A,
    type: "repair",
    state: "fixed",
    priority: "medium",
    title: "AC remote not responding",
    spaceId: "space-sec-a-4-404",
    assigneeId: "u-marco",
    isOutsourced: false,
    reportedByGuest: false,
    isRepeating: false,
    attachments: [],
    todoItems: [],
    comments: [],
    createdAt: daysFromNow(-2),
  },
  {
    id: "asg-5",
    facilityId: FACILITY_A,
    type: "room_order",
    state: "submitted",
    priority: "high",
    title: "Room service — breakfast for 2",
    spaceId: "space-sec-a-3-308",
    assigneeId: "u-ines",
    dueDate: daysFromNow(0),
    isOutsourced: false,
    reportedByGuest: true,
    isRepeating: false,
    attachments: [],
    todoItems: [],
    comments: [],
    createdAt: daysFromNow(0),
  },
  {
    id: "asg-6",
    facilityId: FACILITY_A,
    type: "repair",
    state: "standby",
    priority: "low",
    title: "Repaint scuffed corridor wall",
    isOutsourced: true,
    reportedByGuest: false,
    isRepeating: false,
    attachments: [],
    todoItems: [],
    comments: [],
    createdAt: daysFromNow(-5),
  },
  {
    id: "asg-7",
    facilityId: FACILITY_A,
    type: "issue",
    state: "approved",
    priority: "medium",
    title: "Minibar fridge warm on floor 4",
    spaceId: "space-sec-a-4-407",
    assigneeId: "u-marco",
    isOutsourced: false,
    reportedByGuest: false,
    isRepeating: false,
    attachments: [],
    todoItems: [],
    comments: [],
    createdAt: daysFromNow(-3),
  },
  {
    id: "asg-8",
    facilityId: FACILITY_A,
    type: "task",
    state: "done",
    priority: "low",
    title: "Weekly deep clean — gym",
    assigneeId: "u-carla",
    isOutsourced: false,
    reportedByGuest: false,
    isRepeating: true,
    attachments: [],
    todoItems: [],
    comments: [],
    createdAt: daysFromNow(-7),
  },
  {
    id: "asg-9",
    facilityId: FACILITY_B,
    type: "repair",
    state: "submitted",
    priority: "urgent",
    title: "Elevator alarm intermittent",
    assigneeId: "u-liam",
    dueDate: daysFromNow(0),
    isOutsourced: true,
    reportedByGuest: false,
    isRepeating: false,
    attachments: [],
    todoItems: [],
    comments: [],
    createdAt: daysFromNow(0),
  },
];

const lostAndFound: LostAndFoundItem[] = [
  {
    id: "lf-1",
    facilityId: FACILITY_A,
    title: "Silver wristwatch",
    category: "Jewelry",
    state: "submitted",
    spaceId: "space-sec-a-3-303",
    storageLocation: "Safe box A",
    foundAt: daysFromNow(-1),
  },
  {
    id: "lf-2",
    facilityId: FACILITY_A,
    title: "Phone charger",
    category: "Electronics",
    state: "sent",
    spaceId: "space-sec-a-4-402",
    guestId: "guest-10",
    foundAt: daysFromNow(-3),
  },
  {
    id: "lf-3",
    facilityId: FACILITY_A,
    title: "Child's jacket",
    category: "Clothing",
    state: "returned",
    foundAt: daysFromNow(-10),
  },
  {
    id: "lf-4",
    facilityId: FACILITY_A,
    title: "Umbrella",
    category: "Other",
    state: "written_off",
    foundAt: daysFromNow(-40),
  },
  {
    id: "lf-5",
    facilityId: FACILITY_B,
    title: "Ski goggles",
    category: "Sports",
    state: "submitted",
    storageLocation: "Front desk drawer",
    foundAt: daysFromNow(-2),
  },
];

const questionnaires: Questionnaire[] = [
  {
    id: "q-1",
    facilityId: FACILITY_A,
    title: "Daily room inspection",
    openAuditCount: 4,
    questions: [
      { id: "qq-1", type: "checkbox", prompt: "Bed made to standard?" },
      { id: "qq-2", type: "checkbox", prompt: "Bathroom spotless?" },
      { id: "qq-3", type: "single_select", prompt: "Overall cleanliness", options: ["Excellent", "Acceptable", "Poor"] },
      { id: "qq-4", type: "text_multi", prompt: "Notes for the team" },
    ],
  },
  {
    id: "q-2",
    facilityId: FACILITY_A,
    title: "Monthly maintenance audit",
    openAuditCount: 1,
    questions: [
      { id: "qq-5", type: "number", prompt: "Water temperature (°C)" },
      { id: "qq-6", type: "multi_select", prompt: "Fixtures checked", options: ["Taps", "Lights", "AC", "TV"] },
      { id: "qq-7", type: "reference", prompt: "Fire safety sub-checklist" },
    ],
  },
  {
    id: "q-3",
    facilityId: FACILITY_B,
    title: "Public area walkthrough",
    openAuditCount: 2,
    questions: [
      { id: "qq-8", type: "checkbox", prompt: "Lobby floors clean?" },
      { id: "qq-9", type: "datetime", prompt: "Walkthrough completed at" },
    ],
  },
];

const feedback: GuestFeedback[] = [
  {
    id: "fb-1",
    facilityId: FACILITY_A,
    type: "complaint",
    title: "Noise from adjacent room all night",
    satisfaction: 1,
    severity: 4,
    responsibleDepartment: "Front desk",
    compensationItems: ["Late checkout", "Breakfast voucher"],
    resolved: false,
    createdAt: daysFromNow(-1),
  },
  {
    id: "fb-2",
    facilityId: FACILITY_A,
    type: "compliment",
    title: "Housekeeper went above and beyond",
    satisfaction: 4,
    severity: 1,
    responsibleDepartment: "Housekeeping",
    compensationItems: [],
    resolved: true,
    createdAt: daysFromNow(-2),
  },
  {
    id: "fb-3",
    facilityId: FACILITY_A,
    type: "complaint",
    title: "Cold food from room service",
    satisfaction: 2,
    severity: 3,
    responsibleDepartment: "F&B",
    compensationItems: ["Meal refund"],
    resolved: false,
    createdAt: daysFromNow(-3),
  },
  {
    id: "fb-4",
    facilityId: FACILITY_B,
    type: "complaint",
    title: "Slow check-in queue",
    satisfaction: 2,
    severity: 2,
    responsibleDepartment: "Front desk",
    compensationItems: [],
    resolved: false,
    createdAt: daysFromNow(-1),
  },
];

const reservations: Reservation[] = [
  {
    id: "res-1",
    facilityId: FACILITY_A,
    spaceId: "space-sec-a-3-302",
    guestId: "guest-1",
    guestName: "Oliver Bennett",
    checkIn: daysFromNow(-2),
    checkOut: daysFromNow(1),
    isVip: false,
  },
  {
    id: "res-2",
    facilityId: FACILITY_A,
    spaceId: "space-sec-a-4-401",
    guestId: "guest-2",
    guestName: "Mia Rossi",
    checkIn: daysFromNow(-1),
    checkOut: daysFromNow(0),
    isVip: true,
  },
];

const consumption: ConsumptionItem[] = [
  { id: "con-1", facilityId: FACILITY_A, spaceId: "space-sec-a-3-302", category: "minibar", name: "Sparkling water", quantity: 2, unitPrice: 3.5, reservationId: "res-1" },
  { id: "con-2", facilityId: FACILITY_A, spaceId: "space-sec-a-3-302", category: "minibar", name: "Peanuts", quantity: 1, unitPrice: 4.0, reservationId: "res-1" },
  { id: "con-3", facilityId: FACILITY_A, spaceId: "space-sec-a-4-401", category: "amenity", name: "Extra bathrobe", quantity: 1, unitPrice: 12.0 },
  { id: "con-4", facilityId: FACILITY_A, spaceId: "space-sec-a-4-401", category: "laundry", name: "Shirt press", quantity: 3, unitPrice: 6.0 },
];

const facilityAHousekeepers = ["u-ana", "u-bruno", "u-diego"];

const cleanups: Cleanup[] = spaces
  .filter((s) => s.cleanliness === "dirty" || s.cleanliness === "stripped")
  .map((s, i) => {
    // Two of every three cleans are handed to a housekeeper; the rest stay
    // unassigned so the allocation board has something to distribute.
    const assigned = i % 3 !== 2;
    const assigneeId = assigned
      ? s.facilityId === FACILITY_A
        ? facilityAHousekeepers[i % facilityAHousekeepers.length]
        : "u-emma"
      : undefined;
    return {
      id: `cl-${s.id}`,
      facilityId: s.facilityId,
      spaceId: s.id,
      type: i % 6 === 0 ? ("turndown" as const) : ("daily" as const),
      state: assigned && i % 4 === 0 ? ("in_progress" as const) : ("pending" as const),
      assigneeId,
    };
  });

export function buildMockDB(): MockDB {
  return {
    facilities,
    realms,
    sectors,
    spaces,
    cleanups,
    assignments,
    lostAndFound,
    questionnaires,
    feedback,
    roles,
    users,
    reservations,
    consumption,
  };
}
