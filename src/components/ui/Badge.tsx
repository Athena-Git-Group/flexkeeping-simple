import { cn } from "@/lib/cn";

interface BadgeProps {
  label: string;
  /** Tailwind class set, usually from a `*Tone.badge` token. */
  className?: string;
  dotClassName?: string;
}

export function Badge({ label, className, dotClassName }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        className ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
      )}
    >
      {dotClassName ? (
        <span className={cn("h-1.5 w-1.5 rounded-full", dotClassName)} />
      ) : null}
      {label}
    </span>
  );
}

/** Minimal chip for boolean attributes (DND, ECO, VIP, …). */
export function Chip({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        className ?? "bg-slate-100 text-slate-600",
      )}
    >
      {label}
    </span>
  );
}
