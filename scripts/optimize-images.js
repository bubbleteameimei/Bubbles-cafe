#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Starting image optimization...');

const publicDir = path.join(__dirname, '../public');
const imagesToOptimize = [
  'profile.png',
  'vanessa-profile.png',
  'profile-new.png',
  'new-profile.png'
];

async function optimizeImages() {
  try {
    // Check if sharp is available
    let sharp;
    try {
      sharp = (await import('sharp')).default;
    } catch (error) {
      console.log('📦 Installing sharp for image optimization...');
      execSync('npm install sharp', { stdio: 'inherit' });
      sharp = (await import('sharp')).default;
    }

    for (const imageName of imagesToOptimize) {
      const imagePath = path.join(publicDir, imageName);
      
      if (!fs.existsSync(imagePath)) {
        console.log(`⚠️  Image not found: ${imageName}`);
        continue;
      }

      const stats = fs.statSync(imagePath);
      const originalSize = (stats.size / 1024 / 1024).toFixed(2);
      
      console.log(`🖼️  Optimizing ${imageName} (${originalSize}MB)...`);

      try {
        // Create optimized version
        await sharp(imagePath)
          .resize(400, 400, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .png({ 
            quality: 80,
            compressionLevel: 9 
          })
          .toFile(path.join(publicDir, `optimized-${imageName}`));

        // Create WebP version for better compression
        await sharp(imagePath)
          .resize(400, 400, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .webp({ 
            quality: 80 
          })
          .toFile(path.join(publicDir, `${imageName.replace('.png', '.webp')}`));

        const optimizedStats = fs.statSync(path.join(publicDir, `optimized-${imageName}`));
        const optimizedSize = (optimizedStats.size / 1024 / 1024).toFixed(2);
        
        console.log(`✅ Optimized ${imageName}: ${originalSize}MB → ${optimizedSize}MB (${((1 - optimizedStats.size / stats.size) * 100).toFixed(1)}% reduction)`);

      } catch (error) {
        console.error(`❌ Failed to optimize ${imageName}:`, error.message);
      }
    }

    console.log('🎉 Image optimization completed!');
    console.log('💡 Consider replacing original images with optimized versions in your components.');

  } catch (error) {
    console.error('❌ Image optimization failed:', error);
  }
}

optimizeImages();