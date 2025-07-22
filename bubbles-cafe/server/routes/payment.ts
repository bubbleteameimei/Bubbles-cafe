/**
 * Payment Routes - Paystack Integration
 * 
 * This file contains all payment-related routes for the platform.
 * Paystack is the only supported payment gateway.
 */
import { Express, Request, Response } from 'express';
import * as paystackService from '../services/paystack';
import { storage } from '../storage';

/**
 * Register payment routes
 */
export const registerPaymentRoutes = (app: Express) => {
  console.log('Registering payment routes (Paystack)');

  /**
   * Initialize a transaction
   * POST /api/payments/initialize
   */
  app.post('/api/payments/initialize', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session?.user) {
        return res.status(401).json({ 
          status: false, 
          message: 'User not authenticated'
        });
      }

      const { amount, callbackUrl, reference, metadata } = req.body;
      
      // Validate required fields
      if (!amount) {
        return res.status(400).json({ 
          status: false, 
          message: 'Amount is required'
        });
      }
      
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
      await storage.createActivityLog({
        userId: req.session.user.id,
        action: 'payment_initiated',
        details: {
          amount,
          reference: txReference
        },
        createdAt: new Date()
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
  app.get('/api/payments/verify/:reference', async (req: Request, res: Response) => {
    try {
      const { reference } = req.params;
      
      if (!reference) {
        return res.status(400).json({ 
          status: false, 
          message: 'Transaction reference is required'
        });
      }
      
      const response = await paystackService.verifyTransaction(reference);
      
      // If payment is successful, update user records
      if (response.data.status === 'success' && req.session?.user) {
        // Log transaction in activity logs
        await storage.createActivityLog({
          userId: req.session.user.id,
          action: 'payment_successful',
          details: {
            amount: response.data.amount,
            reference: reference,
            paymentDate: new Date().toISOString()
          },
          createdAt: new Date()
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
  app.post('/api/payments/webhook', async (req: Request, res: Response) => {
    try {
      // Get signature from headers
      const signature = req.headers['x-paystack-signature'] as string;
      
      if (!signature) {
        return res.status(400).json({ 
          status: false, 
          message: 'Invalid webhook signature'
        });
      }
      
      // Process webhook
      const event = paystackService.processWebhook(signature, req.body);
      
      // Handle different event types
      switch (event.event) {
        case 'charge.success':
          // Handle successful charge
          console.log(`Webhook: Charge success for ${event.data.reference}`);
          
          // Update user subscription if applicable
          if (event.data.metadata?.userId) {
            const userId = parseInt(event.data.metadata.userId);
            
            await storage.createActivityLog({
              userId,
              action: 'payment_webhook_received',
              details: {
                amount: event.data.amount,
                reference: event.data.reference,
                status: 'success'
              },
              createdAt: new Date()
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
  app.get('/api/payments/plans', async (req: Request, res: Response) => {
    try {
      // This is a placeholder - in a real implementation, you would fetch plans from Paystack
      // or from your database where you've stored your plan information
      
      // Example plans
      const plans = [
        {
          id: 'monthly_standard',
          name: 'Monthly Standard',
          amount: 1000, // Amount in lowest currency unit (e.g., cents or kobo)
          interval: 'monthly',
          description: 'Standard monthly subscription with premium content access.'
        },
        {
          id: 'yearly_premium',
          name: 'Yearly Premium',
          amount: 10000, // Amount in lowest currency unit
          interval: 'annually',
          description: 'Premium yearly subscription with all features and exclusive content.'
        }
      ];
      
      return res.status(200).json({ 
        status: true,
        data: plans
      });
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
      
      // Get user subscription from database (to be implemented)
      // For now, we'll return a placeholder response
      
      return res.status(200).json({ 
        status: true,
        data: {
          hasActiveSubscription: false,
          subscription: null,
          nextBillingDate: null
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