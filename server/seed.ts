import { storage } from "./storage";
import { XMLParser } from "fast-xml-parser";
import fs from "fs/promises";
import path from "path";
import { db } from "./db";
import { posts, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function getOrCreateAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash("powerPUFF7", 12);
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
    // Only include fields that exist in the actual database table
    const [newAdmin] = await db.insert(users).values({
      username: "admin",
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
            const [newPost] = await db.insert(posts).values({
              title: item.title,
              content: cleanedContent,
              excerpt: excerpt,
              slug: finalSlug,
              isSecret: false,
              authorId: admin.id,
              createdAt: pubDate,
              matureContent: false,
              readingTimeMinutes: Math.ceil(cleanedContent.split(/\s+/).length / 200)
            }).returning();

            createdCount++;
            console.log(`Created post: "${item.title}" (ID: ${newPost.id}) with date: ${pubDate.toISOString()}`);
          } else {
            console.log(`Post "${item.title}" already exists, skipping...`);
          }
        } catch (error) {
          console.error(`Error creating post "${item.title}":`, error);
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
    const postsCreated = await parseWordPressXML();
    console.log(`Database seeded successfully with ${postsCreated} posts!`);
    return postsCreated;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}