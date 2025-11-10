// Progressive enhancement for SPA View Transitions (Chrome, Edge).
// Safe, idempotent, and gated by user/system reduced motion preference.
// We patch history.pushState/replaceState so programmatic navigations
// (e.g., wouter's setLocation) are wrapped in document.startViewTransition
// when available, falling back to default behavior otherwise.

import { getEffectiveReducedMotion } from "./motion";

// Internal flag to avoid double patching
let VT_PATCHED = false;

function canEnableViewTransitions(): boolean {
  try {
    if (typeof document === "undefined" || typeof window === "undefined") return false;

    // Respect system + user reduced motion (user can toggle in Accessibility)
    if (getEffectiveReducedMotion()) return false;

    // Browser support (loose check and safe)
    const startVT = (document as any)?.startViewTransition;
    const supported =
      typeof startVT === "function" ||
      (typeof (window as any).CSS !== "undefined" &&
        typeof (window as any).CSS.supports === "function" &&
        (window as any).CSS.supports("view-transition-name: none"));

    return !!supported;
  } catch {
    return false;
  }
}

function patchHistoryMethod<K extends "pushState" | "replaceState">(method: K) {
  try {
    const original = history[method];
    if (typeof original !== "function") return;

    const wrapped = function (this: History, ...args: Parameters<History[K]>) {
      try {
        const run = () => original.apply(history, args as any);

        // Determine path of navigation target (best-effort)
        let path = "";
        try {
          const uri: any = (args as any)[2];
          if (uri) {
            if (typeof uri === "string") {
              path = new URL(uri, location.href).pathname;
            } else if (typeof URL !== "undefined" && uri instanceof URL) {
              path = uri.pathname;
            }
          }
        } catch {
          // ignore
        }
        if (!path) {
          try { path = location.pathname; } catch { path = ""; }
        }

        // Skip native view transitions for heavy routes to avoid extra compositing cost
        const heavyRoute =
          path.startsWith("/reader") ||
          path.startsWith("/story") ||
          path.startsWith("/index") ||
          path.startsWith("/stories");

        // Respect user/system reduced motion at runtime on each navigation
        const reducedMotion = getEffectiveReducedMotion();
        const startVT = (document as any)?.startViewTransition as undefined | ((cb: () => void) => any);

        if (!heavyRoute && !reducedMotion && typeof startVT === "function") {
          try {
            startVT(run);
            return;
          } catch {
            // fall back to default
          }
        }
        run();
      } catch {
        // Never block navigation
        try {
          original.apply(history, args as any);
        } catch {
          // swallow
        }
      }
    } as History[K];

    (history as any)[method] = wrapped;
  } catch {
    // no-op
  }
}

export function enableViewTransitions(): void {
  try {
    if (typeof window === "undefined") return;
    if (VT_PATCHED) return;

    if (!canEnableViewTransitions()) {
      VT_PATCHED = true; // mark to avoid re-evaluation later
      return;
    }

    patchHistoryMethod("pushState");
    patchHistoryMethod("replaceState");

    // Note: Back/forward (popstate) can't be reliably wrapped without
    // controlling router internals; we keep CSS fallback for those cases.

    VT_PATCHED = true;
  } catch {
    // no-op
  }
}