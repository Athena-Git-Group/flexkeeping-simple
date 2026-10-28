export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-line bg-surface/50 px-6 py-12 text-sm text-ink-faint">
      {message}
    </div>
  );
}
