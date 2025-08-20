
/**
 * WordPress API Configuration
 */

export const WORDPRESS_CONFIG = {
  API_URL: import.meta.env.VITE_WORDPRESS_API_URL || 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts',
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  FALLBACK_ENABLED: true,
} as const;

export default WORDPRESS_CONFIG;
