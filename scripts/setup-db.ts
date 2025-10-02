// Database Setup Script
// This script runs before the main application to ensure the database connection is properly established

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function setupDatabase() {
  console.log('🔄 Setting up database connection...');
  
  try {
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not available');
      console.log('🔍 Attempting to recover DATABASE_URL...');
      
      try {
        // Try to read from .env file if it exists
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
          console.log('📄 Found .env file, checking for DATABASE_URL...');
          const envContent = fs.readFileSync(envPath, 'utf8');
          const dbUrlMatch = envContent.match(/DATABASE_URL=["']?(.*?)["']?$/m);
          
          if (dbUrlMatch && dbUrlMatch[1]) {
            process.env.DATABASE_URL = dbUrlMatch[1];
            console.log('✅ Successfully recovered DATABASE_URL from .env file');
          }
        } else {
          console.log('📄 No .env file found');
        }
      } catch (err) {
        console.error('❌ Error reading .env file:', err);
      }
      
      // If still no DATABASE_URL, check if we can get it from the environment
      if (!process.env.DATABASE_URL) {
        console.log('🔍 Checking for database provisioning in Replit...');
        try {
          // This is a Replit-specific approach to get environment variables
          const { stdout } = await execPromise('env | grep DATABASE_URL');
          if (stdout.trim()) {
            const dbUrl = stdout.trim().split('=')[1];
            if (dbUrl) {
              process.env.DATABASE_URL = dbUrl;
              console.log('✅ Successfully recovered DATABASE_URL from environment');
            }
          }
        } catch (err) {
          console.error('❌ Could not get DATABASE_URL from environment:', err);
        }
      }
    }
    
    // Verify DATABASE_URL is now set
    if (!process.env.DATABASE_URL) {
      console.error('❌ Failed to recover DATABASE_URL. Please set it manually.');
      console.error('💡 You can set DATABASE_URL in the Secrets tab in Replit.');
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    console.log('✅ DATABASE_URL is properly set');
    
    // Create .env file if it doesn't exist to persist DATABASE_URL
    try {
      const envPath = path.join(process.cwd(), '.env');
      let envContent = '';
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
        // Update DATABASE_URL if it exists
        if (envContent.includes('DATABASE_URL=')) {
          envContent = envContent.replace(/DATABASE_URL=.*(\r?\n|$)/m, `DATABASE_URL=${process.env.DATABASE_URL}$1`);
        } else {
          // Add DATABASE_URL if it doesn't exist
          envContent += `\nDATABASE_URL=${process.env.DATABASE_URL}\n`;
        }
      } else {
        envContent = `DATABASE_URL=${process.env.DATABASE_URL}\n`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log('📝 Updated .env file with DATABASE_URL');
    } catch (err) {
      console.warn('⚠️ Could not update .env file:', err);
    }
    
    console.log('🎉 Database connection setup complete!');
    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  }
}

// If executed directly (CLI), run the setup; otherwise export for programmatic use
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase().then(success => {
    if (success) {
      console.log('✅ Database is ready to use');
      process.exit(0);
    } else {
      console.error('❌ Database setup failed');
      process.exit(1);
    }
  });
}

export default setupDatabase;