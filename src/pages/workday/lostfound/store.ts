import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LostFoundStatus = "stored" | "returned" | "processed";

export type PublicArea = "lobby" | "restaurant" | "pool" | "gym";

/** 拾獲地點：房號或公共區域（公共區域走 i18n，房號直接顯示數字） */
export type LostFoundLocation =
  | { kind: "room"; room: number }
  | { kind: "area"; area: PublicArea };

export interface LostFoundItem {
  id: string;
  /** 物品名稱（demo 資料存繁中字串） */
  name: string;
  location: LostFoundLocation;
  /** 拾獲日期，ISO yyyy-mm-dd */
  foundDate: string;
  /** 拾獲人（housekeepers 之一） */
  foundBy: string;
  description?: string;
  status: LostFoundStatus;
  /** 已歸還時的領回人姓名 */
  returnedTo?: string;
}

/** demo 固定「今天」 */
export const LOSTFOUND_DEMO_TODAY = "2026-01-30";

type ItemSeed = [
  string,
  LostFoundLocation,
  string,
  string,
  LostFoundStatus,
  string?,
  string?,
];

const seeds: ItemSeed[] = [
  ["手錶", { kind: "room", room: 103 }, "2026-01-24", "Alina Hampton", "returned", "銀色金屬錶帶", "陳先生"],
  ["充電器", { kind: "room", room: 205 }, "2026-01-25", "Aaron Kasimira", "stored", "白色 USB-C 充電器"],
  ["墨鏡", { kind: "area", area: "pool" }, "2026-01-25", "Elizabeth Price", "stored", "黑框墨鏡，置於躺椅旁"],
  ["外套", { kind: "area", area: "restaurant" }, "2026-01-26", "Emily Flores", "returned", "深藍色西裝外套", "林小姐"],
  ["兒童玩具", { kind: "room", room: 302 }, "2026-01-27", "Patricia Reed", "stored", "小型絨毛熊"],
  ["耳機", { kind: "area", area: "gym" }, "2026-01-27", "Shelagh Blakely", "stored", "無線耳機單耳，跑步機旁拾獲"],
  ["書", { kind: "area", area: "lobby" }, "2026-01-28", "Serena Virgil", "processed", "平裝小說，無個人資訊"],
  ["雨傘", { kind: "room", room: 407 }, "2026-01-29", "Alina Hampton", "stored", "黑色摺疊傘"],
];

function createInitialItems(): LostFoundItem[] {
  return seeds.map(([name, location, foundDate, foundBy, status, description, returnedTo], i) => ({
    id: `LF-${String(i + 1).padStart(3, "0")}`,
    name,
    location,
    foundDate,
    foundBy,
    description,
    status,
    returnedTo,
  }));
}

export interface NewLostFoundItem {
  name: string;
  location: LostFoundLocation;
  foundDate: string;
  foundBy: string;
  description?: string;
}

interface LostFoundStore {
  items: LostFoundItem[];
  addItem: (item: NewLostFoundItem) => LostFoundItem;
  /** 改狀態；改為 returned 時帶領回人姓名 */
  setStatus: (id: string, status: LostFoundStatus, returnedTo?: string) => void;
  resetDemo: () => void;
}

export const useLostFoundStore = create<LostFoundStore>()(
  persist(
    (set, get) => ({
      items: createInitialItems(),

      addItem: (input) => {
        // 取現存最大序號而非 items.length：刪改或重設後仍保證編號不重複
        const maxSeq = get().items.reduce((max, item) => {
          const n = Number(item.id.replace("LF-", ""));
          return Number.isFinite(n) && n > max ? n : max;
        }, 0);
        const item: LostFoundItem = {
          id: `LF-${String(maxSeq + 1).padStart(3, "0")}`,
          ...input,
          status: "stored",
        };
        set((s) => ({ items: [item, ...s.items] }));
        return item;
      },

      setStatus: (id, status, returnedTo) =>
        set((s) => ({
          items: s.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status,
                  returnedTo: status === "returned" ? returnedTo : undefined,
                }
              : item,
          ),
        })),

      resetDemo: () => set({ items: createInitialItems() }),
    }),
    {
      name: "tms-workday-lostfound",
      version: 1,
      // demo prototype 不值得維護逐版 migration；schema 變了回到種子資料最不會壞
      migrate: () => ({ items: createInitialItems() }),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const PUBLIC_AREAS: PublicArea[] = ["lobby", "restaurant", "pool", "gym"];
