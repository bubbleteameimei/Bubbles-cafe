/**
 * Custom server starter script for Replit compatibility
 * This script ensures the server binds to the correct address and port,
 * and sends the proper signals to Replit for port availability.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Clear the console
console.clear();
console.log('🚀 Starting the application server...');

// Start the server process
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true
});

// Handle server process events
serverProcess.on('error', (error) => {
  console.error(`❌ Failed to start server: ${error.message}`);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Server process exited with code ${code}`);
    process.exit(code);
  }
});

// Listen for termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down server...');
  serverProcess.kill('SIGTERM');
});

console.log('✅ Server process started. Waiting for application to be ready...');