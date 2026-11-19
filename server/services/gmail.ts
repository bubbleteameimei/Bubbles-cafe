/**
 * Gmail Service
 * 
 * Functions for working with Gmail email service.
 */

import nodemailer from 'nodemailer';
import logger from '../utils/logger';

/**
 * Check if Gmail credentials are available
 * 
 * @returns Boolean indicating if credentials are set
 */
// Accept both naming schemes: GMAIL_USER/GMAIL_PASS (original) and
// GMAIL_ADMIN_EMAIL/GMAIL_APP_PASSWORD (what render.yaml configures).
export function getGmailUser(): string | undefined {
  return process.env.GMAIL_USER || process.env.GMAIL_ADMIN_EMAIL || undefined;
}

function getGmailPass(): string | undefined {
  return process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD || undefined;
}

function hasGmailCredentials(): boolean {
  return !!(getGmailUser() && getGmailPass());
}

/**
 * Create Gmail transporter
 * 
 * @returns Nodemailer transporter configured for Gmail
 */
export function createGmailTransporter() {
  if (!hasGmailCredentials()) {
    logger.warn('[Email] Gmail credentials not configured');
    throw new Error('Gmail credentials not configured');
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: getGmailUser(),
      pass: getGmailPass()
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