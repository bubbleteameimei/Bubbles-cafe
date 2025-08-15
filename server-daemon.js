const { spawn } = require('child_process');
const fs = require('fs');

const logFile = fs.createWriteStream('/tmp/server-daemon.log', { flags: 'a' });

function startServer() {
  console.log('Starting server daemon...');
  
  const server = spawn('tsx', ['server/index.ts'], {
    cwd: '/home/runner/workspace',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      REPLIT_EDITING: 'true',
      PORT: '3002'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  server.stdout.on('data', (data) => {
    const msg = `STDOUT: ${data}`;
    console.log(msg);
    logFile.write(msg);
  });

  server.stderr.on('data', (data) => {
    const msg = `STDERR: ${data}`;
    console.error(msg);
    logFile.write(msg);
  });

  server.on('close', (code) => {
    const msg = `Server exited with code ${code}\n`;
    console.log(msg);
    logFile.write(msg);
    
    if (code !== 0) {
      console.log('Restarting server in 5 seconds...');
      setTimeout(startServer, 5000);
    }
  });

  return server;
}

const serverProcess = startServer();

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  serverProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  serverProcess.kill();
  process.exit(0);
});