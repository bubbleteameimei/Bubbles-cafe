import express from 'express';
import { createServer } from 'http';
import { setupVite } from './vite';

const app = express();
const PORT = parseInt(process.env.PORT || "3002", 10);
const HOST = '0.0.0.0';

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    minimal: true
  });
});

// Setup Vite for frontend
// const __filename = fileURLToPath(import.meta.url); // Unused variable
const server = createServer(app);

// Setup Vite after creating server
await setupVite(app, server);

server.listen(PORT, HOST, () => {
  
});

// Graceful shutdown
process.on('SIGTERM', () => {
  
  server.close(() => {
    
    process.exit(0);
  });
});