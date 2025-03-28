import { Router } from 'express';
import { db } from '../db';
import { posts, type Post } from '@shared/schema';
import { eq, like, or, ilike } from 'drizzle-orm';

const router = Router();

// Search API endpoint
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Convert query to lowercase for case-insensitive search
    const searchQuery = q.toLowerCase();
    const searchTerms = searchQuery.split(' ').filter(term => term.length > 2);

    if (searchTerms.length === 0) {
      return res.status(400).json({ 
        error: 'Search query must contain at least one term with 3 or more characters',
        results: []
      });
    }

    console.log(`[Search] Searching for: "${searchQuery}" with terms:`, searchTerms);

    // Get all posts from database
    const allPosts = await db.select().from(posts);

    // Filter and process posts
    const results = allPosts
      .filter((post: Post) => {
        const title = post.title?.toLowerCase() || '';
        const content = post.content?.toLowerCase() || '';

        // Check if ANY search term appears in title or content
        return searchTerms.some(term => {
          return title.includes(term) || content.includes(term);
        });
      })
      .map((post: Post) => {
        const title = post.title || '';
        const content = post.content || '';
        
        // Strip HTML tags to get plain text content
        const plainContent = content.replace(/<[^>]+>/g, '');
        
        // Find matches with context
        const matches: { text: string; context: string }[] = [];

        searchTerms.forEach(term => {
          // Extract sentences containing the search term (rough heuristic)
          const regex = new RegExp(`[^.!?]*(?<=[.!?\\s]|^)${term}(?=[\\s.!?]|$)[^.!?]*[.!?]`, 'gi');
          const contextMatches = plainContent.match(regex);
          
          if (contextMatches && contextMatches.length > 0) {
            // Take the first 3 context matches per term
            contextMatches.slice(0, 3).forEach((context: string) => {
              matches.push({
                text: term,
                context: context.trim()
              });
            });
          } else {
            // If no clear sentence found, get some surrounding context
            const index = plainContent.toLowerCase().indexOf(term);
            if (index !== -1) {
              const start = Math.max(0, index - 60);
              const end = Math.min(plainContent.length, index + term.length + 60);
              matches.push({
                text: term,
                context: plainContent.substring(start, end).trim()
              });
            }
          }
        });
        
        // Get a summary excerpt
        let excerpt = '';
        if (matches.length > 0) {
          excerpt = matches[0].context;
        } else {
          excerpt = plainContent.substring(0, 150) + '...';
        }
        
        return {
          id: post.id,
          title: post.title,
          excerpt,
          type: 'post',
          url: `/reader/${post.id}`,
          matches
        };
      });

    console.log(`[Search] Found ${results.length} results for "${searchQuery}"`);
    return res.json({ results });
    
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'An error occurred during search', results: [] });
  }
});

export default router;