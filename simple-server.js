import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an Express application
const app = express();
const PORT = 3000;

// Serve static files from the public directory
app.use(express.static('public'));

// Serve the client build directory if it exists
if (fs.existsSync(path.join(__dirname, 'client', 'build'))) {
  app.use(express.static(path.join(__dirname, 'client', 'build')));
}

// Serve client/public as static files
if (fs.existsSync(path.join(__dirname, 'client', 'public'))) {
  app.use(express.static(path.join(__dirname, 'client', 'public')));
}

// Route to serve the index.html for our SPA
app.get('*', (req, res) => {
  // First check if client/build/index.html exists
  const buildIndexPath = path.join(__dirname, 'client', 'build', 'index.html');
  if (fs.existsSync(buildIndexPath)) {
    return res.sendFile(buildIndexPath);
  }
  
  // Then check if there's an index.html in the public directory
  const publicIndexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(publicIndexPath)) {
    return res.sendFile(publicIndexPath);
  }
  
  // If neither exists, send a simple HTML that displays our homepage image
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Homepage Preview</title>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
        }
        
        .container {
          position: relative;
          height: 100vh;
          width: 100vw;
        }
        
        .background-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: -2;
        }
        
        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%);
          z-index: -1;
        }
        
        .content {
          position: relative;
          z-index: 1;
          color: white;
          text-align: center;
          padding-top: 20vh;
          font-family: Arial, sans-serif;
        }
        
        h1 {
          font-size: 4rem;
          margin-bottom: 2rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        
        p {
          font-size: 1.5rem;
          max-width: 800px;
          margin: 0 auto;
          text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="/images/homepage-bg.jpeg" alt="Homepage Background" class="background-image">
        <div class="overlay"></div>
        <div class="content">
          <h1>BUBBLE'S CAFE</h1>
          <p>Each story here is a portal to the unexpected, the unsettling, and the unexplained.</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${PORT}`);
});