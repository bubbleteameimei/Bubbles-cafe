/**
 * Delete WordPress Post 272 Script
 * 
 * This script will delete the placeholder WordPress post with ID 272.
 */

// Use built-in Fetch API
const API_URL = 'http://localhost:3001/api/admin/cleanup/wordpress-post-272';

async function deleteWordPressPost() {
  try {
    console.log('Attempting to delete WordPress placeholder post with ID 272...');
    
    // Note: we're using port 3001 because that's what the server is running on
    const response = await fetch(API_URL, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to delete post: ${errorData.message || response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('Successfully deleted WordPress placeholder post:');
    console.log(`- Title: ${result.title}`);
    console.log(`- Post ID: ${result.postId}`);
    console.log(`- Deleted at: ${result.deletedAt}`);
    console.log('\nThe WordPress placeholder post has been removed from the system.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

deleteWordPressPost();