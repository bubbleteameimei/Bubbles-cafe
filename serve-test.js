/**
 * Simple server to serve the tooltip test page 
 * and handle CORS for testing the reader page tooltip alignment
 */

import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 8080;

// Enable CORS for all requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve static files
app.use(express.static('.'));

// Default route serves the test page
app.get('/', (req, res) => {
  res.sendFile(path.resolve('manual-tooltip-test.html'));
});

// Proxy route for reader page
app.get('/reader-content', async (req, res) => {
  try {
    const response = await fetch('http://localhost:3001/reader');
    const text = await response.text();
    res.send(text);
  } catch (error) {
    console.error('Error fetching reader page:', error);
    res.status(500).send('Error fetching reader page');
  }
});

app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log('Open this URL in your browser to run the tooltip alignment test');
});