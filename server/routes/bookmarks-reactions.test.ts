import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { registerBookmarksRoutes } from './bookmarks';
import { registerReactionsRoutes } from './reactions';

// Validation and auth paths that reject before touching the database.
describe('bookmark, reaction and view routes (no database needed)', () => {
  let server: Server;
  let base: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/bookmarks', registerBookmarksRoutes());
    app.use('/api/posts', registerReactionsRoutes());
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', () => resolve()));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  const send = (method: string, path: string, body?: unknown) =>
    fetch(`${base}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  // The site calls these exact paths (keyed by story id); all need sign-in.
  it.each([
    ['GET', '/bookmarks'],
    ['GET', '/bookmarks/12'],
    ['POST', '/bookmarks/12'],
    ['PATCH', '/bookmarks/12'],
    ['DELETE', '/bookmarks/12'],
    ['POST', '/bookmarks/migrate'],
    ['GET', '/bookmarks/tag/horror'],
  ])('%s %s requires sign-in', async (method, path) => {
    const res = await send(method, path, method === 'GET' ? undefined : {});
    expect(res.status).toBe(401);
  });

  it('rejects a non-numeric story id when counting a view', async () => {
    expect((await send('POST', '/posts/abc/view', {})).status).toBe(400);
  });

  it('rejects a non-numeric story id when reacting', async () => {
    expect((await send('POST', '/posts/abc/reaction', { nextState: 'like' })).status).toBe(400);
  });

  it('returns empty results for a summary request without ids', async () => {
    const res = await fetch(`${base}/posts/summary?ids=`);
    expect(res.status).toBe(200);
    expect((await res.json()).results).toEqual([]);
  });

  it('returns empty results for a reactions batch without valid ids', async () => {
    const res = await fetch(`${base}/posts/reactions-batch?ids=x,-1`);
    expect((await res.json()).results).toEqual([]);
  });
});
