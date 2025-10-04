import { Request, Response } from 'express';

export function ssrStreamHandler(req: Request, res: Response) {
  if (process.env.ENABLE_SSR !== 'true') {
    res.status(404).end('SSR disabled');
    return;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.write(`<!doctype html><html><head><meta charset="utf-8"/><title>Bubble’s Cafe - Dark, Psychological and Gothic Fiction</title></head><body>`);
  res.write(`<div id="root">`);
  // Skeleton shell
  res.write(`<div style="padding:16px;font-family:system-ui">Loading…</div>`);
  res.write(`</div>`);
  // Hydration script placeholder; client will mount
  res.write(`<script type="module" src="/src/main.tsx"></script>`);
  res.end(`</body></html>`);
}

