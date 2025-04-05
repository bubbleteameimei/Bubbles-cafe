/**
 * Email Service
 * 
 * This module provides a unified interface for sending emails through multiple providers.
 * It attempts to send emails through SendGrid first, and falls back to MailerSend if that fails.
 */

import { EmailMessage, EmailResult } from './email-types';
import logger from '../utils/logger';
import * as sendgrid from './sendgrid';
import * as mailersend from './mailersend';

/**
 * Send an email with automatic fallback between providers
 * 
 * This function attempts to send an email through SendGrid first.
 * If that fails, it attempts to send through MailerSend.
 * 
 * @param emailMessage Email message to send
 * @returns Promise that resolves to result of sending the email
 */
export async function sendEmail(emailMessage: EmailMessage): Promise<EmailResult> {
  // Try SendGrid first
  try {
    logger.info('[Email] Attempting to send email via SendGrid');
    const result = await sendgrid.sendEmail(emailMessage);
    
    if (result.success) {
      logger.info('[Email] Successfully sent email via SendGrid');
      return result;
    }
    
    logger.warn('[Email] SendGrid failed, falling back to MailerSend', {
      error: result.error?.message
    });
  } catch (error: any) {
    logger.error('[Email] Error using SendGrid', {
      error: error.message,
      stack: error.stack,
    });
  }
  
  // If SendGrid fails, try MailerSend
  try {
    logger.info('[Email] Attempting to send email via MailerSend');
    const result = await mailersend.sendEmail(emailMessage);
    
    if (result.success) {
      logger.info('[Email] Successfully sent email via MailerSend (fallback)');
      return result;
    }
    
    logger.error('[Email] MailerSend failed', {
      error: result.error?.message
    });
    
    return {
      success: false,
      service: 'none',
      error: new Error('All email providers failed'),
    };
  } catch (error: any) {
    logger.error('[Email] Error using MailerSend', {
      error: error.message,
      stack: error.stack,
    });
    
    return {
      success: false,
      service: 'none',
      error: new Error(`All email providers failed: ${error.message}`),
    };
  }
}