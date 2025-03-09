
import { JSDOM } from 'jsdom';
import { minify } from 'csso';
import * as fs from 'fs';
import * as path from 'path';
import { Request, Response, NextFunction } from 'express';

const CRITICAL_CSS_CACHE = new Map<string, { css: string, timestamp: number }>();
const CACHE_EXPIRY = 3600000; // 1 hour
const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * Extracts critical CSS from HTML content and inlines it
 */
export function criticalCssMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original send function
    const originalSend = res.send;
    
    // Only handle HTML responses
    res.send = function(body: any) {
      try {
        // Only process string responses that look like HTML
        if (typeof body !== 'string' || !body.includes('<!DOCTYPE html>')) {
          return originalSend.call(this, body);
        }
        
        // Check header content type
        const contentType = res.getHeader('content-type');
        if (contentType && !String(contentType).includes('text/html')) {
          return originalSend.call(this, body);
        }
        
        // Get critical CSS
        const url = req.originalUrl || req.url;
        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /mobile|android|iphone|ipod|tablet/i.test(userAgent);
        const cacheKey = `${url}-${isMobile ? 'mobile' : 'desktop'}`;
        
        // Check cache
        const cachedCss = CRITICAL_CSS_CACHE.get(cacheKey);
        if (cachedCss && (Date.now() - cachedCss.timestamp) < CACHE_EXPIRY) {
          const processedHtml = injectCriticalCss(body, cachedCss.css);
          return originalSend.call(this, processedHtml);
        }
        
        // Extract and process critical CSS
        const criticalCss = extractCriticalCss(body, isMobile);
        
        // Cache the result
        CRITICAL_CSS_CACHE.set(cacheKey, {
          css: criticalCss,
          timestamp: Date.now()
        });
        
        // Inject the critical CSS
        const processedHtml = injectCriticalCss(body, criticalCss);
        
        // Send the modified response
        return originalSend.call(this, processedHtml);
      } catch (error) {
        // Log error but don't break the response
        console.error('[CriticalCSS] Error processing HTML:', error);
        return originalSend.call(this, body);
      }
    };
    
    next();
  };
}

/**
 * Extract critical CSS from HTML
 */
function extractCriticalCss(html: string, isMobile: boolean): string {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Collect all CSS links
    const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    let criticalCss = '';
    
    // Extract inline styles
    const inlineStyles = Array.from(document.querySelectorAll('style'));
    inlineStyles.forEach(style => {
      criticalCss += style.textContent || '';
    });
    
    // Filter for critical above-the-fold styles
    const criticalSelectors = [
      // Basic layout elements
      'body', 'html', '.container', '.header', '.footer', '.navbar', '.sidebar',
      // Typography
      'h1', 'h2', 'h3', 'p', '.title', '.heading',
      // Critical UI components
      '.btn', 'button', '.nav', '.alert', '.modal', '.card', 
      // Mobile specific for mobile devices
      ...(isMobile ? ['.mobile-nav', '.hamburger', '.menu-toggle'] : [])
    ];
    
    // Extract selectors from critical CSS
    const minifiedCss = minify(criticalCss, {
      restructure: true,
      comments: false
    }).css;
    
    return minifiedCss;
  } catch (error) {
    console.error('[CriticalCSS] Extraction error:', error);
    return '';
  }
}

/**
 * Inject critical CSS into HTML head
 */
function injectCriticalCss(html: string, criticalCss: string): string {
  if (!criticalCss) return html;
  
  const criticalCssTag = `<style id="critical-css">${criticalCss}</style>`;
  
  // Insert after last meta tag or before first link/script
  return html.replace(
    /(<\/head>)/i,
    `${criticalCssTag}$1`
  );
}
