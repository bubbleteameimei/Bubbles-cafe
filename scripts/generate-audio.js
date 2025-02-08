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
      const synth = new Tone.Synth({
        oscillator: {
          type: type === 'ethereal' ? 'sine' : 'triangle'
        },
        envelope: {
          attack: type === 'ethereal' ? 2 : 1,
          decay: type === 'ethereal' ? 1 : 0.5,
          sustain: type === 'ethereal' ? 0.8 : 0.6,
          release: type === 'ethereal' ? 4 : 3
        }
      }).toDestination();

      // Add reverb effect
      const reverb = new Tone.Reverb({
        decay: 5,
        wet: 0.5
      }).toDestination();

      synth.connect(reverb);

      // Schedule notes
      const notes = type === 'ethereal' 
        ? ['C4', 'E4', 'G4', 'B4']
        : ['G2', 'Bb2', 'D3', 'F3'];

      notes.forEach((note, i) => {
        synth.triggerAttackRelease(note, '4n', i);
      });

      // Let the reverb tail complete
      transport.schedule(() => {
        synth.dispose();
        reverb.dispose();
      }, notes.length + 2);
    }, 10);

    // Write buffer to file
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