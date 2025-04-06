import { Router } from 'express';
import { storage } from '../storage';
import { Express } from 'express';

/**
 * Registers direct game API endpoints that bypass Vite middleware
 * This allows for testing the API endpoints even when Vite is serving the SPA
 */
export function registerDirectGameRoutes(app: Express): void {
  console.log('Registering direct game API routes');
  
  // Direct API endpoint for game items that bypasses Vite middleware
  app.get('/direct-api/game/items', async (req, res) => {
    try {
      // Set correct Content-Type for JSON response
      res.setHeader('Content-Type', 'application/json');
      
      // Get items from the database
      const items = await storage.getGameItems();
      
      console.log(`[Direct API] Found ${items.length} game items`);
      
      if (items && items.length > 0) {
        return res.json({ items });
      }
      
      // If no items in DB, return empty list with message
      return res.json({
        items: [],
        message: "No game items found in database."
      });
    } catch (error) {
      console.error('Error fetching game items:', error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ error: 'Failed to fetch game items' });
    }
  });
  
  // Direct API endpoint for a specific game item
  app.get('/direct-api/game/items/:itemId', async (req, res) => {
    try {
      const { itemId } = req.params;
      
      // Set correct Content-Type for JSON response
      res.setHeader('Content-Type', 'application/json');
      
      // Try to get the item from the database
      const item = await storage.getGameItem(itemId);
      
      if (item) {
        return res.json(item);
      }
      
      // If item not found, return 404
      return res.status(404).json({ error: 'Item not found' });
    } catch (error) {
      console.error(`Error fetching game item ${req.params.itemId}:`, error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ error: 'Failed to fetch game item' });
    }
  });
  
  // Direct API endpoint for all game scenes
  app.get('/direct-api/game/scenes', async (req, res) => {
    try {
      // Set correct Content-Type for JSON response
      res.setHeader('Content-Type', 'application/json');
      
      // First, try to get scenes from the database
      const dbScenes = await storage.getGameScenes();
      
      if (dbScenes && dbScenes.length > 0) {
        return res.json({ scenes: dbScenes });
      }
      
      // If no scenes in DB, use default game scenes
      console.log('[Direct API] No database scenes found, using default scenes');
      
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
  
  // Direct API endpoint for a specific game scene by ID
  app.get('/direct-api/game/scenes/:sceneId', async (req, res) => {
    try {
      const { sceneId } = req.params;
      
      // Set correct Content-Type for JSON response
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
  
  console.log('Direct game API routes registered');
}