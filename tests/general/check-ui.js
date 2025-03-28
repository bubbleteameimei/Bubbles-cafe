// ES module to check the UI elements using a simple HTTP request
import fetch from 'node-fetch';

async function checkUI() {
  try {
    console.log('Fetching stories page...');
    const response = await fetch('http://localhost:3001/stories');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`Received HTML (${html.length} bytes)`);
    
    // Check for the presence/absence of specific elements
    const hasSearchBox = html.includes('type="search"');
    const hasPagination = html.includes('class="pagination"');
    const hasThemeFilter = html.includes('select name="theme"');
    const hasMistEffect = html.includes('class="mist-container"');
    const hasStoryCards = html.includes('story-card-container');
    
    // Display results
    console.log('\nUI Check Results:');
    console.log(`- Search box present: ${hasSearchBox ? '✓' : '✗'}`);
    console.log(`- Pagination present: ${hasPagination ? '✓' : '✗'}`);
    console.log(`- Theme filter present: ${hasThemeFilter ? '✓' : '✗'}`);
    console.log(`- Mist effect present: ${hasMistEffect ? '✓' : '✗'}`);
    console.log(`- Story cards present: ${hasStoryCards ? '✓' : '✗'}`);
    
    // Count story cards (approximate)
    const storyCardMatches = html.match(/story-card-container/g);
    console.log(`- Number of story cards (approximate): ${storyCardMatches ? storyCardMatches.length : 0}`);
    
    console.log('\nMarch 3rd Version Compliance:');
    console.log(`- Search and filtering removed: ${(!hasSearchBox && !hasThemeFilter) ? '✓' : '✗'}`);
    console.log(`- Pagination removed: ${!hasPagination ? '✓' : '✗'}`);
    console.log(`- Mist effect present: ${hasMistEffect ? '✓' : '✗'}`);
    console.log(`- Improved story cards maintained: ${hasStoryCards ? '✓' : '✗'}`);
    
  } catch (error) {
    console.error('Error checking UI:', error);
  }
}

checkUI();