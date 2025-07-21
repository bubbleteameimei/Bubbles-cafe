import { Request, Response, Express, NextFunction } from 'express';
import { IStorage } from '../storage';
import { feedbackLogger } from '../utils/debug-logger';
import { UserFeedback } from '../../shared/schema';

// Middleware for checking if user is authenticated (kept for other routes that may need it)
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Helper to check authentication without blocking - using passport's isAuthenticated
const checkAuthentication = (req: Request) => {
  return {
    isAuthenticated: req.isAuthenticated(),
    userId: req.isAuthenticated() ? (req.user as any).id : null
  };
};

export function registerUserFeedbackRoutes(app: Express, storage: IStorage) {
  /**
   * GET /api/user/feedback
   * Retrieves a user's feedback submissions if authenticated, otherwise returns empty array
   */
  app.get('/api/user/feedback', async (req: Request, res: Response) => {
    try {
      const { isAuthenticated, userId } = checkAuthentication(req);
      
      // Check auth status but don't block - instead return empty data for unauthenticated users
      if (!isAuthenticated) {
        feedbackLogger.info('User not authenticated, returning empty feedback array');
        return res.status(200).json({
          feedback: [],
          isAuthenticated: false
        });
      }

      feedbackLogger.info(`Retrieving feedback for user ${userId}`);
      
      // Use getAllFeedback and filter by userId as a temporary solution
      // until getUserFeedback is implemented
      const allFeedback = await storage.getAllFeedback();
      const userFeedback = allFeedback.filter(feedback => 
        feedback.userId === userId
      );
      
      return res.status(200).json({
        feedback: userFeedback,
        isAuthenticated: true
      });
    } catch (error: any) {
      feedbackLogger.error(`Error retrieving user feedback: ${error.message}`, error);
      return res.status(500).json({
        error: 'Failed to retrieve user feedback',
        message: error.message
      });
    }
  });
  
  /**
   * GET /api/user/feedback/stats
   * Retrieves statistics about a user's feedback submissions if authenticated
   * Otherwise returns empty stats but doesn't block access
   */
  app.get('/api/user/feedback/stats', async (req: Request, res: Response) => {
    try {
      const { isAuthenticated, userId } = checkAuthentication(req);
      
      // If not authenticated, return empty stats rather than an error
      if (!isAuthenticated) {
        feedbackLogger.info('User not authenticated, returning empty feedback stats');
        return res.status(200).json({
          stats: {
            total: 0,
            pending: 0,
            reviewed: 0,
            resolved: 0,
            rejected: 0,
            responseRate: 0
          },
          isAuthenticated: false
        });
      }

      feedbackLogger.info(`Retrieving feedback stats for user ${userId}`);
      
      // Use getAllFeedback and filter by userId as a temporary solution
      const allFeedback = await storage.getAllFeedback();
      const userFeedback = allFeedback.filter(feedback => 
        feedback.userId === userId
      );
      
      const stats = {
        total: userFeedback.length,
        pending: userFeedback.filter((item: UserFeedback) => item.status === 'pending').length,
        reviewed: userFeedback.filter((item: UserFeedback) => item.status === 'reviewed').length,
        resolved: userFeedback.filter((item: UserFeedback) => item.status === 'resolved').length,
        rejected: userFeedback.filter((item: UserFeedback) => item.status === 'rejected').length,
        responseRate: userFeedback.length > 0 
          ? (userFeedback.filter((item: UserFeedback) => 
              item.metadata && (item.metadata as any).adminResponse
            ).length / userFeedback.length) * 100 
          : 0
      };
      
      return res.status(200).json({
        stats,
        isAuthenticated: true
      });
    } catch (error: any) {
      feedbackLogger.error(`Error retrieving user feedback stats: ${error.message}`, error);
      return res.status(500).json({
        error: 'Failed to retrieve user feedback statistics',
        message: error.message
      });
    }
  });
  
  /**
   * GET /api/user/feedback/:id
   * Retrieves a specific feedback submission by ID for the authenticated user
   * If not authenticated, returns limited feedback info for public sharing
   */
  app.get('/api/user/feedback/:id', async (req: Request, res: Response) => {
    try {
      const { isAuthenticated, userId } = checkAuthentication(req);
      const feedbackId = parseInt(req.params.id);
      
      if (isNaN(feedbackId)) {
        return res.status(400).json({ error: 'Invalid feedback ID' });
      }

      // Get the feedback item
      const feedback = await storage.getFeedback(feedbackId);
      
      // If feedback doesn't exist, return 404
      if (!feedback) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      
      // Log auth info for debugging
      feedbackLogger.info(`Auth check - isAuthenticated: ${isAuthenticated}, userId: ${userId}, feedbackUserId: ${feedback.userId}`);
      
      // If authenticated and feedback belongs to user, return full details
      if (isAuthenticated && feedback.userId === userId) {
        feedbackLogger.info(`Retrieving specific feedback ${feedbackId} for authenticated user ${userId}`);
        
        return res.status(200).json({
          feedback,
          isAuthenticated: true,
          isOwner: true
        });
      }
      
      // For unauthenticated users or users viewing others' feedback,
      // return limited public information
      feedbackLogger.info(`Retrieving public feedback ${feedbackId} view`);
      
      // Create a limited version of the feedback for public viewing
      const publicFeedback = {
        id: feedback.id,
        type: feedback.type,
        content: feedback.content,
        status: feedback.status,
        category: feedback.category,
        createdAt: feedback.createdAt,
        // Exclude sensitive info like userAgent, screen resolution, etc.
      };
      
      return res.status(200).json({
        feedback: publicFeedback,
        isAuthenticated,
        isOwner: false
      });
    } catch (error: any) {
      feedbackLogger.error(`Error retrieving specific user feedback: ${error.message}`, error);
      return res.status(500).json({
        error: 'Failed to retrieve specific feedback',
        message: error.message
      });
    }
  });
}