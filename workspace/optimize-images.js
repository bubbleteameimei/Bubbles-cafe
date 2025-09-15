/**
 * Simple script to optimize large images - removes duplicates and keeps original in one location
 */

import fs from 'fs';
import path from 'path';

// Define source of duplicate images
const duplicateImages = [
  './client/public/assets/IMG_4918.jpeg',
  './client/public/attached_assets/IMG_4918.jpeg', 
  './client/public/IMG_4918.jpeg',
  './client/public/img/IMG_4918.jpeg'
];

// Function to handle image optimization
async function optimizeImages() {
  // Create optimized-assets directory
  const optimizedDir = './client/public/optimized-assets';
  if (!fs.existsSync(optimizedDir)) {
    fs.mkdirSync(optimizedDir, { recursive: true });
  }

  // Keep only one copy of the image
  try {
    // Keep the image in attached_assets
    const mainImagePath = './client/public/attached_assets/IMG_4918.jpeg';
    
    // Remove other copies
    for (const imagePath of duplicateImages) {
      if (imagePath !== mainImagePath && fs.existsSync(imagePath)) {
        console.log(`Removing duplicate: ${imagePath}`);
        fs.unlinkSync(imagePath);
      }
    }
    
    console.log('Image optimization complete!');
  } catch (error) {
    console.error('Error optimizing images:', error);
  }
}

// Run the optimization
optimizeImages();