import http from 'http';
import fs from 'fs';

const posts = JSON.parse(fs.readFileSync('./posts_response.json','utf-8')).posts;

// Very simple in-memory store for comments and sessions
const commentsByPostId = new Map();
const sessions = new Map();

function getSession(req, res) {
  const cookie = req.headers['cookie'] || '';
  const match = cookie.match(/sid=([^;]+)/);
  let sid = match ? match[1] : null;
  if (!sid) {
    sid = Math.random().toString(36).slice(2);
    res.setHeader('Set-Cookie', `sid=${sid}; Path=/; HttpOnly`);
  }
  if (!sessions.has(sid)) sessions.set(sid, { csrfToken: Math.random().toString(36).slice(2) });
  return { sid, data: sessions.get(sid) };
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }

  const { data: sessionData } = getSession(req, res);

  if (req.url?.startsWith('/api/health')) {
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString(), csrfToken: sessionData.csrfToken }));
    return;
  }

  if (req.url === '/api/csrf-token' && req.method === 'GET') {
    res.end(JSON.stringify({ csrfToken: sessionData.csrfToken, timestamp: new Date().toISOString() }));
    return;
  }

  if (req.url?.startsWith('/api/posts/slug/')) {
    const slug = decodeURIComponent(req.url.split('/').pop() || '');
    const post = posts.find(p => p.slug === slug) || posts[0];
    if (!post) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Not found' })); return; }
    res.end(JSON.stringify(post));
    return;
  }

  if (req.url?.match(/^\/api\/posts\/?(\?.*)?$/) && req.method === 'GET') {
    const url = new URL(`http://x${req.url}`);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const start = (page - 1) * limit;
    const slice = posts.slice(start, start + limit);
    res.end(JSON.stringify({ posts: slice, hasMore: start + limit < posts.length }));
    return;
  }

  // Comments endpoints (minimal)
  const postCommentsMatch = req.url?.match(/^\/api\/posts\/(\d+)\/comments$/);
  if (postCommentsMatch) {
    const postId = Number(postCommentsMatch[1]);
    if (req.method === 'GET') {
      const list = commentsByPostId.get(postId) || [];
      res.end(JSON.stringify(list));
      return;
    }
    if (req.method === 'POST') {
      // CSRF check
      const headerToken = req.headers['x-csrf-token'];
      if (!headerToken || headerToken !== sessionData.csrfToken) {
        res.statusCode = 403;
        res.end(JSON.stringify({ error: 'CSRF token validation failed' }));
        return;
      }
      const body = await readJsonBody(req);
      const newComment = {
        id: Date.now(),
        content: String(body.content || '').slice(0, 2000),
        postId,
        userId: null,
        createdAt: new Date().toISOString(),
        parentId: body.parentId ?? null,
        is_approved: true,
        edited: false,
        editedAt: null,
        metadata: { author: body.author || 'Anonymous', ownerKey: `anon:${Math.random().toString(36).slice(2)}` }
      };
      const list = commentsByPostId.get(postId) || [];
      list.unshift(newComment);
      commentsByPostId.set(postId, list);
      res.statusCode = 201;
      res.end(JSON.stringify({ ...newComment, approved: true, isOwner: true }));
      return;
    }
  }

  const commentIdMatch = req.url?.match(/^\/api\/comments\/(\d+)(?:\/(vote|flag))?$/);
  if (commentIdMatch) {
    const id = Number(commentIdMatch[1]);
    const action = commentIdMatch[2];
    if (req.method === 'PATCH' || req.method === 'DELETE' || action) {
      // CSRF check
      const headerToken = req.headers['x-csrf-token'];
      if (!headerToken || headerToken !== sessionData.csrfToken) {
        res.statusCode = 403;
        res.end(JSON.stringify({ error: 'CSRF token validation failed' }));
        return;
      }
    }
    if (req.method === 'PATCH') {
      const body = await readJsonBody(req);
      for (const [pid, list] of commentsByPostId.entries()) {
        const idx = list.findIndex(c => c.id === id);
        if (idx !== -1) {
          list[idx].content = String(body.content || '').slice(0, 2000);
          list[idx].edited = true;
          list[idx].editedAt = new Date().toISOString();
          res.end(JSON.stringify({ ...list[idx], approved: true, isOwner: true }));
          return;
        }
      }
      res.statusCode = 404; res.end(JSON.stringify({ error: 'Comment not found' }));
      return;
    }
    if (req.method === 'DELETE') {
      for (const [pid, list] of commentsByPostId.entries()) {
        const idx = list.findIndex(c => c.id === id);
        if (idx !== -1) {
          const [removed] = list.splice(idx, 1);
          commentsByPostId.set(pid, list);
          res.end(JSON.stringify({ success: true }));
          return;
        }
      }
      res.statusCode = 404; res.end(JSON.stringify({ error: 'Comment not found' }));
      return;
    }
    if (req.method === 'POST' && action === 'flag') {
      res.end(JSON.stringify({ success: true }));
      return;
    }
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = process.env.MOCK_PORT || 4000;
server.listen(PORT, () => {
  console.log(`Mock API listening on http://localhost:${PORT}`);
});