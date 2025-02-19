import express from 'express';
import { z } from 'zod';
import { insertStoryRatingSchema } from '@shared/schema';
import { storage } from '../storage';

const router = express.Router();

// Get rating for a specific post and user
router.get('/', async (req, res) => {
  try {
    const { postId, userId } = req.query;
    if (!postId || !userId) {
      return res.status(400).json({ error: 'postId and userId are required' });
    }
    
    const rating = await storage.getStoryRating(Number(postId), Number(userId));
    res.json(rating);
  } catch (error) {
    console.error('Error fetching rating:', error);
    res.status(500).json({ error: 'Failed to fetch rating' });
  }
});

// Submit a new rating
router.post('/', async (req, res) => {
  try {
    const data = insertStoryRatingSchema.parse(req.body);
    const existingRating = await storage.getStoryRating(data.postId, data.userId);

    let rating;
    if (existingRating) {
      rating = await storage.updateStoryRating(data.postId, data.userId, data.fearRating);
    } else {
      rating = await storage.createStoryRating(data);
    }

    res.json(rating);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Error creating/updating rating:', error);
      res.status(500).json({ error: 'Failed to submit rating' });
    }
  }
});

export default router;
