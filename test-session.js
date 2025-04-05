/**
 * Simple script to create a test session for an admin user
 */

import { storage } from './server/storage.js';
import pkg from 'pg';
const { Pool } = pkg;
import express from 'express';
import session from 'express-session';
import pgSessionFactory from 'connect-pg-simple';
const pgSession = pgSessionFactory(session);

async function createAdminSession() {
  try {
    // Get admin user
    const admin = await storage.getUserByEmail('admin@example.com');
    
    if (!admin) {
      console.error("Admin user not found");
      return;
    }
    
    console.log("Found admin user:", admin.id, admin.email);
    
    // Create a direct connection to Postgres
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    // Generate a session ID
    const sid = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
    
    // Insert a session into the session table
    const sessionData = {
      user: admin,
      passport: {
        user: admin.id
      }
    };
    
    // Insert session
    await pool.query(
      'INSERT INTO "session" ("sid", "sess", "expire") VALUES ($1, $2, $3)',
      [
        sid,
        JSON.stringify(sessionData),
        new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      ]
    );
    
    console.log("Session created with ID:", sid);
    console.log("Cookie value to use: connect.sid=" + sid);
    console.log("Use this command to test the endpoint:");
    console.log(`curl -H "Cookie: connect.sid=${sid}" http://localhost:3002/api/analytics/reading-time`);
    
    await pool.end();
  } catch (error) {
    console.error("Error creating admin session:", error);
  }
}

createAdminSession().catch(err => console.error(err));