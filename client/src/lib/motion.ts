// Motion utilities shared between React and non-React modules

// Return current system prefers-reduced-motion value
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

// Read user-controlled reduced motion preference (Accessibility setting)
export function getUserReducedMotionSetting(): boolean {
  try {
    return localStorage.getItem('reduce-motion') === 'true';
  } catch {
    return false;
  }
}

// Effective reduced motion = user setting OR system preference
export function getEffectiveReducedMotion(): boolean {
  return getUserReducedMotionSetting() || getPrefersReducedMotion();
}

// Apply or remove the html.reduce-motion class to reflect effective preference
export function applyReducedMotionClass(value?: boolean): void {
  try {
    if (typeof document === 'undefined') return;
    const effective = typeof value === 'boolean' ? value : getEffectiveReducedMotion();
    const root = document.documentElement;
    if (effective) {
      root.classList.add('reduce-motion');
      root.setAttribute('data-reduce-motion', 'true');
    } else {
      root.classList.remove('reduce-motion');
      root.removeAttribute('data-reduce-motion');
    }
  } catch {
    // no-op
  }
}

// Subscribe to changes in system prefers-reduced-motion; returns an unsubscribe function
export function subscribePrefersReducedMotion(callback: (value: boolean) => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }

  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Handler supports both modern and legacy event signatures
  const handler = (event: MediaQueryListEvent | MediaQueryList) => {
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

// Subscribe to effective reduced motion (user OR system); returns unsubscribe
export function subscribeReducedMotion(callback: (value: boolean) => void): () => void {
  // Listen to system changes
  const unsubscribeMQ = subscribePrefersReducedMotion(() => {
    callback(getEffectiveReducedMotion());
  });

  // Listen to user setting changes via the 'storage' event
  const onStorage = (e: StorageEvent) => {
    try {
      if (!e) return;
      if (e.key === 'reduce-motion') {
        callback(getEffectiveReducedMotion());
      }
    } catch { /* no-op */ }
  };
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('storage', onStorage);
  }

  return () => {
    try {
      unsubscribeMQ();
    } catch {}
    try {
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('storage', onStorage);
      }
    } catch {}
  };
}

// Initialize a live sync that keeps html.reduce-motion aligned with effective preference
export function initReducedMotionClassSync(): void {
  try {
    applyReducedMotionClass();
    // Keep synced on changes
    subscribeReducedMotion(applyReducedMotionClass);
  } catch {
    // no-op
  }
}