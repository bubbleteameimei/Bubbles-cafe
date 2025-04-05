/**
 * SendGrid Service
 * 
 * Functions for working with SendGrid email service.
 */

import nodemailer from 'nodemailer';
import logger from '../utils/logger';
import { EmailMessage, EmailResult } from './email-types';

/**
 * Check if SendGrid credentials are available
 * 
 * @returns Boolean indicating if API key is set
 */
function hasSendGridApiKey(): boolean {
  return !!process.env.SENDGRID_API_KEY;
}

/**
 * Create SendGrid transporter
 * 
 * @returns Nodemailer transporter configured for SendGrid
 */
export function createSendGridTransporter() {
  if (!hasSendGridApiKey()) {
    logger.warn('[Email] SendGrid API key not configured');
    throw new Error('SendGrid API key not configured');
  }
  
  return nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey', // This is literally the string 'apikey', not an environment variable
      pass: process.env.SENDGRID_API_KEY
    }
  });
}

/**
 * Check SendGrid service status
 * 
 * @returns Promise resolving to boolean indicating if service is available
 */
export async function checkSendGridStatus(): Promise<boolean> {
  try {
    if (!hasSendGridApiKey()) {
      logger.warn('[Email] SendGrid API key not configured');
      return false;
    }
    
    const transporter = createSendGridTransporter();
    const isVerified = await transporter.verify();
    
    logger.info('[Email] SendGrid service status check', {
      status: isVerified ? 'available' : 'unavailable',
    });
    
    return isVerified;
  } catch (error: any) {
    logger.error('[Email] Failed to verify SendGrid service', {
      error: error.message,
      stack: error.stack,
    });
    
    return false;
  }
}

/**
 * Send an email using SendGrid
 * 
 * @param message Email message to send
 * @returns Promise resolving to the result of the email send operation
 */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  try {
    if (!hasSendGridApiKey()) {
      throw new Error('SendGrid API key not configured');
    }
    
    const transporter = createSendGridTransporter();
    const result = await transporter.sendMail({
      from: message.from || process.env.SENDGRID_FROM || 'noreply@bubblescafe.com',
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      replyTo: message.replyTo,
      attachments: message.attachments
    });
    
    logger.info('[Email] Successfully sent email via SendGrid', {
      to: message.to,
      subject: message.subject,
      messageId: result.messageId
    });
    
    return {
      success: true,
      service: 'sendgrid',
      messageId: result.messageId,
      details: result
    };
  } catch (error: any) {
    logger.error('[Email] Failed to send email via SendGrid', {
      error: error.message,
      stack: error.stack
    });
    
    return {
      success: false,
      service: 'sendgrid',
      error: error
    };
  }
}