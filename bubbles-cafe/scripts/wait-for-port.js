/**
 * Port Waiting Utility for Replit Workflows
 * 
 * This script checks if a port is open and ready to accept connections.
 * It's designed to be used in Replit workflows to properly signal when
 * a server is ready to accept connections.
 */

const net = require('net');

// Configuration
const PORT = process.env.PORT || 3001;
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 1000; // ms

let retries = 0;

function checkPort() {
  const client = new net.Socket();
  
  client.on('connect', () => {
    console.log(`✅ Port ${PORT} is open and ready to accept connections`);
    
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
    process.exit(0); // Success
  });
  
  client.on('error', (err) => {
    retries++;
    
    if (retries < MAX_RETRIES) {
      console.log(`Waiting for port ${PORT} to open (attempt ${retries}/${MAX_RETRIES})...`);
      setTimeout(checkPort, RETRY_INTERVAL);
    } else {
      console.error(`Failed to connect to port ${PORT} after ${MAX_RETRIES} attempts.`);
      process.exit(1); // Failure
    }
    
    client.destroy();
  });
  
  client.connect(PORT, '127.0.0.1');
}

// Start checking the port
console.log(`Checking if port ${PORT} is open...`);
checkPort();