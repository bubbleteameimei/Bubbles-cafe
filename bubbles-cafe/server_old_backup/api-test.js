/**
 * API Test Endpoint
 * 
 * This file adds test endpoints to help us verify our fixes
 */

const express = require('express');
const router = express.Router();

// Import necessary modules
const { storage } = require('./storage');

// Add a middleware to log all requests
router.use((req, res, next) => {
  console.log(`[API Test] ${req.method} ${req.path}`, req.body || '');
  next();
});

// Get user profile - for testing only
router.get('/profile/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Safe user data without password
    const { password_hash, ...safeUserData } = user;
    
    res.json(safeUserData);
  } catch (error) {
    console.error('[API Test] Error getting user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user metadata - for testing only
router.patch('/profile/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { metadata } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    if (!metadata) {
      return res.status(400).json({ error: 'Missing metadata' });
    }
    
    // Get current user
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prepare update data
    const updateData = {
      metadata: {
        ...(user.metadata || {}),
        ...metadata
      }
    };
    
    console.log('[API Test] Updating user with data:', updateData);
    
    // Update user
    const updatedUser = await storage.updateUser(userId, updateData);
    
    // Safe user data without password
    const { password_hash, ...safeUserData } = updatedUser;
    
    res.json(safeUserData);
  } catch (error) {
    console.error('[API Test] Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;