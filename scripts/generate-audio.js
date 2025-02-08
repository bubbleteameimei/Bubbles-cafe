import * as Tone from 'tone';
import { writeFile } from 'fs/promises';

async function generateAudio(type = 'ethereal') {
  try {
    // Initialize Tone.js context
    await Tone.start();
    const synth = new Tone.Synth({
      oscillator: {
        type: type === 'ethereal' ? 'sine' : 'triangle',
        modulationType: type === 'ethereal' ? 'triangle' : 'sine',
      },
      envelope: {
        attack: type === 'ethereal' ? 2 : 1,
        decay: type === 'ethereal' ? 1 : 0.5,
        sustain: type === 'ethereal' ? 0.8 : 0.6,
        release: type === 'ethereal' ? 4 : 3,
      }
    });

    const reverb = new Tone.Reverb({
      decay: 5,
      wet: 0.5
    });

    synth.connect(reverb);
    reverb.toDestination();

    // Create a sequence of notes
    const notes = type === 'ethereal' ?
      ['C4', 'E4', 'G4', 'B4'] :
      ['G2', 'Bb2', 'D3', 'F3'];

    // Generate a buffer for offline rendering
    const buffer = await Tone.Offline(({transport}) => {
      notes.forEach((note, i) => {
        synth.triggerAttackRelease(note, '4n', i);
      });
    }, 5);

    // Export buffer to file
    const fileName = type === 'ethereal' ? 'ethereal.mp3' : 'nocturnal.mp3';
    const filePath = `client/public/${fileName}`;

    // Write to file using fs.promises
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