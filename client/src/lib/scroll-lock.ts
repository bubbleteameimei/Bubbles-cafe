// Centralized body scroll-lock utility with ref counting and scrollbar compensation.
// Prevents layout shifts when overlays lock scrolling by standardizing behavior across the app.
// Mobile-safe strategy that avoids setting body to position: fixed (which can misplace fixed headers).
// Instead, we lock scrolling via overflow on both html and body, and disable touch/overscroll on html.

let getState = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      count: 0,
      prevBodyOverflow: '',
      prevBodyPaddingRight: '',
      prevHtmlOverflow: '',
      prevHtmlTouchAction: '',
      prevHtmlOverscrollBehavior: '',
      prevHtmlOverscrollBehaviorY: '',
    } as {
      count: number;
      prevBodyOverflow: string;
      prevBodyPaddingRight: string;
      prevHtmlOverflow: string;
      prevHtmlTouchAction: string;
      prevHtmlOverscrollBehavior: string;
      prevHtmlOverscrollBehaviorY: string;
    };
  }
  const w = window as any;
  if (!w.__scrollLockState) {
    w.__scrollLockState = {
      count: 0,
      prevBodyOverflow: '',
      prevBodyPaddingRight: '',
      prevHtmlOverflow: '',
      prevHtmlTouchAction: '',
      prevHtmlOverscrollBehavior: '',
      prevHtmlOverscrollBehaviorY: '',
    };
  }
  return w.__scrollLockState as {
    count: number;
    prevBodyOverflow: string;
    prevBodyPaddingRight: string;
    prevHtmlOverflow: string;
    prevHtmlTouchAction: string;
    prevHtmlOverscrollBehavior: string;
    prevHtmlOverscrollBehaviorY: string;
  };
};

function supportsStableScrollbarGutter(): boolean {
  try {
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
 * - Locks via html/body overflow and disables touch/overscroll on html to avoid fixed header misplacement.
 */
export function lockBodyScroll(_source: string = 'default'): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const state = getState();

  if (state.count === 0) {
    try {
      const docEl = document.documentElement;

      state.prevBodyOverflow = document.body.style.overflow || '';
      state.prevBodyPaddingRight = document.body.style.paddingRight || '';
      state.prevHtmlOverflow = docEl.style.overflow || '';
      state.prevHtmlTouchAction = (docEl.style as any).touchAction || '';
      state.prevHtmlOverscrollBehavior = (docEl.style as any).overscrollBehavior || '';
      state.prevHtmlOverscrollBehaviorY = (docEl.style as any).overscrollBehaviorY || '';

      const width = getScrollbarWidth();

      // Lock scrolling on both html and body
      docEl.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      // Disable touch/overscroll to prevent inertial scroll under overlays on mobile browsers
      try { (docEl.style as any).touchAction = 'none'; } catch {}
      try { (docEl.style as any).overscrollBehavior = 'none'; } catch {}
      try { (docEl.style as any).overscrollBehaviorY = 'none'; } catch {}

      // Compensate for missing reserved scrollbar gutter in legacy browsers
      if (!supportsStableScrollbarGutter() && width > 0) {
        document.body.style.paddingRight = `${width}px`;
      }
    } catch {
      // Best-effort only
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
      const docEl = document.documentElement;

      document.body.style.overflow = state.prevBodyOverflow || '';
      document.body.style.paddingRight = state.prevBodyPaddingRight || '';
      docEl.style.overflow = state.prevHtmlOverflow || '';

      try { (docEl.style as any).touchAction = state.prevHtmlTouchAction || ''; } catch {}
      try { (docEl.style as any).overscrollBehavior = state.prevHtmlOverscrollBehavior || ''; } catch {}
      try { (docEl.style as any).overscrollBehaviorY = state.prevHtmlOverscrollBehaviorY || ''; } catch {}

      state.prevBodyOverflow = '';
      state.prevBodyPaddingRight = '';
      state.prevHtmlOverflow = '';
      state.prevHtmlTouchAction = '';
      state.prevHtmlOverscrollBehavior = '';
      state.prevHtmlOverscrollBehaviorY = '';
    } catch {
      // Best-effort only
    }
  }
}
  }
}