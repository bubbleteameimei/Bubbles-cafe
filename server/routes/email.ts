/**
 * Email Routes
 * 
 * API endpoints for sending emails and checking email service status.
 */

import { Router } from 'express';
import logger from '../utils/logger';
import { sendEmail } from '../services/email';
import { checkMailerSendStatus } from '../services/mailersend';
import { checkSendGridStatus } from '../services/sendgrid';
import { isAdmin } from '../middlewares/auth';

const router = Router();

/**
 * Send an email
 * 
 * POST /api/email/send
 * 
 * Request body: {
 *   to: string | string[],
 *   subject: string,
 *   text?: string,
 *   html?: string,
 *   replyTo?: string
 * }
 * 
 * Response: {
 *   success: boolean,
 *   message: string
 * }
 */
router.post('/send', isAdmin, async (req, res) => {
  try {
    const { to, subject, text, html, replyTo } = req.body;
    
    // Basic validation
    if (!to) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipient (to) is required' 
      });
    }
    
    if (!subject) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject is required' 
      });
    }
    
    if (!text && !html) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email body (text or html) is required' 
      });
    }
    
    // Send the email
    const result = await sendEmail({
      to,
      subject,
      ...(text && { text }),
      ...(html && { html }),
      ...(replyTo && { replyTo }),
    });
    
    // Log success
    logger.info(`[Email] Successfully sent email to ${Array.isArray(to) ? to.join(', ') : to}`, {
      subject,
      service: result.service,
    });
    
    return res.status(200).json({
      success: true,
      message: `Email sent successfully via ${result.service}`,
      service: result.service,
    });
  } catch (error: any) {
    logger.error('[Email] Failed to send email', {
      error: error.message,
      stack: error.stack,
    });
    
    return res.status(500).json({
      success: false,
      message: `Failed to send email: ${error.message}`,
    });
  }
});

/**
 * Check email service status
 * 
 * GET /api/email/status
 * 
 * Response: {
 *   sendgrid: boolean,
 *   mailersend: boolean
 * }
 */
router.get('/status', isAdmin, async (_req, res) => {
  try {
    // Check status of both email providers
    const [sendgridStatus, mailersendStatus] = await Promise.allSettled([
      checkSendGridStatus(),
      checkMailerSendStatus()
    ]);
    
    return res.status(200).json({
      sendgrid: sendgridStatus.status === 'fulfilled' ? sendgridStatus.value : false,
      mailersend: mailersendStatus.status === 'fulfilled' ? mailersendStatus.value : false,
    });
  } catch (error: any) {
    logger.error('[Email] Failed to check email services status', {
      error: error.message,
      stack: error.stack,
    });
    
    return res.status(500).json({
      success: false,
      message: `Failed to check email services: ${error.message}`,
    });
  }
});

export default router;