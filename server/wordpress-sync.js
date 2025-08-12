/**
 * WordPress Sync Module
 * This module provides functionality to import posts from WordPress API
 */
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { db } from './db-connect.js';
import { log } from './vite.js';
import { determineThemeCategory as determineThemeCategoryFromShared, STORY_THEME_MAPPING } from '../shared/theme-categories.js';

const { Pool } = pg;

// WordPress API endpoint - configurable via environment variable
const WP_API_URL = process.env.WORDPRESS_API_URL || 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com';

/**
 * Clean HTML content from WordPress to simpler format
 */
function cleanContent(content) {
  if (!content) return '';
  
  return content
    // Remove WordPress-specific elements
    .replace(/<!-- wp:([^>])*?-->/g, '')
    .replace(/<!-- \/wp:([^>])*?-->/g, '')
    .replace(/<ul class="wp-block[^>]*>[\s\S]*?<\/ul>/g, '')
    .replace(/<div class="wp-block[^>]*>[\s\S]*?<\/div>/g, '')
    .replace(/\[caption[^\]]*\][\s\S]*?\[\/caption\]/g, '')
    .replace(/\[gallery[^\]]*\][\s\S]*?\[\/gallery\]/g, '')
    .replace(/\[[^\]]+\]/g, '')
    // Convert HTML to Markdown
    .replace(/<h([1-6])>(.*?)<\/h\1>/g, (_, level, content) => {
      const hashes = '#'.repeat(parseInt(level));
      return `\n\n${hashes} ${content.trim()}\n\n`;
    })
    .replace(/<em>([^<]+)<\/em>/g, '_$1_')
    .replace(/<i>([^<]+)<\/i>/g, '_$1_')
    .replace(/<strong>([^<]+)<\/strong>/g, '**$1**')
    .replace(/<b>([^<]+)<\/b>/g, '**$1**')
    .replace(/<li>(.*?)<\/li>/g, '- $1\n')
    .replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, (_, content) => {
      return content.split('\n')
        .map(line => `> ${line.trim()}`)
        .join('\n');
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/g, '\n\n')
    .replace(/<\/p>/g, '\n\n')
    .replace(/<[^>]+>/g, '')
    // Fix special characters
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '…')
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    // Clean up whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}

/**
 * Determine theme category by analyzing title and content
 * 
 * This function examines post content to assign the most appropriate
 * horror theme category based on keywords and context.
 */
function determineThemeCategory(title, content) {
  // Use the shared determineThemeCategory function for consistent theme mapping across the application
  const themeResult = determineThemeCategoryFromShared(title, content);
  
  // Map from our theme constants to database-friendly values
  // This helps maintain compatibility with the existing database entries
  // using the old theme values ('Body Horror' instead of 'BODY_HORROR')
  const themeMapping = {
    'DEATH': 'Death',
    'BODY_HORROR': 'Body Horror',
    'SUPERNATURAL': 'Supernatural',
    'PSYCHOLOGICAL': 'Psychological',
    'EXISTENTIAL': 'Existential',
    'HORROR': 'Horror',
    'STALKING': 'Stalking',
    'CANNIBALISM': 'Cannibalism',
    'PSYCHOPATH': 'Psychopath',
    'DOPPELGANGER': 'Doppelgänger',
    'VEHICULAR': 'Vehicular',
    'PARASITE': 'Parasite',
    'TECHNOLOGICAL': 'Technological',
    'COSMIC': 'Cosmic',
    'UNCANNY': 'Uncanny'
  };
  
  // If we have a direct match in our mapping, use it
  if (themeMapping[themeResult]) {
    return themeMapping[themeResult];
  }
  
  // Special case for exact title matching - this is our most reliable method
  // Direct mapping from title to theme category for specific stories
  const uppercaseTitle = title.toUpperCase().trim();
  for (const [keyword, theme] of Object.entries(STORY_THEME_MAPPING)) {
    if (uppercaseTitle === keyword) {
      return themeMapping[theme] || theme;
    }
  }
  
  // Default case
  return 'Horror';
}

/**
 * Get or create the single admin user in the database
 * Always ensures vantalison@gmail.com is the only admin account
 */
async function getOrCreateAdminUser(pool) {
  try {
    // First, remove admin privileges from any other users except vantalison@gmail.com
    await pool.query(`
      UPDATE users SET is_admin = false 
      WHERE email != 'vantalison@gmail.com' AND is_admin = true
    `);

    // Always use vantalison@gmail.com as the primary admin
    const existingUser = await pool.query(`
      SELECT id, username, email, is_admin
      FROM users
      WHERE email = 'vantalison@gmail.com'
      LIMIT 1
    `);

    if (existingUser.rows.length > 0) {
      // Ensure this user is admin and update password
      const hashedPassword = await bcrypt.hash("admin124", 12);
      await pool.query(`
        UPDATE users SET is_admin = true, username = 'vantalison', password_hash = $1
        WHERE email = 'vantalison@gmail.com'
      `, [hashedPassword]);
      
      log(`Found and updated admin user with ID: ${existingUser.rows[0].id}`, 'wordpress-sync');
      return { ...existingUser.rows[0], is_admin: true };
    }

    // Create vantalison@gmail.com admin user if it doesn't exist
    const hashedPassword = await bcrypt.hash("admin124", 12);
    const newUser = await pool.query(`
      INSERT INTO users (username, email, password_hash, is_admin, created_at)
      VALUES ('vantalison', 'vantalison@gmail.com', $1, true, NOW())
      RETURNING id, username, email, is_admin
    `, [hashedPassword]);

    log(`Created admin user vantalison@gmail.com with ID: ${newUser.rows[0].id}`, 'wordpress-sync');
    return newUser.rows[0];
  } catch (error) {
    log(`Error getting/creating admin user: ${error.message}`, 'wordpress-sync');
    throw error;
  }
}

/**
 * Fetch posts from WordPress API using native fetch with enhanced error handling
 */
async function fetchWordPressPosts(page = 1, perPage = 20) {
  try {
    log(`Fetching WordPress posts - page ${page}, perPage ${perPage}`, 'wordpress-sync');
    
    // Create a fetch request with timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    const response = await fetch(
      `${WP_API_URL}/posts?page=${page}&per_page=${perPage}&_fields=id,date,title,content,excerpt,slug,categories`,
      { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    ).finally(() => {
      clearTimeout(timeoutId); // Always clear the timeout
    });

    // Handle case where we've reached the end of available posts
    if (response.status === 400) {
      log(`No more posts available after page ${page-1}`, 'wordpress-sync');
      return [];
    }

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }

    const posts = await response.json();
    log(`Retrieved ${posts.length} posts from WordPress API`, 'wordpress-sync');
    return posts;
  } catch (error) {
    // Handle timeout errors specifically
    if (error.name === 'AbortError') {
      log(`WordPress API request timed out after 20 seconds`, 'wordpress-sync');
      throw new Error('WordPress API request timed out');
    }
    
    log(`Error fetching WordPress posts: ${error.message}`, 'wordpress-sync');
    // Don't throw errors for pagination issues
    if (error.message && error.message.includes('400 Bad Request')) {
      log("Reached the end of available posts", 'wordpress-sync');
      return [];
    }
    throw error;
  }
}

/**
 * Fetch category information from WordPress API with enhanced error handling
 */
async function fetchCategories() {
  try {
    log("Fetching WordPress categories", 'wordpress-sync');
    
    // Create a fetch request with timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    const response = await fetch(
      `${WP_API_URL}/categories?per_page=100`,
      { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    ).finally(() => {
      clearTimeout(timeoutId); // Always clear the timeout
    });
    
    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }
    
    const categories = await response.json();
    log(`Retrieved ${categories.length} categories from WordPress API`, 'wordpress-sync');
    
    // Convert to a map for easier lookup
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });
    
    return categoryMap;
  } catch (error) {
    // Handle timeout errors specifically
    if (error.name === 'AbortError') {
      log(`WordPress categories API request timed out after 20 seconds`, 'wordpress-sync');
      return {}; // Return empty object on timeout
    }
    
    log(`Error fetching WordPress categories: ${error.message}`, 'wordpress-sync');
    return {}; // Return empty object if categories can't be fetched
  }
}

/**
 * Main function to sync WordPress posts
 */
export async function syncWordPressPosts() {
  const syncId = Date.now();
  const syncStartTime = new Date().toISOString();
  log(`Starting WordPress import (Sync #${syncId})`, 'wordpress-sync');

  // Configure direct database connection for better performance with complex queries
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    // Get admin user and category mapping
    const admin = await getOrCreateAdminUser(pool);
    const categories = await fetchCategories();
    
    // Counters for summary
    let totalProcessed = 0;
    let created = 0;
    let updated = 0;
    let page = 1;
    let hasMorePosts = true;
    const perPage = 20;
    
    // Paginate through all WordPress posts
    while (hasMorePosts) {
      const wpPosts = await fetchWordPressPosts(page, perPage);
      
      if (wpPosts.length === 0) {
        hasMorePosts = false;
        continue;
      }
      
      totalProcessed += wpPosts.length;
      
      if (wpPosts.length < perPage) {
        hasMorePosts = false;
      }
      
      // Process each post
      for (const wpPost of wpPosts) {
        try {
          const title = wpPost.title.rendered;
          const content = cleanContent(wpPost.content.rendered);
          const pubDate = new Date(wpPost.date);
          const excerpt = wpPost.excerpt?.rendered
            ? cleanContent(wpPost.excerpt.rendered).substring(0, 200) + '...'
            : content.substring(0, 200) + '...';
          const slug = wpPost.slug;
          
          // Calculate reading time (rough estimate based on word count)
          const wordCount = content.split(/\s+/).length;
          const readingTimeMinutes = Math.ceil(wordCount / 200);
          
          // Create metadata (using the column that exists in the posts table)
          const categoryNames = wpPost.categories
            ? wpPost.categories.map(catId => categories[catId]).filter(Boolean)
            : [];
          
          // Determine theme category based on content and title
          let themeCategory = determineThemeCategory(title, content);
            
          const metadataObj = {
            wordpressId: wpPost.id,
            importSource: 'wordpress-api',
            importDate: new Date().toISOString(),
            syncId: syncId,
            originalWordCount: wordCount,
            categories: categoryNames,
            originalDate: wpPost.date,
            themeCategory: themeCategory // Add detected theme
          };
          
          // Check if post already exists by slug
          const existingPost = await pool.query(`
            SELECT id FROM posts WHERE slug = $1
          `, [slug]);
          
          if (existingPost.rows.length === 0) {
            // Create new post - all WordPress posts are admin posts and should not appear in community
            const result = await pool.query(`
              INSERT INTO posts (
                title, content, excerpt, slug, author_id, 
                is_secret, "isAdminPost", created_at, mature_content, reading_time_minutes, 
                theme_category, metadata
              ) VALUES (
                $1, $2, $3, $4, $5, 
                false, true, $6, false, $7, 
                $8, $9
              ) RETURNING id
            `, [
              title, 
              content, 
              excerpt, 
              slug, 
              admin.id, 
              pubDate, 
              readingTimeMinutes,
              themeCategory || categoryNames[0] || 'General',
              JSON.stringify({
                ...metadataObj,
                isWordPressPost: true,
                excludeFromCommunity: true // Explicitly mark to exclude from community feeds
              })
            ]);
            
            created++;
            log(`Created post: "${title}" (ID: ${result.rows[0].id})`, 'wordpress-sync');
          } else {
            // Update existing post - ensure it's marked as admin post and excluded from community
            const postId = existingPost.rows[0].id;
            await pool.query(`
              UPDATE posts SET
                title = $1,
                content = $2,
                excerpt = $3,
                reading_time_minutes = $4,
                theme_category = $5,
                metadata = $6,
                "isAdminPost" = $7,
                author_id = $8,
                created_at = $9
              WHERE id = $10
            `, [
              title, 
              content, 
              excerpt, 
              readingTimeMinutes,
              themeCategory || categoryNames[0] || 'General',
              JSON.stringify({
                ...metadataObj,
                lastUpdated: new Date().toISOString(),
                isWordPressPost: true,
                excludeFromCommunity: true // Explicitly mark to exclude from community feeds
              }),
              true, // WordPress posts are always admin posts
              admin.id, // Ensure author is the admin user
              pubDate, // Use the original publication date
              postId
            ]);
            
            updated++;
            log(`Updated post: "${title}" (ID: ${postId})`, 'wordpress-sync');
          }
        } catch (error) {
          log(`Error processing post "${wpPost.title?.rendered}": ${error.message}`, 'wordpress-sync');
        }
      }
      
      page++;
    }
    
    const syncEndTime = new Date().toISOString();
    const summary = {
      syncId,
      startTime: syncStartTime,
      endTime: syncEndTime,
      totalProcessed,
      created,
      updated,
      duration: `${(new Date(syncEndTime) - new Date(syncStartTime)) / 1000} seconds`
    };
    
    log("\n=== WordPress Import Summary ===", 'wordpress-sync');
    log(`Time: ${syncStartTime} to ${syncEndTime}`, 'wordpress-sync');
    log(`Total posts processed: ${totalProcessed}`, 'wordpress-sync');
    log(`Posts created: ${created}`, 'wordpress-sync');
    log(`Posts updated: ${updated}`, 'wordpress-sync');
    log(`Duration: ${summary.duration}`, 'wordpress-sync');
    log("================================\n", 'wordpress-sync');
    
    return summary;
  } catch (error) {
    log(`Error during WordPress sync: ${error.message}`, 'wordpress-sync');
    throw error;
  } finally {
    // Close pool connection when done
    await pool.end();
  }
}

/**
 * Run a WordPress import on a schedule (can be called from cron job)
 * Default interval is every 5 minutes
 */
export function setupWordPressSyncSchedule(intervalMs = 5 * 60 * 1000) {
  log(`Setting up WordPress sync schedule (every ${intervalMs / (60 * 1000)} minutes)`, 'wordpress-sync');
  
  // Run once at startup
  syncWordPressPosts().catch(err => {
    log(`Error in initial WordPress sync: ${err.message}`, 'wordpress-sync');
  });
  
  // Set up interval
  const intervalId = setInterval(() => {
    syncWordPressPosts().catch(err => {
      log(`Error in scheduled WordPress sync: ${err.message}`, 'wordpress-sync');
    });
  }, intervalMs);
  
  return intervalId;
}

/**
 * Handle single WordPress post sync by ID
 */
export async function syncSingleWordPressPost(wpPostId) {
  // Configure direct database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    log(`Fetching single WordPress post ID: ${wpPostId}`, 'wordpress-sync');
    
    // Create a fetch request with timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    const response = await fetch(
      `${WP_API_URL}/posts/${wpPostId}?_fields=id,date,title,content,excerpt,slug,categories`,
      { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    ).finally(() => {
      clearTimeout(timeoutId); // Always clear the timeout
    });
    
    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }
    
    const wpPost = await response.json();
    const admin = await getOrCreateAdminUser(pool);
    const categories = await fetchCategories();

    const title = wpPost.title.rendered;
    const content = cleanContent(wpPost.content.rendered);
    const pubDate = new Date(wpPost.date);
    const excerpt = wpPost.excerpt?.rendered
      ? cleanContent(wpPost.excerpt.rendered).substring(0, 200) + '...'
      : content.substring(0, 200) + '...';
    const slug = wpPost.slug;
    
    // Calculate reading time
    const wordCount = content.split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);
    
    // Determine theme category based on content and title
    let themeCategory = determineThemeCategory(title, content);
    
    // Create metadata
    const categoryNames = wpPost.categories
      ? wpPost.categories.map(catId => categories[catId]).filter(Boolean)
      : [];
      
    const metadataObj = {
      wordpressId: wpPost.id,
      importSource: 'wordpress-api-single',
      importDate: new Date().toISOString(),
      originalWordCount: wordCount,
      categories: categoryNames,
      originalDate: wpPost.date,
      themeCategory: themeCategory // Add detected theme
    };
    
    // Check if post already exists by slug
    const existingPost = await pool.query(`
      SELECT id FROM posts WHERE slug = $1
    `, [slug]);
    
    let result;
    
    if (existingPost.rows.length === 0) {
      // Create new post
      result = await pool.query(`
        INSERT INTO posts (
          title, content, excerpt, slug, author_id, 
          is_secret, "isAdminPost", created_at, mature_content, reading_time_minutes, 
          theme_category, metadata
        ) VALUES (
          $1, $2, $3, $4, $5, 
          false, false, $6, false, $7, 
          $8, $9
        ) RETURNING id
      `, [
        title, 
        content, 
        excerpt, 
        slug, 
        admin.id, 
        pubDate, 
        readingTimeMinutes,
        themeCategory || categoryNames[0] || 'General',
        JSON.stringify(metadataObj)
      ]);
      
      log(`Created post: "${title}" (ID: ${result.rows[0].id})`, 'wordpress-sync');
      return { id: result.rows[0].id, title, action: 'created' };
    } else {
      // Update existing post
      const postId = existingPost.rows[0].id;
      await pool.query(`
        UPDATE posts SET
          title = $1,
          content = $2,
          excerpt = $3,
          reading_time_minutes = $4,
          theme_category = $5,
          metadata = $6,
          "isAdminPost" = $7
        WHERE id = $8
      `, [
        title, 
        content, 
        excerpt, 
        readingTimeMinutes,
        themeCategory || categoryNames[0] || 'General',
        JSON.stringify({
          ...metadataObj,
          lastUpdated: new Date().toISOString()
        }),
        false, // WordPress posts are never admin posts
        postId
      ]);
      
      log(`Updated post: "${title}" (ID: ${postId})`, 'wordpress-sync');
      return { id: postId, title, action: 'updated' };
    }
  } catch (error) {
    // Handle timeout errors specifically
    if (error.name === 'AbortError') {
      log(`WordPress post API request for ID ${wpPostId} timed out after 20 seconds`, 'wordpress-sync');
      throw new Error(`WordPress API request timed out for post ID ${wpPostId}`);
    }
    
    log(`Error syncing WordPress post ${wpPostId}: ${error.message}`, 'wordpress-sync');
    throw error;
  } finally {
    await pool.end();
  }
}