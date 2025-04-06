import { Router } from 'express';
import { storage } from '../storage';
import { insertGameSaveSchema, insertGameProgressSchema, insertGameStatsSchema } from '../../shared/schema';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';

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

// Check if game system is working
router.get('/stats/check', async (req, res) => {
  try {
    res.json({ 
      status: 'ok', 
      message: 'Game system is operational', 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Error checking game system:', error);
    res.status(500).json({ error: 'Failed to check game system' });
  }
});

// Get all game scenes
router.get('/scenes', async (req, res) => {
  try {
    // Set content type explicitly to ensure JSON response
    res.setHeader('Content-Type', 'application/json');
    
    // First, try to get scenes from the database
    const dbScenes = await storage.getGameScenes();
    
    if (dbScenes && dbScenes.length > 0) {
      return res.json({ scenes: dbScenes });
    }
    
    // If no scenes in DB, use default game scenes
    console.log('No database scenes found, using default scenes');
    
    // Default scene data
    const defaultScenes = [
      {
        sceneId: 'village_entrance',
        name: "Village Entrance",
        description: "A dilapidated wooden sign reading 'Eden's Hollow' creaks in the wind.",
        backgroundImage: "/assets/eden/scenes/village_entrance.jpg",
        type: "exploration",
        data: {
          exits: [
            { target: "village_square", label: "Enter the village" }
          ],
          items: [],
          characters: []
        }
      },
      {
        sceneId: 'village_square',
        name: "Village Square",
        description: "A once-bustling village square now stands eerily empty.",
        backgroundImage: "/assets/eden/scenes/village_square.jpg",
        type: "exploration",
        data: {
          exits: [
            { target: "village_entrance", label: "Return to entrance" },
            { target: "abandoned_church", label: "Visit the church" },
            { target: "old_tavern", label: "Enter the tavern" }
          ],
          items: [],
          characters: []
        }
      }
    ];
    
    return res.json({
      scenes: defaultScenes,
      source: "default",
      message: "Using default game scenes. Database scenes not available."
    });
  } catch (error) {
    console.error('Error fetching game scenes:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Failed to fetch game scenes' });
  }
});

// Get a specific game scene by ID
router.get('/scenes/:sceneId', async (req, res) => {
  try {
    const { sceneId } = req.params;
    
    // Set content type explicitly to ensure JSON response
    res.setHeader('Content-Type', 'application/json');
    
    // Try to get the scene from the database
    const scene = await storage.getGameScene(sceneId);
    
    if (scene) {
      return res.json(scene);
    }
    
    // Check for default scenes
    const defaultScenes = {
      'village_entrance': {
        sceneId: 'village_entrance',
        name: "Village Entrance",
        description: "A dilapidated wooden sign reading 'Eden's Hollow' creaks in the wind.",
        backgroundImage: "/assets/eden/scenes/village_entrance.jpg",
        type: "exploration",
        data: {
          exits: [
            { target: "village_square", label: "Enter the village" }
          ],
          items: [],
          characters: []
        }
      },
      'village_square': {
        sceneId: 'village_square',
        name: "Village Square",
        description: "A once-bustling village square now stands eerily empty.",
        backgroundImage: "/assets/eden/scenes/village_square.jpg",
        type: "exploration",
        data: {
          exits: [
            { target: "village_entrance", label: "Return to entrance" },
            { target: "abandoned_church", label: "Visit the church" },
            { target: "old_tavern", label: "Enter the tavern" }
          ],
          items: [],
          characters: []
        }
      }
    };
    
    // Check if requested scene is one of our defaults
    if (defaultScenes[sceneId]) {
      return res.json({
        ...defaultScenes[sceneId],
        source: "default"
      });
    }
    
    // If scene not found, return 404
    return res.status(404).json({ error: 'Scene not found' });
  } catch (error) {
    console.error(`Error fetching game scene ${req.params.sceneId}:`, error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Failed to fetch game scene' });
  }
});

export default router;