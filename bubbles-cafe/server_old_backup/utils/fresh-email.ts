import * as nodemailer from 'nodemailer';

/**
 * Send a completely fresh email with a new transporter
 * This bypasses any caching issues by using a completely different file
 */
export async function sendFreshNewsletter(email: string): Promise<boolean> {
  console.log('[FreshEmail] Sending completely fresh email to:', email);
  
  // Create a fresh transporter every time
  const fromEmail = process.env.GMAIL_USER || 'vantalison@gmail.com';
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER || 'vantalison@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD?.trim()
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  });

  // Add random ID to ensure uniqueness
  const randomId = Math.random().toString(36).substring(2, 15);
  
  // Subject line
  const subject = `Welcome to Bubble's Cafe Newsletter [${randomId}]`;
  
  // HTML version
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to Bubble's Cafe Newsletter</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #f9f7f4; border-radius: 12px; border: 1px solid #e8e1d9;">
    <h1 style="color: #5d4037; border-bottom: 2px solid #5d4037; padding-bottom: 10px; font-family: 'Georgia', serif; text-align: center;">Welcome to Bubble's Cafe Newsletter</h1>
    
    <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 20px;">
      <p style="font-size: 16px; line-height: 1.6;">Hi there,</p>
      
      <p style="font-size: 16px; line-height: 1.6;">We're delighted to welcome you to our corner of the internet where we explore storytelling through a darker lens.</p>
      
      <p style="font-size: 16px; line-height: 1.6;">At Bubble's Cafe, we share stories that might stay with you a while, for better or worse.</p>
    </div>
    
    <div style="background-color: #5d4037; color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h2 style="margin-top: 0; text-align: center; font-family: 'Georgia', serif;">What's Brewing in Your Inbox? ☕</h2>
      
      <ul style="padding-left: 20px; font-size: 16px; line-height: 1.6;">
        <li><strong>Fresh Stories:</strong> New tales delivered directly to you</li>
        <li><strong>Exclusive Content:</strong> Special features only for subscribers</li>
        <li><strong>Community Events:</strong> Join readings and discussions</li>
        <li><strong>Reading Tips:</strong> Ideas for creating the perfect reading atmosphere</li>
      </ul>
    </div>
    
    <div style="background-color: #f0e9e2; padding: 15px; margin: 20px 0; border-radius: 8px; font-style: italic; text-align: center; position: relative;">
      <p style="margin: 10px 0; font-size: 18px; line-height: 1.6; color: #5d4037;">"No great mind has ever existed without a touch of madness."</p>
      <p style="margin: 5px 0 0; font-size: 16px; color: #8d6e63; text-align: right;">— Aristotle</p>
    </div>
    
    <p style="font-size: 16px; line-height: 1.6; text-align: center;">Your first newsletter will arrive soon. Until then, brew yourself a cup and enjoy!</p>
    
    <div style="text-align: center; margin-top: 30px;">
      <p style="font-size: 16px; line-height: 1.6;">Happy reading,<br>The Bubble's Cafe Team</p>
    </div>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e8e1d9; font-size: 14px; color: #8d6e63; text-align: center;">
      <p>If you didn't subscribe to this newsletter, <a href="https://bubblescafe.replit.app/unsubscribe?email=${email}" style="color: #5d4037; text-decoration: underline;">unsubscribe here</a>.</p>
      <p>© ${new Date().getFullYear()} Bubble's Cafe • All Rights Reserved</p>
      <p>ID: ${randomId}</p>
    </div>
  </div>
</body>
</html>
  `;
  
  // Plain text version
  const text = `
WELCOME TO BUBBLE'S CAFE NEWSLETTER [${randomId}]

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
  
  try {
    await transporter.sendMail({
      from: {
        name: 'Bubble\'s Cafe',
        address: fromEmail
      },
      to: email,
      subject,
      text,
      html,
      headers: {
        'X-Priority': '1',
        'X-Fresh-Email': 'true',
        'X-Random-ID': randomId
      }
    });
    
    console.log('[FreshEmail] Successfully sent fresh email to:', email);
    return true;
  } catch (error) {
    console.error('[FreshEmail] Error sending fresh email:', error);
    return false;
  }
}