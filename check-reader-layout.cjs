const fs = require('fs');
const https = require('https');
const http = require('http');

// Function to fetch HTML content from a URL
async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Function to extract CSS classes from HTML
function extractCssClasses(html) {
  const classRegex = /class="([^"]*)"/g;
  const classes = new Set();
  
  let match;
  while ((match = classRegex.exec(html)) !== null) {
    const classNames = match[1].split(/\s+/);
    classNames.forEach(className => {
      if (className) classes.add(className);
    });
  }
  
  return Array.from(classes);
}

// Function to extract inline styles from HTML
function extractInlineStyles(html) {
  const styleRegex = /style="([^"]*)"/g;
  const styles = [];
  
  let match;
  while ((match = styleRegex.exec(html)) !== null) {
    styles.push(match[1]);
  }
  
  return styles;
}

// Function to check for overflow properties in inline styles
function checkOverflowProperties(styles) {
  const overflowStyles = styles.filter(style => 
    style.includes('overflow') || 
    style.includes('hidden')
  );
  
  return overflowStyles;
}

// Main function to check reader layout
async function checkReaderLayout() {
  console.log('Starting reader layout check...');
  
  try {
    // Fetch reader page HTML
    const readerHtml = await fetchHtml('http://localhost:3001/reader');
    
    // Save HTML for inspection
    fs.writeFileSync('reader-page.html', readerHtml);
    console.log('Saved reader page HTML to reader-page.html');
    
    // Extract and analyze CSS classes
    const cssClasses = extractCssClasses(readerHtml);
    console.log(`Found ${cssClasses.length} CSS classes`);
    
    // Look for potentially problematic classes
    const potentialIssueClasses = cssClasses.filter(cls => 
      cls.includes('overflow') || 
      cls.includes('hidden') ||
      cls.includes('truncate')
    );
    
    console.log('Potentially problematic CSS classes:');
    console.log(potentialIssueClasses);
    
    // Extract and analyze inline styles
    const inlineStyles = extractInlineStyles(readerHtml);
    console.log(`Found ${inlineStyles.length} inline styles`);
    
    // Check for overflow properties in inline styles
    const overflowStyles = checkOverflowProperties(inlineStyles);
    console.log('Inline styles with overflow properties:');
    console.log(overflowStyles);
    
    // Check for specific reader layout elements
    const storyContentRegex = /<div[^>]*class="[^"]*story-content[^"]*"[^>]*>/g;
    const articleRegex = /<motion\.article[^>]*class="[^"]*prose[^"]*"[^>]*>/g;
    
    const storyContentMatches = readerHtml.match(storyContentRegex) || [];
    const articleMatches = readerHtml.match(articleRegex) || [];
    
    console.log('Story content element classes:', storyContentMatches);
    console.log('Article element classes:', articleMatches);
    
    console.log('Reader layout check completed');
  } catch (error) {
    console.error('Error during reader layout check:', error);
  }
}

// Run the layout check
checkReaderLayout();