
import bcrypt from "bcryptjs"; // Using bcryptjs to match auth.ts
import { storage } from "./storage";

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
      
      // Update the password and make sure is_admin is true
      await storage.updateUser(existingUser.id, {
        password_hash: hashedPassword,
        isAdmin: true
      });
      
    } else {
      // Create new admin user
      await storage.createUser({
        username: "vantalison",
        email: adminEmail,
        password_hash: hashedPassword,
        isAdmin: true,
        metadata: {
          createdBy: "vantalison-admin-script",
          createdAt: new Date().toISOString()
        }
      });
      
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