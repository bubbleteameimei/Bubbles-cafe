/**
 * Combined script to start server and signal port readiness to Replit
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Port we're using
const PORT = 3000;

console.log('🚀 Starting server with port signaling...');

// First, explicitly signal port readiness to Replit
if (process.send) {
  console.log(`⏱️ Signaling port ${PORT} readiness to Replit...`);
  process.send({
    port: PORT,
    wait_for_port: true,
    ready: true
  });
  console.log('✅ Port readiness signal sent to Replit!');
}

// Now start the server
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

console.log('✅ Server process started!');

// Handle process events
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

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down server...');
  serverProcess.kill('SIGTERM');
});