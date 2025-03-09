
import { Request, Response, NextFunction } from 'express';
import { JSDOM } from 'jsdom';

/**
 * Middleware to analyze and inject preload links for critical resources
 */
export function preloadGenerator() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original send function
    const originalSend = res.send;
    
    // Only process HTML responses
    res.send = function(body) {
      try {
        // Only process string responses that look like HTML
        if (typeof body !== 'string' || !body.includes('<!DOCTYPE html>')) {
          return originalSend.call(this, body);
        }
        
        // Check content type
        const contentType = res.getHeader('content-type');
        if (contentType && !String(contentType).includes('text/html')) {
          return originalSend.call(this, body);
        }
        
        // Parse the HTML to identify critical resources
        const dom = new JSDOM(body);
        const document = dom.window.document;
        
        // Find critical resources
        const criticalResources = findCriticalResources(document, req);
        
        // If we have critical resources, inject the preload links
        if (criticalResources.length > 0) {
          const preloadLinks = generatePreloadLinks(criticalResources);
          const modifiedHtml = injectPreloadLinks(body, preloadLinks);
          return originalSend.call(this, modifiedHtml);
        }
        
        // If no critical resources, just send the original HTML
        return originalSend.call(this, body);
      } catch (error) {
        console.error('[PreloadGenerator] Error processing HTML:', error);
        return originalSend.call(this, body);
      }
    };
    
    next();
  };
}

/**
 * Find critical resources in the document
 */
function findCriticalResources(document: Document, req: Request): Array<{ url: string, type: string, priority: number }> {
  const resources: Array<{ url: string, type: string, priority: number }> = [];
  const seenUrls = new Set<string>();
  
  // Helper to add a resource if it's not already in the list
  const addResource = (url: string, type: string, priority: number) => {
    // Only add absolute URLs or URLs that start with /
    if (!url || (url.indexOf('://') === -1 && !url.startsWith('/'))) {
      return;
    }
    
    // Normalize URL
    const normalizedUrl = url.split('#')[0].split('?')[0];
    
    // Skip if already added or not a critical resource type
    if (seenUrls.has(normalizedUrl)) {
      return;
    }
    
    seenUrls.add(normalizedUrl);
    resources.push({ url, type, priority });
  };
  
  // Check for critical CSS files
  const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  styleLinks.forEach((link, index) => {
    const href = link.getAttribute('href');
    if (href) {
      // First few CSS files have higher priority
      addResource(href, 'style', index < 2 ? 1 : 2);
    }
  });
  
  // Check for critical fonts
  const fontLinks = Array.from(document.querySelectorAll('link[rel="preload"][as="font"]'));
  fontLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      addResource(href, 'font', 1);
    }
  });
  
  // Check for critical images (first few visible images)
  const images = Array.from(document.querySelectorAll('img'));
  images.slice(0, 3).forEach((img, index) => {
    const src = img.getAttribute('src');
    if (src) {
      addResource(src, 'image', index === 0 ? 1 : 2);
    }
  });
  
  // Sort resources by priority
  resources.sort((a, b) => a.priority - b.priority);
  
  // Limit to the most critical resources (to avoid overwhelming the browser)
  return resources.slice(0, 6);
}

/**
 * Generate preload link tags from resource list
 */
function generatePreloadLinks(resources: Array<{ url: string, type: string, priority: number }>): string {
  let links = '';
  
  resources.forEach(resource => {
    let asValue = 'style';
    let crossorigin = '';
    
    if (resource.type === 'image') {
      asValue = 'image';
    } else if (resource.type === 'font') {
      asValue = 'font';
      crossorigin = ' crossorigin="anonymous"';
    } else if (resource.type === 'script') {
      asValue = 'script';
    }
    
    links += `<link rel="preload" href="${resource.url}" as="${asValue}"${crossorigin} importance="${resource.priority === 1 ? 'high' : 'low'}">\n`;
  });
  
  return links;
}

/**
 * Inject preload links into HTML
 */
function injectPreloadLinks(html: string, preloadLinks: string): string {
  if (!preloadLinks) return html;
  
  // Insert after existing meta tags before other link/style tags
  return html.replace(
    /(<\/head>)/i,
    `${preloadLinks}$1`
  );
}
