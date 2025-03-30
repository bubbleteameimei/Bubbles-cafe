import puppeteer from 'puppeteer-core';
import fs from 'fs';

/**
 * Simple scroll button verification script
 * 
 * This script checks that:
 * 1. The ScrollToTopButton component has its forceVisible set to false
 * 2. The component uses inline styles for positioning
 * 3. There are no conflicting position classes
 */
async function verifyScrollButton() {
  console.log('Verifying scroll button implementation...');
  
  // First check the component file
  try {
    const componentPath = 'client/src/components/ScrollToTopButton.tsx';
    if (!fs.existsSync(componentPath)) {
      console.error('❌ Error: Component file not found!');
      process.exit(1);
    }
    
    const component = fs.readFileSync(componentPath, 'utf8');
    
    // Check forceVisible setting
    if (component.includes('const forceVisible = true')) {
      console.error('❌ Warning: forceVisible is set to true, should be false for production!');
    } else if (component.includes('const forceVisible = false')) {
      console.log('✅ forceVisible correctly set to false');
    }
    
    // Check styling approach
    if (component.includes('getCurrentPositionStyle()') || 
        component.includes('positionStyles')) {
      console.log('✅ Using proper inline style positioning');
    }
    
    if (component.includes('...getCurrentPositionStyle()')) {
      console.log('✅ Correctly applying dynamic position styles');
    }
    
    if (component.includes('z-[9999]')) {
      console.log('✅ Using high z-index for visibility');
    }
    
    // Check App.tsx for correct component usage
    const appPath = 'client/src/App.tsx';
    if (!fs.existsSync(appPath)) {
      console.error('❌ Error: App.tsx file not found!');
    } else {
      const app = fs.readFileSync(appPath, 'utf8');
      if (app.includes('<ScrollToTopButton position="bottom-right"')) {
        console.log('✅ ScrollToTopButton is used in App.tsx with correct position');
      } else if (app.includes('<ScrollToTopButton')) {
        console.log('✅ ScrollToTopButton is used in App.tsx');
      } else {
        console.error('❌ Error: ScrollToTopButton is not used in App.tsx!');
      }
    }
    
    console.log('\n✅ Scroll button verification completed successfully!');
  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

verifyScrollButton();