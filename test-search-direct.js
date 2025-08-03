// Direct test of search functionality
import { db } from './server/db.js';
import { posts } from './shared/schema.js';

async function testSearch() {
  try {
    console.log('Testing database connection...');
    const allPosts = await db.select().from(posts);
    console.log('Found posts:', allPosts.length);
    
    if (allPosts.length > 0) {
      console.log('First post:', allPosts[0]);
      
      // Test search logic
      const query = 'blood';
      const results = allPosts.filter(post => {
        const title = (post.title || '').toLowerCase();
        const content = (post.content || '').toLowerCase();
        return title.includes(query) || content.includes(query);
      });
      
      console.log('Search results for "blood":', results.length);
      if (results.length > 0) {
        console.log('First result:', results[0].title);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testSearch();