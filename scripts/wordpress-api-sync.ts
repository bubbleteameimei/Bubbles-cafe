import { db } from '../server/db';
import { posts, users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import fetch from 'node-fetch';
import cron from 'node-cron';

// WordPress API endpoint configuration
const WP_API_URL = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com';

// Excluded post titles - these will be skipped during sync
const EXCLUDED_TITLES = ['Song', 'Journal', 'Nostalgia', 'Cave', 'Therapist', 'Rain'];

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
  console.log('Original content length:', content.length);

  // First pass: Remove WordPress-specific elements
  let cleaned = content
    // Remove all WordPress block comments and metadata
    .replace(/<!--\s*wp:([^>])*?-->/g, '')
    .replace(/<!--\s*\/wp:([^>])*?-->/g, '')
    // Remove social links and navigation
    .replace(/<div[^>]*class="wp-block-social-links[^>]*>[\s\S]*?<\/div>/g, '')
    .replace(/<ul[^>]*class="wp-block-social-links[^>]*>[\s\S]*?<\/ul>/g, '')
    .replace(/<div[^>]*class="wp-block-navigation[^>]*>[\s\S]*?<\/div>/g, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/g, '')
    .replace(/<menu[^>]*>[\s\S]*?<\/menu>/g, '')
    // Remove all link elements that contain specific keywords
    .replace(/<a[^>]*>(?:Twitter|Facebook|Instagram|WordPress|Song|Journal|Nostalgia|Cave|Therapist|Rain)<\/a>/g, '')
    // Remove any empty link elements
    .replace(/<a[^>]*>\s*<\/a>/g, '')
    // Remove any remaining menu items and navigation blocks
    .replace(/<div[^>]*class="menu[^>]*>[\s\S]*?<\/div>/g, '')
    .replace(/<ul[^>]*class="menu[^>]*>[\s\S]*?<\/ul>/g, '')
    // Clean up any empty containers
    .replace(/<div[^>]*>\s*<\/div>/g, '')
    .replace(/<p[^>]*>\s*<\/p>/g, '');

  // Second pass: Format for readability
  cleaned = cleaned
    .replace(/<h([1-6])>(.*?)<\/h\1>/g, (_, level, content) => {
      return `\n\n${content.trim()}\n\n`;
    })
    .replace(/<em>([^<]+)<\/em>/g, '_$1_')
    .replace(/<strong>([^<]+)<\/strong>/g, '**$1**')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/g, '\n\n')
    .replace(/<\/p>/g, '')
    // Remove any remaining HTML tags
    .replace(/<[^>]+>/g, '');

  // Third pass: Clean up special characters and whitespace
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();

  console.log('Cleaned content length:', cleaned.length);
  return cleaned;
}

async function getOrCreateAdminUser() {
  try {
    console.log("Getting admin user...");

    // First check if admin user exists
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.email, "vantalison@gmail.com")
    });

    if (existingAdmin) {
      console.log("Admin user found with ID:", existingAdmin.id);
      return existingAdmin;
    }

    // Create new admin user if doesn't exist
    const hashedPassword = await bcrypt.hash("admin123", 12);
    const [newAdmin] = await db
      .insert(users)
      .values({
        username: "vantalison",
        email: "vantalison@gmail.com",
        password_hash: hashedPassword,
        isAdmin: true
      })
      .returning();

    console.log("Admin user created with ID:", newAdmin.id);
    return newAdmin;
  } catch (error) {
    console.error("Error in getOrCreateAdminUser:", error);
    throw error;
  }
}

async function syncWordPressPosts() {
  const syncId = Date.now();
  const syncStartTime = new Date().toISOString();

  try {
    console.log(`[Sync #${syncId}] Starting WordPress API sync at ${syncStartTime}`);

    // Get admin user first
    const admin = await getOrCreateAdminUser();

    // Fetch posts with minimal fields
    const response = await fetch(`${WP_API_URL}/posts?per_page=100&_fields=id,date,title,content,excerpt,slug`);

    if (!response.ok) {
      throw new Error(`WordPress API responded with status: ${response.status}`);
    }

    const wpPosts = await response.json() as WordPressPost[];
    console.log(`[Sync #${syncId}] Retrieved ${wpPosts.length} posts`);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const post of wpPosts) {
      try {
        const title = post.title.rendered;

        // Skip excluded post titles
        if (EXCLUDED_TITLES.includes(title)) {
          console.log(`[Sync #${syncId}] Skipping excluded post: "${title}"`);
          skippedCount++;
          continue;
        }

        const content = await cleanContent(post.content.rendered);
        const pubDate = new Date(post.date);

        // Only proceed if content remains after cleaning
        if (content.trim().length > 0) {
          const excerpt = post.excerpt?.rendered
            ? (await cleanContent(post.excerpt.rendered)).substring(0, 200) + '...'
            : content.substring(0, 200) + '...';

          // Check if post exists
          const existingPost = await db.query.posts.findFirst({
            where: eq(posts.slug, post.slug)
          });

          const wordCount = content.split(/\s+/).length;
          const readingTimeMinutes = Math.ceil(wordCount / 200);

          if (!existingPost) {
            // Create new post
            await db
              .insert(posts)
              .values({
                title,
                content,
                excerpt,
                slug: post.slug,
                authorId: admin.id,
                isSecret: false,
                createdAt: pubDate,
                matureContent: false,
                readingTimeMinutes,
                metadata: {
                  originalWordCount: wordCount,
                  importSource: 'wordpress-api',
                  importDate: syncStartTime,
                  wordpressId: post.id,
                  syncId
                }
              });

            createdCount++;
            console.log(`[Sync #${syncId}] Created post: "${title}"`);
          } else {
            // Update existing post
            await db
              .update(posts)
              .set({
                title,
                content,
                excerpt,
                readingTimeMinutes,
                metadata: {
                  originalWordCount: wordCount,
                  importSource: 'wordpress-api',
                  lastSyncDate: syncStartTime,
                  wordpressId: post.id,
                  syncId
                }
              })
              .where(eq(posts.id, existingPost.id));

            updatedCount++;
            console.log(`[Sync #${syncId}] Updated post: "${title}"`);
          }
        } else {
          skippedCount++;
          console.log(`[Sync #${syncId}] Skipped empty post: "${title}"`);
        }
      } catch (error) {
        console.error(`[Sync #${syncId}] Error processing post "${post.title?.rendered}":`, error);
      }
    }

    const syncEndTime = new Date().toISOString();
    console.log(`\n[Sync #${syncId}] Sync Summary (${syncStartTime} - ${syncEndTime}):`);
    console.log(`- Total posts processed: ${wpPosts.length}`);
    console.log(`- Posts created: ${createdCount}`);
    console.log(`- Posts updated: ${updatedCount}`);
    console.log(`- Posts skipped: ${skippedCount}`);

    return {
      syncId,
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      startTime: syncStartTime,
      endTime: syncEndTime
    };
  } catch (error) {
    console.error(`[Sync #${syncId}] Error during WordPress API sync:`, error);
    throw error;
  }
}

// Run once immediately when script is executed
if (process.argv[1].includes('wordpress-api-sync.ts')) {
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

// Schedule regular syncing (default every 6 hours)
export function scheduleWordPressSync(cronSchedule = '0 */6 * * *') {
  console.log(`Scheduling WordPress sync with cron schedule: ${cronSchedule}`);

  return cron.schedule(cronSchedule, async () => {
    console.log(`Running scheduled WordPress sync at ${new Date().toISOString()}`);
    try {
      const results = await syncWordPressPosts();
      console.log("Scheduled sync completed:", results);
    } catch (error) {
      console.error("Scheduled sync failed:", error);
    }
  });
}

export { syncWordPressPosts, cleanContent };