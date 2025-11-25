import { useEffect, useRef } from 'react';
import { apiJson } from '@/lib/api';
import type { WordPressPost } from '@/lib/wordpress-api';

interface ReaderProgressPersistenceOptions {
  readingProgress: number;
  routeSlug?: string;
  autoSaveSlug?: string;
  posts: WordPressPost[];
  currentIndex: number;
  isAuthenticated: boolean;
}

/**
 * Persists reading progress to localStorage for the "Continue Reading"
 * banner and, when authenticated, syncs progress to the server on a
 * throttled schedule.
 *
 * This is a direct extraction of the previous reader page logic so that
 * behaviour remains identical.
 */
export function useReaderProgressPersistence(options: ReaderProgressPersistenceOptions) {
  const { readingProgress, routeSlug, autoSaveSlug, posts, currentIndex, isAuthenticated } =
    options;

  const lastProgressSentRef = useRef<{ percent: number; ts: number }>({
    percent: 0,
    ts: 0,
  });

  useEffect(() => {
    try {
      const slug =
        routeSlug ||
        autoSaveSlug ||
        (posts && posts[currentIndex] ? (posts[currentIndex] as any).slug : undefined);

      if (!slug) return;

      // Always update local storage so the "Continue Reading" banner works for all users.
      if (typeof window !== 'undefined') {
        const scrollPosition = window.scrollY || 0;
        const progressData = {
          slug: String(slug),
          scrollPosition,
          percentRead: Math.max(0, Math.min(100, readingProgress)),
          lastRead: new Date().toISOString(),
        };
        try {
          window.localStorage.setItem(
            `readingProgress_${slug}`,
            JSON.stringify(progressData),
          );
        } catch {
          // Ignore storage errors (private mode, quotas, etc.)
        }
      }

      // Server sync only for authenticated users.
      if (!isAuthenticated) return;

      const now = Date.now();
      const rounded = Math.round(readingProgress);
      const prev = lastProgressSentRef.current;
      const diff = Math.abs(rounded - (prev.percent || 0));
      const tooSoon = now - (prev.ts || 0) < 15_000; // 15s throttle

      if (diff >= 10 && !tooSoon) {
        apiJson<any>('POST', '/api/reading-progress', {
          postSlug: String(slug),
          percentCompleted: rounded,
        })
          .then(() => {
            lastProgressSentRef.current = { percent: rounded, ts: Date.now() };
          })
          .catch(() => {
            // Non-fatal: keep local progress even if the server call fails.
          });
      }
    } catch {
      // Non-fatal – reading should never break due to progress persistence.
    }
  }, [readingProgress, routeSlug, autoSaveSlug, posts, currentIndex, isAuthenticated]);
}

export default useReaderProgressPersistence;