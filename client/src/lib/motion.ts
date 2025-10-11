// Motion utilities shared between React and non-React modules

// Return current prefers-reduced-motion value
export function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

// Subscribe to changes in prefers-reduced-motion; returns an unsubscribe function
export function subscribePrefersReducedMotion(callback: (value: boolean) => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }

  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Handler supports both modern and legacy event signatures
  const handler = (event: MediaQueryListEvent | MediaQueryList) => {
    // In some environments, event may be the MediaQueryList itself
// Prefer event.matches when available, otherwise read from mql
const anyEvent = event as any;
const matches = typeof anyEvent.matches === 'boolean' ? anyEvent.matches : mql.matches;
callback(matches);
  };

  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', handler as EventListener);
  } else if (typeof (mql as any).addListener === 'function') {
    (mql as any).addListener(handler);
  }

  return () => {
    if (typeof mql.removeEventListener === 'function') {
      mql.removeEventListener('change', handler as EventListener);
    } else if (typeof (mql as any).removeListener === 'function') {
      (mql as any).removeListener(handler);
    }
  };
}