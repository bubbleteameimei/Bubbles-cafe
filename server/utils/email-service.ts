import * as nodemailer from 'nodemailer';
import { SendMailOptions } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

type MailPriority = 'high' | 'normal' | 'low';

/**
 * Email service optimized for Gmail that provides methods to send
 * account-related emails with improved reliability
 */
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly fromEmail: string;
  private isReady: boolean = false;
  
  constructor() {
    const user = process.env.GMAIL_USER || '';
    const pass = process.env.GMAIL_APP_PASSWORD || '';
    
    // Set up Gmail transporter with optimized settings
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      connectionTimeout: 10000, // 10 seconds timeout for connections
      greetingTimeout: 5000,    // 5 seconds timeout for SMTP greeting
      socketTimeout: 15000,     // 15 seconds timeout for socket operations
      tls: {
        rejectUnauthorized: true, // Security: reject unauthorized TLS/SSL connections
        minVersion: 'TLSv1.2'     // Enforce modern TLS standards
      }
    });
    
    // Default from email
    this.fromEmail = user || 'noreply@bubblescafe.com';
    
    // Verify connection configuration
    if (user && pass) {
      this.isReady = true;
      console.log('[EmailService] Gmail service initialized with credentials');
    } else {
      console.warn('[EmailService] Warning: Gmail credentials missing or incomplete');
    }
  }
  
  /**
   * Sends an email with retry logic for improved reliability
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    // Validate email service is properly configured
    if (!this.isReady) {
      console.error('[EmailService] Cannot send email: service not properly configured');
      return false;
    }
    
    const { to, subject, text, html } = options;
    
    const mailOptions: SendMailOptions = {
      from: {
        name: 'Bubble\'s Cafe',
        address: this.fromEmail
      },
      to,
      subject,
      text,
      html,
      priority: 'high' // Using proper type from SendMailOptions
    };
    
    // Maximum retry attempts
    const MAX_RETRIES = 2;
    
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`[EmailService] Retry attempt ${attempt}/${MAX_RETRIES}`);
          // Exponential backoff between retries
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
        
        console.log(`[EmailService] Sending email to: ${to}, subject: ${subject}`);
        const result = await this.transporter.sendMail(mailOptions);
        
        // Log success details - messageId may not be available in all nodemailer transporters
        if (result && typeof result === 'object') {
          const messageId = result.messageId || 'unknown';
          console.log(`[EmailService] Email sent successfully: ${messageId}`);
        } else {
          console.log(`[EmailService] Email sent successfully`);
        }
        
        return true;
      } catch (error) {
        console.error(`[EmailService] Error sending email (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`, error);
        
        // Only return false if we've exhausted all retry attempts
        if (attempt === MAX_RETRIES) {
          console.error('[EmailService] All retry attempts failed');
          return false;
        }
      }
    }
    
    return false; // Fallback return (should never reach here due to the loop structure)
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
    /* Base styles with mobile-first approach */
    body {
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding: 25px 0;
      border-bottom: 1px solid #eeeeee;
    }
    .header h1 {
      margin: 0;
      color: #222222;
      font-size: 24px;
    }
    .content {
      padding: 25px 15px;
    }
    /* Enhanced button styles */
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #7c3aed;
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 2px 4px rgba(124,58,237,0.2);
      border: none;
      cursor: pointer;
    }
    /* Time indicator */
    .timer {
      text-align: center;
      margin: 25px 0;
      color: #666666;
      font-size: 15px;
    }
    /* Link fallback container */
    .link-fallback {
      background-color: #f9f9f9;
      border: 1px solid #eeeeee;
      border-radius: 5px;
      padding: 12px;
      margin: 20px 0;
      word-break: break-all;
    }
    .link-fallback a {
      color: #7c3aed;
      text-decoration: none;
    }
    /* Footer styling */
    .footer {
      text-align: center;
      font-size: 13px;
      color: #999999;
      padding-top: 20px;
      border-top: 1px solid #eeeeee;
    }
    /* Mobile optimizations */
    @media only screen and (max-width: 480px) {
      .container {
        width: 100% !important;
        border-radius: 0;
      }
      .button {
        display: block;
        width: 100%;
        box-sizing: border-box;
      }
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
      <p>You recently requested to reset your password for your Bubble's Cafe account. Please use the secure button below to set a new password.</p>
      
      <div class="button-container">
        <a href="${resetUrl}" class="button">Reset My Password</a>
      </div>
      
      <div class="timer">
        ⏱️ This reset link will expire in 1 hour for security
      </div>
      
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <div class="link-fallback">
        <a href="${resetUrl}">${resetUrl}</a>
      </div>
      
      <p>If you didn't request a password reset, you can safely ignore this email. No changes will be made to your account.</p>
      
      <p>Thanks,<br>The Bubble's Cafe Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} Bubble's Cafe</p>
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