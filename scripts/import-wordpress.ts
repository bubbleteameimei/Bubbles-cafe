import { XMLParser } from 'fast-xml-parser';
import fs from 'fs/promises';
import path from 'path';
import { db } from '../server/db.js';
import { posts, users } from '../shared/schema.js';
import { createHash } from 'crypto';
import { eq } from 'drizzle-orm';

interface WordPressPost {
  title: string;
  link: string;
  pubDate: string;
  creator: string;
  description: string;
  content: string;
  post_id: number;
  post_date: string;
  status: string;
}

async function importWordPressContent(xmlFilePath: string) {
  try {
    console.log('Starting WordPress import...');

    // Read XML file
    const xmlContent = await fs.readFile(xmlFilePath, 'utf-8');

    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      textNodeName: "content",
      isArray: (name) => ['item'].includes(name)
    });

    const result = parser.parse(xmlContent);
    const channel = result.rss.channel;

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

    console.log('Processing posts...');

    // Process each post
    for (const item of channel.item || []) {
      const postContent = item['content:encoded'] || item.description;
      const postTitle = item.title;
      const postDate = new Date(item.pubDate);

      // Generate slug from title
      const slug = postTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if post already exists
      const existingPost = await db.select()
        .from(posts)
        .where(eq(posts.slug, slug))
        .limit(1);

      if (existingPost.length === 0) {
        // Create new post
        await db.insert(posts)
          .values({
            title: postTitle,
            content: postContent,
            slug,
            authorId: defaultAuthor.id,
            createdAt: postDate,
            excerpt: postContent.substring(0, 200) + '...',
            isSecret: false,
            matureContent: false
          })
          .onConflictDoNothing();

        console.log(`Imported post: ${postTitle}`);
      } else {
        console.log(`Skipped existing post: ${postTitle}`);
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
  const xmlFile = path.join(process.cwd(), 'attached_assets', 'bubblescafe.wordpress.2025-02-04.000.xml');
  importWordPressContent(xmlFile)
    .then(() => console.log('Import completed'))
    .catch(console.error);
}

export { importWordPressContent };