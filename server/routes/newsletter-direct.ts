import { Router } from 'express';
import { storage } from '../storage';
import { insertNewsletterSubscriptionSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

/**
 * Alias endpoint used by legacy clients: /api/newsletter-direct/subscribe
 * This mirrors /api/newsletter/subscribe without CSRF middleware differences.
 */
router.post('/subscribe', async (req, res) => {
  try {
    const body = insertNewsletterSubscriptionSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription data',
        errors: body.error.errors
      });
    }

    const validated = body.data;
    // If already subscribed, return existing
    const existing = await storage.getNewsletterSubscriptionByEmail(validated.email);
    if (existing && existing.status === 'active') {
      return res.status(200).json({
        success: true,
        message: 'Already subscribed',
        data: existing,
        alreadySubscribed: true
      });
    }

    const subscription = await storage.createNewsletterSubscription(validated);

    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed to the newsletter',
      data: subscription
    });
  } catch (error) {
    console.error('[NewsletterDirect] Subscription error:', error);
    return res.status(500).json({ success: false, message: 'Failed to subscribe' });
  }
});

export default router;