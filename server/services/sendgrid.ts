/**
 * SendGrid Service
 * 
 * This service provides email sending capabilities via the SendGrid API.
 * It uses the fetch API for making HTTP requests to avoid dependency issues.
 */

import { EmailMessage, EmailResult, SendGridEmail } from './email-types';
import logger from '../utils/logger';

// Configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const SENDGRID_API_URL = 'https://api.sendgrid.com/v3';
const DEFAULT_FROM_EMAIL = 'noreply@bubblescafe.com';
const DEFAULT_FROM_NAME = 'Bubble\'s Cafe';

/**
 * Send an email via SendGrid API
 * 
 * @param emailMessage Email message to send
 * @returns Promise that resolves to email result
 */
export async function sendEmail(emailMessage: EmailMessage): Promise<EmailResult> {
  try {
    const { to, subject, html, text, from, replyTo } = emailMessage;
    
    // Check if API key is available
    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key is not configured');
    }
    
    // Format recipients
    const recipients = Array.isArray(to)
      ? to.map(email => ({ email }))
      : [{ email: to }];
    
    // Prepare email data
    const emailData: SendGridEmail = {
      personalizations: [{ 
        to: recipients,
        subject, 
      }],
      from: {
        email: from || DEFAULT_FROM_EMAIL,
        name: DEFAULT_FROM_NAME,
      },
      subject,
      content: [],
    };
    
    // Add HTML or text content
    if (html) {
      emailData.content.push({
        type: 'text/html',
        value: html,
      });
    }
    
    if (text) {
      emailData.content.push({
        type: 'text/plain',
        value: text,
      });
    }
    
    // Add reply-to if provided
    if (replyTo) {
      emailData.reply_to = { email: replyTo };
    }
    
    // Send request to SendGrid API
    const response = await fetch(`${SENDGRID_API_URL}/mail/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify(emailData),
    });
    
    // Parse response
    let responseData: any = {};
    
    if (response.status !== 204 && response.headers.get('content-type')?.includes('application/json')) {
      responseData = await response.json();
    }
    
    // Check if response is successful (SendGrid returns 202 Accepted when successful)
    if (response.status !== 202 && response.status !== 204) {
      throw new Error(responseData.message || 'Failed to send email via SendGrid');
    }
    
    return {
      success: true,
      service: 'sendgrid',
      messageId: response.headers.get('X-Message-Id') || undefined,
      details: responseData,
    };
  } catch (error: any) {
    logger.error('[SendGrid] Error sending email', {
      error: error.message,
      stack: error.stack,
    });
    
    return {
      success: false,
      service: 'sendgrid',
      error,
    };
  }
}

/**
 * Check if SendGrid API is working properly
 * 
 * @returns Promise that resolves to true if SendGrid API is working
 */
export async function checkSendGridStatus(): Promise<boolean> {
  try {
    // Check if API key is available
    if (!SENDGRID_API_KEY) {
      logger.warn('[SendGrid] API key not configured');
      return false;
    }
    
    // Try to fetch scopes (lightweight API call to check auth)
    const response = await fetch(`${SENDGRID_API_URL}/scopes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      },
    });
    
    // If response is successful, SendGrid is working
    return response.ok;
  } catch (error: any) {
    logger.error('[SendGrid] Error checking status', {
      error: error.message,
      stack: error.stack,
    });
    
    return false;
  }
}