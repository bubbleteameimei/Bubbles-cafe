/**
 * Paystack Payment Service
 * 
 * This service handles all Paystack payment integrations for the platform.
 * It's the only monetization method allowed in the system.
 */
import fetch from 'node-fetch';
import { Request, Response, Router } from 'express';
const router = Router();

// Check for required environment variables
if (!process.env.PAYSTACK_SECRET_KEY) {
  console.warn('[PAYSTACK] Warning: PAYSTACK_SECRET_KEY environment variable is not set!');
}

// Base API URL
const PAYSTACK_API_URL = 'https://api.paystack.co';

// API Headers
const getHeaders = () => {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Error handling middleware for Paystack API calls
 */
const handlePaystackResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    console.error('[PAYSTACK] API Error:', errorData);
    throw new Error(errorData.message || 'Failed to complete Paystack operation');
  }
  return response.json();
};

/**
 * Initialize a transaction
 * @param amount Amount in kobo/cents
 * @param email Customer's email address
 * @param reference Optional reference for the transaction
 * @param callbackUrl URL to redirect to after payment
 */
export const initializeTransaction = async (
  amount: number,
  email: string,
  reference?: string,
  callbackUrl?: string,
  metadata?: any
) => {
  try {
    console.log(`[PAYSTACK] Initializing transaction for ${email}, amount: ${amount}`);
    
    const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        amount,
        email,
        reference,
        callback_url: callbackUrl,
        metadata
      })
    });
    
    const data = await handlePaystackResponse(response);
    console.log(`[PAYSTACK] Transaction initialized successfully. Reference: ${data.data.reference}`);
    return data;
  } catch (error) {
    console.error(`[PAYSTACK] Failed to initialize transaction:`, error);
    throw error;
  }
};

/**
 * Verify a transaction
 * @param reference Transaction reference
 */
export const verifyTransaction = async (reference: string) => {
  try {
    console.log(`[PAYSTACK] Verifying transaction: ${reference}`);
    
    const response = await fetch(`${PAYSTACK_API_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    const data = await handlePaystackResponse(response);
    console.log(`[PAYSTACK] Transaction verification status: ${(data as any).data.status}`);
    return data;
  } catch (error) {
    console.error(`[PAYSTACK] Failed to verify transaction:`, error);
    throw error;
  }
};

/**
 * List transactions with optional filters
 * @param filters Optional filters (perPage, page, customer, status, etc.)
 */
export const listTransactions = async (filters: Record<string, any> = {}) => {
  try {
    console.log(`[PAYSTACK] Listing transactions with filters: ${JSON.stringify(filters)}`);
    
    // Build query string from filters
    const queryString = Object.entries(filters)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    
    const url = `${PAYSTACK_API_URL}/transaction?${queryString}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    
    const data = await handlePaystackResponse(response);
    console.log(`[PAYSTACK] Retrieved ${(data as any).data.length} transactions`);
    return data;
  } catch (error) {
    console.error(`[PAYSTACK] Failed to list transactions:`, error);
    throw error;
  }
};

/**
 * Create subscription plan
 * @param name Plan name
 * @param amount Amount in kobo/cents
 * @param interval Billing interval (daily, weekly, monthly, quarterly, biannually, annually)
 */
export const createPlan = async (
  name: string,
  amount: number,
  interval: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually',
  description?: string
) => {
  try {
    console.log(`[PAYSTACK] Creating plan: ${name}, amount: ${amount}, interval: ${interval}`);
    
    const response = await fetch(`${PAYSTACK_API_URL}/plan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name,
        amount,
        interval,
        description
      })
    });
    
    const data = await handlePaystackResponse(response);
    console.log(`[PAYSTACK] Plan created successfully. ID: ${(data as any).data.id}`);
    return data;
  } catch (error) {
    console.error(`[PAYSTACK] Failed to create plan:`, error);
    throw error;
  }
};

/**
 * Create a subscription
 * @param customerEmail Customer's email
 * @param planCode Plan code
 */
export const createSubscription = async (customerEmail: string, planCode: string) => {
  try {
    console.log(`[PAYSTACK] Creating subscription for ${customerEmail}, plan: ${planCode}`);
    
    const response = await fetch(`${PAYSTACK_API_URL}/subscription`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        customer: customerEmail,
        plan: planCode
      })
    });
    
    const data = await handlePaystackResponse(response);
    console.log(`[PAYSTACK] Subscription created successfully. ID: ${(data as any).data.id}`);
    return data;
  } catch (error) {
    console.error(`[PAYSTACK] Failed to create subscription:`, error);
    throw error;
  }
};

/**
 * Get a subscription by ID or code
 * @param idOrCode Subscription ID or code
 */
export const getSubscription = async (idOrCode: string) => {
  try {
    console.log(`[PAYSTACK] Getting subscription: ${idOrCode}`);
    
    const response = await fetch(`${PAYSTACK_API_URL}/subscription/${idOrCode}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    const data = await handlePaystackResponse(response);
    return data;
  } catch (error) {
    console.error(`[PAYSTACK] Failed to get subscription:`, error);
    throw error;
  }
};

/**
 * Cancel a subscription
 * @param code Subscription code
 * @param token Email token
 */
export const cancelSubscription = async (code: string, token: string) => {
  try {
    console.log(`[PAYSTACK] Cancelling subscription: ${code}`);
    
    const response = await fetch(`${PAYSTACK_API_URL}/subscription/disable`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        code,
        token
      })
    });
    
    const data = await handlePaystackResponse(response);
    console.log(`[PAYSTACK] Subscription cancelled successfully.`);
    return data;
  } catch (error) {
    console.error(`[PAYSTACK] Failed to cancel subscription:`, error);
    throw error;
  }
};

/**
 * Process Paystack webhook
 * @param signature Paystack signature from request header
 * @param body Request body
 */
export const processWebhook = (signature: string, body: any) => {
  try {
    console.log(`[PAYSTACK] Processing webhook event: ${body.event}`);
    
    // Todo: Verify webhook signature when implementing in production
    
    // Return event data for processing
    return {
      event: body.event,
      data: body.data
    };
  } catch (error) {
    console.error(`[PAYSTACK] Failed to process webhook:`, error);
    throw error;
  }
};

/**
 * Generate a unique transaction reference
 */
export const generateReference = () => {
  return `ps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

router.post('/initialize', async (req: Request, res: Response) => {
  try {
    const amount = req.body.amount;
    const email = req.body.email;
    const reference = req.body.reference;
    const callbackUrl = req.body.callbackUrl;
    const metadata = req.body.metadata;

    if (!amount || !email) {
      return res.status(400).json({ status: 'error', message: 'Amount and email are required' });
    }

    const data = await initializeTransaction(amount, email, reference, callbackUrl, metadata);
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error?.message || 'Initialization failed' });
  }
});

router.post('/verify', async (req: Request, res: Response) => {
  try {
    const reference = req.body.reference;

    if (!reference) {
      return res.status(400).json({ status: 'error', message: 'Reference is required' });
    }

    const data = await verifyTransaction(reference);
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error?.message || 'Verification failed' });
  }
});

router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const filters: Record<string, any> = req.query;
    const data = await listTransactions(filters);
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error?.message || 'Failed to list transactions' });
  }
});

router.post('/plans', async (req: Request, res: Response) => {
  try {
    const name = req.body.name;
    const amount = req.body.amount;
    const interval = req.body.interval;
    const description = req.body.description;

    if (!name || !amount || !interval) {
      return res.status(400).json({ status: 'error', message: 'Name, amount, and interval are required' });
    }

    const data = await createPlan(name, amount, interval, description);
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error?.message || 'Failed to create plan' });
  }
});

router.post('/subscriptions', async (req: Request, res: Response) => {
  try {
    const customerEmail = req.body.customerEmail;
    const planCode = req.body.planCode;

    if (!customerEmail || !planCode) {
      return res.status(400).json({ status: 'error', message: 'Customer email and plan code are required' });
    }

    const data = await createSubscription(customerEmail, planCode);
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error?.message || 'Failed to create subscription' });
  }
});

router.get('/subscriptions/:idOrCode', async (req: Request, res: Response) => {
  try {
    const idOrCode = req.params.idOrCode;
    const data = await getSubscription(idOrCode);
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error?.message || 'Failed to get subscription' });
  }
});

router.post('/subscriptions/:code/cancel', async (req: Request, res: Response) => {
  try {
    const code = req.params.code;
    const token = req.body.token;

    if (!code) {
      return res.status(400).json({ status: 'error', message: 'Code is required' });
    }

    const data = await cancelSubscription(code, token);
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error?.message || 'Failed to cancel subscription' });
  }
});

router.post('/webhook', (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const body = req.body;

    const eventData = processWebhook(signature as string, body);
    return res.status(200).json(eventData);
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error?.message || 'Failed to process webhook' });
  }
});

export default router;