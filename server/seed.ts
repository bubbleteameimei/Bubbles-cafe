import { storage } from "./storage";
import { XMLParser } from "fast-xml-parser";
import fs from "fs/promises";
import path from "path";
import { db } from "./db";
import { posts, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function getOrCreateAdminUser() {
  // Check if admin exists
  const [admin] = await db.select().from(users).where(eq(users.username, "admin"));

  if (admin) {
    return admin;
  }

  // Create admin if doesn't exist
  const hashedPassword = await bcrypt.hash("admin", 10);
  const [newAdmin] = await db.insert(users).values({
    username: "admin",
    email: "admin@example.com",
    password_hash: hashedPassword,
  }).returning();

  return newAdmin;
}

async function parseWordPressXML() {
  const xmlContent = await fs.readFile(
    path.join(process.cwd(), "attached_assets/bubblescafe.wordpress.2025-02-04.000.xml"),
    "utf-8"
  );

  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: true,
    parseAttributeValue: true,
  });

  const data = parser.parse(xmlContent);
  const items = data.rss.channel.item;

  // Clear existing posts first
  await db.delete(posts);

  // Get admin user for post authorship
  const admin = await getOrCreateAdminUser();

  for (const item of items) {
    if (item["wp:post_type"] === "post") {
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
    }
  }
}

export async function seedDatabase() {
  try {
    await parseWordPressXML();
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}