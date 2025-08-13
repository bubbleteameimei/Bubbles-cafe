import { storage } from "./storage";
import bcrypt from "bcryptjs"; // Using bcryptjs to match auth.ts

// Use the same bcrypt library and salt rounds as in auth.ts
const SALT_ROUNDS = 10;

async function createVantalisonAdmin() {
  const adminEmail = "vantalison@gmail.com";
  
  // Get password from environment variable or fail
  const adminPassword = process.env.VANTALISON_ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error("VANTALISON_ADMIN_PASSWORD environment variable is required");
  }
  
  const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);

  try {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(adminEmail);
    
    if (existingUser) {
      console.log("Vantalison admin user already exists, updating password and ensuring admin status...");
      // Update the password and make sure is_admin is true using db execute
      const db = storage.getDb();
      await db.execute(`UPDATE users SET password_hash = ${hashedPassword}, is_admin = true WHERE email = ${adminEmail}`);
      console.log("Vantalison admin password updated successfully");
    } else {
      // Create new admin user
      const db = storage.getDb();
      await db.execute(`INSERT INTO users (username, email, password_hash, is_admin, created_at) VALUES (${"vantalison"}, ${adminEmail}, ${hashedPassword}, ${true}, NOW())`);
      console.log("Vantalison admin user created successfully");
    }
  } catch (error) {
    console.error("Error creating/updating vantalison admin:", error);
    throw error;
  }
}

// Only run if called directly
if (require.main === module) {
  createVantalisonAdmin().catch(console.error);
}

export { createVantalisonAdmin };