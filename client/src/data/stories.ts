/**
 * Eden's Hollow - Story Data
 * 
 * This file contains all the story content for the game,
 * including passages, choices, and game effects.
 */

import { Story, StoryPhase } from '../types/game';

// Collection of all stories in the game
const stories: Record<string, Story> = {
  // Manor Story
  'haunted-manor': {
    id: 'haunted-manor',
    title: 'The Haunted Manor',
    description: 'Explore a decrepit manor with a dark history and uncover its horrifying secrets.',
    author: 'Eden\'s Hollow',
    startPassage: 'manor-entrance',
    defaultSanity: 100,
    endingPassages: ['ending-escape', 'ending-trapped', 'ending-possessed'],
    passages: {
      // Starting point
      'manor-entrance': {
        id: 'manor-entrance',
        text: 'You stand before the imposing gates of Blackthorn Manor, its twisted wrought iron rising like gnarled fingers against the twilight sky. Rain patters gently around you, each drop a whispered warning. The local rumors of disappearances and strange phenomena have drawn you here, but now that you face the decaying grandeur of the estate, doubt gnaws at your resolve.\n\nThe heavy padlock that should secure the gates hangs broken, as if inviting you inward. Through the mist, the manor\'s silhouette looms with dark windows that seem to watch your every move.',
        phase: StoryPhase.INTRO,
        background: 'manor-exterior',
        ambientSound: 'ambientNormal',
        choices: [
          {
            id: 'enter-manor',
            text: 'Push open the gates and approach the manor',
            nextPassageId: 'manor-grounds',
            effects: [
              {
                type: 'PLAY_SOUND',
                sound: 'creaking-gate'
              }
            ]
          },
          {
            id: 'check-grounds',
            text: 'Look around the perimeter first',
            nextPassageId: 'manor-perimeter',
            effects: []
          },
          {
            id: 'leave-immediately',
            text: 'Turn back while you still can',
            nextPassageId: 'early-departure',
            sanityChange: 5,
            effects: [
              {
                type: 'SANITY_CHANGE',
                value: 5
              },
              {
                type: 'SET_FLAG',
                flag: 'attempted-leaving',
                value: true
              }
            ]
          }
        ]
      },
      
      // Early departure (short ending)
      'early-departure': {
        id: 'early-departure',
        text: 'A sudden gust of cold wind cuts through your jacket, sending a shiver down your spine. The weight of unseen eyes follows your retreat as you back away from the gates.\n\nSomething about this place feels fundamentally wrong—a primal warning that screams danger to every cell in your body.\n\nDeciding to trust your instincts, you turn and hurry back toward town. The stories will remain mysteries, and perhaps that's for the best. Not all secrets are meant to be uncovered.\n\nAs you reach the bend in the road, you glance back one last time. For a brief moment, you swear you see a pale figure watching from an upstairs window, but when you blink, it\'s gone.\n\nYou survived, but the questions will haunt you forever.',
        phase: StoryPhase.ENDING,
        background: 'manor-exterior-dusk',
        choices: [
          {
            id: 'restart-story',
            text: 'The End (Restart Story)',
            nextPassageId: 'manor-entrance',
            effects: [
              {
                type: 'PLAY_SOUND',
                sound: 'ending'
              }
            ]
          }
        ]
      },
      
      // Manor grounds
      'manor-grounds': {
        id: 'manor-grounds',
        text: 'The iron gates groan in protest as you push them open. Gravel crunches beneath your feet as you walk the overgrown path toward the manor. Twisted topiary figures, now wild and misshapen, stand like sentinels along the way.\n\nThe front garden might once have been beautiful, but now decay claims every inch. Withered rose bushes bear blackened blooms, and a cracked fountain holds stagnant water where something seems to move just beneath the surface.\n\nThe air grows colder with each step toward the grand entrance—a massive wooden door with tarnished brass fixtures. A peculiar symbol is carved into the wood, partially obscured by creeping ivy.',
        phase: StoryPhase.INTRO,
        background: 'manor-garden',
        choices: [
          {
            id: 'enter-front-door',
            text: 'Try the front door',
            nextPassageId: 'manor-foyer',
            effects: []
          },
          {
            id: 'check-fountain',
            text: 'Investigate the strange fountain',
            nextPassageId: 'manor-fountain',
            effects: [
              {
                type: 'SANITY_CHANGE',
                value: -5
              }
            ]
          },
          {
            id: 'check-windows',
            text: 'Look for another way in',
            nextPassageId: 'manor-side-entrance',
            effects: []
          }
        ]
      },
      
      // Manor perimeter
      'manor-perimeter': {
        id: 'manor-perimeter',
        text: 'You decide to explore the perimeter before committing to enter. The estate is larger than it first appeared, with the wrought iron fence extending into mist-shrouded woods on both sides.\n\nAs you follow the fence line, you notice strange markings carved into some of the posts—symbols that seem almost like warnings. The ground near the fence is oddly barren, as if nothing can grow within a foot of the property line.\n\nAfter walking for several minutes, you discover a small gap in the fence where the metal has corroded away. Beyond it, you can see what appears to be an old groundskeeper\'s shed, its door hanging ajar.',
        phase: StoryPhase.INTRO,
        background: 'manor-exterior',
        choices: [
          {
            id: 'enter-through-gap',
            text: 'Squeeze through the gap in the fence',
            nextPassageId: 'groundskeeper-shed',
            effects: []
          },
          {
            id: 'return-to-front',
            text: 'Return to the front gates',
            nextPassageId: 'manor-entrance',
            effects: []
          },
          {
            id: 'inspect-symbols',
            text: 'Examine the strange symbols more closely',
            nextPassageId: 'fence-symbols',
            effects: [
              {
                type: 'SANITY_CHANGE',
                value: -3
              }
            ]
          }
        ]
      },
      
      // Groundskeeper's shed
      'groundskeeper-shed': {
        id: 'groundskeeper-shed',
        text: 'You squeeze through the gap in the fence, the rusted metal snagging your clothing as you pass. The groundskeeper\'s shed stands before you, a small wooden structure reclaimed by nature. Vines crawl up its walls, and the roof sags dangerously on one side.\n\nPushing open the creaking door, you find the interior cluttered with old tools—some rusted beyond recognition, others strangely pristine despite their apparent age. A worktable dominates one wall, covered in gardening implements and a leather-bound journal.\n\nA dull gleam catches your eye from beneath a pile of moldering sacks in the corner.',
        phase: StoryPhase.EARLY,
        background: 'manor-garden',
        choices: [
          {
            id: 'examine-journal',
            text: 'Read the journal',
            nextPassageId: 'groundskeeper-journal',
            effects: []
          },
          {
            id: 'check-gleaming-object',
            text: 'Investigate the gleaming object',
            nextPassageId: 'find-key',
            effects: [
              {
                type: 'INVENTORY_ADD',
                item: 'cellar-key'
              },
              {
                type: 'PLAY_SOUND',
                sound: 'itemGet'
              }
            ]
          },
          {
            id: 'leave-shed',
            text: 'Exit the shed and head toward the manor',
            nextPassageId: 'manor-grounds',
            effects: []
          }
        ]
      },
      
      // Find the key
      'find-key': {
        id: 'find-key',
        text: 'You push aside the moldy sacks to reveal an old iron key, surprisingly heavy for its size. Its design is ornate, with intricate patterns forming what looks like a tree or root system along the shaft. Despite its age, the key seems untouched by rust or corrosion.\n\nAs you lift it, the metal feels unnaturally cold against your skin. Something about it seems important—this wasn\'t carelessly misplaced but deliberately hidden.\n\nOn the wall behind where the key was hidden, you notice faded writing scratched into the wood: "CELLAR REMAINS SEALED BY ORDER OF THE MASTER. MAY GOD FORGIVE WHAT LIES BELOW."',
        phase: StoryPhase.EARLY,
        background: 'manor-garden',
        choices: [
          {
            id: 'take-key-read-journal',
            text: 'Pocket the key and check the journal',
            nextPassageId: 'groundskeeper-journal',
            effects: []
          },
          {
            id: 'take-key-leave',
            text: 'Take the key and head to the manor',
            nextPassageId: 'manor-grounds',
            effects: []
          }
        ]
      },
      
      // Reading the groundskeeper's journal
      'groundskeeper-journal': {
        id: 'groundskeeper-journal',
        text: 'You blow dust from the leather journal and open it carefully. The pages are yellowed and brittle, filled with a cramped, increasingly erratic handwriting. The earliest entries detail mundane gardening tasks and complaints about the manor\'s demanding owner.\n\nAs you flip through, the entries grow darker:\n\n"June 15: Master has forbidden anyone from entering the east wing. Strange noises at night. The roses near that side have begun to bloom black."\n\n"July 23: Found another dead animal by the fountain. No marks, just... empty. Like something drained it."\n\n"August 7: They\'re digging in the cellar again. The sounds... not like tools. More like... clawing."\n\nThe final entry is a jagged scrawl across the page: "THEY\'RE IN THE WALLS NOW. GOD HELP US ALL."',
        phase: StoryPhase.EARLY,
        background: 'manor-garden',
        choices: [
          {
            id: 'journal-investigate-fountain',
            text: 'Head to the fountain mentioned in the journal',
            nextPassageId: 'manor-fountain',
            effects: [
              {
                type: 'SET_FLAG',
                flag: 'read-journal',
                value: true
              }
            ]
          },
          {
            id: 'journal-find-cellar',
            text: 'Look for the cellar entrance',
            nextPassageId: 'manor-grounds',
            effects: [
              {
                type: 'SET_FLAG',
                flag: 'seeking-cellar',
                value: true
              },
              {
                type: 'SET_FLAG',
                flag: 'read-journal',
                value: true
              }
            ]
          },
          {
            id: 'leave-journal-shed',
            text: 'Put down the journal and exit the shed',
            nextPassageId: 'manor-grounds',
            effects: [
              {
                type: 'SANITY_CHANGE',
                value: -5
              },
              {
                type: 'SET_FLAG',
                flag: 'read-journal',
                value: true
              }
            ]
          }
        ]
      },
      
      // Manor fountain
      'manor-fountain': {
        id: 'manor-fountain',
        text: 'The decrepit fountain stands at the center of a circular courtyard. Though no water flows from the corroded spout, the basin contains a few inches of stagnant liquid—too dark to be water, too thick to be rain.\n\nThe statue at the center depicts an angel, but its features have been worn away to create an eerily blank face. Its wings extend outward as if ready to take flight, but one has broken off and lies shattered in the basin.\n\nAs you approach, the surface of the dark liquid ripples, though there's no wind. Something pale seems to move beneath the surface, vanishing when you try to focus on it. The air here feels wrong—heavy and charged with a faint metallic scent.',
        phase: StoryPhase.EARLY,
        background: 'manor-garden',
        choices: [
          {
            id: 'touch-fountain-liquid',
            text: 'Touch the strange liquid',
            nextPassageId: 'fountain-vision',
            minSanity: 50,
            effects: [
              {
                type: 'SANITY_CHANGE',
                value: -15
              }
            ]
          },
          {
            id: 'examine-broken-wing',
            text: 'Look at the broken angel wing',
            nextPassageId: 'angel-wing',
            effects: [
              {
                type: 'INVENTORY_ADD',
                item: 'stone-fragment'
              },
              {
                type: 'PLAY_SOUND',
                sound: 'itemGet'
              }
            ]
          },
          {
            id: 'leave-fountain',
            text: 'Back away from the fountain',
            nextPassageId: 'manor-grounds',
            effects: []
          }
        ]
      },
      
      // Many more passages would follow...
      
      // Sample ending passage
      'ending-escape': {
        id: 'ending-escape',
        text: 'Your heart pounds frantically as you sprint through the overgrown gardens, the key clutched so tightly in your palm that it breaks skin. Behind you, the inhuman wailing from the manor grows fainter, but you don\'t dare look back.\n\nThe gates appear ahead, and with a final desperate burst of energy, you throw yourself through them. You collapse on the road beyond, gasping for breath as dawn breaks over the horizon.\n\nAs light touches the manor, the screaming abruptly stops. In daylight, the building almost looks ordinary—just an abandoned, decrepit estate. But you know better now.\n\nSlowly rising to your feet, you begin the long walk back to town. The physical evidence of your ordeal—the scratches, the strange key, the journal pages—will raise questions you can never fully answer.\n\nYou survived, but a part of you will forever remain in Blackthorn Manor, trapped in its endless night.',
        phase: StoryPhase.ENDING,
        background: 'manor-exterior-dusk',
        choices: [
          {
            id: 'escape-restart',
            text: 'The End (Restart Story)',
            nextPassageId: 'manor-entrance',
            effects: [
              {
                type: 'PLAY_SOUND',
                sound: 'ending'
              }
            ]
          }
        ]
      }
    }
  },
  
  // Additional stories would be added here
  
  // Sample story 2
  'abandoned-lighthouse': {
    id: 'abandoned-lighthouse',
    title: 'Keeper of the Dark',
    description: 'Trapped in a desolate lighthouse with a terrible secret hidden in the depths below.',
    author: 'Eden\'s Hollow',
    startPassage: 'lighthouse-approach',
    defaultSanity: 100,
    endingPassages: ['lighthouse-sacrifice', 'lighthouse-escape', 'lighthouse-become'],
    passages: {
      'lighthouse-approach': {
        id: 'lighthouse-approach',
        text: 'The narrow coastal road ends abruptly at a barricade marked "CONDEMNED - NO ENTRY." Beyond it, a winding path leads to the Blackrock Lighthouse, standing like a lone sentinel against the raging sea. Storm clouds gather overhead, promising a tempest by nightfall.\n\nYour research into the lighthouse\'s troubled history brought you here: three keepers vanished without explanation in 1897, and since then, locals refuse to approach the structure after dark. Recent disappearances of several hikers have renewed interest in the century-old mystery.\n\nThe lighthouse has been officially closed for decades, yet somehow, its light still shines on certain nights, visible for miles—nights that always seem to precede tragedy at sea.',
        phase: StoryPhase.INTRO,
        background: 'lighthouse-exterior',
        ambientSound: 'ambientNormal',
        choices: [
          {
            id: 'go-to-lighthouse',
            text: 'Climb over the barricade and approach the lighthouse',
            nextPassageId: 'lighthouse-exterior',
            effects: []
          },
          {
            id: 'check-boathouse',
            text: 'Look for the old boathouse mentioned in your research',
            nextPassageId: 'old-boathouse',
            effects: []
          },
          {
            id: 'reconsider-visit',
            text: 'Wait until morning when it might be safer',
            nextPassageId: 'storm-arrival',
            effects: [
              {
                type: 'SET_FLAG',
                flag: 'waited-for-morning',
                value: true
              }
            ]
          }
        ]
      },
      
      // Additional passages would follow...
    }
  },

  // More stories would be added...
};

export default stories;