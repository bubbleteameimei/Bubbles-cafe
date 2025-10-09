>
 WordPress API-based seeding (XML removed)
import fetch from "node-fetch";
importom "fast-xml-parser";
import fs from "fs/promises";
import path from "path";
import { posts, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { initializeDatabaseConnection } from "../scripts/connect-db";

// We'll initialize db in each function
let db: any;

async function ensureImportAuthorUser() {
  try {
    console.log("Resolving import author user...");
    const importEmail = process.env.CONTENT_AUTHOR_EMAIL || process.env.WP_IMPORT_AUTHOR_EMAIL;

    let author;
    if (importEmail) {
      [author] = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.email, importEmail))
      .limit(1);
    } else {
      [author] = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.isAdmin, false))
      .limit(1);
    }

    if (author) {
      console.log("✅ Import author user found with ID:", author.id);
      return author;
    }

    // Create non-admin import author
    const email = importEmail || 'wordpress_import@local';
    const username = 'wordpress_import';
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const password_hash = await bcrypt.hash(randomPassword, 12);

    const [newAuthor] = await db
      .insert(users)
      .values({
        username,
        email,
        password_hash,
        isAdmin: false,
        metadata: { system: 'wp-import' }
      })
      .returning();

    console.log("✅ Created import author user with ID:", newAuthor.id);
    return newAuthor;
  } catch (error) {
    console.error("Error resolving import author user:", error);
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

async function fetchWordPressPosts(page = 1, perPage = 20) {
  const baseUrl = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com';
  const response = await fetch(`${baseUrl}/posts?page=${page}&per_page=${perPage}&_fields=id,date,title,content,excerpt,slug`);
  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function seedDatabase() {
  try {
    console.log("Starting API-based database seeding...");
    // Initialize database connection first
    console.log('🔄 Initializing database connection...');
    const connection = await initializeDatabaseConnection();
    db = connection.db;

    const author = await ensureImportAuthorUser();

    let page = 1;
    let totalCreated = 0;
    const perPage = 20;

    while (true) {
      const wpPosts = await fetchWordPressPosts(page, perPage);
      if (wpPosts.length === 0) break;

      for (const wpPost of wpPosts) {
        try {
          const title = wpPost.title?.rendered || 'Untitled';
          const content = cleanContent(wpPost.content?.rendered || '');
          const excerpt = wpPost.excerpt?.rendered
            ? cleanContent(wpPost.excerpt.rendered).substring(0, 200) + '...'
            : content.substring(0, 200) + '...';

          const finalSlug = wpPost.slug;
          const pubDate = new Date(wpPost.date);

          // Check if post already exists
          const [existingPost] = await db.select()
            .from(posts)
            .where(eq(posts.slug, finalSlug))
            .limit(1);

          if (!existingPost) {
            const readingTime = Math.ceil(content.split(/\s+/).length / 200);

            await db.insert(posts).values({
              title,
              content,
              excerpt,
              slug: finalSlug,
              authorId: author.id,
              isSecret: false,
              isAdminPost: false,
              matureContent: false,
              readingTimeMinutes: readingTime,
              themeCategory: 'General',
              metadata: {
                importSource: 'wordpress-api',
                importDate: new Date().toISOString(),
                wordpressId: wpPost.id,
                originalDate: wpPost.date
              },
              createdAt: pubDate
            });

            totalCreated++;
            console.log(`Created post: "${title}" with date: ${pubDate.toISOString()}`);
          } else {
            console.log(`Post "${title}" already exists, skipping...`);
          }
        } catch (error) {
          console.error(`Error processing post "${wpPost.title?.rendered}":`, error);
        }
      }

      page++;
    }

    console.log(`Database seeded successfully from WordPress API with ${totalCreated} posts!`);
    return totalCreated;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}