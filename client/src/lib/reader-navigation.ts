/**
 * Reader navigation helpers
 * Standardized logic to determine the latest story reader path and resolve author id.
 */

export async function getLatestReaderPath(): Promise<string> {
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
  // Fallback
  return '/stories';
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