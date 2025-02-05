const { Tone } = require('tone');
const fs = require('fs');

// Create a simple whispering wind sound effect
const synth = new Tone.Synth().toDestination();
const now = Tone.now();

// Generate a soft, wind-like sound
synth.triggerAttackRelease('C4', '8n', now);
synth.triggerAttackRelease('E4', '8n', now + 0.5);

// Save the audio to a file
Tone.Offline(() => {
  synth.triggerAttackRelease('C4', '8n', 0);
  synth.triggerAttackRelease('E4', '8n', 0.5);
}, 2).then((buffer) => {
  const audioBlob = new Blob([buffer.toArray()], { type: 'audio/mp3' });
  fs.writeFileSync('client/public/whispering_wind.mp3', Buffer.from(audioBlob));
});
