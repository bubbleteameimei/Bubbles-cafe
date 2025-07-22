import { db } from '../server/db';
import { posts, users } from '../shared/schema';
import { eq } from 'drizzle-orm';

interface WordPressPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  date: string;
  status: string;
  categories: number[];
  tags: number[];
}

function cleanContent(content: string): string {
  return content
    .replace(/<!-- wp:paragraph -->/g, "")
    .replace(/<!-- \/wp:paragraph -->/g, "")
    .replace(/<!-- wp:social-links -->[\s\S]*?<!-- \/wp:social-links -->/g, "")
    .replace(/<!-- wp:latest-posts[\s\S]*?\/-->/g, "")
    .replace(/<em>(.*?)<\/em>/g, "_$1_")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p>/g, "\n")
    .replace(/<\/p>/g, "\n")
    .replace(/(?<![_\w]|^)_(?![_\w]|$)/g, "")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
    .trim();
}

async function fetchWordPressContent() {
  try {
    console.log('🔄 Fetching content from WordPress API...');
    
    const apiUrl = 'https://bubbleteameimei.wordpress.com/wp-json/wp/v2/posts';
    const response = await fetch(`${apiUrl}?per_page=100&status=publish`);
    
    if (!response.ok) {
      throw new Error(`WordPress API returned ${response.status}: ${response.statusText}`);
    }
    
    const wordpressPosts: WordPressPost[] = await response.json();
    console.log(`✅ Fetched ${wordpressPosts.length} posts from WordPress API`);
    
    return wordpressPosts;
  } catch (error) {
    console.error('❌ Error fetching WordPress content:', error);
    throw error;
  }
}

async function getOrCreateAdminUser() {
  try {
    // Check if admin user exists
    const [existingAdmin] = await db.select()
      .from(users)
      .where(eq(users.email, 'admin@storytelling.local'))
      .limit(1);
    
    if (existingAdmin) {
      console.log('✅ Admin user found:', existingAdmin.id);
      return existingAdmin;
    }
    
    throw new Error('Admin user not found. Please run the database setup first.');
  } catch (error) {
    console.error('❌ Error getting admin user:', error);
    throw error;
  }
}

async function syncWordPressContent() {
  try {
    console.log('🚀 Starting WordPress content sync...');
    
    // Get admin user
    const admin = await getOrCreateAdminUser();
    
    // Fetch WordPress content
    const wordpressPosts = await fetchWordPressContent();
    
    // Process each post
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const wpPost of wordpressPosts) {
      try {
        const cleanedContent = cleanContent(wpPost.content.rendered);
        const cleanedExcerpt = cleanContent(wpPost.excerpt.rendered) || cleanedContent.substring(0, 200) + '...';
        
        // Calculate reading time
        const readingTime = Math.ceil(cleanedContent.split(/\s+/).length / 200);
        
        // Check if post already exists
        const [existingPost] = await db.select()
          .from(posts)
          .where(eq(posts.slug, wpPost.slug))
          .limit(1);
        
        if (!existingPost) {
          // Create new post
          await db.insert(posts).values({
            title: wpPost.title.rendered,
            content: cleanedContent,
            excerpt: cleanedExcerpt,
            slug: wpPost.slug,
            authorId: admin.id,
            isAdminPost: true,
            matureContent: false,
            themeCategory: 'Horror', // Default category
            readingTimeMinutes: readingTime,
            metadata: {
              wordpressId: wpPost.id,
              originalDate: wpPost.date,
              categories: wpPost.categories,
              tags: wpPost.tags
            }
          });
          
          createdCount++;
          console.log(`✅ Created post: ${wpPost.title.rendered}`);
        } else {
          // Update existing post
          await db.update(posts)
            .set({
              title: wpPost.title.rendered,
              content: cleanedContent,
              excerpt: cleanedExcerpt,
              readingTimeMinutes: readingTime,
              metadata: {
                wordpressId: wpPost.id,
                originalDate: wpPost.date,
                categories: wpPost.categories,
                tags: wpPost.tags
              }
            })
            .where(eq(posts.slug, wpPost.slug));
          
          updatedCount++;
          console.log(`🔄 Updated post: ${wpPost.title.rendered}`);
        }
      } catch (error) {
        console.error(`❌ Error processing post ${wpPost.title.rendered}:`, error);
      }
    }
    
    console.log(`✅ WordPress sync completed: ${createdCount} created, ${updatedCount} updated`);
    
  } catch (error) {
    console.error('❌ WordPress sync failed:', error);
    throw error;
  }
}

// Run the sync
syncWordPressContent().catch((error) => {
  console.error('Critical error:', error);
  process.exit(1);
});