// Cursor-following tooltip for the SVG charts. Rendered through a portal so
// it never gets clipped by card overflow; pointer-events disabled so it does
// not steal the hover it is reporting on.

import { useState, type ReactNode, type MouseEvent } from "react";
import { createPortal } from "react-dom";

interface TipState {
  x: number;
  y: number;
  content: ReactNode;
}

export function useChartTooltip() {
  const [tip, setTip] = useState<TipState | null>(null);

  const moveTip = (e: MouseEvent, content: ReactNode) =>
    setTip({ x: e.clientX, y: e.clientY, content });
  const hideTip = () => setTip(null);

  const tipNode = tip
    ? createPortal(
        <div
          className="pointer-events-none fixed z-50 rounded border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] text-[#333] shadow-md"
          style={{ left: tip.x + 14, top: tip.y + 14 }}
        >
          {tip.content}
        </div>,
        document.body,
      )
    : null;

  return { moveTip, hideTip, tipNode };
}

export function TipRow({ color, label, value }: { color?: string; label: string; value: string }) {
  return (
    <div className="flex items-center whitespace-nowrap">
      {color && <span className="mr-1 inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: color }} />}
      <span>{label}:&nbsp;</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
