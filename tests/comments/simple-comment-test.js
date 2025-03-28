import puppeteer from 'puppeteer';

async function testCommentSection() {
  try {
    console.log('Launching browser to test comment section...');
    
    // Launch headless browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create a new page
    const page = await browser.newPage();
    
    // Navigate to the nostalgia story page
    await page.goto('http://localhost:3001/reader/nostalgia', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Check if the comment section exists
    console.log('Checking if comment section is visible...');
    const commentSectionExists = await page.evaluate(() => {
      const section = document.querySelector('h5');
      return section && section.textContent.includes('Discussion');
    });
    
    console.log('Comment section exists:', commentSectionExists);
    
    // Count comments
    const commentCount = await page.evaluate(() => {
      const comments = document.querySelectorAll('[data-comment-id]');
      return comments.length;
    });
    
    console.log(`Found ${commentCount} comments displayed`);
    
    // Get comment text
    if (commentCount > 0) {
      const commentTexts = await page.evaluate(() => {
        const comments = document.querySelectorAll('[data-comment-id]');
        return Array.from(comments).map(comment => {
          const content = comment.querySelector('p');
          return content ? content.textContent : 'No content found';
        });
      });
      
      console.log('Comment contents:');
      commentTexts.forEach((text, index) => {
        console.log(`- Comment ${index + 1}: ${text}`);
      });
    }
    
    // Close the browser
    await browser.close();
    console.log('Test completed');
    
  } catch (error) {
    console.error('Error running test:', error);
  }
}

testCommentSection();
