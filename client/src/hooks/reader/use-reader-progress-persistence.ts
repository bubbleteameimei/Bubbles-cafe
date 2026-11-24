import { useEffect, useRef } from 'react';
import { apiJson } from '@/lib/api';

interface ReaderProgressPersistenceOptions {
  /** Kept for API compatibility; progress is now measured against the story text itself. */
  readingProgress?: number;
  routeSlug?: string;
  autoSaveSlug?: string;
  posts: any[];
  currentIndex: number;
  isAuthenticated: boolean;
}

export const READING_PROGRESS_PREFIX = 'readingProgress_';
export const RESUME_KEY = 'reader:resume';

export interface StoredProgress {
  slug: string;
  percentRead: number;
  timestamp: number;
}

/**
 * How much of the story text has been read (0-100): the share of `.story-content` above
 * the middle of the screen. The previous measure used the whole page (share buttons,
 * comments, footer), so finishing a story registered as ~60%.
 */
export function measureStoryProgress(slug: string): number | null {
  const el = document.querySelector<HTMLElement>(`.story-content[data-story-slug="${CSS.escape(slug)}"]`);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.height < 50) return null;
  const read = (window.innerHeight * 0.5 - rect.top) / rect.height;
  return Math.max(0, Math.min(100, read * 100));
}

/** Scroll so the given percentage of the story text sits mid-screen. */
export function scrollToStoryProgress(slug: string, percent: number): boolean {
  const el = document.querySelector<HTMLElement>(`.story-content[data-story-slug="${CSS.escape(slug)}"]`);
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  if (rect.height < 50) return false;
  const top = window.scrollY + rect.top + (percent / 100) * rect.height - window.innerHeight * 0.5;
  window.scrollTo({ top: Math.max(0, top), behavior: 'instant' as ScrollBehavior });
  return true;
}

/**
 * Saves how far into each story the visitor got (localStorage, plus the server for
 * signed-in readers) for the "Continue reading" card, and resumes at that point when the
 * card's Continue button opened the story.
 */
export function useReaderProgressPersistence(options: ReaderProgressPersistenceOptions) {
  const { routeSlug, autoSaveSlug, posts, currentIndex, isAuthenticated } = options;
  const slug: string | undefined =
    routeSlug || autoSaveSlug || (posts && posts[currentIndex] ? (posts[currentIndex] as any).slug : undefined);

  const lastSentRef = useRef<{ percent: number; ts: number }>({ percent: 0, ts: 0 });

  useEffect(() => {
    if (!slug) return;
    const key = `${READING_PROGRESS_PREFIX}${slug}`;
    let timer: number | null = null;
    let lastSaved = -1;

    const save = () => {
      timer = null;
      const pct = measureStoryProgress(slug);
      if (pct === null) return;
      const rounded = Math.round(pct);
      if (rounded === lastSaved) return;
      lastSaved = rounded;
      try {
        const data: StoredProgress = { slug, percentRead: rounded, timestamp: Date.now() };
        localStorage.setItem(key, JSON.stringify(data));
      } catch {
        // storage unavailable
      }
      if (!isAuthenticated) return;
      const prev = lastSentRef.current;
      if (Math.abs(rounded - prev.percent) >= 10 && Date.now() - prev.ts > 15_000) {
        lastSentRef.current = { percent: rounded, ts: Date.now() };
        apiJson<any>('POST', '/api/reading-progress', { postSlug: slug, percentCompleted: rounded }).catch(() => {});
      }
    };
    const onScroll = () => {
      if (timer === null) timer = window.setTimeout(save, 800);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [slug, isAuthenticated]);

  // Resume where the visitor left off when they came from "Continue reading".
  useEffect(() => {
    if (!slug) return;
    let pending: { slug: string; percent: number } | null = null;
    try {
      pending = JSON.parse(sessionStorage.getItem(RESUME_KEY) || 'null');
    } catch {
      pending = null;
    }
    if (!pending || pending.slug !== slug) return;
    let tries = 0;
    const attempt = () => {
      if (scrollToStoryProgress(slug, pending!.percent) || tries++ > 30) {
        try {
          sessionStorage.removeItem(RESUME_KEY);
        } catch {}
        return;
      }
      timer = window.setTimeout(attempt, 100);
    };
    // After the route's own scroll-to-top has run.
    let timer = window.setTimeout(attempt, 150);
    return () => window.clearTimeout(timer);
  }, [slug]);
}

export default useReaderProgressPersistence;
