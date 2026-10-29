import { ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { useTasksStore } from "@/pages/workday/tasks/store";
import {
  AnalyticsRecord,
  applyFilters,
  DEMO_DATE,
  downloadCsv,
  FacetField,
  facetCounts,
  FacetFilters,
  resolveLabel,
  tasksToRecords,
  toggleFilterValue,
} from "@/pages/workday/analytics/data";

// Hex values mirror the Flexkeeping screenshot; kept inline instead of
// tailwind.config because these two analytics mocks are the only consumers.
export const SLATE = "#37474F";
export const RED = "#E2574C";

function IconCalendar({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconCaretDown({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconChevronLeft({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconExpandDiagonal({ size = 11 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="5" x2="5" y2="19" />
      <polyline points="9 5 19 5 19 15" />
    </svg>
  );
}

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="animate-spin text-teal-600"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function AnalyticsHeader({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <h2 className="text-lg font-bold tracking-wide text-gray-800">{title}</h2>
      <span className="text-sm text-gray-400">{meta}</span>
    </div>
  );
}

export type PeriodMode = "created" | "completed" | "open";

const PERIOD_MODES: PeriodMode[] = ["created", "completed", "open"];

export function ControlsRow({
  radioName,
  mode,
  onModeChange,
}: {
  radioName: string;
  mode: PeriodMode;
  onModeChange: (mode: PeriodMode) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="mt-4 flex items-center gap-6">
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
      >
        <IconChevronLeft size={12} />
        {t("workday.analytics.common.back")}
      </button>
      <div className="flex items-center gap-5 text-sm text-gray-600">
        <span>{t("workday.analytics.common.forPeriodFrom")}</span>
        {PERIOD_MODES.map((opt) => (
          <label key={opt} className="flex cursor-pointer items-center gap-1.5">
            <input
              type="radio"
              name={radioName}
              checked={opt === mode}
              onChange={() => onModeChange(opt)}
              className="h-3.5 w-3.5 accent-teal-600"
            />
            <span>{t(`workday.analytics.common.${opt}`)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function DateBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600">
      <span className="text-gray-400">
        <IconCalendar />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-[72px] bg-transparent outline-none"
      />
    </div>
  );
}

export function FilterRow({
  dates,
  onDateChange,
  onExport,
  onGetData,
  loading,
}: {
  dates: [string, string];
  onDateChange: (index: 0 | 1, value: string) => void;
  onExport: () => void;
  onGetData: () => void;
  loading: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="mt-3 flex items-center gap-3">
      <DateBox value={dates[0]} onChange={(v) => onDateChange(0, v)} />
      <DateBox value={dates[1]} onChange={(v) => onDateChange(1, v)} />
      <button
        type="button"
        className="flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
      >
        {t("workday.analytics.common.filter")}
        <span className="text-gray-400">
          <IconCaretDown />
        </span>
      </button>
      <button
        type="button"
        onClick={onExport}
        className="flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
      >
        {t("workday.analytics.common.export")}
        <span className="text-gray-400">
          <IconCaretDown />
        </span>
      </button>
      <button
        type="button"
        onClick={onGetData}
        disabled={loading}
        className="flex items-center gap-2 rounded bg-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-300 disabled:opacity-60"
      >
        {loading && <Spinner size={12} />}
        {t("workday.analytics.common.getData")}
      </button>
    </div>
  );
}

export function SectionTitle({
  label,
  count,
  chip,
}: {
  label: string;
  count: number;
  chip?: string;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 pb-2">
        <span className="text-sm font-semibold text-gray-700">
          {label} <span className="font-normal text-gray-500">{count}</span>
        </span>
        {chip && (
          <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-[11px] text-gray-600">
            {chip}
          </span>
        )}
      </div>
      <div className="h-[3px] w-full rounded" style={{ backgroundColor: SLATE }} />
    </div>
  );
}

export interface FacetRow {
  label: string;
  value: number;
  /** Raw facet value for toggling; undefined rows are display-only */
  key?: string;
  selected?: boolean;
}

export interface FacetFooter {
  rows: number;
  more?: number;
}

export function FacetPanel({
  title,
  rows,
  footer,
  axisMax,
  onRowClick,
}: {
  title: string;
  rows?: FacetRow[];
  footer?: FacetFooter;
  // Lets a panel share a scale with its siblings instead of self-normalizing,
  // e.g. when a truncated "Rows ∨N More" list hides the true max.
  axisMax?: number;
  onRowClick?: (key: string) => void;
}) {
  const { t } = useTranslation();
  const max = axisMax ?? Math.max(1, ...(rows ?? []).map((r) => r.value));
  const axisTicks = [1, 2, 3, 4].filter((t) => t <= max);
  return (
    <div className="border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-100 px-2 py-1.5 text-center text-[11px] font-bold text-gray-600">
        {title}
      </div>
      {rows && rows.length > 0 && (
        <div className="px-2 py-1.5">
          {rows.map((row) => {
            const clickable = onRowClick && row.key != null;
            return (
              <div
                key={row.key ?? row.label}
                onClick={clickable ? () => onRowClick(row.key as string) : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded px-0.5 py-[3px]",
                  clickable && "cursor-pointer hover:bg-gray-50",
                  row.selected && "bg-teal-100 hover:bg-teal-100",
                )}
              >
                <span className="w-[45%] shrink-0 truncate text-right text-[11px] text-gray-600">
                  {row.label}
                </span>
                <div className="relative h-[11px] flex-1">
                  <div
                    className={cn("h-full", row.selected ? "bg-teal-500" : "bg-gray-300")}
                    style={{ width: `${(row.value / max) * 100}%` }}
                  />
                </div>
                <span className="w-4 shrink-0 text-right text-[11px] text-gray-600">
                  {row.value}
                </span>
              </div>
            );
          })}
          <div className="mt-1 flex items-center gap-1.5">
            <span className="w-[45%] shrink-0 text-right text-[9px] text-gray-400">#</span>
            <div className="relative h-3 flex-1">
              <div className="absolute inset-x-0 top-0 border-t border-gray-200" />
              {axisTicks.map((t) => (
                <span
                  key={t}
                  className="absolute top-0 -translate-x-1/2 text-[9px] text-gray-400"
                  style={{ left: `${(t / max) * 100}%` }}
                >
                  {t}
                </span>
              ))}
            </div>
            <span className="w-4 shrink-0" />
          </div>
        </div>
      )}
      {footer && (
        <div className="border-t border-gray-100 bg-gray-50 px-2 py-1 text-[10px] text-gray-400">
          {footer.more != null
            ? t("workday.analytics.footer.rowsMore", {
                rows: footer.rows,
                more: footer.more,
              })
            : t("workday.analytics.footer.rows", { rows: footer.rows })}
        </div>
      )}
    </div>
  );
}

export function CollapsedPanel({ title }: { title: string }) {
  return (
    <div className="border border-gray-200 bg-white">
      <div className="flex items-center gap-1.5 border-b border-gray-200 bg-gray-100 px-2 py-1.5">
        <span className="text-gray-400">
          <IconExpandDiagonal />
        </span>
        <span className="flex-1 text-center text-[11px] font-bold text-gray-600">
          {title}
        </span>
      </div>
    </div>
  );
}

export interface FlawListItem {
  room: string;
  title: string;
  createdBy: string;
  createdByGroup: string;
  completedBy?: string;
  accent?: string;
  highlighted?: boolean;
}

export function FlawList({ items }: { items: FlawListItem[] }) {
  const { t } = useTranslation();
  if (items.length === 0) {
    return (
      <div className="border border-gray-200 bg-white px-4 py-8 text-center text-xs text-gray-400">
        {t("workday.analytics.common.noResults")}
      </div>
    );
  }
  return (
    <div className="border border-gray-200 bg-white">
      {items.map((item, i) => (
        <div
          // Room numbers repeat in the data (e.g. two "308" flaws), so the
          // index disambiguates the key.
          key={`${item.room}-${i}`}
          className={cn(
            "relative px-4 py-2.5",
            i > 0 && "border-t border-gray-100",
            item.highlighted && "bg-gray-100",
          )}
        >
          <span
            className="absolute inset-y-0 left-0 w-[3px]"
            style={{ backgroundColor: item.accent ?? SLATE }}
          />
          <div className="text-xs font-bold text-gray-700">
            {item.room} | {item.title} -
          </div>
          <div className="mt-0.5 text-[11px] text-gray-500">
            {t("workday.analytics.common.createdByPrefix")} {item.createdBy}{" "}
            <span className="text-gray-400">{item.createdByGroup}</span>
          </div>
          <div className="text-[11px] text-gray-500">
            {t("workday.analytics.common.completedByPrefix")}{" "}
            {item.completedBy ?? t("workday.analytics.facets.uncompleted")}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardColumns({
  left,
  middle,
  right,
}: {
  left: ReactNode;
  middle: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="mt-3 flex items-start gap-3">
      <div className="flex w-[290px] shrink-0 flex-col gap-2">{left}</div>
      <div className="min-w-0 flex-1">{middle}</div>
      <div className="flex w-[290px] shrink-0 flex-col gap-2">{right}</div>
    </div>
  );
}

export function AnalyticsPageFrame({ children }: { children: ReactNode }) {
  return <div className="px-6 py-5">{children}</div>;
}

export type PanelConfig =
  | { kind: "facet"; titleKey: string; field: FacetField }
  // Demo-only dimension: single row showing the filtered total.
  | { kind: "static"; titleKey: string; valueKey?: string }
  | { kind: "collapsed"; titleKey: string };

export interface FacetDashboardProps {
  headerKey: string;
  sectionKey: string;
  radioName: string;
  /** Quick-action module whose tasks merge into the records ("cleaning" / "maintenance") */
  module: string;
  seedRecords: AnalyticsRecord[];
  leftPanels: PanelConfig[];
  rightPanels: PanelConfig[];
  csvFilename: string;
  sectionChip?: string;
}

/**
 * Full interactive facet dashboard shared by the Cleaning flaw and Repairs
 * pages: radio period mode, editable demo dates, facet cross-filtering with
 * chips, quick-action task merge, CSV export and a fake GET DATA loading pass.
 */
export function FacetDashboard({
  headerKey,
  sectionKey,
  radioName,
  module,
  seedRecords,
  leftPanels,
  rightPanels,
  csvFilename,
  sectionChip,
}: FacetDashboardProps) {
  const { t } = useTranslation();
  const ta = (key: string) => t(`workday.analytics.${key}`);

  const tasks = useTasksStore((s) => s.tasks);
  const [mode, setMode] = useState<PeriodMode>("created");
  const [filters, setFilters] = useState<FacetFilters>({});
  const [dates, setDates] = useState<[string, string]>([DEMO_DATE, DEMO_DATE]);
  const [loading, setLoading] = useState(false);

  const allRecords = useMemo(
    () => [...tasksToRecords(tasks, module), ...seedRecords],
    [tasks, module, seedRecords],
  );

  // Radio mode narrows the base set before facets, so every panel reacts.
  const modeRecords = useMemo(() => {
    if (mode === "completed") return allRecords.filter((r) => r.completedBy);
    if (mode === "open") return allRecords.filter((r) => !r.completedBy);
    return allRecords;
  }, [allRecords, mode]);

  const filtered = useMemo(
    () => applyFilters(modeRecords, filters),
    [modeRecords, filters],
  );

  const toggle = (field: FacetField, value: string) =>
    setFilters((f) => toggleFilterValue(f, field, value));

  const renderPanel = (panel: PanelConfig) => {
    if (panel.kind === "collapsed") {
      return <CollapsedPanel key={panel.titleKey} title={ta(panel.titleKey)} />;
    }
    if (panel.kind === "static") {
      return (
        <FacetPanel
          key={panel.titleKey}
          title={ta(panel.titleKey)}
          rows={
            panel.valueKey && filtered.length > 0
              ? [{ label: ta(panel.valueKey), value: filtered.length }]
              : undefined
          }
        />
      );
    }
    // Facet counts ignore the panel's own filter (cross-filter semantics).
    const scoped = applyFilters(modeRecords, filters, panel.field);
    const selected = filters[panel.field] ?? [];
    const rows = facetCounts(scoped, panel.field).map((c) => ({
      label: resolveLabel(ta, c.value),
      value: c.count,
      key: c.value,
      selected: selected.includes(c.value),
    }));
    return (
      <FacetPanel
        key={panel.titleKey}
        title={ta(panel.titleKey)}
        rows={rows.length > 0 ? rows : undefined}
        footer={rows.length > 0 ? { rows: rows.length } : undefined}
        onRowClick={(key) => toggle(panel.field, key)}
      />
    );
  };

  const listItems: FlawListItem[] = filtered.map((r) => ({
    room: r.room,
    title: resolveLabel(ta, r.title),
    createdBy: r.createdBy,
    createdByGroup: resolveLabel(ta, r.createdByGroup),
    completedBy: r.completedBy,
    accent: r.priority === "facets.high" ? RED : undefined,
  }));

  const quickActionCount = filtered.filter((r) => r.fromQuickAction).length;
  const datesChanged = dates[0] !== DEMO_DATE || dates[1] !== DEMO_DATE;

  const activeChips = (Object.keys(filters) as FacetField[]).flatMap((field) =>
    (filters[field] ?? []).map((value) => ({ field, value })),
  );

  // Chip labels borrow the owning panel's title so "Medium" reads as
  // "Priority: Medium" instead of an orphaned value.
  const panelTitleByField = new Map(
    [...leftPanels, ...rightPanels]
      .filter((p): p is Extract<PanelConfig, { kind: "facet" }> => p.kind === "facet")
      .map((p) => [p.field, p.titleKey] as const),
  );

  const exportCsv = () => {
    downloadCsv(
      csvFilename,
      [
        ta("panels.rooms"),
        ta("panels.code"),
        ta("csv.title"),
        ta("panels.category"),
        ta("panels.priority"),
        ta("panels.createdBy"),
        ta("panels.groupCreatedBy"),
        ta("panels.completedBy"),
        ta("panels.creationDate"),
      ],
      filtered.map((r) => [
        r.room,
        resolveLabel(ta, r.code),
        resolveLabel(ta, r.title),
        resolveLabel(ta, r.category),
        resolveLabel(ta, r.priority),
        r.createdBy,
        resolveLabel(ta, r.createdByGroup),
        r.completedBy ?? "",
        r.date,
      ]),
    );
  };

  const getData = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 300);
  };

  return (
    <AnalyticsPageFrame>
      <AnalyticsHeader title={ta(headerKey)} meta="> 0:00 30.1.2026" />
      <ControlsRow radioName={radioName} mode={mode} onModeChange={setMode} />
      <FilterRow
        dates={dates}
        onDateChange={(i, v) =>
          setDates((d) => (i === 0 ? [v, d[1]] : [d[0], v]))
        }
        onExport={exportCsv}
        onGetData={getData}
        loading={loading}
      />
      {activeChips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {activeChips.map(({ field, value }) => (
            <span
              key={`${field}:${value}`}
              className="flex items-center gap-1.5 rounded-full bg-teal-600 px-3 py-1 text-[11px] text-white"
            >
              {ta(panelTitleByField.get(field) ?? "panels.code")}:{" "}
              {resolveLabel(ta, value)}
              <button
                type="button"
                onClick={() => toggle(field, value)}
                className="font-bold hover:opacity-70"
                aria-label={ta("common.removeFilter")}
              >
                ✕
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => setFilters({})}
            className="text-[11px] text-gray-500 underline hover:text-gray-700"
          >
            {ta("common.clearAll")}
          </button>
        </div>
      )}
      <SectionTitle label={ta(sectionKey)} count={filtered.length} chip={sectionChip} />
      <DashboardColumns
        left={leftPanels.map(renderPanel)}
        middle={
          <div>
            {(quickActionCount > 0 || datesChanged) && (
              <div className="mb-1.5 space-y-0.5 text-[11px] text-gray-400">
                {datesChanged && <div>{ta("common.demoDateNote")}</div>}
                {quickActionCount > 0 && (
                  <div>
                    {/* Param is `n`, not `count`, to sidestep i18next plural-suffix lookup */}
                    {t("workday.analytics.common.fromQuickActions", {
                      n: quickActionCount,
                    })}
                  </div>
                )}
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center border border-gray-200 bg-white py-10">
                <Spinner size={20} />
              </div>
            ) : (
              <FlawList items={listItems} />
            )}
          </div>
        }
        right={rightPanels.map(renderPanel)}
      />
    </AnalyticsPageFrame>
  );
}
