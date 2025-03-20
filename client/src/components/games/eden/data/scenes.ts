import { Scene } from '../types';

// Map of all game scenes
const scenes: Record<string, Scene> = {
  // Village entrance
  'village_entrance': {
    id: 'village_entrance',
    name: 'Eden\'s Hollow Entrance',
    description: 'A weathered wooden sign welcomes you to Eden\'s Hollow. The path ahead is shrouded in mist, with only the faint silhouettes of buildings visible in the distance. The fog seems to swirl with unnatural patterns, occasionally revealing glimpses of the abandoned village.',
    background: '/assets/eden/scenes/village_entrance.jpg',
    ambient: '/assets/eden/audio/ambient/eerie_wind.mp3',
    hotspots: [
      {
        id: 'sign',
        name: 'Village Sign',
        description: 'A weathered wooden sign with faded lettering. It reads "Eden\'s Hollow" with smaller text below that\'s difficult to make out.',
        x: 150,
        y: 320,
        width: 100,
        height: 60,
        action: 'examine',
        onInteract: {
          message: 'The sign reads: "Eden\'s Hollow - Founded 1842". Below, in smaller text: "Where peace and prosperity flow like water." The word "water" has been violently scratched out.',
          notification: {
            id: 'sign_clue',
            type: 'discovery',
            message: 'You noticed something unusual about the village sign.',
            duration: 5000,
            autoDismiss: true
          }
        }
      },
      {
        id: 'strange_marking',
        name: 'Strange Marking',
        description: 'Something is carved into the base of a nearby tree. It\'s not immediately visible unless you look closely.',
        x: 350,
        y: 400,
        width: 50,
        height: 50,
        action: 'examine',
        onInteract: {
          message: 'A crude symbol has been carved into the tree - a circle with a vertical line through it. The carving seems recent, the wood still pale where it\'s been cut.',
          notification: {
            id: 'marking_discovery',
            type: 'discovery',
            message: 'You\'ve found a strange marking that may be significant.',
            duration: 5000,
            autoDismiss: true
          }
        }
      }
    ],
    exits: [
      {
        id: 'to_village_square',
        name: 'Continue to Village',
        description: 'The path leads deeper into the village, toward what appears to be a central square.',
        targetScene: 'village_square',
        x: 400,
        y: 300,
        width: 200,
        height: 100,
        condition: null
      },
      {
        id: 'turn_back',
        name: 'Return to Forest Path',
        description: 'The forest path you came from. It\'s almost entirely obscured by thick fog now.',
        targetScene: null,
        x: 50,
        y: 450,
        width: 150,
        height: 80,
        onInteract: {
          dialog: 'strange_force_stops_you',
          message: 'As you try to return, the fog thickens impossibly. You walk for several minutes but somehow end up facing the village again. It seems the forest path no longer leads anywhere but here.'
        }
      }
    ],
    items: []
  },
  
  // Village square
  'village_square': {
    id: 'village_square',
    name: 'Village Square',
    description: 'The central square of Eden\'s Hollow is dominated by an ornate stone fountain, now dry and cracked. Abandoned buildings surround the square - a general store, tavern, and what appears to be a town hall. The fog is thinner here, but the silence is oppressive.',
    background: '/assets/eden/scenes/village_square.jpg',
    ambient: '/assets/eden/audio/ambient/distant_whispers.mp3',
    hotspots: [
      {
        id: 'fountain',
        name: 'Dry Fountain',
        description: 'A once-elegant stone fountain stands in the center of the square. It\'s completely dry now, with cracks running through the stone basin.',
        x: 300,
        y: 350,
        width: 150,
        height: 120,
        action: 'examine',
        onInteract: {
          message: 'The fountain appears to have been beautiful once. Stone figures of children playing form the centerpiece. Their faces have been deliberately chiseled away, leaving disturbing blank slates. There\'s something scratched into the basin: "IT CAME FROM BELOW".',
          notification: {
            id: 'fountain_clue',
            type: 'discovery',
            message: 'You\'ve found a concerning message on the fountain.',
            duration: 5000,
            autoDismiss: true
          }
        }
      },
      {
        id: 'corpse',
        name: 'Slumped Figure',
        description: 'A dark shape sits slumped against the fountain\'s edge. It\'s not moving.',
        x: 380,
        y: 370,
        width: 70,
        height: 90,
        action: 'examine',
        onInteract: {
          dialog: 'mysterious_whisper',
          message: 'It\'s the long-decayed corpse of what was once a person. They\'re clutching a journal to their chest. As you approach to examine it closer, you feel a cold presence behind you...'
        }
      },
      {
        id: 'scattered_papers',
        name: 'Scattered Papers',
        description: 'Several weathered papers are scattered across the square, caught against the cobblestones.',
        x: 200,
        y: 450,
        width: 100,
        height: 30,
        action: 'examine',
        onInteract: {
          message: 'The papers are mostly ruined by exposure to the elements. One is partially legible - it appears to be a public notice: "BY ORDER OF MAYOR THORNE: ALL RESIDENTS ARE REQUIRED TO ATTEND THE TOWN MEETING TONIGHT. CONSUMPTION OF VILLAGE WATER IS STRICTLY PROHIBITED UNTIL FURTHER NOTICE."',
          notification: {
            id: 'water_warning',
            type: 'discovery',
            message: 'You\'ve found evidence of problems with the village water supply.',
            duration: 5000,
            autoDismiss: true
          }
        }
      }
    ],
    exits: [
      {
        id: 'to_village_entrance',
        name: 'Return to Village Entrance',
        description: 'The path back to the village entrance.',
        targetScene: 'village_entrance',
        x: 50,
        y: 400,
        width: 120,
        height: 80,
        condition: null
      },
      {
        id: 'to_general_store',
        name: 'Enter General Store',
        description: 'An abandoned general store with a broken window and door slightly ajar.',
        targetScene: 'general_store',
        x: 100,
        y: 250,
        width: 150,
        height: 100,
        condition: null
      },
      {
        id: 'to_tavern',
        name: 'Enter Tavern',
        description: 'The village tavern. Its sign hangs by a single chain, creaking in the faint breeze.',
        targetScene: 'tavern',
        x: 500,
        y: 250,
        width: 150,
        height: 100,
        condition: null
      },
      {
        id: 'to_town_hall',
        name: 'Enter Town Hall',
        description: 'The imposing town hall building. Its doors are weathered but intact.',
        targetScene: 'town_hall',
        x: 300,
        y: 200,
        width: 180,
        height: 120,
        condition: null
      }
    ],
    items: [
      {
        id: 'village_journal',
        x: 385,
        y: 390,
        width: 30,
        height: 20,
        condition: {
          dialog: 'mysterious_whisper',
          mustBeCompleted: true
        }
      }
    ]
  },
  
  // General store
  'general_store': {
    id: 'general_store',
    name: 'Abandoned General Store',
    description: 'Shelves lie toppled and empty inside the once-bustling general store. The counter is still intact, with an antique cash register and a thick layer of dust covering everything. Weak light filters through the grimy windows.',
    background: '/assets/eden/scenes/general_store.jpg',
    ambient: '/assets/eden/audio/ambient/creaking_wood.mp3',
    hotspots: [
      {
        id: 'cash_register',
        name: 'Cash Register',
        description: 'An old brass cash register sits on the counter, its once-polished surface now tarnished.',
        x: 350,
        y: 320,
        width: 80,
        height: 60,
        action: 'examine',
        onInteract: {
          message: 'The cash register drawer is open and empty. Someone has scratched a sequence of numbers into the metal beneath it: "4-2-7". It seems deliberate, like a code or combination.',
          notification: {
            id: 'safe_combination',
            type: 'discovery',
            message: 'You\'ve found what appears to be a combination.',
            duration: 5000,
            autoDismiss: true
          }
        }
      },
      {
        id: 'store_safe',
        name: 'Wall Safe',
        description: 'A small wall safe is partially hidden behind the counter. It has a combination dial on the front.',
        x: 420,
        y: 280,
        width: 60,
        height: 60,
        action: 'puzzle',
        puzzle: 'store_safe'
      },
      {
        id: 'store_ledger',
        name: 'Store Ledger',
        description: 'A large leather-bound book lies open on a small desk near the counter.',
        x: 250,
        y: 340,
        width: 70,
        height: 50,
        action: 'examine',
        onInteract: {
          message: 'The ledger contains records of purchases. The final entries show a sudden increase in salt, canned goods, and ammunition sales. The last entry, dated May 8th, reads only: "God help us all. They\'re coming through the walls now."',
          notification: {
            id: 'ledger_discovery',
            type: 'discovery',
            message: 'The store ledger contains ominous final entries.',
            duration: 5000,
            autoDismiss: true
          }
        }
      }
    ],
    exits: [
      {
        id: 'to_village_square',
        name: 'Exit to Village Square',
        description: 'Return to the village square.',
        targetScene: 'village_square',
        x: 300,
        y: 450,
        width: 200,
        height: 80,
        condition: null
      },
      {
        id: 'to_store_backroom',
        name: 'Enter Back Room',
        description: 'A door behind the counter appears to lead to a storage area.',
        targetScene: 'store_backroom',
        x: 500,
        y: 300,
        width: 80,
        height: 140,
        condition: null
      }
    ],
    items: []
  },
  
  // Store backroom
  'store_backroom': {
    id: 'store_backroom',
    name: 'Store Storage Room',
    description: 'A cramped storage room behind the general store. Empty shelves line the walls, and broken crates are scattered across the floor. A small window lets in minimal light, revealing swirling dust motes in the air.',
    background: '/assets/eden/scenes/store_backroom.jpg',
    ambient: '/assets/eden/audio/ambient/creaking_wood.mp3',
    hotspots: [
      {
        id: 'hidden_note',
        name: 'Folded Paper',
        description: 'A folded piece of paper wedged between two shelves, easily missed unless looking carefully.',
        x: 200,
        y: 300,
        width: 40,
        height: 30,
        action: 'examine',
        onInteract: {
          message: 'The note is written in a hurried scrawl: "J - The mayor knows more than he\'s saying. Saw him taking boxes down to the cellar beneath town hall at night. Something\'s not right with the water. Don\'t drink it. Meet me at the tavern tonight. - T"',
          notification: {
            id: 'conspiracy_note',
            type: 'discovery',
            message: 'You\'ve found a note suggesting a conspiracy.',
            duration: 5000,
            autoDismiss: true
          }
        }
      },
      {
        id: 'scratched_wall',
        name: 'Scratched Wall',
        description: 'Deep gouges mark one of the wooden walls, as if made by something with claws.',
        x: 350,
        y: 280,
        width: 100,
        height: 150,
        action: 'examine',
        onInteract: {
          message: 'The gouges are deep and violent, splintering the wood. They\'re arranged in sets of five, like fingers or claws. Some gouges puncture all the way through the wall. Whatever made them was incredibly strong.',
          notification: {
            id: 'claw_marks',
            type: 'discovery',
            message: 'Something with incredible strength damaged this wall.',
            duration: 5000,
            autoDismiss: true
          }
        }
      }
    ],
    exits: [
      {
        id: 'to_general_store',
        name: 'Return to Store',
        description: 'Go back to the main store area.',
        targetScene: 'general_store',
        x: 50,
        y: 350,
        width: 100,
        height: 150,
        condition: null
      }
    ],
    items: [
      {
        id: 'old_key',
        x: 330,
        y: 400,
        width: 20,
        height: 10,
        condition: null
      }
    ]
  },
  
  // Tavern
  'tavern': {
    id: 'tavern',
    name: 'Hollow Barrel Tavern',
    description: 'The village tavern is in disarray, with overturned tables and broken chairs scattered across the floor. The bar remains intact, bottles of liquor still lined up behind it. A thick layer of dust covers everything, disturbed only by your footprints.',
    background: '/assets/eden/scenes/tavern.jpg',
    ambient: '/assets/eden/audio/ambient/distant_whispers.mp3',
    hotspots: [
      {
        id: 'bar_counter',
        name: 'Bar Counter',
        description: 'The long wooden bar counter still has glasses and bottles arranged as if waiting for customers.',
        x: 400,
        y: 350,
        width: 200,
        height: 80,
        action: 'examine',
        onInteract: {
          message: 'Behind the counter, you find a trapdoor partially hidden by a wine rack. It appears to lead to a cellar below. The door has a substantial lock securing it.',
          notification: {
            id: 'cellar_discovery',
            type: 'discovery',
            message: 'You\'ve discovered a locked cellar beneath the tavern.',
            duration: 5000,
            autoDismiss: true
          }
        }
      },
      {
        id: 'cellar_door',
        name: 'Cellar Door',
        description: 'A heavy wooden trapdoor set into the floor behind the bar. It\'s secured with a sturdy iron lock.',
        x: 420,
        y: 380,
        width: 80,
        height: 60,
        action: 'puzzle',
        puzzle: 'cellar_lock',
        condition: {
          hotspot: 'bar_counter',
          mustBeInteracted: true
        }
      },
      {
        id: 'dead_barkeep',
        name: 'Slumped Figure',
        description: 'A figure sits motionless at a corner table, head down as if sleeping.',
        x: 200,
        y: 320,
        width: 70,
        height: 90,
        action: 'examine',
        onInteract: {
          message: 'The figure is the long-dead corpse of a man, presumably the barkeep. He\'s wearing an apron with "Thomas" embroidered on it. Around his neck is a chain with several keys. One of them might open the cellar.',
          notification: {
            id: 'barkeep_discovery',
            type: 'discovery',
            message: 'You\'ve found the remains of the barkeep, Thomas.',
            duration: 5000,
            autoDismiss: true
          }
        }
      },
      {
        id: 'strange_bottle',
        name: 'Unusual Bottle',
        description: 'Among the liquor bottles behind the bar, one stands out - a blue bottle with strange symbols etched into the glass.',
        x: 450,
        y: 300,
        width: 40,
        height: 60,
        action: 'examine',
        onInteract: {
          message: 'The blue bottle contains a luminescent liquid that seems to move with a life of its own. The symbols etched into the glass are unfamiliar - flowing and organic in design. The bottle is sealed with wax bearing an impression of a crescent moon.',
          notification: {
            id: 'elixir_discovery',
            type: 'discovery',
            message: 'You\'ve found a bottle of strange liquid.',
            duration: 5000,
            autoDismiss: true
          }
        }
      }
    ],
    exits: [
      {
        id: 'to_village_square',
        name: 'Exit to Village Square',
        description: 'Return to the village square.',
        targetScene: 'village_square',
        x: 300,
        y: 450,
        width: 200,
        height: 80,
        condition: null
      },
      {
        id: 'to_tavern_cellar',
        name: 'Descend to Cellar',
        description: 'Climb down through the trapdoor into the tavern cellar.',
        targetScene: 'tavern_cellar',
        x: 420,
        y: 380,
        width: 80,
        height: 60,
        condition: {
          puzzle: 'cellar_lock',
          mustBeSolved: true
        }
      }
    ],
    items: [
      {
        id: 'strange_elixir',
        x: 450,
        y: 320,
        width: 20,
        height: 30,
        condition: {
          hotspot: 'strange_bottle',
          mustBeInteracted: true
        }
      }
    ]
  },
  
  // Town hall
  'town_hall': {
    id: 'town_hall',
    name: 'Eden\'s Hollow Town Hall',
    description: 'The imposing town hall building features a grand central chamber with high ceilings and faded murals. Rows of wooden benches face a raised platform where town officials would have presided. Papers are scattered everywhere, and there\'s a palpable sense of hasty abandonment.',
    background: '/assets/eden/scenes/town_hall.jpg',
    ambient: '/assets/eden/audio/ambient/low_rumble.mp3',
    hotspots: [
      {
        id: 'ritual_circle',
        name: 'Strange Floor Pattern',
        description: 'A circular pattern is inlaid into the floor before the raised platform. Several stone symbols lie scattered around it.',
        x: 300,
        y: 400,
        width: 150,
        height: 60,
        action: 'puzzle',
        puzzle: 'ritual_pattern'
      },
      {
        id: 'mural',
        name: 'Faded Mural',
        description: 'A large mural spans the wall behind the raised platform. It appears to depict the founding of Eden\'s Hollow.',
        x: 300,
        y: 200,
        width: 250,
        height: 120,
        action: 'examine',
        onInteract: {
          message: 'The mural shows settlers establishing the village near a pristine fountain. In the original painting, water flows from the fountain to nourish crops and sustain the people. However, someone has altered the mural - painting black tendrils emerging from the fountain and reaching toward the villagers. The modification appears recent.',
          notification: {
            id: 'mural_defacement',
            type: 'discovery',
            message: 'The town hall mural has been ominously altered.',
            duration: 5000,
            autoDismiss: true
          }
        }
      },
      {
        id: 'mayors_podium',
        name: 'Mayor\'s Podium',
        description: 'A wooden podium stands on the raised platform, where the mayor would have addressed the townspeople.',
        x: 300,
        y: 250,
        width: 80,
        height: 100,
        action: 'examine',
        onInteract: {
          message: 'The mayor\'s podium has papers still laid out upon it - the agenda for what appears to be the final town meeting. The last item reads "WATER CONTAMINATION - EMERGENCY MEASURES". Scrawled in the margin in frantic handwriting: "THEY KNOW I\'VE HIDDEN IT. THE FAITHFUL ARE COMING."',
          notification: {
            id: 'mayors_note',
            type: 'discovery',
            message: 'You\'ve found the mayor\'s disturbing notes.',
            duration: 5000,
            autoDismiss: true
          }
        }
      }
    ],
    exits: [
      {
        id: 'to_village_square',
        name: 'Exit to Village Square',
        description: 'Return to the village square.',
        targetScene: 'village_square',
        x: 300,
        y: 450,
        width: 200,
        height: 80,
        condition: null
      },
      {
        id: 'to_mayors_office',
        name: 'Enter Mayor\'s Office',
        description: 'A door to the side of the raised platform appears to lead to the mayor\'s office.',
        targetScene: 'mayors_office',
        x: 500,
        y: 300,
        width: 80,
        height: 140,
        condition: null
      },
      {
        id: 'to_secret_passage',
        name: 'Hidden Staircase',
        description: 'A staircase has appeared in the center of the ritual circle, descending into darkness.',
        targetScene: 'secret_passage',
        x: 300,
        y: 400,
        width: 150,
        height: 60,
        condition: {
          puzzle: 'ritual_pattern',
          mustBeSolved: true
        }
      }
    ],
    items: []
  }
};

export default scenes;