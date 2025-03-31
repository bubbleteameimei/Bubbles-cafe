/**
 * Script to verify that we have simplified search filters but full theme categories
 */

import fetch from 'node-fetch';
import puppeteer from 'puppeteer';

async function checkThemeCategories() {
  // First check the community page - should have simplified categories in filters
  try {
    console.log("Testing community page filters (should be simplified)...");
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/community', { waitUntil: 'networkidle0' });
    
    // Check for the category filter in the DOM
    const content = await page.content();
    
    // These are the expected simplified categories in the filter
    const simplifiedCategories = [
      "All Categories",
      "Psychological", 
      "Supernatural", 
      "Technological", 
      "Body Horror", 
      "Gothic", 
      "Apocalyptic"
    ];
    
    let foundSimplifiedCategories = 0;
    for (const category of simplifiedCategories) {
      if (content.includes(category)) {
        foundSimplifiedCategories++;
        console.log(`✓ Found simplified category in filter: ${category}`);
      }
    }
    
    console.log(`Found ${foundSimplifiedCategories} out of ${simplifiedCategories.length} simplified categories in filters`);
    
    // Now check the submit story page - should have full theme categories
    console.log("\nTesting submit story page (should have full theme categories)...");
    await page.goto('http://localhost:3000/submit-story', { waitUntil: 'networkidle0' });
    
    // Wait for the form to load
    await page.waitForSelector('form', { timeout: 5000 });
    
    // Click on the theme category select to open the dropdown
    const themeSelect = await page.$('[placeholder="Select a theme category"]');
    if (themeSelect) {
      await themeSelect.click();
      await page.waitForTimeout(200); // Wait for dropdown to open
      
      const dropdownContent = await page.content();
      
      // These are some of the expected full theme categories
      const fullThemeCategories = [
        "Gothic Horror",
        "Supernatural",
        "Monster Stories",
        "Cosmic Horror",
        "Psychological Horror",
        "Suspense & Thriller",
        "Mystery",
        "Urban Legends",
        "Tech Horror",
        "Body Horror",
        "Folk Horror",
        "Dystopian",
        "Apocalyptic"
      ];
      
      let foundFullCategories = 0;
      for (const category of fullThemeCategories) {
        if (dropdownContent.includes(category)) {
          foundFullCategories++;
          console.log(`✓ Found full theme category in editor: ${category}`);
        }
      }
      
      console.log(`Found ${foundFullCategories} out of ${fullThemeCategories.length} full theme categories in editor`);
      
      if (foundFullCategories > 7) {
        console.log("\n✅ CORRECT: Submit story page has the FULL set of theme categories!");
      } else {
        console.log("\n❌ ERROR: Submit story page has simplified categories, not the full set!");
      }
    } else {
      console.log("❌ Couldn't find theme category select in the form");
    }
    
    await browser.close();
    
    console.log("\nVerification complete!");
    
  } catch (error) {
    console.error("Error running check:", error);
  }
}

checkThemeCategories();