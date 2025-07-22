/**
 * Simple HTML sanitization utility to prevent XSS attacks
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param input HTML content to sanitize
 * @returns Sanitized string
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';

  // First strip script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove potential JavaScript event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');
  
  // Remove javascript: protocol from links
  sanitized = sanitized.replace(/javascript\s*:/gi, 'removed:');
  
  // Remove data: URLs (can be used for XSS in some browsers)
  sanitized = sanitized.replace(/data\s*:[^,]*?\/[^,]*?;base64/gi, 'removed:');
  
  // Remove anything between <style> tags
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove object tags
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  
  // Remove embed tags
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  
  // Remove form tags (prevent phishing)
  sanitized = sanitized.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
  
  // Log for debugging if in development
  if (process.env.NODE_ENV === 'development') {
    if (sanitized !== input) {
      console.log('[Sanitizer] Content was sanitized, potential XSS blocked');
    }
  }
  
  return sanitized;
}

/**
 * Strip all HTML tags and return plain text
 * @param html HTML content to strip
 * @returns Plain text
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  
  // Replace HTML entities with their actual characters
  const entities = [
    ['&nbsp;', ' '],
    ['&amp;', '&'],
    ['&lt;', '<'],
    ['&gt;', '>'],
    ['&quot;', '"'],
    ['&apos;', "'"]
  ];
  
  let text = html;
  entities.forEach(([entity, char]) => {
    text = text.replace(new RegExp(entity, 'g'), char);
  });
  
  // Strip all HTML tags
  return text.replace(/<[^>]*>?/gm, '');
}