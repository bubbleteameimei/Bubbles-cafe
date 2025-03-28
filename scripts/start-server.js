/**
 * Enhanced Server Startup Script
 * 
 * This script starts the server with proper port readiness signals for Replit workflows.
 * It ensures the port is properly monitored and automatically signals when the server
 * is ready to accept connections.
 */

const { spawn } = require('child_process');
const net = require('net');

// Configuration
const PORT = process.env.PORT || 3001;
const SERVER_COMMAND = 'npx';
const SERVER_ARGS = ['tsx', 'server/index.ts'];
const CHECK_INTERVAL = 500; // ms

// Start the server
console.log(`Starting server and monitoring port ${PORT}...`);
const server = spawn(SERVER_COMMAND, SERVER_ARGS, {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

// Poll the port to see if it's up
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
  });
}

// Handle server exit
server.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle errors
server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Start checking the port after a short delay
setTimeout(checkPort, 1000);

// Handle process signals
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
});