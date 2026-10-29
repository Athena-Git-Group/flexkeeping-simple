import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { housekeepers } from "@/pages/workday/data";
import { useRoomsStore } from "@/pages/workday/rooms/store";
import {
  LOSTFOUND_DEMO_TODAY,
  PUBLIC_AREAS,
  useLostFoundStore,
  type LostFoundItem,
  type LostFoundLocation,
  type LostFoundStatus,
  type PublicArea,
} from "@/pages/workday/lostfound/store";

const TEAL = "#16A3A3";

const P = "workday.lostFound";

const STATUSES: LostFoundStatus[] = ["stored", "returned", "processed"];

// 狀態 chip 配色：保管中 amber / 已歸還 teal / 已處理 灰
const STATUS_CHIP: Record<LostFoundStatus, string> = {
  stored: "bg-amber-50 text-amber-700 border-amber-200",
  returned: "bg-teal-50 text-teal-700 border-teal-200",
  processed: "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_DOT: Record<LostFoundStatus, string> = {
  stored: "bg-amber-500",
  returned: "bg-[#16A3A3]",
  processed: "bg-gray-400",
};

function PlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ChevronDown({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8l5 5 5-5" />
    </svg>
  );
}

function CloseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function BoxIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}

function HandIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function HeartIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7.5-4.8-9.5-9A5.4 5.4 0 0 1 12 6.6 5.4 5.4 0 0 1 21.5 12c-2 4.2-9.5 9-9.5 9z" />
    </svg>
  );
}

// 下拉選單共用殼（比照 AllocationPage）：全螢幕透明層負責點外關閉，免掛 document listener
function Dropdown({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute left-0 z-40 mt-1 min-w-[9rem] rounded-md border border-gray-200 bg-white py-1 shadow-lg">
        {children}
      </div>
    </>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
          <h2 className="text-base font-semibold text-[#37474F]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="close"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  accent,
}: {
  icon: ReactNode;
  value: number;
  label: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold leading-tight text-[#37474F]">{value}</div>
        <div className="text-[11px] text-gray-400">{label}</div>
      </div>
    </div>
  );
}

interface Toast {
  id: number;
  message: string;
}

export function LostFoundPage() {
  const { t } = useTranslation();

  const items = useLostFoundStore((s) => s.items);
  const addItem = useLostFoundStore((s) => s.addItem);
  const setStatus = useLostFoundStore((s) => s.setStatus);
  const resetDemo = useLostFoundStore((s) => s.resetDemo);
  const rooms = useRoomsStore((s) => s.rooms);

  const [registerOpen, setRegisterOpen] = useState(false);
  const [statusMenuId, setStatusMenuId] = useState<string | null>(null);
  const [returnTarget, setReturnTarget] = useState<LostFoundItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<LostFoundStatus | "all">("all");
  const [search, setSearch] = useState("");

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const notify = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2500);
  }, []);

  const locationLabel = useCallback(
    (location: LostFoundLocation) =>
      location.kind === "room"
        ? t(`${P}.form.roomOption`, { number: location.room })
        : t(`${P}.areas.${location.area}`),
    [t],
  );

  const counts = useMemo(() => {
    const byStatus: Record<LostFoundStatus, number> = {
      stored: 0,
      returned: 0,
      processed: 0,
    };
    for (const item of items) byStatus[item.status] += 1;
    return byStatus;
  }, [items]);

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        locationLabel(item.location).toLowerCase().includes(q)
      );
    });
  }, [items, statusFilter, search, locationLabel]);

  const hasFilters = statusFilter !== "all" || search.trim() !== "";

  const handleStatusChange = (item: LostFoundItem, next: LostFoundStatus) => {
    setStatusMenuId(null);
    if (next === item.status) return;
    if (next === "returned") {
      setReturnTarget(item);
      return;
    }
    setStatus(item.id, next);
    notify(
      t(`${P}.toasts.statusChanged`, {
        item: item.name,
        status: t(`${P}.status.${next}`),
      }),
    );
  };

  const handleReturnConfirm = (name: string) => {
    if (!returnTarget) return;
    setStatus(returnTarget.id, "returned", name);
    notify(t(`${P}.toasts.returned`, { item: returnTarget.name, name }));
    setReturnTarget(null);
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto bg-[#F7F9FB] p-6">
      {/* 頁首 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#37474F]">{t(`${P}.title`)}</h1>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              resetDemo();
              setStatusFilter("all");
              setSearch("");
              notify(t(`${P}.toasts.reset`));
            }}
            className="text-[11px] text-gray-400 underline hover:text-gray-600"
          >
            {t(`${P}.resetDemo`)}
          </button>
          <button
            type="button"
            onClick={() => setRegisterOpen(true)}
            className="flex items-center gap-1.5 rounded px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
            style={{ backgroundColor: TEAL }}
          >
            <PlusIcon />
            {t(`${P}.register`)}
          </button>
        </div>
      </div>

      {/* 統計列 */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<BoxIcon />}
          value={counts.stored}
          label={t(`${P}.stats.stored`)}
          accent="#D97706"
        />
        <StatCard
          icon={<HandIcon />}
          value={counts.returned}
          label={t(`${P}.stats.returned`)}
          accent={TEAL}
        />
        <StatCard
          icon={<HeartIcon />}
          value={counts.processed}
          label={t(`${P}.stats.processed`)}
          accent="#78909C"
        />
      </div>

      {/* 篩選列 */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LostFoundStatus | "all")}
          className="rounded border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-[#37474F] focus:outline-none"
        >
          <option value="all">{t(`${P}.filters.allStatuses`)}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`${P}.status.${s}`)}
            </option>
          ))}
        </select>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(`${P}.filters.searchPlaceholder`)}
            className="w-64 rounded border border-gray-300 bg-white py-1.5 pl-8 pr-2.5 text-sm text-[#37474F] placeholder:text-gray-400 focus:outline-none"
          />
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setSearch("");
            }}
            className="text-xs text-gray-400 underline hover:text-gray-600"
          >
            {t(`${P}.filters.clear`)}
          </button>
        )}
      </div>

      {/* 清單 */}
      <div className="rounded-lg border border-gray-200 bg-white">
        {visibleItems.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-sm text-gray-400">
            <BoxIcon className="h-8 w-8 text-gray-300" />
            {t(`${P}.filters.empty`)}
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("all");
                  setSearch("");
                }}
                className="text-xs underline hover:text-gray-600"
                style={{ color: TEAL }}
              >
                {t(`${P}.filters.clear`)}
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wide text-gray-400">
                <th className="px-4 py-2.5 font-medium">{t(`${P}.table.id`)}</th>
                <th className="px-4 py-2.5 font-medium">{t(`${P}.table.item`)}</th>
                <th className="px-4 py-2.5 font-medium">{t(`${P}.table.location`)}</th>
                <th className="px-4 py-2.5 font-medium">{t(`${P}.table.foundDate`)}</th>
                <th className="px-4 py-2.5 font-medium">{t(`${P}.table.foundBy`)}</th>
                <th className="px-4 py-2.5 font-medium">{t(`${P}.table.status`)}</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-xs text-gray-400">{item.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#37474F]">{item.name}</div>
                    {item.description && (
                      <div className="mt-0.5 max-w-xs truncate text-[11px] text-gray-400">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#37474F]">
                    {locationLabel(item.location)}
                  </td>
                  <td className="px-4 py-3 text-[#37474F]">{item.foundDate}</td>
                  <td className="px-4 py-3 text-[#37474F]">{item.foundBy}</td>
                  <td className="px-4 py-3">
                    <div className="relative inline-block">
                      <button
                        type="button"
                        onClick={() =>
                          setStatusMenuId((prev) => (prev === item.id ? null : item.id))
                        }
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_CHIP[item.status]}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[item.status]}`} />
                        {t(`${P}.status.${item.status}`)}
                        <ChevronDown className="h-3 w-3 opacity-60" />
                      </button>
                      <Dropdown
                        open={statusMenuId === item.id}
                        onClose={() => setStatusMenuId(null)}
                      >
                        {STATUSES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleStatusChange(item, s)}
                            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-gray-50 ${
                              s === item.status
                                ? "font-semibold text-[#37474F]"
                                : "text-gray-600"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[s]}`} />
                            {t(`${P}.status.${s}`)}
                          </button>
                        ))}
                      </Dropdown>
                    </div>
                    {item.status === "returned" && item.returnedTo && (
                      <div className="mt-1 text-[11px] text-gray-400">
                        {t(`${P}.table.returnedTo`, { name: item.returnedTo })}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {registerOpen && (
        <RegisterModal
          roomNumbers={rooms.map((r) => r.number)}
          onClose={() => setRegisterOpen(false)}
          onSubmit={(input) => {
            const created = addItem(input);
            setRegisterOpen(false);
            notify(t(`${P}.toasts.registered`, { item: created.name }));
          }}
        />
      )}

      {returnTarget && (
        <ReturnModal
          item={returnTarget}
          onClose={() => setReturnTarget(null)}
          onConfirm={handleReturnConfirm}
        />
      )}

      <div
        className="pointer-events-none fixed bottom-6 right-6 z-[60] space-y-2"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="rounded-lg bg-gray-800 px-4 py-2.5 text-sm text-white shadow-lg"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

function RegisterModal({
  roomNumbers,
  onClose,
  onSubmit,
}: {
  roomNumbers: number[];
  onClose: () => void;
  onSubmit: (input: {
    name: string;
    location: LostFoundLocation;
    foundDate: string;
    foundBy: string;
    description?: string;
  }) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(false);
  // 單一 select 同時裝房號與公共區域，用前綴區分 value
  const [locationValue, setLocationValue] = useState(`room:${roomNumbers[0] ?? 100}`);
  const [foundDate, setFoundDate] = useState(LOSTFOUND_DEMO_TODAY);
  const [foundBy, setFoundBy] = useState(housekeepers[0]);
  const [description, setDescription] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(true);
      return;
    }
    const [kind, value] = locationValue.split(":");
    const location: LostFoundLocation =
      kind === "room"
        ? { kind: "room", room: Number(value) }
        : { kind: "area", area: value as PublicArea };
    onSubmit({
      name: trimmed,
      location,
      foundDate,
      foundBy,
      description: description.trim() || undefined,
    });
  };

  const labelCls = "mb-1 block text-xs font-medium text-gray-500";
  const inputCls =
    "w-full rounded border border-gray-300 bg-white px-2.5 py-2 text-sm text-[#37474F] placeholder:text-gray-400 focus:border-[#16A3A3] focus:outline-none";

  return (
    <Modal title={t(`${P}.form.title`)} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
        <div>
          <label className={labelCls}>
            {t(`${P}.form.itemName`)} <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError && e.target.value.trim()) setNameError(false);
            }}
            placeholder={t(`${P}.form.itemNamePlaceholder`)}
            className={`${inputCls} ${nameError ? "border-red-400" : ""}`}
            autoFocus
          />
          {nameError && (
            <p className="mt-1 text-[11px] text-red-500">
              {t(`${P}.form.itemNameRequired`)}
            </p>
          )}
        </div>

        <div>
          <label className={labelCls}>{t(`${P}.form.location`)}</label>
          <select
            value={locationValue}
            onChange={(e) => setLocationValue(e.target.value)}
            className={inputCls}
          >
            <optgroup label={t(`${P}.form.areasGroup`)}>
              {PUBLIC_AREAS.map((area) => (
                <option key={area} value={`area:${area}`}>
                  {t(`${P}.areas.${area}`)}
                </option>
              ))}
            </optgroup>
            <optgroup label={t(`${P}.form.roomsGroup`)}>
              {roomNumbers.map((n) => (
                <option key={n} value={`room:${n}`}>
                  {t(`${P}.form.roomOption`, { number: n })}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t(`${P}.form.foundDate`)}</label>
            <input
              type="date"
              value={foundDate}
              onChange={(e) => setFoundDate(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>{t(`${P}.form.foundBy`)}</label>
            <select
              value={foundBy}
              onChange={(e) => setFoundBy(e.target.value)}
              className={inputCls}
            >
              {housekeepers.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>{t(`${P}.form.description`)}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t(`${P}.form.descriptionPlaceholder`)}
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 bg-white px-3.5 py-2 text-sm text-[#37474F] hover:bg-gray-50"
          >
            {t(`${P}.form.cancel`)}
          </button>
          <button
            type="submit"
            className="rounded px-3.5 py-2 text-sm font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: TEAL }}
          >
            {t(`${P}.form.submit`)}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ReturnModal({
  item,
  onClose,
  onConfirm,
}: {
  item: LostFoundItem;
  onClose: () => void;
  onConfirm: (name: string) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const trimmed = name.trim();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <Modal title={t(`${P}.returnModal.title`)} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
        <p className="text-sm text-[#37474F]">
          {t(`${P}.returnModal.message`, { item: item.name })}
        </p>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            {t(`${P}.returnModal.nameLabel`)}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t(`${P}.returnModal.namePlaceholder`)}
            className="w-full rounded border border-gray-300 bg-white px-2.5 py-2 text-sm text-[#37474F] placeholder:text-gray-400 focus:border-[#16A3A3] focus:outline-none"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 bg-white px-3.5 py-2 text-sm text-[#37474F] hover:bg-gray-50"
          >
            {t(`${P}.returnModal.cancel`)}
          </button>
          <button
            type="submit"
            disabled={!trimmed}
            className="rounded px-3.5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: TEAL }}
          >
            {t(`${P}.returnModal.confirm`)}
          </button>
        </div>
      </form>
    </Modal>
  );
}
