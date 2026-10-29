import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChatMessage, Conversation } from "./store";

// Icons stay local to the chat feature instead of going into workday/icons.tsx
// so the chat prototype can be dropped without leaving orphans behind.
const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconChatBubble({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M21 11.5a7.5 7.5 0 0 1-7.5 7.5H5l-2 2.5v-10A7.5 7.5 0 0 1 10.5 4h3A7.5 7.5 0 0 1 21 11.5Z" />
      <path d="M8 10h8M8 13.5h5" />
    </svg>
  );
}

export function IconDotsVertical({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="12" cy="19" r="1.7" />
    </svg>
  );
}

export function IconGlobe({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={1.6}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
    </svg>
  );
}

export function IconSend({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z" />
    </svg>
  );
}

export function IconPaperclip({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L13 4a3.3 3.3 0 0 1 4.7 4.7L9.5 17a1.7 1.7 0 0 1-2.4-2.4L15 7" />
    </svg>
  );
}

export function IconPeople({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19a6 6 0 0 1 12 0" />
      <path d="M16.5 5.5a3 3 0 0 1 0 5M17 13.5a6 6 0 0 1 4 5.5" />
    </svg>
  );
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function lastPreview(c: Conversation, photoLabel: string): string {
  const last = c.messages[c.messages.length - 1];
  if (!last) return "";
  return last.image ? `📷 ${photoLabel}` : last.text;
}

/**
 * The translated-message footer: original text in small gray type with a globe
 * and language tag, plus the show/hide toggle. Both desktop and mobile bubbles
 * render this so the auto-translation presentation stays identical.
 */
export function OriginalText({
  message,
  mine,
  ns,
}: {
  message: ChatMessage;
  mine: boolean;
  /** i18n prefix — "workday.chat" on desktop, "mobile.chat" on the phone demo. */
  ns: string;
}) {
  const { t } = useTranslation();
  // Visible by default so the auto-translation demo is obvious at first glance.
  const [show, setShow] = useState(true);
  if (!message.originalText) return null;
  const langLabel = t(`${ns}.${message.originalLang === "ja" ? "originalJa" : "originalEn"}`);
  const muted = mine ? "text-teal-100" : "text-gray-400";
  return (
    <div className={`mt-1.5 border-t pt-1.5 ${mine ? "border-teal-400/50" : "border-gray-100"}`}>
      {show && (
        <div className={`flex items-start gap-1 text-[11px] leading-snug ${muted}`}>
          <span className="mt-0.5 shrink-0">
            <IconGlobe />
          </span>
          <span>
            <span className="font-medium">{langLabel}</span> · {message.originalText}
          </span>
        </div>
      )}
      <button
        type="button"
        className={`mt-0.5 text-[11px] underline-offset-2 hover:underline ${muted}`}
        onClick={() => setShow((v) => !v)}
      >
        {show ? t(`${ns}.hideOriginal`) : t(`${ns}.showOriginal`)}
      </button>
    </div>
  );
}

/** Gray placeholder card standing in for a real photo attachment in the demo. */
export function FakePhoto({ label, compact }: { label: string; compact?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 bg-gray-100 text-gray-400 ${
        compact ? "h-20 w-28" : "h-28 w-40"
      }`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" {...stroke} strokeWidth={1.6}>
        <rect x="3" y="5" width="18" height="15" rx="2" />
        <circle cx="9" cy="10.5" r="1.8" />
        <path d="m5 19 5-5 3 3 3.5-3.5L21 17" />
      </svg>
      <span className="text-[11px] font-medium">{label}</span>
    </div>
  );
}
