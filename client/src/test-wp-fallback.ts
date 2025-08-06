import { fetchWordPressPosts, getConvertedPostsFromLocalStorage } from './services/wordpress';

/**
 * Test the WordPress API fallback mechanism
 */
async function testFallback() {
  
  
  // Step 1: Fetch posts normally (should work and populate localStorage cache)
  
  try {
    const posts = await fetchWordPressPosts();
    console.log('Fetched posts:', posts.length);
    
    if (posts.length > 0) {
      console.log('First post:', posts[0]);
    }
  } catch (error) {
    
  }
  
  // Step 2: Check if posts are cached in localStorage
  try {
    const cachedPosts = getConvertedPostsFromLocalStorage();
    console.log('Cached posts:', cachedPosts.length);
  } catch (error) {
    
  }
  
  
}

// Export for use in the browser console
export { testFallback };