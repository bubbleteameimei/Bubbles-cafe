#!/usr/bin/env node

/**
 * Start application with port waiting for web interface feedback
 */

const { spawn } = require('child_process');
const net = require('net');

const PORT = 3003;
const HOST = '0.0.0.0';

function waitForPort(port, host, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    function checkPort() {
      const socket = new net.Socket();
      
      socket.setTimeout(1000);
      
      socket.on('connect', () => {
        socket.destroy();
        console.log(`✅ Port ${port} is ready for connections`);
        resolve();
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        if (Date.now() - startTime >= timeout) {
          reject(new Error(`Timeout waiting for port ${port}`));
        } else {
          setTimeout(checkPort, 500);
        }
      });
      
      socket.on('error', () => {
        socket.destroy();
        if (Date.now() - startTime >= timeout) {
          reject(new Error(`Timeout waiting for port ${port}`));
        } else {
          setTimeout(checkPort, 500);
        }
      });
      
      socket.connect(port, host);
    }
    
    checkPort();
  });
}

async function startApplication() {
  console.log('🚀 Starting application with port waiting...');
  
  // Start the dev server
  const child = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: { ...process.env, REPLIT_EDITING: 'true' }
  });
  
  // Wait for the port to be ready
  try {
    await waitForPort(PORT, HOST);
    console.log(`🌐 Application is ready at http://${HOST}:${PORT}`);
    console.log('📱 Web interface feedback is now available');
  } catch (error) {
    console.error('❌ Failed to start application:', error.message);
    process.exit(1);
  }
  
  // Keep the process running
  child.on('exit', (code) => {
    console.log(`Application exited with code ${code}`);
    process.exit(code);
  });
  
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down...');
    child.kill('SIGINT');
  });
}

startApplication().catch(console.error);