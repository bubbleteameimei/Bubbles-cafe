/**
 * Site Image Optimization Script
 * 
 * This script scans the public/images directory and creates optimized versions
 * of each image at different resolutions for responsive loading, organizing them
 * into an 'optimized' subdirectory.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories
const SOURCE_DIR = path.join(process.cwd(), 'public', 'images');
const OPTIMIZE_DIR = path.join(SOURCE_DIR, 'optimized');

// Target widths for responsive images
const TARGET_WIDTHS = [400, 800, 1200, 1600];

// Image extensions to process
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Check and create optimized directory if it doesn't exist
function ensureDirectories() {
  console.log('Checking directories...');
  
  if (!fs.existsSync(SOURCE_DIR)) {
    console.log(`Creating source directory: ${SOURCE_DIR}`);
    fs.mkdirSync(SOURCE_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(OPTIMIZE_DIR)) {
    console.log(`Creating optimize directory: ${OPTIMIZE_DIR}`);
    fs.mkdirSync(OPTIMIZE_DIR, { recursive: true });
  }
}

// Get all images in the source directory
function getImageFiles() {
  console.log('Scanning for image files...');
  const files = [];
  
  try {
    const entries = fs.readdirSync(SOURCE_DIR, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip the optimized directory
      if (entry.name === 'optimized' || entry.isDirectory()) continue;
      
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        files.push(entry.name);
      }
    }
  } catch (error) {
    console.error('Error scanning image directory:', error);
  }
  
  console.log(`Found ${files.length} images to process`);
  return files;
}

// Process a single image
function processImage(filename) {
  const sourcePath = path.join(SOURCE_DIR, filename);
  const filenameWithoutExt = path.basename(filename, path.extname(filename));
  const extension = path.extname(filename).toLowerCase();
  
  console.log(`\nProcessing: ${filename}`);
  
  // Check if file exists
  if (!fs.existsSync(sourcePath)) {
    console.error(`File not found: ${sourcePath}`);
    return;
  }
  
  // Create each target size
  for (const width of TARGET_WIDTHS) {
    const targetFilename = `${filenameWithoutExt}-${width}${extension}`;
    const targetPath = path.join(OPTIMIZE_DIR, targetFilename);
    
    // Skip if target file already exists
    if (fs.existsSync(targetPath)) {
      console.log(`  - ${targetFilename} already exists, skipping...`);
      continue;
    }
    
    console.log(`  - Generating ${width}px version...`);
    
    try {
      if (extension === '.webp') {
        // For WebP, use different settings
        execSync(`convert "${sourcePath}" -resize ${width}x -quality 85 "${targetPath}"`);
      } else {
        // For JPEG/PNG, optimize more aggressively
        execSync(`convert "${sourcePath}" -resize ${width}x -quality 80 -strip "${targetPath}"`);
      }
      
      console.log(`    ✓ Created: ${targetFilename}`);
    } catch (error) {
      console.error(`    ✗ Error creating ${targetFilename}:`, error.message);
    }
  }
}

// Process all images
function optimizeAllImages() {
  ensureDirectories();
  const files = getImageFiles();
  
  if (files.length === 0) {
    console.log('No images found to optimize.');
    return;
  }
  
  console.log('\nStarting image optimization...');
  
  for (const file of files) {
    processImage(file);
  }
  
  console.log('\nImage optimization complete!');
  console.log(`Optimized images are available in: ${OPTIMIZE_DIR}`);
}

// Check for ImageMagick
function checkImageMagick() {
  try {
    execSync('convert -version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    console.error('Error: ImageMagick is not installed or not in the PATH');
    console.error('Please install ImageMagick to use this script:');
    console.error('  On Ubuntu/Debian: sudo apt-get install imagemagick');
    console.error('  On macOS with Homebrew: brew install imagemagick');
    console.error('  On Windows: Download from https://imagemagick.org/script/download.php');
    return false;
  }
}

// Main execution
if (checkImageMagick()) {
  optimizeAllImages();
} else {
  process.exit(1);
}