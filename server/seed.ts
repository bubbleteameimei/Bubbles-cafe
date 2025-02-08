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
    // First, clear any existing admin users to avoid duplicates
    await db.delete(users).where(eq(users.email, "vantalison@gmail.com"));

    // Create fresh admin user
    const hashedPassword = await bcrypt.hash("powerPUFF70", 10);
    console.log("Creating admin user with email: vantalison@gmail.com");

    const [newAdmin] = await db.insert(users).values({
      username: "admin",
      email: "vantalison@gmail.com",
      password_hash: hashedPassword,
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
    // Remove WordPress formatting
    .replace(/<!-- wp:paragraph -->/g, "")
    .replace(/<!-- \/wp:paragraph -->/g, "")
    .replace(/<!-- wp:social-links -->[\s\S]*?<!-- \/wp:social-links -->/g, "")
    .replace(/<!-- wp:latest-posts[\s\S]*?\/-->/g, "")
    // Properly handle italics formatting
    .replace(/<em>(.*?)<\/em>/g, "_$1_")
    // Replace HTML line breaks with newlines
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p>/g, "\n")
    .replace(/<\/p>/g, "\n")
    // Only remove lone underscores, preserving paired ones used for italics
    .replace(/(?<![_\w]|^)_(?![_\w]|$)/g, "")
    // Clean up multiple newlines while preserving italics
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

    // First, clear existing posts to prevent duplicates
    await db.delete(posts);

    for (const item of items) {
      if (item["wp:post_type"] === "post" && item["wp:status"] === "publish") {
        try {
          const cleanedContent = cleanContent(item["content:encoded"]);
          const excerpt = item["excerpt:encoded"] 
            ? cleanContent(item["excerpt:encoded"]).split('\n')[0] 
            : cleanedContent.split('\n')[0];

          // Generate unique slug
          let baseSlug = item["wp:post_name"] || item.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          // Ensure slug uniqueness
          let finalSlug = baseSlug;
          let counter = 1;
          while (existingSlugs.has(finalSlug)) {
            finalSlug = `${baseSlug}-${counter}`;
            counter++;
          }
          existingSlugs.add(finalSlug);

          // Parse the original publication date
          const pubDate = new Date(item.pubDate);
          if (isNaN(pubDate.getTime())) {
            console.warn(`Invalid publication date for post "${item.title}": ${item.pubDate}`);
            continue;
          }

          const newPost = {
            title: item.title,
            content: cleanedContent,
            excerpt: excerpt,
            slug: finalSlug,
            isSecret: false,
            authorId: admin.id,
            createdAt: pubDate.toISOString()
          };

          await db.insert(posts).values(newPost);

          createdCount++;
          console.log(`Created post: "${item.title}" with date: ${pubDate.toISOString()}`);
        } catch (error) {
          console.error(`Error creating post "${item.title}":`, error);
        }
      }
    }

    console.log(`Successfully created ${createdCount} posts`);
  } catch (error) {
    console.error("Error parsing WordPress XML:", error);
    throw error;
  }
}

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    await parseWordPressXML();
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}