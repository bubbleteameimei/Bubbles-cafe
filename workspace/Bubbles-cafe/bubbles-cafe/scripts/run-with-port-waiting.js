/**
 * Combined Server Starter with Port Waiting
 * 
 * This script starts the server in a child process and then
 * runs the port waiting utility to ensure the port is open
 * before signaling to Replit that the server is ready.
 */

import { spawn } from 'child_process';
import net from 'net';

// Configuration
const PORT = process.env.PORT || 3001;
const CHECK_INTERVAL = 500; // ms

// Start the server
console.log(`Starting server on port ${PORT}...`);
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  detached: false, // Keep the process attached to parent
  env: { ...process.env }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Function to check if the port is open
function checkPort() {
  const client = new net.Socket();
  const timeout = setTimeout(() => {
    client.destroy();
    setTimeout(checkPort, CHECK_INTERVAL);
  }, 1000);

  client.connect(PORT, '127.0.0.1', () => {
    clearTimeout(timeout);
    console.log(`✅ Server is ready on port ${PORT}`);
    
    // Send port readiness signal to Replit
    if (process.send) {
      process.send({
        port: PORT,
        wait_for_port: true,
        ready: true
      });
      console.log('Sent port readiness signal to Replit');
    }
    
    client.destroy();
  });

  client.on('error', (err) => {
    clearTimeout(timeout);
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
      console.log(`Waiting for server to start on port ${PORT}...`);
      setTimeout(checkPort, CHECK_INTERVAL);
    } else {
      console.error(`Error checking port: ${err.message}`);
      setTimeout(checkPort, CHECK_INTERVAL);
    }
    client.destroy();
  });
}

// Start checking the port after a short delay
setTimeout(checkPort, 2000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  if (!server.killed) {
    server.kill('SIGINT');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  if (!server.killed) {
    server.kill('SIGTERM');
  }
  process.exit(0);
});