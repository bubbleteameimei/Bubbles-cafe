/**
 * Simple static check of the theme icon implementation
 */

const fs = require('fs');
const path = require('path');

function checkThemeIcons() {
  console.log('Checking PostCard component implementation...');
  
  // Read the Post Card component implementation
  const postCardPath = path.join(__dirname, 'client/src/components/blog/post-card.tsx');
  
  try {
    const postCardContent = fs.readFileSync(postCardPath, 'utf8');
    
    // Check for necessary theme icon related code
    console.log('\nChecking for theme icon implementation:');
    
    // Check for THEME_ICONS definition
    const hasThemeIconsMap = postCardContent.includes('const THEME_ICONS');
    console.log(`- THEME_ICONS map defined: ${hasThemeIconsMap ? 'Yes ✓' : 'No ✗'}`);
    
    // Count the number of icon mappings
    const iconMappingMatches = postCardContent.match(/'[a-z-]+'\s*:\s*<[A-Za-z]+\s+className="h-\d+\s+w-\d+"/g) || [];
    console.log(`- Number of icon mappings defined: ${iconMappingMatches.length}`);
    
    // Check for proper rendering in badge
    const hasBadgeRendering = postCardContent.includes('Badge') && 
                             postCardContent.includes('THEME_ICONS[iconKey]');
    console.log(`- Badge implementation using icons: ${hasBadgeRendering ? 'Yes ✓' : 'No ✗'}`);
    
    // Check for proper icon key normalization
    const hasIconNormalization = postCardContent.includes('toLowerCase()');
    console.log(`- Case-insensitive icon lookup: ${hasIconNormalization ? 'Yes ✓' : 'No ✗'}`);
    
    // Check for fallback ghost icon
    const hasFallbackIcon = postCardContent.includes('Ghost className="h-3 w-3"');
    console.log(`- Fallback icon implementation: ${hasFallbackIcon ? 'Yes ✓' : 'No ✗'}`);
    
    // Extract some examples of icon mappings
    if (iconMappingMatches.length > 0) {
      console.log('\nSample icon mappings:');
      iconMappingMatches.slice(0, 5).forEach((match, index) => {
        console.log(`  ${index + 1}. ${match}`);
      });
    }
    
    console.log('\nFinal Assessment:');
    if (hasThemeIconsMap && hasBadgeRendering && hasIconNormalization && hasFallbackIcon) {
      console.log('✅ Theme icon system implemented correctly!');
    } else {
      console.log('❌ Theme icon system has implementation issues!');
    }
  } catch (error) {
    console.error(`Error reading post-card.tsx: ${error.message}`);
  }
}

checkThemeIcons();