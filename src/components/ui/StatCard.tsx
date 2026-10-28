import { cn } from "@/lib/cn";

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  accentClassName?: string;
}

export function StatCard({ label, value, hint, accentClassName }: StatCardProps) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", accentClassName ?? "bg-brand")} />
        <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          {label}
        </p>
      </div>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}
