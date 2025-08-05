/**
 * Gmail Service
 * 
 * Functions for working with Gmail email service.
 */

import logger from '../utils/logger';
import nodemailer from 'nodemailer';

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
 * Test Gmail connection
 * @returns Promise<boolean> indicating if connection is successful
 */
export async function testGmailConnection(): Promise<boolean> {
  try {
    const transporter = createGmailTransporter();
    
    if (!transporter) {
      return false;
    }
    
    const isVerified = await transporter.verify();
    return isVerified;
  } catch (error) {
    console.error('[Gmail] Connection test failed:', error);
    return false;
  }
}