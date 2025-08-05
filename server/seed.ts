
import { db } from "./db";
import { posts, users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Sample data for seeding
const samplePosts = [
  {
    title: "Welcome to Bubbles Cafe",
    content: "This is a sample horror story to get you started...",
    slug: "welcome-to-bubbles-cafe",
    authorId: 1,
    excerpt: "A welcoming introduction to our horror story platform",
    themeCategory: "supernatural",
    readingTimeMinutes: 5,
    isSecret: false,
    matureContent: false,
    metadata: {}
  }
];

const sampleUsers = [
  {
    username: "admin",
    email: "admin@bubblescafe.com", 
    password_hash: "$2b$12$sample_hash_here",
    isAdmin: true,
    isVerified: true,
    fullName: "Site Administrator",
    metadata: {}
  }
];

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Check if we already have data
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("📊 Database already has data, skipping seed");
      return;
    }

    // Seed users first
    console.log("👥 Seeding users...");
    for (const user of sampleUsers) {
      await db.insert(users).values(user);
    }

    // Seed posts
    console.log("📝 Seeding posts...");
    for (const post of samplePosts) {
      await db.insert(posts).values(post);
    }

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}