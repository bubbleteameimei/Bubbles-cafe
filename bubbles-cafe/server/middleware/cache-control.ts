/**
 * Cache Control Middleware
 * 
 * This middleware adds appropriate cache headers to responses
 * based on the requested route and content type.
 */

import { Request, Response, NextFunction } from 'express';

// Cache duration constants (in seconds)
const CACHE_DURATIONS = {
  // Static assets
  STATIC: 60 * 60 * 24 * 7, // 7 days
  
  // Images
  IMAGES: 60 * 60 * 24 * 30, // 30 days
  
  // Fonts
  FONTS: 60 * 60 * 24 * 365, // 1 year
  
  // Blog posts
  BLOG_POSTS: 60 * 15, // 15 minutes
  
  // API responses
  API: 60 * 5, // 5 minutes
};

export function cacheControlMiddleware(req: Request, res: Response, next: NextFunction) {
  const path = req.path;
  
  // Skip cache control for authenticated user requests
  if (req.session && (req.session as any).user) {
    return next();
  }
  
  // Set appropriate cache headers based on route and content type
  if (path.match(/\.(js|css|map)$/i)) {
    // Static assets (JS, CSS)
    setCache(res, CACHE_DURATIONS.STATIC);
  } else if (path.match(/\.(jpe?g|png|gif|svg|webp)$/i)) {
    // Images
    setCache(res, CACHE_DURATIONS.IMAGES);
  } else if (path.match(/\.(woff2?|eot|ttf|otf)$/i)) {
    // Fonts
    setCache(res, CACHE_DURATIONS.FONTS);
  } else if (path.match(/^\/api\/posts\/(?!recommend)/i)) {
    // Blog posts (but not recommendations which are more dynamic)
    setCache(res, CACHE_DURATIONS.BLOG_POSTS);
  } else if (path.startsWith('/api/')) {
    // API routes
    setCache(res, CACHE_DURATIONS.API);
  } else {
    // Set sensible defaults for other routes
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
}

// Helper function to set cache headers
function setCache(res: Response, maxAgeSeconds: number) {
  if (maxAgeSeconds === 0) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  } else {
    res.setHeader('Cache-Control', `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds * 0.5}`);
    res.setHeader('Expires', new Date(Date.now() + maxAgeSeconds * 1000).toUTCString());
  }
}