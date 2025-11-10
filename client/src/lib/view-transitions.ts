// Progressive enhancement for SPA View Transitions (Chrome, Edge).
// Safe, idempotent, and gated by prefers-reduced-motion.
// We patch history.pushState/replaceState so programmatic navigations
// (e.g., wouter's setLocation) are wrapped in document.startViewTransition
// when available, falling back to default behavior otherwise.

// Internal flag to avoid double patching
let VT_PATCHED = false;

// Returns true if we should enable view transitions (supported + not reduced motion)
function canEnableViewTransitions(): boolean {
  try {
    if (typeof document === "undefined" || typeof window === "undefined") return false;

    // Respect reduced motion
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return false;

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
        const startVT = (document as any)?.startViewTransition as undefined | ((cb: () => void) => any);
        if (typeof startVT === "function") {
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

    // @ts-ignore - assign our wrapper
    history[method] = wrapped;
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