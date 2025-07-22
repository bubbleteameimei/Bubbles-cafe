import { createTransport } from 'nodemailer';

// Create a function to get the transporter with the latest environment variables
function getGmailTransporter() {
  console.log('[EmailService] Creating Gmail transporter with credentials:');
  console.log('[EmailService] User:', process.env.GMAIL_USER ? process.env.GMAIL_USER : 'Not set');
  console.log('[EmailService] Password:', process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Not set');
  
  return createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER || 'vantalison@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD?.trim()
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    pool: true,
    maxConnections: 3,
    maxMessages: 10,
    rateDelta: 1000,
    rateLimit: 5,
    tls: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2'
    }
  });
}

// This will be initialized when needed, not at import time
let gmailTransporter: ReturnType<typeof createTransport>;

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send an email using Gmail
 * @param params Email parameters
 * @returns A boolean indicating whether the email was sent successfully
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!process.env.GMAIL_APP_PASSWORD) {
      console.error('[EmailService] Cannot send email: Gmail app password is not set');
      return false;
    }

    // Always create a fresh transporter to use the latest environment variables
    // This ensures we always use the most up-to-date Gmail credentials
    const transporter = getGmailTransporter();

    await transporter.sendMail({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    
    console.log(`[EmailService] Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('[EmailService] Error sending email:', error);
    return false;
  }
}

/**
 * Send a welcome email to a new newsletter subscriber
 * @param email The subscriber's email address
 * @returns A boolean indicating whether the email was sent successfully
 */
export async function sendNewsletterWelcomeEmail(email: string): Promise<boolean> {
  // Always create a new timestamp to ensure the template is refreshed
  const timestamp = new Date().toISOString();
  
  // Add random ID to ensure uniqueness and bypass caching
  const randomId = Math.random().toString(36).substring(2, 15);
  
  const fromEmail = process.env.GMAIL_USER || 'vantalison@gmail.com';
  const siteName = 'Bubble\'s Cafe';
  
  // SIMPLIFIED TITLE AS REQUESTED WITH RANDOM ID TO PREVENT CACHING
  const subject = `Welcome to Bubble's Cafe Newsletter [${randomId}]`;
  
  // COMPLETELY REDESIGNED TEMPLATE WITH TIMESTAMP TO FORCE UPDATE
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Bubble's Cafe Newsletter</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Georgia', serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #f9f7f4; border-radius: 12px; border: 1px solid #e8e1d9;">
        
        <!-- SIMPLIFIED HEADER AS REQUESTED -->
        <h1 style="color: #5d4037; border-bottom: 2px solid #5d4037; padding-bottom: 10px; font-family: 'Georgia', serif; text-align: center;">Welcome to Bubble's Cafe Newsletter</h1>
        
        <!-- WELCOME SECTION -->
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 20px;">
          <p style="font-size: 16px; line-height: 1.6;">Hi there,</p>
          
          <p style="font-size: 16px; line-height: 1.6;">We're delighted to welcome you to our corner of the internet where we explore storytelling through a darker lens.</p>
          
          <p style="font-size: 16px; line-height: 1.6;">At Bubble's Cafe, we share stories that might stay with you a while, for better or worse.</p>
        </div>
        
        <!-- BENEFITS SECTION -->
        <div style="background-color: #5d4037; color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; text-align: center; font-family: 'Georgia', serif;">What's Brewing in Your Inbox? ☕</h2>
          
          <ul style="padding-left: 20px; font-size: 16px; line-height: 1.6;">
            <li><strong>Fresh Stories:</strong> New tales delivered directly to you</li>
            <li><strong>Exclusive Content:</strong> Special features only for subscribers</li>
            <li><strong>Community Events:</strong> Join readings and discussions</li>
            <li><strong>Reading Tips:</strong> Ideas for creating the perfect reading atmosphere</li>
          </ul>
        </div>
        
        <!-- QUOTE SECTION -->
        <div style="background-color: #f0e9e2; padding: 15px; margin: 20px 0; border-radius: 8px; font-style: italic; text-align: center; position: relative;">
          <p style="margin: 10px 0; font-size: 18px; line-height: 1.6; color: #5d4037;">"No great mind has ever existed without a touch of madness."</p>
          <p style="margin: 5px 0 0; font-size: 16px; color: #8d6e63; text-align: right;">— Aristotle</p>
        </div>
        
        <!-- SIGN OFF -->
        <p style="font-size: 16px; line-height: 1.6; text-align: center;">Your first newsletter will arrive soon. Until then, brew yourself a cup and enjoy!</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="font-size: 16px; line-height: 1.6;">Happy reading,<br>The Bubble's Cafe Team</p>
        </div>
        
        <!-- FOOTER -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e8e1d9; font-size: 14px; color: #8d6e63; text-align: center;">
          <p>If you didn't subscribe to this newsletter, <a href="https://bubblescafe.replit.app/unsubscribe?email=${email}" style="color: #5d4037; text-decoration: underline;">unsubscribe here</a>.</p>
          <p>© ${new Date().getFullYear()} Bubble's Cafe • All Rights Reserved</p>
          <p>ID: ${randomId}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // SIMPLIFIED TEXT VERSION
  const text = `
WELCOME TO BUBBLE'S CAFE NEWSLETTER

Hi there,

We're delighted to welcome you to our corner of the internet where we explore storytelling through a darker lens.

At Bubble's Cafe, we share stories that might stay with you a while, for better or worse.

WHAT'S BREWING IN YOUR INBOX?
- Fresh Stories: New tales delivered directly to you
- Exclusive Content: Special features only for subscribers
- Community Events: Join readings and discussions
- Reading Tips: Ideas for creating the perfect reading atmosphere

"No great mind has ever existed without a touch of madness." - Aristotle

Your first newsletter will arrive soon. Until then, brew yourself a cup and enjoy!

Happy reading,
The Bubble's Cafe Team

---
If you didn't subscribe to this newsletter, you can unsubscribe by visiting:
https://bubblescafe.replit.app/unsubscribe?email=${email}

© ${new Date().getFullYear()} Bubble's Cafe • All Rights Reserved
ID: ${randomId}
  `;
  
  // Create a fresh transporter for each email sent
  const transporter = getGmailTransporter();
  
  try {
    const result = await transporter.sendMail({
      from: {
        name: 'Bubble\'s Cafe',
        address: fromEmail
      },
      to: email,
      subject,
      text,
      html,
      headers: {
        'X-Generated-At': timestamp, // Add timestamp header to ensure uniqueness
        'X-Priority': '1',
        'X-Random-ID': randomId,
        'X-Fresh-Email': 'true',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('[EmailService] Email sent successfully to', email);
    return true;
  } catch (error) {
    console.error('[EmailService] Error sending newsletter email:', error);
    return false;
  }
}