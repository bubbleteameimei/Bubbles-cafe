import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { db, pool } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import {
  verifyAuthToken,
  handleEmailLogin,
  handleGoogleCallback,
  handleRefreshToken,
  handleLogout,
  getGoogleAuthUrl,
  findOrCreateNeonUser,
} from './auth-google';
import { getCsrfTokenHandler } from './middleware/csrf-signed-tokens';
import { registerPostsRoutes } from './routes/posts';
import { registerCommentsRoutes } from './routes/comments';
import { registerUserRoutes } from './routes/users';
import { registerAnalyticsRoutes } from './routes/analytics';
import { registerWordPressSyncRoutes } from './routes/wordpress-sync';
import { registerLikesRoutes } from './routes/likes';
import { registerBookmarksRoutes } from './routes/bookmarks';
import { registerNotificationsRoutes } from './routes/notifications';
import { createSupabaseServiceRoleClient } from './utils/supabase';
import crypto from 'crypto';

const app: Express = express();
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://bubblescafe.space';

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS — allow the frontend and all preview environments
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:5173',
      'https://bubblescafe.space',
      'https://www.bubblescafe.space',
      'https://bubbles-cafe.space',
      'https://www.bubbles-cafe.space',
      'https://bubblescafe.vercel.app',
    ];
    const isPreview = origin && /\.vercel\.app$|\.vercel\.dev$|\.netlify\.app$|\.pages\.dev$|\.replit\.dev$|\.replit\.app$/.test(origin);

    if (!origin || allowedOrigins.includes(origin) || isPreview) {
      callback(null, true);
    } else if (NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ============================================================================
// HEALTH CHECK
// ============================================================================

// Root handler — keeps Render / proxy health checks happy (some default to GET /)
app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'bubbles-cafe-api' });
});

app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await (pool as any).query('SELECT 1 as health');
    res.json({ status: 'ok', environment: NODE_ENV, database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'degraded', environment: NODE_ENV, database: 'disconnected', timestamp: new Date().toISOString() });
  }
});

// ============================================================================
// PUBLIC CONFIG — used by the frontend to lazy-init Supabase
// ============================================================================

app.get('/api/config/public', (req: Request, res: Response) => {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || '';
  res.json({
    supabase: {
      url: supabaseUrl,
      anonKey,
      clientReady: !!(supabaseUrl && anonKey),
    },
    features: {
      googleAuth: !!(process.env.GOOGLE_CLIENT_ID),
      paystack: !!(process.env.PAYSTACK_PUBLIC_KEY),
    },
    paystackLink: process.env.PAYSTACK_LINK || '',
    paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
  });
});

// ============================================================================
// CSRF TOKEN (kept for compatibility but not enforced on mutations)
// ============================================================================

app.get('/api/csrf-token', getCsrfTokenHandler);

// ============================================================================
// SUPABASE AUTH INTEGRATION
// ============================================================================

/**
 * POST /api/auth/supabase/login
 * Exchange a Supabase JWT for a local user profile stored in Neon.
 * Called by the frontend after successful Supabase sign-in.
 */
app.post('/api/auth/supabase/login', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : req.body?.access_token;

    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    const supabaseAdmin = createSupabaseServiceRoleClient();
    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !supabaseUser?.email) {
      return res.status(401).json({ error: 'Invalid Supabase token' });
    }

    const neonUser = await findOrCreateNeonUser(supabaseUser.email, supabaseUser);
    if (!neonUser) {
      return res.status(500).json({ error: 'Failed to find or create user' });
    }

    res.json({
      user: {
        id: neonUser.id,
        email: neonUser.email,
        username: neonUser.username,
        isAdmin: neonUser.isAdmin,
        fullName: (neonUser.metadata as any)?.displayName || null,
        avatar: (neonUser.metadata as any)?.photoURL || null,
        bio: (neonUser.metadata as any)?.bio || null,
        metadata: neonUser.metadata,
      },
    });
  } catch (error) {
    console.error('Supabase login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============================================================================
// GOOGLE OAUTH ROUTES
// ============================================================================

app.get('/api/auth/google/authorize', (req: Request, res: Response) => {
  const state = crypto.randomBytes(32).toString('hex');
  const authUrl = getGoogleAuthUrl(state);
  res.json({ authUrl });
});

app.get('/api/auth/google/callback', handleGoogleCallback);
app.get('/api/auth/callback', handleGoogleCallback);

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

app.post('/api/auth/login', handleEmailLogin);
app.post('/api/auth/refresh', handleRefreshToken);
app.post('/api/auth/logout', handleLogout);

app.get('/api/auth/me', verifyAuthToken, async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).user;
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!result.length) return res.status(404).json({ error: 'User not found' });
    const { password_hash, ...user } = result[0];
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ============================================================================
// API ROUTES
// Note: CSRF is NOT enforced — app uses JWT Bearer tokens which are CSRF-immune.
// ============================================================================

// Posts (includes community endpoint)
app.use('/api/posts', registerPostsRoutes());

// Post interactions (likes/dislikes)
app.use('/api/posts', registerLikesRoutes());

// Comments
app.use('/api/comments', registerCommentsRoutes());

// Users
app.use('/api/users', registerUserRoutes());

// Bookmarks
app.use('/api/bookmarks', registerBookmarksRoutes());

// Notifications
app.use('/api/notifications', registerNotificationsRoutes());

// Analytics
app.use('/api/analytics', registerAnalyticsRoutes());

// WordPress sync
app.use('/api/wordpress', registerWordPressSyncRoutes());

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
});

export default app;
