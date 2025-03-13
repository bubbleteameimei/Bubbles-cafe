import { WordPressContent } from "./content-analysis";

/**
 * Sanitizes HTML content from WordPress, with special handling for italics and other formatting
 * 
 * @param content Raw WordPress content or string content
 * @returns Sanitized HTML with preserved essential formatting
 */
export const sanitizeHtmlContent = (content: string | WordPressContent | unknown): string => {
  if (!content) return '';
  
  // Process content based on type
  let htmlContent: string;
  
  if (typeof content === 'string') {
    htmlContent = content;
  } else if (typeof content === 'object' && content !== null) {
    // Handle WordPress content format
    const wpContent = content as WordPressContent;
    if (wpContent.rendered && typeof wpContent.rendered === 'string') {
      htmlContent = wpContent.rendered;
    } else {
      return ''; // No content to process
    }
  } else {
    return ''; // No content to process
  }
  
  // Fix italics formatting - WordPress uses <em> tags
  // First, ensure all <em> tags are properly closed
  htmlContent = fixUnclosedTags(htmlContent, 'em');
  
  // Add some basic sanitization for security
  htmlContent = htmlContent
    // Remove potentially dangerous script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove inline event handlers (onclick, etc.)
    .replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^>\s]*)/gi, '');
  
  // Normalize paragraph tags (sometimes WordPress has weird formatting)
  htmlContent = normalizeParagraphs(htmlContent);
    
  return htmlContent;
};

/**
 * Ensures all specified tags in HTML are properly closed
 * 
 * @param html HTML content to fix
 * @param tagName Name of the tag to fix
 * @returns HTML with properly closed tags
 */
const fixUnclosedTags = (html: string, tagName: string): string => {
  const openingTagRegex = new RegExp(`<${tagName}[^>]*>`, 'gi');
  const closingTagRegex = new RegExp(`</${tagName}>`, 'gi');
  
  // Count opening and closing tags
  const openingMatches = html.match(openingTagRegex) || [];
  const closingMatches = html.match(closingTagRegex) || [];
  
  // If balanced, return as is
  if (openingMatches.length === closingMatches.length) {
    return html;
  }
  
  // If unbalanced, try to fix
  if (openingMatches.length > closingMatches.length) {
    // More opening than closing - add missing closing tags at the end
    let result = html;
    const diff = openingMatches.length - closingMatches.length;
    for (let i = 0; i < diff; i++) {
      // Add at end of paragraph or before next block element
      result = result.replace(/<\/p>|<div|<h[1-6]|<ul|<ol|<blockquote/i, `</${tagName}>$&`);
    }
    return result;
  } else {
    // More closing than opening - remove excess closing tags
    // This is harder to fix properly, so we just return the original
    // A better solution would require more sophisticated HTML parsing
    return html;
  }
};

/**
 * Normalizes paragraph tags that might be malformed from WordPress
 * 
 * @param html HTML content to normalize
 * @returns Normalized HTML with proper paragraph structure
 */
const normalizeParagraphs = (html: string): string => {
  // Replace consecutive <br> tags with paragraphs
  html = html.replace(/(<br\s*\/?>\s*){2,}/gi, '</p><p>');
  
  // Ensure content starts with a paragraph if it doesn't have one
  if (!html.trim().startsWith('<p>')) {
    html = '<p>' + html;
  }
  
  // Ensure content ends with a closing paragraph if it doesn't have one
  if (!html.trim().endsWith('</p>')) {
    html = html + '</p>';
  }
  
  return html;
};

/**
 * Extracts plain text from HTML content
 * 
 * @param html HTML content to extract text from
 * @returns Plain text with no HTML tags
 */
export const extractTextFromHtml = (html: string): string => {
  return html.replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Preserves italics but removes other HTML formatting
 * 
 * @param html HTML content to process
 * @returns Simplified HTML with only italic formatting preserved
 */
export const preserveItalicsOnly = (html: string): string => {
  return html
    // Replace italic tags with temporary markers
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '__ITALIC_START__$1__ITALIC_END__')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '__ITALIC_START__$1__ITALIC_END__')
    // Remove all other HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Restore italic formatting
    .replace(/__ITALIC_START__(.*?)__ITALIC_END__/g, '<em>$1</em>')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
};