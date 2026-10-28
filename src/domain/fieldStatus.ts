/**
 * Visual language for the mobile field (housekeeper) view. The desktop screens
 * read status through muted Tailwind pills (see colors.ts); the field board
 * instead fills each room tile edge-to-edge with the status color, the way a
 * housekeeper reads a floor at a glance. Mapping lives here so every field
 * surface (tile, detail sheet, status picker) paints a status the same way.
 */

import type { RoomCleanliness } from "./types";

/** Brand chrome colors for the phone shell. */
export const FIELD_COLORS = {
  toolbar: "#1f3b51",
  action: "#52c2b6",
  background: "#f8f8fa",
  stayover: "#1f4969",
} as const;

export interface FieldTileStyle {
  /** Base fill color behind the room number. */
  background: string;
  /** Room number / glyph color, flipped for contrast on light fills. */
  foreground: string;
  /** Paint diagonal stripes over the base color instead of a solid fill. */
  striped: boolean;
  /** Overlay the no-cleaning prohibition glyph at the tile center. */
  prohibition: boolean;
}

const NAVY = "#1f3b51";
const WHITE = "#ffffff";
const TEAL = "#76d5ce";

export const fieldTileStyle: Record<RoomCleanliness, FieldTileStyle> = {
  dirty: { background: "#dd4231", foreground: WHITE, striped: false, prohibition: false },
  stripped: { background: "#a390e4", foreground: WHITE, striped: false, prohibition: false },
  awaiting_inspection: { background: TEAL, foreground: NAVY, striped: true, prohibition: false },
  inspected: { background: TEAL, foreground: NAVY, striped: false, prohibition: false },
  out_of_order: { background: "#b3bec4", foreground: NAVY, striped: false, prohibition: false },
  do_not_disturb: { background: "#dd4231", foreground: WHITE, striped: true, prohibition: true },
};

/** CSS `background` value for a tile: a solid color or 45° stripes over it. */
export function tileBackground(style: FieldTileStyle): string {
  if (!style.striped) return style.background;
  const stripe = "rgba(255, 255, 255, 0.30)";
  return `repeating-linear-gradient(45deg, ${style.background} 0, ${style.background} 7px, ${stripe} 7px, ${stripe} 14px)`;
}
