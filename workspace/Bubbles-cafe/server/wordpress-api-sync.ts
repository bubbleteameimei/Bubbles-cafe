import { db } from './db';
import { posts, users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

interface WordPressPost {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  categories: number[];
  tags: number[];
  featured_media: number;
  status: string;
  type: string;
  modified: string;
}

interface WordPressAuthor {
  id: number;
  name: string;
  slug: string;
  description: string;
  avatar_urls: Record<string, string>;
}

export class WordPressAPISync {
  private readonly baseUrl = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com';
  private readonly batchSize = 20;

  async syncAllPosts(): Promise<{ success: boolean; synced: number; errors: any[] }> {
    console.log('[WordPress Sync] Starting comprehensive sync...');
    
    let synced = 0;
    let page = 1;
    const errors: any[] = [];
    let hasMore = true;

    // Get or create admin user for WordPress posts
    let adminUser = await db.select().from(users).where(eq(users.email, 'admin@storytelling.com')).limit(1);
    if (adminUser.length === 0) {
      console.log('[WordPress Sync] Admin user not found, creating...');
      const [newAdmin] = await db.insert(users).values({
        username: 'admin',
        email: 'admin@storytelling.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        isAdmin: true,
        metadata: {
          fullName: 'Site Administrator',
          bio: 'WordPress content sync admin'
        }
      }).returning();
      adminUser = [newAdmin];
    }

    const adminUserId = adminUser[0].id;

    while (hasMore) {
      try {
        console.log(`[WordPress Sync] Fetching page ${page}...`);
        
        const response = await fetch(
          `${this.baseUrl}/posts?page=${page}&per_page=${this.batchSize}&status=publish&_fields=id,date,slug,title,content,excerpt,author,categories,tags,featured_media,status,type,modified`
        );

        if (!response.ok) {
          throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
        }

        const wpPosts: WordPressPost[] = await response.json();
        
        if (wpPosts.length === 0) {
          hasMore = false;
          break;
        }

        // Process each post
        for (const wpPost of wpPosts) {
          try {
            await this.syncSinglePost(wpPost, adminUserId);
            synced++;
            console.log(`[WordPress Sync] Synced post: ${wpPost.title.rendered}`);
          } catch (error) {
            console.error(`[WordPress Sync] Error syncing post ${wpPost.id}:`, error);
            errors.push({ postId: wpPost.id, error: error.message });
          }
        }

        // Check if there are more pages
        const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
        hasMore = page < totalPages;
        page++;

        // Add small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`[WordPress Sync] Error fetching page ${page}:`, error);
        errors.push({ page, error: error.message });
        hasMore = false;
      }
    }

    console.log(`[WordPress Sync] Completed. Synced ${synced} posts with ${errors.length} errors.`);
    
    return {
      success: errors.length === 0,
      synced,
      errors
    };
  }

  private async syncSinglePost(wpPost: WordPressPost, authorId: number): Promise<void> {
    // Clean and process content
    const cleanContent = this.cleanWordPressContent(wpPost.content.rendered);
    const cleanExcerpt = this.cleanWordPressContent(wpPost.excerpt.rendered);
    const cleanTitle = wpPost.title.rendered;

    // Calculate reading time (average 200 words per minute)
    const wordCount = cleanContent.split(/\s+/).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    // Generate unique slug
    const baseSlug = wpPost.slug || this.generateSlug(cleanTitle);
    const uniqueSlug = await this.ensureUniqueSlug(baseSlug, wpPost.id);

    // Determine theme category based on content and tags
    const themeCategory = this.determineThemeCategory(cleanContent, cleanTitle);

    // Check if post already exists
    const existingPost = await db.select().from(posts)
      .where(sql`metadata->>'wordpressId' = ${wpPost.id.toString()}`)
      .limit(1);

    const postData = {
      title: cleanTitle,
      content: cleanContent,
      excerpt: cleanExcerpt || this.generateExcerpt(cleanContent),
      slug: uniqueSlug,
      authorId: authorId,
      isSecret: false,
      isAdminPost: false,
      matureContent: this.detectMatureContent(cleanContent),
      themeCategory,
      readingTimeMinutes,
      likesCount: 0,
      dislikesCount: 0,
      metadata: {
        wordpressId: wpPost.id,
        originalAuthor: wpPost.author,
        wordpressSlug: wpPost.slug,
        categories: wpPost.categories,
        tags: wpPost.tags,
        featuredMedia: wpPost.featured_media,
        publishDate: wpPost.date,
        modifiedDate: wpPost.modified,
        source: 'wordpress_api',
        status: 'publish',
        isAdminPost: true,
        isCommunityPost: false
      }
    };

    if (existingPost.length > 0) {
      // Update existing post
      await db.update(posts)
        .set({
          ...postData,
          // Don't update createdAt for existing posts
        })
        .where(eq(posts.id, existingPost[0].id));
    } else {
      // Create new post
      await db.insert(posts).values(postData);
    }
  }

  private cleanWordPressContent(content: string): string {
    if (!content) return '';
    
    return content
      // Remove WordPress-specific HTML tags and shortcodes
      .replace(/\[caption[^\]]*\].*?\[\/caption\]/gs, '')
      .replace(/\[gallery[^\]]*\]/g, '')
      .replace(/\[embed[^\]]*\].*?\[\/embed\]/gs, '')
      // Clean up HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  private async ensureUniqueSlug(baseSlug: string, wpId: number): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await db.select().from(posts)
        .where(eq(posts.slug, slug))
        .limit(1);

      if (existing.length === 0) {
        break;
      }

      // Check if it's the same WordPress post (updating)
      const existingMetadata = existing[0].metadata as any;
      if (existingMetadata?.wordpressId === wpId) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private generateExcerpt(content: string): string {
    const plainText = content.replace(/<[^>]*>/g, '');
    const words = plainText.split(/\s+/).slice(0, 25);
    return words.join(' ') + (words.length >= 25 ? '...' : '');
  }

  private determineThemeCategory(content: string, title: string): string {
    const text = (content + ' ' + title).toLowerCase();
    
    if (text.includes('horror') || text.includes('scary') || text.includes('fear') || text.includes('blood')) {
      return 'horror';
    }
    if (text.includes('romance') || text.includes('love') || text.includes('heart')) {
      return 'romance';
    }
    if (text.includes('mystery') || text.includes('detective') || text.includes('crime')) {
      return 'mystery';
    }
    if (text.includes('adventure') || text.includes('journey') || text.includes('explore')) {
      return 'adventure';
    }
    if (text.includes('science') || text.includes('future') || text.includes('technology')) {
      return 'sci-fi';
    }
    if (text.includes('fantasy') || text.includes('magic') || text.includes('dragon')) {
      return 'fantasy';
    }
    
    return 'general';
  }

  private detectMatureContent(content: string): boolean {
    const matureKeywords = ['explicit', 'adult', 'mature', 'violence', 'graphic'];
    const text = content.toLowerCase();
    return matureKeywords.some(keyword => text.includes(keyword));
  }

  async getLastSyncStatus(): Promise<any> {
    try {
      const postCount = await db.select({ count: sql<number>`count(*)` }).from(posts);
      const wpPosts = await db.select({ count: sql<number>`count(*)` }).from(posts)
        .where(sql`metadata->>'source' = 'wordpress_api'`);

      return {
        totalPosts: postCount[0]?.count || 0,
        wordPressPosts: wpPosts[0]?.count || 0,
        lastSync: new Date().toISOString(),
        status: 'operational'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}

export const wordpressSync = new WordPressAPISync();