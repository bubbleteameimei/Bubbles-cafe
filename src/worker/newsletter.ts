// Newsletter domain routes for Bubble's Cafe Worker.
// Extracted from src/index.ts to keep the Worker entrypoint slimmer while
// preserving existing behavior.

import type { Env } from './utils';
import { json } from './utils';

// Shared newsletter subscribe handler (Supabase-backed)
async function handleNewsletterSubscribe(req: Request, env: Env): Promise<Response> {
  let email: string | null = null;
  let metadata: Record<string, any> | undefined;

  try {
    const body = (await (req as any).json?.()) || {};
    email = typeof body.email === 'string' ? body.email.trim() : '';
    metadata =
      body && typeof body.metadata === 'object' && body.metadata !== null
        ? (body.metadata as Record<string, any>)
        : undefined;
  } catch {
    return json({ success: false, message: 'Invalid subscription data' }, { status: 400 });
  }

  if (!email) {
    return json(
      { success: false, message: 'Please enter a valid email address' },
      { status: 400 },
    );
  }

  const simpleEmailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!simpleEmailRegex.test(email)) {
    return json(
      { success: false, message: 'Please enter a valid email address' },
      { status: 400 },
    );
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json(
      { success: false, message: 'Newsletter service not configured' },
      { status: 500 },
    );
  }

  const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
  const headers: Record<string, string> = {
    apikey: env.SUPABASE_ANON_KEY,
    Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  let existing: any | null = null;
  try {
    const url = new URL(`${baseUrl}/rest/v1/newsletter_subscriptions`);
    url.searchParams.set('select', 'id,email,status,metadata,created_at,updated_at');
    url.searchParams.set('email', `eq.${email}`);
    url.searchParams.set('limit', '1');

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });
    if (!res.ok && res.status !== 406) {
      return json(
        {
          success: false,
          message: 'An error occurred while subscribing to the newsletter',
        },
        { status: 500 },
      );
    }
    const rows = (await res.json().catch(() => [])) as any[];
    if (Array.isArray(rows) && rows.length > 0) {
      existing = rows[0];
    }
  } catch {
    // Treat as no existing subscription; we'll still attempt to insert
  }

  let subscription = existing;
  let alreadySubscribed = false;

  try {
    if (existing && existing.status === 'active') {
      alreadySubscribed = true;
    } else if (existing) {
      // Reactivate existing subscription
      const patchUrl = new URL(`${baseUrl}/rest/v1/newsletter_subscriptions`);
      patchUrl.searchParams.set('email', `eq.${email}`);

      const res = await fetch(patchUrl.toString(), {
        method: 'PATCH',
        headers: {
          ...headers,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          status: 'active',
          updated_at: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        return json(
          {
            success: false,
            message: 'An error occurred while subscribing to the newsletter',
          },
          { status: 500 },
        );
      }
      const rows = (await res.json().catch(() => [])) as any[];
      subscription = Array.isArray(rows) && rows.length > 0 ? rows[0] : existing;
    } else {
      // Create new subscription
      const res = await fetch(`${baseUrl}/rest/v1/newsletter_subscriptions`, {
        method: 'POST',
        headers: {
          ...headers,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          email,
          status: 'active',
          metadata: metadata || {},
        }),
      });

      if (!res.ok) {
        return json(
          {
            success: false,
            message: 'An error occurred while subscribing to the newsletter',
          },
          { status: 500 },
        );
      }

      const rows = (await res.json().catch(() => [])) as any[];
      subscription = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    }
  } catch {
    return json(
      {
        success: false,
        message: 'An error occurred while subscribing to the newsletter',
      },
      { status: 500 },
    );
  }

  // Send a welcome email best-effort; do not fail subscription if this fails
  let emailSent = false;
  let emailMessage =
    'Welcome email could not be sent at this time, but your subscription is active';

  if (!alreadySubscribed && env.EMAIL_PROVIDER_API_KEY && env.GMAIL_ADMIN_EMAIL) {
    try {
      const welcomeRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.EMAIL_PROVIDER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: { email: env.GMAIL_ADMIN_EMAIL },
          subject: "Welcome to Bubble's Cafe Newsletter",
          content: [
            {
              type: 'text/html',
              value:
                "<p>Thank you for subscribing to Bubble's Cafe newsletter.</p><p>You'll hear from us soon.</p>",
            },
          ],
        }),
      });

      if (welcomeRes.ok) {
        emailSent = true;
        emailMessage = 'Welcome email sent successfully';
      }
    } catch {
      // ignore email failures
    }
  }

  if (alreadySubscribed) {
    return json({
      success: true,
      message: 'You are already subscribed to the newsletter',
      data: subscription,
      alreadySubscribed: true,
    });
  }

  return json({
    success: true,
    message: 'Successfully subscribed to the newsletter',
    data: subscription,
    email: {
      sent: emailSent,
      message: emailMessage,
    },
  });
}

// Shared newsletter unsubscribe handler
async function handleNewsletterUnsubscribe(req: Request, env: Env): Promise<Response> {
  let email: string | null = null;

  try {
    const body = (await (req as any).json?.()) || {};
    email = typeof body.email === 'string' ? body.email.trim() : '';
  } catch {
    return json({ success: false, message: 'Invalid email address' }, { status: 400 });
  }

  if (!email) {
    return json({ success: false, message: 'Invalid email address' }, { status: 400 });
  }

  const simpleEmailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!simpleEmailRegex.test(email)) {
    return json({ success: false, message: 'Invalid email address' }, { status: 400 });
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json(
      {
        success: false,
        message: 'An error occurred while unsubscribing from the newsletter',
      },
      { status: 500 },
    );
  }

  const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
  const headers: Record<string, string> = {
    apikey: env.SUPABASE_ANON_KEY,
    Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  try {
    const patchUrl = new URL(`${baseUrl}/rest/v1/newsletter_subscriptions`);
    patchUrl.searchParams.set('email', `eq.${email}`);

    const res = await fetch(patchUrl.toString(), {
      method: 'PATCH',
      headers: {
        ...headers,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        status: 'unsubscribed',
        updated_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      return json(
        {
          success: false,
          message: 'An error occurred while unsubscribing from the newsletter',
        },
        { status: 500 },
      );
    }

    const rows = (await res.json().catch(() => [])) as any[];
    const subscription = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    return json({
      success: true,
      message: 'Successfully unsubscribed from the newsletter',
      data: subscription,
    });
  } catch {
    return json(
      {
        success: false,
        message: 'An error occurred while unsubscribing from the newsletter',
      },
      { status: 500 },
    );
  }
}

// Register newsletter-related routes on the provided router instance.
export function registerNewsletterRoutes(router: any) {
  router.post(
    '/api/newsletter/subscribe',
    async (req: Request, env: Env) => handleNewsletterSubscribe(req, env),
  );

  router.post(
    '/api/newsletter-direct/subscribe',
    async (req: Request, env: Env) => handleNewsletterSubscribe(req, env),
  );

  router.post(
    '/api/newsletter/unsubscribe',
    async (req: Request, env: Env) => handleNewsletterUnsubscribe(req, env),
  );
}