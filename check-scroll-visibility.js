import { get } from 'http';

get('http://localhost:3002', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response received, checking for scroll button...');
    
    // Try to find evidence of the scroll button in the HTML
    const hasScrollImport = data.includes('import ScrollToTopButton');
    const hasScrollComponent = data.includes('<ScrollToTopButton');
    const hasFixedElements = data.includes('fixed z-50');
    const hasButtonRight = data.includes('bottom-right');
    const hasMotionDiv = data.includes('<motion.div');
    
    console.log('ScrollToTopButton import found:', hasScrollImport);
    console.log('ScrollToTopButton component found:', hasScrollComponent);
    console.log('Fixed z-index elements found:', hasFixedElements);
    console.log('Bottom-right positioning found:', hasButtonRight);
    console.log('Motion.div elements found:', hasMotionDiv);
    
    // Output indication of success or failure
    if (hasScrollComponent || (hasFixedElements && hasButtonRight)) {
      console.log('✅ Evidence suggests scroll button is present in the DOM');
    } else {
      console.log('❌ Could not find strong evidence of scroll button in the DOM');
    }
  });
}).on('error', (err) => {
  console.error('Error fetching page:', err.message);
});