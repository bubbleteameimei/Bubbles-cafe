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
      textNodeName: "__text"
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
      const title = item.title.__cdata || item.title;
      const content = item['content:encoded'].__cdata || item['content:encoded'];

      // Generate slug from title
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Calculate estimated reading time (roughly 200 words per minute)
      const wordCount = content.split(/\s+/).length;
      const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

      // Enhanced trigger warnings with broader patterns
      const triggerWarnings = ['horror']; // Base tag
      const triggerKeywords = {
        'gore': /blood|gore|guts|viscera|flesh|wound|mutilat|dismember|entrails|organ/i,
        'violence': /murder|kill|stab|shot|violence|brutal|assault|attack|fight|struggle|strangle/i,
        'body-horror': /transform|mutate|deform|grotesque|twist|morph|flesh|skin|bone|decay/i,
        'psychological': /mind|sanity|madness|paranoia|hallucination|delusion|reality|conscious|dream|nightmare/i,
        'existential': /existence|meaning|purpose|void|empty|hollow|eternal|infinite|cosmic|universe/i
      };

      Object.entries(triggerKeywords).forEach(([warning, regex]) => {
        if (regex.test(content)) {
          triggerWarnings.push(warning);
        }
      });

      // Generate smart excerpt
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const impactfulSentences = sentences.filter(s => 
        /blood|death|scream|horror|dark|fear|terror|nightmare/i.test(s)
      );
      const excerpt = impactfulSentences.length > 0 
        ? impactfulSentences[0].trim() 
        : sentences[0].trim();

      // Import post with updated schema
      const [newPost] = await db.insert(posts).values({
        title,
        content,
        excerpt: excerpt.substring(0, 200) + '...',
        slug,
        authorId: adminUserId,
        isSecret: false,
        matureContent: false,
        readingTimeMinutes,
        metadata: {
          triggerWarnings: [...new Set(triggerWarnings)],
          themeCategory: 'PSYCHOLOGICAL',
          isCommunityPost: false,
          isApproved: true
        }
      }).returning({ id: posts.id });

      // Import comments if any
      if (item['wp:comment']) {
        const postComments = Array.isArray(item['wp:comment']) ? item['wp:comment'] : [item['wp:comment']];
        for (const comment of postComments) {
          const [commentUser] = await db.insert(users).values({
            username: comment['wp:comment_author'],
            email: comment['wp:comment_author_email'] || `${comment['wp:comment_author'].toLowerCase()}@imported.com`,
            password_hash: '$2b$10$dummyHashForImport',
            isAdmin: false
          }).returning({ id: users.id });

          await db.insert(comments).values({
            content: comment['wp:comment_content'],
            postId: newPost.id,
            userId: commentUser.id,
            approved: true
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