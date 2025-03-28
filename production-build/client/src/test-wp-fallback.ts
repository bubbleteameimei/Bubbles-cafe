import { fetchWordPressPosts, convertWordPressPost, getConvertedPostBySlug } from './services/wordpress';

/**
 * Test the WordPress API fallback mechanism
 */
async function testFallback() {
  console.log('Starting WordPress API fallback test...');
  
  // Step 1: Fetch posts normally (should work and populate localStorage cache)
  console.log('\nStep 1: Fetching posts normally');
  try {
    const posts = await fetchWordPressPosts(1);
    console.log(`Successfully fetched ${posts.length} posts, which should be cached now`);
    
    // Convert a post to test the conversion cache
    if (posts.length > 0) {
      const converted = convertWordPressPost(posts[0]);
      console.log(`Converted post with ID ${converted.id} and title: "${converted.title}"`);
    }
  } catch (error) {
    console.error('Error in step 1:', error);
  }
  
  // Step 2: Simulate API failure by modifying API URL temporarily
  console.log('\nStep 2: Simulating API failure');
  
  // Here we can't directly modify the API URL constant, but in a real scenario,
  // this would be where the API fails and fallback kicks in
  
  // Instead, we'll check if we can retrieve the cached data
  try {
    // Check localStorage directly
    const postsCache = localStorage.getItem('cached_wordpress_posts');
    const convertedCache = localStorage.getItem('converted_wordpress_posts');
    
    console.log('Posts cache available:', !!postsCache);
    console.log('Converted posts cache available:', !!convertedCache);
    
    if (postsCache) {
      const cachedPosts = JSON.parse(postsCache);
      console.log(`Cache contains ${cachedPosts.length} posts`);
      
      if (cachedPosts.length > 0) {
        const firstPost = cachedPosts[0];
        console.log(`First cached post: ${firstPost.id} - ${firstPost.title?.rendered || 'No title'}`);
        
        // Try to get a converted post by slug
        if (firstPost.slug) {
          const convertedPost = getConvertedPostBySlug(firstPost.slug);
          console.log('Retrieved converted post by slug:', convertedPost ? 'Yes' : 'No');
          if (convertedPost) {
            console.log(`Converted post title: "${convertedPost.title}"`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in step 2:', error);
  }
  
  console.log('\nFallback test complete.');
}

// Export for use in the browser console
export { testFallback };