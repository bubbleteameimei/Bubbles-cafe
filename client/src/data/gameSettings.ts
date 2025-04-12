/**
 * Eden's Hollow Game Settings
 * 
 * Default game settings and game story data
 */

import { GameSettings, Story } from '../types/game';

// Default game settings
export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  textSpeed: 'normal',
  showGore: true,
};

// Simple demo story for Eden's Hollow
export const DEMO_STORY: Story = {
  id: 'edens-hollow-demo',
  title: "Eden's Hollow",
  author: "Catherine Morgan",
  startPassageId: 'start',
  passages: {
    'start': {
      id: 'start',
      text: "You awaken in a dimly lit room. The faint smell of decay and dampness fills your nostrils as you try to make sense of your surroundings. \"Where am I?\" you whisper, but no one answers. The last thing you remember is driving down a deserted road, lost in a storm. There's a door ahead of you, and a window to your right. Both might offer a way out, but something tells you to be cautious.",
      choices: [
        {
          id: 'examine-door',
          text: 'Examine the door',
          nextPassageId: 'door',
          sanityChange: 0,
        },
        {
          id: 'look-window',
          text: 'Look out the window',
          nextPassageId: 'window',
          sanityChange: 0,
        }
      ],
      phase: 'intro',
    },
    'door': {
      id: 'door',
      text: "You approach the door cautiously. The worn wood feels cold to the touch. As your fingers wrap around the tarnished brass handle, you notice it's unlocked. Turning it slowly, the hinges creak as the door swings open, revealing a long, darkened hallway. The wallpaper is peeling, and several doors line each side. In the distance, you hear something. It might be footsteps, or perhaps just the old house settling. Either way, you need to decide which way to go.",
      choices: [
        {
          id: 'walk-hallway',
          text: 'Walk down the hallway',
          nextPassageId: 'ending',
          sanityChange: -5,
          critical: true,
        },
        {
          id: 'stay-room',
          text: 'Stay in the room',
          nextPassageId: 'ending',
          sanityChange: 0,
        }
      ],
      phase: 'exploration',
    },
    'window': {
      id: 'window',
      text: "You step toward the window, pushing aside the tattered curtains. Outside, an unnaturally dense fog shrouds everything beyond a few feet of the house. In the distance, you can make out the faint silhouettes of trees, and perhaps buildings. This must be Eden's Hollow, the town you were trying to reach before the storm. As you press your face closer to the glass, trying to see more clearly, you notice something odd. A figure, standing perfectly still in the mist, appears to be looking directly at you.",
      choices: [
        {
          id: 'open-window',
          text: 'Open the window',
          nextPassageId: 'ending',
          sanityChange: -10,
          critical: true,
        },
        {
          id: 'back-door',
          text: 'Step away and try the door',
          nextPassageId: 'door',
          sanityChange: 5,
        }
      ],
      phase: 'danger',
    },
    'ending': {
      id: 'ending',
      text: "This is just a preview of Eden's Hollow. The full interactive story experience would continue from here, with your decisions having lasting consequences throughout the narrative. Your sanity would affect what you see and the options available to you. Thank you for exploring the beginning of Eden's Hollow.",
      choices: [
        {
          id: 'restart',
          text: 'Restart Demo',
          nextPassageId: 'start',
          sanityChange: 0,
        }
      ],
      phase: 'resolution',
    }
  }
};