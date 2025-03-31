import fetch from 'node-fetch';
import fs from 'fs';

async function testBookmarks() {
  try {
    console.log('Logging in as admin...');
    // First, we need to get the CSRF token
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf', {
      method: 'GET',
    });
    
    if (!csrfResponse.ok) {
      console.error('Failed to get CSRF token:', await csrfResponse.text());
      return;
    }
    
    const { csrfToken } = await csrfResponse.json();
    console.log('Got CSRF token:', csrfToken);
    
    // Attempt to log in
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        email: 'vantalison@gmail.com',
        password: 'admin123'
      }),
      credentials: 'include'
    });
    
    if (!loginResponse.ok) {
      console.error('Login failed:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData);
    
    // Get the cookies from the login response
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Now try to get bookmarks
    console.log('Fetching bookmarks...');
    const bookmarksResponse = await fetch('http://localhost:3000/api/bookmarks', {
      method: 'GET',
      headers: {
        'Cookie': cookies,
        'X-CSRF-Token': csrfToken
      }
    });
    
    if (!bookmarksResponse.ok) {
      console.error('Failed to fetch bookmarks:', await bookmarksResponse.text());
      return;
    }
    
    const bookmarks = await bookmarksResponse.json();
    console.log('Bookmarks fetched successfully!');
    console.log('Number of bookmarks:', bookmarks.length);
    
    // Save detailed output to file
    fs.writeFileSync('bookmarks-response.json', JSON.stringify(bookmarks, null, 2));
    console.log('Bookmark details saved to bookmarks-response.json');
    
    // Print a summary of each bookmark
    bookmarks.forEach((bookmark, index) => {
      console.log(`\nBookmark ${index + 1}:`);
      console.log(`  ID: ${bookmark.id}`);
      console.log(`  Post ID: ${bookmark.postId}`);
      console.log(`  Post Title: ${bookmark.post.title}`);
      console.log(`  Post Slug: ${bookmark.post.slug}`);
      console.log(`  Notes: ${bookmark.notes}`);
      console.log(`  Tags: ${bookmark.tags ? bookmark.tags.join(', ') : 'none'}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testBookmarks();