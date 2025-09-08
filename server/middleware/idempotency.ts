import { Request, Response, NextFunction } from 'express';

// Simple in-memory store; replace with Redis for production scale
const keys = new Map<string, { status: number; body: any; expires: number }>();
const TTL_MS = 10 * 60 * 1000;

export function idempotency() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.method === 'GET' || req.method === 'HEAD') return next();
      const key = req.header('Idempotency-Key');
      if (!key) return next();

      const now = Date.now();
      const existing = keys.get(key);
      if (existing && existing.expires > now) {
        res.status(existing.status).json(existing.body);
        return;
      }

      const originalJson = res.json.bind(res);
      res.json = ((body: any) => {
        keys.set(key, { status: res.statusCode || 200, body, expires: now + TTL_MS });
        return originalJson(body);
      }) as any;
      next();
    } catch {
      next();
    }
  };
}

