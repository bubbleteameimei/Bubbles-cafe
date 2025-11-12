import { Router } from 'express';
import { db } from '../db';
import { 
  posts, 
  comments, 
  users,
  reportedContent
} from '@shared/schema';
import { sql } from 'drizzle-orm';

// Define types for search use
type Post = typeof posts.$inferSelect;
type Comment = typeof comments.$inferSelect;
type User = typeof users.$inferSelect;
type ReportedContent = typeof reportedContent.$inferSelect;

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

// Search content types interface
interface SearchOptions {
  includePages: boolean;
  includeComments: boolean;
  includeUsers: boolean;
  includeReported: boolean;
  includeLegal: boolean;
  includeSettings: boolean;
  contentTypes: string[];
  limit: number;
  isAdmin: boolean;
}

// Search API endpoint with optimized SQL-based search for posts/comments
router.get('/', async (req, res) => {
  try {
    // Default to searching all content
    const { 
      q, 
      types = 'posts,pages,comments,legal,settings', 
      limit = '20',
      page = '1',
      from, // can be number of days or ISO date
      category,
      tags // comma-separated string or repeated array: tag1,tag2 or ["tag1","tag2"]
    } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchQuery = q.trim();
    if (searchQuery.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    // Parse content type filters
    const contentTypes = typeof types === 'string' ? (types as string).split(',') : ['posts'];
    
    // Parse and validate numeric limit
    const resultLimit = Math.min(
      Math.max(parseInt(limit as string, 10) || 20, 1), 
      50
    ); // Between 1 and 50
    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
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
      tagFilters = (tags as string).split(',');
    }
    tagFilters = tagFilters
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const cacheParams = { q: searchQuery, types: contentTypes, limit: resultLimit, page: pageNum, from: fromDate?.toISOString() || null, category: category || null, tags: tagFilters };
    const key = makeCacheKey(cacheParams);
    const cached = searchCache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return res.json(cached.data);
    }
    
    // No admin mode in search
    const isAdmin = false;
    
    // Configure search options
    const searchOptions: SearchOptions = {
      includePages: contentTypes.includes('pages'),
      includeComments: contentTypes.includes('comments'),
      includeUsers: contentTypes.includes('users') && isAdmin, // Only admins can search users
      includeReported: contentTypes.includes('reported') && isAdmin, // Only admins can search reported content
      includeLegal: contentTypes.includes('legal'),
      includeSettings: contentTypes.includes('settings'),
      contentTypes,
      limit: resultLimit,
      isAdmin
    };

    console.log(`[Search] SQL search for: "${searchQuery}"`, { page: pageNum, limit: resultLimit, category, tags: tagFilters });

    // Initialize results array 
    let results: any[] = [];

    // 1. Search posts using Full-Text Search (title + content), constrained and paginated in SQL
    if (contentTypes.includes('posts')) {
      try {
        const rows = await db.execute(sql`
          SELECT 
            p.id, p.title, p.slug, p.excerpt, p.created_at as "createdAt", p.theme_category as "themeCategory",
            ts_rank(
              to_tsvector('english', coalesce(p.title,'') || ' ' || coalesce(p.content,'')),
              websearch_to_tsquery('english', ${searchQuery})
            ) as "rank"
          FROM posts p
          WHERE to_tsvector('english', coalesce(p.title,'') || ' ' || coalesce(p.content,'')) @@ websearch_to_tsquery('english', ${searchQuery})
            AND (${category ? sql`LOWER(p.theme_category) = LOWER(${String(category)})` : sql`TRUE`})
            AND (${fromDate ? sql`p.created_at >= ${fromDate}` : sql`TRUE`})
            AND (p.is_secret = FALSE OR p.is_secret IS NULL)
            AND (COALESCE((p.metadata->>'isHidden')::boolean, FALSE) = FALSE)
          ORDER BY "rank" DESC, p.created_at DESC
          LIMIT ${resultLimit} OFFSET ${offset}
        `);

        const postResults = (rows as any).rows.map((r: any) => {
          const isCommunity = false; // If needed, derive from metadata separately
          const excerpt = r.excerpt || '';
          return {
            id: r.id,
            title: r.title,
            excerpt: excerpt || '',
            type: 'post',
            url: `${isCommunity ? '/community-story' : '/reader'}/${r.slug || r.id}`,
            matches: [], // Omit heavy match contexts for performance
            createdAt: r.createdAt
          };
        });

        // Optional tag filtering post-query to keep SQL simple
        let filteredPosts = postResults;
        if (tagFilters.length > 0) {
          filteredPosts = filteredPosts.filter((item: any) => {
            const title = String(item.title || '').toLowerCase();
            const ex = String(item.excerpt || '').toLowerCase();
            return tagFilters.some((t) => title.includes(t) || ex.includes(t));
          });
        }

        results = [...results, ...filteredPosts];
      } catch (err) {
        console.error('[Search] FTS posts query failed, falling back to basic search:', err);
        // Fallback: minimal in-memory search using title only
        const allPosts = await db.select({ id: posts.id, title: posts.title, slug: posts.slug, excerpt: posts.excerpt, createdAt: posts.createdAt }).from(posts);
        const lcQuery = searchQuery.toLowerCase();
        const matched = allPosts.filter((p: any) => (p.title || '').toLowerCase().includes(lcQuery));
        const paged = matched.slice(offset, offset + resultLimit);
        results = [
          ...results,
          ...paged.map((p: any) => ({
            id: p.id,
            title: p.title,
            excerpt: p.excerpt || '',
            type: 'post',
            url: `/reader/${p.slug || p.id}`,
            matches: [],
            createdAt: p.createdAt
          }))
        ];
      }
    }

    // 2. Search pages if requested (treat secret posts as pages)
    if (searchOptions.includePages) {
      try {
        const rows = await db.execute(sql`
          SELECT id, title, slug, excerpt, created_at as "createdAt"
          FROM posts
          WHERE is_secret = TRUE
            AND (${fromDate ? sql`created_at >= ${fromDate}` : sql`TRUE`})
            AND (
              LOWER(title) LIKE '%' || LOWER(${searchQuery}) || '%' OR
              LOWER(excerpt) LIKE '%' || LOWER(${searchQuery}) || '%'
            )
          ORDER BY created_at DESC
          LIMIT ${resultLimit} OFFSET ${offset}
        `);

        const pageResults = (rows as any).rows.map((p: any) => ({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt || '',
          type: 'page',
          url: `/page/${p.slug}`,
          matches: [],
          createdAt: p.createdAt
        }));

        results = [...results, ...pageResults];
      } catch (err) {
        console.error('[Search] SQL error searching pages:', err);
      }
    }

    // 3. Search comments if requested (SQL with LIKE; FTS could be added later)
    if (searchOptions.includeComments) {
      try {
        const rows = await db.execute(sql`
          SELECT id, content, post_id as "postId", user_id as "userId", created_at as "createdAt"
          FROM comments
          WHERE (${fromDate ? sql`created_at >= ${fromDate}` : sql`TRUE`})
            AND LOWER(content) LIKE '%' || LOWER(${searchQuery}) || '%'
          ORDER BY created_at DESC
          LIMIT ${resultLimit} OFFSET ${offset}
        `);

        const commentResults = (rows as any).rows.map((c: any) => ({
          id: c.id,
          title: `Comment on post #${c.postId}`,
          excerpt: String(c.content || '').replace(/<[^>]+>/g, '').slice(0, 150) + '...',
          type: 'comment',
          url: `/reader/${c.postId}#comment-${c.id}`,
          matches: [],
          createdAt: c.createdAt,
          postId: c.postId,
          userId: c.userId
        }));

        results = [...results, ...commentResults];
      } catch (err) {
        console.error('[Search] SQL error searching comments:', err);
      }
    }
    
    // 4. Search users if requested (admin only)
    if (searchOptions.includeUsers && searchOptions.isAdmin) {
      try {
        const rows = await db.execute(sql`
          SELECT id, username, email, created_at as "createdAt"
          FROM users
          WHERE LOWER(username) LIKE '%' || LOWER(${searchQuery}) || '%'
             OR LOWER(email) LIKE '%' || LOWER(${searchQuery}) || '%'
          ORDER BY created_at DESC
          LIMIT ${resultLimit} OFFSET ${offset}
        `);

        const userResults = (rows as any).rows.map((u: any) => ({
          id: u.id,
          title: u.username,
          excerpt: `User ID: ${u.id}, Joined: ${new Date(u.createdAt || Date.now()).toLocaleDateString()}`,
          type: 'user',
          url: `/admin/users/${u.id}`,
          matches: [],
          createdAt: u.createdAt,
          adminOnly: true
        }));

        results = [...results, ...userResults];
      } catch (err) {
        console.error('[Search] SQL error searching users:', err);
      }
    }
    
    // 5. Search legal pages if requested (static content)
    if (searchOptions.includeLegal) {
      try {
        const legalPages = [
          {
            id: 'privacy-policy',
            title: 'Privacy Policy',
            content: `Our Privacy Policy outlines how we collect, use, and protect your personal information. 
                     We respect your privacy and are committed to maintaining the confidentiality of your data. 
                     This policy explains your rights regarding your information and how you can exercise those rights.`,
            url: '/legal/privacy'
          },
          {
            id: 'terms-of-service',
            title: 'Terms of Service',
            content: `These Terms of Service govern your use of our platform and services. 
                     By accessing or using our platform, you agree to be bound by these terms. 
                     If you disagree with any part of the terms, you may not access our services.`,
            url: '/legal/terms'
          },
          {
            id: 'cookie-policy',
            title: 'Cookie Policy',
            content: `Our Cookie Policy explains how we use cookies and similar technologies on our website. 
                     Cookies help us improve your browsing experience, analyze site traffic, and personalize content. 
                     You can manage your cookie preferences through your browser settings.`,
            url: '/legal/cookies'
          },
          {
            id: 'copyright',
            title: 'Copyright Information',
            content: `All content on this platform, including stories, images, and design elements, is subject to copyright protection. 
                     Unauthorized reproduction or distribution is prohibited. 
                     For inquiries about using our content, please contact our copyright department.`,
            url: '/legal/copyright'
          }
        ];
        
        const lcQuery = searchQuery.toLowerCase();
        const legalResults = legalPages
          .filter(page => page.title.toLowerCase().includes(lcQuery) || page.content.toLowerCase().includes(lcQuery))
          .map(page => ({
            id: page.id,
            title: page.title,
            excerpt: page.content.substring(0, 150) + '...',
            type: 'legal',
            url: page.url,
            matches: [],
            createdAt: new Date().toISOString()
          }));
          
        results = [...results, ...legalResults];
      } catch (err) {
        console.error('[Search] Error searching legal pages:', err);
      }
    }
    
    // 6. Search settings pages if requested (static content)
    if (searchOptions.includeSettings) {
      try {
        const settingsPages = [
          {
            id: 'account-settings',
            title: 'Account Settings',
            content: `Manage your account preferences, update your profile information, and control your privacy settings. 
                     You can change your username, email, and password from this page. 
                     Profile visibility and notification preferences can also be adjusted here.`,
            url: '/settings/account'
          },
          {
            id: 'notification-settings',
            title: 'Notification Settings',
            content: `Control which notifications you receive and how they are delivered. 
                     You can choose to be notified about new stories, comments on your posts, and system updates. 
                     Email notification frequency can be adjusted to daily, weekly, or disabled entirely.`,
            url: '/settings/notifications'
          },
          {
            id: 'display-settings',
            title: 'Display Settings',
            content: `Customize your reading experience with display preferences. 
                     Adjust font size, line spacing, and color themes for comfortable reading. 
                     Dark mode and contrast settings are available for reduced eye strain during nighttime reading.`,
            url: '/settings/display'
          },
          {
            id: 'security-settings',
            title: 'Security Settings',
            content: `Enhance your account security with additional protection measures. 
                     Enable two-factor authentication for an extra layer of security. 
                     Review active sessions and sign out from other devices if needed.`,
            url: '/settings/security'
          }
        ];
        
        const lcQuery = searchQuery.toLowerCase();
        const settingsResults = settingsPages
          .filter(page => page.title.toLowerCase().includes(lcQuery) || page.content.toLowerCase().includes(lcQuery))
          .map(page => ({
            id: page.id,
            title: page.title,
            excerpt: page.content.substring(0, 150) + '...',
            type: 'settings',
            url: page.url,
            matches: [],
            createdAt: new Date().toISOString()
          }));
          
        results = [...results, ...settingsResults];
      } catch (err) {
        console.error('[Search] Error searching settings pages:', err);
      }
    }
    
    // Sort results by date as primary order (SQL already ranks posts)
    results.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // We already paginated in SQL for posts/comments/users/pages,
    // but for static sections we may have added more; cap to limit overall.
    results = results.slice(0, resultLimit);

    recordTrending(searchQuery);

    console.log(`[Search] Returned ${results.length} results for "${searchQuery}" (page ${pageNum})`);

    let didYouMean: string | undefined;
    if (results.length === 0 && trendingQueries.size > 0) {
      let best: { q: string; d: number } | null = null;
      for (const [qstr] of trendingQueries) {
        const d = levenshtein(searchQuery.toLowerCase(), qstr);
        if (d <= 2 && (!best || d < best.d)) best = { q: qstr, d };
      }
      if (best) didYouMean = best.q;
    }

    const payload = { 
      results,
      meta: {
        query: searchQuery,
        total: results.length,
        page: pageNum,
        pages: 1,
        limit: resultLimit,
        types: contentTypes,
        from: fromDate?.toISOString() || null,
        category: category || null,
        tags: tagFilters,
        didYouMean: didYouMean || null
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

// Lightweight suggestions endpoint for typeahead (kept same behavior)
router.get('/suggest', async (req, res) => {
  try {
    const { q, limit = '10' } = req.query;
    const max = Math.min(Math.max(parseInt(limit as string, 10) || 10, 1), 20);

    // If no query or too short, return trending queries as suggestions
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      const sorted = Array.from(trendingQueries.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, max)
        .map(([term]) => ({ id: term, title: term, type: 'query', url: `/search?q=${encodeURIComponent(term)}` }));
      return res.json({ suggestions: sorted });
    }

    const search = q.trim().toLowerCase();

    // Fetch post titles only to avoid heavy payloads
    const rows = await db.execute(sql`
      SELECT id, title, slug
      FROM posts
      WHERE LOWER(title) LIKE '%' || LOWER(${search}) || '%'
      ORDER BY created_at DESC
      LIMIT ${max}
    `);

    const suggestions = (rows as any).rows.map((p: any) => ({
      id: p.id,
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