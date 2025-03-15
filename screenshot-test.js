import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1280,800'],
    headless: 'new'
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating to About page...');
    await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle2', timeout: 30000 });
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'about-page-screenshot.png', fullPage: true });
    
    console.log('Screenshot saved as about-page-screenshot.png');
    
    // Check for author avatar and subtitle
    const hasAvatar = await page.evaluate(() => {
      const avatar = document.querySelector('.avatar img');
      return avatar && avatar.getAttribute('src').includes('author.png');
    });
    
    const hasSubtitle = await page.evaluate(() => {
      const subtitle = document.querySelector('.text-muted-foreground.italic');
      return subtitle && subtitle.textContent.includes('Writer, Designer, and Developer');
    });
    
    console.log('Avatar found:', hasAvatar);
    console.log('Subtitle found:', hasSubtitle);
    
    if (hasAvatar && hasSubtitle) {
      console.log('✅ SUCCESS! The About page has both the avatar and subtitle.');
    } else {
      console.log('❌ ISSUE: Some elements are missing or incorrect.');
    }
  } catch (error) {
    console.error('Error during screenshot test:', error);
  } finally {
    await browser.close();
  }
})();