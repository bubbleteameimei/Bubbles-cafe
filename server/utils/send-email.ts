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

    // Initialize the transporter if it hasn't been created yet
    if (!gmailTransporter) {
      gmailTransporter = getGmailTransporter();
    }

    await gmailTransporter.sendMail({
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
  const fromEmail = process.env.GMAIL_USER || 'vantalison@gmail.com';
  const siteName = 'Eden\'s Hollow';
  
  const subject = `Welcome to ${siteName}'s Newsletter`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h1 style="color: #2a2a2a; border-bottom: 2px solid #6c5ce7; padding-bottom: 10px;">Welcome to ${siteName}'s Newsletter</h1>
      
      <p>Thank you for subscribing to our newsletter! We're thrilled to have you join our community of horror enthusiasts.</p>
      
      <p>Here's what you can expect:</p>
      
      <ul style="padding-left: 20px;">
        <li>Exclusive horror stories delivered to your inbox</li>
        <li>Early access to new content</li>
        <li>Special announcements and events</li>
        <li>Community highlights and featured writers</li>
      </ul>
      
      <p>Your first newsletter will arrive soon. In the meantime, explore our latest stories on the website!</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #6c5ce7;">
        <p style="margin: 0;"><em>"In the darkness, we find the light of stories waiting to be told."</em></p>
      </div>
      
      <p>Happy reading,<br>The ${siteName} Team</p>
      
      <p style="font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px;">
        If you didn't subscribe to this newsletter, please ignore this email or 
        <a href="#" style="color: #6c5ce7;">click here to unsubscribe</a>.
      </p>
    </div>
  `;
  
  const text = `
Welcome to ${siteName}'s Newsletter!

Thank you for subscribing to our newsletter! We're thrilled to have you join our community of horror enthusiasts.

Here's what you can expect:
- Exclusive horror stories delivered to your inbox
- Early access to new content
- Special announcements and events
- Community highlights and featured writers

Your first newsletter will arrive soon. In the meantime, explore our latest stories on the website!

"In the darkness, we find the light of stories waiting to be told."

Happy reading,
The ${siteName} Team

If you didn't subscribe to this newsletter, please ignore this email.
  `;
  
  return await sendEmail({
    to: email,
    from: fromEmail,
    subject,
    text,
    html
  });
}