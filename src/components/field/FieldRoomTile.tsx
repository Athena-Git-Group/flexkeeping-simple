import type { Space } from "@/domain/types";
import { FIELD_COLORS, fieldTileStyle, tileBackground } from "@/domain/fieldStatus";

interface FieldRoomTileProps {
  space: Space;
  onClick: (space: Space) => void;
}

type GlyphKind = "vip" | "linen" | "eco" | "declined";

/** Small 10x10 corner glyphs drawn in the tile's foreground color. */
function glyphPath(kind: GlyphKind): string {
  switch (kind) {
    case "vip":
      return "M5 1l1.3 2.6 2.9.4-2.1 2 .5 2.9L5 7.6 2.5 8.9l.5-2.9L.9 4l2.9-.4z";
    case "linen":
      return "M1 3h8v2H1zM1 5v4M9 5v4M1 7h8";
    case "eco":
      return "M8.5 1.5C4 1.5 2 4 2 6.5S4 8.5 5 8.5C8 8.5 8.5 4 8.5 1.5zM3 8C4 6 5.5 4.5 7 3.5";
    case "declined":
      return "M5 1a4 4 0 100 8 4 4 0 000-8zM2.5 2.5l5 5";
  }
}

function cornerGlyphs(space: Space): GlyphKind[] {
  const out: GlyphKind[] = [];
  if (space.attributes.vip) out.push("vip");
  if (space.attributes.linenChange) out.push("linen");
  if (space.attributes.eco) out.push("eco");
  if (space.attributes.guestDeclinedCleaning) out.push("declined");
  return out.slice(0, 3);
}

export function FieldRoomTile({ space, onClick }: FieldRoomTileProps) {
  const style = fieldTileStyle[space.cleanliness];
  const glyphs = cornerGlyphs(space);

  return (
    <button
      type="button"
      onClick={() => onClick(space)}
      className="relative flex aspect-square items-center justify-center rounded-md"
      style={{
        background: tileBackground(style),
        color: style.foreground,
        boxShadow: space.isStayover
          ? `inset 0 0 0 3px ${FIELD_COLORS.stayover}`
          : undefined,
      }}
    >
      {style.prohibition ? (
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute h-3/5 w-3/5 opacity-25"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M5 5l14 14" strokeLinecap="round" />
        </svg>
      ) : null}

      <span className="relative text-2xl font-semibold tabular-nums leading-none">
        {space.number}
      </span>

      {glyphs.length > 0 ? (
        <span className="absolute right-1 top-1 flex gap-0.5">
          {glyphs.map((kind) => (
            <svg
              key={kind}
              viewBox="0 0 10 10"
              className="h-2.5 w-2.5"
              fill={kind === "vip" ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={kind === "vip" ? 0 : 1.2}
            >
              <path d={glyphPath(kind)} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ))}
        </span>
      ) : null}

      {space.isStayover ? (
        <span
          className="absolute bottom-1 left-1 rounded-sm px-1 text-[8px] font-bold uppercase leading-tight tracking-wide text-white"
          style={{ backgroundColor: FIELD_COLORS.stayover }}
        >
          ◦
        </span>
      ) : null}
    </button>
  );
}
