import { Router } from 'express';
import { storage } from '../storage';
import { insertNewsletterSubscriptionSchema } from '@shared/schema';
import { z } from 'zod';
import { sendNewsletterWelcomeEmail } from '../utils/send-email';

const router = Router();

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    // Validate the request body
    const validatedData = insertNewsletterSubscriptionSchema.parse(req.body);
    
    // Check if this email already exists in the database
    const existingSubscription = await storage.getNewsletterSubscriptionByEmail(validatedData.email);
    
    // If the subscription already exists and is active, just return success
    if (existingSubscription && existingSubscription.status === 'active') {
      return res.status(200).json({
        success: true,
        message: 'You are already subscribed to the newsletter',
        data: existingSubscription,
        alreadySubscribed: true
      });
    }
    
    // Subscribe to the newsletter
    const subscription = await storage.createNewsletterSubscription(validatedData);
    
    // Attempt to send welcome email if it's a new subscription or reactivation
    let emailStatus = { sent: false, error: null as string | null };
    if (subscription && (subscription.status === 'active')) {
      try {
        // Try to send welcome email
        const emailSent = await sendNewsletterWelcomeEmail(subscription.email);
        emailStatus.sent = emailSent;
        
        if (emailSent) {
          console.log(`[Newsletter] Welcome email sent to ${subscription.email}`);
        } else {
          console.warn(`[Newsletter] Failed to send welcome email to ${subscription.email}`);
          emailStatus.error = 'Email configuration issue';
        }
      } catch (emailError) {
        console.error(`[Newsletter] Error sending welcome email to ${subscription.email}:`, emailError);
        emailStatus.error = emailError instanceof Error ? emailError.message : 'Unknown error';
      }
    }
    
    // Return success response with email status
    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed to the newsletter',
      data: subscription,
      email: {
        sent: emailStatus.sent,
        message: emailStatus.sent 
          ? 'Welcome email sent successfully' 
          : 'Welcome email could not be sent at this time, but your subscription is active'
      }
    });
  } catch (error) {
    console.error('[Newsletter] Subscription error:', error);
    
    // Check if it's a validation error
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription data',
        errors: error.errors
      });
    }
    
    // Handle database errors
    return res.status(500).json({
      success: false,
      message: 'An error occurred while subscribing to the newsletter'
    });
  }
});

// GET /api/newsletter/subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    // Check if user is an admin
    if (!req.session?.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    // Get all subscriptions
    const subscriptions = await storage.getNewsletterSubscriptions();
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('[Newsletter] Get subscriptions error:', error);
    
    // Handle database errors
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving newsletter subscriptions'
    });
  }
});

// POST /api/newsletter/unsubscribe
router.post('/unsubscribe', async (req, res) => {
  try {
    // Validate the request body
    const validatedData = z.object({
      email: z.string().email('Please enter a valid email address')
    }).parse(req.body);
    
    // Change subscription status to 'unsubscribed'
    const subscription = await storage.updateNewsletterSubscriptionStatus(
      validatedData.email,
      'unsubscribed'
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from the newsletter',
      data: subscription
    });
  } catch (error) {
    console.error('[Newsletter] Unsubscribe error:', error);
    
    // Check if it's a validation error
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address',
        errors: error.errors
      });
    }
    
    // Handle database errors
    return res.status(500).json({
      success: false,
      message: 'An error occurred while unsubscribing from the newsletter'
    });
  }
});

export default router;