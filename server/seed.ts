import { storage } from "./storage";
import { XMLParser } from "fast-xml-parser";
import fs from "fs/promises";
import path from "path";

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

  for (const item of items) {
    if (item["wp:post_type"] === "post") {
      // Remove WordPress specific tags from content
      const content = item["content:encoded"]
        .replace(/<!-- wp:paragraph -->/g, "")
        .replace(/<!-- \/wp:paragraph -->/g, "")
        .replace(/<!-- wp:social-links -->[\s\S]*?<!-- \/wp:social-links -->/g, "")
        .replace(/<!-- wp:latest-posts[\s\S]*?\/-->/g, "")
        .replace(/<\/?p>/g, "\n\n")
        .trim();

      const excerpt = content.split("\n")[0];

      await storage.createPost({
        title: item.title,
        content: content,
        excerpt: excerpt,
        slug: item["wp:post_name"],
        isSecret: false
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