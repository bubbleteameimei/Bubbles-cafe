// Search routes for Bubble's Cafe Worker.
// Extracted from src/index.ts to reduce entrypoint size and avoid duplicated state.

import type { Env } from './utils';
import { json } from './utils';

const MAX_TRENDING_QUERIES = 500;
const MAX_SEARCH_CACHE_ENTRIES = 200;
const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;

interface SearchCacheEntry {
  ts: number;
  data: any;
}

const trendingQueries = new Map<string, number>();
const searchCache = new Map<string, SearchCacheEntry>();

function pruneMapToSize<K, V>(map: Map<K, V>, maxSize: number): void {
  try {
    while (map.size > maxSize) {
      const first = map.keys().next();
      if (first.done) break;
      map.delete(first.value);
    }
  } catch {
    // ignore
  }
}

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

function recordTrendingQuery(query: string): void {
  try {
    const key = query.trim().toLowerCase().slice(0, 80);
    if (!key) return;
    trendingQueries.set(key, (trendingQueries.get(key) || 0) + 1);
    pruneMapToSize(trendingQueries, MAX_TRENDING_QUERIES);
  } catch {
    // ignore
  }
}

function makeSearchCacheKey(params: {
  q: string;
  types: string[];
  limit: number;
  page: number;
  from: string | null;
  category: string | null;
  tags: string[];
}): string {
  try {
    return JSON.stringify({
      q: params.q.trim().toLowerCase(),
      types: [...params.types].sort(),
      limit: params.limit,
      page: params.page,
      from: params.from,
      category: params.category,
      tags: [...params.tags].sort(),
    });
  } catch {
    return params.q;
  }
}

function pruneSearchCache(): void {
  try {
    const now = Date.now();

    for (const [key, entry] of searchCache.entries()) {
      if (!entry || typeof entry.ts !== 'number') {
        searchCache.delete(key);
        continue;
      }
      if (now - entry.ts > SEARCH_CACHE_TTL_MS) {
        searchCache.delete(key);
      }
    }

    pruneMapToSize(searchCache, MAX_SEARCH_CACHE_ENTRIES);
  } catch {
    // ignore
  }
}

async function fetchSupabasePosts(env: Env): Promise<any[]> {
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
    return [];
  }

  const rows = (await res.json().catch(() => [])) as any[];
  return Array.isArray(rows) ? rows : [];
}

export function registerSearchRoutes(router: any) {
  router.get('/api/search', async (req: Request, env: Env) => {
    try {
      const urlObj = new URL(req.url);
      const searchParams = urlObj.searchParams;

      const q = searchParams.get('q');
      if (!q || !q.trim()) {
        return json({ error: 'Search query is required' }, { status: 400 });
      }
      const searchQuery = q.trim();

      const typesParam = searchParams.get('types') || 'posts';
      const contentTypes = typesParam
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const limitRaw = parseInt(searchParams.get('limit') || '20', 10);
      const resultLimit = Math.min(Math.max(limitRaw || 20, 1), 50);

      const pageRaw = parseInt(searchParams.get('page') || '1', 10);
      const pageNum = Math.max(pageRaw || 1, 1);
      const offset = (pageNum - 1) * resultLimit;

      const fromParam = searchParams.get('from');
      const categoryParam = searchParams.get('category');
      const tagsParams = searchParams.getAll('tags');

      let fromDate: Date | null = null;
      if (fromParam && fromParam.trim()) {
        const days = parseInt(fromParam, 10);
        if (!isNaN(days) && days > 0) {
          fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        } else {
          const d = new Date(fromParam);
          if (!isNaN(d.getTime())) fromDate = d;
        }
      }

      let tagFilters: string[] = [];
      if (tagsParams && tagsParams.length) {
        tagFilters = tagsParams
          .flatMap((t) => String(t).split(','))
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t.length > 0);
      }

      const cacheKey = makeSearchCacheKey({
        q: searchQuery,
        types: contentTypes,
        limit: resultLimit,
        page: pageNum,
        from: fromDate ? fromDate.toISOString() : null,
        category: categoryParam || null,
        tags: tagFilters,
      });

      pruneSearchCache();

      const cached = searchCache.get(cacheKey);
      if (cached && Date.now() - cached.ts < SEARCH_CACHE_TTL_MS) {
        return json(cached.data);
      }

      if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
        const payload = {
          results: [],
          meta: {
            query: searchQuery,
            total: 0,
            page: pageNum,
            pages: 1,
            limit: resultLimit,
            types: contentTypes,
            from: fromDate ? fromDate.toISOString() : null,
            category: categoryParam || null,
            tags: tagFilters,
            didYouMean: null,
          },
        };
        searchCache.set(cacheKey, { ts: Date.now(), data: payload });
        pruneSearchCache();
        return json(payload);
      }

      let results: any[] = [];

      if (contentTypes.includes('posts') || !contentTypes.length) {
        const allPosts = await fetchSupabasePosts(env);
        if (allPosts.length) {
          const qLower = searchQuery.toLowerCase();
          const categoryNormalized = categoryParam ? categoryParam.trim().toLowerCase() : '';

          const filtered = allPosts.filter((post) => {
            if (post.is_secret) return false;

            if (categoryNormalized) {
              const theme = String(post.theme_category || '').toLowerCase();
              if (theme !== categoryNormalized) return false;
            }

            if (fromDate) {
              const created = new Date(post.created_at || 0);
              if (isNaN(created.getTime()) || created < fromDate) {
                return false;
              }
            }

            const titleText = stripHtml(post.title || '');
            const excerptText = stripHtml(post.excerpt || '');
            const contentText = stripHtml(post.content || '');
            const haystack = `${titleText} ${excerptText} ${contentText}`.toLowerCase();
            return haystack.includes(qLower);
          });

          const totalMatches = filtered.length;
          const paged = offset < totalMatches ? filtered.slice(offset, offset + resultLimit) : [];

          results = paged.map((post: any) => {
            const plainContent = stripHtml(post.content || '');
            const baseExcerpt =
              stripHtml(post.excerpt || '') ||
              (plainContent.length > 160 ? `${plainContent.slice(0, 160)}...` : plainContent);

            let matches: { text: string; context: string }[] = [];
            const idx = plainContent.toLowerCase().indexOf(qLower);
            if (idx >= 0) {
              const start = Math.max(0, idx - 60);
              const end = Math.min(plainContent.length, idx + searchQuery.length + 60);
              const context = plainContent.slice(start, end).trim();
              matches = [{ text: searchQuery, context }];
            }

            return {
              id: Number(post.id),
              title: post.title,
              excerpt: baseExcerpt,
              type: 'post',
              url: `/reader/${post.slug || post.id}`,
              matches,
              createdAt: post.created_at,
            };
          });

          const totalPages = Math.max(Math.ceil(totalMatches / resultLimit), 1);
          const payload = {
            results,
            meta: {
              query: searchQuery,
              total: totalMatches,
              page: pageNum,
              pages: totalPages,
              limit: resultLimit,
              types: contentTypes,
              from: fromDate ? fromDate.toISOString() : null,
              category: categoryParam || null,
              tags: tagFilters,
              didYouMean: null,
            },
          };

          recordTrendingQuery(searchQuery);
          searchCache.set(cacheKey, { ts: Date.now(), data: payload });
          pruneSearchCache();
          return json(payload);
        }
      }

      const payload = {
        results,
        meta: {
          query: searchQuery,
          total: 0,
          page: pageNum,
          pages: 1,
          limit: resultLimit,
          types: contentTypes,
          from: fromDate ? fromDate.toISOString() : null,
          category: categoryParam || null,
          tags: tagFilters,
          didYouMean: null,
        },
      };
      recordTrendingQuery(searchQuery);
      searchCache.set(cacheKey, { ts: Date.now(), data: payload });
      pruneSearchCache();
      return json(payload);
    } catch {
      return json({ error: 'An error occurred during search', results: [] }, { status: 500 });
    }
  });

  router.get('/api/search/suggest', async (req: Request, env: Env) => {
    try {
      const urlObj = new URL(req.url);
      const searchParams = urlObj.searchParams;
      const q = searchParams.get('q');
      const limitRaw = parseInt(searchParams.get('limit') || '10', 10);
      const max = Math.min(Math.max(limitRaw || 10, 1), 20);

      if (!q || q.trim().length < 2) {
        const sorted = Array.from(trendingQueries.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, max)
          .map(([term]) => ({
            id: term,
            title: term,
            type: 'query',
            url: `/search?q=${encodeURIComponent(term)}`,
          }));
        return json({ suggestions: sorted });
      }

      if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
        return json({ suggestions: [] });
      }

      const searchTerm = q.trim().toLowerCase();
      const allPosts = await fetchSupabasePosts(env);
      if (!allPosts.length) {
        return json({ suggestions: [] });
      }

      const titleMatches: any[] = [];
      const contentMatches: any[] = [];

      for (const post of allPosts) {
        if (post.is_secret) continue;
        const titleText = stripHtml(post.title || '');
        const contentText = stripHtml(post.content || '');

        const titleIncludes = titleText.toLowerCase().includes(searchTerm);
        const contentIncludes = contentText.toLowerCase().includes(searchTerm);

        if (titleIncludes) {
          titleMatches.push(post);
        } else if (contentIncludes) {
          contentMatches.push(post);
        }
      }

      const combined = [...titleMatches, ...contentMatches].slice(0, max);
      const suggestions = combined.map((post: any) => ({
        id: Number(post.id),
        title: post.title || 'Untitled',
        type: 'post',
        url: `/reader/${post.slug || post.id}`,
      }));

      return json({ suggestions });
    } catch {
      return json({ suggestions: [] }, { status: 500 });
    }
  });
}
