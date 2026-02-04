import { useEffect, useRef, useState } from 'react';
import { useCookieConsent } from '@/hooks/use-cookie-consent';
import { trackInteraction } from '@/lib/metrics';
import type { Post } from '@shared/schema';

interface ReaderAnalyticsOptions {
  currentPostId?: number;
  currentPostLink?: string;
  readingProgress: number;
  posts: Post[];
  currentIndex: number;
}

/**
 * Handles reader-specific analytics:
 * - Time-on-page + scroll + consent + interaction gated
 * - finish_read local interaction events
 * - Active time tracking (visibility-aware)
 */
export function useReaderAnalytics(options: ReaderAnalyticsOptions) {
  const { currentPostId, currentPostLink, readingProgress, posts, currentIndex } = options;

  const { isCategoryAllowed } = useCookieConsent();

  // Interaction gating (click/keydown/touch)
  const userInteractedRef = useRef<boolean>(false);
  const [interactionCount, setInteractionCount] = useState(0);

  useEffect(() => {
    const onInteract = () => {
      if (!userInteractedRef.current) {
        userInteractedRef.current = true;
        setInteractionCount((c) => c + 1);
        window.removeEventListener('pointerdown', onInteract);
        window.removeEventListener('keydown', onInteract);
        window.removeEventListener('touchstart', onInteract);
      }
    };

    window.addEventListener('pointerdown', onInteract, { passive: true });
    window.addEventListener('keydown', onInteract);
    window.addEventListener('touchstart', onInteract, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
      window.removeEventListener('touchstart', onInteract);
    };
  }, []);

  // Visibility-aware active time tracking.
  const readActiveStartRef = useRef<number | null>(null);
  const activeAccumulatedMsRef = useRef<number>(0);
  const [visibilityTick, setVisibilityTick] = useState(0);

  // Reset active timers when post changes.
  useEffect(() => {
    activeAccumulatedMsRef.current = 0;
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      readActiveStartRef.current = Date.now();
    } else {
      readActiveStartRef.current = null;
    }
  }, [currentPostId]);

  // Accumulate active time only when document is visible.
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'hidden') {
        if (readActiveStartRef.current != null) {
          activeAccumulatedMsRef.current += Date.now() - readActiveStartRef.current;
          readActiveStartRef.current = null;
        }
      } else {
        if (readActiveStartRef.current == null) {
          readActiveStartRef.current = Date.now();
        }
      }
      setVisibilityTick((t) => t + 1);
    };

    document.addEventListener('visibilitychange', handler);
    // Initialise once on mount.
    handler();

    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  // Fire a WordPress.com stats pixel once per session/day for the current post.
  useEffect(() => {
    try {
      if (!currentPostId) return;

      const sessionKey = `wp_read_tracked_${currentPostId}`;
      const dayKey = (() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `wp_read_tracked_day_${currentPostId}_${y}${m}${day}`;
      })();

      const alreadySession =
        typeof sessionStorage !== 'undefined'
          ? sessionStorage.getItem(sessionKey)
          : null;
      const alreadyDay =
        typeof localStorage !== 'undefined' ? localStorage.getItem(dayKey) : null;

      const isVisible =
        typeof document !== 'undefined'
          ? document.visibilityState === 'visible'
          : true;

      const analyticsAllowed = (() => {
        try {
          return isCategoryAllowed('analytics');
        } catch {
          return true;
        }
      })();

      const elapsedActiveMs =
        activeAccumulatedMsRef.current +
        (readActiveStartRef.current != null
          ? Date.now() - readActiveStartRef.current
          : 0);

      if (
        readingProgress >= 30 &&
        elapsedActiveMs >= 2000 &&
        !alreadySession &&
        !alreadyDay &&
        analyticsAllowed &&
        userInteractedRef.current &&
        isVisible
      ) {
        trackInteraction('reader_engaged', {
          postId: currentPostId,
          link: currentPostLink,
          progress: readingProgress,
          timeMs: elapsedActiveMs,
        });
      }
    } catch {
      // no-op
    }
    // Re-evaluate on progress changes, post changes, interaction and visibility transitions.
  }, [
    readingProgress,
    currentPostId,
    currentPostLink,
    interactionCount,
    visibilityTick,
    isCategoryAllowed,
  ]);

  // Finish-read tracking (local analytics): 90% scroll and ≥ 60s active time.
  useEffect(() => {
    try {
      if (!currentPostId) return;

      const isVisible =
        typeof document !== 'undefined'
          ? document.visibilityState === 'visible'
          : true;

      const analyticsAllowed = (() => {
        try {
          return isCategoryAllowed('analytics');
        } catch {
          return true;
        }
      })();

      if (!analyticsAllowed || !userInteractedRef.current || !isVisible) return;

      const elapsedActiveMs =
        activeAccumulatedMsRef.current +
        (readActiveStartRef.current != null
          ? Date.now() - readActiveStartRef.current
          : 0);

      const finishKey = `finish_read_tracked_${currentPostId}`;
      const already =
        typeof sessionStorage !== 'undefined'
          ? sessionStorage.getItem(finishKey)
          : null;

      if (readingProgress >= 90 && elapsedActiveMs >= 60_000 && !already) {
        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(finishKey, '1');
          }
        } catch {
          // ignore
        }

        const post = posts && posts[currentIndex] ? (posts[currentIndex] as any) : null;
        trackInteraction('finish_read', {
          postId: currentPostId,
          slug: post?.slug,
          progress: readingProgress,
          timeMs: elapsedActiveMs,
        });
      }
    } catch {
      // no-op
    }
  }, [
    readingProgress,
    currentPostId,
    interactionCount,
    visibilityTick,
    isCategoryAllowed,
    currentIndex,
    posts,
  ]);
}

export default useReaderAnalytics;