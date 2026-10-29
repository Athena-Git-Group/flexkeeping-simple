import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationType = "task" | "repair" | "urgent" | "system";

export interface ShellNotification {
  id: string;
  type: NotificationType;
  /** i18n key suffix under workday.shell.* — demo content is translated */
  titleKey: string;
  detailKey: string;
  /** Time is a demo display string ("09:41" / "yesterday"), also keyed */
  timeKey: string;
  read: boolean;
}

function seedNotifications(): ShellNotification[] {
  return [
    { id: "n1", type: "urgent", titleKey: "notif1Title", detailKey: "notif1Detail", timeKey: "notif1Time", read: false },
    { id: "n2", type: "repair", titleKey: "notif2Title", detailKey: "notif2Detail", timeKey: "notif2Time", read: false },
    { id: "n3", type: "task", titleKey: "notif3Title", detailKey: "notif3Detail", timeKey: "notif3Time", read: false },
    { id: "n4", type: "task", titleKey: "notif4Title", detailKey: "notif4Detail", timeKey: "notif4Time", read: false },
    { id: "n5", type: "repair", titleKey: "notif5Title", detailKey: "notif5Detail", timeKey: "notif5Time", read: false },
    { id: "n6", type: "system", titleKey: "notif6Title", detailKey: "notif6Detail", timeKey: "notif6Time", read: false },
    { id: "n7", type: "task", titleKey: "notif7Title", detailKey: "notif7Detail", timeKey: "notif7Time", read: true },
    { id: "n8", type: "urgent", titleKey: "notif8Title", detailKey: "notif8Detail", timeKey: "notif8Time", read: true },
    { id: "n9", type: "task", titleKey: "notif9Title", detailKey: "notif9Detail", timeKey: "notif9Time", read: true },
    { id: "n10", type: "system", titleKey: "notif10Title", detailKey: "notif10Detail", timeKey: "notif10Time", read: true },
  ];
}

interface NotificationsStore {
  notifications: ShellNotification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationsStore = create<NotificationsStore>()(
  persist(
    (set) => ({
      notifications: seedNotifications(),

      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.read ? n : { ...n, read: true },
          ),
        })),
    }),
    {
      name: "tms-workday-notifications",
      version: 1,
      // Old/unknown persisted shapes are discarded in favor of fresh demo data.
      migrate: () => ({ notifications: seedNotifications() }),
      partialize: (state) => ({ notifications: state.notifications }),
    },
  ),
);

export interface SeedActivity {
  id: string;
  /** i18n key suffix under workday.shell.* — bold actor/source name */
  actorKey: string;
  textKey: string;
  timeKey: string;
}

export const SEED_ACTIVITIES: SeedActivity[] = [
  { id: "a1", actorKey: "act1Actor", textKey: "act1Text", timeKey: "act1Time" },
  { id: "a2", actorKey: "act2Actor", textKey: "act2Text", timeKey: "act2Time" },
  { id: "a3", actorKey: "act3Actor", textKey: "act3Text", timeKey: "act3Time" },
  { id: "a4", actorKey: "act4Actor", textKey: "act4Text", timeKey: "act4Time" },
  { id: "a5", actorKey: "act5Actor", textKey: "act5Text", timeKey: "act5Time" },
  { id: "a6", actorKey: "act6Actor", textKey: "act6Text", timeKey: "act6Time" },
  { id: "a7", actorKey: "act7Actor", textKey: "act7Text", timeKey: "act7Time" },
  { id: "a8", actorKey: "act8Actor", textKey: "act8Text", timeKey: "act8Time" },
];

// Seed activities are a fixed module-level list, so the store only tracks what
// was cleared: clearing hides the seeds and remembers which quickAction task
// ids were seen — new quickAction tasks re-accumulate in the badge afterwards.
interface ActivityStore {
  seedsCleared: boolean;
  clearedQuickActionIds: string[];
  clear: (quickActionIds: string[]) => void;
}

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set) => ({
      seedsCleared: false,
      clearedQuickActionIds: [],

      clear: (quickActionIds) =>
        set((s) => ({
          seedsCleared: true,
          clearedQuickActionIds: Array.from(
            new Set([...s.clearedQuickActionIds, ...quickActionIds]),
          ),
        })),
    }),
    {
      name: "tms-workday-activity",
      version: 1,
      migrate: () => ({ seedsCleared: false, clearedQuickActionIds: [] }),
      partialize: (state) => ({
        seedsCleared: state.seedsCleared,
        clearedQuickActionIds: state.clearedQuickActionIds,
      }),
    },
  ),
);
