import * as Tone from 'tone';
import { writeFile } from 'fs/promises';

async function generateAudio(type = 'ethereal') {
  try {
    // Create a new audio context
    const context = new Tone.Context();
    Tone.setContext(context);

    // Create a new offline context for rendering
    const buffer = await Tone.Offline(async ({ transport }) => {
      // Create synth after context is initialized
      const synth = new Tone.PolySynth({
        oscillator: {
          type: type === 'ethereal' ? 'sine' : 'sawtooth'
        },
        envelope: {
          attack: type === 'ethereal' ? 2 : 0.5,
          decay: type === 'ethereal' ? 1 : 0.8,
          sustain: type === 'ethereal' ? 0.8 : 0.6,
          release: type === 'ethereal' ? 4 : 2
        }
      }).toDestination();

      // Add reverb effect
      const reverb = new Tone.Reverb({
        decay: type === 'ethereal' ? 5 : 3,
        wet: type === 'ethereal' ? 0.5 : 0.3
      }).toDestination();

      synth.connect(reverb);

      // Schedule notes with different patterns based on type
      const notes = type === 'ethereal' 
        ? ['C4', 'E4', 'G4', 'B4']
        : ['A2', 'C3', 'E3', 'G3'];

      const duration = type === 'ethereal' ? '4n' : '2n';

      notes.forEach((note, i) => {
        synth.triggerAttackRelease(note, duration, i);
      });

      // Let the reverb tail complete
      transport.schedule(() => {
        synth.dispose();
        reverb.dispose();
      }, notes.length + 2);
    }, 10);

    // Write buffer to file with specific settings for better quality
    const fileName = type === 'ethereal' ? 'ethereal.mp3' : 'nocturnal.mp3';
    const filePath = `client/public/${fileName}`;
    await writeFile(filePath, Buffer.from(buffer.get()));
    console.log(`Generated ${fileName} successfully`);
  } catch (error) {
    console.error(`Error generating ${type} audio:`, error);
    throw error;
  }
}

// Generate both audio files
Promise.all([
  generateAudio('ethereal'),
  generateAudio('nocturnal')
]).then(() => {
  console.log('All audio files generated successfully');
}).catch(console.error);