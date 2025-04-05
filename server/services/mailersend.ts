/**
 * MailerSend Service
 * 
 * This service provides email sending capabilities via the MailerSend API.
 * It uses fetch API for making HTTP requests to avoid dependency issues.
 */

import { EmailMessage, EmailResult, MailerSendEmail, MailerSendRecipient } from './email-types';
import logger from '../utils/logger';

// Configuration
const MAILERSEND_API_KEY = process.env.MAILERSEND_API_TOKEN || '';
const MAILERSEND_API_URL = 'https://api.mailersend.com/v1';
const DEFAULT_FROM_EMAIL = 'noreply@bubblescafe.com';
const DEFAULT_FROM_NAME = 'Bubble\'s Cafe';

/**
 * Send a simple email via MailerSend API
 * 
 * @param to Recipient email(s)
 * @param subject Email subject
 * @param content Email content (HTML or plain text)
 * @param isHtml Whether the content is HTML or plain text
 * @returns Promise that resolves to response from MailerSend API
 */
export async function sendSimpleEmail(
  to: string | string[],
  subject: string,
  content: string,
  isHtml: boolean = true
): Promise<EmailResult> {
  try {
    // Check if API key is available
    if (!MAILERSEND_API_KEY) {
      throw new Error('MailerSend API key is not configured');
    }

    // Format recipients
    const recipients = Array.isArray(to)
      ? to.map(email => ({ email }))
      : [{ email: to }] as MailerSendRecipient[];

    // Prepare email data
    const emailData: MailerSendEmail = {
      from: {
        email: DEFAULT_FROM_EMAIL,
        name: DEFAULT_FROM_NAME,
      },
      to: recipients,
      subject,
      ...(isHtml ? { html: content } : { text: content }),
    };

    // Send request to MailerSend API
    const response = await fetch(`${MAILERSEND_API_URL}/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERSEND_API_KEY}`,
      },
      body: JSON.stringify(emailData),
    });

    // Parse response
    const responseData = await response.json();

    // Check if response is successful
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to send email via MailerSend');
    }

    return {
      success: true,
      service: 'mailersend',
      messageId: responseData.message_id || undefined,
      details: responseData,
    };
  } catch (error: any) {
    logger.error('[MailerSend] Error sending email', {
      error: error.message,
      stack: error.stack,
    });
    
    return {
      success: false,
      service: 'mailersend',
      error,
    };
  }
}

/**
 * Send an email via MailerSend API
 * 
 * @param emailMessage Email message to send
 * @returns Promise that resolves to email result
 */
export async function sendEmail(emailMessage: EmailMessage): Promise<EmailResult> {
  try {
    const { to, subject, html, text, from, replyTo } = emailMessage;
    
    // Check if API key is available
    if (!MAILERSEND_API_KEY) {
      throw new Error('MailerSend API key is not configured');
    }
    
    // Format recipients
    const recipients = Array.isArray(to)
      ? to.map(email => ({ email }))
      : [{ email: to }] as MailerSendRecipient[];
    
    // Prepare email data
    const emailData: MailerSendEmail = {
      from: {
        email: from || DEFAULT_FROM_EMAIL,
        name: DEFAULT_FROM_NAME,
      },
      to: recipients,
      subject,
    };
    
    // Add HTML or text content
    if (html) {
      emailData.html = html;
    }
    
    if (text) {
      emailData.text = text;
    }
    
    // Add reply-to if provided
    if (replyTo) {
      emailData.reply_to = { email: replyTo };
    }
    
    // Send request to MailerSend API
    const response = await fetch(`${MAILERSEND_API_URL}/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERSEND_API_KEY}`,
      },
      body: JSON.stringify(emailData),
    });
    
    // Parse response
    const responseData = await response.json();
    
    // Check if response is successful
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to send email via MailerSend');
    }
    
    return {
      success: true,
      service: 'mailersend',
      messageId: responseData.message_id || undefined,
      details: responseData,
    };
  } catch (error: any) {
    logger.error('[MailerSend] Error sending email', {
      error: error.message,
      stack: error.stack,
    });
    
    return {
      success: false,
      service: 'mailersend',
      error,
    };
  }
}

/**
 * Check if MailerSend API is working properly
 * 
 * @returns Promise that resolves to true if MailerSend API is working
 */
export async function checkMailerSendStatus(): Promise<boolean> {
  try {
    // Check if API key is available
    if (!MAILERSEND_API_KEY) {
      logger.warn('[MailerSend] API key not configured');
      return false;
    }
    
    // Try to fetch domains (lightweight API call to check auth)
    const response = await fetch(`${MAILERSEND_API_URL}/domains`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MAILERSEND_API_KEY}`,
      },
    });
    
    // If response is successful, MailerSend is working
    return response.ok;
  } catch (error: any) {
    logger.error('[MailerSend] Error checking status', {
      error: error.message,
      stack: error.stack,
    });
    
    return false;
  }
}