/**
 * Payment Routes - Paystack Integration
 * 
 * This file contains all payment-related routes for the platform.
 * Paystack is the only supported payment gateway.
 */
import { Express, Request, Response } from 'express';
import express from 'express';
import * as paystackService from '../services/paystack';
import { storage } from '../storage';
import { z } from 'zod';
import { validateBody, validateParams } from '../middleware/input-validation';

/**
 * Register payment routes
 */
export const registerPaymentRoutes = (app: Express) => {
  console.log('Registering payment routes (Paystack)');
  // Use raw body for webhook signature verification
  app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), (req: Request, res: Response) => {
    try {
      const signature = req.headers['x-paystack-signature'] as string;
      const rawBody = req.body as any; // raw Buffer
      const parsed = rawBody && Buffer.isBuffer(rawBody) ? JSON.parse(rawBody.toString('utf8')) : rawBody;
      const event = paystackService.processWebhook(signature, parsed);
      return res.status(200).json(event);
    } catch (error) {
      console.error('Error processing webhook:', error);
      return res.status(500).json({ status: false, message: 'Failed to process webhook' });
    }
  });

  /**
   * Initialize a transaction
   * POST /api/payments/initialize
   */
  const initSchema = z.object({
    amount: z.coerce.number().int().positive('Amount must be a positive integer (lowest currency unit)'),
    callbackUrl: z.string().url().optional(),
    reference: z.string().min(1).optional(),
    metadata: z.record(z.unknown()).optional()
  });

  app.post('/api/payments/initialize', validateBody(initSchema), async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session?.user) {
        return res.status(401).json({ 
          status: false, 
          message: 'User not authenticated'
        });
      }
      const { amount, callbackUrl, reference, metadata } = req.body as z.infer<typeof initSchema>;
      
      // Get user email from session
      const userEmail = req.session.user.email;
      
      if (!userEmail) {
        return res.status(400).json({ 
          status: false, 
          message: 'User email is required'
        });
      }
      
      // Generate reference if not provided
      const txReference = reference || paystackService.generateReference();
      
      // Enhanced metadata with user info
      const enhancedMetadata = {
        ...metadata,
        userId: req.session.user.id,
        username: req.session.user.username
      };
      
      // Initialize transaction
      const response = await paystackService.initializeTransaction(
        amount,
        userEmail,
        txReference,
        callbackUrl,
        enhancedMetadata
      );
      
      // Log transaction in activity logs
      await storage.logActivity({
        userId: req.session.user.id,
        action: 'payment_initiated',
        details: {
          amount,
          reference: txReference
        }
      });
      
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error initializing payment:', error);
      return res.status(500).json({ 
        status: false, 
        message: 'Failed to initialize payment',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Verify a transaction
   * GET /api/payments/verify/:reference
   */
  const verifyParamsSchema = z.object({ reference: z.string().min(1, 'Reference is required') });
  app.get('/api/payments/verify/:reference', validateParams(verifyParamsSchema), async (req: Request, res: Response) => {
    try {
      const { reference } = req.params as z.infer<typeof verifyParamsSchema>;
      
      const response: any = await paystackService.verifyTransaction(reference);
      
      // If payment is successful, update user records
      if (response.data.status === 'success' && req.session?.user) {
        // Log transaction in activity logs
        await storage.logActivity({
          userId: req.session.user.id,
          action: 'payment_successful',
          details: {
            amount: response.data.amount,
            reference: reference,
            paymentDate: new Date().toISOString()
          }
        });
        
        // You can add more logic here to update user's subscription status, etc.
      }
      
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error verifying payment:', error);
      return res.status(500).json({ 
        status: false, 
        message: 'Failed to verify payment',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Handle Paystack webhook
   * POST /api/payments/webhook
   */
  // Handle different event types from the earlier webhook handler
  app.post('/api/payments/_webhook-handler', async (req: Request, res: Response) => {
    try {
      const event = req.body as any;
      switch (event.event) {
        case 'charge.success':
          // Handle successful charge
          console.log(`Webhook: Charge success for ${event.data.reference}`);
          
          // Update user subscription if applicable
          if (event.data.metadata?.userId) {
            const userId = parseInt(event.data.metadata.userId);
            
            await storage.logActivity({
              userId,
              action: 'payment_webhook_received',
              details: {
                amount: event.data.amount,
                reference: event.data.reference,
                status: 'success'
              }
            });
            
            // Add more logic to update user subscription, etc.
          }
          break;
          
        case 'subscription.create':
          // Handle subscription creation
          console.log(`Webhook: Subscription created ${event.data.subscription_code}`);
          break;
          
        case 'subscription.disable':
          // Handle subscription cancellation
          console.log(`Webhook: Subscription disabled ${event.data.subscription_code}`);
          break;
          
        default:
          console.log(`Webhook: Unhandled event type ${event.event}`);
      }
      
      // Return 200 to acknowledge receipt of the webhook
      return res.status(200).json({ status: true, message: 'Webhook received' });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return res.status(500).json({ 
        status: false, 
        message: 'Failed to process webhook',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get payment plans
   * GET /api/payments/plans
   */
  app.get('/api/payments/plans', async (_req: Request, res: Response) => {
    try {
      // Fetch plans from Paystack API if possible, otherwise fall back
      try {
        const resp: any = await paystackService.listTransactions({ perPage: 1, page: 1 });
        // If API key works, return a predefined plan set suitable for the app
        const plans = [
          { id: 'monthly_standard', name: 'Monthly Standard', amount: 1000, interval: 'monthly', description: 'Standard monthly subscription with premium content access.' },
          { id: 'yearly_premium', name: 'Yearly Premium', amount: 10000, interval: 'annually', description: 'Premium yearly subscription with all features and exclusive content.' }
        ];
        return res.status(200).json({ status: true, data: plans, meta: { paystackReachable: !!resp } });
      } catch {
        const plans = [
          { id: 'monthly_standard', name: 'Monthly Standard', amount: 1000, interval: 'monthly', description: 'Standard monthly subscription with premium content access.' },
          { id: 'yearly_premium', name: 'Yearly Premium', amount: 10000, interval: 'annually', description: 'Premium yearly subscription with all features and exclusive content.' }
        ];
        return res.status(200).json({ status: true, data: plans, meta: { paystackReachable: false } });
      }
    } catch (error) {
      console.error('Error fetching payment plans:', error);
      return res.status(500).json({ 
        status: false, 
        message: 'Failed to fetch payment plans',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get user subscription status
   * GET /api/payments/subscription/status
   */
  app.get('/api/payments/subscription/status', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session?.user) {
        return res.status(401).json({ 
          status: false, 
          message: 'User not authenticated'
        });
      }
      
      // Attempt to infer subscription status from recent successful transactions for this user email
      const userEmail = req.session.user.email;
      let hasActiveSubscription = false;
      let nextBillingDate: string | null = null;
      let subscription: any = null;

      try {
        const txList: any = await paystackService.listTransactions({ perPage: 10, page: 1, customer: userEmail, status: 'success' });
        const recent = (txList?.data || []).find((t: any) => t.customer?.email === userEmail && t.status === 'success');
        if (recent) {
          hasActiveSubscription = true;
          // Estimate next billing date as 30 days from last payment when plan info is not available
          const paidAt = recent.paidAt || recent.paid_at || new Date().toISOString();
          nextBillingDate = new Date(new Date(paidAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
          subscription = {
            reference: recent.reference,
            amount: recent.amount,
            channel: recent.channel,
            paidAt: paidAt
          };
        }
      } catch (e) {
        // Non-fatal: if Paystack is not reachable, default to no active subscription
      }

      return res.status(200).json({
        status: true,
        data: {
          hasActiveSubscription,
          subscription,
          nextBillingDate
        }
      });
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      return res.status(500).json({ 
        status: false, 
        message: 'Failed to fetch subscription status',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  console.log('Payment routes registered successfully');
};