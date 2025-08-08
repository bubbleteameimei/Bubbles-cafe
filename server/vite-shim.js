export function log(message, source = 'server') {
  // Keep logging lightweight in production builds
  if (process.env.NODE_ENV !== 'test') {
    try { console.log(`[${source}]`, message); } catch {}
  }
}