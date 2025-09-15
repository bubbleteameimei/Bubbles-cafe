import { XMLParser } from 'fast-xml-parser';
import { promises as fs } from 'fs';
import { db } from '../server/db';
import { posts, users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cleanContent(content: string): Promise<string> {
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
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8230;/g, "...")
    .trim();
}

async function getOrCreateAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    console.log("Creating admin user with email: vantalison@gmail.com");

    // First check if admin user exists
    const [existingAdmin] = await db.select()
      .from(users)
      .where(eq(users.email, "vantalison@gmail.com"));

    if (existingAdmin) {
      console.log("Admin user already exists with ID:", existingAdmin.id);
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

async function importWordPress() {
  try {
    console.log("Starting WordPress import process...");

    // Read the WordPress export file
    const xmlPath = path.join(process.cwd(), "attached_assets", "bubblescafe.wordpress.2025-02-04.000.xml");
    console.log("Reading XML file from:", xmlPath);

    const xmlData = await fs.readFile(xmlPath, 'utf-8');
    console.log("Successfully read XML file, size:", xmlData.length, "bytes");

    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: true,
      parseAttributeValue: true,
      textNodeName: "_text",
      isArray: (name) => ['item'].indexOf(name) !== -1
    });

    console.log("Parsing WordPress XML data...");
    const data = parser.parse(xmlData);

    if (!data.rss?.channel?.item) {
      throw new Error("Invalid WordPress XML structure: Missing items array");
    }

    const items = data.rss.channel.item;
    console.log(`Found ${items.length} items in WordPress export`);

    // Get admin user for post authorship
    const admin = await getOrCreateAdminUser();

    // Track existing slugs to prevent duplicates
    const existingSlugs = new Set<string>();
    let createdCount = 0;
    let skippedCount = 0;

    for (const item of items) {
      if (item["wp:post_type"] === "post" && item["wp:status"] === "publish") {
        try {
          console.log(`Processing post: "${item.title}"`);

          const content = await cleanContent(item["content:encoded"]);
          const excerpt = item["excerpt:encoded"]
            ? (await cleanContent(item["excerpt:encoded"])).split('\n')[0]
            : content.split('\n')[0];

          let baseSlug = item["wp:post_name"] || item.title
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

          // Parse publication date properly
          const pubDate = new Date(item.pubDate);

          // Check if post already exists
          const [existingPost] = await db.select()
            .from(posts)
            .where(eq(posts.slug, finalSlug));

          if (!existingPost) {
            // Calculate estimated reading time (roughly 200 words per minute)
            const wordCount = content.split(/\s+/).length;
            const readingTimeMinutes = Math.ceil(wordCount / 200);

            // Create post with enhanced metadata
            const [newPost] = await db.insert(posts).values({
              title: item.title,
              content: content,
              excerpt: excerpt.substring(0, 200) + '...',
              slug: finalSlug,
              authorId: admin.id,
              isSecret: false,
              createdAt: pubDate,
              matureContent: false,
              readingTimeMinutes,
              metadata: {
                originalWordCount: wordCount,
                importSource: 'wordpress',
                importDate: new Date().toISOString()
              }
            }).returning();

            createdCount++;
            console.log(`Created post: "${item.title}" (ID: ${newPost.id})`);
          } else {
            skippedCount++;
            console.log(`Skipped existing post: "${item.title}"`);
          }
        } catch (error) {
          console.error(`Error processing post "${item.title}":`, error);
        }
      }
    }

    console.log("\nImport Summary:");
    console.log(`- Total items processed: ${items.length}`);
    console.log(`- Posts created: ${createdCount}`);
    console.log(`- Posts skipped: ${skippedCount}`);

    return { created: createdCount, skipped: skippedCount };
  } catch (error) {
    console.error("Error during WordPress import:", error);
    throw error;
  }
}

// Only run if this is the main module
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  importWordPress()
    .then(results => {
      console.log("Import completed successfully:", results);
      process.exit(0);
    })
    .catch(error => {
      console.error("Import failed:", error);
      process.exit(1);
    });
}