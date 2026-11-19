import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { registerCommentsRoutes } from './comments';
import { registerReaderRoutes } from './reader';
import { registerAdminRoutes } from './admin';

// These cover validation and auth paths that reject before touching the database.
describe('comment, reader and admin routes (no database needed)', () => {
  let server: Server;
  let base: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/admin', registerAdminRoutes());
    app.use('/api', registerReaderRoutes());
    app.use('/api', registerCommentsRoutes());
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', () => resolve()));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
    fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });

  it('rejects a non-numeric post id when listing comments', async () => {
    expect((await fetch(`${base}/posts/abc/comments`)).status).toBe(400);
  });

  it('rejects an empty comment', async () => {
    expect((await post('/posts/1/comments', { content: '   ' })).status).toBe(400);
  });

  it('rejects an oversized comment', async () => {
    expect((await post('/posts/1/comments', { content: 'x'.repeat(5001) })).status).toBe(400);
  });

  it('requires an admin to approve comments', async () => {
    expect((await post('/comments/1/approve', {})).status).toBe(401);
  });

  it('requires sign-in to save reading progress', async () => {
    expect((await post('/reading-progress', { postSlug: 'x', percentCompleted: 10 })).status).toBe(401);
  });

  it('requires sign-in to report a story', async () => {
    expect((await post('/posts/1/flag', { reason: 'spam' })).status).toBe(401);
  });

  it('returns no results for a one-character search', async () => {
    const res = await fetch(`${base}/search?q=a`);
    expect((await res.json()).results).toEqual([]);
  });

  it('rejects forged tokens on admin routes', async () => {
    const res = await fetch(`${base}/admin/users`, { headers: { Authorization: 'Bearer not-a-real-token' } });
    expect([401, 403]).toContain(res.status);
  });

  it('accepts analytics interactions with 204', async () => {
    expect((await post('/analytics/interaction', { interactionType: 'x' })).status).toBe(204);
  });
});
