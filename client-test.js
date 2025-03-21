// Simple test script to check client-side issues
import fetch from 'node-fetch';

async function testClient() {
  try {
    console.log('Fetching stories page...');
    const response = await fetch('http://localhost:3001/stories');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`Received page with ${html.length} bytes`);
    
    // Check for specific issues
    const checkVisibility = (name, className) => {
      const found = html.includes(className);
      console.log(`- ${name} present in HTML: ${found ? 'Yes' : 'No'}`);
      return found;
    };
    
    // Check for key components
    checkVisibility('Mist container', 'mist-container');
    checkVisibility('Mist component', '<motion.div');
    checkVisibility('Story cards', 'story-card-container');
    checkVisibility('WordPress query', 'useInfiniteQuery');
    
    // Check for story loading code
    if (html.includes('Loading stories...')) {
      console.log('- Story loading state is present');
    }
    
    // Check for error states
    if (html.includes('Unable to load stories')) {
      console.log('- Error state is present, stories might not be loading correctly');
    }
    
    // Look for React Query related code
    if (html.includes('QueryClientProvider')) {
      console.log('- React Query provider is present');
    }
    
    // Check for any error messages in the HTML
    const errorPattern = /error|exception|failed|not found/i;
    const errorMatch = html.match(new RegExp(`Error: (.*?)['"\n]`, 'i'));
    if (errorMatch) {
      console.log(`- Found error message: ${errorMatch[1]}`);
    }
  } catch (error) {
    console.error('Error testing client:', error);
  }
}

testClient();