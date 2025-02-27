import { db } from '../server/db';
import { posts, users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import fetch from 'node-fetch';
import cron from 'node-cron';

// WordPress site URL and API endpoint
const WP_SITE_URL = 'https://bubbleteameimei.wordpress.com';
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
    // Remove WordPress blocks and widgets
    .replace(/<!-- wp:paragraph -->/g, "")
    .replace(/<!-- \/wp:paragraph -->/g, "")
    .replace(/<!-- wp:social-links -->[\s\S]*?<!-- \/wp:social-links -->/g, "")
    .replace(/<!-- wp:latest-posts[\s\S]*?\/-->/g, "")
    .replace(/<!-- wp:widget[\s\S]*?\/-->/g, "")
    .replace(/<ul class="wp-block-social-links[\s\S]*?<\/ul>/g, "")
    .replace(/<ul class="wp-block-latest-posts[\s\S]*?<\/ul>/g, "")
    .replace(/\[.*?\]/g, "") // Remove shortcodes

    // Convert HTML formatting to Markdown-style text
    .replace(/<em>(.*?)<\/em>/g, "_$1_")
    .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
    .replace(/<h[1-6]>(.*?)<\/h[1-6]>/g, (_, content) => `\n\n${content}\n\n`)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p>/g, "\n\n")
    .replace(/<\/p>/g, "\n")
    .replace(/<blockquote>(.*?)<\/blockquote>/g, "\n> $1\n")
    .replace(/<[^>]+>/g, "") // Remove any remaining HTML tags

    // Fix special characters and entities
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8230;/g, "...")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")

    // Clean up whitespace and formatting
    .replace(/\n{3,}/g, "\n\n") // Reduce multiple newlines to maximum two
    .replace(/^\s+|\s+$/g, "") // Trim start and end whitespace
    .replace(/[ \t]+/g, " ") // Normalize spaces and tabs
    .trim();
}

async function getOrCreateAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    console.log("Getting admin user with email: vantalison@gmail.com");

    // Check if admin user exists
    const [existingAdmin] = await db.select()
      .from(users)
      .where(eq(users.email, "vantalison@gmail.com"));

    if (existingAdmin) {
      console.log("Admin user found with ID:", existingAdmin.id);
      return existingAdmin;
    }

    // Create new admin user if doesn't exist
    const [newAdmin] = await db.insert(users).values({
      username: "vantalison",
      email: "vantalison@gmail.com",
      password_hash: hashedPassword,
      isAdmin: true
    }).returning();

    console.log("Admin user created successfully with ID:", newAdmin.id);
    return newAdmin;
  } catch (error) {
    console.error("Error in getOrCreateAdminUser:", error);
    throw error;
  }
}

async function fetchWordPressPosts(): Promise<WordPressPost[]> {
  try {
    console.log("Fetching posts from WordPress API...");
    const response = await fetch(`${WP_API_URL}/posts?per_page=100`);

    if (!response.ok) {
      throw new Error(`WordPress API responded with status: ${response.status}`);
    }

    const posts = await response.json() as WordPressPost[];
    console.log(`Retrieved ${posts.length} posts from WordPress API`);
    return posts;
  } catch (error) {
    console.error("Error fetching WordPress posts:", error);
    throw error;
  }
}

async function syncWordPressPosts() {
  try {
    console.log("Starting WordPress API sync process...");

    // Get admin user for post authorship
    const admin = await getOrCreateAdminUser();

    // Fetch posts from WordPress API
    const wpPosts = await fetchWordPressPosts();
    console.log(`Retrieved ${wpPosts.length} posts from WordPress API`);

    // Track existing slugs to prevent duplicates
    const existingSlugs = new Set<string>();
    let createdCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    for (const wpPost of wpPosts) {
      try {
        // Extract post data
        const title = wpPost.title.rendered;
        const rawContent = wpPost.content.rendered;
        const content = await cleanContent(rawContent);
        const pubDate = new Date(wpPost.date);
        const excerpt = wpPost.excerpt?.rendered
          ? (await cleanContent(wpPost.excerpt.rendered)).substring(0, 200) + '...'
          : content.substring(0, 200) + '...';

        // Generate slug from post data
        let baseSlug = wpPost.slug || title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        let finalSlug = baseSlug;
        let counter = 1;
        while (existingSlugs.has(finalSlug)) {
          finalSlug = `${baseSlug}-${counter}`;
          counter++;
        }
        existingSlugs.add(finalSlug);

        // Check if post already exists by WordPress ID
        const [existingPost] = await db.select()
          .from(posts)
          .where(eq(posts.slug, finalSlug));

        // Calculate word count and reading time
        const wordCount = content.split(/\s+/).length;
        const readingTimeMinutes = Math.ceil(wordCount / 200);

        if (!existingPost) {
          // Create new post
          const [newPost] = await db.insert(posts).values({
            title: title,
            content: content,
            excerpt: excerpt,
            slug: finalSlug,
            authorId: admin.id,
            isSecret: false,
            createdAt: pubDate,
            matureContent: false,
            readingTimeMinutes,
            metadata: {
              originalWordCount: wordCount,
              importSource: 'wordpress-api',
              importDate: new Date().toISOString(),
              wordpressId: wpPost.id
            }
          }).returning();

          createdCount++;
          console.log(`Created post: "${title}" (ID: ${newPost.id})`);
        } else {
          // Always update existing posts to ensure we have the latest content
          await db.update(posts)
            .set({
              title: title,
              content: content,
              excerpt: excerpt,
              readingTimeMinutes,
              metadata: {
                originalWordCount: wordCount,
                importSource: 'wordpress-api',
                lastSyncDate: new Date().toISOString(),
                wordpressId: wpPost.id
              }
            })
            .where(eq(posts.id, existingPost.id));

          updatedCount++;
          console.log(`Updated post: "${title}" (ID: ${existingPost.id})`);
        }
      } catch (error) {
        console.error(`Error processing WordPress post "${wpPost.title?.rendered}":`, error);
      }
    }

    console.log("\nSync Summary:");
    console.log(`- Total items processed: ${wpPosts.length}`);
    console.log(`- Posts created: ${createdCount}`);
    console.log(`- Posts updated: ${updatedCount}`);
    console.log(`- Posts skipped: ${skippedCount}`);

    return {
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      newContent: createdCount > 0 || updatedCount > 0
    };
  } catch (error) {
    console.error("Error during WordPress API sync:", error);
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

// Schedule regular syncing (every 6 hours by default)
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

export { syncWordPressPosts };