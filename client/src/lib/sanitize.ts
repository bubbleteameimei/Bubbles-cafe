import DOMPurify from 'dompurify';

/**
 * Sanitize HTML using DOMPurify with a conservative configuration and
 * a small post-processing step to harden URLs and anchor attributes.
 *
 * - Forbids high-risk tags (script, iframe, form, etc.)
 * - Removes inline styles to avoid url() vectors
 * - Ensures external links opened in a new tab include rel="noopener noreferrer nofollow"
 * - Restricts href/src protocols to http(s), mailto, tel, relative paths and hash links
 */
export function sanitizeHtml(input: string): string {
  try {
    const sanitized = DOMPurify.sanitize(input, {
      // Keep DOMPurify defaults and forbid a few additional risky tags
      FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'button', 'link', 'meta'],
      // Drop inline styles for simplicity and safety in reader content
      FORBID_ATTR: ['style'],
      ADD_ATTR: ['target', 'rel'],
      // Keep default URI handling; we will enforce our own allowlist below
    }) as string;

    // Post-process the sanitized HTML to enforce protocol allowlist and rel attributes on anchors
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitized, 'text/html');

    // Allow only these URL schemes or relative routes
    const hrefAllowed = (href: string): boolean => {
      if (!href) return false;
      const lower = href.trim().toLowerCase();
      // Relative route or hash anchor
      if (lower.startsWith('/') || lower.startsWith('#')) return true;
      // Allowed absolute schemes
      if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('mailto:') || lower.startsWith('tel:')) {
        return true;
      }
      return false;
    };

    // Allow only http(s) or relative for src
    const srcAllowed = (src: string): boolean => {
      if (!src) return false;
      const lower = src.trim().toLowerCase();
      if (lower.startsWith('/') || lower.startsWith('http://') || lower.startsWith('https://')) return true;
      return false;
    };

    // Harden links
    doc.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (!hrefAllowed(href)) {
        a.removeAttribute('href');
      }

      // If it opens in a new tab, add security rel tokens
      const target = a.getAttribute('target');
      if (target && target.toLowerCase() === '_blank') {
        const rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
        const tokens = new Set(rel);
        tokens.add('noopener');
        tokens.add('noreferrer');
        tokens.add('nofollow');
        a.setAttribute('rel', Array.from(tokens).join(' '));
      }
    });

    // Harden sources for media
    doc.querySelectorAll<HTMLElement>('[src]').forEach((el) => {
      const src = el.getAttribute('src') || '';
      if (!srcAllowed(src)) {
        el.removeAttribute('src');
      }
    });

    return doc.body.innerHTML;
  } catch (err) {
    console.error('[sanitizeHtml] Failed to sanitize content:', err);
    return input;
  }
}