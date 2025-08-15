const puppeteer = require('puppeteer');

async function checkReaderLayout() {
  console.log('Starting reader layout check...');
  
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
    await page.goto('http://localhost:3001/reader', { 
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Wait for content to load
    console.log('Waiting for content to load...');
    await page.waitForSelector('.story-content', { timeout: 15000 });
    
    console.log('Taking screenshot of reader page...');
    await page.screenshot({ path: 'reader-page.png', fullPage: true });
    
    // Check layout properties via console
    const layoutInfo = await page.evaluate(() => {
      // Get all container elements
      const readerPage = document.querySelector('.reader-page');
      const mainContainer = document.querySelector('.reader-page > div');
      const article = document.querySelector('article');
      const storyContent = document.querySelector('.story-content');
      
      return {
        readerPage: readerPage ? {
          overflow: getComputedStyle(readerPage).overflow,
          width: getComputedStyle(readerPage).width
        } : null,
        
        mainContainer: mainContainer ? {
          overflow: getComputedStyle(mainContainer).overflow,
          width: getComputedStyle(mainContainer).width
        } : null,
        
        article: article ? {
          overflow: getComputedStyle(article).overflow,
          width: getComputedStyle(article).width,
          maxWidth: getComputedStyle(article).maxWidth
        } : null,
        
        storyContent: storyContent ? {
          overflow: getComputedStyle(storyContent).overflow,
          width: getComputedStyle(storyContent).width,
          maxWidth: getComputedStyle(storyContent).maxWidth
        } : null
      };
    });
    
    console.log('Layout information:');
    console.log(JSON.stringify(layoutInfo, null, 2));
    
    // Check right margin for visible text
    const textVisible = await page.evaluate(() => {
      const article = document.querySelector('article');
      const storyContent = document.querySelector('.story-content');
      
      // Check if any text is closer than 10px to the right edge of the viewport
      const viewportWidth = window.innerWidth;
      const articleRect = article.getBoundingClientRect();
      const storyContentRect = storyContent.getBoundingClientRect();
      
      // Check if article or story content is at risk of being cut off
      const articleRightDistance = viewportWidth - (articleRect.left + articleRect.width);
      const storyRightDistance = viewportWidth - (storyContentRect.left + storyContentRect.width);
      
      return {
        viewportWidth,
        articleWidth: articleRect.width,
        articleRightDistance,
        storyContentWidth: storyContentRect.width,
        storyRightDistance,
        articleRightMargin: getComputedStyle(article).marginRight,
        storyRightMargin: getComputedStyle(storyContent).marginRight,
        isCutOffRisk: articleRightDistance < 10 || storyRightDistance < 10
      };
    });
    
    console.log('Text visibility check:');
    console.log(JSON.stringify(textVisible, null, 2));
    
  } catch (error) {
    console.error('Error during reader layout check:', error);
  } finally {
    await browser.close();
    console.log('Reader layout check completed');
  }
}

checkReaderLayout();