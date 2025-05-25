import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Enhanced browser caching middleware
 * This middleware adds appropriate cache-control headers based on file types
 */
export const browserCache = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only apply caching to GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const url = req.url;

    // Static assets with long cache times (1 week)
    if (
      url.match(/\.(jpg|jpeg|png|gif|ico|svg|webp)(\?.*)?$/) || // Images
      url.match(/\.(css|js)(\?.*)?$/) || // CSS and JS
      url.match(/\.(woff|woff2|ttf|eot)(\?.*)?$/) // Fonts
    ) {
      res.set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
      res.set('Vary', 'Accept-Encoding');
    }
    // HTML files with shorter cache times (5 minutes)
    else if (url.match(/\.(html|htm)(\?.*)?$/)) {
      res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
      res.set('Vary', 'Accept-Encoding');
    }
    // JSON data with medium cache times (1 hour) for API responses
    else if (url.match(/\.json(\?.*)?$/) || url.startsWith('/api/')) {
      res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
      res.set('Vary', 'Accept-Encoding, Accept');
    }
    // Default: Apply a conservative cache policy (5 minutes)
    else {
      res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
      res.set('Vary', 'Accept-Encoding');
    }

    next();
  };
};

/**
 * Additional middleware to set strong ETag headers for all responses
 */
export const etagCache = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      // Skip for streaming responses or already sent responses
      if (res.headersSent || !body) {
        return originalSend.call(this, body);
      }
      
      // Generate ETag from response body
      const etag = crypto
        .createHash('md5')
        .update(typeof body === 'string' ? body : JSON.stringify(body))
        .digest('hex');
      
      // Set ETag header
      res.setHeader('ETag', `"${etag}"`);
      
      // Check If-None-Match header to send 304 if matched
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch === `"${etag}"`) {
        res.status(304).end();
        return res;
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  };
};