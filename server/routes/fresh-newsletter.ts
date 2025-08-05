import express from 'express';
import { sendFreshNewsletter } from '../utils/fresh-email';

import { z } from 'zod';
import { storage } from '../storage';

const router = express.Router();

const EmailSubscriptionSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  preferences: z.record(z.boolean()).optional()
});

/**
 * Fresh newsletter subscription endpoint
 * This bypasses all the normal newsletter subscription code
 */
router.post('/subscribe', async (req, res) => {
  try {
    
    
    // Validate request body
    const validationResult = EmailSubscriptionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address or data format',
        errors: validationResult.error.errors
      });
    }
    
    const { email } = validationResult.data;
    
    // Check if already subscribed
    const existingSubscription = await storage.getNewsletterSubscriptionByEmail(email);
    if (existingSubscription && existingSubscription.status === 'active') {
      
      
      // Send a fresh welcome email anyway
      const emailSent = await sendFreshNewsletter(email);
      
      return res.status(200).json({
        success: true,
        message: 'Already subscribed to the newsletter, but sent a fresh welcome email',
        data: existingSubscription,
        email: {
          sent: emailSent,
          message: emailSent ? 'Fresh welcome email sent successfully' : 'Failed to send fresh welcome email'
        }
      });
    }
    
    // Create new subscription or use existing
    let subscription;
    if (existingSubscription) {
      // Use existing subscription
      subscription = existingSubscription;
      
    } else {
      // Create new
      subscription = await storage.createNewsletterSubscription({
        email,
        metadata: { status: 'active' }
      });
      
    }
    
    // Send welcome email
    const emailSent = await sendFreshNewsletter(email);
    
    
    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed to the newsletter',
      data: subscription,
      email: {
        sent: emailSent,
        message: emailSent ? 'Fresh welcome email sent successfully' : 'Failed to send fresh welcome email'
      }
    });
  } catch (error: any) {
    console.error('[Fresh-Newsletter] Error processing subscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process subscription',
      error: error.message || 'Unknown error'
    });
  }
});

export default router;