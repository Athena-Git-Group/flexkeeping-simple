/**
 * Translation fragment for ChecklistEditorPage.
 * Keys are consumed as `t("workday.checklists.<key>")` — the integration step
 * mounts each language object under the `workday.checklists` subtree of its
 * locale file.
 */
const en = {
  title: "Checklist templates",
  newTemplate: "New template",
  untitledTemplate: "Untitled template",
  copySuffix: " (copy)",
  duplicate: "Duplicate template",
  deleteTemplate: "Delete template",
  confirmDeleteTemplate: "Delete template “{{name}}”?",
  confirmDeleteSection: "Delete section “{{name}}” and its items?",
  toastDuplicated: "Template duplicated",
  toastDeleted: "Template deleted",
  saved: "Saved ✓",
  saving: "Saving…",
  stats: "{{sections}} sections · {{items}} items",
  templateNameAria: "Template name",
  sectionNamePlaceholder: "Section name",
  deleteSectionAria: "Delete section {{name}}",
  itemNamePlaceholder: "Item name",
  qtyPlaceholder: "Qty",
  deleteItemAria: "Delete item {{name}}",
  addItem: "+ Add item",
  addSection: "+ Add section",
  newSectionName: "New section",
  newItemName: "New item",
  emptyTitle: "No template selected",
  emptyHint: "Pick a template from the list on the left.",
  templateCount: "{{count}} templates",
  resetDemo: "Reset demo data",
} as const;

/** Same tree shape as `en`, every leaf a string */
type Shape<T> = { [K in keyof T]: T[K] extends string ? string : Shape<T[K]> };
type ChecklistsKeys = Shape<typeof en>;

const zhTW = {
  title: "檢查表範本",
  newTemplate: "新增範本",
  untitledTemplate: "未命名範本",
  copySuffix: "（副本）",
  duplicate: "複製範本",
  deleteTemplate: "刪除範本",
  confirmDeleteTemplate: "確定要刪除範本「{{name}}」嗎？",
  confirmDeleteSection: "確定要刪除分區「{{name}}」及其項目嗎？",
  toastDuplicated: "已複製範本",
  toastDeleted: "已刪除範本",
  saved: "已儲存 ✓",
  saving: "儲存中…",
  stats: "{{sections}} 個分區・{{items}} 個項目",
  templateNameAria: "範本名稱",
  sectionNamePlaceholder: "分區名稱",
  deleteSectionAria: "刪除分區 {{name}}",
  itemNamePlaceholder: "項目名稱",
  qtyPlaceholder: "數量",
  deleteItemAria: "刪除項目 {{name}}",
  addItem: "+ 新增項目",
  addSection: "+ 新增分區",
  newSectionName: "新分區",
  newItemName: "新項目",
  emptyTitle: "尚未選擇範本",
  emptyHint: "請從左側清單選擇一份範本。",
  templateCount: "{{count}} 份範本",
  resetDemo: "重設 demo 資料",
} as const satisfies ChecklistsKeys;

const ja = {
  title: "チェックリストテンプレート",
  newTemplate: "テンプレートを追加",
  untitledTemplate: "無題のテンプレート",
  copySuffix: "（コピー）",
  duplicate: "テンプレートを複製",
  deleteTemplate: "テンプレートを削除",
  confirmDeleteTemplate: "テンプレート「{{name}}」を削除しますか？",
  confirmDeleteSection: "セクション「{{name}}」とその項目を削除しますか？",
  toastDuplicated: "テンプレートを複製しました",
  toastDeleted: "テンプレートを削除しました",
  saved: "保存済み ✓",
  saving: "保存中…",
  stats: "セクション {{sections}}・項目 {{items}}",
  templateNameAria: "テンプレート名",
  sectionNamePlaceholder: "セクション名",
  deleteSectionAria: "セクション{{name}}を削除",
  itemNamePlaceholder: "項目名",
  qtyPlaceholder: "数量",
  deleteItemAria: "項目{{name}}を削除",
  addItem: "+ 項目を追加",
  addSection: "+ セクションを追加",
  newSectionName: "新しいセクション",
  newItemName: "新しい項目",
  emptyTitle: "テンプレートが選択されていません",
  emptyHint: "左のリストからテンプレートを選択してください。",
  templateCount: "{{count}} 件のテンプレート",
  resetDemo: "デモデータをリセット",
} as const satisfies ChecklistsKeys;

export const checklistsI18n = { en, zhTW, ja } as const;
