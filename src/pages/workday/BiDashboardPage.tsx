// Mock of an embedded Apache Superset dashboard ("Tasks [Showcase]").
// Charts are hand-rolled inline SVG because the prototype must not add
// chart libraries — the real product embeds Superset instead.
//
// Interactive demo behaviors: cursor tooltips, legend hover/exclude,
// Date/Property filters that reshape the charts, an Automated tab with its
// own two charts, per-card PNG export + data modal, and a toast on actions
// the demo does not support.

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { PALETTE, arcPath, layoutDonut, type Slice } from "./bi/chartUtils";
import { useChartTooltip, TipRow } from "./bi/useChartTooltip";
import { ChartCard, type DataRow } from "./bi/ChartCard";

const SUPERSET_BLUE = "#20A7C9";
const LINK_BLUE = "#1985A0";

// ---------------------------------------------------------------- filters

type DateRange = "lastWeek" | "thisWeek" | "lastMonth";

// Donut totals scale with the selected date range (demo-grade numbers).
const DATE_FACTOR: Record<DateRange, number> = { lastWeek: 1, thisWeek: 0.6, lastMonth: 4 };
const DATE_OPTIONS: DateRange[] = ["lastWeek", "thisWeek", "lastMonth"];

// i18n key suffixes under "workday.bi." — translated at render time.
const HOTELS = ["hotelCrown", "hotelPanorama", "hotelPlaza", "hotelGrand"];

// [labelKey, option count] — decorative dropdowns show "{count} options".
const DECOR_FIELDS: Array<[string, number]> = [
  ["fieldRoom", 29],
  ["fieldCreatedByUser", 61],
  ["fieldCreatedByUserGroup", 8],
  ["fieldCompletedByUser", 86],
  ["fieldCompletedByUserGroup", 11],
];

function SupersetLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="34" height="20" viewBox="0 0 34 20" aria-hidden>
        <circle cx="10" cy="10" r="6.5" fill="none" stroke={SUPERSET_BLUE} strokeWidth="4" />
        <circle cx="24" cy="10" r="6.5" fill="none" stroke={SUPERSET_BLUE} strokeWidth="4" />
      </svg>
      <span className="text-lg font-semibold tracking-tight text-[#1b3a4f]">Superset</span>
    </div>
  );
}

function SelectChevron() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden
      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
    >
      <path d="M1.5 3.5L5 7l3.5-3.5" fill="none" stroke="#879399" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SELECT_CLASS =
  "w-full appearance-none rounded border border-gray-300 bg-white px-2.5 py-1.5 pr-7 text-[12px] text-[#333] outline-none focus:border-[#20A7C9]";

function FiltersPanel({
  date,
  property,
  decor,
  onDate,
  onProperty,
  onDecor,
  onClearAll,
  anyActive,
}: {
  date: DateRange;
  property: string;
  decor: Record<string, string>;
  onDate: (d: DateRange) => void;
  onProperty: (p: string) => void;
  onDecor: (field: string, value: string) => void;
  onClearAll: () => void;
  anyActive: boolean;
}) {
  const { t } = useTranslation();
  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 pb-1 pt-4">
        <span className="text-[15px] font-semibold text-[#333]">{t("workday.bi.filters")}</span>
        <div className="flex items-center gap-2 text-[#879399]">
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
            <circle cx="8" cy="8" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <path
              d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
            <path d="M9 3L4.5 8 9 13M13 3L8.5 8l4.5 5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <button className="px-4 py-2 text-left text-[11px] font-semibold tracking-wide" style={{ color: SUPERSET_BLUE }}>
        {t("workday.bi.addEditFilters")}
      </button>
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4 pt-2">
        <div>
          <div className="mb-1 text-[11px] text-gray-500">{t("workday.bi.fieldDate")}</div>
          <div className="relative">
            <select className={SELECT_CLASS} value={date} onChange={(e) => onDate(e.target.value as DateRange)}>
              {DATE_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {t(`workday.bi.${d}`)}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </div>
        <div>
          <div className="mb-1 text-[11px] text-gray-500">{t("workday.bi.fieldProperty")}</div>
          <div className="relative">
            <select className={SELECT_CLASS} value={property} onChange={(e) => onProperty(e.target.value)}>
              <option value="all">{t("workday.bi.filterAll")}</option>
              {HOTELS.map((h) => (
                <option key={h} value={h}>
                  {t(`workday.bi.${h}`)}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </div>
        {DECOR_FIELDS.map(([labelKey, count]) => (
          <div key={labelKey}>
            <div className="mb-1 text-[11px] text-gray-500">{t(`workday.bi.${labelKey}`)}</div>
            <div className="relative">
              <select
                className={SELECT_CLASS}
                value={decor[labelKey] ?? ""}
                onChange={(e) => onDecor(labelKey, e.target.value)}
              >
                <option value="">{t("workday.bi.optionsCount", { count })}</option>
                {[1, 2, 3].map((n) => (
                  <option key={n} value={String(n)}>
                    {t("workday.bi.demoOption", { num: n })}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </div>
        ))}
      </div>
      <button
        className="border-t border-gray-100 py-3 text-center text-[11px] font-semibold tracking-wide"
        style={{ color: anyActive ? LINK_BLUE : "#9ca3af" }}
        onClick={onClearAll}
      >
        {t("workday.bi.clearAll")}
      </button>
    </aside>
  );
}

// ------------------------------------------------------------- donut data

const DONUT_A: Slice[] = [
  { labelKey: "legendToDo", value: 84, color: PALETTE[0] },
  { labelKey: "legendCleaningRequest", value: 42, color: PALETTE[1] },
  ...[
    "legendRefillMinibar",
    "legendGuestComplaint",
    "legendWeddingAnniversary",
    "legendTaxiReservation",
    "legendShiftHandover",
    "legendPmCheckFireAlarm",
    "legendUrgentCleaning",
    "legendBabyCot",
    "legendGuestNote",
    "legendFyi",
    "legendLateCheckOut",
    "legendEarlyArrival",
    "legendAddLetter",
    "legendInternalMeeting",
    "legendBuyOrder",
    "legendChampagne",
  ].map((labelKey, i) => ({ labelKey, value: 21, color: PALETTE[(i + 2) % PALETTE.length] })),
];

// -------------------------------------------------------- generic donut svg

function DonutSvg({
  slices,
  cx,
  cy,
  width,
  height,
  totalText,
  hovered,
  onHover,
  leaderCount = 0,
}: {
  slices: Slice[];
  cx: number;
  cy: number;
  width: number;
  height: number;
  totalText: string;
  hovered: string | null;
  onHover: (key: string | null) => void;
  leaderCount?: number;
}) {
  const { t } = useTranslation();
  const { moveTip, hideTip, tipNode } = useChartTooltip();
  const r = 58;
  const segments = layoutDonut(slices);
  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[230px] w-full min-w-0">
        {segments.map((s) => (
          <path
            key={s.labelKey}
            // A 360° arc degenerates (start == end point), so cap just under
            // a full turn — matters for near-full rings.
            d={arcPath(cx, cy, r, s.start, Math.min(s.end, s.start + 359.98))}
            fill="none"
            stroke={s.color}
            strokeWidth={hovered === s.labelKey ? 33 : 26}
            className="cursor-pointer transition-[stroke-width] duration-100"
            onMouseEnter={() => onHover(s.labelKey)}
            onMouseMove={(e) =>
              moveTip(
                e,
                <TipRow
                  color={s.color}
                  label={t(`workday.bi.${s.labelKey}`)}
                  value={t("workday.bi.tooltipValue", { count: s.value, percent: s.percent.toFixed(2) })}
                />,
              )
            }
            onMouseLeave={() => {
              onHover(null);
              hideTip();
            }}
          />
        ))}
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="12" fontWeight="600" fill="#333">
          {totalText}
        </text>
        {segments.slice(0, leaderCount).map((s) => {
          const r2 = r + 13;
          const rad = ((s.mid - 90) * Math.PI) / 180;
          const x1 = cx + (r + 15) * Math.cos(rad);
          const y1 = cy + (r + 15) * Math.sin(rad);
          const x2 = cx + (r2 + 12) * Math.cos(rad);
          const y2 = cy + (r2 + 12) * Math.sin(rad);
          const right = x2 >= cx;
          const x3 = x2 + (right ? 10 : -10);
          return (
            <g key={`leader-${s.labelKey}`} pointerEvents="none">
              <polyline points={`${x1},${y1} ${x2},${y2} ${x3},${y2}`} fill="none" stroke={s.color} strokeWidth="1" />
              <text x={x3 + (right ? 3 : -3)} y={y2 + 3} textAnchor={right ? "start" : "end"} fontSize="9" fill="#555">
                {t(`workday.bi.${s.labelKey}`)}
              </text>
            </g>
          );
        })}
      </svg>
      {tipNode}
    </>
  );
}

// -------------------------------------------------- created-by-users cards

function AssignmentCodeDonutCard({
  factor,
  filterCount,
  excluded,
  onToggle,
}: {
  factor: number;
  filterCount: number;
  excluded: Set<string>;
  onToggle: (key: string) => void;
}) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<string | null>(null);
  const scaled = DONUT_A.map((s) => ({ ...s, value: Math.round(s.value * factor) }));
  const included = scaled.filter((s) => !excluded.has(s.labelKey));
  const total = included.reduce((sum, s) => sum + s.value, 0);
  const data: DataRow[] = included.map((s) => ({ label: t(`workday.bi.${s.labelKey}`), value: s.value }));
  return (
    <ChartCard
      title={t("workday.bi.chartAssignmentCode")}
      filterCount={filterCount}
      exportName="created-task-per-assignment-code"
      data={data}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <div className="min-w-0 flex-1">
          <DonutSvg
            slices={included}
            cx={105}
            cy={95}
            width={230}
            height={190}
            totalText={t("workday.bi.total", { count: total })}
            hovered={hovered}
            onHover={setHovered}
            leaderCount={3}
          />
        </div>
        <div className="grid max-h-[220px] w-[132px] shrink-0 content-start gap-y-[3px] overflow-y-auto pr-1">
          {scaled.map((s) => {
            const isExcluded = excluded.has(s.labelKey);
            return (
              <button
                key={s.labelKey}
                className={`flex items-center gap-1.5 text-left text-[10px] leading-tight text-[#555] ${
                  isExcluded ? "opacity-40" : ""
                } ${hovered === s.labelKey ? "font-semibold" : ""}`}
                onClick={() => onToggle(s.labelKey)}
                onMouseEnter={() => !isExcluded && setHovered(s.labelKey)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: s.color }} />
                <span className={`truncate ${isExcluded ? "line-through" : ""}`}>{t(`workday.bi.${s.labelKey}`)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </ChartCard>
  );
}

function SubtypeDonutCard({ factor, filterCount }: { factor: number; filterCount: number }) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<string | null>(null);
  const slices: Slice[] = [
    { labelKey: "legendInternal", value: Math.round(441 * factor), color: PALETTE[0] },
    { labelKey: "legendOther", value: Math.round(2 * factor), color: PALETTE[3] },
  ];
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const data: DataRow[] = slices.map((s) => ({ label: t(`workday.bi.${s.labelKey}`), value: s.value }));
  return (
    <ChartCard title={t("workday.bi.chartSubtype")} filterCount={filterCount} exportName="created-task-subtype" data={data}>
      <div className="flex justify-center px-3 py-3">
        <div className="w-full max-w-[340px]">
          <DonutSvg
            slices={slices}
            cx={130}
            cy={92}
            width={260}
            height={190}
            totalText={t("workday.bi.total", { count: total })}
            hovered={hovered}
            onHover={setHovered}
            leaderCount={1}
          />
        </div>
      </div>
    </ChartCard>
  );
}

// ------------------------------------------------------------- bar charts

// Per-completion-range contribution of each hotel; the visible bar is the
// sum of the ranges currently toggled on in the legend.
type RangeKey = "legendCompleted1Day" | "legendCompleted1To3Days" | "legendCompletedTruncated";
const RANGE_KEYS: RangeKey[] = ["legendCompleted1Day", "legendCompleted1To3Days", "legendCompletedTruncated"];
const RANGE_COLORS: Record<RangeKey, string> = {
  legendCompleted1Day: "#3CCCCB",
  legendCompleted1To3Days: "#FCC700",
  legendCompletedTruncated: "#FF7F44",
};
const BAR_SERIES: Record<RangeKey, number[]> = {
  legendCompleted1Day: [70, 65, 55, 70],
  legendCompleted1To3Days: [35, 38, 30, 35],
  legendCompletedTruncated: [20, 22, 15, 20],
};
const Y_TICKS = [0, 30, 60, 90, 120, 150];

function BarLegendRow({
  ranges,
  onToggleRange,
}: {
  ranges: Set<RangeKey>;
  onToggleRange: (key: RangeKey) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 px-4 pt-2 text-[10px] text-[#555]">
      {RANGE_KEYS.map((key) => (
        <button
          key={key}
          className={`flex items-center gap-1 ${ranges.has(key) ? "" : "opacity-40"}`}
          onClick={() => onToggleRange(key)}
        >
          <span className="h-2.5 w-2.5" style={{ backgroundColor: RANGE_COLORS[key] }} />
          <span className={ranges.has(key) ? "" : "line-through"}>{t(`workday.bi.${key}`)}</span>
        </button>
      ))}
      <span className="ml-auto flex items-center gap-1 text-gray-400">
        <span>◀</span>
        <span className="text-[#555]">1/2</span>
        <span>▶</span>
        <button className="ml-1 rounded-full border border-gray-300 px-1.5 py-px text-[9px] text-[#555]">All</button>
        <button className="rounded-full border border-gray-300 px-1.5 py-px text-[9px] text-[#555]">Inv</button>
      </span>
    </div>
  );
}

function BarChartSvg({ hotelKeys, values }: { hotelKeys: string[]; values: number[] }) {
  const { t } = useTranslation();
  const { moveTip, hideTip, tipNode } = useChartTooltip();
  const [hovered, setHovered] = useState<number | null>(null);
  const w = 340;
  const h = 200;
  const left = 36;
  // Extra bottom space so the 45° hotel names don't clip out of the viewBox.
  const bottom = 58;
  const top = 10;
  const plotW = w - left - 12;
  const plotH = h - top - bottom;
  const max = 150;
  const y = (v: number) => top + plotH - (v / max) * plotH;
  const slot = plotW / Math.max(hotelKeys.length, 1);
  const barW = Math.min(34, slot * 0.6);
  return (
    <>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-[220px] w-full">
        {Y_TICKS.map((tick) => (
          <g key={tick}>
            <line x1={left} x2={w - 12} y1={y(tick)} y2={y(tick)} stroke="#eceef0" strokeWidth="1" />
            <text x={left - 6} y={y(tick) + 3} textAnchor="end" fontSize="9" fill="#879399">
              {tick}
            </text>
          </g>
        ))}
        <line x1={left} x2={left} y1={top} y2={top + plotH} stroke="#d5d9dc" strokeWidth="1" />
        <line x1={left} x2={w - 12} y1={top + plotH} y2={top + plotH} stroke="#d5d9dc" strokeWidth="1" />
        {values.map((v, i) => {
          const cx = left + slot * i + slot / 2;
          return v > 0 ? (
            <rect
              key={hotelKeys[i]}
              x={cx - barW / 2}
              y={y(v)}
              width={barW}
              height={top + plotH - y(v)}
              fill={hovered === i ? "#2FB5B4" : "#3CCCCB"}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(i)}
              onMouseMove={(e) =>
                moveTip(e, <TipRow color="#3CCCCB" label={t(`workday.bi.${hotelKeys[i]}`)} value={String(v)} />)
              }
              onMouseLeave={() => {
                setHovered(null);
                hideTip();
              }}
            />
          ) : null;
        })}
        {hotelKeys.map((key, i) => {
          const cx = left + slot * i + slot / 2;
          const ly = top + plotH + 10;
          return (
            <text
              key={key}
              x={cx}
              y={ly}
              fontSize="9"
              fill="#555"
              textAnchor="end"
              transform={`rotate(-45 ${cx} ${ly})`}
            >
              {t(`workday.bi.${key}`)}
            </text>
          );
        })}
      </svg>
      {tipNode}
    </>
  );
}

function CompletedTasksCard({
  hotelKeys,
  ranges,
  onToggleRange,
  filterCount,
}: {
  hotelKeys: string[];
  ranges: Set<RangeKey>;
  onToggleRange: (key: RangeKey) => void;
  filterCount: number;
}) {
  const { t } = useTranslation();
  const hotelIndices = hotelKeys.map((k) => HOTELS.indexOf(k));
  const values = hotelIndices.map((i) =>
    RANGE_KEYS.reduce((sum, key) => sum + (ranges.has(key) ? BAR_SERIES[key][i] : 0), 0),
  );
  const data: DataRow[] = hotelKeys.map((k, i) => ({ label: t(`workday.bi.${k}`), value: values[i] }));
  return (
    <ChartCard title={t("workday.bi.chartCompletedTasks")} filterCount={filterCount} exportName="completed-tasks" data={data}>
      <BarLegendRow ranges={ranges} onToggleRange={onToggleRange} />
      <div className="px-3 pb-3 pt-1">
        <BarChartSvg hotelKeys={hotelKeys} values={values} />
      </div>
    </ChartCard>
  );
}

function AvgCompletionCard({
  hotelKeys,
  ranges,
  onToggleRange,
  filterCount,
}: {
  hotelKeys: string[];
  ranges: Set<RangeKey>;
  onToggleRange: (key: RangeKey) => void;
  filterCount: number;
}) {
  const { t } = useTranslation();
  const data: DataRow[] = hotelKeys.map((k) => ({ label: t(`workday.bi.${k}`), value: 0 }));
  return (
    <ChartCard
      title={t("workday.bi.chartAvgCompletion")}
      filterCount={filterCount}
      exportName="avg-completion-tasks-time"
      data={data}
    >
      <BarLegendRow ranges={ranges} onToggleRange={onToggleRange} />
      <div className="px-3 pb-3 pt-1">
        {/* Deliberately empty chart: the source dashboard has no data here,
            but the axes must still render like Superset's empty state. */}
        <BarChartSvg hotelKeys={hotelKeys} values={hotelKeys.map(() => 0)} />
      </div>
    </ChartCard>
  );
}

// ------------------------------------------------------- automated cards

function AutomatedDonutCard({ factor, filterCount }: { factor: number; filterCount: number }) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<string | null>(null);
  const total = Math.round(84 * factor);
  const slices: Slice[] = [{ labelKey: "legendAutomatedTask", value: total, color: PALETTE[0] }];
  const data: DataRow[] = [{ label: t("workday.bi.legendAutomatedTask"), value: total }];
  return (
    <ChartCard title={t("workday.bi.chartAutomatedTasks")} filterCount={filterCount} exportName="automated-tasks" data={data}>
      <div className="flex justify-center px-3 py-3">
        <div className="w-full max-w-[340px]">
          <DonutSvg
            slices={slices}
            cx={130}
            cy={92}
            width={260}
            height={190}
            totalText={t("workday.bi.total", { count: total })}
            hovered={hovered}
            onHover={setHovered}
            leaderCount={1}
          />
        </div>
      </div>
    </ChartCard>
  );
}

// Housekeepers and their automated-task counts; done + open sums to the
// automated donut's total of 84 at factor 1.
const HOUSEKEEPERS: Array<{ key: string; done: number; open: number }> = [
  { key: "hkMaria", done: 18, open: 2 },
  { key: "hkSofia", done: 15, open: 3 },
  { key: "hkPetra", done: 12, open: 1 },
  { key: "hkIvana", done: 10, open: 1 },
  { key: "hkElena", done: 8, open: 1 },
  { key: "hkNina", done: 6, open: 1 },
  { key: "hkKatja", done: 5, open: 1 },
];
const DONE_COLOR = "#5AC189";
const OPEN_COLOR = "#B2B2B2";

function WhoCompletesCard({ factor, filterCount }: { factor: number; filterCount: number }) {
  const { t } = useTranslation();
  const { moveTip, hideTip, tipNode } = useChartTooltip();
  const [hovered, setHovered] = useState<string | null>(null);
  const rows = HOUSEKEEPERS.map((p) => ({
    ...p,
    done: Math.round(p.done * factor),
    open: Math.round(p.open * factor),
  }));
  const max = Math.max(...rows.map((p) => p.done + p.open));
  // Round the axis up to a tidy tick step.
  const step = Math.max(1, Math.ceil(max / 4));
  const axisMax = step * 4;
  const w = 340;
  const left = 88;
  const right = 12;
  const top = 8;
  const rowH = 23;
  const barH = 13;
  const plotW = w - left - right;
  const h = top + rows.length * rowH + 24;
  const x = (v: number) => left + (v / axisMax) * plotW;
  const ticks = [0, step, step * 2, step * 3, step * 4];
  const seg = (p: (typeof rows)[number], series: "done" | "open") => {
    const name = t(`workday.bi.${p.key}`);
    const label = series === "done" ? t("workday.bi.legendDone") : t("workday.bi.legendNotDone");
    const color = series === "done" ? DONE_COLOR : OPEN_COLOR;
    const value = series === "done" ? p.done : p.open;
    const x0 = series === "done" ? x(0) : x(p.done);
    const id = `${p.key}-${series}`;
    return (
      <rect
        key={id}
        x={x0}
        y={0}
        width={Math.max(x(value) - x(0), 0)}
        height={barH}
        fill={color}
        opacity={hovered === null || hovered === id ? 1 : 0.45}
        className="cursor-pointer"
        onMouseEnter={() => setHovered(id)}
        onMouseMove={(e) => moveTip(e, <TipRow color={color} label={`${name} · ${label}`} value={String(value)} />)}
        onMouseLeave={() => {
          setHovered(null);
          hideTip();
        }}
      />
    );
  };
  const data: DataRow[] = rows.map((p) => ({
    label: t(`workday.bi.${p.key}`),
    value: `${p.done} / ${p.open}`,
  }));
  return (
    <ChartCard
      title={t("workday.bi.chartWhoCompletes")}
      filterCount={filterCount}
      exportName="who-completes-automated-tasks"
      data={data}
    >
      <div className="flex items-center gap-4 px-4 pt-2 text-[10px] text-[#555]">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5" style={{ backgroundColor: DONE_COLOR }} />
          {t("workday.bi.legendDone")}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5" style={{ backgroundColor: OPEN_COLOR }} />
          {t("workday.bi.legendNotDone")}
        </span>
      </div>
      <div className="px-3 pb-3 pt-1">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={x(tick)} x2={x(tick)} y1={top} y2={top + rows.length * rowH} stroke="#eceef0" strokeWidth="1" />
              <text x={x(tick)} y={top + rows.length * rowH + 12} textAnchor="middle" fontSize="9" fill="#879399">
                {tick}
              </text>
            </g>
          ))}
          <line x1={left} x2={left} y1={top} y2={top + rows.length * rowH} stroke="#d5d9dc" strokeWidth="1" />
          {rows.map((p, i) => (
            <g key={p.key} transform={`translate(0 ${top + i * rowH + (rowH - barH) / 2})`}>
              <text x={left - 6} y={barH / 2 + 3} textAnchor="end" fontSize="9" fill="#555">
                {t(`workday.bi.${p.key}`)}
              </text>
              {seg(p, "done")}
              {seg(p, "open")}
            </g>
          ))}
        </svg>
      </div>
      {tipNode}
    </ChartCard>
  );
}

// ------------------------------------------------------------------ page

export function BiDashboardPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"users" | "automated">("users");
  const [date, setDate] = useState<DateRange>("lastWeek");
  const [property, setProperty] = useState("all");
  const [decor, setDecor] = useState<Record<string, string>>({});
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [ranges, setRanges] = useState<Set<RangeKey>>(new Set(RANGE_KEYS));
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  };

  const factor = DATE_FACTOR[date];
  const hotelKeys = property === "all" ? HOTELS : [property];
  // The Date filter always applies (there is no "all time"), so the badge
  // starts at 1 like the real dashboard; Property adds a second filter.
  const filterCount = 1 + (property !== "all" ? 1 : 0);
  const anyActive =
    date !== "lastWeek" ||
    property !== "all" ||
    excluded.size > 0 ||
    ranges.size !== RANGE_KEYS.length ||
    Object.values(decor).some((v) => v !== "");

  const toggleSlice = (key: string) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleRange = (key: RangeKey) =>
    setRanges((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const clearAll = () => {
    setDate("lastWeek");
    setProperty("all");
    setDecor({});
    setExcluded(new Set());
    setRanges(new Set(RANGE_KEYS));
  };

  const tabClass = (active: boolean) =>
    active ? "-mb-px border-b-2 pb-2 font-medium" : "border-b-2 border-transparent pb-2 text-[#555]";

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f7f7f7]">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        <div className="flex items-center gap-7">
          <SupersetLogo />
          <nav className="flex items-center gap-6 text-[13px] text-[#555]">
            <span>{t("workday.bi.navDashboards")}</span>
            <span>{t("workday.bi.navCharts")}</span>
            <span>{t("workday.bi.navDatasets")}</span>
            <span>SQL</span>
          </nav>
        </div>
        <div className="flex items-center gap-5 text-[13px] text-[#555]">
          <span className="text-lg leading-none text-[#879399]">＋</span>
          <span className="flex items-center gap-1">
            {t("workday.bi.navSettings")}
            <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
              <path d="M1.5 3.5L5 7l3.5-3.5" fill="none" stroke="#879399" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <FiltersPanel
          date={date}
          property={property}
          decor={decor}
          onDate={setDate}
          onProperty={setProperty}
          onDecor={(field, value) => setDecor((prev) => ({ ...prev, [field]: value }))}
          onClearAll={clearAll}
          anyActive={anyActive}
        />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-[#222]">{t("workday.bi.dashboardTitle")}</h2>
              <span className="text-lg text-gray-400">☆</span>
              <span className="rounded border border-gray-300 bg-gray-100 px-1.5 py-px text-[10px] text-gray-500">
                {t("workday.bi.published")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="rounded border bg-white px-3 py-1.5 text-[11px] font-semibold tracking-wide"
                style={{ borderColor: SUPERSET_BLUE, color: LINK_BLUE }}
                onClick={() => showToast(t("workday.bi.toastEditDemo"))}
              >
                {t("workday.bi.editDashboard")}
              </button>
              <span className="text-lg leading-none text-[#879399]">⋯</span>
            </div>
          </div>

          <div className="mt-3 flex gap-7 border-b border-gray-200 px-5 text-[13px]">
            <button
              className={tabClass(tab === "users")}
              style={tab === "users" ? { borderColor: SUPERSET_BLUE, color: LINK_BLUE } : undefined}
              onClick={() => setTab("users")}
            >
              {t("workday.bi.tabCreatedByUsers")}
            </button>
            <button
              className={tabClass(tab === "automated")}
              style={tab === "automated" ? { borderColor: SUPERSET_BLUE, color: LINK_BLUE } : undefined}
              onClick={() => setTab("automated")}
            >
              {t("workday.bi.tabAutomated")}
            </button>
          </div>

          {tab === "users" ? (
            <div className="grid grid-cols-1 gap-4 p-5 xl:grid-cols-2">
              <AssignmentCodeDonutCard factor={factor} filterCount={filterCount} excluded={excluded} onToggle={toggleSlice} />
              <SubtypeDonutCard factor={factor} filterCount={filterCount} />
              <CompletedTasksCard hotelKeys={hotelKeys} ranges={ranges} onToggleRange={toggleRange} filterCount={filterCount} />
              <AvgCompletionCard hotelKeys={hotelKeys} ranges={ranges} onToggleRange={toggleRange} filterCount={filterCount} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-5 xl:grid-cols-2">
              <AutomatedDonutCard factor={factor} filterCount={filterCount} />
              <WhoCompletesCard factor={factor} filterCount={filterCount} />
            </div>
          )}
        </main>
      </div>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#333] px-4 py-2 text-[12px] text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
