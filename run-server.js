#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting dev environment...');

const serverProcess = spawn('npm', ['run', 'dev'], {
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
  console.log(`Dev: ${data.toString()}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`Dev Error: ${data.toString()}`);
});

serverProcess.on('close', (code) => {
  console.log(`Dev process exited with code ${code}`);
});

// Keep the parent process alive
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, terminating dev environment...');
  serverProcess.kill();
  process.exit(0);
});

console.log(`Dev process started with PID: ${serverProcess.pid}`);

// Prevent the script from exiting
setInterval(() => {
  // Ping to keep alive
}, 30000);