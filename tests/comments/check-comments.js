/**
 * Comment System Verification Script
 * 
 * This script connects to the database using our application's database connection
 * and checks the comments table to verify functionality.
 */
import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

async function checkComments() {
  console.log('🔍 Checking comments table in the database...');
  
  // Get DATABASE_URL from environment
  let connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.log('⚠️ DATABASE_URL not found in environment, checking .env file...');
    try {
      const envPath = path.join(__dirname, '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/DATABASE_URL=(.+)/);
        if (match && match[1]) {
          connectionString = match[1];
          console.log('✅ Found DATABASE_URL in .env file');
        }
      }
    } catch (error) {
      console.error('Error reading .env file:', error);
    }
  }
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found. Cannot connect to database.');
    return;
  }
  
  // Create a connection pool
  const pool = new Pool({ 
    connectionString,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });
  
  try {
    console.log('🔌 Connecting to PostgreSQL database...');
    
    // Check comments table count
    const commentCountResult = await pool.query('SELECT COUNT(*) FROM comments');
    const commentCount = parseInt(commentCountResult.rows[0].count);
    console.log(`📊 Total comments: ${commentCount}`);
    
    // Check recent comments if any exist
    if (commentCount > 0) {
      const recentComments = await pool.query(
        'SELECT id, content, post_id, user_id, is_approved, created_at FROM comments ORDER BY created_at DESC LIMIT 5'
      );
      console.log('📝 Recent comments:');
      recentComments.rows.forEach(comment => {
        console.log(`ID: ${comment.id} | Content: ${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''} | Post ID: ${comment.post_id} | Approved: ${comment.is_approved}`);
      });
    }
    
    // Check comment reactions count
    const reactionCountResult = await pool.query('SELECT COUNT(*) FROM comment_reactions');
    const reactionCount = parseInt(reactionCountResult.rows[0].count);
    console.log(`👍 Total comment reactions: ${reactionCount}`);
    
    // Check comment votes count
    const voteCountResult = await pool.query('SELECT COUNT(*) FROM comment_votes');
    const voteCount = parseInt(voteCountResult.rows[0].count);
    console.log(`⬆️ Total comment votes: ${voteCount}`);
    
    // Get posts count for reference
    const postCountResult = await pool.query('SELECT COUNT(*) FROM posts');
    const postCount = parseInt(postCountResult.rows[0].count);
    console.log(`📚 Total posts: ${postCount}`);
    
    // Calculate comments per post ratio
    const ratio = postCount > 0 ? (commentCount / postCount).toFixed(2) : 0;
    console.log(`📊 Comments per post ratio: ${ratio}`);
    
    console.log('✅ Comments system verification complete!');
  } catch (error) {
    console.error('❌ Error checking comments table:', error);
  } finally {
    await pool.end();
  }
}

checkComments().catch(console.error);