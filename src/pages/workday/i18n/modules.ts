// i18n fragment for ModulesPage. An integration step mounts each language
// object into the locale files under the `workday.modules` subtree, so the
// page reads keys as t("workday.modules.<key>").
const en = {
  title: "Modules",
  subtitle: "Enable or disable system modules for this property",
  enabledCount: "{{count}} / {{total}} enabled",
  toastEnabled: "{{name}} enabled",
  toastDisabled: "{{name}} disabled",
  toggleAria: "Toggle {{name}}",
  items: {
    minibar: {
      name: "Minibar",
      desc: "Track minibar consumption and restocking per room.",
    },
    roomService: {
      name: "Room service",
      desc: "Receive and dispatch in-room dining orders.",
    },
    laundry: {
      name: "Laundry & linen",
      desc: "Manage guest laundry and linen inventory cycles.",
    },
    guestRelations: {
      name: "Guest relations",
      desc: "Log guest preferences, requests and follow-ups.",
    },
    lostFound: {
      name: "Lost & found",
      desc: "Register found items and match them to guests.",
    },
    turndown: {
      name: "Turndown service",
      desc: "Plan and track evening turndown rounds.",
    },
    checklists: {
      name: "Checklists",
      desc: "Standardize inspections with reusable checklists.",
    },
    repairs: {
      name: "Maintenance",
      desc: "Report defects and dispatch repair orders.",
    },
    automation: {
      name: "Automation",
      desc: "Trigger tasks automatically from events and rules.",
    },
  },
} as const;

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
type ModulesI18nShape = Widen<typeof en>;

export const modulesI18n = {
  en,
  zhTW: {
    title: "模組",
    subtitle: "啟用或停用系統模組",
    enabledCount: "已啟用 {{count}} / {{total}}",
    toastEnabled: "已啟用「{{name}}」",
    toastDisabled: "已停用「{{name}}」",
    toggleAria: "切換 {{name}}",
    items: {
      minibar: {
        name: "迷你吧",
        desc: "追蹤各客房迷你吧的消耗與補貨。",
      },
      roomService: {
        name: "客房餐飲",
        desc: "接收並派送客房內用餐訂單。",
      },
      laundry: {
        name: "洗衣布巾",
        desc: "管理住客送洗與布巾庫存循環。",
      },
      guestRelations: {
        name: "賓客關係",
        desc: "記錄住客偏好、需求與後續追蹤。",
      },
      lostFound: {
        name: "失物招領",
        desc: "登記拾獲物品並與住客配對。",
      },
      turndown: {
        name: "夜床服務",
        desc: "規劃並追蹤夜床整理巡房。",
      },
      checklists: {
        name: "檢查表",
        desc: "以可重用的檢查表標準化查房流程。",
      },
      repairs: {
        name: "報修",
        desc: "回報設備問題並派發維修工單。",
      },
      automation: {
        name: "自動化流程",
        desc: "依事件與規則自動產生任務。",
      },
    },
  } satisfies ModulesI18nShape,
  ja: {
    title: "モジュール",
    subtitle: "システムモジュールの有効/無効を切り替え",
    enabledCount: "{{count}} / {{total}} 有効",
    toastEnabled: "「{{name}}」を有効にしました",
    toastDisabled: "「{{name}}」を無効にしました",
    toggleAria: "{{name}} を切り替え",
    items: {
      minibar: {
        name: "ミニバー",
        desc: "各客室のミニバー消費と補充を管理。",
      },
      roomService: {
        name: "ルームサービス",
        desc: "インルームダイニングの注文を受付・手配。",
      },
      laundry: {
        name: "ランドリー・リネン",
        desc: "ゲストのランドリーとリネン在庫を管理。",
      },
      guestRelations: {
        name: "ゲストリレーション",
        desc: "ゲストの好み・要望・フォローアップを記録。",
      },
      lostFound: {
        name: "遺失物",
        desc: "拾得物を登録しゲストと照合。",
      },
      turndown: {
        name: "ターンダウン",
        desc: "夜間のターンダウン巡回を計画・管理。",
      },
      checklists: {
        name: "チェックリスト",
        desc: "再利用可能なチェックリストで点検を標準化。",
      },
      repairs: {
        name: "メンテナンス",
        desc: "不具合を報告し修理依頼を手配。",
      },
      automation: {
        name: "自動化",
        desc: "イベントとルールからタスクを自動生成。",
      },
    },
  } satisfies ModulesI18nShape,
} as const;
