/**
 * MailerSend Service
 *
 * Functions for working with MailerSend email service.
 */
import fetch from 'node-fetch';
import logger from '../utils/logger';
/**
 * Check if MailerSend API key is available
 *
 * @returns Boolean indicating if API key is set
 */
function hasMailerSendApiKey() {
    return !!process.env.MAILERSEND_API_TOKEN;
}
/**
 * Check MailerSend service status
 *
 * @returns Promise resolving to boolean indicating if service is available
 */
export async function checkMailerSendStatus() {
    try {
        if (!hasMailerSendApiKey()) {
            logger.warn('[Email] MailerSend API token not configured');
            return false;
        }
        // Use MailerSend API to check service status
        const response = await fetch('https://api.mailersend.com/v1/health', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.MAILERSEND_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            logger.error('[Email] MailerSend health check failed', {
                status: response.status,
                statusText: response.statusText,
            });
            return false;
        }
        const data = await response.json();
        // Check if API response is valid and indicates service is healthy
        const isHealthy = data && data.health === 'ok';
        logger.info('[Email] MailerSend service status check', {
            status: isHealthy ? 'available' : 'unavailable',
            response: data,
        });
        return isHealthy;
    }
    catch (error) {
        logger.error('[Email] Failed to verify MailerSend service', {
            error: error.message,
            stack: error.stack,
        });
        return false;
    }
}
/**
 * Format recipient for MailerSend API
 *
 * @param recipient Recipient email or array of emails
 * @returns Array of MailerSend recipient objects
 */
function formatRecipients(recipient) {
    if (Array.isArray(recipient)) {
        return recipient.map(email => ({ email }));
    }
    return [{ email: recipient }];
}
/**
 * Format attachments for MailerSend API
 *
 * @param attachments Array of email attachments
 * @returns Array of MailerSend attachment objects or undefined
 */
function formatAttachments(attachments) {
    if (!attachments || !attachments.length) {
        return undefined;
    }
    return attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content.toString('base64'),
        disposition: 'attachment'
    }));
}
/**
 * Send an email using MailerSend
 *
 * @param message Email message to send
 * @returns Promise resolving to the result of the email send operation
 */
export async function sendEmail(message) {
    try {
        if (!hasMailerSendApiKey()) {
            throw new Error('MailerSend API key not configured');
        }
        // Create MailerSend email format
        const mailersendEmail = {
            from: {
                email: message.from || process.env.MAILERSEND_FROM || 'noreply@bubblescafe.com',
                name: 'Bubble\'s Cafe'
            },
            to: formatRecipients(message.to),
            subject: message.subject,
            text: message.text,
            html: message.html,
            attachments: formatAttachments(message.attachments)
        };
        if (message.replyTo) {
            mailersendEmail.reply_to = { email: message.replyTo };
        }
        // Send email using MailerSend API
        const response = await fetch('https://api.mailersend.com/v1/email', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MAILERSEND_API_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(mailersendEmail)
        });
        const data = await response.json();
        if (!response.ok) {
            logger.error('[Email] MailerSend API error', {
                status: response.status,
                statusText: response.statusText,
                data
            });
            return {
                success: false,
                service: 'mailersend',
                error: new Error(`MailerSend API error: ${data.message || response.statusText}`),
                details: data
            };
        }
        logger.info('[Email] Successfully sent email via MailerSend', {
            to: message.to,
            subject: message.subject,
            messageId: data.id
        });
        return {
            success: true,
            service: 'mailersend',
            messageId: data.id,
            details: data
        };
    }
    catch (error) {
        logger.error('[Email] Failed to send email via MailerSend', {
            error: error.message,
            stack: error.stack
        });
        return {
            success: false,
            service: 'mailersend',
            error,
            details: {
                message: error.message
            }
        };
    }
}
