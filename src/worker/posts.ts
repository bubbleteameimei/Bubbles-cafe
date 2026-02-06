// Posts domain routes for Bubble's Cafe Worker.
// Extracted from src/index.ts to keep the Worker entrypoint slimmer while
// preserving existing behavior.

import type { Env } from './utils';
import { json, proxyToBackend, getJsonFromCache, setJsonCache, buildPostSummaries } from './utils';

// Map a Supabase posts row to the API post shape.
// Copied from src/index.ts so it can be shared by posts routes and other modules.
export function mapSupabasePostRowToPost(row: any): any {
  const content = typeof row.content === 'string' ? row.content : '';
  const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};

  const readingTimeMinutesValue =
    row.reading_time_minutes != null
      ? Number(row.reading_time_minutes)
      : Math.max(
          1,
          Math.ceil(content.split(/\s+/).filter((w: string) => w.length > 0).length / 200),
        );

  const likesCount = Number(row.likes_count ?? row.likesCount ?? 0);
  const dislikesCount = Number(row.dislikes_count ?? row.dislikesCount ?? 0);
  const baselineLikes = Number(row.baseline_likes ?? row.baselineLikes ?? 0);
  const baselineDislikes = Number(row.baseline_dislikes ?? row.baselineDislikes ?? 0);

  const themeCategory = row.theme_category ?? (metadata as any)?.themeCategory ?? null;

  return {
    id: Number(row.id),
    title: row.title ?? '',
    content,
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
    readingTimeMinutes: readingTimeMinutesValue,
    likesCount,
    dislikesCount,
    baselineLikes,
    baselineDislikes,
    metadata,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

// Fetch posts list from Supabase for listing/search contexts.
// Copied from src/index.ts so it can be reused by search routes as well.
export async function fetchSupabasePosts(env: Env): Promise<any[]> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return [];
  }

  const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
  const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
  postsUrl.searchParams.set(
    'select',
    'id,title,content,excerpt,slug,author_id,is_secret,isAdminPost,mature_content,theme_category,reading_time_minutes,likes_count,dislikes_count,baseline_likes,baseline_dislikes,metadata,created_at',
  );
  postsUrl.searchParams.set('order', 'created_at.desc');
  postsUrl.searchParams.set('limit', '1000');

  const res = await fetch(postsUrl.toString(), {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch posts from Supabase');
  }

  const rows = (await res.json().catch(() => [])) as any[];
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map(mapSupabasePostRowToPost);
}

// Register all posts-related routes (public reader endpoints) on the provided router instance.
export function registerPostsRoutes(router: any) {
  // GET /api/posts/slug/:slug - fetch full post by slug
  router.get('/api/posts/slug/:slug', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split('/');
      const rawSlug = decodeURIComponent(segments[segments.length - 1] || '').trim();
      if (!rawSlug) {
        return json({ error: 'Slug is required' }, { status: 400 });
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
      postsUrl.searchParams.set(
        'select',
        'id,title,content,excerpt,slug,author_id,is_secret,mature_content,theme_category,reading_time_minutes,likes_count,dislikes_count,baseline_likes,baseline_dislikes,metadata,created_at',
      );
      postsUrl.searchParams.set('slug', `eq.${rawSlug}`);
      postsUrl.searchParams.set('limit', '1');

      const res = await fetch(postsUrl.toString(), {
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        const rows = (await res.json().catch(() => [])) as any[];
        if (Array.isArray(rows) && rows.length > 0) {
          const row = rows[0] as any;
          const content = typeof row.content === 'string' ? row.content : '';
          const readingTimeMinutesValue =
            row.reading_time_minutes != null
              ? Number(row.reading_time_minutes)
              : Math.max(
                  1,
                  Math.ceil(content.split(/\s+/).filter((w: string) => w.length > 0).length / 200),
                );

          const metadata =
            row.metadata && typeof row.metadata === 'object' ? row.metadata : undefined;

          const likesCount = Number(row.likes_count ?? row.likesCount ?? 0);
          const dislikesCount = Number(row.dislikes_count ?? row.dislikesCount ?? 0);

          const baselineLikes = Number(row.baseline_likes ?? row.baselineLikes ?? 0);
          const baselineDislikes = Number(row.baseline_dislikes ?? row.baselineDislikes ?? 0);

          const post = {
            id: Number(row.id),
            title: row.title ?? '',
            content,
            slug: row.slug ?? rawSlug,
            excerpt: row.excerpt ?? null,
            authorId: row.author_id != null ? Number(row.author_id) : undefined,
            isSecret: Boolean(row.is_secret),
            isAdminPost: null,
            matureContent: Boolean(row.mature_content),
            themeCategory: row.theme_category ?? (metadata as any)?.themeCategory ?? null,
            readingTimeMinutes: readingTimeMinutesValue,
            likesCount,
            dislikesCount,
            baselineLikes,
            baselineDislikes,
            metadata: metadata ?? {},
            createdAt: row.created_at ?? new Date().toISOString(),
          };

          return json(post);
        }
      }

      // Supabase has no matching row; fall back to WordPress posts so that
      // legacy stories remain readable without returning a 404.
      try {
        const wpBase =
          env.WORDPRESS_API ||
          'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts';
        const params = new URLSearchParams();
        params.set('slug', rawSlug);
        params.set('per_page', '1');

        const wpRes = await fetch(`${wpBase}?${params.toString()}`);
        if (wpRes.ok) {
          const wpPosts = (await wpRes.json().catch(() => [])) as any[];
          if (Array.isArray(wpPosts) && wpPosts.length > 0) {
            const post = wpPosts[0] as any;
            const title =
              (post?.title && typeof post.title.rendered === 'string'
                ? post.title.rendered
                : '') || 'Untitled Story';
            const contentHtml =
              (post?.content && typeof post.content.rendered === 'string'
                ? post.content.rendered
                : '') || '';
            const excerpt =
              (post?.excerpt && typeof post.excerpt.rendered === 'string'
                ? post.excerpt.rendered
                : '') || null;
            const slug =
              typeof post.slug === 'string' && post.slug.trim() ? post.slug : rawSlug;
            const createdAt = (post.date as string) || new Date().toISOString();

            const wordCount = contentHtml
              .replace(/<[^>]*>/g, ' ')
              .split(/\s+/)
              .filter(Boolean).length;
            const readingTimeMinutesValue = Math.max(1, Math.ceil(wordCount / 200));

            const metadata: any = {
              ...(post.meta || {}),
              wordpressId: typeof post.id === 'number' ? post.id : undefined,
              wordpressLink: typeof post.link === 'string' ? post.link : undefined,
              source: 'wordpress_api',
            };

            const fallbackPost = {
              id: typeof post.id === 'number' ? post.id : Date.now(),
              title,
              content: contentHtml,
              slug,
              excerpt,
              authorId: undefined,
              isSecret: false,
              isAdminPost: false,
              matureContent: false,
              themeCategory: null,
              readingTimeMinutes: readingTimeMinutesValue,
              likesCount: 0,
              dislikesCount: 0,
              baselineLikes: 0,
              baselineDislikes: 0,
              metadata,
              createdAt,
            };

            return json(fallbackPost);
          }
        }
      } catch {
        // Ignore WordPress fallback errors; we'll fall through to a 404.
      }

      return json({ error: 'Post not found' }, { status: 404 });
    } catch {
      return json({ error: 'Failed to fetch post' }, { status: 500 });
    }
  });

  // GET /api/posts/:id/summary - single post summary by external id
  router.get('/api/posts/:id/summary', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split('/');
      // .../api/posts/:id/summary -> second to last segment is id
      const idSegment = segments.length >= 2 ? segments[segments.length - 2] : '';
      const rawId = parseInt(decodeURIComponent(idSegment || ''), 10);
      if (!Number.isFinite(rawId) || rawId <= 0) {
        return json({ error: 'Invalid post id' }, { status: 400 });
      }

      const summaries = await buildPostSummaries(env, [rawId]);
      if (!summaries.length) {
        return json({ error: 'Post not found' }, { status: 404 });
      }

      return json(summaries[0]);
    } catch {
      return json({ error: 'Failed to fetch post summary' }, { status: 500 });
    }
  });

  // GET /api/posts/summary?ids=1,2,3 - batch summaries by external ids
  router.get('/api/posts/summary', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const search = urlObj.searchParams;
      const rawParams = [...search.getAll('ids'), ...search.getAll('id')];
      const joined = rawParams.length ? rawParams.join(',') : '';
      const list = joined
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n) && n > 0);

      const ids = Array.from(new Set(list));
      if (!ids.length) {
        return json({ results: [] });
      }

      const results = await buildPostSummaries(env, ids);
      return json({ results });
    } catch {
      return json({ error: 'Failed to fetch post summaries' }, { status: 500 });
    }
  });

  // GET /api/posts - posts listing with optional cursor pagination and caching
  router.get('/api/posts', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const search = urlObj.searchParams;

      const pageParam = parseInt(search.get('page') || '1', 10);
      const limitParam = parseInt(search.get('limit') || '16', 10);
      const cursor = search.get('cursor');

      const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
      const rawLimit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 16;
      const limit = Math.max(1, Math.min(rawLimit, 100));

      const category = (search.get('category') || '').trim();
      const searchTermRaw = (search.get('search') || '').trim();
      const searchTerm = searchTermRaw.toLowerCase();

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');

      const includeContentParam = (search.get('includeContent') || '').toLowerCase();
      const includeContent = includeContentParam !== 'false';

      const isFirstPageDefaultFeed =
        !cursor && page === 1 && !category && !searchTerm && !!env.CACHE_KV;

      const cacheKey = isFirstPageDefaultFeed
        ? `posts:first-page:v2:limit=${limit}:includeContent=${includeContent ? '1' : '0'}`
        : null;

      if (isFirstPageDefaultFeed && cacheKey) {
        const cached = await getJsonFromCache(env, cacheKey);
        if (cached) {
          return json(cached, {
            headers: {
              'Cache-Control': 'max-age=300, stale-while-revalidate=300',
            },
          });
        }
      }

      const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
      const selectAll =
        'id,title,content,excerpt,slug,author_id,is_secret,isAdminPost,mature_content,theme_category,reading_time_minutes,likes_count,dislikes_count,baseline_likes,baseline_dislikes,metadata,created_at';
      const selectWithoutContent =
        'id,title,excerpt,slug,author_id,is_secret,isAdminPost,mature_content,theme_category,reading_time_minutes,likes_count,dislikes_count,baseline_likes,baseline_dislikes,metadata,created_at';
      postsUrl.searchParams.set('select', includeContent ? selectAll : selectWithoutContent);
      postsUrl.searchParams.set('order', 'created_at.desc');

      const useCursor = typeof cursor === 'string' && cursor.length > 0;
      const limitForQuery = useCursor ? limit + 1 : limit;
      postsUrl.searchParams.set('limit', String(limitForQuery));

      if (useCursor) {
        postsUrl.searchParams.set('created_at', `lt.${cursor}`);
      } else {
        const offset = (page - 1) * limit;
        if (offset > 0) {
          postsUrl.searchParams.set('offset', String(offset));
        }
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

      const rows = (await res.json().catch(() => [])) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        const emptyPayload = { posts: [], hasMore: false, nextCursor: null as string | null };
        if (isFirstPageDefaultFeed && cacheKey) {
          await setJsonCache(env, cacheKey, emptyPayload, 300);
        }
        return json(emptyPayload, {
          headers: {
            'Cache-Control': useCursor
              ? 'max-age=60, stale-while-revalidate=120'
              : 'max-age=300, stale-while-revalidate=300',
          },
        });
      }

      const mapped = rows.map(mapSupabasePostRowToPost);

      let posts = mapped;
      let hasMore = false;
      let nextCursor: string | null = null;

      if (useCursor) {
        const slice = mapped.slice(0, limit);
        posts = slice;
        hasMore = mapped.length > limit;
        const last = slice[slice.length - 1];
        nextCursor = hasMore && last && typeof last.createdAt === 'string' ? last.createdAt : null;
      } else {
        const contentRange = res.headers.get('Content-Range');
        if (contentRange && contentRange.includes('/')) {
          const parts = contentRange.split('/');
          const totalStr = parts[1];
          const total = parseInt(totalStr, 10);
          if (Number.isFinite(total)) {
            hasMore = page * limit < total;
          }
        } else {
          hasMore = posts.length === limit;
        }

        const last = posts[posts.length - 1];
        nextCursor = last && typeof last.createdAt === 'string' ? last.createdAt : null;
      }

      const payload: any = { posts, hasMore };
      if (nextCursor) {
        payload.nextCursor = nextCursor;
      }

      const cacheControl = useCursor
        ? 'max-age=60, stale-while-revalidate=120'
        : 'max-age=300, stale-while-revalidate=300';

      if (isFirstPageDefaultFeed && cacheKey) {
        await setJsonCache(env, cacheKey, payload, 300);
      }

      return json(payload, {
        headers: {
          'Cache-Control': cacheControl,
        },
      });
    } catch {
      return proxyToBackend(req, env);
    }
  });

  // GET /api/posts/community - community posts listing
  router.get('/api/posts/community', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const search = urlObj.searchParams;

      const pageParam = parseInt(search.get('page') || '1', 10);
      const limitParam = parseInt(search.get('limit') || '16', 10);
      const cursor = search.get('cursor');

      const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
      const rawLimit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 16;
      const limit = Math.max(1, Math.min(rawLimit, 100));

      const category = (search.get('category') || '').trim();
      const searchTermRaw = (search.get('search') || '').trim();
      const searchTerm = searchTermRaw.toLowerCase();

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
      const includeContentParam = (search.get('includeContent') || '').toLowerCase();
      const includeContent = includeContentParam !== 'false';
      const selectAll =
        'id,title,content,excerpt,slug,author_id,is_secret,isAdminPost,mature_content,theme_category,reading_time_minutes,likes_count,dislikes_count,baseline_likes,baseline_dislikes,metadata,created_at';
      const selectWithoutContent =
        'id,title,excerpt,slug,author_id,is_secret,isAdminPost,mature_content,theme_category,reading_time_minutes,likes_count,dislikes_count,baseline_likes,baseline_dislikes,metadata,created_at';
      postsUrl.searchParams.set('select', includeContent ? selectAll : selectWithoutContent);
      postsUrl.searchParams.set('order', 'created_at.desc');

      const useCursor = typeof cursor === 'string' && cursor.length > 0;
      const limitForQuery = useCursor ? limit + 1 : limit;
      postsUrl.searchParams.set('limit', String(limitForQuery));

      if (useCursor) {
        postsUrl.searchParams.set('created_at', `lt.${cursor}`);
      } else {
        const offset = (page - 1) * limit;
        if (offset > 0) {
          postsUrl.searchParams.set('offset', String(offset));
        }
      }

      // Restrict to community posts (metadata.isCommunityPost === true)
      postsUrl.searchParams.set('metadata->>isCommunityPost', 'eq.true');

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

      const rows = (await res.json().catch(() => [])) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        return json(
          { posts: [], hasMore: false, nextCursor: null as string | null },
          {
            headers: {
              'Cache-Control': useCursor
                ? 'max-age=60, stale-while-revalidate=120'
                : 'max-age=120, stale-while-revalidate=240',
            },
          },
        );
      }

      const mapped = rows.map(mapSupabasePostRowToPost);

      let posts = mapped;
      let hasMore = false;
      let nextCursor: string | null = null;

      if (useCursor) {
        const slice = mapped.slice(0, limit);
        posts = slice;
        hasMore = mapped.length > limit;
        const last = slice[slice.length - 1];
        nextCursor = hasMore && last && typeof last.createdAt === 'string' ? last.createdAt : null;
      } else {
        const contentRange = res.headers.get('Content-Range');
        if (contentRange && contentRange.includes('/')) {
          const parts = contentRange.split('/');
          const totalStr = parts[1];
          const total = parseInt(totalStr, 10);
          if (Number.isFinite(total)) {
            hasMore = page * limit < total;
          }
        } else {
          hasMore = posts.length === limit;
        }

        const last = posts[posts.length - 1];
        nextCursor = last && typeof last.createdAt === 'string' ? last.createdAt : null;
      }

      const cacheControl = useCursor
        ? 'max-age=60, stale-while-revalidate=120'
        : 'max-age=120, stale-while-revalidate=240';

      const payload: any = { posts, hasMore };
      if (nextCursor) {
        payload.nextCursor = nextCursor;
      }

      return json(payload, {
        headers: {
          'Cache-Control': cacheControl,
        },
      });
    } catch {
      return proxyToBackend(req, env);
    }
  });
}