
import { pool } from "./db-connect";
import bcrypt from "bcryptjs"; // Using bcryptjs to match auth.ts

async function createNewAdminUser() {
  try {
    // Use the same bcrypt library and salt rounds as in auth.ts
    const SALT_ROUNDS = 10;
    const adminPassword = "powerPUFF7";
    const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);
    
    
    
    // Check if this admin already exists
    const checkResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      ["admin@bubblescafe.com"]
    );
    
    if (checkResult.rows.length > 0) {
      
      // Update the password
      await pool.query(
        "UPDATE users SET password_hash = $1 WHERE email = $2",
        [hashedPassword, "admin@bubblescafe.com"]
      );
      
      return { id: checkResult.rows[0].id, updated: true };
    }
    
    // Create new admin user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, is_admin, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, username, email, is_admin as "isAdmin", created_at as "createdAt"`,
      ["admin", "admin@bubblescafe.com", hashedPassword, true]
    );
    
    
    return { id: result.rows[0].id, created: true };
    
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
}

// Self-executing function to run immediately
(async () => {
  try {
    const result = await createNewAdminUser();
    
    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin user:", error);
    process.exit(1);
  }
})();