import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { downloadCsv } from "@/pages/workday/analytics/data";
import { housekeepers } from "@/pages/workday/data";
import { useRoomsStore } from "@/pages/workday/rooms/store";

const TEAL = "#16A3A3";
const DARK = "#37474F";

const P = "workday.cleaningTimes";

function ChevronDown({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8l5 5 5-5" />
    </svg>
  );
}

function DocumentIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  );
}

function CalendarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function BarChartIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="12" width="4" height="8" rx="1" />
      <rect x="10" y="7" width="4" height="13" rx="1" />
      <rect x="16" y="10" width="4" height="10" rx="1" />
    </svg>
  );
}

function FunnelIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
    </svg>
  );
}

function InfoIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function ArrowDownIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  );
}

function MinusIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
    </svg>
  );
}

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

type TabId = "perRoomStatus" | "perRoomType" | "perUser" | "perRoom";

const TAB_IDS: TabId[] = ["perRoomStatus", "perRoomType", "perUser", "perRoom"];

type FilterId = "status" | "roomType" | "user" | "hours";

type FilterState = Record<FilterId, string>;

const NO_FILTERS: FilterState = { status: "all", roomType: "all", user: "all", hours: "all" };

/** Dropdown option: `labelKey` renders via i18n, `label` is raw (names, hours). */
interface FilterOption {
  value: string;
  labelKey?: string;
  label?: string;
}

const FILTER_OPTIONS: Record<FilterId, FilterOption[]> = {
  status: [
    { value: "all", labelKey: `${P}.filters.allStatuses` },
    { value: "stayover", labelKey: `${P}.rows.stayover` },
    { value: "empty", labelKey: `${P}.rows.empty` },
    { value: "departure", labelKey: `${P}.rows.departure` },
  ],
  roomType: [
    { value: "all", labelKey: `${P}.filters.allRoomTypes` },
    { value: "standard", labelKey: `${P}.roomTypes.standard` },
    { value: "deluxeTwin", labelKey: `${P}.roomTypes.deluxeTwin` },
    { value: "suite", labelKey: `${P}.roomTypes.suite` },
  ],
  user: [
    { value: "all", labelKey: `${P}.filters.allUsers` },
    { value: housekeepers[0], label: housekeepers[0] },
    { value: housekeepers[1], label: housekeepers[1] },
    { value: housekeepers[2], label: housekeepers[2] },
  ],
  hours: [
    { value: "all", labelKey: `${P}.filters.allHours` },
    { value: "08:00 - 12:00", label: "08:00 - 12:00" },
    { value: "12:00 - 16:00", label: "12:00 - 16:00" },
  ],
};

type StatCard = {
  titleKey: string;
  value: string;
  valueColor: string;
  topColor: string;
  noteKey: string;
  noteParams?: Record<string, unknown>;
  noteIcon: "down" | "minus";
};

const STAT_CARDS: StatCard[] = [
  {
    titleKey: `${P}.stats.averageTimeDeparture`,
    value: "19",
    valueColor: TEAL,
    topColor: TEAL,
    noteKey: `${P}.stats.lessThanExpected`,
    noteParams: { percent: 5 },
    noteIcon: "down",
  },
  {
    titleKey: `${P}.stats.averageTimeStayover`,
    value: "29",
    valueColor: "#7FC4D8",
    topColor: "#7FC4D8",
    noteKey: `${P}.stats.missingInformation`,
    noteParams: undefined,
    noteIcon: "minus",
  },
  {
    titleKey: `${P}.stats.averageTimeEmpty`,
    value: "31",
    valueColor: "#F0C04C",
    topColor: "#F0C04C",
    noteKey: `${P}.stats.missingInformation`,
    noteParams: undefined,
    noteIcon: "minus",
  },
];

// Column 2..7 keys are shared by every tab; column 1 is tab-specific.
const VALUE_COLUMN_KEYS = [
  `${P}.table.nrOfRooms`,
  `${P}.table.cleaningCreditsCompleted`,
  `${P}.table.extraTaskCredits`,
  `${P}.table.expectedTimeSpent`,
  `${P}.table.actualTimeSpent`,
  `${P}.table.timeDifference`,
];

const FIRST_COLUMN_KEY: Record<TabId, string> = {
  perRoomStatus: `${P}.table.status`,
  perRoomType: `${P}.table.roomType`,
  perUser: `${P}.table.user`,
  perRoom: `${P}.table.room`,
};

interface TableRow {
  /** Stable id — for perRoomStatus it is the status filter value */
  id: string;
  label: string;
  cells: string[];
}

export function CleaningTimesPage() {
  const { t } = useTranslation();
  const rooms = useRoomsStore((s) => s.rooms);

  const [activeTab, setActiveTab] = useState<TabId>("perRoomStatus");
  const [filters, setFilters] = useState<FilterState>(NO_FILTERS);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const minutes = (m: number) =>
    t(`${P}.times.minutesShort`, { m: Math.abs(m) });
  const diffLabel = (m: number) => (m < 0 ? `- ${minutes(m)}` : minutes(m));

  /** Deterministic plausible demo numbers so rows differ but stay stable. */
  const demoCells = (i: number, nrRooms: number): string[] => {
    const credits = 24 + ((i * 7) % 30);
    const extra = (i * 3) % 5;
    const expected = credits + extra;
    const diff = ((i * 11) % 13) - 6;
    return [
      String(nrRooms),
      String(credits),
      String(extra),
      minutes(expected),
      minutes(expected + diff),
      diffLabel(diff),
    ];
  };

  const tableRows: TableRow[] = useMemo(() => {
    switch (activeTab) {
      case "perRoomStatus":
        return [
          {
            id: "stayover",
            label: t(`${P}.rows.stayover`),
            cells: ["6", "0", "0", "", t(`${P}.times.hours2Minutes53`), t(`${P}.times.hours2Minutes53`)],
          },
          {
            id: "empty",
            label: t(`${P}.rows.empty`),
            cells: ["4", "0", "0", "", t(`${P}.times.hours2Minutes3`), t(`${P}.times.hours2Minutes3`)],
          },
          {
            id: "departure",
            label: t(`${P}.rows.departure`),
            cells: ["2", "40", "0", t(`${P}.times.minutes40`), t(`${P}.times.minutes36Seconds1`), t(`${P}.times.minusMinutes3Seconds59`)],
          },
        ];
      case "perRoomType":
        return (["standard", "deluxeTwin", "suite"] as const).map((type, i) => ({
          id: type,
          label: t(`${P}.roomTypes.${type}`),
          cells: demoCells(i + 1, [14, 9, 5][i]),
        }));
      case "perUser":
        return housekeepers.map((name, i) => ({
          id: name,
          label: name,
          cells: demoCells(i + 2, 3 + (i % 3)),
        }));
      case "perRoom":
        return rooms.slice(0, 10).map((room, i) => ({
          id: String(room.number),
          label: String(room.number),
          cells: demoCells(i + 3, 1),
        }));
    }
    // t changes with language, so the memo must recompute on re-render anyway;
    // listing it keeps the lint contract honest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, rooms, t]);

  const visibleRows = tableRows.filter((row) => {
    // Only the status dropdown really filters data, and only where it maps to
    // rows (the per-room-status tab); the other dropdowns are demo chips.
    if (activeTab === "perRoomStatus" && filters.status !== "all" && row.id !== filters.status) {
      return false;
    }
    return row.label.toLowerCase().includes(search.trim().toLowerCase());
  });

  const activeChips = (Object.keys(filters) as FilterId[]).filter(
    (id) => filters[id] !== "all",
  );

  const chipLabel = (id: FilterId) => {
    const opt = FILTER_OPTIONS[id].find((o) => o.value === filters[id]);
    return opt?.labelKey ? t(opt.labelKey) : opt?.label ?? filters[id];
  };

  const exportCsv = () => {
    downloadCsv(
      "cleaning-times.csv",
      [t(FIRST_COLUMN_KEY[activeTab]), ...VALUE_COLUMN_KEYS.map((k) => t(k))],
      visibleRows.map((row) => [row.label, ...row.cells]),
    );
  };

  const getData = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 300);
  };

  return (
    <div className="space-y-4 p-6" style={{ backgroundColor: "#F7F9FB" }}>
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: DARK }}>
          {t(`${P}.title`)}
        </h1>
        <button
          type="button"
          onClick={exportCsv}
          className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-300"
        >
          <DocumentIcon />
          <span>{t(`${P}.export`)}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Date range + GET DATA */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:border-gray-400"
        >
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <span>30.1.2026 - 30.1.2026</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
        <button
          type="button"
          onClick={getData}
          disabled={loading}
          className="flex items-center gap-2 rounded px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
          style={{ backgroundColor: TEAL }}
        >
          {loading && <Spinner className="h-4 w-4" />}
          {t(`${P}.getData`)}
        </button>
      </div>

      {/* Tab cards */}
      <div className="grid grid-cols-4 gap-4">
        {TAB_IDS.map((tab) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="relative flex items-center justify-center gap-2 overflow-hidden rounded-lg border border-gray-200 bg-white px-4 py-4 text-sm font-semibold shadow-sm hover:border-gray-300"
              style={{ color: active ? TEAL : "#9CA3AF" }}
            >
              {active && (
                <span
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: TEAL }}
                />
              )}
              <BarChartIcon className="h-5 w-5" />
              <span>{t(`${P}.tabs.${tab}`)}</span>
            </button>
          );
        })}
      </div>

      {/* Filters card */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: TEAL }}
            >
              <FunnelIcon className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold" style={{ color: DARK }}>
              {t(`${P}.filters.title`)}
            </span>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-3">
            {(Object.keys(FILTER_OPTIONS) as FilterId[]).map((id) => (
              <select
                key={id}
                value={filters[id]}
                onChange={(e) => setFilters((f) => ({ ...f, [id]: e.target.value }))}
                className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:border-gray-400"
              >
                {FILTER_OPTIONS[id].map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.labelKey ? t(opt.labelKey) : opt.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFilters(NO_FILTERS)}
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            {t(`${P}.filters.removeAll`)}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {STAT_CARDS.map((card) => (
          <div
            key={card.titleKey}
            className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow"
          >
            <span
              className="absolute inset-x-0 top-0 h-1.5"
              style={{ backgroundColor: card.topColor }}
            />
            <div className="flex items-center gap-1 text-xs font-semibold tracking-wide text-gray-400">
              <span>{t(card.titleKey)}</span>
              <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <div
              className="mt-2 text-6xl font-bold leading-none"
              style={{ color: card.valueColor }}
            >
              {card.value}
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              {card.noteIcon === "down" ? (
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: TEAL }}
                >
                  <ArrowDownIcon className="h-3.5 w-3.5" />
                </span>
              ) : (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-300 text-white">
                  <MinusIcon className="h-3.5 w-3.5" />
                </span>
              )}
              <span>{t(card.noteKey, card.noteParams)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown table for the active tab */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold" style={{ color: DARK }}>
              {t(`${P}.tabs.${activeTab}`)}
            </h2>
            {activeChips.map((id) => (
              <span
                key={id}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] text-white"
                style={{ backgroundColor: TEAL }}
              >
                {chipLabel(id)}
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, [id]: "all" }))}
                  className="font-bold hover:opacity-70"
                  aria-label={t(`${P}.filters.removeAll`)}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded border border-gray-300 px-3 py-1.5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(`${P}.search`)}
              className="w-40 border-none bg-transparent text-sm text-gray-600 outline-none placeholder:text-gray-400"
            />
            <SearchIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-teal-600">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-500">
                  {[FIRST_COLUMN_KEY[activeTab], ...VALUE_COLUMN_KEYS].map((col) => (
                    <th key={col} className="whitespace-nowrap px-4 py-3 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        {t(col)}
                        <ChevronDown className="h-3 w-3 text-gray-400" />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={i % 2 === 1 ? "bg-gray-50" : "bg-white"}
                    style={{ color: DARK }}
                  >
                    <td className="whitespace-nowrap px-4 py-3">{row.label}</td>
                    {row.cells.map((cell, j) => (
                      <td key={j} className="whitespace-nowrap px-4 py-3">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
                {visibleRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-xs text-gray-400"
                    >
                      {t(`${P}.noRows`)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
