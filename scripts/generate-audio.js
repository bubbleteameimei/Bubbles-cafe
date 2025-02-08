import { createReadStream, createWriteStream } from 'fs';
import { Synth, now, Offline } from 'tone';

// Create a simple whispering wind sound effect using Web Audio API
async function generateWhisperingWind() {
  try {
    // Create an offline context for audio generation
    const buffer = await Offline(() => {
      // Create a more complex synth for a realistic wind effect
      const synth = new Synth({
        oscillator: {
          type: 'sine',
          modulationType: 'triangle',
          modulationIndex: 3,
          harmonicity: 1.5,
        },
        envelope: {
          attack: 0.5,
          decay: 1,
          sustain: 0.8,
          release: 2,
        },
        volume: -20,
      }).toDestination();

      // Generate a more natural wind-like sound with multiple notes
      const currentTime = now();
      synth.triggerAttackRelease('C2', '2n', currentTime);
      synth.triggerAttackRelease('D2', '4n', currentTime + 0.5);
      synth.triggerAttackRelease('E2', '8n', currentTime + 1);
      synth.triggerAttackRelease('G2', '4n', currentTime + 1.5);
    }, 4); // Increased duration to 4 seconds for a longer effect

    // Create directory if it doesn't exist
    const audioStream = createWriteStream('client/public/whispering_wind.mp3', { flags: 'w' });
    const bufferStream = createReadStream(buffer.toArray());

    return new Promise((resolve, reject) => {
      bufferStream.pipe(audioStream)
        .on('finish', () => {
          console.log('Audio file generated successfully');
          resolve();
        })
        .on('error', (error) => {
          console.error('Error writing audio file:', error);
          reject(error);
        });
    });
  } catch (error) {
    console.error('Error generating audio:', error);
    throw error;
  }
}

// Execute and handle errors properly
generateWhisperingWind().catch(console.error);