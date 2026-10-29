/**
 * Translation fragment for SopsPage.
 * Keys are consumed as `t("workday.sops.<key>")` — the integration step mounts
 * each language object under the `workday.sops` subtree of its locale file.
 */
const en = {
  title: "SOP library",
  searchPlaceholder: "Search SOPs",
  newSop: "New SOP",
  categories: {
    rooms: "Room cleaning",
    public: "Public areas",
    frontdesk: "Front desk",
    safety: "Safety",
  },
  versionLabel: "Version {{version}}",
  updatedLabel: "Updated {{date}}",
  stepCount: "{{count}} steps",
  stepsTitle: "Steps",
  relatedChecklists: "Related checklists",
  emptyTitle: "No SOP selected",
  emptyHint: "Pick a document from the list on the left.",
  noResults: "No matching SOPs",
  deleteAria: "Delete {{title}}",
  confirmDelete: "Delete SOP “{{title}}”?",
  toastDeleted: "SOP deleted",
  resetDemo: "Reset demo data",
  modal: {
    title: "New SOP",
    nameLabel: "Title",
    namePlaceholder: "e.g. Turndown service procedure",
    categoryLabel: "Category",
    stepsLabel: "Steps",
    stepsHint: "One step per line",
    stepsPlaceholder: "Knock and announce\nOpen windows\n…",
    submit: "Create",
    cancel: "Cancel",
    close: "Close",
  },
  toastCreated: "SOP “{{title}}” created",
} as const;

/** Same tree shape as `en`, every leaf a string */
type Shape<T> = { [K in keyof T]: T[K] extends string ? string : Shape<T[K]> };
type SopsKeys = Shape<typeof en>;

const zhTW = {
  title: "SOP 文件庫",
  searchPlaceholder: "搜尋 SOP",
  newSop: "新增 SOP",
  categories: {
    rooms: "客房清潔",
    public: "公共區域",
    frontdesk: "前檯",
    safety: "安全",
  },
  versionLabel: "版本 {{version}}",
  updatedLabel: "更新於 {{date}}",
  stepCount: "{{count}} 個步驟",
  stepsTitle: "作業步驟",
  relatedChecklists: "相關檢查表",
  emptyTitle: "尚未選擇 SOP",
  emptyHint: "請從左側清單選擇一份文件。",
  noResults: "找不到符合的 SOP",
  deleteAria: "刪除 {{title}}",
  confirmDelete: "確定要刪除 SOP「{{title}}」嗎？",
  toastDeleted: "已刪除 SOP",
  resetDemo: "重設 demo 資料",
  modal: {
    title: "新增 SOP",
    nameLabel: "標題",
    namePlaceholder: "例如：夜床服務流程",
    categoryLabel: "分類",
    stepsLabel: "步驟",
    stepsHint: "每行一個步驟",
    stepsPlaceholder: "敲門確認\n開窗通風\n…",
    submit: "建立",
    cancel: "取消",
    close: "關閉",
  },
  toastCreated: "已建立 SOP「{{title}}」",
} as const satisfies SopsKeys;

const ja = {
  title: "SOP ライブラリ",
  searchPlaceholder: "SOP を検索",
  newSop: "SOP を追加",
  categories: {
    rooms: "客室清掃",
    public: "パブリックエリア",
    frontdesk: "フロント",
    safety: "安全",
  },
  versionLabel: "バージョン {{version}}",
  updatedLabel: "更新日 {{date}}",
  stepCount: "{{count}} ステップ",
  stepsTitle: "作業手順",
  relatedChecklists: "関連チェックリスト",
  emptyTitle: "SOP が選択されていません",
  emptyHint: "左のリストからドキュメントを選択してください。",
  noResults: "該当する SOP が見つかりません",
  deleteAria: "{{title}}を削除",
  confirmDelete: "SOP「{{title}}」を削除しますか？",
  toastDeleted: "SOP を削除しました",
  resetDemo: "デモデータをリセット",
  modal: {
    title: "SOP を追加",
    nameLabel: "タイトル",
    namePlaceholder: "例：ターンダウンサービス手順",
    categoryLabel: "カテゴリー",
    stepsLabel: "手順",
    stepsHint: "1 行につき 1 ステップ",
    stepsPlaceholder: "ノックして確認\n窓を開けて換気\n…",
    submit: "作成",
    cancel: "キャンセル",
    close: "閉じる",
  },
  toastCreated: "SOP「{{title}}」を作成しました",
} as const satisfies SopsKeys;

export const sopsI18n = { en, zhTW, ja } as const;
