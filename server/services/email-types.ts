/**
 * Email Service Type Definitions
 * 
 * This file contains TypeScript interfaces and types used by the email services.
 */

/**
 * Email Message
 * 
 * Common interface for email messages, used across all email service providers.
 */
export interface EmailMessage {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

/**
 * Email Attachment
 * 
 * Interface for email attachments.
 */
export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

/**
 * Email Result
 * 
 * Interface for the result of sending an email.
 */
export interface EmailResult {
  success: boolean;
  service: 'sendgrid' | 'mailersend' | 'none';
  messageId?: string;
  error?: Error | null;
  details?: any;
}

/**
 * MailerSend Recipient
 * 
 * Interface for MailerSend recipient format.
 */
export interface MailerSendRecipient {
  email: string;
  name?: string;
}

/**
 * MailerSend Email
 * 
 * Interface for MailerSend email request.
 */
export interface MailerSendEmail {
  from: {
    email: string;
    name?: string;
  };
  to: MailerSendRecipient[];
  reply_to?: MailerSendRecipient;
  subject: string;
  text?: string;
  html?: string;
  attachments?: {
    filename: string;
    content: string; // Base64 encoded
    disposition?: 'attachment' | 'inline';
    id?: string;
  }[];
}

/**
 * SendGrid Email
 * 
 * Interface for SendGrid email request.
 */
export interface SendGridEmail {
  personalizations: {
    to: {
      email: string;
      name?: string;
    }[];
    subject?: string;
  }[];
  from: {
    email: string;
    name?: string;
  };
  reply_to?: {
    email: string;
    name?: string;
  };
  subject: string;
  content: {
    type: 'text/plain' | 'text/html';
    value: string;
  }[];
  attachments?: {
    content: string; // Base64 encoded
    filename: string;
    type?: string;
    disposition?: 'attachment' | 'inline';
  }[];
}