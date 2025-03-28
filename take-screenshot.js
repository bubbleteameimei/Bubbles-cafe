const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function takeScreenshot() {
  try {
    console.log('Creating screenshots directory if it doesn\'t exist...');
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }

    console.log('Taking screenshot of homepage...');
    
    // Use curl to fetch the homepage content
    const curlOutput = execSync('curl http://localhost:3001/').toString();
    
    // Write the output to a file
    fs.writeFileSync(path.join(screenshotsDir, 'homepage.html'), curlOutput);
    
    // Also fetch the reader page
    const readerOutput = execSync('curl http://localhost:3001/reader').toString();
    fs.writeFileSync(path.join(screenshotsDir, 'reader.html'), readerOutput);
    
    // And the stories page
    const storiesOutput = execSync('curl http://localhost:3001/stories').toString();
    fs.writeFileSync(path.join(screenshotsDir, 'stories.html'), storiesOutput);
    
    console.log('Screenshots saved to:', screenshotsDir);
    console.log('Content saved to HTML files for inspection.');
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
}

takeScreenshot();