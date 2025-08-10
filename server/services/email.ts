/**
 * Email Service
 * 
 * Functions for sending emails using available providers.
 */

import { gmailTransporter } from './gmail';

// Email message interface
interface EmailMessage {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}

// Email result interface
interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: Error | null;
}

/**
 * Send email using available email services
 * @param message Email message to send
 * @returns Promise resolving to the result of the email send operation
 */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  try {
    if (!gmailTransporter) {
      console.warn('Email transporter not configured; skipping send.');
      return { success: false, error: new Error('Email transporter not configured') };
    }
    
    const result = await gmailTransporter.sendMail({
      from: message.from || process.env.GMAIL_USER || 'noreply@bubblescafe.com',
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html
    });
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}