import { Router } from 'express';
import { storage } from '../storage';
import { insertGameSaveSchema, insertGameProgressSchema, insertGameStatsSchema } from '../../shared/schema';
import { z } from 'zod';

const router = Router();

// Get saved games for a user
router.get('/saves', async (req, res) => {
  try {
    const userId = req.session.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const saves = await storage.getGameSaves(userId);
    res.json(saves);
  } catch (error) {
    console.error('Error fetching game saves:', error);
    res.status(500).json({ error: 'Failed to fetch game saves' });
  }
});

// Get specific save
router.get('/saves/:saveId', async (req, res) => {
  try {
    const { saveId } = req.params;
    const userId = req.session.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const save = await storage.getGameSave(saveId, userId);
    
    if (!save) {
      return res.status(404).json({ error: 'Save not found' });
    }
    
    res.json(save);
  } catch (error) {
    console.error('Error fetching game save:', error);
    res.status(500).json({ error: 'Failed to fetch game save' });
  }
});

// Create new save
router.post('/saves', async (req, res) => {
  try {
    const userId = req.session.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const result = insertGameSaveSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid save data', details: result.error.format() });
    }
    
    const saveData = {
      ...result.data,
      userId
    };
    
    const saveId = await storage.createGameSave(saveData);
    res.status(201).json({ saveId });
  } catch (error) {
    console.error('Error creating game save:', error);
    res.status(500).json({ error: 'Failed to save game' });
  }
});

// Update save
router.put('/saves/:saveId', async (req, res) => {
  try {
    const { saveId } = req.params;
    const userId = req.session.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const result = insertGameSaveSchema.partial().safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid save data', details: result.error.format() });
    }
    
    const updated = await storage.updateGameSave(saveId, userId, result.data);
    
    if (!updated) {
      return res.status(404).json({ error: 'Save not found or unauthorized' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating game save:', error);
    res.status(500).json({ error: 'Failed to update game save' });
  }
});

// Delete save
router.delete('/saves/:saveId', async (req, res) => {
  try {
    const { saveId } = req.params;
    const userId = req.session.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const deleted = await storage.deleteGameSave(saveId, userId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Save not found or unauthorized' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting game save:', error);
    res.status(500).json({ error: 'Failed to delete game save' });
  }
});

// Update game progress
router.post('/progress', async (req, res) => {
  try {
    const userId = req.session.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const result = insertGameProgressSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid progress data', details: result.error.format() });
    }
    
    const progressData = {
      ...result.data,
      userId
    };
    
    const progressId = await storage.updateGameProgress(userId, progressData);
    res.json({ progressId });
  } catch (error) {
    console.error('Error updating game progress:', error);
    res.status(500).json({ error: 'Failed to update game progress' });
  }
});

// Get game progress
router.get('/progress', async (req, res) => {
  try {
    const userId = req.session.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const progress = await storage.getGameProgress(userId);
    
    if (!progress) {
      return res.status(404).json({ error: 'No progress found' });
    }
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching game progress:', error);
    res.status(500).json({ error: 'Failed to fetch game progress' });
  }
});

// Update game stats
router.post('/stats', async (req, res) => {
  try {
    const userId = req.session.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const result = insertGameStatsSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid stats data', details: result.error.format() });
    }
    
    const statsData = {
      ...result.data,
      userId
    };
    
    const statsId = await storage.updateGameStats(userId, statsData);
    res.json({ statsId });
  } catch (error) {
    console.error('Error updating game stats:', error);
    res.status(500).json({ error: 'Failed to update game stats' });
  }
});

// Get game stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.session.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const stats = await storage.getGameStats(userId);
    
    if (!stats) {
      return res.status(404).json({ error: 'No stats found' });
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching game stats:', error);
    res.status(500).json({ error: 'Failed to fetch game stats' });
  }
});

export default router;