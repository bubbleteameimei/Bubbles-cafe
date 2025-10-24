// WordPress reads tracking via WordPress.com stats pixel
// Fires once per post when a reader has scrolled at least halfway.

const WORDPRESS_SITE_ID = 209809448; // bubbleteameimei.wordpress.com

function buildPixelUrl(postId: number, postLink?: string): string {
  const params = new URLSearchParams();
  params.set('v', 'wpcom');
  params.set('blog', String(WORDPRESS_SITE_ID));
  params.set('post', String(postId));
  // Timezone offset in minutes (Date#getTimezoneOffset returns minutes)
  params.set('tz', String(new Date().getTimezoneOffset()));
  // Server URL: prefer canonical WordPress post link, fallback to site home
  const srv = postLink && typeof postLink === 'string' && postLink.length > 0
    ? postLink
    : 'https://bubbleteameimei.wordpress.com/';
  params.set('srv', srv);
  // Cache buster
  params.set('rand', String(Math.floor(Math.random() * 1e9)));
  return `https://pixel.wp.com/g.gif?${params.toString()}`;
}

/**
 * Trigger a WordPress.com stats pixel for a post view.
 * Returns true if a pixel request was initiated, false otherwise.
 */
export function trackWordPressRead(postId: number, postLink?: string): boolean {
  if (!postId || postId <= 0) return false;

  // Prevent duplicate fires within the same session
  const key = `wp_read_tracked_${postId}`;
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key)) {
    return false;
  }

  const url = buildPixelUrl(postId, postLink);

  try {
    const img = new Image(1, 1);
    img.src = url;
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'eager';
    // Mark as tracked for this session
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(key, '1');
    }
    return true;
  } catch {
    return false;
  }
}