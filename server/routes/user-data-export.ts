/**
 * User data export routes
 * Handles requests for user data export functionalities
 */
import { Request, Response, NextFunction, Express } from 'express';
import { IStorage } from '../storage';

/**
 * Authorization middleware to ensure user can only access their own data
 */
const isAuthorizedForUserData = (req: Request, res: Response, next: NextFunction) => {
  // If not authenticated
  if (!req.session.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // If requested userId doesn't match authenticated user (unless admin)
  const requestedUserId = parseInt(req.params.userId || req.query.userId as string || '0');
  if (requestedUserId && requestedUserId !== req.session.user.id && !req.session.user.isAdmin) {
    return res.status(403).json({ message: 'You can only access your own data' });
  }
  
  next();
};

/**
 * Register user data export routes
 */
export function registerUserDataExportRoutes(app: Express, storage: IStorage) {
  /**
   * GET /api/user/profile-data
   * Get user profile data for export
   */
  app.get('/api/user/profile-data', isAuthorizedForUserData, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user!.id;
      
      // Get user details
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get privacy settings
      let privacySettings = await storage.getUserPrivacySettings(userId);
      
      // If no privacy settings exist, create default ones
      if (!privacySettings) {
        const defaultSettings = {
          userId,
          profileVisible: true,
          shareReadingHistory: false,
          anonymousCommenting: false,
          twoFactorAuthEnabled: false,
          loginNotifications: true,
        };
        
        privacySettings = await storage.createUserPrivacySettings(
          userId, 
          defaultSettings
        );
      }
      
      // Extract profile data from metadata
      const metadata = user.metadata || {};
      
      // Format user data for export (excluding sensitive fields)
      const profileData = {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: metadata.displayName || user.username,
        bio: metadata.bio || '',
        createdAt: user.createdAt,
        lastLogin: metadata.lastLogin || user.createdAt,
        privacySettings
      };
      
      res.json(profileData);
    } catch (error) {
      console.error('Error fetching user profile data:', error);
      res.status(500).json({ message: 'Failed to fetch profile data' });
    }
  });

  /**
   * GET /api/user/export-info
   * Get user export information with counts of available data
   */
  app.get('/api/user/export-info', isAuthorizedForUserData, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user!.id;
      
      // Get user posts
      const userPosts = await storage.getUserPosts(userId);
      
      // Get user comments
      const userComments = await storage.getUserComments(userId);
      
      // Get user bookmarks
      const userBookmarks = await storage.getUserBookmarks(userId);
      
      // Get reading history
      const readingHistory = await storage.getUserReadingHistory(userId);
      
      // Return counts of available data
      res.json({
        availableData: {
          profile: true,
          posts: userPosts.length,
          comments: userComments.length,
          bookmarks: userBookmarks.length,
          readingHistory: readingHistory.length
        }
      });
    } catch (error) {
      console.error('Error fetching user export info:', error);
      res.status(500).json({ message: 'Failed to fetch export information' });
    }
  });
  
  /**
   * GET /api/user/reading-history
   * Get user reading history for export
   */
  app.get('/api/user/reading-history', isAuthorizedForUserData, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user!.id;
      const readingHistory = await storage.getUserReadingHistory(userId);
      
      // Process for export - include post titles
      const processedHistory = await Promise.all(
        readingHistory.map(async (item) => {
          // Skip posts with null or undefined IDs
          const postId = item.postId;
          let postTitle = 'Unknown Post';
          
          if (postId !== null && postId !== undefined) {
            const post = await storage.getPostById(postId);
            if (post) {
              postTitle = post.title;
            }
          }
          
          return {
            id: item.id,
            userId: item.userId,
            postId: item.postId,
            progress: item.progress,
            postTitle: postTitle,
            lastReadAt: item.lastReadAt
          };
        })
      );
      
      res.json(processedHistory);
    } catch (error) {
      console.error('Error fetching reading history:', error);
      res.status(500).json({ message: 'Failed to fetch reading history' });
    }
  });
  
  /**
   * GET /api/user/comments
   * Get user comments for export
   */
  app.get('/api/user/comments', isAuthorizedForUserData, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user!.id;
      const userComments = await storage.getUserComments(userId);
      
      // Process for export - include post titles
      const processedComments = await Promise.all(
        userComments.map(async (comment) => {
          // Skip posts with null or undefined IDs
          const postId = comment.postId;
          let postTitle = 'Unknown Post';
          
          if (postId !== null && postId !== undefined) {
            const post = await storage.getPostById(postId);
            if (post) {
              postTitle = post.title;
            }
          }
          
          return {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            postId: comment.postId,
            postTitle,
            edited: comment.edited,
            metadata: comment.metadata
          };
        })
      );
      
      res.json(processedComments);
    } catch (error) {
      console.error('Error fetching user comments:', error);
      res.status(500).json({ message: 'Failed to fetch user comments' });
    }
  });
  
  /**
   * GET /api/user/activity
   * Get user activity timeline for export
   */
  app.get('/api/user/activity', isAuthorizedForUserData, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user!.id;
      
      // Get user activity logs
      const activityLogs = await storage.getUserActivity(userId);
      
      res.json(activityLogs);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      res.status(500).json({ message: 'Failed to fetch user activity' });
    }
  });

  /**
   * GET /api/user/bookmarks
   * Get user bookmarks for export
   */
  app.get('/api/user/bookmarks', isAuthorizedForUserData, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user!.id;
      
      // Get user bookmarks with associated posts
      const bookmarks = await storage.getUserBookmarks(userId);
      
      // Format for export
      const processedBookmarks = bookmarks.map(bookmark => {
        const { post, ...bookmarkData } = bookmark;
        
        return {
          id: bookmark.id,
          postId: bookmark.postId,
          postTitle: post?.title || 'Unknown Post',
          createdAt: bookmark.createdAt,
          notes: bookmark.notes || '',
          tags: bookmark.tags || [],
          category: 'Default' // Use category instead of folder which doesn't exist in schema
        };
      });
      
      res.json(processedBookmarks);
    } catch (error) {
      console.error('Error fetching user bookmarks:', error);
      res.status(500).json({ message: 'Failed to fetch bookmarks' });
    }
  });
}