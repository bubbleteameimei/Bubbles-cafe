
import { db } from "./db";
import { users, posts } from "@shared/schema";
// import bcrypt from "bcrypt";

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
    

    // Check if we already have data
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      
      return;
    }

    // Seed users first
    
    for (const user of sampleUsers) {
      await db.insert(users).values(user);
    }

    // Seed posts
    
    for (const post of samplePosts) {
      await db.insert(posts).values(post);
    }

    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}