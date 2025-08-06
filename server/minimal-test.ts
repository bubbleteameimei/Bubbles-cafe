import express from 'express';
import { createServer } from 'http';

const app = express();
const PORT = 3002;
const HOST = '0.0.0.0';

// Add a simple test route
app.get('/test', (_req, res) => {
  res.json({ message: 'Minimal server is working!' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Server is running!' });
});

const server = createServer(app);

server.listen(PORT, HOST, () => {
  console.log(`🚀 Minimal server started successfully on http://${HOST}:${PORT}`);
});

export default app;