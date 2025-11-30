import { useEffect, useRef } from 'react';
import { apiJson } from '@/lib/api';
import type { WordPressPost } from '@/lib/wordpress-api';

interface UseReaderProgressPersistenceProps {
  routeSlug?: string;
  autoSaveSlug: string;
  posts: WordPressPost[];
  currentIndex: number;
  readingProgress: number;
  isAuthenticated: boolean;
}

/**
 * Persist reading progress locally (for the "Continue Reading" banner)
 * and, when authenticated, periodically sync to the server.
 *
 * This is extracted from ReaderPage to reduce its complexity.
 */
export function useReaderProgressPersistence({
  routeSlug,
  autoSaveSlug,
  posts,
  currentIndex,
  readingProgress,
  isAuthenticated,
}: UseReaderProgressPersistenceProps): void {
  const lastProgressSentRef = useRef<{ percent: number; ts: number }>({
    percent: 0,
    ts: 0,
  });

  useEffect(() => {
    try {
      const slug =
        routeSlug ||
        autoSaveSlug ||
        (posts?.[currentIndex] as any)?.slug;

      if (!slug) return;

      // Always update local storage so the "Continue Reading" banner
      // works for all users, even when offline or unauthenticated.
      if (typeof window !== 'undefined') {
        const scrollPosition = window.scrollY || 0;
        const progressData = {
          slug: String(slug),
          scrollPosition,
          percentRead: Math.max(0, Math.min(100, readingProgress)),
          lastRead: new Date().toISOString(),
        };
        try {
          localStorage.setItem(
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
      const diff = Math.abs(
        rounded - (lastProgressSentRef.current.percent || 0),
      );
      const tooSoon =
        now - (lastProgressSentRef.current.ts || 0) < 15000; // 15s throttle

      if (diff >= 10 && !tooSoon) {
        apiJson<any>('POST', '/api/reading-progress', {
          postSlug: String(slug),
          percentCompleted: rounded,
        })
          .then(() => {
            // Successful; record timestamp and last percent sent.
            lastProgressSentRef.current = {
              percent: rounded,
              ts: Date.now(),
            };
          })
          .catch(() => {
            // Non-fatal: keep local progress even if server call fails.
          });
      }
    } catch {
      // Non-fatal: reading should never break due to progress persistence.
    }
  }, [readingProgress, routeSlug, autoSaveSlug, posts, currentIndex, isAuthenticated]);
}