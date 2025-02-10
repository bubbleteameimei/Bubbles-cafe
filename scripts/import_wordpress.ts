import { XMLParser } from 'fast-xml-parser';
import { promises as fs } from 'fs';
import { db } from '../server/db';
import { posts, users, comments } from '../shared/schema';
import { eq } from 'drizzle-orm';
import path from 'path';

async function importWordPressMetadata() {
  try {
    // Read the WordPress export file
    const xmlData = await fs.readFile(
      path.join(process.cwd(), 'attached_assets/bubblescafe.wordpress.2025-02-04.000.xml'),
      'utf-8'
    );

    // Parse XML with options to preserve CDATA
    const parser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: true,
      parseAttributeValue: true,
    });
    const jsonObj = parser.parse(xmlData);

    // Extract channel information
    const channel = jsonObj.rss.channel;

    // Create admin user if not exists
    const authorEmail = channel['wp:author']['wp:author_email'];
    const adminUser = await db.select().from(users).where(eq(users.email, authorEmail)).limit(1);
    let adminUserId: number;

    if (!adminUser.length) {
      const [newAdmin] = await db.insert(users).values({
        username: channel['wp:author']['wp:author_login'],
        email: authorEmail,
        password_hash: '$2b$10$dummyHashForImport', // Temporary hash, admin will need to reset
        isAdmin: true
      }).returning({ id: users.id });
      adminUserId = newAdmin.id;
    } else {
      adminUserId = adminUser[0].id;
    }

    // Import post metadata and comments
    for (const item of channel.item) {
      const title = item.title;
      // Generate slug from title
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Import post metadata only
      const [newPost] = await db.insert(posts).values({
        title,
        content: '[Content placeholder for horror story]', // Replace actual content
        excerpt: 'A horror story awaits...', // Generic excerpt
        slug,
        authorId: adminUserId,
        originalSource: item.link,
        originalAuthor: item['dc:creator'],
        originalPublishDate: new Date(item.pubDate),
        matureContent: true,
        readingTimeMinutes: 5, // Default reading time
        triggerWarnings: ['horror'] // Basic tag
      }).returning({ id: posts.id });

      // Import comments if any
      if (item['wp:comment']) {
        const postComments = Array.isArray(item['wp:comment']) ? item['wp:comment'] : [item['wp:comment']];
        for (const comment of postComments) {
          await db.insert(comments).values({
            postId: newPost.id,
            content: comment['wp:comment_content'],
            author: comment['wp:comment_author'],
          });
        }
      }
    }

    console.log('Metadata import completed successfully');
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

importWordPressMetadata();