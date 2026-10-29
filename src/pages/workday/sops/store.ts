import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SopCategory = "rooms" | "public" | "frontdesk" | "safety";

export const SOP_CATEGORIES: SopCategory[] = [
  "rooms",
  "public",
  "frontdesk",
  "safety",
];

export interface SopStep {
  title: string;
  description: string;
}

export interface Sop {
  id: string;
  title: string;
  category: SopCategory;
  version: string;
  updatedAt: string; // ISO date, e.g. "2026-09-12"
  steps: SopStep[];
  /** Names of related checklist templates (display only; link goes to /checklists). */
  relatedChecklists: string[];
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `sop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Demo SOP content is data, kept in zh-TW on purpose. */
function createDemoSops(): Sop[] {
  return [
    {
      id: "demo-checkout-clean",
      title: "退房清潔標準流程",
      category: "rooms",
      version: "v3.2",
      updatedAt: "2026-10-02",
      steps: [
        {
          title: "敲門確認",
          description:
            "敲門三下並通報「房務服務」，等待 10 秒無回應再以工作卡開門；入房後將門保持半開並放置清潔中告示牌。",
        },
        {
          title: "開窗通風",
          description:
            "拉開窗簾、開窗（或將空調切至換氣模式）通風，同時巡視房內有無遺留物與損壞，發現遺留物立即通報前檯。",
        },
        {
          title: "撤除布巾",
          description:
            "撤下床單、被套、枕套與浴室毛巾，依「布巾分類車」分袋放置；嚴禁將布巾放置地面或用於擦拭。",
        },
        {
          title: "浴室清潔",
          description:
            "依「由上而下、由淨到污」順序清潔鏡面、洗手台、浴缸／淋浴間，最後清潔馬桶；排水孔除毛髮，完成後噴灑消毒劑靜置 5 分鐘。",
        },
        {
          title: "鋪床",
          description:
            "更換全套布巾並依標準鋪床法完成三折入角；枕頭開口朝外側擺放，床尾巾置於床尾三分之一處。",
        },
        {
          title: "備品補充",
          description:
            "依備品清單補足礦泉水 2 瓶、茶包、咖啡、杯具、沐浴備品與衛生紙；迷你吧依盤點表補貨並登記耗用。",
        },
        {
          title: "吸塵與整理",
          description:
            "由房間最內側向門口吸塵，含床下與沙發縫隙；擦拭家具表面、調整窗簾與燈光至標準狀態，空調設定 24 度。",
        },
        {
          title: "最終檢查",
          description:
            "依「客房檢查（標準）」檢查表逐項確認，關窗、關燈後於系統將房況更新為「已清潔」，通知領班查房。",
        },
      ],
      relatedChecklists: ["客房檢查（標準）", "深度清潔檢查"],
    },
    {
      id: "demo-stayover-clean",
      title: "續住房整理流程",
      category: "rooms",
      version: "v2.0",
      updatedAt: "2026-09-18",
      steps: [
        {
          title: "確認住客外出",
          description: "敲門通報後確認住客不在房內；若掛「請勿打擾」則記錄並跳過。",
        },
        {
          title: "整理床鋪與更換毛巾",
          description: "整理床鋪（第三天強制更換床單），更換置於地面的毛巾。",
        },
        {
          title: "補充備品與倒垃圾",
          description: "補足瓶裝水與消耗備品，清空垃圾桶並更換垃圾袋。",
        },
        {
          title: "快速清潔",
          description: "擦拭浴室檯面、快速吸塵走道區，不移動住客個人物品。",
        },
      ],
      relatedChecklists: ["客房檢查（標準）"],
    },
    {
      id: "demo-deep-clean",
      title: "季度深度清潔保養",
      category: "rooms",
      version: "v1.4",
      updatedAt: "2026-08-30",
      steps: [
        {
          title: "排程與封房",
          description: "依深度清潔排程將房間設為停用（OO），預留 4 小時作業時間。",
        },
        {
          title: "深度作業",
          description: "床墊翻面、地毯洗滌、窗簾送洗、冷氣濾網清洗、傢俱打蠟。",
        },
        {
          title: "驗收開放",
          description: "依「深度清潔檢查」檢查表驗收，拍照存檔後恢復房況。",
        },
      ],
      relatedChecklists: ["深度清潔檢查"],
    },
    {
      id: "demo-lobby-patrol",
      title: "大廳日常巡檢",
      category: "public",
      version: "v2.1",
      updatedAt: "2026-09-25",
      steps: [
        {
          title: "每小時巡檢",
          description: "巡視大廳地面、沙發區與大門玻璃，即時清理污漬與指紋。",
        },
        {
          title: "綠植與香氛",
          description: "檢查綠植澆水狀態與大廳香氛機運作，補充精油。",
        },
        {
          title: "巡檢記錄",
          description: "於「公共區域巡檢」檢查表簽名記錄，異常回報工程部。",
        },
      ],
      relatedChecklists: ["公共區域巡檢"],
    },
    {
      id: "demo-public-restroom",
      title: "公共廁所清潔流程",
      category: "public",
      version: "v3.0",
      updatedAt: "2026-10-10",
      steps: [
        {
          title: "放置告示",
          description: "入口放置清潔中告示牌，確認無客人使用後開始作業。",
        },
        {
          title: "清潔消毒",
          description: "依由淨到污順序清潔鏡面、洗手台、隔間與馬桶，全面消毒。",
        },
        {
          title: "補充耗材",
          description: "補足洗手乳、擦手紙與衛生紙，更換垃圾袋。",
        },
        {
          title: "簽核記錄",
          description: "於門後巡檢表簽名並填寫時間，每 2 小時一輪。",
        },
      ],
      relatedChecklists: ["公共區域巡檢"],
    },
    {
      id: "demo-lost-found",
      title: "遺失物受理流程",
      category: "frontdesk",
      version: "v1.8",
      updatedAt: "2026-09-05",
      steps: [
        {
          title: "登記入庫",
          description: "拍照、填寫遺失物單（拾獲地點／時間／拾獲人），貴重物品雙人點收。",
        },
        {
          title: "通知與保管",
          description: "可辨識失主者 24 小時內聯繫；一般物品保管 3 個月、貴重物品 6 個月。",
        },
        {
          title: "歸還或處置",
          description: "歸還時核對證件並簽收；逾期物品依公司規範處置並記錄。",
        },
      ],
      relatedChecklists: [],
    },
    {
      id: "demo-vip-arrival",
      title: "VIP 迎賓準備流程",
      category: "frontdesk",
      version: "v2.3",
      updatedAt: "2026-10-15",
      steps: [
        {
          title: "抵達前確認",
          description: "抵達前一日確認房型升等、歡迎卡與迎賓水果／香檳備妥。",
        },
        {
          title: "房間複檢",
          description: "領班親自依檢查表複檢房間，確認備品與溫度。",
        },
        {
          title: "迎賓接待",
          description: "大廳專人迎接、免排隊辦理入住，值班經理遞送歡迎信。",
        },
        {
          title: "入住後關懷",
          description: "入住 30 分鐘後致電關懷，記錄偏好至客史。",
        },
      ],
      relatedChecklists: ["客房檢查（標準）"],
    },
    {
      id: "demo-chemical-safety",
      title: "清潔藥劑使用安全",
      category: "safety",
      version: "v1.6",
      updatedAt: "2026-08-12",
      steps: [
        {
          title: "辨識與標示",
          description: "所有藥劑須有原廠標籤與 SDS 資料表，嚴禁使用無標示分裝瓶。",
        },
        {
          title: "防護裝備",
          description: "使用酸鹼類藥劑時配戴手套與護目鏡，保持通風。",
        },
        {
          title: "禁止混用",
          description: "漂白水嚴禁與酸性清潔劑或氨水混用，避免產生毒性氣體。",
        },
        {
          title: "緊急處置",
          description: "接觸皮膚立即以大量清水沖洗 15 分鐘，並通報主管就醫評估。",
        },
      ],
      relatedChecklists: [],
    },
    {
      id: "demo-fire-response",
      title: "火警應變程序",
      category: "safety",
      version: "v4.0",
      updatedAt: "2026-07-20",
      steps: [
        {
          title: "通報確認",
          description: "聽到警報立即通報總機與值班經理，由防災中心確認火點。",
        },
        {
          title: "初期滅火與疏散",
          description: "小火以滅火器撲滅；無法控制時依樓層疏散動線引導客人至集合點。",
        },
        {
          title: "清點回報",
          description: "各樓層負責人清點人數回報指揮官，配合消防隊行動。",
        },
      ],
      relatedChecklists: [],
    },
  ];
}

interface SopsStore {
  sops: Sop[];
  addSop: (input: {
    title: string;
    category: SopCategory;
    steps: SopStep[];
  }) => Sop;
  deleteSop: (id: string) => void;
  resetDemo: () => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useSopsStore = create<SopsStore>()(
  persist(
    (set) => ({
      sops: createDemoSops(),

      addSop: (input) => {
        const sop: Sop = {
          id: newId(),
          title: input.title,
          category: input.category,
          version: "v1.0",
          updatedAt: today(),
          steps: input.steps,
          relatedChecklists: [],
        };
        set((s) => ({ sops: [...s.sops, sop] }));
        return sop;
      },

      deleteSop: (id) =>
        set((s) => ({ sops: s.sops.filter((sop) => sop.id !== id) })),

      resetDemo: () => set({ sops: createDemoSops() }),
    }),
    {
      name: "tms-workday-sops",
      version: 1,
    },
  ),
);
