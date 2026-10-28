import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface SidePanelProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}

export function SidePanel({ open, title, subtitle, onClose, children }: SidePanelProps) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/20"
        onClick={onClose}
        aria-hidden
      />
      <aside className="relative z-50 flex h-full w-full max-w-md flex-col bg-surface shadow-panel">
        <header className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            {subtitle ? <p className="text-sm text-ink-soft">{subtitle}</p> : null}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-ink-faint hover:bg-canvas hover:text-ink"
            aria-label={t("common.close")}
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </aside>
    </div>
  );
}
