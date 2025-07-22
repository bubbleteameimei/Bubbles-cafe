/**
 * Simple script to optimize audio files - removes duplicates and keeps original in one location
 */

import fs from 'fs';
import path from 'path';

// Define source of duplicate audio files
const duplicateAudio = [
  './client/public/assets/ambient.mp3',
  './server/public/audio/ambient.mp3',
  './dist/public/assets/ambient.mp3'
];

// Function to handle audio optimization
async function optimizeAudio() {
  try {
    // Keep the audio file in server/public/audio
    const mainAudioPath = './server/public/audio/ambient.mp3';
    
    // Remove other copies
    for (const audioPath of duplicateAudio) {
      if (audioPath !== mainAudioPath && fs.existsSync(audioPath)) {
        console.log(`Removing duplicate audio: ${audioPath}`);
        fs.unlinkSync(audioPath);
      }
    }
    
    console.log('Audio optimization complete!');
  } catch (error) {
    console.error('Error optimizing audio:', error);
  }
}

// Run the optimization
optimizeAudio();