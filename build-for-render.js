#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync, cpSync } from 'fs';
import path from 'path';

console.log('🚀 Starting Render build process...');

try {
  // Install root dependencies
  console.log('📦 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Build client
  console.log('🔨 Building client...');
  execSync('cd client && npm install && npm run build', { stdio: 'inherit', shell: true });

  // Build server
  console.log('🔨 Building server...');
  execSync('cd server && npm install && npm run build', { stdio: 'inherit', shell: true });

  // Prepare for deployment
  console.log('📁 Preparing deployment files...');
  const publicDir = path.join('server', 'public');
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }
  
  execSync(`cp -r client/dist/* ${publicDir}/`, { stdio: 'inherit', shell: true });

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}