import express from 'express';
import { createServer } from 'http';
import { setupVite } from './vite';

const app = express();
const PORT = 3002;

// Minimal middleware
app.use(express.json());

// Basic health endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic API routes
app.get('/api/posts', (_req, res) => {
  res.json([]);
});

app.get('/api/posts/recommendations', (_req, res) => {
  res.json([]);
});

// Create server first
const server = createServer(app);

try {
  // Setup Vite
  await setupVite(app, server);
  
  // Start server
  server.listen(PORT, '0.0.0.0', () => {
    
  });
} catch (error) {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
}

process.on('SIGTERM', () => {
  
  server.close();
});