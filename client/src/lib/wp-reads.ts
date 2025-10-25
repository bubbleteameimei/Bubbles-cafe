// WordPress reads tracking via WordPress.com stats pixel
// Fires once per post when a reader has met gating criteria.

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

function getDailyKey(postId: number): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `wp_read_tracked_day_${postId}_${y}${m}${day}`;
}

/**
 * Trigger a WordPress.com stats pixel for a post view.
 * Returns true if a pixel request was initiated, false otherwise.
 * - Session de-duplication
 * - 24h de-duplication via localStorage
 * - Pre-set keys before dispatch to avoid duplicate firing during fast route changes
 */
export function trackWordPressRead(postId: number, postLink?: string): boolean {
  if (!postId || postId <= 0) return false;

  const sessionKey = `wp_read_tracked_${postId}`;
  const dayKey = getDailyKey(postId);

  // Prevent duplicate fires within the same session or same day
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(sessionKey)) {
    return false;
  }
  if (typeof localStorage !== 'undefined' && localStorage.getItem(dayKey)) {
    return false;
  }

  const url = buildPixelUrl(postId, postLink);

  try {
    // Pre-mark as tracked to throttle duplicates
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(sessionKey, '1');
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(dayKey, '1');
    }

    const img = new Image(1, 1);
    img.src = url;
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'eager';
    return true;
  } catch {
    return false;
  }
}