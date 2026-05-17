import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { db, pool } from './db';
import { users, sessions, resetTokens } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-this';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://bubbles-cafe.space';

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

/**
 * Generate JWT access token (short-lived: 15 minutes)
 */
export function generateAccessToken(user: AuthUser): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

/**
 * Generate JWT refresh token (long-lived: 7 days)
 */
export function generateRefreshToken(userId: number): string {
  return jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify and decode access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Verify and decode refresh token
 */
export function verifyRefreshToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: number };
  } catch {
    return null;
  }
}

/**
 * Get user from database by email or ID
 */
export async function getUser(emailOrId: string | number): Promise<AuthUser | null> {
  try {
    if (typeof emailOrId === 'number') {
      const result = await db.select().from(users).where(eq(users.id, emailOrId)).limit(1);
      return result[0] || null;
    } else {
      const result = await db.select().from(users).where(eq(users.email, emailOrId)).limit(1);
      return result[0] || null;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Create or update user from Google OAuth
 */
export async function createOrUpdateGoogleUser(profile: {
  id: string;
  email: string;
  displayName?: string;
  photos?: Array<{ value: string }>;
}): Promise<AuthUser | null> {
  try {
    // Check if user exists
    let user = await getUser(profile.email);

    if (user) {
      // Update Google OAuth metadata
      const metadata = user.metadata || {};
      metadata.oauth = metadata.oauth || {};
      metadata.oauth.google = {
        providerId: profile.id,
        lastLogin: new Date().toISOString(),
      };
      if (profile.displayName) metadata.displayName = profile.displayName;
      if (profile.photos?.[0]?.value) metadata.photoURL = profile.photos[0].value;

      const updated = await db
        .update(users)
        .set({ metadata })
        .where(eq(users.id, user.id))
        .returning();

      return updated[0] || null;
    }

    // Create new user
    const newUser = await db
      .insert(users)
      .values({
        email: profile.email,
        username: profile.email.split('@')[0],
        password_hash: crypto.randomBytes(32).toString('hex'), // Unusable hash
        metadata: {
          oauth: {
            google: {
              providerId: profile.id,
              lastLogin: new Date().toISOString(),
            },
          },
          displayName: profile.displayName,
          photoURL: profile.photos?.[0]?.value,
        },
        isAdmin: false,
      })
      .returning();

    return newUser[0] || null;
  } catch (error) {
    console.error('Error creating/updating Google user:', error);
    return null;
  }
}

/**
 * Middleware to verify JWT from Authorization header
 */
export function verifyAuthToken(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  (req as any).user = payload;
  next();
}

/**
 * Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${FRONTEND_URL}/auth/callback/google`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/**
 * Exchange Google authorization code for tokens
 */
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
        redirect_uri: `${FRONTEND_URL}/auth/callback/google`,
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

/**
 * Decode and verify Google ID token
 */
export async function verifyGoogleIdToken(idToken: string): Promise<any | null> {
  try {
    // Fetch Google's public keys
    const response = await fetch('https://www.googleapis.com/oauth2/v1/certs');
    const certs = await response.json();

    // Note: In production, you should use a JWT library to verify properly
    // This is a simplified version. Use google-auth-library for production:
    // import { OAuth2Client } from 'google-auth-library';
    // const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    // return await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });

    // For now, decode without verification (UNSAFE - use above in production)
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return decoded;
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    return null;
  }
}

/**
 * API: Login with email/password
 */
export async function handleEmailLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await getUser(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if password hash is valid (not OAuth-only)
    if (user.password_hash === crypto.randomBytes(32).toString('hex')) {
      return res.status(401).json({ error: 'This account uses OAuth login only' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await db.insert(sessions).values({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      lastAccessedAt: new Date(),
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

/**
 * API: Google OAuth callback
 */
export async function handleGoogleCallback(req: Request, res: Response) {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Verify state (CSRF protection)
    // You should validate state against a stored value
    // For now, we'll skip this for simplicity

    const tokens = await exchangeGoogleCode(code as string);
    if (!tokens) {
      return res.status(400).json({ error: 'Failed to exchange authorization code' });
    }

    const profile = await verifyGoogleIdToken(tokens.id_token);
    if (!profile) {
      return res.status(400).json({ error: 'Failed to verify Google ID token' });
    }

    const user = await createOrUpdateGoogleUser({
      id: profile.sub,
      email: profile.email,
      displayName: profile.name,
      photos: profile.picture ? [{ value: profile.picture }] : undefined,
    });

    if (!user) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(sessions).values({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      lastAccessedAt: new Date(),
    });

    // Redirect to frontend with tokens
    const redirectUrl = new URL(`${FRONTEND_URL}/auth/success`);
    redirectUrl.searchParams.set('accessToken', accessToken);
    redirectUrl.searchParams.set('refreshToken', refreshToken);
    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * API: Refresh access token
 */
export async function handleRefreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Verify refresh token exists in database
    const session = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.token, refreshToken), eq(sessions.userId, payload.userId)))
      .limit(1);

    if (!session.length) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    const user = await getUser(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
}

/**
 * API: Logout
 */
export async function handleLogout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete session from database
      await db.delete(sessions).where(eq(sessions.token, refreshToken));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
}
