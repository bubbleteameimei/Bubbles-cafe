import { db } from '../server/db';
import { posts, users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import fetch from 'node-fetch';

// WordPress API endpoint
const WP_API_URL = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com';

// Interface for WordPress API response
interface WordPressPost {
  id: number;
  date: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  slug: string;
}

async function cleanContent(content: string): Promise<string> {
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
    .replace(/&#8220;/g, "\"")
    .replace(/&#8221;/g, "\"")
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

async function getOrCreateAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    console.log("Getting admin user with email: vantalison@gmail.com");
    
    // Query the database directly to get user info
    const queryResult = await db.execute(`
      SELECT id, username, email, is_admin
      FROM users
      WHERE email = 'vantalison@gmail.com'
    `);

    if (queryResult.rows.length > 0) {
      const existingAdmin = queryResult.rows[0];
      console.log("Admin user found with ID:", existingAdmin.id);
      return existingAdmin;
    }

    // Create a new admin user with the SQL that matches the actual table structure
    // @ts-ignore - DB execute expects one argument but we need both the query and params
    const insertResult = await db.execute(
      `INSERT INTO users (username, email, password_hash, is_admin, created_at)
      VALUES ('vantalison', 'vantalison@gmail.com', $1, true, NOW())
      RETURNING id, username, email, is_admin`,
      [hashedPassword]);

    const newAdmin = insertResult.rows[0];
    console.log("Admin user created successfully with ID:", newAdmin.id);
    return newAdmin;
  } catch (error) {
    console.error("Error in getOrCreateAdminUser:", error);
    throw error;
  }
}

async function fetchWordPressPosts(): Promise<WordPressPost[]> {
  try {
    const syncStartTime = new Date().toISOString();
    console.log(`[${syncStartTime}] Fetching posts from WordPress API...`);

    const response = await fetch(`${WP_API_URL}/posts?per_page=100&_fields=id,date,title,content,excerpt,slug`);

    if (!response.ok) {
      throw new Error(`WordPress API responded with status: ${response.status}`);
    }

    const posts = await response.json() as WordPressPost[];
    console.log(`[${syncStartTime}] Retrieved ${posts.length} posts from WordPress API`);
    return posts;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching WordPress posts:`, error);
    throw error;
  }
}

async function syncWordPressPosts() {
  const syncId = Date.now();
  const syncStartTime = new Date().toISOString();

  try {
    console.log(`[Sync #${syncId}] Starting WordPress API sync at ${syncStartTime}`);

    const admin = await getOrCreateAdminUser();
    const wpPosts = await fetchWordPressPosts();

    // Check if posts table has metadata column
    const postsTableInfo = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'posts'
    `);
    
    const postsColumns = postsTableInfo.rows.map(r => r.column_name);
    console.log("Available columns in posts table:", postsColumns);
    const hasMetadata = postsColumns.includes('metadata');

    let createdCount = 0;
    let updatedCount = 0;

    for (const wpPost of wpPosts) {
      try {
        const title = wpPost.title.rendered;
        const content = await cleanContent(wpPost.content.rendered);
        const pubDate = new Date(wpPost.date);
        const excerpt = wpPost.excerpt?.rendered
          ? (await cleanContent(wpPost.excerpt.rendered)).substring(0, 200) + '...'
          : content.substring(0, 200) + '...';

        const finalSlug = wpPost.slug;

        // Check if post exists
        // @ts-ignore - DB execute expects one argument but we need both the query and params
        const existingPostResult = await db.execute(
          `SELECT id FROM posts WHERE slug = $1`,
          [finalSlug]);

        const wordCount = content.split(/\s+/).length;
        const readingTimeMinutes = Math.ceil(wordCount / 200);

        if (existingPostResult.rows.length === 0) {
          // Insert new post
          let insertQuery = `
            INSERT INTO posts (
              title, content, excerpt, slug, author_id, 
              is_secret, created_at, mature_content, reading_time_minutes
          `;
          
          // Add metadata column if it exists
          if (hasMetadata) {
            insertQuery += `, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`;
          } else {
            insertQuery += `) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`;
          }
          
          // Create metadata if the column exists
          const metadataObj = {
            originalWordCount: wordCount,
            importSource: 'wordpress-api',
            importDate: new Date().toISOString(),
            wordpressId: wpPost.id,
            syncId: syncId
          };
          
          let params = [
            title, content, excerpt, finalSlug, admin.id,
            false, pubDate, false, readingTimeMinutes
          ];
          
          // Add metadata parameter if needed
          if (hasMetadata) {
            params.push(JSON.stringify(metadataObj));
          }
          
          // @ts-ignore - DB execute expects one argument but we need both the query and params
          const result = await db.execute(insertQuery, params);
          const newPostId = result.rows[0].id;
          
          createdCount++;
          console.log(`[Sync #${syncId}] Created post: "${title}" (ID: ${newPostId})`);
        } else {
          // Update existing post
          const existingPostId = existingPostResult.rows[0].id;
          
          let updateQuery = `
            UPDATE posts SET
              title = $1,
              content = $2,
              excerpt = $3,
              reading_time_minutes = $4
          `;
          
          let params = [title, content, excerpt, readingTimeMinutes];
          
          // Add metadata update if column exists
          if (hasMetadata) {
            const metadataObj = {
              originalWordCount: wordCount,
              importSource: 'wordpress-api',
              lastSyncDate: new Date().toISOString(),
              wordpressId: wpPost.id,
              syncId: syncId
            };
            
            updateQuery += `, metadata = $5 WHERE id = $6`;
            params.push(JSON.stringify(metadataObj), existingPostId);
          } else {
            updateQuery += ` WHERE id = $5`;
            params.push(existingPostId);
          }
          
          await db.execute(updateQuery, params);
          
          updatedCount++;
          console.log(`[Sync #${syncId}] Updated post: "${title}" (ID: ${existingPostId})`);
        }
      } catch (error) {
        console.error(`[Sync #${syncId}] Error processing WordPress post "${wpPost.title?.rendered}":`, error);
      }
    }

    const syncEndTime = new Date().toISOString();
    console.log(`\n[Sync #${syncId}] Sync Summary (${syncStartTime} - ${syncEndTime}):`);
    console.log(`- Total items processed: ${wpPosts.length}`);
    console.log(`- Posts created: ${createdCount}`);
    console.log(`- Posts updated: ${updatedCount}`);

    return {
      syncId,
      created: createdCount,
      updated: updatedCount,
      newContent: createdCount > 0 || updatedCount > 0,
      startTime: syncStartTime,
      endTime: syncEndTime
    };
  } catch (error) {
    console.error(`[Sync #${syncId}] Error during WordPress API sync:`, error);
    throw error;
  }
}

// Run once immediately when script is executed
if (process.argv[1].includes('custom-wp-sync.ts')) {
  console.log("Running WordPress API sync script directly...");
  syncWordPressPosts()
    .then(results => {
      console.log("Sync completed successfully:", results);
      process.exit(0);
    })
    .catch(error => {
      console.error("Sync failed:", error);
      process.exit(1);
    });
}

export { syncWordPressPosts };