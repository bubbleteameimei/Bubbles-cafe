import nodemailer from 'nodemailer';
import { createTransport } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Email service that provides methods to send various types of emails
 * with fallback options for reliability
 */
export class EmailService {
  private primaryTransporter: nodemailer.Transporter;
  private fallbackTransporter: nodemailer.Transporter;
  private readonly fromEmail: string;
  
  constructor() {
    // Set up MailerSend transporter (primary)
    // Using different configuration for MailerSend specifically
    this.primaryTransporter = createTransport({
      host: 'smtp.mailersend.net',
      port: 587,
      secure: false,
      auth: {
        user: 'api',
        pass: process.env.MAILERSEND_API_KEY || ''
      },
      debug: true, // Enable debug output
      logger: true, // Log information to the console      
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });
    
    // Set up Gmail fallback transporter (secondary)
    this.fallbackTransporter = createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER || '',
        pass: process.env.GMAIL_APP_PASSWORD || ''
      }
    });
    
    // Default from email - can be overridden in send method
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@bubblescafe.com';
  }
  
  /**
   * Sends an email using the primary transporter with fallback to secondary if needed
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    const { to, subject, text, html } = options;
    
    const mailOptions = {
      from: this.fromEmail,
      to,
      subject,
      text,
      html
    };
    
    try {
      // Try sending with MailerSend first
      console.log('[EmailService] Attempting to send email via MailerSend');
      await this.primaryTransporter.sendMail(mailOptions);
      console.log('[EmailService] Email sent successfully via MailerSend');
      return true;
    } catch (primaryError) {
      console.error('[EmailService] MailerSend failed:', primaryError);
      
      // Try Gmail as fallback
      try {
        console.log('[EmailService] Attempting to send via Gmail fallback');
        await this.fallbackTransporter.sendMail(mailOptions);
        console.log('[EmailService] Email sent successfully via Gmail fallback');
        return true;
      } catch (fallbackError) {
        console.error('[EmailService] Gmail fallback also failed:', fallbackError);
        return false;
      }
    }
  }
  
  /**
   * Sends a password reset email with token
   */
  async sendPasswordResetEmail(to: string, token: string, username: string): Promise<boolean> {
    const resetUrl = `${process.env.CLIENT_URL || ''}/reset-password?token=${token}`;
    
    const subject = 'Reset Your Password';
    
    const text = `
Hello ${username},

You recently requested to reset your password for your Bubble's Cafe account. Use the link below to reset it:

${resetUrl}

This password reset link is only valid for 1 hour.

If you did not request a password reset, please ignore this email or contact support if you have questions.

Thanks,
The Bubble's Cafe Team
`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    .content {
      padding: 20px 0;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      margin: 20px 0;
      background-color: #7c3aed;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
    }
    .button:hover {
      background-color: #6d28d9;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #888;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    .note {
      font-size: 13px;
      color: #666;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hello ${username},</p>
      <p>You recently requested to reset your password for your Bubble's Cafe account. Click the button below to reset it:</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset My Password</a>
      </div>
      <p class="note">If the button doesn't work, copy and paste this link into your browser: <br>
      <a href="${resetUrl}">${resetUrl}</a></p>
      <p>This password reset link is only valid for 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
      <p>Thanks,<br>The Bubble's Cafe Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;
    
    return this.sendEmail({
      to,
      subject,
      text,
      html
    });
  }
}

// Create a singleton instance for use throughout the application
export const emailService = new EmailService();