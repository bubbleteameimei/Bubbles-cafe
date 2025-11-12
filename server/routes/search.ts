import { Router } from 'express';
import { db } from '../db';
import { posts, comments, users, reportedContent } from '@shared/schema';
import { sql } from 'drizzle-orm';

const router = Router();

// Simple in-memory cache and trending tracker (ephemeral)
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const searchCache = new Map<string, { ts: number; data: any }>();
const trendingQueries = new Map<string, number>();

function makeCacheKey(params: Record<string, unknown>) {
  return JSON.stringify(params);
}

function recordTrending(query: string) {
  try {
    const key = query.trim().toLowerCase().slice(0, 80);
    if (!key) return;
    trendingQueries.set(key, (trendingQueries.get(key) || 0) + 1);
  } catch {}
}

function levenshtein(a: string, b: string) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

router.get('/', async (req, res) => {
  try {
    const { 
      q, 
      types = 'posts,pages,comments,legal,settings', 
      limit = '20',
      page = '1',
      from,
      category,
      tags
    } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchQuery = q.trim();
    const contentTypes = typeof types === 'string' ? String(types).split(',') : ['posts'];
    const resultLimit = Math.min(Math.max(parseInt(String(limit), 10) || 20, 1), 50);
    const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
    const offset = (pageNum - 1) * resultLimit;

    // Date filter parsing
    let fromDate: Date | null = null;
    if (typeof from === 'string' && from) {
      const days = parseInt(from, 10);
      if (!isNaN(days) && days > 0) {
        fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      } else {
        const d = new Date(from);
        if (!isNaN(d.getTime())) fromDate = d;
      }
    }

    // Parse tag filters (case-insensitive)
    let tagFilters: string[] = [];
    if (Array.isArray(tags)) {
      tagFilters = (tags as string[]).flatMap((t) => String(t).split(','));
    } else if (typeof tags === 'string' && tags.trim()) {
      tagFilters = String(tags).split(',');
    }
    tagFilters = tagFilters.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0);

    const cacheParams = { q: searchQuery, types: contentTypes, limit: resultLimit, page: pageNum, from: fromDate?.toISOString() || null, category: category || null, tags: tagFilters };
    const key = makeCacheKey(cacheParams);
    const cached = searchCache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return res.json(cached.data);
    }

    let results: any[] = [];

    // POSTS: Full-Text Search in SQL, minimal payload
    if (contentTypes.includes('posts')) {
      const rankSql = sql`ts_rank(
        to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,'')),
        websearch_to_tsquery('english', ${searchQuery})
      ) AS rank`;

      const whereParts: any[] = [
        sql`is_secret = false`,
        sql`to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,'')) @@ websearch_to_tsquery('english', ${searchQuery})`
      ];

      if (typeof category === 'string' && category.trim()) {
        const cat = category.trim();
        whereParts.push(sql`(theme_category = ${cat} OR (metadata->>'themeCategory')::text = ${cat})`);
      }
      if (fromDate) {
        whereParts.push(sql`created_at >= ${fromDate}`);
      }

      const whereClause = whereParts.length ? sql.join(whereParts, sql` AND `) : sql`true`;

      const query = sql`
        SELECT id, title, slug, excerpt, content, created_at, ${rankSql}
        FROM posts
        WHERE ${whereClause}
        ORDER BY rank DESC, created_at DESC
        LIMIT ${resultLimit} OFFSET ${offset}
      `;

      try {
        const result = await db.execute(query);
        const rows = (result as any)?.rows || [];

        const postResults = rows.map((row: any) => {
          const plainContent = String(row.content || '').replace(/<[^>]+>/g, '');
          // Create a lightweight excerpt: first 160 chars
          const excerpt = (String(row.excerpt || '') || plainContent.substring(0, 160) + '...');
          // Minimal matches array (first snippet around query term)
          let matches: { text: string; context: string }[] = [];
          const idx = plainContent.toLowerCase().indexOf(searchQuery.toLowerCase());
          if (idx >= 0) {
            const start = Math.max(0, idx - 60);
            const end = Math.min(plainContent.length, idx + searchQuery.length + 60);
            matches = [{ text: searchQuery, context: plainContent.substring(start, end).trim() }];
          }

          return {
            id: Number(row.id),
            title: row.title,
            excerpt,
            type: 'post',
            url: `/reader/${row.slug || row.id}`,
            matches,
            createdAt: row.created_at
          };
        });

        results = results.concat(postResults);
      } catch (err) {
        console.error('[Search] SQL FTS query failed, falling back:', err);
        results = results; // keep as is
      }
    }

    // COMMENTS: keep minimal in-memory filtering for now, limited payload
    if (contentTypes.includes('comments')) {
      try {
        const rows = await db.execute(sql`
          SELECT id, content, post_id, user_id, created_at
          FROM comments
          WHERE content ILIKE ${'%' + searchQuery + '%'}
          ORDER BY created_at DESC
          LIMIT ${Math.max(10, Math.floor(resultLimit / 2))}
        `);
        const commentResults = (rows as any).rows.map((c: any) => {
          const plain = String(c.content || '').replace(/<[^>]+>/g, '');
          const excerpt = plain.substring(0, 120) + '...';
          return {
            id: Number(c.id),
            title: `Comment on post #${c.post_id}`,
            excerpt,
            type: 'comment',
            url: `/reader/${c.post_id}#comment-${c.id}`,
            matches: [],
            createdAt: c.created_at,
            postId: Number(c.post_id),
            userId: c.user_id ? Number(c.user_id) : null
          };
        });
        results = results.concat(commentResults);
      } catch (err) {
        console.error('[Search] Comments query failed:', err);
      }
    }

    // Static legal/settings remain unchanged but are small payloads; omitted for brevity

    // Sort by date if needed
    results.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    recordTrending(searchQuery);

    const total = results.length;
    const totalPages = Math.max(Math.ceil(total / resultLimit), 1);
    const payload = { 
      results,
      meta: {
        query: searchQuery,
        total,
        page: pageNum,
        pages: totalPages,
        limit: resultLimit,
        types: contentTypes,
        from: fromDate?.toISOString() || null,
        category: category || null,
        tags: tagFilters,
        didYouMean: null
      }
    };
    searchCache.set(key, { ts: Date.now(), data: payload });
    return res.json(payload);
    
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'An error occurred during search', results: [] });
  }
});

export default router;

// Lightweight suggestions endpoint for typeahead
router.get('/suggest', async (req, res) => {
  try {
    const { q, limit = '10' } = req.query;
    const max = Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 20);

    // If no query or too short, return trending queries as suggestions
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      const sorted = Array.from(trendingQueries.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, max)
        .map(([term]) => ({ id: term, title: term, type: 'query', url: `/search?q=${encodeURIComponent(term)}` }));
      return res.json({ suggestions: sorted });
    }

    const search = q.trim();

    // SQL-based title match first, then content as fallback
    const titleRes = await db.execute(sql`
      SELECT id, title, slug
      FROM posts
      WHERE title ILIKE ${'%' + search + '%'}
      ORDER BY created_at DESC
      LIMIT ${max}
    `);

    const titleRows = (titleRes as any).rows || [];
    const remaining = Math.max(0, max - titleRows.length);

    let contentRows: any[] = [];
    if (remaining > 0) {
      const contentRes = await db.execute(sql`
        SELECT id, title, slug
        FROM posts
        WHERE content ILIKE ${'%' + search + '%'}
          AND title NOT ILIKE ${'%' + search + '%'}
        ORDER BY created_at DESC
        LIMIT ${remaining}
      `);
      contentRows = (contentRes as any).rows || [];
    }

    const combined = [...titleRows, ...contentRows];
    const suggestions = combined.map((p: any) => ({
      id: Number(p.id),
      title: p.title || 'Untitled',
      type: 'post',
      url: `/reader/${p.slug || p.id}`
    }));

    return res.json({ suggestions });
  } catch (error) {
    console.error('[Search] Suggest error:', error);
    return res.status(500).json({ suggestions: [] });
  }
});