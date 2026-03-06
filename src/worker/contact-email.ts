// Contact form and email service routes for Bubble's Cafe Worker.
// Extracted from src/index.ts to keep the Worker entrypoint slimmer.

import type { Env } from './utils';
import { json, sendBrevoEmail, getBearerToken, getSupabaseCurrentUser } from './utils';

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
  const hasEmail = !!(env.BREVO_API_KEY && (env.BREVO_FROM_EMAIL || env.GMAIL_ADMIN_EMAIL));

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

  let supabaseError: string | null = null;

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
      } else {
        const bodyText = await res.text().catch(() => '');
        supabaseError = `Supabase insert failed: ${res.status} ${bodyText.slice(0, 200)}`;
      }
    } catch (err) {
      supabaseError = err instanceof Error ? err.message : String(err);
      console.error('[contact] Failed to persist contact message', supabaseError);
    }
  }

  let emailError: string | null = null;

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

      const sent = await sendBrevoEmail(env, {
        to: env.GMAIL_ADMIN_EMAIL,
        subject: `[Contact] ${subject}`,
        text: textBody,
      });

      emailStatus = sent ? 'success' : 'failed';
      if (!sent) {
        emailError = 'Brevo send failed or is not configured';
      }
    } catch (err) {
      emailStatus = 'failed';
      emailError = err instanceof Error ? err.message : String(err);
      console.error('[contact] Failed to send contact email', emailError);
    }
  }

  const responseBody: any = {
    message:
      'Thank you for your message. We have received it and will get back to you soon.',
    data: savedRecord || { name, email, subject },
    emailStatus,
    warnings: {
      supabase: supabaseError,
      email: emailError,
    },
  };

  return json(responseBody, { status: 201 });
}

// EMAIL SERVICE STATUS
async function handleEmailStatus(_req: Request, env: Env): Promise<Response> {
  try {
    const brevoAvailable = !!env.BREVO_API_KEY && !!(env.BREVO_FROM_EMAIL || env.GMAIL_ADMIN_EMAIL);
    const gmailAvailable = !!env.GMAIL_APP_PASSWORD && !!env.GMAIL_ADMIN_EMAIL;
    const sendgridAvailable = !!env.EMAIL_PROVIDER_API_KEY && !!env.GMAIL_ADMIN_EMAIL;

    let primaryService: 'brevo' | 'gmail' | 'sendgrid' | 'none' = 'none';
    if (brevoAvailable) {
      primaryService = 'brevo';
    } else if (gmailAvailable) {
      primaryService = 'gmail';
    } else if (sendgridAvailable) {
      primaryService = 'sendgrid';
    }

    return json({
      success: primaryService !== 'none',
      services: {
        brevo: brevoAvailable,
        gmail: gmailAvailable,
        sendgrid: sendgridAvailable,
      },
      primaryService,
    });
  } catch (error) {
    return json(
      {
        success: false,
        services: {
          brevo: false,
          gmail: false,
          sendgrid: false,
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

    const sent = await sendBrevoEmail(env, {
      to,
      subject,
      text,
    });

    if (!sent) {
      return json(
        {
          success: false,
          message: 'Failed to send test email (Brevo not configured or request failed)',
        },
        { status: 500 },
      );
    }

    const messageId = crypto.randomUUID();
    return json({
      success: true,
      message: 'Test email sent successfully',
      details: {
        service: 'brevo',
        messageId,
      },
    });
  } catch (error) {
    return json({ success: false, message: String(error) }, { status: 500 });
  }
}

// EMAIL SERVICE SEND
async function handleEmailSend(req: Request, env: Env): Promise<Response> {
  try {
    // Admin-only: this endpoint can send arbitrary email and must not be public.
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const token = getBearerToken(req);
    if (!token) {
      return json({ error: 'Admin authentication required' }, { status: 401 });
    }

    const currentUser = await getSupabaseCurrentUser(env, token);
    if (!currentUser || !currentUser.isAdmin) {
      return json({ error: 'Admin access required' }, { status: 403 });
    }

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

    // If Brevo is configured, use it for admin-sent emails as well.
    if (env.BREVO_API_KEY && (env.BREVO_FROM_EMAIL || env.GMAIL_ADMIN_EMAIL)) {
      const sent = await sendBrevoEmail(env, {
        to: body.to,
        subject: body.subject,
        html: body.html,
      });

      if (!sent) {
        return json({ error: 'Failed to send email (Brevo request failed)' }, { status: 500 });
      }

      return json({ success: true, messageId: crypto.randomUUID(), service: 'brevo' });
    }

    return json(
      {
        error:
          'Email provider is not fully configured. Set BREVO_API_KEY + (BREVO_FROM_EMAIL or GMAIL_ADMIN_EMAIL), or set EMAIL_PROVIDER_API_KEY (SendGrid) + GMAIL_ADMIN_EMAIL.',
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