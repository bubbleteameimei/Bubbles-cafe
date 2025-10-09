import { XMLParser } from 'fast-xml-parser';
import fs from 'fs/promises';
import path from 'path';
import { db } from '../server/db.js';
import { posts, users } from '../shared/schema.js';
import { createHash } from 'crypto';
import { eq } from 'drizzle-orm';
import { fetchWordPressPosts, convertWordPressPost } from '../client/src/services/wordpress';

async function importWordPressContent() {
  try {
    console.log('Starting WordPress import...');

    // Locate non-admin content author (do not create automatically)
    const authorEmail = process.env.CONTENT_AUTHOR_EMAIL;
    let [defaultAuthor] = authorEmail
      ? await db.select().from(users).where(eq(users.email, authorEmail)).limit(1)
      : await db.select().from(users).where(eq(users.isAdmin, false)).limit(1);

    if (!defaultAuthor) {
      // Create a non-admin import author if none exists
      const seedEmail = authorEmail || (process.env.WP_IMPORT_AUTHOR_EMAIL || 'wordpress_import@local');
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashed = createHash('sha256').update(randomPassword).digest('hex');

      const [createdAuthor] = await db
        .insert(users)
        .values({
          username: 'wordpress_import',
          email: seedEmail,
          password_hash: hashed,
          isAdmin: false,
          metadata: { system: 'wp-import' }
        })
        .returning();

      defaultAuthor = createdAuthor;
    }

    console.log('Fetching posts from WordPress API...');

    // Fetch all posts from WordPress API
    const wpPosts = await fetchWordPressPosts();
    console.log(`Found ${wpPosts.length} posts to import`);

    // Process each post
    for (const wpPost of wpPosts) {
      const postData = convertWordPressPost(wpPost);

      // Check if post already exists
      const existingPost = await db.select()
        .from(posts)
        .where(eq(posts.slug, postData.slug!))
        .limit(1);

      if (existingPost.length === 0) {
        // Create new post
        await db.insert(posts)
          .values({
            ...postData,
            authorId: defaultAuthor.id,
          })
          .onConflictDoNothing();

        console.log(`Imported post: ${postData.title}`);
      } else {
        console.log(`Skipped existing post: ${postData.title}`);
      }
    }

    console.log('WordPress import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  importWordPressContent()
    .then(() => console.log('Import completed'))
    .catch(console.error);
}

export { importWordPressContent };