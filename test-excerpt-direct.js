/**
 * Direct Test for extractHorrorExcerpt Function
 * 
 * This script directly tests our improved extractHorrorExcerpt function by
 * importing it from the compiled JavaScript and running it on some sample content.
 */

import fs from 'fs';

// Sample horror content for testing
const testContents = [
  {
    title: "Sample 1: HTML Paragraphs",
    content: `
      <p>This is just a normal introduction paragraph. Nothing scary here.</p>
      <p>But then I heard it. A whisper in the darkness. "I see you," it said, and I felt my blood freeze in my veins.</p>
      <p>The rest of the night was uneventful.</p>
    `
  },
  {
    title: "Sample 2: No HTML Tags",
    content: `
      It started like any other day. I woke up, brushed my teeth, and had breakfast.
      
      That's when I noticed the figure standing in my kitchen. It wasn't human. Its limbs bent at impossible angles, and its skin seemed to ripple like water. When it turned to face me, I saw that it had no eyes, just empty sockets that somehow still seemed to stare directly into my soul.
      
      Later I realized it was just a coat rack. Silly me.
    `
  },
  {
    title: "Sample 3: Mixed Format",
    content: `
      <p>I always check under my bed before I go to sleep.</p>
      
      Not because I'm afraid of monsters. I check to make sure they're still there, waiting for me. Sometimes they get impatient and try to leave early.
      
      <p>My therapist says this is just a coping mechanism.</p>
    `
  }
];

async function testExcerptFunction() {
  console.log("\n=== Testing extractHorrorExcerpt Function ===\n");
  
  try {
    // Dynamically import the compiled version of our content-analysis module
    // Note: We need to use the compiled JavaScript version, not the TypeScript source
    const { extractHorrorExcerpt } = await import('./client/dist/assets/content-analysis-XXXX.js');
    
    if (!extractHorrorExcerpt || typeof extractHorrorExcerpt !== 'function') {
      console.error("Could not load extractHorrorExcerpt function.");
      console.log("Let's try to find the compiled file manually:");
      
      // List the dist/assets directory to find the compiled file
      const files = fs.readdirSync('./client/dist/assets');
      console.log("Available files in dist/assets:");
      files.forEach(file => {
        if (file.includes('content-analysis')) {
          console.log(` - ${file}`);
        }
      });
      
      return;
    }
    
    // Run the function on each test content
    for (const test of testContents) {
      console.log(`\nTest: ${test.title}`);
      console.log(`Content (first 100 chars): ${test.content.substring(0, 100)}...`);
      
      try {
        const excerpt = extractHorrorExcerpt(test.content, 250);
        console.log(`Generated excerpt: "${excerpt}"`);
      } catch (err) {
        console.error(`Error extracting excerpt: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`Failed to import the function: ${err.message}`);
    console.error(err.stack);
  }
}

// Alternative approach: use the actual API endpoint
async function testExcerptViaAPI() {
  console.log("\n=== Testing excerpt via API ===\n");
  
  // For each story, we'll request the story details from the API
  // and check what excerpt is being generated
  
  try {
    // Get the first few story IDs from the API
    console.log("Fetching posts from API...");
    const response = await fetch('http://localhost:3001/api/posts');
    console.log("API Response status:", response.status);
    const responseText = await response.text();
    console.log("API Response text preview:", responseText.substring(0, 100));
    const data = JSON.parse(responseText);
    const posts = data.posts; // The response has a posts array property
    
    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      console.log("No posts returned from API");
      return;
    }
    
    console.log(`Found ${posts.length} posts, testing first 3 posts excerpts:`);
    
    // Get detailed story info for the first 3 posts
    for (let i = 0; i < Math.min(3, posts.length); i++) {
      const post = posts[i];
      console.log(`\nStory ${i+1}: ${post.title} (ID: ${post.id})`);
      
      try {
        console.log(`Fetching post details from /api/posts/${post.id}...`);
        const postResponse = await fetch(`http://localhost:3001/api/posts/${post.id}`);
        
        if (!postResponse.ok) {
          console.log(`API returned status ${postResponse.status} for post ID ${post.id}`);
          continue;
        }
        
        const responseText = await postResponse.text();
        console.log(`Post details response preview: ${responseText.substring(0, 100)}`);
        
        let postDetails;
        try {
          postDetails = JSON.parse(responseText);
        } catch (err) {
          console.error(`Failed to parse post details: ${err.message}`);
          continue;
        }
        
        // Log the generated excerpt
        if (!postDetails) {
          console.log("No post details returned");
          continue;
        }
        
        console.log(`Post title: ${postDetails.title || 'Unknown'}`);
        
        let excerpt = '';
        if (postDetails.excerpt) {
          excerpt = postDetails.excerpt;
          console.log(`Excerpt (from API): "${excerpt}"`);
        } else if (post.content) {
          // Use the content from the posts list if the detail content is missing
          const plainText = post.content.replace(/<\/?[^>]+(>|$)/g, '').trim();
          excerpt = plainText.substring(0, 150) + '...';
          console.log(`Excerpt (generated): "${excerpt}"`);
        } else {
          console.log("No content available to generate excerpt");
        }
      } catch (err) {
        console.error(`Error processing post ${post.id}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`Error testing API: ${err.message}`);
    console.error(err.stack);
  }
}

// Run the tests
(async () => {
  await testExcerptViaAPI();
})();