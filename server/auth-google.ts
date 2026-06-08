import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { db, pool } from './db';
import { users, sessions, resetTokens } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createSupabaseServiceRoleClient } from './utils/supabase';

// JWT secrets — warn but don't crash if missing (Supabase auth is primary)
const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET || '';
  if (!secret || secret.length < 32) {
    console.warn('WARNING: JWT_SECRET is weak or missing. Using development fallback.');
    return 'dev-jwt-secret-change-in-production-32-chars-min-key';
  }
  return secret;
})();

const JWT_REFRESH_SECRET = (() => {
  const secret = process.env.JWT_REFRESH_SECRET || '';
  if (!secret || secret.length < 32) {
    console.warn('WARNING: JWT_REFRESH_SECRET is weak or missing. Using development fallback.');
    return 'dev-jwt-refresh-secret-change-in-production-key';
  }
  return secret;
})();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://bubblescafe.space';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${FRONTEND_URL}/auth/callback/google`;
const ADMIN_EMAIL = process.env.GMAIL_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@example.com';

export interface TokenPayload {
  userId: number;
  email: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  metadata?: any;
  createdAt: Date;
}

export function generateAccessToken(user: AuthUser): string {
  return jwt.sign(
    { userId: user.id, email: user.email, isAdmin: user.isAdmin },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export function generateRefreshToken(userId: number): string {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: number };
  } catch {
    return null;
  }
}

export async function getUser(emailOrId: string | number): Promise<AuthUser | null> {
  try {
    if (typeof emailOrId === 'number') {
      const result = await db.select().from(users).where(eq(users.id, emailOrId)).limit(1);
      return result[0] || null;
    } else {
      const result = await db.select().from(users).where(eq(users.email, emailOrId.toLowerCase().trim())).limit(1);
      return result[0] || null;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Find an existing Neon user by email, or create one from a Supabase user profile.
 */
export async function findOrCreateNeonUser(email: string, supabaseUser?: any): Promise<AuthUser | null> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    let user = await getUser(normalizedEmail);
    if (user) return user;

    // Create new user from Supabase profile
    const meta = supabaseUser?.user_metadata || {};
    const displayName = meta.full_name || meta.name || meta.displayName || null;
    const photoURL = meta.avatar_url || meta.picture || meta.photoURL || null;
    const username = (typeof meta.username === 'string' && meta.username.trim())
      || normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_');
    const isAdminEmail = normalizedEmail === ADMIN_EMAIL.toLowerCase();

    const newUser = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        username,
        password_hash: 'supabase_auth_' + crypto.randomBytes(16).toString('hex'),
        metadata: {
          supabaseId: supabaseUser?.id,
          displayName,
          photoURL,
          oauth: { supabase: { lastLogin: new Date().toISOString() } },
        },
        isAdmin: isAdminEmail,
      })
      .returning();

    return newUser[0] || null;
  } catch (error) {
    console.error('Error finding/creating Neon user:', error);
    return null;
  }
}

/**
 * Verify a Supabase JWT and return the Supabase user.
 * Uses the service role client to validate the token.
 */
// Simple in-memory cache for verified tokens (avoids repeated Supabase API calls)
const tokenCache = new Map<string, { userId: number; email: string; isAdmin: boolean; exp: number }>();

async function verifySupabaseToken(token: string): Promise<TokenPayload | null> {
  try {
    // Check cache first
    const cached = tokenCache.get(token);
    if (cached && cached.exp > Date.now() / 1000) {
      return { userId: cached.userId, email: cached.email, isAdmin: cached.isAdmin };
    }

    const supabaseAdmin = createSupabaseServiceRoleClient();
    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !supabaseUser?.email) return null;

    const neonUser = await findOrCreateNeonUser(supabaseUser.email, supabaseUser);
    if (!neonUser) return null;

    const payload: TokenPayload = {
      userId: neonUser.id,
      email: neonUser.email,
      isAdmin: neonUser.isAdmin,
    };

    // Cache for 5 minutes
    tokenCache.set(token, { ...payload, exp: Math.floor(Date.now() / 1000) + 300 });
    // Clean cache when it gets large
    if (tokenCache.size > 1000) {
      const now = Date.now() / 1000;
      for (const [k, v] of tokenCache.entries()) {
        if (v.exp < now) tokenCache.delete(k);
      }
    }

    return payload;
  } catch (error) {
    console.error('Supabase token verification error:', error);
    return null;
  }
}

/**
 * Middleware to verify JWT — accepts both local JWTs and Supabase JWTs.
 */
export function verifyAuthToken(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);

  // Try local JWT first (fast, no network call)
  const localPayload = verifyAccessToken(token);
  if (localPayload) {
    (req as any).user = localPayload;
    return next();
  }

  // Fall back to Supabase JWT verification
  verifySupabaseToken(token)
    .then((payload) => {
      if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      (req as any).user = payload;
      next();
    })
    .catch(() => {
      return res.status(401).json({ error: 'Token verification failed' });
    });
}

export async function createOrUpdateGoogleUser(profile: {
  id: string;
  email: string;
  displayName?: string;
  photos?: Array<{ value: string }>;
}): Promise<AuthUser | null> {
  try {
    let user = await getUser(profile.email);

    if (user) {
      const metadata = user.metadata || {};
      metadata.oauth = metadata.oauth || {};
      metadata.oauth.google = { providerId: profile.id, lastLogin: new Date().toISOString() };
      if (profile.displayName) metadata.displayName = profile.displayName;
      if (profile.photos?.[0]?.value) metadata.photoURL = profile.photos[0].value;
      const isAdminEmail = profile.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      const updated = await db
        .update(users)
        .set({ metadata, isAdmin: isAdminEmail || user.isAdmin })
        .where(eq(users.id, user.id))
        .returning();
      return updated[0] || null;
    }

    const isAdminEmail = profile.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const newUser = await db
      .insert(users)
      .values({
        email: profile.email,
        username: profile.email.split('@')[0],
        password_hash: crypto.randomBytes(32).toString('hex'),
        metadata: {
          oauth: { google: { providerId: profile.id, lastLogin: new Date().toISOString() } },
          displayName: profile.displayName,
          photoURL: profile.photos?.[0]?.value,
        },
        isAdmin: isAdminEmail,
      })
      .returning();
    return newUser[0] || null;
  } catch (error) {
    console.error('Error creating/updating Google user:', error);
    return null;
  }
}

export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(code: string): Promise<{ access_token: string; id_token: string } | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_REDIRECT_URI,
      }).toString(),
    });

    if (!response.ok) {
      console.error('Google token exchange failed:', await response.text());
      return null;
    }
    const data = await response.json();
    return { access_token: data.access_token, id_token: data.id_token };
  } catch (error) {
    console.error('Error exchanging Google code:', error);
    return null;
  }
}

export async function verifyGoogleIdToken(idToken: string): Promise<any | null> {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;
    const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return decoded;
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    return null;
  }
}

export async function handleEmailLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await getUser(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    if (user.password_hash.startsWith('supabase_auth_')) {
      return res.status(401).json({ error: 'This account uses Supabase sign-in. Please use the sign-in form.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(sessions).values({ token: refreshToken, userId: user.id, expiresAt, lastAccessedAt: new Date() });

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, username: user.username, isAdmin: user.isAdmin },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function handleGoogleCallback(req: Request, res: Response) {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'Authorization code is required' });

    const tokens = await exchangeGoogleCode(code as string);
    if (!tokens) return res.redirect(`${FRONTEND_URL}/auth?error=google_exchange_failed`);

    const profile = await verifyGoogleIdToken(tokens.id_token);
    if (!profile?.email) return res.redirect(`${FRONTEND_URL}/auth?error=google_profile_failed`);

    const user = await createOrUpdateGoogleUser({
      id: profile.sub,
      email: profile.email,
      displayName: profile.name,
      photos: profile.picture ? [{ value: profile.picture }] : [],
    });

    if (!user) return res.redirect(`${FRONTEND_URL}/auth?error=user_creation_failed`);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(sessions).values({ token: refreshToken, userId: user.id, expiresAt, lastAccessedAt: new Date() });

    res.redirect(`${FRONTEND_URL}/auth/callback/google?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${FRONTEND_URL}/auth?error=server_error`);
  }
}

export async function handleRefreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token is required' });

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) return res.status(401).json({ error: 'Invalid refresh token' });

    const session = await db.select().from(sessions).where(eq(sessions.token, refreshToken)).limit(1);
    if (!session.length || new Date(session[0].expiresAt) < new Date()) {
      return res.status(401).json({ error: 'Refresh token expired or invalid' });
    }

    const user = await getUser(payload.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
}

export async function handleLogout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await db.delete(sessions).where(eq(sessions.token, refreshToken));
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
}
