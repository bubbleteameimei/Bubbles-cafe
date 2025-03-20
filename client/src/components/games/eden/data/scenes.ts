import { Scene } from '../types';

/**
 * Scenes/locations in Eden's Hollow
 */
export const gameScenes: Record<string, Scene> = {
  forest_edge: {
    id: 'forest_edge',
    title: 'Forest Edge',
    description: 'The edge of a dense, misty forest. A dirt path leads toward a village in the distance.',
    backgroundImage: 'forest_edge.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_village_entrance',
        name: 'To Village',
        target: 'village_entrance',
        destination: 'Village Entrance',
        position: 'east'
      }
    ],
    actions: [
      {
        id: 'look_around',
        name: 'Look Around',
        outcome: {
          notification: {
            id: 'forest-look',
            message: 'You scan the dense trees. Something feels off about this place...',
            type: 'info'
          }
        }
      }
    ]
  },
  village_entrance: {
    id: 'village_entrance',
    title: 'Village Entrance',
    description: 'A weathered sign reads "Eden\'s Hollow". The village looks abandoned, with dilapidated buildings.',
    backgroundImage: 'village_entrance.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_forest_edge',
        name: 'Back to Forest',
        target: 'forest_edge',
        destination: 'Forest Edge',
        position: 'west'
      },
      {
        id: 'to_village_square',
        name: 'Village Square',
        target: 'village_square',
        destination: 'Village Square',
        position: 'north'
      }
    ]
  },
  village_square: {
    id: 'village_square',
    title: 'Village Square',
    description: 'The central square is empty and eerily quiet. A broken fountain stands in the center.',
    backgroundImage: 'village_square.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_village_entrance',
        name: 'Village Entrance',
        target: 'village_entrance',
        destination: 'Village Entrance',
        position: 'south'
      },
      {
        id: 'to_church_exterior',
        name: 'To Church',
        target: 'church_exterior',
        destination: 'Church',
        position: 'east'
      },
      {
        id: 'to_clock_tower',
        name: 'To Clock Tower',
        target: 'clock_tower',
        destination: 'Clock Tower',
        position: 'north'
      }
    ]
  },
  church_exterior: {
    id: 'church_exterior',
    title: 'Church Exterior',
    description: 'An old stone church with boarded windows and a heavy oak door. The steeple is missing its cross.',
    backgroundImage: 'church_exterior.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_village_square',
        name: 'To Village Square',
        target: 'village_square',
        destination: 'Village Square',
        position: 'west'
      },
      {
        id: 'to_church_interior',
        name: 'Enter Church',
        target: 'church_interior',
        destination: 'Church Interior',
        position: 'north'
      }
    ]
  },
  church_interior: {
    id: 'church_interior',
    title: 'Church Interior',
    description: 'Rows of broken pews face an altar. Strange symbols are carved into the stone walls.',
    backgroundImage: 'church_interior.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_church_exterior',
        name: 'Exit Church',
        target: 'church_exterior',
        destination: 'Church Exterior',
        position: 'south'
      }
    ],
    actions: [
      {
        id: 'examine_altar',
        name: 'Examine Altar',
        outcome: {
          notification: {
            id: 'altar-examine',
            message: 'The altar has five symbols arranged in a circle: a Moon, Star, Sun, Tree, and Flame.',
            type: 'info'
          },
          puzzle: 'altar_puzzle'
        }
      }
    ]
  },
  clock_tower: {
    id: 'clock_tower',
    title: 'Clock Tower',
    description: 'The village clock tower. Its hands are frozen at 3:17.',
    backgroundImage: 'clock_tower.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_village_square',
        name: 'To Village Square',
        target: 'village_square',
        destination: 'Village Square',
        position: 'south'
      }
    ],
    actions: [
      {
        id: 'check_mechanism',
        name: 'Check Mechanism',
        outcome: {
          notification: {
            id: 'clock-check',
            message: 'The clock mechanism appears to be intact. Perhaps it can be restarted...',
            type: 'info'
          },
          puzzle: 'clock_puzzle'
        }
      }
    ]
  },
  inn_exterior: {
    id: 'inn_exterior',
    title: 'Abandoned Inn',
    description: 'The village inn - "The Sleeping Crow" - stands dark and abandoned.',
    backgroundImage: 'inn_exterior.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_village_square',
        name: 'To Village Square',
        target: 'village_square',
        destination: 'Village Square',
        position: 'north'
      },
      {
        id: 'to_inn_interior',
        name: 'Enter Inn',
        target: 'inn_interior',
        destination: 'Inn Interior',
        position: 'south',
        isLocked: true,
        requiredItem: 'rusty_key'
      }
    ],
    items: [
      {
        id: 'rusty_key',
        name: 'Rusty Key',
        position: 'left:20%,top:70%',
        isHidden: false
      }
    ]
  },
  cemetery: {
    id: 'cemetery',
    title: 'Old Cemetery',
    description: 'Rows of weathered gravestones sit behind the church. Five small graves are arranged in a circle.',
    backgroundImage: 'cemetery.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_church_exterior',
        name: 'Back to Church',
        target: 'church_exterior',
        destination: 'Church Exterior',
        position: 'west'
      }
    ],
    items: [
      {
        id: 'strange_amulet',
        name: 'Strange Amulet',
        position: 'left:50%,top:60%',
        isHidden: true,
        requiredStatus: {
          all_graves_read: true
        }
      }
    ],
    actions: [
      {
        id: 'read_gravestones',
        name: 'Read Gravestones',
        outcome: {
          notification: {
            id: 'graves-read',
            message: 'The five small graves belong to children who died in 1891. Their names are: Emma, Thomas, Sarah, William, and Lucy.',
            type: 'info'
          },
          status: {
            all_graves_read: true
          }
        }
      }
    ]
  }
};