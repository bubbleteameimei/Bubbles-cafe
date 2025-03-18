import { Request, Response, Express, NextFunction } from 'express';
import { IStorage } from '../storage';
import { InsertUserPrivacySettings } from '../../shared/schema';

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // Log authentication debugging info
  console.log('[Privacy Settings] Auth check - Session:', !!req.session, 'User:', !!req.session?.user);
  
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

export function registerPrivacySettingsRoutes(app: Express, storage: IStorage) {
  /**
   * GET /api/user/privacy-settings
   * Retrieves the privacy settings for the authenticated user
   */
  app.get('/api/user/privacy-settings', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Get existing settings or create default ones if they don't exist
      let settings = await storage.getUserPrivacySettings(userId);
      
      if (!settings) {
        // Create default settings for the user if none exist
        const defaultSettings: InsertUserPrivacySettings = {
          userId,
          profileVisible: true,
          shareReadingHistory: false,
          anonymousCommenting: false,
          twoFactorAuthEnabled: false,
          loginNotifications: true
        };
        
        settings = await storage.createUserPrivacySettings(userId, defaultSettings);
      }
      
      return res.status(200).json(settings);
    } catch (error) {
      console.error('Error retrieving privacy settings:', error);
      return res.status(500).json({ error: 'Failed to retrieve privacy settings' });
    }
  });

  /**
   * PATCH /api/user/privacy-settings
   * Updates the privacy settings for the authenticated user
   */
  app.patch('/api/user/privacy-settings', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const updateData = req.body;
      
      // Validate that we're only updating privacy fields
      const validKeys = ['profileVisible', 'shareReadingHistory', 'anonymousCommenting', 
                         'twoFactorAuthEnabled', 'loginNotifications'];
      
      const invalidKeys = Object.keys(updateData).filter(key => !validKeys.includes(key));
      if (invalidKeys.length > 0) {
        return res.status(400).json({ 
          error: 'Invalid fields in request', 
          invalidFields: invalidKeys
        });
      }
      
      // Update the settings
      const updatedSettings = await storage.updateUserPrivacySettings(userId, updateData);
      
      return res.status(200).json(updatedSettings);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return res.status(500).json({ error: 'Failed to update privacy settings' });
    }
  });
}