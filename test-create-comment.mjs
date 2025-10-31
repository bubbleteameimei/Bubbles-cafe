import fetch from 'node-fetch';

function getBaseUrl() {
  return process.env.APP_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002';
}

function extractCookies(setCookieHeaders = []) {
  // Convert Set-Cookie headers into a single Cookie header string
  const pairs = [];
  for (const header of setCookieHeaders) {
    if (typeof header !== 'string') continue;
    const first = header.split(';')[0].trim();
    if (first) pairs.push(first);
  }
  return pairs.join('; ');
}

async function getCsrfTokenAndCookies(base) {
  const res = await fetch(`${base}/api/csrf-token`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });
  const rawCookies = res.headers && typeof res.headers.raw === 'function'
    ? (res.headers.raw()['set-cookie'] || [])
    : [];
  const cookies = extractCookies(rawCookies);
  const data = await res.json().catch(() => ({}));
  const token = data?.csrfToken || '';
  if (!token) throw new Error('Failed to obtain CSRF token');
  return { token, cookies };
}

async function testCreateComment() {
  try {
    // Test comment creation
    console.log('Testing comment creation API...');
    const base = getBaseUrl();

    const { token, cookies } = await getCsrfTokenAndCookies(base);

    const newComment = {
      content: "This is a test comment " + new Date().toISOString(),
      author: "TestUser"
    };

    const response = await fetch(`${base}/api/posts/6/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
        ...(cookies ? { 'Cookie': cookies } : {})
      },
      body: JSON.stringify(newComment)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Successfully created comment:');
      console.log(JSON.stringify(result, null, 2));

      // Check approval field names
      console.log('Approval field check:');
      console.log('- approved field:', result.approved);
      console.log('- is_approved field:', result.is_approved);

      // Verify our helper function logic would work
      const isApproved = result.approved === true || result.is_approved === true;
      console.log('Would be shown by our helper function:', isApproved);
    } else {
      console.error('Failed to create comment:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
  } catch (error) {
    console.error('Error running comment creation test:', error);
  }
}

testCreateComment();
