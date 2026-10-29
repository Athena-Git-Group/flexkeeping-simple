import { useEffect, type RefObject } from "react";

/**
 * Closes a topbar dropdown on outside click or Esc. Listens on `mousedown`
 * (not `click`) so the panel closes before any underlying element reacts,
 * and the trigger button inside `ref` still toggles normally.
 */
export function useDismissable(
  open: boolean,
  onClose: () => void,
  ref: RefObject<HTMLElement>,
) {
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, ref]);
}
