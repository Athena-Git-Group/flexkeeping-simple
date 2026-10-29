export function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
      {children}
    </h2>
  );
}
