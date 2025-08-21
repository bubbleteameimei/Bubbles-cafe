#!/usr/bin/env node

// Simple CLI to post a test comment with CSRF handling and cookie persistence
// Usage: node scripts/post-test-comment.mjs <slug> [message]

import http from 'http';
import https from 'https';

const BASE = process.env.BASE_URL || 'http://localhost:3001';

const agent = (url) => (url.startsWith('https:') ? new https.Agent({ keepAlive: true }) : new http.Agent({ keepAlive: true }));

let cookieHeader = '';

async function fetchWithCookies(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const headers = new Headers(options.headers || {});
  if (cookieHeader) headers.set('Cookie', cookieHeader);

  const res = await fetch(url, {
    ...options,
    headers,
    // @ts-ignore keep-alive
    agent: agent(url)
  });

  // Capture Set-Cookie
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    // Keep only connect.sid to avoid echoing secure attributes
    const sidMatch = setCookie.match(/connect\.sid=([^;]+)/);
    if (sidMatch) {
      const sid = `connect.sid=${sidMatch[1]}`;
      cookieHeader = sid;
    }
  }

  return res;
}

async function getJson(path, options = {}) {
  const res = await fetchWithCookies(path, options);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`);
  return res.json();
}

async function main() {
  const [slugArg, ...msgParts] = process.argv.slice(2);
  if (!slugArg) {
    console.error('Usage: node scripts/post-test-comment.mjs <slug> [message]');
    process.exit(1);
  }
  const message = msgParts.join(' ') || `Automated test comment at ${new Date().toISOString()}`;

  // 1) Resolve post by slug
  const post = await getJson(`/api/posts/slug/${encodeURIComponent(slugArg)}`);
  const postId = Number(post?.id);
  if (!Number.isFinite(postId)) throw new Error('Could not resolve post id from slug');
  console.log(`Resolved slug "${slugArg}" -> id=${postId}`);

  // 2) Initialize session and get CSRF token
  await getJson('/api/health');
  const csrf = await getJson('/api/csrf-token').then(d => d?.csrfToken || null);
  if (!csrf) throw new Error('Failed to obtain CSRF token');
  console.log(`Obtained CSRF token len=${csrf.length}`);

  // 3) Create comment
  const res = await fetchWithCookies(`/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf
    },
    body: JSON.stringify({ content: message })
  });
  const body = await res.text();
  if (!res.ok) {
    console.error('Create comment failed:', res.status, res.statusText);
    console.error(body);
    process.exit(2);
  }
  console.log('Create comment response:', body);

  // 4) List comments (first few)
  const comments = await getJson(`/api/posts/${postId}/comments`);
  console.log(`Comments count: ${Array.isArray(comments) ? comments.length : 0}`);
  const latest = Array.isArray(comments) ? comments[0] : null;
  if (latest) {
    console.log('Latest comment snippet:', String(latest.content).slice(0, 120));
  }
}

main().catch(err => {
  console.error('Error:', err?.message || err);
  process.exit(1);
});

