import { db } from './db';
import { posts, users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { determineThemeCategory as determineSharedThemeCategory, THEME_CATEGORIES as SHARED_THEME_CATEGORIES } from '@shared/theme-categories';

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

// Removed unused WordPressAuthor interface

export class WordPressAPISync {
  private readonly baseUrl = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com';
  private readonly batchSize = 20;

  /**
   * Pick a reasonable icon slug for a post based on theme and content/title.
   * Prefers shared theme catalog icon, but can refine based on keywords.
   */
  private pickThemeIcon(themeKey: string, title: string, content: string): string {
    const text = (String(title) + ' ' + String(content)).toLowerCase();

    // Keyword-driven hints
    if (text.includes('ghost') || text.includes('haunt') || text.includes('spirit')) return 'ghost';
    if (text.includes('vampire') || text.includes('dracula')) return 'moon';
    if (text.includes('wolf')) return 'dog';
    if (text.includes('knife') || text.includes('stab') || text.includes('cut')) return 'fork-knife';
    if (text.includes('car') || text.includes('drive')) return 'car';
    if (text.includes('radio') || text.includes('broadcast') || text.includes('signal')) return 'radio';
    if (text.includes('clock') || text.includes('time')) return 'clock';
    if (text.includes('skull') || text.includes('death') || text.includes('suicide')) return 'skull';
    if (text.includes('flame') || text.includes('hell') || text.includes('inferno') || text.includes('demon')) return 'flame';
    if (text.includes('forest') || text.includes('tree') || text.includes('folk')) return 'trees';
    if (text.includes('castle') || text.includes('gothic')) return 'castle';
    if (text.includes('bug') || text.includes('parasite') || text.includes('infect')) return 'bug';
    if (text.includes('cat') || text.includes('creature') || text.includes('monster')) return 'cat';
    if (text.includes('lab') || text.includes('science') || text.includes('experiment')) return 'flask';
    if (text.includes('apocalypse') || text.includes('nuclear') || text.includes('radiation')) return 'radiation';
    if (text.includes('city') || text.includes('urban') || text.includes('building')) return 'building';
    if (text.includes('dream') || text.includes('nightmare')) return 'moon-star';
    if (text.includes('box') || text.includes('cursed')) return 'box';

    // Fallback to shared theme catalog default icon
    const info = (SHARED_THEME_CATEGORIES as any)[themeKey];
    return info?.icon || 'ghost';
  }

  async syncAllPosts(): Promise<{ success: boolean; synced: number; errors: any[] }> {
    console.log('[WordPress Sync] Starting comprehensive sync...');
    
    let synced = 0;
    let page = 1;
    const errors: any[] = [];
    let hasMore = true;

    // Locate existing admin user for WordPress posts
    let adminUser = await db.select().from(users).where(eq(users.isAdmin, true)).limit(1);
    if (adminUser.length === 0) {
      throw new Error('[WordPress Sync] No admin user found. Create one securely before syncing.');
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
            errors.push({ postId: wpPost.id, error: error instanceof Error ? error.message : String(error) });
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
        errors.push({ page, error: error instanceof Error ? error.message : String(error) });
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

  /**
   * Public method to sync a single WordPress post by WordPress post ID
   */
  async syncOnePostById(wpId: number): Promise<{ success: boolean; synced: number; errors: any[] }> {
    try {
      // Locate existing admin user
      let adminUser = await db.select().from(users).where(eq(users.isAdmin, true)).limit(1);
      if (adminUser.length === 0) {
        throw new Error('[WordPress Sync] No admin user found. Create one securely before syncing.');
      }
      const adminUserId = adminUser[0].id;
      
      const response = await fetch(`${this.baseUrl}/posts/${wpId}?_fields=id,date,slug,title,content,excerpt,author,categories,tags,featured_media,status,type,modified`);
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
      }
      const wpPost: WordPressPost = await response.json();
      await this.syncSinglePost(wpPost, adminUserId);
      return { success: true, synced: 1, errors: [] };
    } catch (error) {
      return { success: false, synced: 0, errors: [{ postId: wpId, error: error instanceof Error ? error.message : String(error) }] };
    }
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

    // Determine theme category using shared categories (uppercase keys)
    const themeCategory = determineSharedThemeCategory(cleanTitle, cleanContent);

    // Check if post already exists
    const existingPost = await db.select().from(posts)
      .where(sql`metadata->>'wordpressId' = ${wpPost.id.toString()}`)
      .limit(1);

    const themeIcon = this.pickThemeIcon(themeCategory, cleanTitle, cleanContent);

    const postData = {
      title: cleanTitle,
      content: cleanContent,
      excerpt: cleanExcerpt || this.generateExcerpt(cleanContent),
      slug: uniqueSlug,
      authorId: authorId,
      isSecret: false,
      isAdminPost: true,
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
        isCommunityPost: false,
        themeIcon
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
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

export const wordpressSync = new WordPressAPISync();