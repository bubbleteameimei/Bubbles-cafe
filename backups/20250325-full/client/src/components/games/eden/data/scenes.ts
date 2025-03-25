import { Scene } from '../types';

/**
 * Eden's Hollow Scenes Data
 * Defines all explorable locations in the game
 */

const scenes: Record<string, Scene> = {
  // Starting area
  'village_entrance': {
    id: 'village_entrance',
    name: "Village Entrance",
    description: "A dilapidated wooden sign reading 'Eden's Hollow' creaks in the wind. The village lies before you, shrouded in mist.",
    background: '/assets/eden/scenes/village_entrance.jpg',
    lighting: 'fog',
    hotspots: [
      {
        id: 'village_sign',
        name: "Village Sign",
        description: "An old, weather-worn sign with faded lettering. Some of the text is still legible.",
        x: 120,
        y: 150,
        width: 100,
        height: 50,
        interaction: {
          type: 'dialog',
          targetId: 'village_sign_dialog'
        }
      },
      {
        id: 'strange_markings',
        name: "Strange Markings",
        description: "Unusual symbols have been etched into a nearby tree.",
        x: 350,
        y: 200,
        width: 40,
        height: 80,
        interaction: {
          type: 'dialog',
          targetId: 'strange_markings_dialog'
        }
      },
      {
        id: 'old_lantern',
        name: "Old Lantern",
        description: "A rusty lantern hanging from a post. It could still work if lit.",
        x: 80,
        y: 300,
        width: 50,
        height: 70,
        interaction: {
          type: 'item',
          targetId: 'old_lantern_interaction'
        },
        condition: 'hasItem("matches")'
      }
    ],
    exits: [
      {
        id: 'to_village_square',
        name: "Village Square",
        description: "The path leads deeper into the village toward what appears to be a central square.",
        targetScene: 'village_square',
        position: {
          x: 400,
          y: 350,
          width: 200,
          height: 80
        }
      }
    ],
    items: [
      {
        id: 'matches',
        x: 200,
        y: 400,
        width: 30,
        height: 30
      }
    ],
    triggers: [
      {
        id: 'entrance_welcome',
        type: 'dialog',
        targetId: 'mysterious_voice_welcome',
        condition: 'true',
        oneTime: true
      }
    ]
  },
  
  // Main village hub
  'village_square': {
    id: 'village_square',
    name: "Village Square",
    description: "A once-bustling village square now stands eerily empty. Abandoned market stalls and debris litter the cobblestone ground.",
    background: '/assets/eden/scenes/village_square.jpg',
    lighting: 'normal',
    hotspots: [
      {
        id: 'dry_fountain',
        name: "Dry Fountain",
        description: "A stone fountain in the center of the square. It's basin is dry and cracked, with strange symbols carved around its rim.",
        x: 350,
        y: 250,
        width: 120,
        height: 100,
        interaction: {
          type: 'dialog',
          targetId: 'fountain_dialog'
        }
      },
      {
        id: 'market_stall',
        name: "Abandoned Market Stall",
        description: "A derelict market stall with torn awning. Some items might be salvageable.",
        x: 150,
        y: 300,
        width: 100,
        height: 80,
        interaction: {
          type: 'item',
          targetId: 'market_stall_search'
        }
      },
      {
        id: 'strange_symbol',
        name: "Blood Symbol",
        description: "A disturbing symbol painted in what looks like dried blood on the cobblestones.",
        x: 500,
        y: 400,
        width: 60,
        height: 40,
        interaction: {
          type: 'puzzle',
          targetId: 'blood_symbol_puzzle'
        }
      }
    ],
    exits: [
      {
        id: 'to_village_entrance',
        name: "Village Entrance",
        description: "The path back to the village entrance.",
        targetScene: 'village_entrance',
        position: {
          x: 50,
          y: 350,
          width: 100,
          height: 80
        }
      },
      {
        id: 'to_church',
        name: "Old Church",
        description: "A path leading to an ominous church on the hill.",
        targetScene: 'church_exterior',
        position: {
          x: 600,
          y: 200,
          width: 150,
          height: 100
        }
      },
      {
        id: 'to_abandoned_house',
        name: "Abandoned House",
        description: "A narrow alley leading to a decrepit house.",
        targetScene: 'abandoned_house_exterior',
        position: {
          x: 300,
          y: 100,
          width: 120,
          height: 80
        }
      },
      {
        id: 'to_old_well',
        name: "Old Well",
        description: "A side path leading to the village well.",
        targetScene: 'old_well',
        position: {
          x: 480,
          y: 150,
          width: 80,
          height: 60
        }
      }
    ],
    items: [
      {
        id: 'torn_journal',
        x: 200,
        y: 350,
        width: 40,
        height: 30,
        condition: 'hasInteractedWith("market_stall")'
      }
    ]
  },
  
  // Abandoned house area
  'abandoned_house_exterior': {
    id: 'abandoned_house_exterior',
    name: "Abandoned House",
    description: "A dilapidated two-story house with boarded windows and a sagging roof. The front door is ajar.",
    background: '/assets/eden/scenes/abandoned_house_exterior.jpg',
    lighting: 'normal',
    hotspots: [
      {
        id: 'broken_window',
        name: "Broken Window",
        description: "A shattered window with jagged glass still in the frame. Something glints inside.",
        x: 200,
        y: 200,
        width: 80,
        height: 100,
        interaction: {
          type: 'dialog',
          targetId: 'broken_window_dialog'
        }
      },
      {
        id: 'strange_doll',
        name: "Strange Doll",
        description: "A weathered doll propped against the front steps. Its eyes seem to follow you.",
        x: 350,
        y: 400,
        width: 50,
        height: 60,
        interaction: {
          type: 'dialog',
          targetId: 'strange_doll_dialog'
        }
      }
    ],
    exits: [
      {
        id: 'to_village_square',
        name: "Village Square",
        description: "The path back to the village square.",
        targetScene: 'village_square',
        position: {
          x: 50,
          y: 350,
          width: 100,
          height: 80
        }
      },
      {
        id: 'to_house_interior',
        name: "House Interior",
        description: "Enter the abandoned house. The door creaks as it sways in the breeze.",
        targetScene: 'abandoned_house_interior',
        position: {
          x: 400,
          y: 300,
          width: 80,
          height: 150
        }
      }
    ]
  },
  
  'abandoned_house_interior': {
    id: 'abandoned_house_interior',
    name: "House Interior",
    description: "The inside of the house is dark and musty. Furniture lies toppled and a thick layer of dust covers everything.",
    background: '/assets/eden/scenes/abandoned_house_interior.jpg',
    lighting: 'dark',
    hotspots: [
      {
        id: 'dusty_bookshelf',
        name: "Dusty Bookshelf",
        description: "A bookshelf with weathered tomes. Many have rotted, but some might still be readable.",
        x: 150,
        y: 200,
        width: 100,
        height: 150,
        interaction: {
          type: 'dialog',
          targetId: 'bookshelf_dialog'
        }
      },
      {
        id: 'strange_painting',
        name: "Unsettling Painting",
        description: "A portrait where the eyes seem to follow your movements across the room.",
        x: 400,
        y: 150,
        width: 80,
        height: 100,
        interaction: {
          type: 'puzzle',
          targetId: 'painting_puzzle'
        }
      },
      {
        id: 'cellar_door',
        name: "Cellar Door",
        description: "A heavy trap door in the floor. It appears to be locked.",
        x: 300,
        y: 400,
        width: 120,
        height: 50,
        interaction: {
          type: 'dialog',
          targetId: 'locked_cellar_dialog'
        },
        condition: '!hasItem("cellar_key")'
      },
      {
        id: 'cellar_door_unlocked',
        name: "Cellar Door (Unlocked)",
        description: "The cellar door, now unlocked with the key you found.",
        x: 300,
        y: 400,
        width: 120,
        height: 50,
        interaction: {
          type: 'dialog',
          targetId: 'open_cellar_dialog'
        },
        condition: 'hasItem("cellar_key")'
      }
    ],
    exits: [
      {
        id: 'to_house_exterior',
        name: "House Exterior",
        description: "Exit back to outside the house.",
        targetScene: 'abandoned_house_exterior',
        position: {
          x: 50,
          y: 350,
          width: 100,
          height: 80
        }
      },
      {
        id: 'to_cellar',
        name: "Cellar",
        description: "Descend into the dark cellar.",
        targetScene: 'house_cellar',
        position: {
          x: 300,
          y: 400,
          width: 120,
          height: 50
        },
        locked: true,
        keyId: 'cellar_key'
      }
    ],
    items: [
      {
        id: 'old_candle',
        x: 200,
        y: 300,
        width: 30,
        height: 40
      }
    ]
  },
  
  'house_cellar': {
    id: 'house_cellar',
    name: "House Cellar",
    description: "A damp, musty cellar with stone walls. Strange symbols are etched into the floor and walls.",
    background: '/assets/eden/scenes/house_cellar.jpg',
    lighting: 'dark',
    hotspots: [
      {
        id: 'ritual_circle',
        name: "Ritual Circle",
        description: "A circle of arcane symbols drawn on the floor in what appears to be dried blood.",
        x: 300,
        y: 350,
        width: 200,
        height: 200,
        interaction: {
          type: 'dialog',
          targetId: 'ritual_circle_dialog'
        }
      },
      {
        id: 'strange_altar',
        name: "Strange Altar",
        description: "A small stone altar with dark stains and ceremonial items.",
        x: 450,
        y: 250,
        width: 100,
        height: 80,
        interaction: {
          type: 'puzzle',
          targetId: 'altar_puzzle'
        }
      },
      {
        id: 'crumbling_wall',
        name: "Crumbling Wall",
        description: "Part of the wall has begun to crumble, revealing something behind it.",
        x: 150,
        y: 200,
        width: 80,
        height: 120,
        interaction: {
          type: 'item',
          targetId: 'wall_secret'
        },
        condition: 'hasItem("crowbar")'
      }
    ],
    exits: [
      {
        id: 'to_house_interior',
        name: "House Interior",
        description: "Climb back up to the house interior.",
        targetScene: 'abandoned_house_interior',
        position: {
          x: 50,
          y: 150,
          width: 100,
          height: 80
        }
      }
    ],
    items: [
      {
        id: 'ritual_dagger',
        x: 450,
        y: 250,
        width: 40,
        height: 30,
        condition: 'hasCompletedPuzzle("altar_puzzle")'
      },
      {
        id: 'strange_amulet',
        x: 150,
        y: 240,
        width: 30,
        height: 30,
        condition: 'hasInteractedWith("crumbling_wall")'
      }
    ]
  },
  
  // Church area
  'church_exterior': {
    id: 'church_exterior',
    name: "Church Exterior",
    description: "A Gothic church looms against the darkened sky. Its spire pierces the low-hanging clouds and a sense of dread permeates the air.",
    background: '/assets/eden/scenes/church_exterior.jpg',
    lighting: 'normal',
    hotspots: [
      {
        id: 'graveyard',
        name: "Graveyard",
        description: "A small, neglected graveyard with tilted headstones and overgrown weeds.",
        x: 150,
        y: 300,
        width: 200,
        height: 150,
        interaction: {
          type: 'dialog',
          targetId: 'graveyard_dialog'
        }
      },
      {
        id: 'church_door',
        name: "Church Door",
        description: "A heavy wooden door with iron fixtures. It appears to be locked.",
        x: 400,
        y: 250,
        width: 100,
        height: 150,
        interaction: {
          type: 'dialog',
          targetId: 'locked_church_dialog'
        },
        condition: '!hasItem("church_key")'
      },
      {
        id: 'church_door_unlocked',
        name: "Church Door (Unlocked)",
        description: "The church door, now unlocked with the key you found.",
        x: 400,
        y: 250,
        width: 100,
        height: 150,
        interaction: {
          type: 'dialog',
          targetId: 'open_church_dialog'
        },
        condition: 'hasItem("church_key")'
      }
    ],
    exits: [
      {
        id: 'to_village_square',
        name: "Village Square",
        description: "The path back to the village square.",
        targetScene: 'village_square',
        position: {
          x: 50,
          y: 350,
          width: 100,
          height: 80
        }
      },
      {
        id: 'to_church_interior',
        name: "Church Interior",
        description: "Enter the church through the heavy wooden doors.",
        targetScene: 'church_interior',
        position: {
          x: 400,
          y: 250,
          width: 100,
          height: 150
        },
        locked: true,
        keyId: 'church_key'
      }
    ],
    items: [
      {
        id: 'wilted_flower',
        x: 250,
        y: 350,
        width: 30,
        height: 30
      }
    ]
  },
  
  'church_interior': {
    id: 'church_interior',
    name: "Church Interior",
    description: "The inside of the church is dimly lit by stained glass windows. Rows of pews face a stone altar at the front.",
    background: '/assets/eden/scenes/church_interior.jpg',
    lighting: 'dark',
    hotspots: [
      {
        id: 'church_altar',
        name: "Stone Altar",
        description: "A large stone altar with strange carvings and dark stains.",
        x: 400,
        y: 200,
        width: 150,
        height: 100,
        interaction: {
          type: 'puzzle',
          targetId: 'church_altar_puzzle'
        }
      },
      {
        id: 'broken_pew',
        name: "Broken Pew",
        description: "A wooden pew that has been shattered. Something is lodged underneath.",
        x: 200,
        y: 300,
        width: 120,
        height: 60,
        interaction: {
          type: 'item',
          targetId: 'broken_pew_search'
        }
      },
      {
        id: 'confessional',
        name: "Confessional Booth",
        description: "A wooden confessional booth with torn curtains. A faint whisper seems to emanate from within.",
        x: 100,
        y: 200,
        width: 80,
        height: 150,
        interaction: {
          type: 'dialog',
          targetId: 'confessional_dialog'
        }
      }
    ],
    exits: [
      {
        id: 'to_church_exterior',
        name: "Church Exterior",
        description: "Exit back to outside the church.",
        targetScene: 'church_exterior',
        position: {
          x: 50,
          y: 350,
          width: 100,
          height: 80
        }
      },
      {
        id: 'to_church_crypt',
        name: "Church Crypt",
        description: "A dark stairway leading down to the church crypt.",
        targetScene: 'church_crypt',
        position: {
          x: 500,
          y: 400,
          width: 100,
          height: 60
        },
        condition: 'hasCompletedPuzzle("church_altar_puzzle")'
      }
    ],
    items: [
      {
        id: 'church_candle',
        x: 350,
        y: 220,
        width: 20,
        height: 40
      }
    ]
  },
  
  // Old well area
  'old_well': {
    id: 'old_well',
    name: "Old Well",
    description: "A stone well with moss-covered walls. The water within appears unnaturally still and reflective.",
    background: '/assets/eden/scenes/old_well.jpg',
    lighting: 'normal',
    hotspots: [
      {
        id: 'well_water',
        name: "Well Water",
        description: "The water in the well is crystal clear despite the well's age. It reflects your face perfectly.",
        x: 300,
        y: 250,
        width: 100,
        height: 100,
        interaction: {
          type: 'dialog',
          targetId: 'well_water_dialog'
        }
      },
      {
        id: 'well_bucket',
        name: "Old Bucket",
        description: "A wooden bucket attached to a fraying rope. It could still be used to draw water.",
        x: 400,
        y: 200,
        width: 60,
        height: 80,
        interaction: {
          type: 'item',
          targetId: 'well_bucket_interaction'
        },
        condition: 'hasItem("empty_bottle")'
      },
      {
        id: 'carvings',
        name: "Ancient Carvings",
        description: "Weathered carvings on the stone rim of the well. They depict strange symbols and figures.",
        x: 200,
        y: 300,
        width: 80,
        height: 40,
        interaction: {
          type: 'puzzle',
          targetId: 'well_carvings_puzzle'
        }
      }
    ],
    exits: [
      {
        id: 'to_village_square',
        name: "Village Square",
        description: "The path back to the village square.",
        targetScene: 'village_square',
        position: {
          x: 50,
          y: 350,
          width: 100,
          height: 80
        }
      }
    ],
    items: [
      {
        id: 'rusty_key',
        x: 250,
        y: 380,
        width: 30,
        height: 20
      }
    ]
  }
};

export default scenes;