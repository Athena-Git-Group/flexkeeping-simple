import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ConversationKind = "dm" | "group";
export type OriginalLang = "en" | "ja";

export interface ChatMessage {
  id: string;
  sender: string;
  /**
   * Always the zh-TW display text — even for foreign-language messages — so the
   * UI never has to translate at render time; `originalText` being present is
   * what tells the UI to render the translated-message layout (original shown
   * in small gray text with a globe + language tag).
   */
  text: string;
  time: string;
  originalLang?: OriginalLang;
  originalText?: string;
  /** Demo has no real uploads, so an attachment is just a flag for a fake thumbnail card. */
  image?: boolean;
}

export interface Conversation {
  id: string;
  kind: ConversationKind;
  /** Counterpart name for DMs, group name for groups — one field keeps list rendering uniform. */
  name: string;
  members: string[];
  messages: ChatMessage[];
  unread: number;
}

export const CURRENT_USER = "Kristine";

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function msg(
  id: string,
  sender: string,
  text: string,
  time: string,
  extra?: Partial<ChatMessage>,
): ChatMessage {
  return { id, sender, text, time, ...extra };
}

// Seed data lives behind a factory (not a constant) because resetDemo and the
// persist migrate hook both need a fresh copy that later mutations can't share.
export function createInitialConversations(): Conversation[] {
  return [
    {
      id: "dm-elizabeth",
      kind: "dm",
      name: "Elizabeth Price",
      members: [CURRENT_USER, "Elizabeth Price"],
      unread: 2,
      messages: [
        msg("m-e1", "Elizabeth Price", "房 204 需要加毛巾，客人在等。", "08:52"),
        msg("m-e2", CURRENT_USER, "收到，我 10 分鐘後到。", "08:54"),
        msg("m-e3", "Elizabeth Price", "謝謝！另外 206 的迷你吧也要補。", "08:55"),
        msg("m-e4", CURRENT_USER, "好，我一起處理。", "08:57"),
        msg("m-e5", "Elizabeth Price", "204 已送達，客人說沒問題了。", "09:21"),
        msg("m-e6", "Elizabeth Price", "午休前記得回報樓層狀態喔。", "09:22"),
      ],
    },
    {
      id: "dm-aaron",
      kind: "dm",
      name: "Aaron Kasimira",
      members: [CURRENT_USER, "Aaron Kasimira"],
      unread: 1,
      messages: [
        msg("m-a1", CURRENT_USER, "Aaron，3 樓布巾車的毛巾快用完了。", "09:02"),
        msg("m-a2", "Aaron Kasimira", "我已經把 3 樓布巾車補滿了。", "09:05", {
          originalLang: "en",
          originalText: "I've restocked the linen cart on floor 3.",
        }),
        msg("m-a3", CURRENT_USER, "太好了，謝謝。301 退房清潔先做。", "09:06"),
        msg("m-a4", "Aaron Kasimira", "301 完成了，接著做 303 嗎？", "09:32", {
          originalLang: "en",
          originalText: "Room 301 is done. Should I take 303 next?",
        }),
      ],
    },
    {
      id: "dm-emily",
      kind: "dm",
      name: "Emily Flores",
      members: [CURRENT_USER, "Emily Flores"],
      unread: 0,
      messages: [
        msg("m-f1", "Emily Flores", "房 405 浴室的水龍頭好像在漏水。", "08:31"),
        msg("m-f2", "Emily Flores", "我拍了照片給你看。", "08:32", { image: true }),
        msg("m-f3", CURRENT_USER, "看起來要報修，我開一張維修單。", "08:35"),
        msg("m-f4", "Emily Flores", "好的，房間我先掛出整修中。", "08:36"),
        msg("m-f5", CURRENT_USER, "維修單已建立，工程部今天會處理。", "08:41"),
      ],
    },
    {
      id: "group-morning",
      kind: "group",
      name: "早班房務",
      members: [CURRENT_USER, "Alina Hampton", "Elizabeth Price", "Emily Flores"],
      unread: 3,
      messages: [
        msg("m-g1", CURRENT_USER, "早安！今天早班 13 間房，名單已派好。", "08:05"),
        msg("m-g2", "Alina Hampton", "收到，我先從 100 開始。", "08:07"),
        msg("m-g3", "Emily Flores", "請協助房 204 加送毛巾。", "08:48", {
          originalLang: "ja",
          originalText: "204号室にタオルの追加をお願いします。",
        }),
        msg("m-g4", "Elizabeth Price", "我離 204 最近，我去送。", "08:50"),
        msg("m-g5", CURRENT_USER, "辛苦了！VIP 房 201 要在 12:00 前完成檢查。", "09:10"),
        msg("m-g6", "Alina Hampton", "100 清潔完成，等待檢查。", "09:35"),
      ],
    },
    {
      id: "group-repairs",
      kind: "group",
      name: "維修協調",
      members: [CURRENT_USER, "Aaron Kasimira", "Patricia Reed"],
      unread: 0,
      messages: [
        msg("m-r1", "Patricia Reed", "房 120 冷氣不冷，已經回報工程部。", "09:12"),
        msg("m-r2", CURRENT_USER, "好，客人下午 3 點回來，要在那之前修好。", "09:14"),
        msg("m-r3", "Aaron Kasimira", "維修人員 20 分鐘後到 120。", "09:18", {
          originalLang: "en",
          originalText: "The technician will be at room 120 in 20 minutes.",
        }),
        msg("m-r4", "Patricia Reed", "收到，我在現場等。", "09:19"),
      ],
    },
  ];
}

interface ChatStore {
  conversations: Conversation[];
  /**
   * Shared between the desktop page and the mobile demo so a selection made on
   * one surface carries over to the other; deliberately NOT persisted (see
   * partialize) so a reload starts on the list, not inside a stale room.
   */
  activeId: string | null;
  setActive: (id: string | null) => void;
  sendMessage: (conversationId: string, text: string) => void;
  markRead: (conversationId: string) => void;
  createConversation: (kind: ConversationKind, name: string, members: string[]) => string;
  resetDemo: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: createInitialConversations(),
      activeId: null,

      setActive: (id) => set({ activeId: id }),

      sendMessage: (conversationId, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const message = msg(nextId("m"), CURRENT_USER, trimmed, nowTime());
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c,
          ),
        }));
      },

      markRead: (conversationId) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId && c.unread > 0 ? { ...c, unread: 0 } : c,
          ),
        })),

      createConversation: (kind, name, members) => {
        // A second DM with the same person would split the thread, so reuse it.
        if (kind === "dm") {
          const existing = get().conversations.find(
            (c) => c.kind === "dm" && c.name === name,
          );
          if (existing) return existing.id;
        }
        const id = nextId(kind);
        const conversation: Conversation = {
          id,
          kind,
          name,
          members: [CURRENT_USER, ...members.filter((m) => m !== CURRENT_USER)],
          messages: [],
          unread: 0,
        };
        set((s) => ({ conversations: [conversation, ...s.conversations] }));
        return id;
      },

      resetDemo: () =>
        set({ conversations: createInitialConversations(), activeId: null }),
    }),
    {
      name: "tms-workday-chat",
      version: 1,
      // Old/unknown persisted shapes are discarded in favor of fresh demo data.
      migrate: () => ({ conversations: createInitialConversations() }),
      partialize: (state) => ({ conversations: state.conversations }),
    },
  ),
);

export function totalUnread(conversations: Conversation[]): number {
  return conversations.reduce((sum, c) => sum + c.unread, 0);
}
