import { storage } from "./storage";
import { XMLParser } from "fast-xml-parser";
import fs from "fs/promises";
import path from "path";
import { posts, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { initializeDatabaseConnection } from "../scripts/connect-db";

// We'll initialize db in each function
let db: any;

async function getOrCreateAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash("powerPUFF7", 12);
    console.log("Creating admin user with email: vantalison@gmail.com");

    // First check if admin user exists - explicit column selection to avoid errors with non-existent columns
    const [existingAdmin] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.email, "vantalison@gmail.com"));

    if (existingAdmin) {
      console.log("Admin user already exists with ID:", existingAdmin.id);
      return existingAdmin;
    }

    // Create new admin user if doesn't exist
    // Only include fields that exist in the actual database table
    // Note: We're explicitly specifying only the columns we know exist
    const insertData = {
      username: "admin",
      email: "vantalison@gmail.com",
      password_hash: hashedPassword,
      isAdmin: true
      // metadata field is missing in the actual table
    };
    
    // Raw SQL with pool.query to avoid Drizzle's automatic schema mapping
    const { pool } = await import("./db-connect");
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, is_admin, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, username, email, is_admin as "isAdmin", created_at as "createdAt"`,
      [insertData.username, insertData.email, insertData.password_hash, insertData.isAdmin]
    );
    
    const newAdmin = result.rows[0] as { id: number, username: string, email: string, isAdmin: boolean, createdAt: Date };

    console.log("Admin user created successfully with ID:", newAdmin.id);
    return newAdmin;
  } catch (error) {
    console.error("Error in getOrCreateAdminUser:", error);
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
    const xmlContent = await fs.readFile(
      path.join(process.cwd(), "attached_assets", "bubblescafe.wordpress.2025-02-04.000.xml"),
      "utf-8"
    );

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
    const admin = await getOrCreateAdminUser();

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
    
    const postsCreated = await parseWordPressXML();
    console.log(`Database seeded successfully with ${postsCreated} posts!`);
    return postsCreated;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}