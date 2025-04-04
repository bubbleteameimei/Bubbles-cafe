/**
 * WordPress Sync Module
 * This module provides functionality to import posts from WordPress API
 */
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { db } from './db-connect.js';
import { log } from './vite.js';

const { Pool } = pg;

// WordPress API endpoint
const WP_API_URL = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com';

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
 * Get or create an admin user in the database
 */
async function getOrCreateAdminUser(pool) {
  try {
    // Check if admin user exists
    const existingUser = await pool.query(`
      SELECT id, username, email, is_admin
      FROM users
      WHERE is_admin = true
      LIMIT 1
    `);

    if (existingUser.rows.length > 0) {
      log(`Found admin user with ID: ${existingUser.rows[0].id}`, 'wordpress-sync');
      return existingUser.rows[0];
    }

    // Create new admin user if not exists
    const hashedPassword = await bcrypt.hash("admin123", 12);
    const newUser = await pool.query(`
      INSERT INTO users (username, email, password_hash, is_admin, created_at)
      VALUES ('admin', 'admin@example.com', $1, true, NOW())
      RETURNING id, username, email, is_admin
    `, [hashedPassword]);

    log(`Created new admin user with ID: ${newUser.rows[0].id}`, 'wordpress-sync');
    return newUser.rows[0];
  } catch (error) {
    log(`Error getting/creating admin user: ${error.message}`, 'wordpress-sync');
    throw error;
  }
}

/**
 * Fetch posts from WordPress API using native fetch
 */
async function fetchWordPressPosts(page = 1, perPage = 20) {
  try {
    log(`Fetching WordPress posts - page ${page}, perPage ${perPage}`, 'wordpress-sync');
    const response = await fetch(
      `${WP_API_URL}/posts?page=${page}&per_page=${perPage}&_fields=id,date,title,content,excerpt,slug,categories`
    );

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
 * Fetch category information from WordPress API
 */
async function fetchCategories() {
  try {
    log("Fetching WordPress categories", 'wordpress-sync');
    const response = await fetch(`${WP_API_URL}/categories?per_page=100`);
    
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
            
          const metadataObj = {
            wordpressId: wpPost.id,
            importSource: 'wordpress-api',
            importDate: new Date().toISOString(),
            syncId: syncId,
            originalWordCount: wordCount,
            categories: categoryNames,
            originalDate: wpPost.date
          };
          
          // Check if post already exists by slug
          const existingPost = await pool.query(`
            SELECT id FROM posts WHERE slug = $1
          `, [slug]);
          
          if (existingPost.rows.length === 0) {
            // Create new post
            const result = await pool.query(`
              INSERT INTO posts (
                title, content, excerpt, slug, author_id, 
                is_secret, is_admin_post, created_at, mature_content, reading_time_minutes, 
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
              categoryNames[0] || 'General', // Use first category as theme_category
              JSON.stringify(metadataObj)
            ]);
            
            created++;
            log(`Created post: "${title}" (ID: ${result.rows[0].id})`, 'wordpress-sync');
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
                is_admin_post = $7
              WHERE id = $8
            `, [
              title, 
              content, 
              excerpt, 
              readingTimeMinutes,
              categoryNames[0] || 'General',
              JSON.stringify({
                ...metadataObj,
                lastUpdated: new Date().toISOString()
              }),
              false, // WordPress posts are never admin posts
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
    
    const response = await fetch(
      `${WP_API_URL}/posts/${wpPostId}?_fields=id,date,title,content,excerpt,slug,categories`
    );
    
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
      originalDate: wpPost.date
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
          is_secret, is_admin_post, created_at, mature_content, reading_time_minutes, 
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
        categoryNames[0] || 'General',
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
          is_admin_post = $7
        WHERE id = $8
      `, [
        title, 
        content, 
        excerpt, 
        readingTimeMinutes,
        categoryNames[0] || 'General',
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
    log(`Error syncing WordPress post ${wpPostId}: ${error.message}`, 'wordpress-sync');
    throw error;
  } finally {
    await pool.end();
  }
}