/**
 * Image Optimization Script
 * 
 * This script optimizes all images in the public directory before deployment,
 * converting them to WebP format and creating different sizes for responsive loading.
 * 
 * Usage:
 * node scripts/optimize-images.js
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuration
const SOURCE_DIR = 'public/images';
const OUTPUT_DIR = 'public/images/optimized';
const SIZES = [320, 640, 960, 1280, 1920]; // Responsive image sizes
const QUALITY = 80; // WebP quality (0-100)

/**
 * Execute a command and return stdout/stderr
 */
async function execute(command) {
  try {
    const { stdout, stderr } = await execPromise(command);
    return { stdout, stderr };
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.stderr || error.message);
    throw error;
  }
}

/**
 * Check if Sharp is installed, and install it if not
 */
async function ensureSharpInstalled() {
  try {
    await execute('npm list sharp');
    console.log('✅ Sharp is already installed.');
  } catch (error) {
    console.log('Installing Sharp image processing library...');
    await execute('npm install sharp');
    console.log('✅ Sharp installed successfully.');
  }
}

/**
 * Get all image files recursively from a directory
 */
async function getImageFiles(dir) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];
  const files = await fs.readdir(dir, { withFileTypes: true });
  
  let imageFiles = [];
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      const nestedImages = await getImageFiles(fullPath);
      imageFiles = [...imageFiles, ...nestedImages];
    } else {
      const ext = path.extname(file.name).toLowerCase();
      if (imageExtensions.includes(ext) && !file.name.includes('.webp')) {
        imageFiles.push(fullPath);
      }
    }
  }
  
  return imageFiles;
}

/**
 * Create output directory structure
 */
async function createOutputDirs(files) {
  // Create main output directory
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
  
  // Create subdirectories for each unique source directory
  const directories = new Set();
  files.forEach(file => {
    const relativePath = path.relative(SOURCE_DIR, path.dirname(file));
    if (relativePath) {
      directories.add(path.join(OUTPUT_DIR, relativePath));
    }
  });
  
  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }
}

/**
 * Optimize an individual image
 */
async function optimizeImage(filePath) {
  try {
    // Get path information
    const relativePath = path.relative(SOURCE_DIR, filePath);
    const fileDir = path.dirname(relativePath);
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Skip already optimized images
    if (fileName.match(/-\d+w$/)) {
      return null;
    }
    
    // Create output path
    const outputPath = path.join(OUTPUT_DIR, fileDir);
    
    // Dynamically import sharp
    const sharp = require('sharp');
    
    // Get image metadata
    const metadata = await sharp(filePath).metadata();
    
    // Convert SVGs differently - just copy them
    if (metadata.format === 'svg') {
      await fs.copyFile(filePath, path.join(outputPath, `${fileName}.svg`));
      return {
        original: filePath,
        optimized: [path.join(outputPath, `${fileName}.svg`)],
        type: 'svg'
      };
    }
    
    // For raster images, generate multiple sizes in WebP format
    const optimizedFiles = [];
    
    for (const size of SIZES) {
      // Skip sizes larger than the original
      if (size > metadata.width) {
        continue;
      }
      
      const outputFilePath = path.join(outputPath, `${fileName}-${size}w.webp`);
      
      await sharp(filePath)
        .resize({ width: size, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(outputFilePath);
      
      optimizedFiles.push(outputFilePath);
    }
    
    // Also create a full-size WebP version
    const fullSizeWebP = path.join(outputPath, `${fileName}.webp`);
    await sharp(filePath)
      .webp({ quality: QUALITY })
      .toFile(fullSizeWebP);
    
    optimizedFiles.push(fullSizeWebP);
    
    return {
      original: filePath,
      optimized: optimizedFiles,
      type: 'raster'
    };
  } catch (error) {
    console.error(`Error optimizing ${filePath}:`, error);
    return null;
  }
}

/**
 * Generate HTML example for responsive loading
 */
function generateResponsiveImageExample(result) {
  if (!result || result.type !== 'raster' || !result.optimized.length) {
    return null;
  }
  
  const baseFilename = path.basename(result.original);
  const variants = result.optimized
    .filter(file => file.includes('-'))
    .sort((a, b) => {
      const sizeA = parseInt(path.basename(a).match(/-(\d+)w/)[1]);
      const sizeB = parseInt(path.basename(b).match(/-(\d+)w/)[1]);
      return sizeA - sizeB;
    });
  
  if (!variants.length) {
    return null;
  }
  
  const srcSetItems = variants.map(file => {
    const size = path.basename(file).match(/-(\d+)w/)[1];
    const relativePath = path.relative('public', file);
    return `/${relativePath} ${size}w`;
  });
  
  const fallbackSrc = path.relative('public', result.optimized.find(file => !file.includes('-w')));
  
  return `
<!-- Responsive image example for ${baseFilename} -->
<img
  src="/${fallbackSrc}"
  srcset="${srcSetItems.join(', ')}"
  sizes="(max-width: 640px) 320px, (max-width: 960px) 640px, 960px"
  loading="lazy"
  alt="Description of image"
/>`;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🔍 Starting image optimization...');
    
    // Check if Sharp is installed
    await ensureSharpInstalled();
    
    // Check if source directory exists
    try {
      await fs.access(SOURCE_DIR);
    } catch (error) {
      console.error(`❌ Source directory ${SOURCE_DIR} does not exist!`);
      console.log('Creating an example source directory...');
      await fs.mkdir(SOURCE_DIR, { recursive: true });
      console.log(`✅ Created ${SOURCE_DIR}. Please add your images there and run this script again.`);
      return;
    }
    
    // Get all image files
    console.log(`🔍 Scanning ${SOURCE_DIR} for images...`);
    const imageFiles = await getImageFiles(SOURCE_DIR);
    
    if (imageFiles.length === 0) {
      console.log('❌ No images found to optimize!');
      return;
    }
    
    console.log(`🖼️ Found ${imageFiles.length} images to optimize.`);
    
    // Create output directories
    await createOutputDirs(imageFiles);
    
    // Optimize images
    console.log('🔄 Optimizing images...');
    const results = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const filePath = imageFiles[i];
      console.log(`⏳ Optimizing (${i+1}/${imageFiles.length}): ${path.basename(filePath)}`);
      const result = await optimizeImage(filePath);
      if (result) {
        results.push(result);
      }
    }
    
    // Generate examples
    const examples = results
      .map(generateResponsiveImageExample)
      .filter(Boolean);
    
    if (examples.length > 0) {
      await fs.writeFile(
        'responsive-image-examples.html',
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Image Examples</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    pre { background: #f4f4f4; padding: 15px; overflow-x: auto; border-radius: 4px; }
    .example { margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
    h3 { font-size: 1.2rem; }
  </style>
</head>
<body>
  <h1>Responsive Image Examples</h1>
  <p>Copy and paste these examples into your code to use responsive images.</p>
  ${examples.map((example, i) => `
  <div class="example">
    <h3>Example ${i+1}</h3>
    <pre>${example.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  </div>
  `).join('')}
</body>
</html>`,
        'utf8'
      );
      
      console.log('📄 Generated responsive-image-examples.html with usage examples');
    }
    
    // Print results
    const totalOriginalSize = results.reduce((sum, result) => {
      if (!result) return sum;
      
      try {
        const stats = fs.statSync(result.original);
        return sum + stats.size;
      } catch (error) {
        return sum;
      }
    }, 0);
    
    const totalOptimizedSize = results.reduce((sum, result) => {
      if (!result) return sum;
      
      return sum + result.optimized.reduce((fileSum, file) => {
        try {
          const stats = fs.statSync(file);
          return fileSum + stats.size;
        } catch (error) {
          return fileSum;
        }
      }, 0);
    }, 0);
    
    console.log('✅ Image optimization complete!');
    console.log(`📊 Optimized ${results.length} images`);
    console.log(`📊 Original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📊 Optimized size: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📊 Savings: ${((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(2)}%`);
    console.log(`📁 Optimized images saved to: ${OUTPUT_DIR}`);
    
  } catch (error) {
    console.error('❌ Error optimizing images:', error);
    process.exit(1);
  }
}

main();