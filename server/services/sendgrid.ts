/**
 * SendGrid Service
 * 
 * Functions for working with SendGrid email service.
 */

import sgMail from '@sendgrid/mail';

// SendGrid configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

// Check if SendGrid is configured
export function hasSendGridConfig(): boolean {
  return !!SENDGRID_API_KEY;
}

// Initialize SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// Send email via SendGrid
export async function sendEmail(message: {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured');
    }

    const msg: any = {
      to: message.to,
      from: message.from || process.env.SENDGRID_FROM || 'noreply@bubblescafe.com',
      subject: message.subject
    };

    if (message.text) {
      msg.text = message.text;
    }

    if (message.html) {
      msg.html = message.html;
    }

    const response = await sgMail.send(msg);
    
    return {
      success: true,
      messageId: response[0]?.headers['x-message-id'] || 'unknown'
    };
  } catch (error) {
    console.error('SendGrid email sending failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}