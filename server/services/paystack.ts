/**
 * Paystack Payment Service
 * 
 * This service handles all Paystack payment integrations for the platform.
 * It's the only monetization method allowed in the system.
 */
import { config } from '../config';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { logger } from '../utils/debug-logger';

// Use proper types for fetch Response
type FetchResponse = Awaited<ReturnType<typeof fetch>>;

/**
 * Configuration for Paystack API
 */
const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const SECRET_KEY = config.PAYSTACK_SECRET_KEY;

if (!SECRET_KEY) {
  logger.warn('Paystack secret key not configured');
}

/**
 * Common headers for Paystack API requests
 */
const getHeaders = () => ({
  'Authorization': `Bearer ${SECRET_KEY}`,
  'Content-Type': 'application/json',
});

/**
 * Error handling middleware for Paystack API calls
 */
const handlePaystackResponse = async (response: FetchResponse) => {
  if (!response.ok) {
    const errorData = await response.json();
    console.error('[PAYSTACK] API Error:', errorData);
    throw new Error((errorData as any).message || 'Failed to complete Paystack operation');
  }
  return response.json();
};

/**
 * Initialize a new transaction
 */
export const initializeTransaction = async (data: {
  email: string;
  amount: number; // In kobo (smallest currency unit)
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}) => {
  try {
    if (!SECRET_KEY) {
      throw new Error('Paystack configuration missing');
    }

    console.log('[PAYSTACK] Initializing transaction for:', data.email, 'Amount:', data.amount);

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handlePaystackResponse(response);
    const data_result = result as any;
    console.log(`[PAYSTACK] Transaction initialized successfully. Reference: ${data_result.data?.reference}`);
    
    return result;
  } catch (error) {
    console.error('[PAYSTACK] Transaction initialization failed:', error);
    throw error;
  }
};

/**
 * Verify a transaction
 */
export const verifyTransaction = async (reference: string) => {
  try {
    if (!SECRET_KEY) {
      throw new Error('Paystack configuration missing');
    }

    console.log('[PAYSTACK] Verifying transaction:', reference);

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const result = await handlePaystackResponse(response);
    const data_result = result as any;
    console.log(`[PAYSTACK] Transaction verification status: ${data_result.data?.status}`);
    
    return result;
  } catch (error) {
    console.error('[PAYSTACK] Transaction verification failed:', error);
    throw error;
  }
};

/**
 * List all transactions
 */
export const listTransactions = async (params: {
  perPage?: number;
  page?: number;
  customer?: string;
  status?: string;
  from?: string;
  to?: string;
} = {}) => {
  try {
    if (!SECRET_KEY) {
      throw new Error('Paystack configuration missing');
    }

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    const url = `${PAYSTACK_BASE_URL}/transaction?${queryParams.toString()}`;
    console.log('[PAYSTACK] Fetching transactions from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    const result = await handlePaystackResponse(response);
    const data_result = result as any;
    console.log(`[PAYSTACK] Retrieved ${data_result.data?.length || 0} transactions`);
    
    return result;
  } catch (error) {
    console.error('[PAYSTACK] Failed to fetch transactions:', error);
    throw error;
  }
};

/**
 * Create a plan for subscriptions
 */
export const createPlan = async (data: {
  name: string;
  interval: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually';
  amount: number; // In kobo
  description?: string;
  currency?: string;
}) => {
  try {
    if (!SECRET_KEY) {
      throw new Error('Paystack configuration missing');
    }

    console.log('[PAYSTACK] Creating plan:', data.name);

    const response = await fetch(`${PAYSTACK_BASE_URL}/plan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        ...data,
        currency: data.currency || 'NGN',
      }),
    });

    const result = await handlePaystackResponse(response);
    const data_result = result as any;
    console.log(`[PAYSTACK] Plan created successfully. ID: ${data_result.data?.id}`);
    
    return result;
  } catch (error) {
    console.error('[PAYSTACK] Plan creation failed:', error);
    throw error;
  }
};

/**
 * Create a subscription
 */
export const createSubscription = async (data: {
  customer: string;
  plan: string;
  authorization?: string;
  start_date?: string;
}) => {
  try {
    if (!SECRET_KEY) {
      throw new Error('Paystack configuration missing');
    }

    console.log('[PAYSTACK] Creating subscription for customer:', data.customer);

    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handlePaystackResponse(response);
    const data_result = result as any;
    console.log(`[PAYSTACK] Subscription created successfully. ID: ${data_result.data?.id}`);
    
    return result;
  } catch (error) {
    console.error('[PAYSTACK] Subscription creation failed:', error);
    throw error;
  }
};

/**
 * Create a customer
 */
export const createCustomer = async (data: {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  metadata?: Record<string, any>;
}) => {
  try {
    if (!SECRET_KEY) {
      throw new Error('Paystack configuration missing');
    }

    console.log('[PAYSTACK] Creating customer:', data.email);

    const response = await fetch(`${PAYSTACK_BASE_URL}/customer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handlePaystackResponse(response);
    
    return result;
  } catch (error) {
    console.error('[PAYSTACK] Customer creation failed:', error);
    throw error;
  }
};

/**
 * Fetch a customer
 */
export const fetchCustomer = async (emailOrCode: string) => {
  try {
    if (!SECRET_KEY) {
      throw new Error('Paystack configuration missing');
    }

    console.log('[PAYSTACK] Fetching customer:', emailOrCode);

    const response = await fetch(`${PAYSTACK_BASE_URL}/customer/${emailOrCode}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const result = await handlePaystackResponse(response);
    
    return result;
  } catch (error) {
    console.error('[PAYSTACK] Failed to fetch customer:', error);
    throw error;
  }
};

/**
 * Generate a unique reference for transactions
 */
export const generateReference = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `TXN_${timestamp}_${random}`.toUpperCase();
};

/**
 * Process webhook (validate signature and return parsed body)
 */
export const processWebhook = (body: any) => {
  // Note: Signature validation should be implemented here using the webhook secret
  // For now, just return the parsed body
  console.log('[PAYSTACK] Processing webhook:', body?.event);
  return body;
};

/**
 * Validate webhook signature
 */
export const validateWebhookSignature = (body: string, signature: string): boolean => {
  if (!config.PAYSTACK_WEBHOOK_SECRET) {
    console.warn('[PAYSTACK] Webhook secret not configured');
    return false;
  }

  try {
    const hash = crypto
      .createHmac('sha512', config.PAYSTACK_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    return hash === signature;
  } catch (error) {
    console.error('[PAYSTACK] Webhook signature validation failed:', error);
    return false;
  }
};