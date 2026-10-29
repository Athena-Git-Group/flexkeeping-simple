import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChecklistItem {
  id: string;
  name: string;
  /** Optional quantity; null = no quantity. */
  qty: number | null;
}

export interface ChecklistSection {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  sections: ChecklistSection[];
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `cl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function item(id: string, name: string, qty: number | null = null): ChecklistItem {
  return { id, name, qty };
}

/** Demo template contents are data, kept in zh-TW on purpose. */
function createDemoTemplates(): ChecklistTemplate[] {
  return [
    {
      id: "demo-room-standard",
      name: "客房檢查（標準）",
      sections: [
        {
          id: "demo-rs-bedroom",
          name: "臥室",
          items: [
            item("demo-rs-b1", "衣架", 8),
            item("demo-rs-b2", "請勿打擾卡", 1),
            item("demo-rs-b3", "垃圾桶"),
            item("demo-rs-b4", "床鋪整理"),
          ],
        },
        {
          id: "demo-rs-bathroom",
          name: "浴室",
          items: [
            item("demo-rs-w1", "鏡子"),
            item("demo-rs-w2", "毛巾", 4),
            item("demo-rs-w3", "備品補充"),
            item("demo-rs-w4", "淋浴間"),
          ],
        },
      ],
    },
    {
      id: "demo-deep-clean",
      name: "深度清潔檢查",
      sections: [
        {
          id: "demo-dc-room",
          name: "房間",
          items: [
            item("demo-dc-r1", "床墊翻面"),
            item("demo-dc-r2", "地毯洗滌"),
            item("demo-dc-r3", "窗簾送洗"),
          ],
        },
        {
          id: "demo-dc-equipment",
          name: "設備",
          items: [
            item("demo-dc-e1", "冷氣濾網"),
            item("demo-dc-e2", "排水孔"),
            item("demo-dc-e3", "傢俱打蠟"),
          ],
        },
      ],
    },
    {
      id: "demo-public-patrol",
      name: "公共區域巡檢",
      sections: [
        {
          id: "demo-pp-lobby",
          name: "大廳",
          items: [
            item("demo-pp-l1", "地面清潔"),
            item("demo-pp-l2", "沙發區整理"),
            item("demo-pp-l3", "大門玻璃"),
          ],
        },
        {
          id: "demo-pp-restroom",
          name: "公共廁所",
          items: [
            item("demo-pp-r1", "洗手乳", 2),
            item("demo-pp-r2", "擦手紙"),
            item("demo-pp-r3", "馬桶消毒"),
            item("demo-pp-r4", "垃圾袋更換"),
          ],
        },
      ],
    },
  ];
}

interface ChecklistsStore {
  templates: ChecklistTemplate[];
  selectedId: string | null;
  select: (id: string) => void;
  addTemplate: (name: string) => string;
  duplicateTemplate: (id: string, copySuffix: string) => string | null;
  deleteTemplate: (id: string) => void;
  renameTemplate: (id: string, name: string) => void;
  addSection: (templateId: string, name: string) => void;
  renameSection: (templateId: string, sectionId: string, name: string) => void;
  deleteSection: (templateId: string, sectionId: string) => void;
  addItem: (templateId: string, sectionId: string, name: string) => void;
  updateItem: (
    templateId: string,
    sectionId: string,
    itemId: string,
    patch: Partial<Pick<ChecklistItem, "name" | "qty">>,
  ) => void;
  deleteItem: (templateId: string, sectionId: string, itemId: string) => void;
  resetDemo: () => void;
}

function mapTemplate(
  templates: ChecklistTemplate[],
  id: string,
  fn: (t: ChecklistTemplate) => ChecklistTemplate,
): ChecklistTemplate[] {
  return templates.map((t) => (t.id === id ? fn(t) : t));
}

function mapSection(
  template: ChecklistTemplate,
  sectionId: string,
  fn: (s: ChecklistSection) => ChecklistSection,
): ChecklistTemplate {
  return {
    ...template,
    sections: template.sections.map((s) => (s.id === sectionId ? fn(s) : s)),
  };
}

export const useChecklistsStore = create<ChecklistsStore>()(
  persist(
    (set, get) => ({
      templates: createDemoTemplates(),
      selectedId: "demo-room-standard",

      select: (id) => set({ selectedId: id }),

      addTemplate: (name) => {
        const id = newId();
        set((s) => ({
          templates: [...s.templates, { id, name, sections: [] }],
          selectedId: id,
        }));
        return id;
      },

      duplicateTemplate: (id, copySuffix) => {
        const source = get().templates.find((t) => t.id === id);
        if (!source) return null;
        const copy: ChecklistTemplate = {
          id: newId(),
          name: `${source.name}${copySuffix}`,
          sections: source.sections.map((section) => ({
            ...section,
            id: newId(),
            items: section.items.map((it) => ({ ...it, id: newId() })),
          })),
        };
        set((s) => ({
          templates: [...s.templates, copy],
          selectedId: copy.id,
        }));
        return copy.id;
      },

      deleteTemplate: (id) =>
        set((s) => {
          const templates = s.templates.filter((t) => t.id !== id);
          return {
            templates,
            selectedId:
              s.selectedId === id ? (templates[0]?.id ?? null) : s.selectedId,
          };
        }),

      renameTemplate: (id, name) =>
        set((s) => ({
          templates: mapTemplate(s.templates, id, (t) => ({ ...t, name })),
        })),

      addSection: (templateId, name) =>
        set((s) => ({
          templates: mapTemplate(s.templates, templateId, (t) => ({
            ...t,
            sections: [...t.sections, { id: newId(), name, items: [] }],
          })),
        })),

      renameSection: (templateId, sectionId, name) =>
        set((s) => ({
          templates: mapTemplate(s.templates, templateId, (t) =>
            mapSection(t, sectionId, (sec) => ({ ...sec, name })),
          ),
        })),

      deleteSection: (templateId, sectionId) =>
        set((s) => ({
          templates: mapTemplate(s.templates, templateId, (t) => ({
            ...t,
            sections: t.sections.filter((sec) => sec.id !== sectionId),
          })),
        })),

      addItem: (templateId, sectionId, name) =>
        set((s) => ({
          templates: mapTemplate(s.templates, templateId, (t) =>
            mapSection(t, sectionId, (sec) => ({
              ...sec,
              items: [...sec.items, { id: newId(), name, qty: null }],
            })),
          ),
        })),

      updateItem: (templateId, sectionId, itemId, patch) =>
        set((s) => ({
          templates: mapTemplate(s.templates, templateId, (t) =>
            mapSection(t, sectionId, (sec) => ({
              ...sec,
              items: sec.items.map((it) =>
                it.id === itemId ? { ...it, ...patch } : it,
              ),
            })),
          ),
        })),

      deleteItem: (templateId, sectionId, itemId) =>
        set((s) => ({
          templates: mapTemplate(s.templates, templateId, (t) =>
            mapSection(t, sectionId, (sec) => ({
              ...sec,
              items: sec.items.filter((it) => it.id !== itemId),
            })),
          ),
        })),

      resetDemo: () =>
        set({
          templates: createDemoTemplates(),
          selectedId: "demo-room-standard",
        }),
    }),
    {
      name: "tms-workday-checklists",
      version: 1,
    },
  ),
);
