// WordPress API Import Script (CommonJS Version)
// This script imports posts from WordPress API to our database
const { Pool } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');
const ws = require('ws');

// Configure the database connection (directly, not using server/db.ts)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// WordPress API endpoint
const WP_API_URL = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com';

/**
 * Clean HTML content from WordPress to simpler format
 */
async function cleanContent(content) {
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
async function getOrCreateAdminUser() {
  try {
    // Check if admin user exists
    const existingUser = await pool.query(`
      SELECT id, username, email, is_admin
      FROM users
      WHERE email = 'vantalison@gmail.com'
    `);

    if (existingUser.rows.length > 0) {
      console.log("Found admin user with ID:", existingUser.rows[0].id);
      return existingUser.rows[0];
    }

    // Create new admin user if not exists
    const hashedPassword = await bcrypt.hash("admin123", 12);
    const newUser = await pool.query(`
      INSERT INTO users (username, email, password_hash, is_admin, created_at)
      VALUES ('vantalison', 'vantalison@gmail.com', $1, true, NOW())
      RETURNING id, username, email, is_admin
    `, [hashedPassword]);

    console.log("Created new admin user with ID:", newUser.rows[0].id);
    return newUser.rows[0];
  } catch (error) {
    console.error("Error getting/creating admin user:", error);
    throw error;
  }
}

/**
 * Fetch posts from WordPress API
 */
async function fetchWordPressPosts(page = 1, perPage = 20) {
  try {
    console.log(`Fetching WordPress posts - page ${page}, perPage ${perPage}`);
    const response = await fetch(
      `${WP_API_URL}/posts?page=${page}&per_page=${perPage}&_fields=id,date,title,content,excerpt,slug,categories`
    );

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }

    const posts = await response.json();
    console.log(`Retrieved ${posts.length} posts from WordPress API`);
    return posts;
  } catch (error) {
    console.error("Error fetching WordPress posts:", error);
    throw error;
  }
}

/**
 * Fetch category information from WordPress API
 */
async function fetchCategories() {
  try {
    console.log("Fetching WordPress categories");
    const response = await fetch(`${WP_API_URL}/categories?per_page=100`);
    
    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }
    
    const categories = await response.json();
    console.log(`Retrieved ${categories.length} categories from WordPress API`);
    
    // Convert to a map for easier lookup
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });
    
    return categoryMap;
  } catch (error) {
    console.error("Error fetching WordPress categories:", error);
    return {}; // Return empty object if categories can't be fetched
  }
}

/**
 * Main function to sync WordPress posts
 */
async function syncWordPressPosts() {
  const syncId = Date.now();
  const syncStartTime = new Date().toISOString();
  console.log(`[${syncStartTime}] Starting WordPress import (Sync #${syncId})...`);

  try {
    // Get admin user and category mapping
    const admin = await getOrCreateAdminUser();
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
      totalProcessed += wpPosts.length;
      
      if (wpPosts.length < perPage) {
        hasMorePosts = false;
      }
      
      // Process each post
      for (const wpPost of wpPosts) {
        try {
          const title = wpPost.title.rendered;
          const content = await cleanContent(wpPost.content.rendered);
          const pubDate = new Date(wpPost.date);
          const excerpt = wpPost.excerpt?.rendered
            ? (await cleanContent(wpPost.excerpt.rendered)).substring(0, 200) + '...'
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
                is_secret, created_at, mature_content, reading_time_minutes, 
                theme_category, metadata
              ) VALUES (
                $1, $2, $3, $4, $5, 
                false, $6, false, $7, 
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
            console.log(`Created post: "${title}" (ID: ${result.rows[0].id})`);
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
                metadata = $6
              WHERE id = $7
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
              postId
            ]);
            
            updated++;
            console.log(`Updated post: "${title}" (ID: ${postId})`);
          }
        } catch (error) {
          console.error(`Error processing post "${wpPost.title?.rendered}":`, error);
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
    
    console.log("\n=== WordPress Import Summary ===");
    console.log(`Time: ${syncStartTime} to ${syncEndTime}`);
    console.log(`Total posts processed: ${totalProcessed}`);
    console.log(`Posts created: ${created}`);
    console.log(`Posts updated: ${updated}`);
    console.log(`Duration: ${summary.duration}`);
    console.log("================================\n");
    
    return summary;
  } catch (error) {
    console.error("Error during WordPress sync:", error);
    throw error;
  }
}

// Run import when script is executed directly
syncWordPressPosts()
  .then(summary => {
    console.log("WordPress import completed successfully");
    process.exit(0);
  })
  .catch(error => {
    console.error("WordPress import failed:", error);
    process.exit(1);
  });