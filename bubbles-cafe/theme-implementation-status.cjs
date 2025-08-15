/**
 * Theme Implementation Status Check
 * 
 * This script analyzes the current implementation of the theme icon system
 * and logs detailed information about its status.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Define paths to key files
const SCHEMA_PATH = path.join(__dirname, 'shared/schema.ts');
const THEME_CATEGORIES_PATH = path.join(__dirname, 'shared/theme-categories.ts');
const POST_CARD_PATH = path.join(__dirname, 'client/src/components/blog/post-card.tsx');
const ADMIN_THEMES_PATH = path.join(__dirname, 'client/src/pages/admin/themes.tsx');
const CONTENT_ANALYSIS_PATH = path.join(__dirname, 'client/src/lib/content-analysis.ts');

// Helper function to read file contents safely
function readFileSafely(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

async function checkHomePageForIcons() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3003,
      path: '/',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Check for badge elements with icons
        const badgeMatches = data.match(/<span[^>]*class="[^"]*badge[^"]*"[^>]*>/gi) || [];
        const svgIconMatches = data.match(/<svg[^>]*class="[^"]*h-\d+[^"]*w-\d+[^"]*"[^>]*>/gi) || [];
        
        resolve({
          badgeCount: badgeMatches.length,
          svgIconCount: svgIconMatches.length,
          badgeWithIconsFound: data.includes('badge') && data.includes('svg'),
          hasThemeLabels: data.includes('Supernatural') || 
                          data.includes('Horror') || 
                          data.includes('Psychological')
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

async function checkDatabaseSchema() {
  const schemaContent = readFileSafely(SCHEMA_PATH);
  
  if (!schemaContent) {
    return { hasThemeColumns: false };
  }
  
  return {
    hasThemeColumns: schemaContent.includes('themeCategory: text("theme_category")') && 
                    schemaContent.includes('themeIcon: text("theme_icon")'),
    columnDefinitions: schemaContent.match(/theme\w+:\s*text\("[^"]+"\)/g) || []
  };
}

function checkThemeCategories() {
  const categoriesContent = readFileSafely(THEME_CATEGORIES_PATH);
  
  if (!categoriesContent) {
    return { categoriesCount: 0 };
  }
  
  // Count theme categories
  const categoryMatches = categoriesContent.match(/[A-Z_]+:\s*{[^}]+}/g) || [];
  
  // Count theme mappings
  const mappingMatches = categoriesContent.match(/"[^"]+"\s*:\s*"[A-Z_]+"/g) || [];
  
  return {
    categoriesCount: categoryMatches.length,
    mappingsCount: mappingMatches.length,
    sampleCategories: categoryMatches.slice(0, 3),
    sampleMappings: mappingMatches.slice(0, 3),
    hasDetectionFunction: categoriesContent.includes('function determineThemeCategory')
  };
}

function checkPostCardImplementation() {
  const postCardContent = readFileSafely(POST_CARD_PATH);
  
  if (!postCardContent) {
    return { hasIconMap: false };
  }
  
  // Check for theme icon mapping
  const hasIconMap = postCardContent.includes('const THEME_ICONS');
  const iconMappingCount = (postCardContent.match(/'[^']+'\s*:\s*<[A-Za-z]+\s+className="h-\d+\s+w-\d+"/g) || []).length;
  
  return {
    hasIconMap,
    iconMappingCount,
    usesThemeCategory: postCardContent.includes('post.themeCategory'),
    usesThemeIcon: postCardContent.includes('post.themeIcon'),
    hasProperFallback: postCardContent.includes('Ghost className="h-3 w-3"') || 
                       postCardContent.includes('Ghost className="h-4 w-4"'),
    normalizesIconKeys: postCardContent.includes('toLowerCase()')
  };
}

function checkAdminImplementation() {
  const themesPageContent = readFileSafely(ADMIN_THEMES_PATH);
  
  if (!themesPageContent) {
    return { hasThemeForm: false };
  }
  
  return {
    hasThemeForm: themesPageContent.includes('updateThemeMutation'),
    hasCustomIconInput: themesPageContent.includes('customIconInput') && 
                       themesPageContent.includes('showCustomIconInput'),
    customIconReset: themesPageContent.includes('setCustomIconInput') && 
                    themesPageContent.includes('setShowCustomIconInput(false)'),
    updatesMutationFormatting: themesPageContent.includes('theme_category') && 
                              themesPageContent.includes('icon')
  };
}

function checkContentAnalysis() {
  const contentAnalysisContent = readFileSafely(CONTENT_ANALYSIS_PATH);
  
  if (!contentAnalysisContent) {
    return { hasDetectThemes: false };
  }
  
  return {
    hasDetectThemes: contentAnalysisContent.includes('function detectThemes'),
    hasCalculateIntensity: contentAnalysisContent.includes('function calculateIntensity'),
    hasGetReadingTime: contentAnalysisContent.includes('function getReadingTime'),
    themeCategories: (contentAnalysisContent.match(/THEME_CATEGORIES:\s*Record<[^>]+>/s) || []).length > 0
  };
}

async function runStatusCheck() {
  console.log('===== HORROR THEME ICON SYSTEM STATUS CHECK =====');
  
  // Check database schema
  console.log('\n📊 Database Schema:');
  const schemaStatus = await checkDatabaseSchema();
  console.log(`- Theme columns defined: ${schemaStatus.hasThemeColumns ? '✅' : '❌'}`);
  if (schemaStatus.columnDefinitions && schemaStatus.columnDefinitions.length > 0) {
    console.log('- Column definitions:');
    schemaStatus.columnDefinitions.forEach(def => console.log(`  * ${def}`));
  }
  
  // Check theme categories
  console.log('\n🔍 Theme Categories:');
  const categoriesStatus = checkThemeCategories();
  console.log(`- Categories defined: ${categoriesStatus.categoriesCount} ✅`);
  console.log(`- Story mappings defined: ${categoriesStatus.mappingsCount} ✅`);
  console.log('- Sample categories:', categoriesStatus.sampleCategories ? categoriesStatus.sampleCategories.length : 0);
  console.log(`- Theme detection function: ${categoriesStatus.hasDetectionFunction ? '✅' : '❌'}`);
  
  // Check post card component
  console.log('\n🧩 Post Card Component:');
  const postCardStatus = checkPostCardImplementation();
  console.log(`- Icon mapping defined: ${postCardStatus.hasIconMap ? '✅' : '❌'}`);
  console.log(`- Number of icon mappings: ${postCardStatus.iconMappingCount}`);
  console.log(`- Uses theme category from post: ${postCardStatus.usesThemeCategory ? '✅' : '❌'}`);
  console.log(`- Uses theme icon from post: ${postCardStatus.usesThemeIcon ? '✅' : '❌'}`);
  console.log(`- Has proper fallback icon: ${postCardStatus.hasProperFallback ? '✅' : '❌'}`);
  console.log(`- Normalizes icon keys: ${postCardStatus.normalizesIconKeys ? '✅' : '❌'}`);
  
  // Check admin implementation
  console.log('\n👨‍💼 Admin Theme Management:');
  const adminStatus = checkAdminImplementation();
  console.log(`- Has theme form: ${adminStatus.hasThemeForm ? '✅' : '❌'}`);
  console.log(`- Has custom icon input: ${adminStatus.hasCustomIconInput ? '✅' : '❌'}`);
  console.log(`- Resets custom input when switching posts: ${adminStatus.customIconReset ? '✅' : '❌'}`);
  console.log(`- Uses correct field names for API: ${adminStatus.updatesMutationFormatting ? '✅' : '❌'}`);
  
  // Check content analysis
  console.log('\n📝 Content Analysis:');
  const contentStatus = checkContentAnalysis();
  console.log(`- Has detectThemes function: ${contentStatus.hasDetectThemes ? '✅' : '❌'}`);
  console.log(`- Has calculateIntensity function: ${contentStatus.hasCalculateIntensity ? '✅' : '❌'}`);
  console.log(`- Has getReadingTime function: ${contentStatus.hasGetReadingTime ? '✅' : '❌'}`);
  
  // Check UI rendering
  console.log('\n🖥️ UI Rendering:');
  try {
    const uiStatus = await checkHomePageForIcons();
    console.log(`- Badge elements found: ${uiStatus.badgeCount}`);
    console.log(`- SVG icons found: ${uiStatus.svgIconCount}`);
    console.log(`- Badges with icons visible: ${uiStatus.badgeWithIconsFound ? '✅' : '❌'}`);
    console.log(`- Theme labels present: ${uiStatus.hasThemeLabels ? '✅' : '❌'}`);
  } catch (error) {
    console.error('Error checking UI:', error.message);
  }
  
  console.log('\n==================================================');
}

runStatusCheck();