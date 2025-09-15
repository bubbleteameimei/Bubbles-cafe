#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting server process...');

const serverProcess = spawn('tsx', ['server/index.ts'], {
  cwd: '/home/runner/workspace',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    REPLIT_EDITING: 'true',
    PORT: '3002'
  },
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true
});

serverProcess.stdout.on('data', (data) => {
  console.log(`Server: ${data.toString()}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`Server Error: ${data.toString()}`);
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Keep the parent process alive
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, terminating server...');
  serverProcess.kill();
  process.exit(0);
});

console.log(`Server process started with PID: ${serverProcess.pid}`);

// Prevent the script from exiting
setInterval(() => {
  // Ping to keep alive
}, 30000);