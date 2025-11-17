import DOMPurify from 'dompurify';

// Lightweight LRU cache to avoid re-sanitizing identical HTML on every render.
// This dramatically reduces CPU cost in the reader where many state changes occur (scroll, SSE, toggles).
const __sanitizeCache = new Map<string, string>();
const __MAX_SANITIZE_CACHE_ENTRIES = 256;
function __sanitizeCacheGet(key: string): string | undefined {
  const value = __sanitizeCache.get(key);
  if (value !== undefined) {
    // Move entry to the end to approximate LRU behavior
    try {
      __sanitizeCache.delete(key);
      __sanitizeCache.set(key, value);
    } catch { /* ignore */ }
  }
  return value;
}
function __sanitizeCacheSet(key: string, value: string): void {
  try {
    __sanitizeCache.set(key, value);
    if (__sanitizeCache.size > __MAX_SANITIZE_CACHE_ENTRIES) {
      const firstKey = __sanitizeCache.keys().next().value as string | undefined;
      if (typeof firstKey === 'string') {
        __sanitizeCache.delete(firstKey);
      }
    }
  } catch { /* ignore */ }
}

/**
 * Sanitize HTML using DOMPurify with a conservative configuration and
 * a small post-processing step to harden URLs and anchor attributes.
 *
 * - Forbids high-risk tags (script, iframe, form, etc.)
 * - Removes inline styles to avoid url() vectors
 * - Ensures external links opened in a new tab include rel="noopener noreferrer nofollow"
 * - Restricts href/src protocols to http(s), mailto, tel, relative paths and hash links
 * - Stabilizes images to reduce CLS by inferring missing width/height from common WordPress patterns
 */
export function sanitizeHtml(input: string): string {
  try {
    // Fast path: return cached value when available to avoid repeated heavy work.
    const fromCache = __sanitizeCacheGet(input);
    if (fromCache !== undefined) {
      return fromCache;
    }

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

    // Reduce CLS by stabilizing images: infer width/height when missing.
    const parseDimsFromUrl = (url: string): { w: number; h: number } | null => {
      try {
        if (!url) return null;
        // Look for common WordPress filename pattern: -{width}x{height}.ext
        const m = url.match(/-(\d{2,})x(\d{2,})(?=\.[a-z]{3,4})(?:\?|$)/i);
        if (m) {
          const w = parseInt(m[1], 10);
          const h = parseInt(m[2], 10);
          if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) return { w, h };
        }
        // Look for query params w,h or width,height
        const qidx = url.indexOf('?');
        if (qidx >= 0) {
          const search = url.slice(qidx + 1);
          const params = new URLSearchParams(search);
          const wq = params.get('w') || params.get('width');
          const hq = params.get('h') || params.get('height');
          const w = wq ? parseInt(wq, 10) : NaN;
          const h = hq ? parseInt(hq, 10) : NaN;
          if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) return { w, h };
        }
      } catch {
        // ignore
      }
      return null;
    };

    const trySetImageDims = (img: HTMLImageElement) => {
      const hasWidth = Number.isFinite(parseInt(img.getAttribute('width') || '', 10));
      const hasHeight = Number.isFinite(parseInt(img.getAttribute('height') || '', 10));
      if (hasWidth && hasHeight) return;

      // Try src then srcset candidates
      const candidates: string[] = [];
      const src = img.getAttribute('src') || '';
      if (src) candidates.push(src);
      const srcset = img.getAttribute('srcset') || '';
      if (srcset) {
        for (const part of srcset.split(',')) {
          const url = part.trim().split(/\s+/)[0]; // first token before descriptor
          if (url) candidates.push(url);
        }
      }

      for (const u of candidates) {
        const dims = parseDimsFromUrl(u);
        if (dims) {
          // Set both width and height to establish aspect ratio
          img.setAttribute('width', String(dims.w));
          img.setAttribute('height', String(dims.h));
          return;
        }
      }
      // No guess available; leave as-is. image-lazy.ts will set after load to reduce subsequent shifts.
    };

    // Apply stabilization and sensible defaults to images
    doc.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
      trySetImageDims(img);

      if (!img.getAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      if (!img.getAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
      // Strip unsafe protocols on src just in case (already handled above)
      const src = img.getAttribute('src') || '';
      if (src && !srcAllowed(src)) {
        img.removeAttribute('src');
      }
    });

    const output = doc.body.innerHTML;
    __sanitizeCacheSet(input, output);
    return output;
  } catch (err) {
    console.error('[sanitizeHtml] Failed to sanitize content:', err);
    return input;
  }
}