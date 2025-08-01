import express from 'express';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

const app = express();
const PORT = parseInt(process.env.PORT || "3002", 10);

// Basic middleware
app.use(express.json());

// Database connection
const databaseUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}?sslmode=require`;
const pool = new Pool({ connectionString: databaseUrl });

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Posts endpoint
app.get('/api/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, title, excerpt, created_at FROM posts ORDER BY created_at DESC LIMIT 10');
    res.json({ posts: result.rows });
  } catch (error) {
    res.json({ posts: [], error: error.message });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Interactive Storytelling Platform API',
    status: 'running',
    endpoints: ['/api/health', '/api/posts']
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`🎯 Health check: http://0.0.0.0:${PORT}/api/health`);
});