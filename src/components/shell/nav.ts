export interface NavItem {
  to: string;
  /** i18n key under the `nav` namespace. */
  labelKey: string;
  /** Inline SVG path data for a 20x20 stroke icon. */
  icon: string;
}

export const navItems: NavItem[] = [
  { to: "/", labelKey: "nav.dashboard", icon: "M3 11l8-7 8 7M5 10v9h5v-6h0v6h4v-9" },
  { to: "/housekeeping", labelKey: "nav.housekeeping", icon: "M4 7h12v9H4zM4 7l2-3h8l2 3M8 10h4" },
  { to: "/field", labelKey: "nav.field", icon: "M7 2h6a1 1 0 011 1v14a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1zM9 15.5h2" },
  { to: "/tasks", labelKey: "nav.tasks", icon: "M5 6h10M5 10h10M5 14h6M3 6h0M3 10h0M3 14h0" },
  { to: "/allocation", labelKey: "nav.allocation", icon: "M4 5h12v4H4zM4 11h5v4H4zM11 11h5v4h-5z" },
  { to: "/lost-and-found", labelKey: "nav.lostFound", icon: "M10 3a5 5 0 015 5c0 3-5 9-5 9S5 11 5 8a5 5 0 015-5zM10 8h0" },
  { to: "/guest-relations", labelKey: "nav.guestRelations", icon: "M4 5h12v8H7l-3 3zM7 8h6M7 10h4" },
  { to: "/audits", labelKey: "nav.audits", icon: "M6 3h6l2 2v12H6zM8 8h4M8 11h4" },
  { to: "/settings", labelKey: "nav.settings", icon: "M10 7a3 3 0 100 6 3 3 0 000-6zM10 2v2M10 16v2M4 10H2M18 10h-2M5 5l1.5 1.5M13.5 13.5L15 15M15 5l-1.5 1.5M6.5 13.5L5 15" },
];
