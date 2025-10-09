
/**
 * WordPress API Configuration
 */

export const WORDPRESS_CONFIG = {
  API_URL: '/api/wordpress/posts',
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  FALLBACK_ENABLED: true,
} as const;

export default WORDPRESS_CONFIG;
