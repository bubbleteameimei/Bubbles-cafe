#!/usr/bin/env tsx
import { spawn } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Verify DATABASE_URL is loaded from environment
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables. Please check your .env file.');
  process.exit(1);
}

console.log('📍 Database URL loaded from environment variables');
console.log('🚀 Starting server with Neon database...');

// Start the server
const server = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: process.env
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});