import http from 'http';
import fs from 'fs';

const posts = JSON.parse(fs.readFileSync('./posts_response.json','utf-8')).posts;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json');

  if (req.url?.startsWith('/api/health')) {
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  if (req.url?.startsWith('/api/posts/slug/')) {
    const slug = decodeURIComponent(req.url.split('/').pop() || '');
    const post = posts.find(p => p.slug === slug) || posts[0];
    res.end(JSON.stringify(post));
    return;
  }

  if (req.url?.startsWith('/api/posts')) {
    const url = new URL(`http://x${req.url}`);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const start = (page - 1) * limit;
    const slice = posts.slice(start, start + limit);
    res.end(JSON.stringify({ posts: slice, hasMore: start + limit < posts.length }));
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = process.env.MOCK_PORT || 4000;
server.listen(PORT, () => {
  console.log(`Mock API listening on http://localhost:${PORT}`);
});