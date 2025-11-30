import { useEffect } from 'react';

/**
 * Prefetch route components based on the current location.
 *
 * This keeps the heavy logic out of App.tsx while preserving
 * the same lazy-loading and preloading behaviour.
 */
export function useRoutePrefetch(locationStr: string | undefined | null): void {
  useEffect(() => {
    const path = locationStr || '/';

    const idle =
      (window as any).requestIdleCallback ||
      ((cb: () => void) => window.setTimeout(cb, 1500));

    const prefetch = () => {
      try {
        if (path === '/') {
          import('@/pages/home');
          import('@/pages/best-stories');
          import('@/pages/community');
          return;
        }
        if (path.startsWith('/reader')) {
          import('@/pages/reader');
          return;
        }
        if (path.startsWith('/community')) {
          import('@/pages/community');
          return;
        }
        if (path.startsWith('/support')) {
          import('@/pages/support');
          return;
        }
        if (path.startsWith('/about')) {
          import('@/pages/about');
          return;
        }
        if (path.startsWith('/contact')) {
          import('@/pages/contact');
          return;
        }
        if (path.startsWith('/bookmarks')) {
          import('@/pages/bookmarks');
          return;
        }
        if (path.startsWith('/profile')) {
          import('@/pages/profile');
          return;
        }
        if (path.startsWith('/notifications')) {
          import('@/pages/notifications');
          return;
        }
        if (path.startsWith('/recommendations')) {
          import('@/pages/recommendations');
          return;
        }
        if (path.startsWith('/search')) {
          import('@/pages/search-results');
          return;
        }
        if (path.startsWith('/settings')) {
          import('@/pages/settings/account-settings');
          return;
        }
        if (path.startsWith('/admin')) {
          import('@/pages/admin/dashboard');
          return;
        }
      } catch {
        // Silently ignore prefetch errors; they are non-fatal.
      }
    };

    const handle = idle(prefetch);
    return () => {
      try {
        if ((window as any).cancelIdleCallback) {
          (window as any).cancelIdleCallback(handle);
        } else {
          window.clearTimeout(handle);
        }
      } catch {
        // ignore
      }
    };
  }, [locationStr]);
}