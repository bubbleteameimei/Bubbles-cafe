/**
 * Email Routes
 * 
 * API routes for email functionality
 */

import { Router } from 'express';
import logger from '../utils/logger';
import { sendEmail } from '../services/email';
import { checkGmailStatus } from '../services/gmail';
import { checkSendGridStatus } from '../services/sendgrid';
import { checkMailerSendStatus } from '../services/mailersend';
import { isAdmin } from '../middlewares/auth';
import { EmailMessage } from '../services/email-types';

const router = Router();

/**
 * GET /api/email/status
 * 
 * Check the status of the email services
 * Admin-only endpoint
 */
router.get('/status', isAdmin, async (req, res) => {
  try {
    const gmail = await checkGmailStatus();
    const sendgrid = await checkSendGridStatus();
    const mailersend = await checkMailerSendStatus();
    
    res.json({
      success: true,
      services: {
        gmail,
        sendgrid,
        mailersend
      },
      primaryService: gmail ? 'gmail' : (sendgrid ? 'sendgrid' : (mailersend ? 'mailersend' : 'none'))
    });
  } catch (error: any) {
    logger.error('[Email] Error checking email service status', {
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to check email service status',
      error: error.message
    });
  }
});

/**
 * POST /api/email/test
 * 
 * Send a test email
 * Admin-only endpoint
 */
router.post('/test', isAdmin, async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email address is required'
      });
    }
    
    // Create email message
    const message: EmailMessage = {
      to,
      subject: subject || 'Test Email from Bubble\'s Cafe',
      text: text || 'This is a test email from Bubble\'s Cafe.',
      html: html || '<h1>Test Email</h1><p>This is a test email from Bubble\'s Cafe.</p>'
    };
    
    // Send the email
    const result = await sendEmail(message);
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      details: result
    });
  } catch (error: any) {
    logger.error('[Email] Error sending test email', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

export default router;