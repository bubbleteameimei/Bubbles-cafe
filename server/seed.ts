// import { storage } from "./storage"; // Unused for now
import { XMLParser } from "fast-xml-parser";
import fs from "fs/promises";
import path from "path";
import { posts, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { initializeDatabaseConnection } from "../scripts/connect-db";

// We'll initialize db in each function
let db: any;

async function getAdminUser() {
  try {
    console.log("Locating existing admin user...");
    const [existingAdmin] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.isAdmin, true))
    .limit(1);

    if (existingAdmin) {
      console.log("Admin user found with ID:", existingAdmin.id);
      return existingAdmin;
    }

    throw new Error("No admin user found. Please create one securely before seeding.");
  } catch (error) {
    console.error("Error locating admin user:", error);
    throw error;
  }
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
    .trim();
}

async function parseWordPressXML() {
  try {
    const xmlPath = path.join(process.cwd(), "attached_assets", "bubblescafe.wordpress.2025-02-04.000.xml");
    
    // Check if file exists first
    try {
      await fs.access(xmlPath);
    } catch (error) {
      console.log("WordPress XML file not found, skipping XML seeding.");
      return { posts: [], admin: await getAdminUser() };
    }
    
    const xmlContent = await fs.readFile(xmlPath, "utf-8");

    const parser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: true,
      parseAttributeValue: true,
      textNodeName: "_text",
      isArray: (name) => ['item'].indexOf(name) !== -1
    });

    const data = parser.parse(xmlContent);
    const items = data.rss.channel.item;

    // Get admin user for post authorship
    const admin = await getAdminUser();

    // Track existing slugs to prevent duplicates
    const existingSlugs = new Set<string>();
    console.log("Starting to create posts...");
    let createdCount = 0;

    for (const item of items) {
      if (item["wp:post_type"] === "post" && item["wp:status"] === "publish") {
        try {
          const cleanedContent = cleanContent(item["content:encoded"]);
          const excerpt = item["excerpt:encoded"]
            ? cleanContent(item["excerpt:encoded"]).split('\n')[0]
            : cleanedContent.split('\n')[0];

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

          // Parse the publication date properly
          const pubDateStr = item.pubDate;
          const pubDate = new Date(pubDateStr);

          // Check if post already exists
          const [existingPost] = await db.select()
            .from(posts)
            .where(eq(posts.slug, finalSlug));

          if (!existingPost) {
            // Create post with only the fields that exist in the table
            try {
              // Use raw SQL with pool.query to avoid schema mapping
              const readingTime = Math.ceil(cleanedContent.split(/\s+/).length / 200);
              const { pool } = await import("./db-connect");
              const result = await pool.query(
                `INSERT INTO posts (
                  title, content, excerpt, slug, is_secret, author_id, 
                  created_at, mature_content, reading_time_minutes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id, title, slug, created_at as "createdAt"`,
                [
                  item.title,
                  cleanedContent,
                  excerpt,
                  finalSlug,
                  false, // isSecret
                  admin.id,
                  pubDate.toISOString(),
                  false, // matureContent
                  readingTime
                ]
              );
              
              const newPost = result.rows[0] as { id: number, title: string, slug: string, createdAt: Date };

              createdCount++;
              console.log(`Created post: "${item.title}" (ID: ${newPost.id}) with date: ${pubDate.toISOString()}`);
            } catch (error) {
              console.error(`Error creating post "${item.title}":`, error);
            }
          } else {
            console.log(`Post "${item.title}" already exists, skipping...`);
          }
        } catch (error) {
          console.error(`Error processing post "${item.title}":`, error);
        }
      }
    }

    console.log(`Successfully processed ${createdCount} posts`);
    return createdCount;
  } catch (error) {
    console.error("Error parsing WordPress XML:", error);
    throw error;
  }
}

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    
    // Initialize database connection first
    console.log('🔄 Initializing database connection...');
    const connection = await initializeDatabaseConnection();
    db = connection.db;
    
    const result = await parseWordPressXML();
    const postsCreated = typeof result === 'number' ? result : 0;
    console.log(`Database seeded successfully with ${postsCreated} posts!`);
    return postsCreated;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}