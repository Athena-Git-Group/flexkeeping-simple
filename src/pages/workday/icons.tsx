import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 16, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function IconBed(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 7v11M3 14h18v4M3 11h18v3" />
      <circle cx="7" cy="9.5" r="1.5" />
    </svg>
  );
}

export function IconTasks(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  );
}

export function IconWrench(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.9 2.9-2.1-2.1 2-2.8z" />
    </svg>
  );
}

export function IconBroom(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M15 3l-4 8M7 13l8-2 3 7-9 2z" />
      <path d="M9 15l1 4M12 14l1.5 4.5" />
    </svg>
  );
}

export function IconBook(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 19a2 2 0 0 1 2-2h14" />
    </svg>
  );
}

export function IconFlow(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="15" width="6" height="6" rx="1" />
      <path d="M9 6h6a3 3 0 0 1 3 3v6" />
    </svg>
  );
}

export function IconChecklist(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h2M4 12h2M4 18h2M10 6h10M10 12h10M10 18h10" />
    </svg>
  );
}

export function IconBox(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 8l9-5 9 5v8l-9 5-9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}

export function IconChart(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20V10M10 20V4M16 20v-8M20 20H4" />
    </svg>
  );
}

export function IconGrid(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="4" width="7" height="7" />
      <rect x="4" y="13" width="7" height="7" />
      <rect x="13" y="13" width="7" height="7" />
    </svg>
  );
}

export function IconGear(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
    </svg>
  );
}

export function IconChevron({
  direction = "down",
  ...props
}: IconProps & { direction?: "up" | "down" | "left" | "right" }) {
  const d =
    direction === "up"
      ? "M6 15l6-6 6 6"
      : direction === "left"
        ? "M15 6l-6 6 6 6"
        : direction === "right"
          ? "M9 6l6 6-6 6"
          : "M6 9l6 6 6-6";
  return (
    <svg {...base(props)}>
      <path d={d} />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="6" />
      <path d="M21 21l-5-5" />
    </svg>
  );
}

export function IconHelp(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.8.3-.9 1-.9 1.7" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

export function IconBell(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function IconBuilding(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="3" width="14" height="18" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" />
    </svg>
  );
}

export function IconPerson(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function IconCross(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconGlass(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 3h10l-4 8v7M8 21h8M12 18v3" />
    </svg>
  );
}

export function IconServiceBell(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 17a8 8 0 0 1 16 0z" />
      <path d="M12 9V6M10 6h4M3 20h18" />
    </svg>
  );
}

export function IconTray(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 15h18M5 15a7 7 0 0 1 14 0" />
      <path d="M12 8V6" />
      <circle cx="12" cy="5" r="1" />
    </svg>
  );
}

export function IconSpray(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 10h6v10H8zM9 10V7h3v3M12 7V4h4" />
      <path d="M18 6h.01M20 8h.01M20 4h.01" />
    </svg>
  );
}

export function IconDoc(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4M10 12h5M10 16h5" />
    </svg>
  );
}
