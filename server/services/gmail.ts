/**
 * Gmail Service
 * 
 * Functions for working with Gmail email service.
 */

import nodemailer from 'nodemailer';

// Gmail configuration
const GMAIL_USER = process.env.GMAIL_USER || process.env.EMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

// Create Gmail transporter
function createGmailTransporter() {
  if (!GMAIL_USER || !GMAIL_PASS) {
    console.warn('Gmail credentials not configured');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS
    }
  });
}

// Verify Gmail configuration
export async function verifyGmailConfig(): Promise<boolean> {
  try {
    const transporter = createGmailTransporter();
    if (!transporter) {
      return false;
    }
    
    const isVerified = await transporter.verify();
    return isVerified;
  } catch (error) {
    console.error('Gmail configuration verification failed:', error);
    return false;
  }
}

// Export the transporter for use in other modules
export const gmailTransporter = createGmailTransporter();

export async function checkGmailStatus(): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
    
    // Test the connection
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Gmail service check failed:', error);
    return false;
  }
}