// Compact posts listing routes for Bubble's Cafe Worker.
// These endpoints return a lighter-weight representation of posts that
// omits the full HTML content field. They are intended for navigation
// and table-of-contents style views where only metadata is required.

import type { Env } from './utils';
import { json, proxyToBackend, getBearerToken } from './utils';

function stripHtml(value: any): string {
  try {
    const str = String(value ?? '');
    return str
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return '';
  }
}

async function fetchWordpressCompactPosts(
  env: Env,
  opts: { page: number; limit: number; search?: string },
): Promise<{ posts: any[]; hasMore: boolean } | null> {
  try {
    const wpBase =
      env.WORDPRESS_API ||
      'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts';

    const perPage = Math.max(1, Math.min(opts.limit, 100));
    const page = Math.max(1, opts.page);

    const params = new URLSearchParams();
    params.set('per_page', String(perPage));
    params.set('page', String(page));
    if (opts.search) params.set('search', opts.search);

    const res = await fetch(`${wpBase}?${params.toString()}`);
    if (!res.ok) return null;

    const rows = (await res.json().catch(() => [])) as any[];
    if (!Array.isArray(rows)) return { posts: [], hasMore: false };

    const posts = rows.map((post: any) => {
      const title =
        (post?.title && typeof post.title.rendered === 'string' ? post.title.rendered : '') ||
        'Untitled Story';
      const excerptHtml =
        (post?.excerpt && typeof post.excerpt.rendered === 'string' ? post.excerpt.rendered : '') ||
        '';
      const contentHtml =
        (post?.content && typeof post.content.rendered === 'string' ? post.content.rendered : '') ||
        '';

      const slug =
        typeof post.slug === 'string' && post.slug.trim() ? post.slug.trim() : String(post.id || '');

      const wordCount = stripHtml(contentHtml).split(/\s+/).filter(Boolean).length;
      const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

      return {
        id: typeof post.id === 'number' ? post.id : Date.now(),
        title,
        content: '',
        slug,
        excerpt: excerptHtml || null,
        authorId: undefined,
        isSecret: false,
        isAdminPost: false,
        matureContent: false,
        themeCategory: null,
        readingTimeMinutes,
        likesCount: 0,
        dislikesCount: 0,
        baselineLikes: 0,
        baselineDislikes: 0,
        metadata: {
          ...(post.meta || {}),
          wordpressId: typeof post.id === 'number' ? post.id : undefined,
          wordpressLink: typeof post.link === 'string' ? post.link : undefined,
          source: 'wordpress_api',
        },
        createdAt: (post.date as string) || new Date().toISOString(),
      };
    });

    return { posts, hasMore: rows.length === perPage };
  } catch {
    return null;
  }
}

// Map a Supabase posts row to a compact API post shape.
function mapCompactPostRow(row: any): any {
  const metadata = (() => {
    const raw = (row as any)?.metadata;
    if (!raw) return {};
    if (typeof raw === 'object') return raw;
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
      } catch {
        return {};
      }
    }
    return {};
  })();

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
      try {
        const urlObj = new URL(req.url);
        const search = urlObj.searchParams;
        const pageParam = parseInt(search.get('page') || '1', 10);
        const limitParam = parseInt(search.get('limit') || '100', 10);
        const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
        const rawLimit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 100;
        const limit = Math.max(1, Math.min(rawLimit, 100));
        const searchTerm = (search.get('search') || '').trim();

        const fallback = await fetchWordpressCompactPosts(env, { page, limit, search: searchTerm });
        if (fallback) {
          return json(
            { posts: fallback.posts, hasMore: fallback.hasMore, source: 'wordpress_api' },
            { headers: { 'Cache-Control': 'max-age=120, stale-while-revalidate=240' } },
          );
        }
      } catch {
        // fall through
      }

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

      const token = getBearerToken(req);
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token || env.SUPABASE_ANON_KEY}`,
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

      // If Supabase is configured but appears incomplete (common when WordPress -> Supabase mirroring
      // is still catching up), use WordPress as a source of truth for the index listing.
      const shouldPreferWordpressFallback =
        !category && !searchValue && (typeof total !== 'number' || total < page * limit + 1);

      if ((!Array.isArray(rows) || rows.length === 0) || (shouldPreferWordpressFallback && rows.length < limit)) {
        try {
          const wpFallback = await fetchWordpressCompactPosts(env, {
            page,
            limit: Math.min(limit, 100),
            search: searchValue || undefined,
          });
          if (wpFallback && wpFallback.posts.length > 0) {
            return json(
              { posts: wpFallback.posts, hasMore: wpFallback.hasMore, source: 'wordpress_api' },
              { headers: { 'Cache-Control': 'max-age=120, stale-while-revalidate=240' } },
            );
          }
        } catch {
          // ignore
        }

        if (!Array.isArray(rows) || rows.length === 0) {
          return json(
            { posts: [], hasMore: false },
            {
              headers: {
                'Cache-Control': 'no-store, max-age=0',
              },
            },
          );
        }
      }

      const posts = Array.isArray(rows) ? rows.map(mapCompactPostRow) : [];

      const hasMore = typeof total === 'number' ? page * limit < total : posts.length === limit;

      const cacheParam = (search.get('cache') || '').toLowerCase();
      const allowCache = cacheParam === '1' || cacheParam === 'true';

      return json(
        { posts, hasMore },
        {
          headers: {
            'Cache-Control': allowCache ? 'max-age=30, stale-while-revalidate=30' : 'no-store, max-age=0',
          },
        },
      );
    } catch {
      return proxyToBackend(req, env);
    }
  });
}
