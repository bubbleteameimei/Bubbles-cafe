/**
 * Integration test script (manual) for tips routes.
 * Run this locally with the server running:
 *   ts-node server/tests/tips.test.ts
 */

async function testTips() {
  const base = process.env.BASE_URL || 'http://127.0.0.1:5000';

  // Record a tip intent (no auth required)
  const create = await fetch(`${base}/api/tips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Use an existing author id in your environment
    body: JSON.stringify({ authorId: 1, amount: '0', currency: 'USD', status: 'pending', message: 'support_intent' })
  });
  console.log('POST /api/tips status:', create.status);
  const created = await create.json().catch(() => null);
  console.log('Created tip response:', created);

  // Fetch aggregate tips for the author
  const list = await fetch(`${base}/api/tips/author/1`);
  console.log('GET /api/tips/author/1 status:', list.status);
  const agg = await list.json().catch(() => null);
  console.log('Aggregate tips response:', agg);
}

if (require.main === module) {
  testTips().catch((e) => {
    console.error('tips test failed:', e);
    process.exit(1);
  });
}

export {};