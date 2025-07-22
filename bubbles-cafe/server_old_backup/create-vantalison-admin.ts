import { storage } from "./storage";
import { pool } from "./db-connect";
import bcrypt from "bcryptjs"; // Using bcryptjs to match auth.ts

async function createVantalisonAdminUser() {
  try {
    // Use the same bcrypt library and salt rounds as in auth.ts
    const SALT_ROUNDS = 10;
    const adminEmail = "vantalison@gmail.com";
    const adminPassword = "powerPUFF7";
    const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);
    
    console.log(`Creating/updating admin user with email: ${adminEmail}`);
    
    // Check if this admin already exists
    const checkResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [adminEmail]
    );
    
    if (checkResult.rows.length > 0) {
      console.log("Vantalison admin user already exists, updating password and ensuring admin status...");
      // Update the password and make sure is_admin is true
      await pool.query(
        "UPDATE users SET password_hash = $1, is_admin = true WHERE email = $2",
        [hashedPassword, adminEmail]
      );
      console.log("Vantalison admin password updated successfully");
      return { id: checkResult.rows[0].id, updated: true };
    }
    
    // Create new admin user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, is_admin, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, username, email, is_admin as "isAdmin", created_at as "createdAt"`,
      ["vantalison", adminEmail, hashedPassword, true]
    );
    
    console.log("New vantalison admin user created successfully:", result.rows[0]);
    return { id: result.rows[0].id, created: true };
    
  } catch (error) {
    console.error("Error creating/updating vantalison admin user:", error);
    throw error;
  }
}

// Self-executing function to run immediately
(async () => {
  try {
    const result = await createVantalisonAdminUser();
    console.log("Operation completed:", result);
    process.exit(0);
  } catch (error) {
    console.error("Failed to create/update vantalison admin user:", error);
    process.exit(1);
  }
})();