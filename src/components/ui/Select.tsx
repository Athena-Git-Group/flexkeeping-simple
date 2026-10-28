interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  /** Shown as the first, empty option. */
  placeholder?: string;
  label?: string;
}

export function Select({ value, onChange, options, placeholder, label }: SelectProps) {
  return (
    <label className="flex flex-col gap-1">
      {label ? (
        <span className="text-xs font-medium text-ink-soft">{label}</span>
      ) : null}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      >
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
