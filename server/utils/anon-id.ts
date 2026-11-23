/**
 * Signed, HttpOnly anonymous visitor id (`anon_comment_id` cookie).
 * Lets visitors who aren't signed in own their comments and reactions.
 * The cookie name is kept from the old Worker so existing visitors keep their id.
 */
import crypto from 'crypto';
import type { Request, Response } from 'express';

const COOKIE_NAME = 'anon_comment_id';
const COOKIE_MAX_AGE_S = 365 * 24 * 60 * 60;

function cookieSecret(): string {
  return (
    process.env.COMMENT_COOKIE_SECRET ||
    process.env.CSRF_SECRET ||
    process.env.JWT_SECRET ||
    'dev-only-comment-cookie-secret'
  );
}

function sign(id: string): string {
  const mac = crypto.createHmac('sha256', cookieSecret()).update(id).digest('base64url');
  return `${id}.${mac}`;
}

function verify(value: string | undefined): string | null {
  if (!value) return null;
  const dot = value.lastIndexOf('.');
  if (dot <= 0) return null;
  const id = value.slice(0, dot);
  const a = Buffer.from(value);
  const b = Buffer.from(sign(id));
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? id : null;
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return undefined;
}

/** The verified anonymous id from the request cookie, or null. */
export function getAnonId(req: Request): string | null {
  return verify(readCookie(req, COOKIE_NAME));
}

/** Issue a new anonymous id cookie on the response and return the id. */
export function issueAnonId(res: Response): string {
  const id = crypto.randomUUID();
  const prod = process.env.NODE_ENV === 'production';
  // SameSite=None so Vercel preview domains (cross-site) also work; requires Secure.
  const attrs = [
    `${COOKIE_NAME}=${encodeURIComponent(sign(id))}`,
    'Path=/',
    `Max-Age=${COOKIE_MAX_AGE_S}`,
    'HttpOnly',
    prod ? 'SameSite=None' : 'SameSite=Lax',
    prod ? 'Secure' : '',
  ].filter(Boolean);
  res.append('Set-Cookie', attrs.join('; '));
  return id;
}
