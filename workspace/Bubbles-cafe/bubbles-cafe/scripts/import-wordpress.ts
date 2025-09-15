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

    // Create default author if not exists
    const [defaultAuthor] = await db
      .insert(users)
      .values({
        username: 'wordpress_import',
        email: 'wordpress_import@example.com',
        password_hash: createHash('sha256').update('temp_password').digest('hex'),
        isAdmin: false
      })
      .onConflictDoNothing()
      .returning();

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