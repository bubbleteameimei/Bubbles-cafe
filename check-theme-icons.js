/**
 * Simple Theme Icons Check Script
 * 
 * This script fetches the homepage HTML and checks for presence of theme icons
 * and badge elements to verify our implementation.
 */
import fetch from 'node-fetch';

async function checkThemeIcons() {
  try {
    console.log('Fetching homepage HTML...');
    const response = await fetch('http://localhost:3003');
    const html = await response.text();
    
    // Check for any badges
    const badgeMatches = html.match(/<span[^>]*class="[^"]*badge[^"]*"[^>]*>/gi) || [];
    console.log(`Found ${badgeMatches.length} badge elements on the page`);
    
    if (badgeMatches.length > 0) {
      console.log('\nSample badges:');
      badgeMatches.slice(0, 3).forEach((badge, index) => {
        console.log(`Badge ${index + 1}: ${badge}`);
        
        // Extract the 10 lines around this badge to see context
        const badgePosition = html.indexOf(badge);
        const contextStart = html.lastIndexOf('<', Math.max(0, badgePosition - 200));
        const contextEnd = html.indexOf('</div>', badgePosition + badge.length) + 6;
        if (contextStart >= 0 && contextEnd > 0) {
          const context = html.substring(contextStart, contextEnd);
          console.log(`\nContext for Badge ${index + 1}:`);
          console.log(context);
          console.log('---');
        }
      });
    } else {
      console.log('No badges found on the page - theme icons may not be rendering');
    }
    
    // Check for any specific icon classes (e.g., from Lucide)
    const iconMatches = html.match(/<svg[^>]*class="[^"]*h-[34][^"]*w-[34][^"]*"[^>]*>/gi) || [];
    console.log(`\nFound ${iconMatches.length} small icon SVG elements on the page`);
    
    if (iconMatches.length > 0) {
      console.log('\nSample icons:');
      iconMatches.slice(0, 3).forEach((icon, index) => {
        console.log(`Icon ${index + 1}: ${icon}`);
      });
    }
    
    // Check for theme categories in HTML
    const themeCategories = ['skull', 'brain', 'ghost', 'eye', 'scissors', 'hourglass'];
    console.log('\nChecking for specific theme names:');
    
    themeCategories.forEach(theme => {
      const matches = html.match(new RegExp(`\\b${theme}\\b`, 'gi')) || [];
      console.log(`- "${theme}": ${matches.length} matches`);
    });
    
  } catch (error) {
    console.error('Error during theme icon check:', error);
  }
}

checkThemeIcons();