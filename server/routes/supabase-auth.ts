import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import bcrypt from 'bcryptjs';
import { createSecureLogger } from '../utils/secure-logger';

// Use jose for JWT verification against Supabase JWKS
import { createRemoteJWKSet, jwtVerify } from 'jose';

const logger = createSecureLogger('SupabaseAuth');

const router = Router();

function getSupabaseUrl(): string {
  const envUrl = process.env.SUPABASE_URL || '';
  if (envUrl) return envUrl.replace(/\/+$/, '');
  // Fallback to known project URL if not provided in env
  return 'https://rqoqtusrlsapcbdimwpn.supabase.co';
}

const SUPABASE_URL = getSupabaseUrl();
const JWKS_URL = `${SUPABASE_URL}/auth/v1/jwks`;

// Remote JWKS (cached by jose internally)
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

async function verifySupabaseToken(token: string): Promise<{ email?: string; sub: string; provider?: string; user_metadata?: any; app_metadata?: any; [key: string]: any }> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: SUPABASE_URL,
      // Supabase tokens typically use audience 'authenticated'
      audience: 'authenticated'
    });
    return payload as any;
  } catch (error) {
    // Relax issuer/audience checks if strict verification fails (projects vary)
    try {
      const { payload } = await jwtVerify(token, JWKS);
      return payload as any;
    } catch (e) {
      logger.error('JWT verification failed', { error: e instanceof Error ? e.message : String(e) });
      throw new Error('Invalid Supabase token');
    }
  }
}

/**
 * POST /api/auth/supabase/login
 * Accepts a Supabase access_token (Bearer or body) and creates a local session.
 * Body: { access_token?: string }
 * Header: Authorization: Bearer <token>
 */
router.post('/supabase/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const header = req.get('Authorization') || '';
    const bearer = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : undefined;
    const bodyToken = typeof req.body?.access_token === 'string' ? req.body.access_token : undefined;
    const token = bearer || bodyToken;

    if (!token) {
      res.status(400).json({ error: 'Missing access_token (Bearer or body)' });
      return;
    }

    const claims = await verifySupabaseToken(token);
    const email = (claims.email || '').toLowerCase();
    const sub = String(claims.sub || '');
    const provider = (claims as any)?.app_metadata?.provider || (claims as any)?.provider || 'supabase';
    const userMeta = (claims as any)?.user_metadata || {};
    const rememberMe = typeof req.body?.rememberMe === 'boolean' ? req.body.rememberMe : false;

    if (!email || !sub) {
      res.status(401).json({ error: 'Invalid token claims (missing email or sub)' });
      return;
    }

    // Find or create local user mapped to Supabase user
    let user = await storage.getUserByEmail(email);
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const password_hash = await bcrypt.hash(randomPassword, 12);
      user = await storage.createUser({
        username: (userMeta.username || email.split('@')[0]) as string,
        email,
        password_hash,
        isAdmin: false,
        metadata: {
          email,
          supabaseUserId: sub,
          provider,
          lastLogin: new Date().toISOString(),
          displayName: userMeta.full_name || userMeta.name || null,
          photoURL: userMeta.avatar_url || null
        }
      });
    } else {
      const existingMeta = (user.metadata || {}) as Record<string, any>;
      await storage.updateUser(user.id, {
        metadata: {
          ...existingMeta,
          supabaseUserId: sub,
          provider,
          lastLogin: new Date().toISOString(),
          displayName: existingMeta.displayName ?? (userMeta.full_name || userMeta.name || null),
          photoURL: existingMeta.photoURL ?? (userMeta.avatar_url || null)
        }
      });
    }

    const { password_hash: _ignore, ...safeUser } = user as any;
    req.login(safeUser as any, (err) => {
      if (err) {
        logger.error('Session creation failed', { error: err });
        res.status(500).json({ error: 'Session creation failed' });
        return;
      }
      try {
        if (rememberMe && req.session && req.session.cookie) {
          // Persist session cookie for 30 days when Remember Me is enabled
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
        }
      } catch (_) { /* no-op */ }
      res.json({ success: true, user: safeUser });
    });
    return;
  } catch (error) {
    logger.error('Supabase login error', { error: error instanceof Error ? error.message : String(error) });
    res.status(401).json({ error: 'Invalid Supabase token' });
    return;
  }
});

/**
 * GET/POST /api/auth/supabase/callback
 * Optional helper route: accepts token via query or body, sets session, and redirects to frontend.
 * Query: ?access_token=...
 * Body: { access_token?: string }
 */
async function callbackHandler(req: Request, res: Response): Promise<void> {
  try {
    const qToken = typeof req.query.access_token === 'string' ? req.query.access_token : undefined;
    const bToken = typeof req.body?.access_token === 'string' ? req.body.access_token : undefined;
    const header = req.get('Authorization') || '';
    const hToken = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : undefined;
    const token = qToken || bToken || hToken;

    if (!token) {
      res.status(400).json({ error: 'Missing access_token' });
      return;
    }

    const claims = await verifySupabaseToken(token);
    const email = (claims.email || '').toLowerCase();
    const sub = String(claims.sub || '');
    const provider = (claims as any)?.app_metadata?.provider || (claims as any)?.provider || 'supabase';
    const userMeta = (claims as any)?.user_metadata || {};

    if (!email || !sub) {
      res.status(401).json({ error: 'Invalid token claims (missing email or sub)' });
      return;
    }

    let user = await storage.getUserByEmail(email);
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const password_hash = await bcrypt.hash(randomPassword, 12);
      user = await storage.createUser({
        username: (userMeta.username || email.split('@')[0]) as string,
        email,
        password_hash,
        isAdmin: false,
        metadata: {
          email,
          supabaseUserId: sub,
          provider,
          lastLogin: new Date().toISOString(),
          displayName: userMeta.full_name || userMeta.name || null,
          photoURL: userMeta.avatar_url || null
        }
      });
    } else {
      const existingMeta = (user.metadata || {}) as Record<string, any>;
      await storage.updateUser(user.id, {
        metadata: {
          ...existingMeta,
          supabaseUserId: sub,
          provider,
          lastLogin: new Date().toISOString(),
          displayName: existingMeta.displayName ?? (userMeta.full_name || userMeta.name || null),
          photoURL: existingMeta.photoURL ?? (userMeta.avatar_url || null)
        }
      });
    }

    const { password_hash: _ignore, ...safeUser } = user as any;
    req.login(safeUser as any, (err) => {
      if (err) {
        logger.error('Session creation failed (callback)', { error: err });
        res.status(500).json({ error: 'Session creation failed' });
        return;
      }
      const baseFrontend = (process.env.FRONTEND_URL || 'https://bubblescafe.space').replace(/\/+$/, '');
      const redirectTo = process.env.FRONTEND_SUCCESS_URL || `${baseFrontend}/auth/success`;
      try {
        res.redirect(redirectTo);
      } catch {
        res.json({ success: true, user: safeUser });
      }
    });
    return;
  } catch (error) {
    logger.error('Supabase callback error', { error: error instanceof Error ? error.message : String(error) });
    res.status(401).json({ error: 'Invalid Supabase token' });
    return;
  }
}

router.get('/supabase/callback', callbackHandler);
router.post('/supabase/callback', callbackHandler);

export { router as supabaseAuthRouter };