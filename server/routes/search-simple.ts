import { Router } from 'express';
import { db } from '../db';
import { posts } from '@shared/schema';

const router = Router();

// Simplified search endpoint for debugging
router.get('/', async (req, res) => {
  
  
  try {
    const query = req.query.q as string;
    
    
    
    if (!query) {
      return res.json({ error: 'Query required', results: [] });
    }

    
    const allPosts = await db.select().from(posts);
    

    const results = allPosts
      .filter(post => {
        const searchTerm = query.toLowerCase();
        const title = (post.title || '').toLowerCase();
        const content = (post.content || '').toLowerCase();
        return title.includes(searchTerm) || content.includes(searchTerm);
      })
      .map(post => ({
        id: post.id,
        title: post.title,
        excerpt: (post.content || '').substring(0, 100) + '...',
        url: `/reader/${post.id}`
      }));

    
    return res.json({ results, query });

  } catch (error) {
    console.error('[SimpleSearch] Error Details:', {
      error: error,
      message: (error as Error).message,
      stack: (error as Error).stack,
      query: req.query
    });
    return res.status(500).json({ 
      error: 'Search failed', 
      message: (error as Error).message,
      stack: (error as Error).stack,
      results: [] 
    });
  }
});

export default router;