// Progressive enhancement for SPA View Transitions (Chrome, Edge).
// Safe, idempotent, and gated by prefers-reduced-motion.
// We patch history.pushState/replaceState so programmatic navigations
// (e.g., wouter's setLocation) are wrapped in document.startViewTransition
// when available, falling back to default behavior otherwise.

declare global {
  interface Document {
    // Minimal typing; real return value includes .finished/.ready promises
    startViewTransition?: (updateCallback: () => void) => any;
  }
  interface Window {
    __vt_patched?: boolean;
  }
}

// Returns true if we should enable view transitions (supported + not reduced motion)
function canEnableViewTransitions(): boolean {
  try {
    if (typeof document === "undefined" || typeof window === "undefined") return false;

    // Respect reduced motion
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return false;

    // Browser support
    const supported =
      !!document.startViewTransition ||
      // Some runtimes expose CSS.supports for feature detection; optional
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

    // Avoid double patching by tagging the wrapper
    const wrapped = function (this: History, ...args: Parameters<History[K]>) {
      try {
        const run = () => original.apply(history, args as any);
        // Only run view transition when supported; otherwise, fall back
        if (document.startViewTransition) {
          // Wrap the URL/state mutation; React will render the new route within this transition
          // If anything throws, gracefully degrade.
          try {
            // Note: We intentionally do not await the transition here.
            (document as any).startViewTransition(run);
            return;
          } catch {
            // Fall through to default
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
    if (window.__vt_patched) return;

    if (!canEnableViewTransitions()) {
      window.__vt_patched = true; // mark to avoid re-evaluation later
      return;
    }

    patchHistoryMethod("pushState");
    patchHistoryMethod("replaceState");

    // Note: Back/forward (popstate) can't be reliably wrapped without
    // controlling router internals; we keep CSS fallback for those cases.
    // We deliberately avoid interfering with popstate to prevent ordering issues.

    window.__vt_patched = true;
  } catch {
    // no-op
  }
}