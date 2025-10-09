import { useEffect, useRef } from "react";

/**
 * Adds copy/selection deterrents scoped to a specific container.
 * This does not fully prevent copying, but increases friction.
 */
export function useCopyProtection(enabled = true) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    // Disable selection within the container
    const prevUserSelect = el.style.userSelect;
    const prevWebkitUserSelect = (el.style as any).webkitUserSelect;
    const prevMozUserSelect = (el.style as any).mozUserSelect;
    const prevMsUserSelect = (el.style as any).msUserSelect;

    el.style.userSelect = "none";
    (el.style as any).webkitUserSelect = "none";
    (el.style as any).mozUserSelect = "none";
    (el.style as any).msUserSelect = "none";

    // Copy and cut prevention (scoped)
    const onCopy = (event: ClipboardEvent) => {
      const sel = document.getSelection();
      if (sel && el.contains(sel.anchorNode as Node)) {
        event.preventDefault();
        alert("Copying is disabled.");
      }
    };
    const onCut = (event: ClipboardEvent) => {
      const sel = document.getSelection();
      if (sel && el.contains(sel.anchorNode as Node)) {
        event.preventDefault();
      }
    };

    // Context menu prevention (right-click / long-press)
    const onContextMenu = (event: MouseEvent) => {
      if (el.contains(event.target as Node)) {
        event.preventDefault();
      }
    };

    // Keyboard shortcuts prevention (Ctrl/Cmd + C/X/U) when focused within container
    const onKeyDown = (event: KeyboardEvent) => {
      const active = document.activeElement;
      const key = event.key.toLowerCase();
      if (
        active &&
        el.contains(active) &&
        (event.ctrlKey || event.metaKey) &&
        (key === "c" || key === "x" || key === "u")
      ) {
        event.preventDefault();
      }
    };

    // Disable multi-touch (can reduce long-press UI on some devices)
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 1 && el.contains(event.target as Node)) {
        event.preventDefault();
      }
    };

    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("touchstart", onTouchStart, { passive: false });

    return () => {
      // Restore selection styles
      el.style.userSelect = prevUserSelect;
      (el.style as any).webkitUserSelect = prevWebkitUserSelect;
      (el.style as any).mozUserSelect = prevMozUserSelect;
      (el.style as any).msUserSelect = prevMsUserSelect;

      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("touchstart", onTouchStart as any);
    };
  }, [enabled]);

  return ref;
}