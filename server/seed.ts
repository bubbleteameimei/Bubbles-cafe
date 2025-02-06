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
    });

    const data = parser.parse(xmlContent);
    const items = data.rss.channel.item;

    // Get admin user for post authorship
    const admin = await getOrCreateAdminUser();

    console.log("Starting to create posts...");
    let createdCount = 0;

    for (const item of items) {
      if (item["wp:post_type"] === "post") {
        try {
          // Process content to match WordPress formatting
          const content = item["content:encoded"]
            .replace(/<!-- wp:paragraph -->/g, "")
            .replace(/<!-- \/wp:paragraph -->/g, "")
            .replace(/<!-- wp:social-links -->[\s\S]*?<!-- \/wp:social-links -->/g, "")
            .replace(/<!-- wp:latest-posts[\s\S]*?\/-->/g, "")
            // Keep <p> tags for proper spacing
            .replace(/<p>/g, "\n")
            .replace(/<\/p>/g, "\n")
            // Preserve italics
            .replace(/<em>/g, "_")
            .replace(/<\/em>/g, "_")
            .trim();

          // Create proper paragraphs
          const formattedContent = content
            .split("\n\n")
            .filter((p: string) => p.trim())
            .join("\n\n");

          const excerpt = formattedContent.split("\n")[0];

          await storage.createPost({
            title: item.title,
            content: formattedContent,
            excerpt: excerpt,
            slug: item["wp:post_name"],
            isSecret: false,
            authorId: admin.id
          });

          createdCount++;
        } catch (error) {
          console.error("Error creating post:", error);
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