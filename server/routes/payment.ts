/**
 * Payment Routes - Paystack Integration
 * 
 * This file contains all payment-related routes for the platform.
 * Paystack is the only supported payment gateway.
 */
import { Router, Request, Response } from 'express';
import * as paystackService from '../services/paystack';
import { storage } from '../storage';
import { createErrorFunction as createError } from '../utils/error-handler';
import { asyncHandler } from '../utils/error-handler';

const router = Router();

// Initialize payment
router.post('/initialize', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { amount, email, reference, callbackUrl, metadata } = req.body;

    if (!amount || !email) {
      throw createError(400, 'Amount and email are required');
    }

    // Generate reference if not provided
    const txReference = reference || paystackService.generateReference();

    // Enhanced metadata for tracking
    const enhancedMetadata = {
      ...metadata,
      userId: req.session?.user?.id,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      timestamp: new Date().toISOString()
    };

    // Initialize transaction with Paystack
    const response = await paystackService.initializeTransaction({
      email,
      amount: parseInt(amount) * 100, // Convert to kobo
      reference: txReference,
      callback_url: callbackUrl,
      metadata: enhancedMetadata
    });

    // Log activity
    if (req.session?.user) {
      await storage.createActivityLog({
        userId: req.session.user.id,
        action: 'payment_initialized',
        details: {
          reference: txReference,
          amount: amount,
          email: email
        }
      });
    }

    res.json(response);
  } catch (error: any) {
    console.error('[Payment] Error initializing payment:', error);
    if (error.statusCode) throw error;
    throw createError(500, 'Failed to initialize payment');
  }
}));

// Verify payment
router.get('/verify/:reference', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      throw createError(400, 'Payment reference is required');
    }

    const response = await paystackService.verifyTransaction(reference);

    // Log successful verification
    if (response && (response as any).data?.status === 'success' && req.session?.user) {
      await storage.createActivityLog({
        userId: req.session.user.id,
        action: 'payment_verified',
        details: {
          reference: reference,
          amount: (response as any).data?.amount,
          status: (response as any).data?.status
        }
      });
    }

    res.json(response);
  } catch (error: any) {
    console.error('[Payment] Error verifying payment:', error);
    if (error.statusCode) throw error;
    throw createError(500, 'Failed to verify payment');
  }
}));

// Handle webhook
router.post('/webhook', asyncHandler(async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;

    if (!signature) {
      throw createError(400, 'Missing webhook signature');
    }

    // Validate webhook signature
    const isValid = paystackService.validateWebhookSignature(
      JSON.stringify(req.body), 
      signature
    );

    if (!isValid) {
      throw createError(401, 'Invalid webhook signature');
    }

    const event = paystackService.processWebhook(req.body);

    // Handle different webhook events
    switch (event.event) {
      case 'charge.success':
        
        // Log the successful payment
        if (event.data?.metadata?.userId) {
          await storage.createActivityLog({
            userId: event.data.metadata.userId,
            action: 'payment_completed',
            details: {
              reference: event.data.reference,
              amount: event.data.amount,
              status: event.data.status
            }
          });
        }
        break;
      
      case 'charge.failed':
        
        break;
      
      default:
        
    }

    res.json({ status: 'success' });
  } catch (error: any) {
    console.error('[Payment] Error processing webhook:', error);
    if (error.statusCode) throw error;
    throw createError(500, 'Failed to process webhook');
  }
}));

// Get payment plans
router.get('/plans', async (_req: Request, res: Response) => {
  try {
    // Return predefined payment plans
    const plans = [
      {
        id: 'basic',
        name: 'Basic Support',
        amount: 500, // 5 NGN
        description: 'Support the platform with a small contribution'
      },
      {
        id: 'premium',
        name: 'Premium Support',
        amount: 1000, // 10 NGN
        description: 'Premium support for the platform'
      },
      {
        id: 'sponsor',
        name: 'Sponsor',
        amount: 2000, // 20 NGN
        description: 'Become a sponsor of the platform'
      }
    ];

    res.json({ data: plans });
  } catch (error: any) {
    console.error('[Payment] Error fetching plans:', error);
    throw createError(500, 'Failed to fetch payment plans');
  }
});

export default router;