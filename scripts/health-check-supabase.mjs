const base = process.env.BASE_URL || 'http://localhost:5000';
const expected = process.env.EXPECTED_SUPABASE_URL || 'https://rqoqtusrlsapcbdimwpn.supabase.co';

// Node 22 has global fetch. If running older Node, upgrade to match package.json engines.

const url = new URL('/api/health/supabase', base);
url.searchParams.set('expected', expected);

if (process.env.ALLOW_WRITES === 'true') {
  url.searchParams.set('allowWrites', 'true');
}

// Accept also via EXPECTED_SUPABASE_URL env (matches .env.example)

const res = await fetch(url.toString());
const text = await res.text();

// Print raw to make copy/paste debugging easy.
console.log(text);

if (!res.ok) {
  process.exit(1);
}

try {
  const parsed = JSON.parse(text);
  if (parsed.status && parsed.status !== 'ok') {
    process.exit(2);
  }
} catch {
  // non-json response is unexpected
  process.exit(3);
}
