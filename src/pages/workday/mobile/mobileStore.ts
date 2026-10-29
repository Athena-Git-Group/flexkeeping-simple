import { create } from "zustand";

export type FeedbackType = "negative" | "positive";

export interface FeedbackItem {
  id: string;
  /** i18n key under mobile.guest.items for seeded demo entries */
  titleKey?: string;
  /** Free-text title for user-created entries (never translated) */
  title?: string;
  note?: string;
  type: FeedbackType;
  resolved: boolean;
  mood: "sad" | "neutral";
  score: number;
}

export type InspectionVerdict = "pass" | "fail";

export interface InspectionDraft {
  results: Record<string, InspectionVerdict>;
  comment: string;
}

export interface ToastMessage {
  key: string;
  params?: Record<string, unknown>;
}

function seedFeedback(): FeedbackItem[] {
  return [
    { id: "f1", titleKey: "coldDish", type: "negative", resolved: false, mood: "sad", score: 2 },
    { id: "f2", titleKey: "wrongAmount", type: "negative", resolved: false, mood: "neutral", score: 3 },
    { id: "f3", titleKey: "loudMusic", type: "negative", resolved: true, mood: "neutral", score: 3 },
    { id: "f4", titleKey: "slowCheckIn", type: "negative", resolved: false, mood: "sad", score: 2 },
    { id: "f5", titleKey: "badBreakfast", type: "negative", resolved: true, mood: "sad", score: 2 },
    { id: "f6", titleKey: "greatSpa", type: "positive", resolved: true, mood: "neutral", score: 4 },
    { id: "f7", titleKey: "friendlyStaff", type: "positive", resolved: false, mood: "neutral", score: 5 },
  ];
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `mf-${Date.now().toString(36)}-${idCounter}`;
}

interface MobileStore {
  /** Room currently shown in the room-detail / repair / inspection screens */
  currentRoom: number;
  setCurrentRoom: (room: number) => void;

  /** Small toast shown on the room-detail screen after an action */
  toast: ToastMessage | null;
  showToast: (key: string, params?: Record<string, unknown>) => void;
  clearToast: () => void;

  feedback: FeedbackItem[];
  addFeedback: (item: Omit<FeedbackItem, "id">) => void;
  toggleResolved: (id: string) => void;

  /** Inspection drafts kept per room while the demo page is mounted */
  inspectionDrafts: Record<number, InspectionDraft>;
  saveInspectionDraft: (room: number, draft: InspectionDraft) => void;
  clearInspectionDraft: (room: number) => void;
}

export const useMobileStore = create<MobileStore>()((set) => ({
  currentRoom: 100,
  setCurrentRoom: (room) => set({ currentRoom: room }),

  toast: null,
  showToast: (key, params) => set({ toast: { key, params } }),
  clearToast: () => set({ toast: null }),

  feedback: seedFeedback(),
  addFeedback: (item) =>
    set((s) => ({ feedback: [{ ...item, id: nextId() }, ...s.feedback] })),
  toggleResolved: (id) =>
    set((s) => ({
      feedback: s.feedback.map((f) =>
        f.id === id ? { ...f, resolved: !f.resolved } : f,
      ),
    })),

  inspectionDrafts: {},
  saveInspectionDraft: (room, draft) =>
    set((s) => ({ inspectionDrafts: { ...s.inspectionDrafts, [room]: draft } })),
  clearInspectionDraft: (room) =>
    set((s) => {
      const next = { ...s.inspectionDrafts };
      delete next[room];
      return { inspectionDrafts: next };
    }),
}));
