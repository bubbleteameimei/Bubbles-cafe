import { fetchWordPressPosts, convertWordPressPost, getConvertedPostBySlug } from './services/wordpress';

/**
 * Test the WordPress API fallback mechanism
 */
async function testFallback() {
  
  
  // Step 1: Fetch posts normally (should work and populate localStorage cache)
  
  try {
    const posts = await fetchWordPressPosts(1);
    
    
    // Convert a post to test the conversion cache
    if (posts.length > 0) {
      const converted = convertWordPressPost(posts[0]);
      
    }
  } catch (error) {
    
  }
  
  // Step 2: Simulate API failure by modifying API URL temporarily
  
  
  // Here we can't directly modify the API URL constant, but in a real scenario,
  // this would be where the API fails and fallback kicks in
  
  // Instead, we'll check if we can retrieve the cached data
  try {
    // Check localStorage directly
    const postsCache = localStorage.getItem('cached_wordpress_posts');
    const convertedCache = localStorage.getItem('converted_wordpress_posts');
    
    
    
    
    if (postsCache) {
      const cachedPosts = JSON.parse(postsCache);
      
      
      if (cachedPosts.length > 0) {
        const firstPost = cachedPosts[0];
        
        
        // Try to get a converted post by slug
        if (firstPost.slug) {
          const convertedPost = getConvertedPostBySlug(firstPost.slug);
          
          if (convertedPost) {
            
          }
        }
      }
    }
  } catch (error) {
    
  }
  
  
}

// Export for use in the browser console
export { testFallback };