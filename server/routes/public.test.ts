import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { registerPublicRoutes, __test } from './public';
import { registerUserSettingsRoutes } from './user-settings';

const { stripHtml, escapeHtml, contactSchema, newsletterSchema, feedbackSchema } = __test;

describe('public route helpers', () => {
  it('stripHtml removes tags and decodes common entities', () => {
    expect(stripHtml('<p>It&#8217;s&nbsp;<b>dark</b> &amp; cold</p>')).toBe("It's dark & cold");
    expect(stripHtml(null)).toBe('');
  });

  it('escapeHtml neutralises markup for email bodies', () => {
    expect(escapeHtml('<script>"x"&</script>')).toBe('&lt;script&gt;&quot;x&quot;&amp;&lt;/script&gt;');
  });

  it('contactSchema requires name, email and message', () => {
    expect(contactSchema.safeParse({ name: 'A', email: 'a@b.co', message: 'hi' }).success).toBe(true);
    expect(contactSchema.safeParse({ name: '', email: 'a@b.co', message: 'hi' }).success).toBe(false);
    expect(contactSchema.safeParse({ name: 'A', email: 'nope', message: 'hi' }).success).toBe(false);
  });

  it('newsletterSchema normalises email case', () => {
    const parsed = newsletterSchema.parse({ email: '  Fan@Example.COM ' });
    expect(parsed.email).toBe('fan@example.com');
  });

  it('feedbackSchema requires content and caps lengths', () => {
    expect(feedbackSchema.safeParse({ content: 'ok' }).success).toBe(true);
    expect(feedbackSchema.safeParse({ content: '' }).success).toBe(false);
    expect(feedbackSchema.safeParse({ content: 'x'.repeat(10_001) }).success).toBe(false);
  });
});

describe('public routes (no database needed)', () => {
  let server: Server;
  let base: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/user', registerUserSettingsRoutes());
    app.use('/api', registerPublicRoutes());
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', () => resolve()));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  const post = (path: string, body: unknown) =>
    fetch(`${base}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  it('rejects an invalid contact submission with 400', async () => {
    const res = await post('/contact', { name: '', email: 'bad' });
    expect(res.status).toBe(400);
    expect((await res.json()).success).toBe(false);
  });

  it('rejects an invalid newsletter email with 400', async () => {
    const res = await post('/newsletter-direct/subscribe', { email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('rejects empty feedback with 400', async () => {
    const res = await post('/feedback', { content: '' });
    expect(res.status).toBe(400);
  });

  it('accepts client error reports with 204', async () => {
    const res = await post('/errors', { message: 'boom' });
    expect(res.status).toBe(204);
  });

  it('returns no suggestions for queries shorter than 2 characters', async () => {
    const res = await fetch(`${base}/search/suggest?q=a`);
    expect(await res.json()).toEqual({ suggestions: [] });
  });

  it('reports anonymous auth status without a token', async () => {
    const res = await fetch(`${base}/auth/status`);
    expect(await res.json()).toEqual({ isAuthenticated: false });
  });

  it('requires a token for user settings', async () => {
    const res = await fetch(`${base}/user/privacy-settings`);
    expect(res.status).toBe(401);
  });
});
