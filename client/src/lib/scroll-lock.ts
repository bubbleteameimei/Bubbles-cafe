// Centralized body scroll-lock utility with ref counting and scrollbar compensation.
// Prevents layout shifts when overlays lock scrolling by standardizing behavior across the app.

let getState = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { count: 0, prevOverflow: '', prevPaddingRight: '' } as {
      count: number;
      prevOverflow: string;
      prevPaddingRight: string;
    };
  }
  const w = window as any;
  if (!w.__scrollLockState) {
    w.__scrollLockState = {
      count: 0,
      prevOverflow: '',
      prevPaddingRight: '',
    };
  }
  return w.__scrollLockState as {
    count: number;
    prevOverflow: string;
    prevPaddingRight: string;
  };
};

function supportsStableScrollbarGutter(): boolean {
  try {
    // Check support for scrollbar-gutter stable (optionally both-edges)
    return (
      (CSS && typeof CSS.supports === 'function' && CSS.supports('scrollbar-gutter: stable')) ||
      (CSS && typeof CSS.supports === 'function' && CSS.supports('scrollbar-gutter: stable both-edges'))
    );
  } catch {
    return false;
  }
}

function getScrollbarWidth(): number {
  try {
    const width = window.innerWidth - document.documentElement.clientWidth;
    return width > 0 ? width : 0;
  } catch {
    return 0;
  }
}

/**
 * Lock body scrolling in a standardized way.
 * - Uses ref counting so multiple overlays can safely lock/unlock.
 * - Applies padding-right compensation when needed to prevent layout shift.
 */
export function lockBodyScroll(_source: string = 'default'): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const state = getState();

  // First lock: capture previous styles and apply lock
  if (state.count === 0) {
    try {
      state.prevOverflow = document.body.style.overflow || '';
      state.prevPaddingRight = document.body.style.paddingRight || '';

      const width = getScrollbarWidth();
      document.body.style.overflow = 'hidden';

      // If scrollbar space is not stably reserved, compensate with padding-right
      if (!supportsStableScrollbarGutter() && width > 0) {
        document.body.style.paddingRight = `${width}px`;
      }
    } catch {
      // Best-effort only; do not throw
    }
  }

  state.count += 1;
}

/**
 * Unlock body scrolling, restoring previous styles when the last lock is released.
 */
export function unlockBodyScroll(_source: string = 'default'): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const state = getState();

  if (state.count > 0) {
    state.count -= 1;
  }

  if (state.count === 0) {
    try {
      // Restore previous styles
      document.body.style.overflow = state.prevOverflow || '';
      document.body.style.paddingRight = state.prevPaddingRight || '';
      state.prevOverflow = '';
      state.prevPaddingRight = '';
    } catch {
      // Best-effort only
    }
  }
}