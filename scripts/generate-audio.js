import * as Tone from 'tone';
import { writeFile } from 'fs/promises';

async function generateAudio(type = 'ethereal') {
  try {
    // Create a new audio context
    const context = new Tone.Context();
    Tone.setContext(context);

    // Create a new offline context for rendering
    const buffer = await Tone.Offline(async ({ transport }) => {
      // Create synth based on type
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

      // Schedule notes based on type
      const notes = type === 'ethereal' 
        ? ['C4', 'E4', 'G4', 'B4']  // Ethereal chord
        : type === 'heartbeat' 
          ? ['C2']  // Low pulse
          : type === 'whispers'
            ? ['E5', 'G5', 'B5']  // High cluster
            : ['A2', 'C3'];  // Chase rhythm

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

    // Write buffer to file
    const fileName = `${type}.mp3`;
    const filePath = `client/public/${fileName}`;
    await writeFile(filePath, Buffer.from(buffer.get()));
    console.log(`Generated ${fileName} successfully`);
  } catch (error) {
    console.error(`Error generating ${type} audio:`, error);
    throw error;
  }
}

// Generate all required audio files
Promise.all([
  generateAudio('ethereal'),
  generateAudio('heartbeat'),
  generateAudio('whispers'),
  generateAudio('chase')
]).then(() => {
  console.log('All audio files generated successfully');
}).catch(console.error);