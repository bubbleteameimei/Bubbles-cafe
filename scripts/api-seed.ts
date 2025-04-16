import { posts, users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import fetch from 'node-fetch';

// Import our database connection module
import { initializeDatabaseConnection } from './connect-db';
import pushSchema from './db-push';
import setupDatabase from './setup-db';

// We'll initialize db in the main function
let db: any;

// WordPress API endpoint
const WP_API_URL = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com';

// Clean HTML content from WordPress
function cleanContent(content: string): string {
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
        .map((line: string) => `> ${line.trim()}`)
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

// Get or create admin user
async function getOrCreateAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash("powerPUFF7", 12);
    console.log("🔍 Checking for admin user with email: vantalison@gmail.com");

    // Check if admin user exists
    const existingAdmin = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.email, "vantalison@gmail.com"));

    if (existingAdmin && existingAdmin.length > 0) {
      console.log("✅ Admin user already exists with ID:", existingAdmin[0].id);
      return existingAdmin[0];
    }

    console.log("👤 Creating new admin user...");
    
    // Create new admin user
    const [newAdmin] = await db
      .insert(users)
      .values({
        username: "admin",
        email: "vantalison@gmail.com",
        password_hash: hashedPassword,
        isAdmin: true
      })
      .returning();

    console.log("✅ Admin user created successfully with ID:", newAdmin.id);
    return newAdmin;
  } catch (error) {
    console.error("❌ Error in getOrCreateAdminUser:", error);
    throw error;
  }
}

// Fetch posts from WordPress API
async function fetchWordPressPosts(page = 1, perPage = 20) {
  try {
    console.log(`🔄 Fetching WordPress posts - page ${page}, perPage ${perPage}`);
    const response = await fetch(
      `${WP_API_URL}/posts?page=${page}&per_page=${perPage}&_fields=id,date,title,content,excerpt,slug,categories`
    );

    // Handle case where we've reached the end of available posts
    if (response.status === 400) {
      console.log(`ℹ️ No more posts available after page ${page-1}`);
      return [];
    }

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }

    const postsData = await response.json() as any[];
    console.log(`✅ Retrieved ${postsData.length} posts from WordPress API`);
    return postsData;
  } catch (error) {
    console.error(`❌ Error fetching WordPress posts:`, error);
    // Don't throw errors for pagination issues
    if (error instanceof Error && error.message.includes('400 Bad Request')) {
      console.log("ℹ️ Reached the end of available posts");
      return [];
    }
    throw error;
  }
}

// Fetch category information from WordPress API
async function fetchCategories() {
  try {
    console.log("🔄 Fetching WordPress categories");
    const response = await fetch(`${WP_API_URL}/categories?per_page=100`);
    
    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }
    
    const categories = await response.json() as any[];
    console.log(`✅ Retrieved ${categories.length} categories from WordPress API`);
    
    // Convert to a map for easier lookup
    const categoryMap: {[key: number]: string} = {};
    categories.forEach((cat: any) => {
      categoryMap[cat.id] = cat.name;
    });
    
    return categoryMap;
  } catch (error) {
    console.error(`❌ Error fetching WordPress categories:`, error);
    return {}; // Return empty object if categories can't be fetched
  }
}

// Main seed function
async function seedFromWordPressAPI() {
  const syncId = Date.now();
  const syncStartTime = new Date().toISOString();
  console.log(`🚀 Starting WordPress import (Sync #${syncId})`);

  try {
    // Initialize database connection first
    console.log('🔄 Setting up database connection...');
    const connection = await initializeDatabaseConnection();
    db = connection.db;
    
    // Push schema to ensure tables exist
    await pushSchema();
    
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
          
          // Create metadata
          const categoryNames = wpPost.categories
            ? wpPost.categories.map((catId: number) => categories[catId]).filter(Boolean)
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
          const existingPost = await db
            .select()
            .from(posts)
            .where(eq(posts.slug, slug));
          
          if (existingPost.length === 0) {
            // Create new post
            const [newPost] = await db
              .insert(posts)
              .values({
                title, 
                content, 
                excerpt, 
                slug, 
                authorId: admin.id, 
                isSecret: false,
                isAdminPost: false,
                createdAt: pubDate,
                matureContent: false,
                readingTimeMinutes,
                themeCategory: categoryNames[0] || 'General',
                metadata: metadataObj as any
              })
              .returning();
            
            created++;
            console.log(`✅ Created post: "${title}" (ID: ${newPost.id})`);
          } else {
            // Update existing post
            const postId = existingPost[0].id;
            await db
              .update(posts)
              .set({
                title, 
                content, 
                excerpt, 
                readingTimeMinutes,
                themeCategory: categoryNames[0] || 'General',
                metadata: {
                  ...metadataObj,
                  lastUpdated: new Date().toISOString()
                } as any
              })
              .where(eq(posts.id, postId));
            
            updated++;
            console.log(`🔄 Updated post: "${title}" (ID: ${postId})`);
          }
        } catch (error) {
          console.error(`❌ Error processing post "${wpPost.title?.rendered}":`, error);
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
      duration: `${(new Date(syncEndTime).getTime() - new Date(syncStartTime).getTime()) / 1000} seconds`
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
    console.error(`❌ Error during WordPress sync:`, error);
    throw error;
  }
}

// Run the seed function if this file is executed directly
// Using import.meta.url check instead of require.main for ESM
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFromWordPressAPI().then(summary => {
    console.log('✅ Database seeded successfully:', summary);
    process.exit(0);
  }).catch(error => {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  });
}

export default seedFromWordPressAPI;