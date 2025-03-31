/**
 * Run Script to properly start the server with port signaling for Replit
 */

import { spawn } from 'child_process';
import { createServer } from 'http';

// Define the port we want to ensure is available
const PORT = 3003;

// Create a simple HTTP server on the specified port
// This ensures Replit knows our app is up and running
const server = createServer((req, res) => {
  // Respond to health checks
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Proxy server running',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Redirect all requests to the actual server
  res.writeHead(302, { 'Location': `http://localhost:${PORT}${req.url}` });
  res.end();
});

// Start listening
server.listen(3000, '0.0.0.0', () => {
  console.log(`🚦 Port signaling server started on port 3000, redirecting to ${PORT}`);
  
  // Signal to Replit that we've bound to the expected port
  if (process.send) {
    process.send({
      'port': 3000,  // The port Replit expects us to be on
      'ready': true,
      'wait_for_port': true
    });
    console.log('✅ Sent port readiness signal to Replit');
  }
  
  // Start the actual app server
  console.log('🚀 Starting the application server...');
  const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: PORT.toString()
    }
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
    console.log('Received SIGINT. Shutting down servers...');
    server.close();
    serverProcess.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Shutting down servers...');
    server.close();
    serverProcess.kill('SIGTERM');
  });
});