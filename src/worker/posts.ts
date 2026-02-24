// Posts domain routes for Bubble's Cafe Worker.
// Extracted from src/index.ts to keep the Worker entrypoint slimmer while
// preserving</old_code><new_code>import type { Env } from './utils';
import {
  json,
  proxyToBackend,
  getJsonFromCache,
 on,
  proxyToBackend,
  getJsonFromCache,
  setJsonCache,
  buildPostSummaries,
  getBearerToken,
  getSupabaseCurrentUser,
} from './utils';</old_code><new_code>import {
  json,
  proxyToBackend,
  getJsonFromCache,
  setJsonCache,
  buildPostSummaries,
  getBearerToken,
  getSupabaseCurrentUser,
} from './utils';

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

function parseMetadata(raw: any): Record<string, any> {
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
}

async function fetchWordpressPostsList(
  env: Env,
  opts: { page: number; limit: number; search?: string; slug?: string },
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
    if (opts.slug) params.set('slug', opts.slug);

    const res = await fetch(`${wpBase}?${params.toString()}`);
    if (!res.ok) return null;

    const rows = (await res.json().catch(() => [])) as any[];
    if (!Array.isArray(rows)) return { posts: [], hasMore: false };

    const posts = rows.map((post: any) => {
      const title =
        (post?.title && typeof post.title.rendered === 'string' ? post.title.rendered : '') ||
        'Untitled Story';
      const contentHtml =
        (post?.content && typeof post.content.rendered === 'string' ? post.content.rendered : '') ||
        '';
      const excerptHtml =
        (post?.excerpt && typeof post.excerpt.rendered === 'string' ? post.excerpt.rendered : '') ||
        '';

      const slug =
        typeof post.slug === 'string' && post.slug.trim() ? post.slug.trim() : String(post.id || '');

      const contentText = stripHtml(contentHtml);
      const wordCount = contentText.split(/\s+/).filter(Boolean).length;
      const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

      return {
        id: typeof post.id === 'number' ? post.id : Date.now(),
        title,
        content: contentHtml,
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

    return {
      posts,
      hasMore: rows.length === perPage,
    };
  } catch {
    return null;
  }
}

export function mapSupabasePostRowToPost(row: any): any {
  const content = typeof row.content === 'string' ? row.content : '';
  const metadata = parseMetadata((row as any)?.metadata);

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
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY}`,
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

export function registerPostsRoutes(router: any) {
  router.get('/api/posts/slug/:slug', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      try {
        const urlObj = new URL(req.url);
        const segments = urlObj.pathname.split('/');
        const rawSlug = decodeURIComponent(segments[segments.length - 1] || '').trim();
        if (!rawSlug) {
          return json({ error: 'Slug is required' }, { status: 400 });
        }

        const fallback = await fetchWordpressPostsList(env, { page: 1, limit: 1, slug: rawSlug });
        const post = fallback && fallback.posts && fallback.posts[0] ? fallback.posts[0] : null;
        if (post) {
          return json(post, {
            headers: { 'Cache-Control': 'max-age=120, stale-while-revalidate=240' },
          });
        }
      } catch {
        // fall through
      }

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

      const token = getBearerToken(req);
      const res = await fetch(postsUrl.toString(), {
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token || env.SUPABASE_ANON_KEY}`,
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        const rows = (await res.json().catch(() => [])) as any[];
        if (Array.isArray(rows) && rows.length > 0) {
          return json(mapSupabasePostRowToPost(rows[0]));
        }
      }

      // Community posts live in a separate table.
      try {
        const communityUrl = new URL(`${baseUrl}/rest/v1/community_posts`);
        communityUrl.searchParams.set(
          'select',
          'id,title,content,excerpt,slug,author_id,theme_category,metadata,created_at,updated_at',
        );
        communityUrl.searchParams.set('slug', `eq.${rawSlug}`);
        communityUrl.searchParams.set('limit', '1');

        const communityRes = await fetch(communityUrl.toString(), {
          headers: {
            apikey: env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token || env.SUPABASE_ANON_KEY}`,
            Accept: 'application/json',
          },
        });

        if (communityRes.ok) {
          const rows = (await communityRes.json().catch(() => [])) as any[];
          if (Array.isArray(rows) && rows.length > 0) {
            const row = rows[0] as any;
            const rawContent = typeof row.content === 'string' ? row.content : '';
            const wordCount = stripHtml(rawContent).split(/\s+/).filter(Boolean).length;

            const metadata = parseMetadata(row.metadata);
            return json({
              id: Number(row.id),
              title: row.title ?? '',
              content: rawContent,
              slug: row.slug ?? '',
              excerpt: row.excerpt ?? null,
              authorId: row.author_id != null ? Number(row.author_id) : undefined,
              isSecret: false,
              isAdminPost: false,
              matureContent: false,
              themeCategory: row.theme_category ?? (metadata as any)?.themeCategory ?? null,
              readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
              likesCount: 0,
              dislikesCount: 0,
              baselineLikes: 0,
              baselineDislikes: 0,
              metadata: { ...metadata, isCommunityPost: true },
              createdAt: row.created_at ?? new Date().toISOString(),
            });
          }
        }
      } catch {
        // ignore
      }

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

            const wordCount = stripHtml(contentHtml).split(/\s+/).filter(Boolean).length;
            const readingTimeMinutesValue = Math.max(1, Math.ceil(wordCount / 200));

            const metadata: any = {
              ...(post.meta || {}),
              wordpressId: typeof post.id === 'number' ? post.id : undefined,
              wordpressLink: typeof post.link === 'string' ? post.link : undefined,
              source: 'wordpress_api',
            };

            return json({
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
            });
          }
        }
      } catch {
        // ignore
      }

      return json({ error: 'Post not found' }, { status: 404 });
    } catch {
      return json({ error: 'Failed to fetch post' }, { status: 500 });
    }
  });

  router.get('/api/posts/:id/summary', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split('/');
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

      // Default behavior: no edge caching (keeps refreshes consistent and avoids stale data).
      // To opt-in to caching for the default feed, pass ?cache=1.
      const cacheParam = (search.get('cache') || '').toLowerCase();
      const allowCache = cacheParam === '1' || cacheParam === 'true';

      const isFirstPageDefaultFeed =
        allowCache && !cursor && page === 1 && !category && !searchTerm && !!env.CACHE_KV;

      const cacheKey = isFirstPageDefaultFeed
        ? `posts:first-page:v3:limit=${limit}:includeContent=${includeContent ? '1' : '0'}`
        : null;

      if (isFirstPageDefaultFeed && cacheKey) {
        const cached = await getJsonFromCache(env, cacheKey);
        if (cached) {
          return json(cached, {
            headers: {
              'Cache-Control': 'max-age=30, stale-while-revalidate=30',
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

      const rows = (await res.json().catch(() => [])) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        const emptyPayload = { posts: [], hasMore: false, nextCursor: null as string | null };
        if (isFirstPageDefaultFeed && cacheKey) {
          await setJsonCache(env, cacheKey, emptyPayload, 30);
        }
        return json(emptyPayload, {
          headers: {
            'Cache-Control': allowCache
              ? useCursor
                ? 'max-age=60, stale-while-revalidate=120'
                : 'max-age=30, stale-while-revalidate=30'
              : 'no-store, max-age=0',
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

      const cacheControl = allowCache
        ? useCursor
          ? 'max-age=60, stale-while-revalidate=120'
          : 'max-age=30, stale-while-revalidate=30'
        : 'no-store, max-age=0';

      if (isFirstPageDefaultFeed && cacheKey) {
        await setJsonCache(env, cacheKey, payload, 30);
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

  // POST /api/posts - create a community post (stored in posts with metadata.isCommunityPost=true)
  router.post('/api/posts', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    const token = getBearerToken(req);
    if (!token) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    const currentUser = await getSupabaseCurrentUser(env, token).catch(() => null);
    if (!currentUser) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    let body: any = null;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const content = typeof body?.content === 'string' ? body.content : '';
    const excerpt = typeof body?.excerpt === 'string' ? body.excerpt : null;
    const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
    const themeCategory = typeof body?.themeCategory === 'string' ? body.themeCategory : null;
    const isSecret = Boolean(body?.isSecret);
    const matureContent = Boolean(body?.matureContent);

    if (!title || title.length < 3) {
      return json({ error: 'Title is required' }, { status: 400 });
    }
    if (!content || content.length < 25) {
      return json({ error: 'Content is required' }, { status: 400 });
    }
    if (!slug) {
      return json({ error: 'Slug is required' }, { status: 400 });
    }

    const readingTimeMinutes = Math.max(
      1,
      Math.ceil(stripHtml(content).split(/\s+/).filter(Boolean).length / 200),
    );

    const metadata = {
      ...(body?.metadata && typeof body.metadata === 'object' ? body.metadata : {}),
      isCommunityPost: true,
      source: 'community',
    };

    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
    const url = new URL(`${baseUrl}/rest/v1/posts`);

    const insertRes = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        title,
        content,
        excerpt,
        slug,
        author_id: currentUser.id,
        is_secret: isSecret,
        isAdminPost: false,
        mature_content: matureContent,
        theme_category: themeCategory,
        reading_time_minutes: readingTimeMinutes,
        metadata,
      }),
    });

    if (!insertRes.ok) {
      const text = await insertRes.text().catch(() => '');
      return json({ error: 'Failed to create post', detail: text.slice(0, 300) }, { status: 500 });
    }

    const rows = (await insertRes.json().catch(() => [])) as any[];
    const created = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    if (!created) {
      return json({ success: true }, { status: 201 });
    }

    return json(mapSupabasePostRowToPost(created), {
      status: 201,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  });

  // PUT /api/posts/:id - update a community post (owner or admin)
  router.put('/api/posts/:id', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    const token = getBearerToken(req);
    if (!token) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    const currentUser = await getSupabaseCurrentUser(env, token).catch(() => null);
    if (!currentUser) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    const urlObj = new URL(req.url);
    const segments = urlObj.pathname.split('/');
    const idSegment = segments[segments.length - 1] || '';
    const postId = parseInt(idSegment, 10);
    if (!Number.isFinite(postId) || postId <= 0) {
      return json({ error: 'Invalid post id' }, { status: 400 });
    }

    let body: any = null;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
    const fetchUrl = new URL(`${baseUrl}/rest/v1/posts`);
    fetchUrl.searchParams.set('select', 'id,author_id,metadata');
    fetchUrl.searchParams.set('id', `eq.${postId}`);
    fetchUrl.searchParams.set('limit', '1');

    const existingRes = await fetch(fetchUrl.toString(), {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
    });

    const existingRows = existingRes.ok ? (((await existingRes.json().catch(() => [])) as any[]) || []) : [];
    const existing = Array.isArray(existingRows) && existingRows.length > 0 ? existingRows[0] : null;
    if (!existing) {
      return json({ error: 'Post not found' }, { status: 404 });
    }

    const existingMeta = parseMetadata(existing.metadata);
    if (existingMeta.isCommunityPost !== true) {
      return json({ error: 'Only community posts can be edited via this endpoint' }, { status: 400 });
    }

    const ownerId = existing.author_id != null ? Number(existing.author_id) : null;
    if (!currentUser.isAdmin && ownerId !== currentUser.id) {
      return json({ error: 'Not allowed' }, { status: 403 });
    }

    const patch: any = {};
    if (typeof body?.title === 'string') patch.title = body.title.trim();
    if (typeof body?.content === 'string') patch.content = body.content;
    if (typeof body?.excerpt === 'string' || body?.excerpt === null) patch.excerpt = body.excerpt;
    if (typeof body?.themeCategory === 'string' || body?.themeCategory === null)
      patch.theme_category = body.themeCategory;
    if (typeof body?.matureContent === 'boolean') patch.mature_content = body.matureContent;
    if (typeof body?.isSecret === 'boolean') patch.is_secret = body.isSecret;

    if (patch.content) {
      patch.reading_time_minutes = Math.max(
        1,
        Math.ceil(stripHtml(patch.content).split(/\s+/).filter(Boolean).length / 200),
      );
    }

    if (body?.metadata && typeof body.metadata === 'object') {
      patch.metadata = { ...existingMeta, ...body.metadata, isCommunityPost: true, source: 'community' };
    }

    const updateUrl = new URL(`${baseUrl}/rest/v1/posts`);
    updateUrl.searchParams.set('id', `eq.${postId}`);

    const updateRes = await fetch(updateUrl.toString(), {
      method: 'PATCH',
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(patch),
    });

    if (!updateRes.ok) {
      const text = await updateRes.text().catch(() => '');
      return json({ error: 'Failed to update post', detail: text.slice(0, 300) }, { status: 500 });
    }

    const updatedRows = (await updateRes.json().catch(() => [])) as any[];
    const updated = Array.isArray(updatedRows) && updatedRows.length > 0 ? updatedRows[0] : null;
    return json(updated ? mapSupabasePostRowToPost(updated) : { success: true }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  });

  // DELETE /api/posts/:id - delete a community post (owner or admin)
  router.delete('/api/posts/:id', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    const token = getBearerToken(req);
    if (!token) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    const currentUser = await getSupabaseCurrentUser(env, token).catch(() => null);
    if (!currentUser) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    const urlObj = new URL(req.url);
    const segments = urlObj.pathname.split('/');
    const idSegment = segments[segments.length - 1] || '';
    const postId = parseInt(idSegment, 10);
    if (!Number.isFinite(postId) || postId <= 0) {
      return json({ error: 'Invalid post id' }, { status: 400 });
    }

    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
    const fetchUrl = new URL(`${baseUrl}/rest/v1/posts`);
    fetchUrl.searchParams.set('select', 'id,author_id,metadata');
    fetchUrl.searchParams.set('id', `eq.${postId}`);
    fetchUrl.searchParams.set('limit', '1');

    const existingRes = await fetch(fetchUrl.toString(), {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
    });

    const existingRows = existingRes.ok ? (((await existingRes.json().catch(() => [])) as any[]) || []) : [];
    const existing = Array.isArray(existingRows) && existingRows.length > 0 ? existingRows[0] : null;
    if (!existing) {
      return json({ error: 'Post not found' }, { status: 404 });
    }

    const existingMeta = parseMetadata(existing.metadata);
    if (existingMeta.isCommunityPost !== true) {
      return json({ error: 'Only community posts can be deleted via this endpoint' }, { status: 400 });
    }

    const ownerId = existing.author_id != null ? Number(existing.author_id) : null;
    if (!currentUser.isAdmin && ownerId !== currentUser.id) {
      return json({ error: 'Not allowed' }, { status: 403 });
    }

    const deleteUrl = new URL(`${baseUrl}/rest/v1/posts`);
    deleteUrl.searchParams.set('id', `eq.${postId}`);

    const deleteRes = await fetch(deleteUrl.toString(), {
      method: 'DELETE',
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!deleteRes.ok) {
      const text = await deleteRes.text().catch(() => '');
      return json({ error: 'Failed to delete post', detail: text.slice(0, 300) }, { status: 500 });
    }

    return json({ success: true }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  });

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

      const baseUrl = env.SUPABASE_URL.replace(/\/\/+$/, '');
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

      // Canonical community storage: posts.metadata.isCommunityPost === true
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