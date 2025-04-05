/**
 * Simple theme data structure test
 */

async function testThemeStructure() {
  try {
    // Fetch posts from the API
    const response = await fetch('http://localhost:3003/api/posts?limit=5');
    const data = await response.json();
    const posts = data.posts;
    
    console.log("Posts retrieved:", posts.length);
    
    // Check if posts have both camelCase and snake_case theme properties
    for (const post of posts) {
      console.log(`\nPost ID: ${post.id}, Title: ${post.title}`);
      console.log(`themeCategory: ${post.themeCategory || 'undefined'}`);
      console.log(`theme_category: ${post.theme_category || 'undefined'}`);
      console.log(`themeIcon: ${post.themeIcon || 'undefined'}`);
      console.log(`theme_icon: ${post.theme_icon || 'undefined'}`);
    }
    
    console.log("\nTest completed successfully");
  } catch (error) {
    console.error("Error in test:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

testThemeStructure();