// Compact posts listing routes for Bubble's Cafe Worker.
// These endpoints return a lighter-weight representation of posts that
// omits the full HTML content field. They are intended for navigation
// and table-of-contents style views where only metadata is required.

import type { Env } from './utils';
import { json, proxyToBackend } from './utils';

// Map a Supabase posts row to a compact API post shape.
function mapCompactPostRow(row: any): any {
  const metadata = row && typeof row.metadata === 'object' && row.metadata !== null
    ? (row.metadata as any)
    : {};

  const likesCount = Number(row.likes_count ?? row.likesCount ?? 0);
  const dislikesCount = Number(row.dislikes_count ?? row.dislikesCount ?? 0);
  const baselineLikes = Number(row.baseline_likes ?? row.baselineLikes ?? 0);
  const baselineDislikes = Number(row.baseline_dislikes ?? row.baselineDislikes ?? 0);

  const themeCategory = row.theme_category ?? (metadata as any)?.themeCategory ?? null;

  return {
    id: Number(row.id),
    title: row.title ?? '',
    // Intentionally omit heavy HTML content to keep payload small
    content: '',
    slug: row.slug ?? '',
    excerpt: row.excerpt ?? null,
    authorId: row.author_id != null ? Number(row.author_id) : undefined,
    isSecret: Boolean(row.is_secret),
    isAdminPost:
      typeof row.isAdminPost === 'boolean'
        ? row.isAdminPost
        : ((metadata as any)?.isAdminPost ?? null),
    matureContent: Boolean(row.mature_content),
    themeCategory,
    // Use precomputed reading_time_minutes when available; otherwise leave undefined
    readingTimeMinutes:
      row.reading_time_minutes != null ? Number(row.reading_time_minutes) : undefined,
    likesCount,
    dislikesCount,
    baselineLikes,
    baselineDislikes,
    metadata,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

// Register compact posts-related routes on the provided router instance.
export function registerCompactPostsRoutes(router: any) {
  // GET /api/posts/compact - lightweight posts listing for navigation/TOC
  router.get('/api/posts/compact', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const search = urlObj.searchParams;

      const pageParam = parseInt(search.get('page') || '1', 10);
      const limitParam = parseInt(search.get('limit') || '100', 10);

      const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
      const rawLimit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 100;
      // Hard cap to avoid overly large responses
      const limit = Math.max(1, Math.min(rawLimit, 500));

      const category = (search.get('category') || '').trim();
      const searchTermRaw = (search.get('search') || '').trim();
      const searchTerm = searchTermRaw.toLowerCase();

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
      postsUrl.searchParams.set(
        'select',
        'id,title,excerpt,slug,author_id,is_secret,isAdminPost,mature_content,theme_category,reading_time_minutes,likes_count,dislikes_count,baseline_likes,baseline_dislikes,metadata,created_at',
      );
      postsUrl.searchParams.set('order', 'created_at.desc');
      postsUrl.searchParams.set('limit', String(limit));

      const offset = (page - 1) * limit;
      if (offset > 0) {
        postsUrl.searchParams.set('offset', String(offset));
      }

      if (category) {
        postsUrl.searchParams.set('theme_category', `eq.${category}`);
      }

      const searchValue = searchTerm.replace(/[%*]/g, '').trim();
      if (searchValue) {
        const pattern = `*${searchValue}*`;
        postsUrl.searchParams.set(
          'or',
          `(title.ilike.${pattern},excerpt.ilike.${pattern},content.ilike.${pattern})`,
        );
      }

      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
        Prefer: 'count=exact',
      };

      const res = await fetch(postsUrl.toString(), { headers });
      if (!res.ok) {
        return proxyToBackend(req, env);
      }

      const contentRange = res.headers.get('Content-Range');
      let total: number | undefined;
      if (contentRange && contentRange.includes('/')) {
        const parts = contentRange.split('/');
        const totalStr = parts[1];
        const parsed = parseInt(totalStr, 10);
        if (Number.isFinite(parsed)) total = parsed;
      }

      const rows = (await res.json().catch(() => [])) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        return json(
          { posts: [], hasMore: false },
          {
            headers: {
              'Cache-Control': 'max-age=60, stale-while-revalidate=120',
            },
          },
        );
      }

      const posts = rows.map(mapCompactPostRow);

      const hasMore = typeof total === 'number' ? page * limit < total : posts.length === limit;

      return json(
        { posts, hasMore },
        {
          headers: {
            'Cache-Control': 'max-age=60, stale-while-revalidate=120',
          },
        },
      );
    } catch {
      return proxyToBackend(req, env);
    }
  });
}
