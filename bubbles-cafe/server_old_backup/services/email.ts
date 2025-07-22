/**
 * Email Service
 * 
 * Functions for sending emails using available providers.
 */

import nodemailer from 'nodemailer';
import logger from '../utils/logger';
import { createGmailTransporter } from './gmail';
import * as sendgrid from './sendgrid';
import * as mailersend from './mailersend';
import { EmailMessage, EmailResult } from './email-types';

/**
 * Send an email using the available email providers
 * 
 * Will try Gmail first, then SendGrid, then MailerSend
 * 
 * @param message Email message to send
 * @returns Promise resolving to the result of the email send operation
 */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  // Gmail (primary)
  try {
    const transporter = createGmailTransporter();
    const result = await transporter.sendMail({
      from: message.from || process.env.GMAIL_USER || 'noreply@bubblescafe.com',
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      replyTo: message.replyTo,
      attachments: message.attachments
    });
    
    logger.info('[Email] Successfully sent email via Gmail', {
      to: message.to,
      subject: message.subject,
      messageId: result.messageId
    });
    
    return {
      success: true,
      service: 'gmail' as const,
      messageId: result.messageId,
      details: result
    };
  } catch (gmailError: any) {
    logger.warn('[Email] Failed to send email via Gmail, trying SendGrid', {
      error: gmailError.message,
      stack: gmailError.stack
    });
    
    // SendGrid (secondary)
    try {
      // Use the sendEmail function from the SendGrid service
      return await sendgrid.sendEmail(message);
    } catch (sendgridError: any) {
      logger.warn('[Email] Failed to send email via SendGrid, trying MailerSend', {
        error: sendgridError.message,
        stack: sendgridError.stack
      });
      
      // MailerSend (final fallback)
      try {
        // Use the sendEmail function from the MailerSend service
        return await mailersend.sendEmail(message);
      } catch (mailersendError: any) {
        logger.error('[Email] All email providers failed', {
          gmailError: gmailError.message,
          sendgridError: sendgridError.message,
          mailersendError: mailersendError.message
        });
        
        return {
          success: false,
          service: 'none',
          error: new Error('All email providers failed'),
          details: {
            gmailError,
            sendgridError,
            mailersendError
          }
        };
      }
    }
  }
}