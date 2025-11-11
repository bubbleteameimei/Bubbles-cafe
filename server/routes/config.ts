import { Router, Request, Response } from 'express';
import { createSecureLogger } from '../utils/secure-logger';

const logger = createSecureLogger('ConfigRoutes');
const router = Router();

/**
 * Public configuration endpoint.
 * Exposes ONLY non-sensitive client-facing settings such as Supabase anon key,
 * Google OAuth client ID, and canonical API/frontend URLs.
 */
router.get('/public', (req: Request, res: Response) => {
  try {
    const protocol = (req.headers['x-forwarded-proto']?.toString().split(',')[0].trim() || req.protocol || 'https').replace(/[^a-z]/gi, '');
    const host = String(req.headers.host || '').toLowerCase();

    // Derive canonical API base for split deployment
    const apiBase = (() => {
      try {
        if (host.startsWith('api.')) return `${protocol}://${host}`;
        const cleanHost = host.startsWith('www.') ? host.slice(4) : host;
        return `${protocol}://api.${cleanHost}`;
      } catch {
        return 'https://api.bubblescafe.space';
      }
    })();

    const frontendBase = (process.env.FRONTEND_URL || 'https://bubblescafe.space').replace(/\/+$/, '');

    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

    const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
    const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || `${apiBase}/api/auth/callback`;

    const payload = {
      apiBase,
      frontendUrl: frontendBase,
      supabase: {
        url: supabaseUrl || null,
        anonKey: supabaseAnonKey || null,
      },
      googleOAuth: {
        clientId: googleClientId || null,
        redirectUri: googleRedirectUri,
      },
    };

    // Do not include any secrets beyond Supabase anon key (public by design)
    res.json(payload);
  } catch (e) {
    logger.error('Failed to return public config', { error: e instanceof Error ? e.message : String(e) });
    res.status(500).json({ error: 'Failed to load public configuration' });
  }
});

export default router;