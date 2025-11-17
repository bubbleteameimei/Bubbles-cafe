/**
 * Reader navigation helpers
 * Standardized logic to determine the latest story reader path and resolve author id.
 */

import { fetchWordPressPosts } from './wordpress-api';

export async function getLatestReaderPath(): Promise<string> {
  try {
    // Prefer WordPress posts for reader routing to avoid mismatched local DB slugs
    const result = await fetchWordPressPosts({ page: 1, perPage: 1, includeContent: false, maxRetries: 2 });
    const slug = result?.posts?.[0]?.slug;
    if (slug) {
      return `/reader/${encodeURIComponent(String(slug))}`;
    }
  } catch {
    // no-op; fall through to robust fallback below
  }

  // Robust fallback: attempt local API and use its slug if available
  try {
    const res = await fetch('/api/posts?limit=1', { credentials: 'include' }).catch(() => null as any);
    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      const slug = data?.posts?.[0]?.slug;
      if (slug) {
        return `/reader/${encodeURIComponent(String(slug))}`;
      }
    }
  } catch {
    // no-op
  }

  // Final fallback: reader root; Reader will align to list when available
  return '/reader';
}

/**
 * Try to resolve an author id from a post object with different shapes (WP/local).
 */
export function resolveAuthorId(post: any): number | undefined {
  try {
    const candidates = [
      (post as any)?.authorId,
      (post as any)?.author, // WP often uses a numeric author id
      (post as any)?.metadata?.authorId,
      (post as any)?.metadata?.originalAuthor
    ].map((v) => Number(v)).filter((n) => Number.isFinite(n) && n > 0);
    return candidates[0] as number | undefined;
  } catch {
    return undefined;
  }
}