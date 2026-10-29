import { useTranslation } from "react-i18next";

export type MobileScreen =
  | "login"
  | "accounts"
  | "rooms"
  | "roomDetail"
  | "addRepair"
  | "inspection"
  | "guest"
  | "chatList"
  | "chatRoom";

export interface ScreenProps {
  go: (s: MobileScreen) => void;
}

export const TEAL = "#0d9488";
export const NAVY = "#1e2a4a";

export function StatusBar({ light = false }: { light?: boolean }) {
  const c = light ? "text-white" : "text-gray-900";
  return (
    <div className={`flex items-center justify-between px-7 pb-1 pt-3 ${c}`}>
      <div className="flex items-center gap-1 text-[14px] font-semibold tracking-tight">
        <span>09:41</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-label="moon">
          <path d="M20 14.1A8.5 8.5 0 0 1 9.9 4 8.5 8.5 0 1 0 20 14.1Z" />
        </svg>
      </div>
      <div className="flex items-center gap-1.5">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-label="signal">
          <rect x="0" y="7" width="3" height="4" rx="0.8" />
          <rect x="4.5" y="5" width="3" height="6" rx="0.8" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.8" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.8" />
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor" aria-label="wifi">
          <path d="M8 9.2a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8ZM8 5.6c-1.6 0-3 .6-4.1 1.6l1.5 1.5A3.9 3.9 0 0 1 8 7.7c1 0 1.9.4 2.6 1l1.5-1.5A5.9 5.9 0 0 0 8 5.6ZM8 1.8C5.3 1.8 2.8 2.9 1 4.6l1.4 1.5A7.9 7.9 0 0 1 8 3.8c2.2 0 4.2.9 5.6 2.3L15 4.6A9.9 9.9 0 0 0 8 1.8Z" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-label="battery">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="18" height="8" rx="1.8" fill="currentColor" />
          <path d="M23 4v4a2.2 2.2 0 0 0 0-4Z" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}

const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconBack({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" {...stroke}>
      <path d="M15 5 8 12l7 7" />
    </svg>
  );
}

export function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function IconSortAZ() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <path d="M16 4v16m0 0 3-3m-3 3-3-3" />
      <path d="M4 9h5L4 4h5M4 14h5m-5 6h5l-5-6" />
    </svg>
  );
}

export function IconFunnel() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z" />
    </svg>
  );
}

export function IconChevronUp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <path d="m6 15 6-6 6 6" />
    </svg>
  );
}

export function IconChevronRight({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function IconPlus({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={2.4}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconClose({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconCheck({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={2.6}>
      <path d="m4 12.5 5.5 5.5L20 7" />
    </svg>
  );
}

export function IconEyeSlash() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...stroke} strokeWidth={1.7}>
      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
      <circle cx="12" cy="12" r="2.7" />
      <path d="M4 20 20 4" />
    </svg>
  );
}

export function IconFaceId() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M4 16v2a2 2 0 0 0 2 2h2M16 20h2a2 2 0 0 0 2-2v-2" />
      <path d="M9 9.5v1.5M15 9.5v1.5M12 9.5v3h-1M9 15.2a4.2 4.2 0 0 0 6 0" />
    </svg>
  );
}

export function IconWrench({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <path d="M14.5 6.5a4 4 0 0 1 5-5l-3 3 .7 2.3L19.5 7.5l3-3a4 4 0 0 1-5 5L8 19a2.1 2.1 0 0 1-3-3l9.5-9.5Z" />
    </svg>
  );
}

export function IconGrid() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function IconChat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z" />
    </svg>
  );
}

export function IconChecklist() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <path d="m3.5 6 1.5 1.5L8 4.5M3.5 13l1.5 1.5L8 11.5M3.5 20l1.5 1.5L8 18.5" />
      <path d="M11 6h9.5M11 13h9.5M11 20h9.5" />
    </svg>
  );
}

export function IconMic() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
    </svg>
  );
}

export function IconCamera() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}

export function IconPaperclip() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L13 4a3.3 3.3 0 0 1 4.7 4.7L9.5 17a1.7 1.7 0 0 1-2.4-2.4L15 7" />
    </svg>
  );
}

export function IconLines() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}

export function IconDots() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="12" cy="19" r="1.7" />
    </svg>
  );
}

export function IconCalendar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function Face({ mood }: { mood: "sad" | "neutral" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="0.5" fill="currentColor" />
      <circle cx="15" cy="10" r="0.5" fill="currentColor" />
      {mood === "sad" ? <path d="M8.5 16.5a4.5 4.5 0 0 1 7 0" /> : <path d="M8.5 16h7" />}
    </svg>
  );
}

export function IconBottle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <path d="M8 3h8M9 3l1.5 5a7 7 0 1 1 3 0L15 3" />
      <path d="M12 15v4M9.5 21h5" />
    </svg>
  );
}

export function IconWasher() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <circle cx="12" cy="13" r="4.5" />
      <path d="M8.5 13a3.5 3.5 0 0 0 7 0" />
      <circle cx="7" cy="6" r="0.6" fill="currentColor" />
      <circle cx="10" cy="6" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function IconClipboard() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4a3 3 0 0 1 6 0M9 10h6M9 14h6M9 18h3" />
    </svg>
  );
}

export function IconDocAlert() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v4h4M12 10v4" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function IconDocSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v4h4" />
      <circle cx="11" cy="13" r="2.8" />
      <path d="m13.2 15.2 2.3 2.3" />
    </svg>
  );
}

export function IconSparkle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  );
}

export function IconPersonArrow() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
      <circle cx="10" cy="7" r="3.5" />
      <path d="M4 20a6 6 0 0 1 10.5-4" />
      <path d="M16 17h6m0 0-2.5-2.5M22 17l-2.5 2.5" />
    </svg>
  );
}

export function IconArrowRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...stroke}>
      <path d="M4 12h15m0 0-5-5m5 5-5 5" />
    </svg>
  );
}

export function TabBar({
  go,
  active,
}: {
  go: (s: MobileScreen) => void;
  active: "rooms" | "guest" | "roomDetail" | "chatList" | "chatRoom";
}) {
  const { t } = useTranslation();
  const base = "relative flex h-full flex-1 items-center justify-center";
  return (
    <div className="flex h-[64px] shrink-0 border-t border-gray-200 bg-white pb-2">
      <button
        className={`${base} ${active === "rooms" || active === "roomDetail" ? "text-teal-600" : "text-gray-400"}`}
        onClick={() => go("rooms")}
        aria-label={t("mobile.tabs.rooms")}
      >
        <IconGrid />
      </button>
      <button
        className={`${base} ${
          active === "chatList" || active === "chatRoom" || active === "guest"
            ? "text-teal-600"
            : "text-gray-400"
        }`}
        onClick={() => go("chatList")}
        aria-label={t("mobile.tabs.chat")}
      >
        <IconChat />
      </button>
      <button className={`${base} text-gray-400`} aria-label={t("mobile.tabs.maintenance")}>
        <IconWrench />
        <span className="absolute right-[14px] top-[8px] rounded-full bg-red-500 px-1.5 py-px text-[10px] font-bold leading-4 text-white">
          11
        </span>
        <span
          className="absolute right-[2px] top-[22px] rounded-full px-1.5 py-px text-[10px] font-bold leading-4 text-white"
          style={{ backgroundColor: NAVY }}
        >
          2
        </span>
      </button>
      <button className={`${base} text-gray-400`} aria-label={t("mobile.tabs.tasks")}>
        <IconChecklist />
        <span
          className="absolute right-[10px] top-[8px] rounded-full px-1.5 py-px text-[10px] font-bold leading-4 text-white"
          style={{ backgroundColor: NAVY }}
        >
          20
        </span>
      </button>
    </div>
  );
}
