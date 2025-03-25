import puppeteer from 'puppeteer';

async function testReaderLayout() {
  console.log('Starting reader layout test...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport to a reasonable size
    await page.setViewport({ width: 1200, height: 800 });
    
    // Navigate to the reader page
    console.log('Navigating to reader page...');
    await page.goto('http://localhost:3001/reader', { waitUntil: 'networkidle2' });
    
    // Wait for content to load
    await page.waitForSelector('.story-content', { timeout: 5000 });
    
    console.log('Checking overflow properties...');
    
    // Check the various container elements for overflow settings
    const overflowChecks = await page.evaluate(() => {
      const results = {};
      
      // Check root container
      const readerPage = document.querySelector('.reader-page');
      if (readerPage) {
        const readerPageStyle = window.getComputedStyle(readerPage);
        results.readerPage = {
          overflow: readerPageStyle.overflow,
          overflowX: readerPageStyle.overflowX,
          overflowY: readerPageStyle.overflowY,
          width: readerPageStyle.width,
          maxWidth: readerPageStyle.maxWidth
        };
      }
      
      // Check main container
      const mainContainer = document.querySelector('.reader-page > div');
      if (mainContainer) {
        const mainContainerStyle = window.getComputedStyle(mainContainer);
        results.mainContainer = {
          overflow: mainContainerStyle.overflow,
          overflowX: mainContainerStyle.overflowX,
          overflowY: mainContainerStyle.overflowY,
          width: mainContainerStyle.width,
          maxWidth: mainContainerStyle.maxWidth
        };
      }
      
      // Check article element
      const article = document.querySelector('article');
      if (article) {
        const articleStyle = window.getComputedStyle(article);
        results.article = {
          overflow: articleStyle.overflow,
          overflowX: articleStyle.overflowX,
          overflowY: articleStyle.overflowY,
          width: articleStyle.width,
          maxWidth: articleStyle.maxWidth,
          padding: articleStyle.padding,
          paddingLeft: articleStyle.paddingLeft,
          paddingRight: articleStyle.paddingRight
        };
      }
      
      // Check story content
      const storyContent = document.querySelector('.story-content');
      if (storyContent) {
        const storyContentStyle = window.getComputedStyle(storyContent);
        results.storyContent = {
          overflow: storyContentStyle.overflow,
          overflowX: storyContentStyle.overflowX,
          overflowY: storyContentStyle.overflowY,
          width: storyContentStyle.width,
          maxWidth: storyContentStyle.maxWidth,
          padding: storyContentStyle.padding,
          paddingLeft: storyContentStyle.paddingLeft,
          paddingRight: storyContentStyle.paddingRight
        };
      }
      
      return results;
    });
    
    console.log('Container overflow settings:');
    console.log(JSON.stringify(overflowChecks, null, 2));
    
    // Check if story text is getting cut off
    console.log('Taking screenshot of reader page...');
    await page.screenshot({ path: 'reader-layout-test.png' });
    
    console.log('Reader layout test completed.');
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
}

testReaderLayout();