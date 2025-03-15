import { Request, Response, Router } from 'express';
import { IStorage } from '../storage';
import { feedbackLogger } from '../utils/debug-logger';
import { UserFeedback } from '../../shared/schema';

// Middleware for checking if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

export function registerUserFeedbackRoutes(router: Router, storage: IStorage) {
  /**
   * GET /api/user/feedback
   * Retrieves a user's feedback submissions
   */
  router.get('/api/user/feedback', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      feedbackLogger.info(`Retrieving feedback for user ${userId}`);
      
      // Use getAllFeedback and filter by userId as a temporary solution
      // until getUserFeedback is implemented
      const allFeedback = await storage.getAllFeedback();
      const userFeedback = allFeedback.filter(feedback => 
        feedback.userId === userId
      );
      
      return res.status(200).json({
        feedback: userFeedback
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
   * Retrieves statistics about a user's feedback submissions
   */
  router.get('/api/user/feedback/stats', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
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
        stats
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
   */
  router.get('/api/user/feedback/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const feedbackId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      if (isNaN(feedbackId)) {
        return res.status(400).json({ error: 'Invalid feedback ID' });
      }

      feedbackLogger.info(`Retrieving specific feedback ${feedbackId} for user ${userId}`);
      
      // Get the feedback item
      const feedback = await storage.getFeedback(feedbackId);
      
      // Check if feedback exists and belongs to the user
      if (!feedback || feedback.userId !== userId) {
        return res.status(404).json({ error: 'Feedback not found or does not belong to user' });
      }
      
      return res.status(200).json({
        feedback
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