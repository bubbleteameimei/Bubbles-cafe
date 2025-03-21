// Simple script to test WordPress API directly
import fetch from 'node-fetch';

const WORDPRESS_API_URL = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts';

async function testWordPressAPI() {
  try {
    console.log('Attempting to fetch WordPress posts...');
    
    const params = new URLSearchParams({
      page: '1',
      per_page: '5',
      orderby: 'date',
      order: 'desc'
    });
    
    const url = `${WORDPRESS_API_URL}?${params}`;
    console.log(`Request URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    // Check content type
    const contentType = response.headers.get('content-type');
    console.log(`Content type: ${contentType}`);
    
    if (!response.ok) {
      console.error(`Error response: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    
    if (Array.isArray(data)) {
      console.log(`Received ${data.length} posts`);
      // Print first post title if available
      if (data.length > 0) {
        console.log(`First post title: ${data[0].title.rendered}`);
      }
    } else {
      console.log('Response is not an array:', typeof data);
    }
  } catch (error) {
    console.error('Error fetching WordPress data:', error);
  }
}

testWordPressAPI();