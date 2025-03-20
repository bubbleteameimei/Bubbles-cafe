import { Scene } from '../types';

// Game scenes collection
export const gameScenes: Record<string, Scene> = {
  forest_edge: {
    id: 'forest_edge',
    title: 'Edge of the Forest',
    description: 'A dense fog hangs between the ancient trees. The path behind you has mysteriously vanished, leaving only a dark trail leading deeper into the forest toward Eden\'s Hollow.',
    backgroundImage: '/images/eden/scenes/forest_edge.jpg',
    time: 'dusk',
    ambientSound: 'forest_ambience',
    exits: [
      {
        id: 'to_forest_path',
        name: 'Forest Path',
        target: 'forest_path',
        destination: 'forest_path', // Added destination property to match SceneExit interface
        position: 'north'
      }
    ],
    items: [
      {
        id: 'rusty_key',
        name: 'Rusty Key',
        position: 'bottom-left',
        isHidden: false
      }
    ],
    actions: [
      {
        id: 'examine_trees',
        name: 'Examine the trees',
        outcome: {
          notification: {
            id: 'tree_observation',
            message: 'The trees seem unnaturally twisted, with bark patterns that almost resemble faces in certain light.',
            type: 'info'
          }
        }
      },
      {
        id: 'listen_carefully',
        name: 'Listen carefully',
        outcome: {
          notification: {
            id: 'forest_sounds',
            message: 'The forest is eerily quiet. No birds, no insects - just the occasional rustle of leaves, even though there is no wind.',
            type: 'info'
          }
        }
      }
    ]
  },
  
  forest_path: {
    id: 'forest_path',
    title: 'Winding Forest Path',
    description: 'The narrow path twists through the dark forest. Strange symbols have been carved into some of the trees. An abandoned campsite lies off to one side.',
    backgroundImage: '/images/eden/scenes/forest_path.jpg',
    time: 'dusk',
    ambientSound: 'forest_ambience',
    exits: [
      {
        id: 'to_forest_edge',
        name: 'Back to Forest Edge',
        target: 'forest_edge',
        destination: 'forest_edge', // Added destination property
        position: 'south'
      },
      {
        id: 'to_abandoned_camp',
        name: 'Abandoned Camp',
        target: 'abandoned_camp',
        destination: 'abandoned_camp', // Added destination property
        position: 'east'
      },
      {
        id: 'to_hollow_entrance',
        name: 'Path to Village',
        target: 'hollow_entrance',
        destination: 'hollow_entrance', // Added destination property
        position: 'north'
      }
    ],
    items: [
      {
        id: 'strange_coin',
        name: 'Strange Coin',
        position: 'bottom-right',
        isHidden: true,
        requiresStatus: 'examined_symbols'
      }
    ],
    puzzles: [
      {
        id: 'tree_symbols',
        name: 'Strange Tree Symbols',
        position: 'wall',
        description: 'Unusual symbols have been carved into the bark of several trees.'
      }
    ],
    actions: [
      {
        id: 'examine_symbols',
        name: 'Examine the symbols',
        outcome: {
          puzzle: 'tree_symbols',
          status: { 'examined_symbols': true }
        }
      }
    ]
  },
  
  abandoned_camp: {
    id: 'abandoned_camp',
    title: 'Abandoned Campsite',
    description: 'A small campsite that appears to have been hastily abandoned. A tent lies collapsed, and personal belongings are scattered about. A cold fire pit sits in the center.',
    backgroundImage: '/images/eden/scenes/abandoned_camp.jpg',
    time: 'dusk',
    ambientSound: 'forest_ambience',
    exits: [
      {
        id: 'to_forest_path',
        name: 'Back to Forest Path',
        target: 'forest_path',
        destination: 'forest_path', // Added destination property
        position: 'west'
      }
    ],
    items: [
      {
        id: 'old_journal',
        name: 'Weathered Journal',
        position: 'center',
        isHidden: false
      },
      {
        id: 'lantern',
        name: 'Oil Lantern',
        position: 'bottom-right',
        isHidden: false
      }
    ],
    actions: [
      {
        id: 'search_tent',
        name: 'Search the tent',
        outcome: {
          notification: {
            id: 'tent_search',
            message: 'Inside the tent, you find a sleeping bag and some personal belongings. There are signs of a struggle.',
            type: 'info'
          }
        }
      },
      {
        id: 'examine_fire_pit',
        name: 'Examine the fire pit',
        outcome: {
          notification: {
            id: 'fire_pit',
            message: 'The fire has been out for a while, but some of the ashes seem unusual - they form patterns that couldn\'t have occurred naturally.',
            type: 'warning'
          }
        }
      }
    ]
  },
  
  hollow_entrance: {
    id: 'hollow_entrance',
    title: 'Eden\'s Hollow Entrance',
    description: 'The path opens to reveal the small, foggy village of Eden\'s Hollow. Old Victorian houses line the cobblestone street. Most windows are dark, but a single lantern burns outside what appears to be an inn.',
    backgroundImage: '/images/eden/scenes/hollow_entrance.jpg',
    time: 'night',
    ambientSound: 'village_night',
    exits: [
      {
        id: 'to_forest_path',
        name: 'Back to Forest Path',
        target: 'forest_path',
        destination: 'forest_path', // Added destination property
        position: 'south'
      },
      {
        id: 'to_village_square',
        name: 'Village Square',
        target: 'village_square',
        destination: 'village_square', // Added destination property
        position: 'north'
      },
      {
        id: 'to_inn',
        name: 'Old Inn',
        target: 'inn_exterior',
        destination: 'inn_exterior', // Added destination property
        position: 'east'
      }
    ],
    characters: [
      {
        id: 'mysterious_stranger',
        name: 'Mysterious Stranger',
        image: '/images/eden/characters/stranger.jpg',
        position: 'foreground',
        dialog: 'stranger_greeting'
      }
    ],
    actions: [
      {
        id: 'observe_houses',
        name: 'Observe the houses',
        outcome: {
          notification: {
            id: 'houses_observation',
            message: 'The houses have an odd, abandoned feel to them, yet you sense you are being watched from behind the curtains.',
            type: 'warning'
          }
        }
      }
    ]
  },
  
  village_square: {
    id: 'village_square',
    title: 'Village Square',
    description: 'The heart of Eden\'s Hollow - a cobblestone square with an old fountain at its center. The water in the fountain is murky and still. Strange statues line the perimeter, their features worn by time.',
    backgroundImage: '/images/eden/scenes/village_square.jpg',
    time: 'night',
    ambientSound: 'village_night',
    exits: [
      {
        id: 'to_hollow_entrance',
        name: 'Village Entrance',
        target: 'hollow_entrance',
        destination: 'hollow_entrance', // Added destination property
        position: 'south'
      },
      {
        id: 'to_church',
        name: 'Old Church',
        target: 'church_exterior',
        destination: 'church_exterior', // Added destination property
        position: 'north'
      },
      {
        id: 'to_town_hall',
        name: 'Town Hall',
        target: 'town_hall_exterior',
        destination: 'town_hall_exterior', // Added destination property
        position: 'east'
      },
      {
        id: 'to_abandoned_shop',
        name: 'Abandoned Shop',
        target: 'abandoned_shop',
        destination: 'abandoned_shop', // Added destination property
        position: 'west'
      }
    ],
    puzzles: [
      {
        id: 'fountain_puzzle',
        name: 'Mysterious Fountain',
        position: 'center',
        description: 'An ornate fountain with strange symbols carved around its rim.'
      }
    ],
    items: [
      {
        id: 'strange_amulet',
        name: 'Strange Amulet',
        position: 'bottom-right',
        isHidden: true,
        requiresStatus: 'fountain_solved'
      }
    ],
    actions: [
      {
        id: 'examine_fountain',
        name: 'Examine the fountain',
        outcome: {
          puzzle: 'fountain_puzzle'
        }
      },
      {
        id: 'examine_statues',
        name: 'Examine the statues',
        outcome: {
          notification: {
            id: 'statues_observation',
            message: 'The statues depict people with expressions of terror. Upon closer inspection, they almost look too realistic...',
            type: 'warning'
          }
        }
      }
    ]
  }
};