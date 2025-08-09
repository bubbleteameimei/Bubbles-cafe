import { Router } from 'express';
import { db } from '../db';
import { posts } from '../../shared/schema';

const router = Router();

// Simplified search endpoint for debugging
router.get('/', async (req, res) => {
  try {
    const query = (req.query.q as string) || '';
    const page = Math.max(parseInt((req.query.page as string) || '1', 10) || 1, 1);
    const limitRaw = parseInt((req.query.limit as string) || '10', 10) || 10;
    const limit = Math.max(Math.min(limitRaw, 100), 1); // clamp 1..100
    const offset = (page - 1) * limit;

    if (!query.trim()) {
      return res.json({ error: 'Query required', results: [], page, limit, total: 0 });
    }

    // Fetch a capped set to reduce memory; in absence of DB text search we cap at 2000
    const allPosts = await db.select().from(posts).limit(2000);

    const searchTerm = query.toLowerCase();
    const filtered = allPosts.filter(post => {
      const title = (post.title || '').toLowerCase();
      const content = (post.content || '').toLowerCase();
      return title.includes(searchTerm) || content.includes(searchTerm);
    });

    const total = filtered.length;
    const paged = filtered.slice(offset, offset + limit).map(post => ({
      id: post.id,
      title: post.title,
      excerpt: (post.content || '').substring(0, 100) + '...',
      url: `/reader/${post.id}`
    }));

    return res.json({ results: paged, query, page, limit, total });
  } catch (error) {
    console.error('[SimpleSearch] Error Details:', {
      error,
      message: (error as Error).message,
      stack: (error as Error).stack,
      query: req.query
    });
    return res.status(500).json({ 
      error: 'Search failed'
    });
  }
});

export default router;