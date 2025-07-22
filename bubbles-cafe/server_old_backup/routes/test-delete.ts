/**
 * Test Delete Routes
 * 
 * These routes are intended for testing purposes only and should be disabled in production.
 */
import { Router, Request, Response } from 'express';
import { storage } from '../storage';

const router = Router();

// Test route to create and then delete a post - bypasses authentication
router.post('/create-delete-test', async (req: Request, res: Response) => {
  try {
    console.log('[Test] Creating a test post for deletion test');
    
    // Create a test post
    const testPost = await storage.createPost({
      title: 'Test Post for Deletion',
      content: 'This is a test post that will be deleted.',
      slug: 'test-delete-post-' + Date.now(),
      authorId: 1, // Admin user
      metadata: { isCommunityPost: true, isAdminPost: false },
      themeCategory: 'HORROR',
      isSecret: false,
      matureContent: false
    });
    
    console.log(`[Test] Created test post with ID: ${testPost.id}`);
    
    // Now delete the post
    try {
      const result = await storage.deletePost(testPost.id);
      console.log(`[Test] Successfully deleted post: ${result.id}`);
      
      return res.status(200).json({
        success: true,
        message: 'Post created and deleted successfully',
        post: testPost,
        deletedPost: result
      });
    } catch (deleteError) {
      console.error('[Test] Failed to delete post:', deleteError);
      
      return res.status(500).json({
        success: false,
        message: 'Post created but deletion failed',
        post: testPost,
        error: deleteError instanceof Error ? deleteError.message : String(deleteError)
      });
    }
  } catch (error) {
    console.error('[Test] Error in create-delete test:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to run create-delete test',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;