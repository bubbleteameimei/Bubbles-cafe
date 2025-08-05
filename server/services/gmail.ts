/**
 * Gmail Service
 * 
 * Functions for working with Gmail email service.
 */

import logger from '../utils/logger';
import nodemailer from 'nodemailer';

// Gmail SMTP configuration
interface GmailConfig {
  user: string;
  pass: string;
}

/**
 * Check if Gmail credentials are available
 * @returns boolean indicating if credentials are properly configured
 */
export function hasGmailCredentials(): boolean {
  const user = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const pass = process.env.GMAIL_PASS || process.env.EMAIL_PASS;
  
  if (!user || !pass) {
    console.warn('[EmailService] Gmail credentials not configured. Email functionality will be limited.');
    return false;
  }
  
  return true;
}

/**
 * Create Gmail transporter with proper error handling
 * @returns nodemailer transporter or null if credentials missing
 */
export function createGmailTransporter() {
  if (!hasGmailCredentials()) {
    return null;
  }

  const user = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const pass = process.env.GMAIL_PASS || process.env.EMAIL_PASS;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user!,
      pass: pass!,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Check Gmail service status
 * 
 * @returns Promise resolving to boolean indicating if service is available
 */
export async function checkGmailStatus(): Promise<boolean> {
  try {
    if (!hasGmailCredentials()) {
      logger.warn('[Email] Gmail credentials not configured');
      return false;
    }
    
    const transporter = createGmailTransporter();
    const isVerified = await transporter.verify();
    
    logger.info('[Email] Gmail service status check', {
      status: isVerified ? 'available' : 'unavailable',
    });
    
    return isVerified;
  } catch (error: any) {
    logger.error('[Email] Failed to verify Gmail service', {
      error: error.message,
      stack: error.stack,
    });
    
    return false;
  }
}