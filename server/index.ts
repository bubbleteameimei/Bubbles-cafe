import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { db, pool } from './db';
import {
  verifyAuthToken,
  handleEmailLogin,
  handleGoogleCallback,
  handleRefreshToken,
  handleLogout,
  getGoogleAuthUrl,
  generateAccessToken,
  getUser,
} from './auth-google';
import {
  validateCsrfToken,
  getCsrfTokenHandler,
  injectCsrfToken,
} from './middleware/csrf-signed-tokens';
import { registerPostsRoutes } from './routes/posts';
import { registerCommentsRoutes } from './routes/comments';
import { registerUserRoutes } from './routes/users';
import { registerAnalyticsRoutes } from './routes/analytics';
import { registerWordPressSyncRoutes } from './routes/wordpress-sync';
import crypto from 'crypto';

const app: Express = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://bubblescafe.space';

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'https://bubblescafe.space',
      'https://www.bubblescafe.space',
      'https://bubbles-cafe.space',
      'https://www.bubbles-cafe.space',
      'https://bubblescafe.vercel.app',
    ];

    // Allow preview URLs in all environments
    const isPreview = origin && /\.vercel\.app$|\.vercel\.dev$|\.netlify\.app$|\.pages\.dev$|\.replit\.dev$/.test(origin);

    if (!origin || allowedOrigins.includes(origin) || isPreview) {
      callback(null, true);
    } else if (NODE_ENV !== 'production') {
      callback(null, true); // Allow all in development
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
};

app.use(cors(corsOptions));
// Handle preflight requests
app.options('*', cors(corsOptions));

// Inject CSRF token
app.use(injectCsrfToken);

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    const result = await (pool as any).query('SELECT 1 as health');
    res.json({
      status: 'ok',
      environment: NODE_ENV,
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'degraded',
      environment: NODE_ENV,
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// CSRF TOKEN ENDPOINT
// ============================================================================

app.get('/api/csrf-token', getCsrfTokenHandler);

// ============================================================================
// GOOGLE OAUTH ROUTES
// ============================================================================

/**
 * GET /api/auth/google/authorize
 * Returns authorization URL for frontend to redirect to
 */
app.get('/api/auth/google/authorize', (req: Request, res: Response) => {
  const state = crypto.randomBytes(32).toString('hex');
  // TODO: Store state in session/cache for verification
  const authUrl = getGoogleAuthUrl(state);
  res.json({ authUrl });
});

/**
 * GET /api/auth/google/callback
 * Google OAuth callback (redirect from Google)
 */
app.get('/api/auth/google/callback', handleGoogleCallback);

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

/**
 * POST /api/auth/login
 * Email/password login (for users who registered with email)
 */
app.post('/api/auth/login', handleEmailLogin);

/**
 * POST /api/auth/refresh
 * Exchange refresh token for new access token
 */
app.post('/api/auth/refresh', handleRefreshToken);

/**
 * POST /api/auth/logout
 * Invalidate refresh token
 */
app.post('/api/auth/logout', handleLogout);

/**
 * GET /api/auth/me
 * Get current authenticated user (requires valid JWT)
 */
app.get('/api/auth/me', verifyAuthToken, async (req: Request, res: Response) => {
  try {
    const user = await getUser((req as any).user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
      metadata: user.metadata,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ============================================================================
// API ROUTES (Protected with CSRF + JWT)
// ============================================================================

// Apply CSRF validation to all state-changing requests
app.use(validateCsrfToken());

// Posts routes
app.use('/api/posts', registerPostsRoutes());

// Comments routes
app.use('/api/comments', registerCommentsRoutes());

// Users routes
app.use('/api/users', registerUserRoutes());

// Analytics routes
app.use('/api/analytics', registerAnalyticsRoutes());

// WordPress sync routes
app.use('/api/wordpress', registerWordPressSyncRoutes());

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((error: any, req: Request, res: Response) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
  });
});

// ============================================================================
// STARTUP
// ============================================================================

async function startServer() {
  try {
    // Test database connection
    const result = await (pool as any).query('SELECT 1');
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${NODE_ENV}`);
    console.log(`🔐 Auth: Google OAuth + JWT`);
    console.log(`🛡️  CSRF: Signed tokens`);
    console.log(`📊 Database: Neon PostgreSQL`);
  });
}

startServer();

export default app;
