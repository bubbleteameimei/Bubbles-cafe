/**
 * Eden's Hollow Game Scenes
 * 
 * This file contains all the game scenes and choices.
 */
import { Scene } from '../types';

/**
 * The collection of game scenes
 */
export const scenes: Record<string, Scene> = {
  // Introduction scene
  intro: {
    id: 'intro',
    title: "Eden's Hollow",
    description: `You awaken to find yourself on the outskirts of a small, isolated village nestled in a valley. The air is thick with mist, and the sky above is an unnatural shade of crimson. You have no memory of how you arrived here, but a sense of dread fills your being. In the distance, you can see the silhouettes of buildings, and a faint glow of torches illuminates the fog.`,
    choices: [
      {
        text: "Approach the village cautiously",
        nextScene: 'village_entrance',
        sanityChange: -5
      },
      {
        text: "Explore the surrounding woods first",
        nextScene: 'woods',
        sanityChange: -10
      },
      {
        text: "Call out for help",
        nextScene: 'villager_encounter',
        sanityChange: -5
      }
    ],
    background: 'background.svg',
    effects: {
      fog: true,
      darkness: 40
    }
  },
  
  // Village entrance scene
  village_entrance: {
    id: 'village_entrance',
    title: "Village Entrance",
    description: `As you approach the village entrance, you notice strange symbols carved into the wooden gates. The air grows colder, and whispers seem to emanate from the very ground beneath your feet. A weathered sign reads 'Eden's Hollow - Where Peace Awaits'. The irony is not lost on you as the village appears anything but peaceful.`,
    alternateDescriptions: [
      {
        condition: {
          sanityBelow: 70
        },
        text: `The village entrance looms before you, its wooden gates adorned with symbols that seem to writhe and shift when you're not looking directly at them. Whispers crawl into your ears, unintelligible yet somehow familiar. The sign reading 'Eden's Hollow - Where Peace Awaits' appears to be dripping with a dark substance that vanishes when you blink.`
      }
    ],
    choices: [
      {
        text: "Enter through the main gate",
        nextScene: 'village_square',
        sanityChange: -5
      },
      {
        text: "Look for another way in",
        nextScene: 'village_outskirts',
        sanityChange: -5
      },
      {
        text: "Examine the strange symbols more closely",
        nextScene: 'examine_symbols',
        sanityChange: -15,
        corruptionChange: 10
      }
    ],
    background: 'background.svg',
    effects: {
      fog: true,
      darkness: 50
    }
  },
  
  // Examine symbols scene
  examine_symbols: {
    id: 'examine_symbols',
    title: "Ancient Symbols",
    description: `Your curiosity gets the better of you as you lean in to study the intricate carvings. They depict scenes of sacrifice and communion with entities that defy description. As your fingers trace the grooves, a searing pain shoots through your head, and for a moment, you see flashes of rituals performed in the dead of night. Knowledge fills your mind - terrible knowledge that no mortal should possess.`,
    alternateDescriptions: [
      {
        condition: {
          sanityBelow: 50
        },
        text: `The symbols call to you, their meaning suddenly clear as day. They speak of ancient pacts, of offerings made to beings from beyond the veil. Your fingers trace the carvings with intimate familiarity, as if you've known these symbols all your life. Blood trickles from your nose as knowledge floods your mind - terrible, wonderful knowledge that feels like coming home.`
      }
    ],
    choices: [
      {
        text: "Pull away from the symbols",
        nextScene: 'village_entrance',
        sanityChange: -10
      },
      {
        text: "Embrace the knowledge flowing into you",
        nextScene: 'corruption_begins',
        sanityChange: -25,
        corruptionChange: 25,
        setFlags: {
          'embracedSymbols': true
        }
      },
      {
        text: "Carve the symbols into your palm to remember them",
        nextScene: 'self_marking',
        sanityChange: -15,
        corruptionChange: 15,
        healthChange: -10,
        setFlags: {
          'selfMarked': true
        },
        maximumSanity: 70 // Only visible if sanity is below 70
      }
    ],
    effects: {
      fog: true,
      darkness: 70
    }
  },
  
  // Corruption begins scene
  corruption_begins: {
    id: 'corruption_begins',
    title: "Whispers of Power",
    description: `The knowledge burns through your mind like fire, rearranging your thoughts and perceptions. The world around you seems different now - more vibrant yet somehow wrong. You can see patterns where there were none before, and the whispers in your mind grow louder, more insistent. They speak of power, of transformation, of becoming something greater than human.`,
    choices: [
      {
        text: "Fight against the influence",
        nextScene: 'resist_corruption',
        sanityChange: 10,
        corruptionChange: -5
      },
      {
        text: "Allow the whispers to guide you",
        nextScene: 'guided_by_whispers',
        sanityChange: -15,
        corruptionChange: 20
      },
      {
        text: "Recite a prayer to ward off evil",
        nextScene: 'prayer_attempt',
        sanityChange: 5,
        minimumSanity: 40 // Only visible if sanity is above 40
      }
    ],
    effects: {
      darkness: 80
    }
  },
  
  // Village square scene
  village_square: {
    id: 'village_square',
    title: "Village Square",
    description: `The village square is eerily quiet despite several villagers going about their business. They move with an unsettling synchronization, their faces blank and eyes vacant. In the center stands a peculiar stone altar, stained dark with what you hope isn't blood. The buildings around the square are dilapidated, yet oddly cared for, as if the decay is intentional rather than neglected.`,
    alternateDescriptions: [
      {
        condition: {
          corruptionAbove: 30
        },
        text: `The village square pulses with hidden energy. The villagers move in perfect harmony, a beautiful dance choreographed by unseen forces. Their eyes, though vacant, reflect an inner peace that you find yourself envying. The stone altar in the center calls to you, its stains a testament to necessary sacrifice and communion. The decay of the buildings feels like a deliberate shedding of the old world, making way for something glorious.`
      }
    ],
    choices: [
      {
        text: "Approach a villager",
        nextScene: 'villager_conversation',
        sanityChange: -5
      },
      {
        text: "Examine the stone altar",
        nextScene: 'stone_altar',
        sanityChange: -10,
        corruptionChange: 5
      },
      {
        text: "Head towards the large building on the north side",
        nextScene: 'town_hall',
        sanityChange: -5
      }
    ],
    background: 'background.svg',
    effects: {
      fog: true,
      darkness: 30
    }
  },
  
  // Village outskirts scene
  village_outskirts: {
    id: 'village_outskirts',
    title: "Village Outskirts",
    description: `You skirt around the main entrance, finding a path that leads through overgrown gardens and abandoned outbuildings. The vegetation here is strange - plants with unnatural colors and shapes that seem to react to your presence. In the distance, you hear chanting that raises the hair on your neck. A small gap in a crumbling wall offers a way into the village proper.`,
    choices: [
      {
        text: "Slip through the gap in the wall",
        nextScene: 'back_alley',
        sanityChange: -5
      },
      {
        text: "Follow the sound of chanting",
        nextScene: 'ritual_grounds',
        sanityChange: -15,
        corruptionChange: 5
      },
      {
        text: "Collect a strange flower that caught your eye",
        nextScene: 'strange_flora',
        sanityChange: -10,
        addItems: ['strange_flower']
      }
    ],
    background: 'background.svg',
    effects: {
      fog: true,
      darkness: 40
    }
  }
};