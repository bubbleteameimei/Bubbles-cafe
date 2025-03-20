import { Scene } from '../types';

/**
 * Game scenes/locations
 */
export const gameScenes: Record<string, Scene> = {
  forest_edge: {
    id: 'forest_edge',
    title: 'Forest Edge',
    description: 'A path winds through ancient trees toward Eden\'s Hollow. The village is shrouded in perpetual dusk, and a strange stillness hangs in the air.',
    backgroundImage: '/images/games/eden/forest_edge.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_village_square',
        name: 'Village Square',
        target: 'village_square',
        destination: 'Enter the village square',
        position: 'forward'
      }
    ],
    items: [
      {
        id: 'healing_herb',
        name: 'Healing Herb',
        position: 'ground'
      }
    ],
    events: [
      {
        id: 'welcome',
        trigger: 'enter',
        outcome: {
          notification: {
            id: 'welcome-message',
            message: 'Welcome to Eden\'s Hollow, a village trapped between worlds. Find the truth behind the eternal dusk and free the trapped spirits.',
            type: 'info'
          }
        }
      }
    ]
  },
  
  village_square: {
    id: 'village_square',
    title: 'Village Square',
    description: 'A once-bustling square now stands eerily empty. A dry fountain sits at its center, and fog drifts between abandoned market stalls. The clock tower ahead stands frozen at 3:17.',
    backgroundImage: '/images/games/eden/village_square.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_forest_edge',
        name: 'Forest Path',
        target: 'forest_edge',
        destination: 'Return to the forest edge',
        position: 'back'
      },
      {
        id: 'to_church',
        name: 'Village Church',
        target: 'church_exterior',
        destination: 'Approach the church',
        position: 'right'
      },
      {
        id: 'to_inn',
        name: 'Old Inn',
        target: 'inn_exterior',
        destination: 'Go to the abandoned inn',
        position: 'left'
      },
      {
        id: 'to_clock_tower',
        name: 'Clock Tower',
        target: 'clock_tower',
        destination: 'Examine the clock tower',
        position: 'forward'
      }
    ],
    characters: [
      {
        id: 'village_ghost',
        name: 'Ghostly Figure',
        position: 'near-fountain',
        dialog: 'village_ghost',
        isTalkable: true
      }
    ],
    actions: [
      {
        id: 'examine_fountain',
        name: 'Examine Fountain',
        outcome: {
          notification: {
            id: 'fountain-examination',
            message: 'The stone fountain is dry and cracked. Five small handprints are carved into its base, too small to belong to adults.',
            type: 'discovery'
          }
        }
      }
    ]
  },
  
  church_exterior: {
    id: 'church_exterior',
    title: 'Church Exterior',
    description: 'A weathered stone church looms before you. Its stained glass windows are intact but darkened, and the heavy wooden doors stand slightly ajar. Worn gravestones dot the churchyard.',
    backgroundImage: '/images/games/eden/church_exterior.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_village_square',
        name: 'Village Square',
        target: 'village_square',
        destination: 'Return to the village square',
        position: 'back'
      },
      {
        id: 'to_church_interior',
        name: 'Church Interior',
        target: 'church_interior',
        destination: 'Enter the church',
        position: 'forward'
      },
      {
        id: 'to_cemetery',
        name: 'Cemetery',
        target: 'cemetery',
        destination: 'Visit the cemetery',
        position: 'right'
      }
    ],
    actions: [
      {
        id: 'read_cornerstone',
        name: 'Read Cornerstone',
        outcome: {
          notification: {
            id: 'cornerstone-date',
            message: 'The cornerstone reads "ERECTED 1867 TO THE GLORY OF GOD"',
            type: 'info'
          }
        }
      }
    ]
  },
  
  church_interior: {
    id: 'church_interior',
    title: 'Church Interior',
    description: 'Rows of dusty pews face a modest altar. Despite the gloom outside, colorful light filters through the stained glass, depicting biblical scenes. Candles flicker impossibly in the still air.',
    backgroundImage: '/images/games/eden/church_interior.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_church_exterior',
        name: 'Church Exterior',
        target: 'church_exterior',
        destination: 'Exit the church',
        position: 'back'
      },
      {
        id: 'to_church_cellar',
        name: 'Church Cellar',
        target: 'church_cellar',
        destination: 'Descend to the cellar',
        position: 'down',
        isLocked: true,
        requiredItem: 'church_key'
      }
    ],
    characters: [
      {
        id: 'priest_ghost',
        name: 'Ghostly Priest',
        position: 'near-altar',
        dialog: 'church_priest',
        isTalkable: true
      }
    ],
    items: [
      {
        id: 'ritual_candle',
        name: 'Ritual Candle',
        position: 'altar',
        requiredStatus: { priest_helped: true }
      }
    ],
    actions: [
      {
        id: 'examine_murals',
        name: 'Examine Wall Murals',
        outcome: {
          notification: {
            id: 'mural-discovery',
            message: 'Behind layers of dust, you discover a mural depicting five children standing in a circle around a brilliant light. Their faces are serene, but shadowy figures lurk at the painting's edges.',
            type: 'discovery'
          }
        }
      }
    ]
  },
  
  church_cellar: {
    id: 'church_cellar',
    title: 'Church Cellar',
    description: 'A damp stone cellar stretches beneath the church. At its center lies a circular stone platform with five equidistant markings. Ancient symbols are carved into the walls and floor.',
    backgroundImage: '/images/games/eden/church_cellar.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_church_interior',
        name: 'Church Interior',
        target: 'church_interior',
        destination: 'Return upstairs',
        position: 'up'
      }
    ],
    actions: [
      {
        id: 'examine_ritual_circle',
        name: 'Examine Ritual Circle',
        outcome: {
          notification: {
            id: 'ritual-circle-discovery',
            message: 'Five stone pedestals are arranged in a perfect circle. Each has a small symbol carved into it: a flame, a drop of water, a leaf, a spiral, and a simple star.',
            type: 'discovery'
          }
        }
      },
      {
        id: 'perform_ritual',
        name: 'Perform Ritual',
        outcome: {
          puzzle: 'ritual_puzzle',
          status: { attempted_ritual: true }
        }
      }
    ]
  },
  
  cemetery: {
    id: 'cemetery',
    title: 'Cemetery',
    description: 'Weathered gravestones stand in silent rows. Five small graves with identical markers are arranged in a semi-circle, set apart from the others. A low mist clings to the ground.',
    backgroundImage: '/images/games/eden/cemetery.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_church_exterior',
        name: 'Church Exterior',
        target: 'church_exterior',
        destination: 'Return to the church',
        position: 'back'
      }
    ],
    items: [
      {
        id: 'strange_amulet',
        name: 'Strange Amulet',
        position: 'buried',
        isHidden: true,
        requiredStatus: { graves_examined: true }
      }
    ],
    actions: [
      {
        id: 'examine_child_graves',
        name: 'Examine Children\'s Graves',
        outcome: {
          status: { graves_examined: true },
          notification: {
            id: 'child-graves',
            message: 'Five small gravestones bear the names: Emma Caldwell (12), Thomas Wilson (10), William Bennett (9), Lucy Davis (7), and Sarah Mitchell (6). All died on October 31, 1891. As you brush dirt from Sarah\'s grave, you notice something buried shallowly nearby.',
            type: 'discovery'
          }
        }
      }
    ]
  },
  
  inn_exterior: {
    id: 'inn_exterior',
    title: 'Old Inn Exterior',
    description: 'The Wayfarer\'s Rest inn stands three stories tall, its windows dark and shutters hanging loose. The once-welcoming sign now creaks in the gentle, unending breeze.',
    backgroundImage: '/images/games/eden/inn_exterior.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_village_square',
        name: 'Village Square',
        target: 'village_square',
        destination: 'Return to the village square',
        position: 'back'
      },
      {
        id: 'to_inn_interior',
        name: 'Inn Interior',
        target: 'inn_interior',
        destination: 'Enter the inn',
        position: 'forward',
        isLocked: true,
        requiredItem: 'rusty_key'
      }
    ],
    items: [
      {
        id: 'rusty_key',
        name: 'Rusty Key',
        position: 'doorstep',
        isHidden: true,
        requiredStatus: { doorstep_checked: true }
      }
    ],
    actions: [
      {
        id: 'check_doorstep',
        name: 'Check Doorstep',
        outcome: {
          status: { doorstep_checked: true },
          notification: {
            id: 'key-found',
            message: 'Among the dirt and debris on the doorstep, you spot an old rusty key half-buried.',
            type: 'discovery'
          }
        }
      }
    ]
  },
  
  inn_interior: {
    id: 'inn_interior',
    title: 'Inn Interior',
    description: 'Dust covers the abandoned bar and tables. Chairs remain pulled out as if the occupants just stepped away. A grand staircase leads to the upper floors, and a cold fireplace dominates one wall.',
    backgroundImage: '/images/games/eden/inn_interior.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_inn_exterior',
        name: 'Inn Exterior',
        target: 'inn_exterior',
        destination: 'Exit the inn',
        position: 'back'
      },
      {
        id: 'to_inn_rooms',
        name: 'Upstairs Rooms',
        target: 'inn_rooms',
        destination: 'Climb the stairs',
        position: 'up'
      }
    ],
    characters: [
      {
        id: 'ghostly_innkeeper',
        name: 'Ghostly Innkeeper',
        position: 'behind-bar',
        dialog: 'innkeeper'
      }
    ],
    actions: [
      {
        id: 'examine_guestbook',
        name: 'Examine Guestbook',
        outcome: {
          notification: {
            id: 'guestbook-discovery',
            message: 'The guestbook's last entry is dated October 30, 1891: "Dr. A. Reynolds - Here to document the village's affliction and offer medical assistance."',
            type: 'discovery'
          }
        }
      }
    ]
  },
  
  inn_rooms: {
    id: 'inn_rooms',
    title: 'Inn Upper Floor',
    description: 'A long hallway stretches with doors on either side. Room 5 at the end has its door slightly ajar, and a cold draft emanates from within.',
    backgroundImage: '/images/games/eden/inn_rooms.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_inn_interior',
        name: 'Inn Ground Floor',
        target: 'inn_interior',
        destination: 'Return downstairs',
        position: 'down'
      },
      {
        id: 'to_room_five',
        name: 'Room 5',
        target: 'room_five',
        destination: 'Enter Room 5',
        position: 'forward'
      }
    ]
  },
  
  room_five: {
    id: 'room_five',
    title: 'Room 5',
    description: 'This room appears to have belonged to a researcher or scholar. Papers are scattered across a desk, and bookshelves line one wall. A small bed remains unmade, as if its occupant left in a hurry.',
    backgroundImage: '/images/games/eden/room_five.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_inn_rooms',
        name: 'Hallway',
        target: 'inn_rooms',
        destination: 'Return to the hallway',
        position: 'back'
      }
    ],
    items: [
      {
        id: 'ancient_journal',
        name: 'Ancient Journal',
        position: 'desk'
      },
      {
        id: 'old_photograph',
        name: 'Old Photograph',
        position: 'drawer',
        isHidden: true,
        requiredStatus: { desk_searched: true }
      }
    ],
    actions: [
      {
        id: 'search_desk',
        name: 'Search Desk',
        outcome: {
          status: { desk_searched: true },
          notification: {
            id: 'desk-search',
            message: 'Among scattered research papers on folk rituals and supernatural phenomena, you find a drawer containing an old photograph of five children.',
            type: 'discovery'
          }
        }
      }
    ]
  },
  
  clock_tower: {
    id: 'clock_tower',
    title: 'Clock Tower',
    description: 'The village's clock tower looms above you. Inside, the massive mechanism sits frozen, its gears and pendulum motionless. The hands are stopped at precisely 3:17.',
    backgroundImage: '/images/games/eden/clock_tower.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_village_square',
        name: 'Village Square',
        target: 'village_square',
        destination: 'Return to the village square',
        position: 'back'
      }
    ],
    items: [
      {
        id: 'silver_mirror',
        name: 'Silver Mirror',
        position: 'mechanism',
        isHidden: true,
        requiredStatus: { clock_fixed: true }
      }
    ],
    actions: [
      {
        id: 'examine_clock',
        name: 'Examine Clock Mechanism',
        outcome: {
          puzzle: 'clock_puzzle',
          notification: {
            id: 'clock-examination',
            message: 'The clock mechanism is beautifully crafted but completely seized. A panel on the side suggests it can be adjusted manually.',
            type: 'info'
          }
        }
      }
    ]
  }
};