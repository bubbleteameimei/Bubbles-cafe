import { Dialog } from '../types';
import { GameEngine } from '../GameEngine';

/**
 * Dialog collection for Eden's Hollow
 * Contains all character conversations and interaction dialogs
 */
export const gameDialogs: Record<string, Dialog> = {
  // Mysterious Stranger dialog at village entrance
  stranger_greeting: {
    id: 'stranger_greeting',
    content: [
      {
        speaker: 'Mysterious Stranger',
        text: 'Another visitor to Eden\'s Hollow. Not many come here these days. I wonder what draws you to this forgotten place.',
        responses: [
          {
            text: 'I\'m just passing through.',
            nextDialog: 'stranger_passing'
          },
          {
            text: 'I heard stories about this village.',
            nextDialog: 'stranger_stories'
          },
          {
            text: 'Who are you?',
            nextDialog: 'stranger_identity'
          }
        ]
      }
    ]
  },
  
  stranger_passing: {
    id: 'stranger_passing',
    content: [
      {
        speaker: 'Mysterious Stranger',
        text: 'No one just "passes through" Eden\'s Hollow. The road ends here. And those who come... well, not all find their way back out.',
        responses: [
          {
            text: 'That sounds like a threat.',
            nextDialog: 'stranger_threat'
          },
          {
            text: 'What happened to this place?',
            nextDialog: 'stranger_history'
          }
        ]
      }
    ]
  },
  
  stranger_stories: {
    id: 'stranger_stories',
    content: [
      {
        speaker: 'Mysterious Stranger',
        text: 'Stories? Yes, there are many. Tales of rituals gone wrong, of strange lights in the woods, of people who vanished without a trace. Which stories brought you here, I wonder?',
        responses: [
          {
            text: 'The story about the missing children.',
            nextDialog: 'stranger_children'
          },
          {
            text: 'I heard about supernatural occurrences.',
            nextDialog: 'stranger_supernatural'
          }
        ]
      }
    ]
  },
  
  stranger_identity: {
    id: 'stranger_identity',
    content: [
      {
        speaker: 'Mysterious Stranger',
        text: 'I\'m a watcher. I\'ve been here longer than I care to remember. I observe those who come and go. Few stay long... by choice, at least.',
        responses: [
          {
            text: 'You live here?',
            nextDialog: 'stranger_residence'
          },
          {
            text: 'What do you mean "by choice"?',
            nextDialog: 'stranger_choice'
          }
        ]
      }
    ]
  },
  
  stranger_threat: {
    id: 'stranger_threat',
    content: [
      {
        speaker: 'Mysterious Stranger',
        text: 'Not a threat. A warning. The hollow doesn\'t like visitors. It has ways of keeping them. If you\'re wise, you\'ll leave before nightfall.',
        responses: [
          {
            text: 'I\'m not afraid.',
            nextDialog: 'stranger_fear'
          },
          {
            text: 'Where can I find shelter for the night?',
            nextDialog: 'stranger_shelter'
          }
        ]
      }
    ]
  },
  
  stranger_history: {
    id: 'stranger_history',
    content: [
      {
        speaker: 'Mysterious Stranger',
        text: 'The village was once prosperous, centered around the church and its... unique practices. Then came the incident of 1891. The village was never the same after that night.',
        responses: [
          {
            text: 'What incident?',
            nextDialog: 'stranger_incident'
          },
          {
            text: 'What kind of practices?',
            nextDialog: 'stranger_practices'
          }
        ]
      }
    ]
  },
  
  stranger_children: {
    id: 'stranger_children',
    content: [
      {
        speaker: 'Mysterious Stranger',
        text: 'Ah, the children. Five of them disappeared during the harvest festival. Their laughter can still be heard sometimes near the church at dusk. Or so they say.',
        responses: [
          {
            text: 'That\'s terrible. Were they ever found?',
            nextDialog: 'stranger_found'
          },
          {
            text: 'I don\'t believe in ghosts.',
            nextDialog: 'stranger_belief'
          }
        ]
      }
    ]
  },
  
  stranger_supernatural: {
    id: 'stranger_supernatural',
    content: [
      {
        speaker: 'Mysterious Stranger',
        text: 'Yes... strange lights in the woods, time seeming to stop, people seeing their own reflections acting differently in mirrors. The village sits on old, powerful lines. The church was built to harness them.',
        responses: [
          {
            text: 'What lines? Ley lines?',
            nextDialog: 'stranger_ley_lines'
          },
          {
            text: 'I should visit this church.',
            nextDialog: 'stranger_visit_church'
          }
        ]
      }
    ]
  },
  
  stranger_residence: {
    id: 'stranger_residence',
    content: [
      {
        speaker: 'Mysterious Stranger',
        text: 'In a manner of speaking. My home is where I am needed. Tonight, that is here at the entrance, to greet you and others who might find their way to Eden\'s Hollow.',
        responses: [
          {
            text: 'Others? Who else is coming?',
            nextDialog: 'stranger_others'
          },
          {
            text: 'I should be going.',
            nextDialog: 'stranger_farewell'
          }
        ]
      }
    ]
  },
  
  stranger_choice: {
    id: 'stranger_choice',
    content: [
      {
        speaker: 'Mysterious Stranger',
        text: 'Some who enter find themselves unable to leave. The forest paths twist back onto themselves, leading always back to the hollow. Others simply... forget they wanted to leave at all.',
        responses: [
          {
            text: 'That\'s ridiculous.',
            nextDialog: 'stranger_ridicule'
          },
          {
            text: 'I\'ll take my chances.',
            nextDialog: 'stranger_chances'
          }
        ]
      }
    ]
  },
  
  stranger_fear: {
    id: 'stranger_fear',
    content: [
      {
        speaker: 'Mysterious Stranger',
        text: 'Bravery and foolishness often wear the same mask. Very well. When you feel the chill that no fire can warm, when you hear whispers with no source, remember my warning.',
        responses: [
          {
            text: 'I\'ll keep that in mind.',
            nextDialog: 'stranger_farewell'
          }
        ]
      }
    ]
  },
  
  stranger_shelter: {
    id: 'stranger_shelter',
    content: [
      {
        speaker: 'Mysterious Stranger',
        text: 'The old inn still stands in the village square. Whether you\'ll find rest there is another matter. The innkeeper hasn\'t truly slept in years.',
        responses: [
          {
            text: 'Why not?',
            nextDialog: 'stranger_innkeeper'
          },
          {
            text: 'Any other options?',
            nextDialog: 'stranger_options'
          }
        ]
      }
    ]
  },
  
  stranger_incident: {
    id: 'stranger_incident',
    content: [
      {
        speaker: 'Mysterious Stranger',
        text: 'A ritual was performed to ensure a prosperous harvest. But something went wrong. The church bell rang thirty-three times that night, though no one was seen pulling the rope. By morning, half the village had vanished.',
        responses: [
          {
            text: 'Vanished how?',
            nextDialog: 'stranger_vanished'
          },
          {
            text: 'That\'s impossible.',
            nextDialog: 'stranger_impossible'
          }
        ]
      }
    ]
  },
  
  stranger_practices: {
    id: 'stranger_practices',
    content: [
      {
        speaker: 'Mysterious Stranger',
        text: 'The church of Eden\'s Hollow followed... unorthodox teachings. They believed they could communicate with entities beyond our world, asking for favors, for prosperity. For power.',
        responses: [
          {
            text: 'Like demons?',
            nextDialog: 'stranger_demons'
          },
          {
            text: 'Did it work?',
            nextDialog: 'stranger_success'
          }
        ]
      }
    ]
  },
  
  stranger_farewell: {
    id: 'stranger_farewell',
    content: [
      {
        speaker: 'Mysterious Stranger',
        text: 'We all have our paths to walk. Enjoy your stay in Eden\'s Hollow. Perhaps we\'ll speak again... if you remain long enough.',
        responses: [
          {
            text: 'Goodbye for now.',
            nextDialog: ''
          }
        ]
      }
    ],
    onEnd: (engine: GameEngine) => {
      // Create a new status object with the 'met_stranger' flag
      const newStatus = { ...engine.debugState().status, met_stranger: true };
      // We need to use a different approach since updateState is not accessible here
      engine.addNotification('You\'ve met the mysterious stranger.', 'info');
    }
  },
  
  // Innkeeper dialog
  innkeeper_greeting: {
    id: 'innkeeper_greeting',
    content: [
      {
        speaker: 'Innkeeper',
        text: 'A guest? It\'s been... well, I can\'t rightly remember the last time someone new came to stay. You\'ll be wanting a room, I suppose?',
        responses: [
          {
            text: 'Yes, just for the night.',
            nextDialog: 'innkeeper_room'
          },
          {
            text: 'What can you tell me about this village?',
            nextDialog: 'innkeeper_village'
          },
          {
            text: 'I heard you haven\'t slept in years.',
            nextDialog: 'innkeeper_sleep',
            requiredStatus: { met_stranger: true }
          }
        ]
      }
    ]
  },
  
  innkeeper_room: {
    id: 'innkeeper_room',
    content: [
      {
        speaker: 'Innkeeper',
        text: 'Take room 3 up the stairs. Key\'s already in the door. Mind you keep your window latched at night. And try not to listen too hard to any... sounds you might hear.',
        responses: [
          {
            text: 'What sounds?',
            nextDialog: 'innkeeper_sounds'
          },
          {
            text: 'Thank you, I\'ll take the room.',
            nextDialog: 'innkeeper_thanks'
          }
        ]
      }
    ]
  },
  
  innkeeper_village: {
    id: 'innkeeper_village',
    content: [
      {
        speaker: 'Innkeeper',
        text: 'Eden\'s Hollow\'s seen better days, that\'s for certain. Not much happens here now. Most folks left after the troubles. Only us stubborn ones remain.',
        responses: [
          {
            text: 'What troubles?',
            nextDialog: 'innkeeper_troubles'
          },
          {
            text: 'Who still lives here?',
            nextDialog: 'innkeeper_residents'
          }
        ]
      }
    ]
  },
  
  innkeeper_sleep: {
    id: 'innkeeper_sleep',
    content: [
      {
        speaker: 'Innkeeper',
        text: 'Been talking to that fellow at the village entrance, have you? He speaks too freely. But yes, sleep doesn\'t come easy here. Not since I found those markings under the floorboards.',
        responses: [
          {
            text: 'What markings?',
            nextDialog: 'innkeeper_markings'
          },
          {
            text: 'Can I see them?',
            nextDialog: 'innkeeper_see_markings'
          }
        ]
      }
    ]
  },
  
  // Pastor dialog at church
  pastor_greeting: {
    id: 'pastor_greeting',
    content: [
      {
        speaker: 'Pastor Blackwood',
        text: 'Welcome to our humble church, traveler. Few come to worship these days. What brings you to this house of... faith?',
        responses: [
          {
            text: 'I\'m interested in the church\'s history.',
            nextDialog: 'pastor_history'
          },
          {
            text: 'I heard about strange rituals performed here.',
            nextDialog: 'pastor_rituals'
          },
          {
            text: 'Just looking around.',
            nextDialog: 'pastor_looking'
          }
        ]
      }
    ]
  },
  
  pastor_history: {
    id: 'pastor_history',
    content: [
      {
        speaker: 'Pastor Blackwood',
        text: 'Our church dates back to 1842. My great-grandfather was the first to minister here. The Blackwoods have always guided Eden\'s Hollow\'s spiritual matters... in one way or another.',
        responses: [
          {
            text: 'What happened in 1891?',
            nextDialog: 'pastor_1891',
            requiredStatus: { met_stranger: true }
          },
          {
            text: 'Is that a family portrait?',
            nextDialog: 'pastor_portrait'
          }
        ]
      }
    ]
  },
  
  pastor_rituals: {
    id: 'pastor_rituals',
    content: [
      {
        speaker: 'Pastor Blackwood',
        text: 'Rituals? Merely prayers and ceremonies to ensure good harvests and ward off hardship. Though I admit, my ancestors had... unorthodox methods. Methods I\'ve discontinued, of course.',
        responses: [
          {
            text: 'What kind of methods?',
            nextDialog: 'pastor_methods'
          },
          {
            text: 'I found this strange amulet.',
            nextDialog: 'pastor_amulet',
            requiredItem: 'strange_amulet'
          }
        ]
      }
    ]
  },
  
  // Child ghost dialog
  child_ghost: {
    id: 'child_ghost',
    content: [
      {
        speaker: 'Spectral Child',
        text: 'You can see me? No one sees me anymore. Not since the harvest night. Will you help us? We\'ve been waiting so long...',
        responses: [
          {
            text: 'Who are you?',
            nextDialog: 'child_identity'
          },
          {
            text: 'Help you how?',
            nextDialog: 'child_help'
          },
          {
            text: 'This isn\'t real.',
            nextDialog: 'child_real'
          }
        ]
      }
    ]
  },
  
  // Example of a lore-oriented dialog found in a book
  ancient_book: {
    id: 'ancient_book',
    content: [
      {
        speaker: 'Ancient Book',
        text: 'The text is faded but still legible: "To summon that which lies between worlds requires the bell\'s toll at the witching hour. The circle must be unbroken, the candles black as night, the offering pure..."',
        responses: [
          {
            text: 'Continue reading',
            nextDialog: 'ancient_book_continued'
          },
          {
            text: 'Close the book',
            nextDialog: ''
          }
        ]
      }
    ]
  },
  
  ancient_book_continued: {
    id: 'ancient_book_continued',
    content: [
      {
        speaker: 'Ancient Book',
        text: '"The five points must be marked with the symbols of binding. When the boundary between worlds grows thin, speak the words: \"Aperiam portam ad tenebras.\" But beware, for what comes through may not be what was called..."',
        responses: [
          {
            text: 'Make a mental note of this information',
            nextDialog: ''
          }
        ]
      }
    ],
    onEnd: (engine: GameEngine) => {
      // Create a new status object with the 'learned_ritual' flag
      const newStatus = { ...engine.debugState().status, learned_ritual: true };
      // We need to use a different approach since updateState is not accessible here
      engine.addNotification('You\'ve learned about the ritual.', 'info');
    }
  }
};