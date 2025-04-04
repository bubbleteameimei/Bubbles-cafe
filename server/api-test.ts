import express from 'express';
import { storage } from './storage';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { validateCsrfToken } from './middleware/csrf-protection';

const router = express.Router();

// Test endpoint to get user by ID
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        metadata: user.metadata
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint to update user metadata directly
router.post('/user/:id/update-metadata', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const { metadata } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (!metadata || typeof metadata !== 'object') {
      return res.status(400).json({ error: 'Invalid metadata object' });
    }

    // Get the current user to verify existence
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user metadata directly through database query
    const updatedUser = await db.update(users)
      .set({ metadata })
      .where(eq(users.id, userId))
      .returning()
      .then(rows => rows[0]);

    return res.json({
      success: true,
      message: 'User metadata updated successfully',
      user: {
        id: updatedUser.id,
        metadata: updatedUser.metadata
      }
    });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint to examine direct database connection
router.get('/db-info', async (req, res) => {
  try {
    // Get all users to test database connection
    const allUsers = await db.select().from(users);
    
    return res.json({
      success: true,
      message: 'Database connection working',
      userCount: allUsers.length
    });
  } catch (error) {
    console.error('Database connection test error:', error);
    return res.status(500).json({ 
      error: 'Database connection error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Test endpoint to update user through storage.updateUser
router.post('/user/:id/update', validateCsrfToken(), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const updateData = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Get the current user to verify existence
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Updating user with data:', updateData);
    const updatedUser = await storage.updateUser(userId, updateData);

    return res.json({
      success: true,
      message: 'User updated successfully through storage',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        metadata: updatedUser.metadata
      }
    });
  } catch (error) {
    console.error('Error updating user through storage:', error);
    return res.status(500).json({ 
      error: 'Update error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Test endpoint to update user through storage.updateUser (without CSRF protection for testing)
router.post('/user/:id/update-no-csrf', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const updateData = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Get the current user to verify existence
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Updating user with data (no CSRF):', updateData);
    const updatedUser = await storage.updateUser(userId, updateData);

    return res.json({
      success: true,
      message: 'User updated successfully through storage (no CSRF)',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        metadata: updatedUser.metadata
      }
    });
  } catch (error) {
    console.error('Error updating user through storage (no CSRF):', error);
    return res.status(500).json({ 
      error: 'Update error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Add route to test the profile update specifically
router.post('/profile-update-test', async (req, res) => {
  try {
    const { userId, updateData } = req.body;
    
    if (!userId || typeof userId !== 'number') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (!updateData || typeof updateData !== 'object') {
      return res.status(400).json({ error: 'Invalid update data' });
    }

    // Get user first to check existence
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a copy of the existing metadata and merge with new data
    const existingMetadata = user.metadata || {};
    let newMetadata = { ...existingMetadata };
    
    // If metadata is part of the update, merge it instead of replacing
    if (updateData.metadata) {
      newMetadata = { 
        ...newMetadata,
        ...updateData.metadata
      };
      
      // Create a new update object with the merged metadata
      const mergedUpdate = {
        ...updateData,
        metadata: newMetadata
      };
      
      console.log('Updating with merged metadata:', mergedUpdate);
      const updatedUser = await storage.updateUser(userId, mergedUpdate);
      
      return res.json({
        success: true,
        message: 'User profile updated with merged metadata',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          metadata: updatedUser.metadata
        }
      });
    } else {
      // If no metadata in update, just update other fields
      console.log('Updating user without metadata changes:', updateData);
      const updatedUser = await storage.updateUser(userId, updateData);
      
      return res.json({
        success: true,
        message: 'User profile updated without metadata changes',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          metadata: updatedUser.metadata
        }
      });
    }
  } catch (error) {
    console.error('Profile update test error:', error);
    return res.status(500).json({ 
      error: 'Profile update test error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;