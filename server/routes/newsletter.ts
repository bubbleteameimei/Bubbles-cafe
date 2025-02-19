import express from 'express';
import { z } from 'zod';
import { insertNewsletterSubscriptionSchema } from '@shared/schema';
import { storage } from '../storage';

const router = express.Router();

router.post('/subscribe', async (req, res) => {
  try {
    const data = insertNewsletterSubscriptionSchema.parse(req.body);
    const subscription = await storage.subscribeNewsletter(data);
    res.json(subscription);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to subscribe to newsletter' });
    }
  }
});

export default router;