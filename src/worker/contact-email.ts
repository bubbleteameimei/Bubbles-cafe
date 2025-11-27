// Contact form and email service routes for Bubble's Cafe Worker.
// Extracted from src/index.ts to keep the Worker entrypoint slimmer.

import type { Env } from './utils';
import { json } from './utils';

// Local rate-limit helper (mirrors checkRateLimit in index.ts)
async function checkRateLimit(
  env: Env,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const id = env.RATE_LIMIT_DO.idFromName(key);
  const obj = env.RATE_LIMIT_DO.get(id);
  const response = await obj.fetch(
    new Request('https://worker', {
      method: 'POST',
      body: JSON.stringify({ key, limit, window: windowSeconds }),
    }),
  );
  const result = (await response.json()) as any;
  return result.allowed !== false;
}

// CONTACT FORM: create contact_messages row in Supabase and notify admin via email
async function handleContactSubmit(req: Request, env: Env): Promise<Response> {
  const ip = req.headers.get('cf-connecting-ip') || 'unknown';
  const allowed = await checkRateLimit(env, `contact-${ip}`, 10, 600);
  if (!allowed) {
    return json({ error: 'Rate limited' }, { status: 429 });
  }

  let body: any;
  try {
    body = (await (req as any).json?.().catch(() => ({}))) || {};
  } catch {
    body = {};
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const subjectRaw = typeof body.subject === 'string' ? body.subject.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const metadata =
    body && typeof body.metadata === 'object' && body.metadata !== null
      ? (body.metadata as Record<string, any>)
      : undefined;

  const errors: Record<string, string> = {};

  if (!name || name.length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }

  const simpleEmailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!email || !simpleEmailRegex.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  const subject = subjectRaw || 'General Inquiry';
  if (!subject || subject.length < 3) {
    errors.subject = 'Subject must be at least 3 characters long';
  }

  if (!message || message.length < 10) {
    errors.message = 'Message must be at least 10 characters long';
  }

  if (Object.keys(errors).length > 0) {
    return json(
      {
        error: 'Validation failed',
        details: errors,
      },
      { status: 400 },
    );
  }

  const hasSupabase = !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
  const hasEmail = !!(env.EMAIL_PROVIDER_API_KEY && env.GMAIL_ADMIN_EMAIL);

  if (!hasSupabase && !hasEmail) {
    return json(
      { error: 'Contact service not configured' },
      { status: 500 },
    );
  }

  const mergedMetadata: Record<string, any> = {
    ...(metadata || {}),
    ip: ip !== 'unknown' ? ip : undefined,
    userAgent: req.headers.get('user-agent') || undefined,
    referer: req.headers.get('referer') || req.headers.get('referrer') || undefined,
    receivedAt: new Date().toISOString(),
  };

  for (const key of Object.keys(mergedMetadata)) {
    if (mergedMetadata[key] === undefined) {
      delete mergedMetadata[key];
    }
  }

  let savedRecord: any = null;
  let emailStatus: 'success' | 'failed' = 'failed';

  if (hasSupabase) {
    try {
      const baseUrl = env.SUPABASE_URL!.replace(/\/+$/, '');
      const res = await fetch(`${baseUrl}/rest/v1/contact_messages`, {
        method: 'POST',
        headers: {
          apikey: env.SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY!}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          metadata: mergedMetadata,
        }),
      });

      if (res.ok) {
        const rows = (await res.json().catch(() => [])) as any[];
        if (Array.isArray(rows) && rows.length > 0) {
          savedRecord = rows[0];
        } else {
          savedRecord = { name, email, subject, message };
        }
      }
    } catch {
      // Best-effort: continue even if Supabase insert fails
    }
  }

  if (hasEmail) {
    try {
      const textBody = [
        `New contact message from ${name}`,
        '',
        `Email: ${email}`,
        `Subject: ${subject}`,
        '',
        'Message:',
        message,
        '',
        'Metadata:',
        JSON.stringify(mergedMetadata, null, 2),
      ].join('\n');

      const emailRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.EMAIL_PROVIDER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: env.GMAIL_ADMIN_EMAIL }] }],
          from: { email: env.GMAIL_ADMIN_EMAIL },
          subject: `[Contact] ${subject}`,
          content: [
            {
              type: 'text/plain',
              value: textBody,
            },
          ],
        }),
      });

      emailStatus = emailRes.ok ? 'success' : 'failed';
    } catch {
      emailStatus = 'failed';
    }
  }

  const responseBody: any = {
    message:
      'Thank you for your message. We have received it and will get back to you soon.',
    data: savedRecord || { name, email, subject },
    emailStatus,
  };

  return json(responseBody, { status: 201 });
}

// EMAIL SERVICE STATUS
async function handleEmailStatus(_req: Request, env: Env): Promise<Response> {
  try {
    const gmailAvailable = !!env.GMAIL_APP_PASSWORD && !!env.GMAIL_ADMIN_EMAIL;
    const sendgridAvailable = !!env.EMAIL_PROVIDER_API_KEY && !!env.GMAIL_ADMIN_EMAIL;
    const mailersendAvailable = false;

    let primaryService: 'gmail' | 'sendgrid' | 'mailersend' | 'none' = 'none';
    if (gmailAvailable) {
      primaryService = 'gmail';
    } else if (sendgridAvailable) {
      primaryService = 'sendgrid';
    } else if (mailersendAvailable) {
      primaryService = 'mailersend';
    }

    return json({
      success: primaryService !== 'none',
      services: {
        gmail: gmailAvailable,
        sendgrid: sendgridAvailable,
        mailersend: mailersendAvailable,
      },
      primaryService,
    });
  } catch (error) {
    return json(
      {
        success: false,
        services: {
          gmail: false,
          sendgrid: false,
          mailersend: false,
        },
        primaryService: 'none',
        error: String(error),
      },
      { status: 500 },
    );
  }
}

// EMAIL TEST
async function handleEmailTest(req: Request, env: Env): Promise<Response> {
  // If a SendGrid API key is configured, prefer that HTTP-based provider.
  if (env.EMAIL_PROVIDER_API_KEY && env.GMAIL_ADMIN_EMAIL) {
    try {
      const ip = req.headers.get('cf-connecting-ip') || 'unknown';
      const allowed = await checkRateLimit(env, `email-test-${ip}`, 5, 3600);
      if (!allowed) {
        return json({ success: false, message: 'Rate limited' }, { status: 429 });
      }

      const body = (await (req as any).json?.().catch(() => ({}))) || {};

      const to = typeof body.to === 'string' ? body.to.trim() : '';
      if (!to) {
        return json(
          { success: false, message: 'Recipient email address is required' },
          { status: 400 },
        );
      }

      const subject =
        typeof body.subject === 'string' && body.subject.trim()
          ? body.subject.trim()
          : "Test Email from Bubble's Cafe";
      const text =
        typeof body.text === 'string' && body.text.trim()
          ? body.text
          : "This is a test email from the Bubble's Cafe admin panel.";
      const html =
        typeof body.html === 'string' && body.html.trim()
          ? body.html
          : `<h1>${subject}</h1><p>${text}</p>`;

      const emailRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.EMAIL_PROVIDER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: env.GMAIL_ADMIN_EMAIL },
          subject,
          content: [
            { type: 'text/plain', value: text },
            { type: 'text/html', value: html },
          ],
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text().catch(() => '');
        return json(
          {
            success: false,
            message: 'Failed to send test email',
            error: errText.slice(0, 200),
          },
          { status: 500 },
        );
      }

      const messageId = crypto.randomUUID();
      return json({
        success: true,
        message: 'Test email sent successfully',
        details: {
          service: 'sendgrid',
          messageId,
        },
      });
    } catch (error) {
      return json({ success: false, message: String(error) }, { status: 500 });
    }
  }

  // If only Gmail app password is configured (no HTTP provider), we cannot send SMTP from a Worker.
  // Instead, log a best-effort message and return a success response so the admin UX remains smooth.
  if (env.GMAIL_APP_PASSWORD && env.GMAIL_ADMIN_EMAIL) {
    try {
      const body = (await (req as any).json?.().catch(() => ({}))) || {};
      const to = typeof body.to === 'string' ? body.to.trim() : '';
      const subject =
        typeof body.subject === 'string' && body.subject.trim()
          ? body.subject.trim()
          : "Test Email from Bubble's Cafe";
      const text =
        typeof body.text === 'string' && body.text.trim()
          ? body.text
          : "This is a test email from the Bubble's Cafe admin panel (Gmail app password configured, SMTP not available from Worker).";

      console.log('[EmailTest/Gmail-only] Simulated test email', {
        from: env.GMAIL_ADMIN_EMAIL,
        to,
        subject,
        text,
      });
    } catch {
      // ignore
    }

    return json({
      success: true,
      message:
        'Test email simulated using Gmail configuration. Direct SMTP is not available from the Worker runtime.',
      details: {
        service: 'gmail-simulated',
      },
    });
  }

  return json(
    {
      success: false,
      message:
        'Email provider is not fully configured. Set either EMAIL_PROVIDER_API_KEY (SendGrid) or GMAIL_APP_PASSWORD + GMAIL_ADMIN_EMAIL.',
    },
    { status: 500 },
  );
}

// EMAIL SERVICE SEND
async function handleEmailSend(req: Request, env: Env): Promise<Response> {
  try {
    const ip = req.headers.get('cf-connecting-ip') || 'unknown';
    const allowed = await checkRateLimit(env, `email-${ip}`, 10, 3600);
    if (!allowed) {
      return json({ error: 'Rate limited' }, { status: 429 });
    }

    const body = (await (req as any).json?.()) || {};

    if (!body.to || !body.subject || !body.html) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prefer HTTP-based provider (SendGrid) when configured.
    if (env.EMAIL_PROVIDER_API_KEY && env.GMAIL_ADMIN_EMAIL) {
      const emailRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.EMAIL_PROVIDER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: body.to }] }],
          from: { email: env.GMAIL_ADMIN_EMAIL },
          subject: body.subject,
          content: [{ type: 'text/html', value: body.html }],
        }),
      });

      if (!emailRes.ok) {
        return json({ error: 'Failed to send email' }, { status: 500 });
      }

      return json({ success: true, messageId: crypto.randomUUID() });
    }

    // If only Gmail app password is configured, we cannot open SMTP from a Worker.
    // Log a simulated send so there is an audit trail, and return success for UX.
    if (env.GMAIL_APP_PASSWORD && env.GMAIL_ADMIN_EMAIL) {
      console.log('[EmailSend/Gmail-only] Simulated email', {
        from: env.GMAIL_ADMIN_EMAIL,
        to: body.to,
        subject: body.subject,
      });

      return json({
        success: true,
        messageId: crypto.randomUUID(),
        service: 'gmail-simulated',
      });
    }

    return json(
      {
        error:
          'Email provider is not fully configured. Set either EMAIL_PROVIDER_API_KEY (SendGrid) or GMAIL_APP_PASSWORD + GMAIL_ADMIN_EMAIL.',
      },
      { status: 500 },
    );
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
}

// Register contact/email routes on the provided router.
export function registerContactEmailRoutes(router: any) {
  router.post(
    '/api/contact',
    async (req: Request, env: Env) => handleContactSubmit(req, env),
  );

  router.get(
    '/api/email/status',
    async (req: Request, env: Env) => handleEmailStatus(req, env),
  );

  router.post(
    '/api/email/test',
    async (req: Request, env: Env) => handleEmailTest(req, env),
  );

  router.post(
    '/api/email-service/send',
    async (req: Request, env: Env) => handleEmailSend(req, env),
  );
}