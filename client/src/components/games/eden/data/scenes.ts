import { Scene, SceneAction, SceneEvent } from '../types';

export const scenes: Record<string, Scene> = {
  'village_entrance': {
    id: 'village_entrance',
    name: 'Village Entrance',
    description: 'The fog-shrouded entrance to Eden\'s Hollow. Weathered wooden signage swings gently in the perpetual dusk.',
    backgroundImage: '/assets/scenes/village_entrance.jpg',
    features: [
      {
        id: 'signpost',
        name: 'Weathered Signpost',
        description: 'A wooden sign pointing toward the village. The paint is chipped and faded.',
        position: {
          top: '60%',
          left: '25%'
        },
        isInteractive: true,
        interactions: [
          {
            id: 'read_sign',
            name: 'Read Sign',
            action: 'examine',
            outcome: {
              notification: {
                id: 'signpost_text',
                message: 'The weathered sign reads "Eden\'s Hollow - Where Peace Abides". Someone has scratched "LIES" underneath in what appears to be dried blood.',
                type: 'discovery'
              }
            }
          }
        ]
      },
      {
        id: 'strange_flowers',
        name: 'Strange Flowers',
        description: 'Unusual pale flowers grow among the weeds by the roadside.',
        position: {
          top: '80%',
          left: '15%'
        },
        isInteractive: true,
        interactions: [
          {
            id: 'examine_flowers',
            name: 'Examine Flowers',
            action: 'examine',
            outcome: {
              notification: {
                id: 'strange_flowers_note',
                message: 'These are "Dusk Lilies." They only bloom in twilight, but it\'s been twilight here for as long as anyone can remember.',
                type: 'discovery'
              }
            }
          },
          {
            id: 'pick_flowers',
            name: 'Pick Flowers',
            action: 'collect',
            outcome: {
              item: 'dusk_lily',
              notification: {
                id: 'flower_collected',
                message: 'You carefully pluck a Dusk Lily. It emanates a subtle glow in your hand.',
                type: 'info'
              }
            }
          }
        ]
      },
      {
        id: 'abandoned_cart',
        name: 'Abandoned Cart',
        description: 'A wooden cart sits abandoned by the roadside, as if its owner fled in a hurry.',
        position: {
          top: '65%',
          left: '70%'
        },
        isInteractive: true,
        interactions: [
          {
            id: 'search_cart',
            name: 'Search Cart',
            action: 'examine',
            outcome: {
              item: 'rusty_key',
              notification: {
                id: 'found_key',
                message: 'Among the abandoned supplies, you find a rusty key.',
                type: 'discovery'
              }
            }
          }
        ]
      }
    ],
    exits: [
      {
        id: 'to_village_square',
        name: 'Enter Village',
        description: 'The fog-shrouded path leads deeper into the village.',
        targetScene: 'village_square',
        position: {
          top: '50%',
          left: '50%'
        }
      }
    ],
    events: [
      {
        trigger: 'entry',
        outcome: {
          notification: {
            id: 'village_welcome',
            message: 'A sense of dread washes over you as you approach Eden\'s Hollow. The air is thick with fog and an unnatural stillness.',
            type: 'info'
          }
        }
      }
    ]
  },
  
  'village_square': {
    id: 'village_square',
    name: 'Village Square',
    description: 'The central gathering place of the village, now eerily empty. A defunct fountain stands in the center.',
    backgroundImage: '/assets/scenes/village_square.jpg',
    features: [
      {
        id: 'dried_fountain',
        name: 'Dried Fountain',
        description: 'A once-beautiful stone fountain that has long since stopped flowing. Strange symbols are carved into its rim.',
        position: {
          top: '60%',
          left: '50%'
        },
        isInteractive: true,
        interactions: [
          {
            id: 'examine_fountain',
            name: 'Examine Fountain',
            action: 'examine',
            outcome: {
              notification: {
                id: 'fountain_description',
                message: 'The symbols appear to be an ancient language. You recognize symbols for "binding," "twilight," and "eternity."',
                type: 'discovery'
              }
            }
          },
          {
            id: 'touch_symbols',
            name: 'Trace Symbols',
            action: 'interact',
            outcome: {
              status: { fountain_symbols_traced: true },
              notification: {
                id: 'symbols_glow',
                message: 'As your fingers trace the symbols, they briefly glow with a soft blue light. You hear distant whispers.',
                type: 'discovery'
              }
            }
          }
        ]
      },
      {
        id: 'church_door',
        name: 'Church Entrance',
        description: 'The imposing wooden doors of the village church. They\'re carved with religious imagery.',
        position: {
          top: '40%',
          left: '80%'
        },
        isInteractive: true,
        interactions: [
          {
            id: 'examine_church_door',
            name: 'Examine Door',
            action: 'examine',
            outcome: {
              notification: {
                id: 'church_door_description',
                message: 'The carvings depict a ritual with robed figures standing in a circle. At the center is what appears to be a child.',
                type: 'discovery'
              }
            }
          }
        ]
      }
    ],
    exits: [
      {
        id: 'to_village_entrance',
        name: 'Return to Entrance',
        description: 'The path back to the village entrance.',
        targetScene: 'village_entrance',
        position: {
          top: '90%',
          left: '50%'
        }
      },
      {
        id: 'to_church',
        name: 'Enter Church',
        description: 'The heavy wooden doors of the church.',
        targetScene: 'church',
        position: {
          top: '40%',
          left: '80%'
        }
      },
      {
        id: 'to_graveyard',
        name: 'To Graveyard',
        description: 'A narrow path leading to the village graveyard.',
        targetScene: 'graveyard',
        position: {
          top: '70%',
          left: '20%'
        }
      },
      {
        id: 'to_abandoned_house',
        name: 'Abandoned House',
        description: 'A dilapidated house with boarded windows.',
        targetScene: 'abandoned_house',
        position: {
          top: '30%',
          left: '20%'
        },
        requiredItems: ['rusty_key']
      }
    ]
  },
  
  'church': {
    id: 'church',
    name: 'Village Church',
    description: 'The interior of the church is dimly lit by candles that never seem to burn down. Pews face an altar with unusual decorations.',
    backgroundImage: '/assets/scenes/church.jpg',
    features: [
      {
        id: 'altar',
        name: 'Strange Altar',
        description: 'The altar is adorned with unusual symbols and appears to have channels carved into it, perhaps for liquid to flow.',
        position: {
          top: '60%',
          left: '50%'
        },
        isInteractive: true,
        interactions: [
          {
            id: 'examine_altar',
            name: 'Examine Altar',
            action: 'examine',
            outcome: {
              notification: {
                id: 'altar_description',
                message: 'The channels in the altar lead to a central basin. There are dark stains that could be very old blood.',
                type: 'discovery'
              }
            }
          },
          {
            id: 'place_lily',
            name: 'Place Dusk Lily',
            action: 'use',
            outcome: {
              status: { altar_lily_placed: true },
              notification: {
                id: 'lily_reaction',
                message: 'When you place the Dusk Lily on the altar, it dissolves into luminescent liquid that flows through the channels, briefly illuminating hidden symbols.',
                type: 'discovery'
              }
            },
            condition: {
              requiredItems: ['dusk_lily']
            }
          }
        ]
      },
      {
        id: 'confessional',
        name: 'Confessional Booth',
        description: 'A wooden confessional booth with worn velvet curtains. One side appears to be for the priest, the other for penitents.',
        position: {
          top: '70%',
          left: '80%'
        },
        isInteractive: true,
        interactions: [
          {
            id: 'enter_booth',
            name: 'Enter Booth',
            action: 'interact',
            outcome: {
              dialog: 'priest_ghost'
            }
          }
        ]
      },
      {
        id: 'stained_glass',
        name: 'Stained Glass Window',
        description: 'A large stained glass window depicting what appears to be a ritual. The glass glows despite the lack of sunlight outside.',
        position: {
          top: '30%',
          left: '50%'
        },
        isInteractive: true,
        interactions: [
          {
            id: 'examine_window',
            name: 'Study Window',
            action: 'examine',
            outcome: {
              notification: {
                id: 'window_description',
                message: 'The window depicts robed figures standing in a circle with a child in the center. Above them hovers a dark entity reaching down with shadowy tendrils.',
                type: 'discovery'
              }
            }
          }
        ]
      }
    ],
    exits: [
      {
        id: 'to_village_square',
        name: 'Exit Church',
        description: 'Return to the village square.',
        targetScene: 'village_square',
        position: {
          top: '90%',
          left: '50%'
        }
      },
      {
        id: 'to_church_basement',
        name: 'Basement Stairs',
        description: 'A narrow stairway leading down to what appears to be a basement.',
        targetScene: 'church_basement',
        position: {
          top: '80%',
          left: '20%'
        },
        isHidden: true,
        requiredStatus: {
          priest_helped: true
        }
      }
    ]
  },
  
  'graveyard': {
    id: 'graveyard',
    name: 'Misty Graveyard',
    description: 'Rows of weathered tombstones shrouded in mist. Many graves appear to be from the same date.',
    backgroundImage: '/assets/scenes/graveyard.jpg',
    features: [
      {
        id: 'mass_grave',
        name: 'Mass Grave Marker',
        description: 'A large stone monument marking what appears to be a mass grave. The date is worn but readable.',
        position: {
          top: '70%',
          left: '50%'
        },
        isInteractive: true,
        interactions: [
          {
            id: 'read_monument',
            name: 'Read Monument',
            action: 'examine',
            outcome: {
              notification: {
                id: 'monument_inscription',
                message: 'The inscription reads: "In memory of those lost during The Binding, October 31, 1897. May their souls find the peace denied to them in life."',
                type: 'discovery'
              }
            }
          }
        ]
      },
      {
        id: 'fresh_flowers',
        name: 'Fresh Flowers',
        description: 'Surprisingly fresh flowers placed on one of the graves. They appear to have been left recently.',
        position: {
          top: '80%',
          left: '30%'
        },
        isInteractive: true,
        interactions: [
          {
            id: 'examine_flowers',
            name: 'Examine Flowers',
            action: 'examine',
            outcome: {
              status: { graves_examined: true },
              notification: {
                id: 'flower_discovery',
                message: 'The flowers are arranged in a specific pattern. Underneath them, you find a small key with a tag reading "Mausoleum".',
                type: 'discovery'
              },
              item: 'mausoleum_key'
            }
          }
        ]
      }
    ],
    exits: [
      {
        id: 'to_village_square',
        name: 'Return to Square',
        description: 'The path back to the village square.',
        targetScene: 'village_square',
        position: {
          top: '90%',
          left: '50%'
        }
      },
      {
        id: 'to_mausoleum',
        name: 'Mausoleum',
        description: 'A stone mausoleum with a heavy locked door.',
        targetScene: 'mausoleum',
        position: {
          top: '40%',
          left: '70%'
        },
        isHidden: true,
        requiredStatus: {
          graves_examined: true
        }
      }
    ]
  },
  
  'abandoned_house': {
    id: 'abandoned_house',
    name: 'Abandoned House',
    description: 'The interior of the house is in disarray, as if the occupants left in a hurry. Dust covers everything.',
    backgroundImage: '/assets/scenes/abandoned_house.jpg',
    features: [
      {
        id: 'writing_desk',
        name: 'Writing Desk',
        description: 'A small writing desk with papers scattered about and a partially open drawer.',
        position: {
          top: '70%',
          left: '30%'
        },
        isInteractive: true,
        interactions: [
          {
            id: 'search_desk',
            name: 'Search Desk',
            action: 'examine',
            outcome: {
              status: { desk_searched: true },
              notification: {
                id: 'diary_entry',
                message: 'You find a diary. The last entry is dated October 30, 1897: "The town council has decided. Tomorrow, we perform the ritual. God forgive us for what we\'re about to do to save ourselves."',
                type: 'discovery'
              }
            }
          }
        ]
      },
      {
        id: 'family_portrait',
        name: 'Family Portrait',
        description: 'A framed portrait of a family - mother, father, and a young girl. Their expressions seem unusually solemn.',
        position: {
          top: '40%',
          left: '50%'
        },
        isInteractive: true,
        interactions: [
          {
            id: 'examine_portrait',
            name: 'Examine Portrait',
            action: 'examine',
            outcome: {
              notification: {
                id: 'portrait_details',
                message: 'On the back of the portrait, someone has written "May she forgive us for what we must do. The needs of the many outweigh the needs of the few."',
                type: 'discovery'
              }
            }
          }
        ]
      },
      {
        id: 'loose_floorboard',
        name: 'Loose Floorboard',
        description: 'One of the floorboards appears to be loose, as if it\'s been pried up before.',
        position: {
          top: '85%',
          left: '60%'
        },
        isInteractive: true,
        isHidden: true,
        requiredStatus: {
          desk_searched: true
        },
        interactions: [
          {
            id: 'pry_floorboard',
            name: 'Pry Up Floorboard',
            action: 'interact',
            outcome: {
              status: { found_ritual_page: true },
              notification: {
                id: 'hidden_page',
                message: 'Beneath the floorboard, you find a torn page from what appears to be an ancient book. It describes part of a ritual to "bind a being of great power."',
                type: 'discovery'
              },
              item: 'ritual_page'
            }
          }
        ]
      }
    ],
    exits: [
      {
        id: 'to_village_square',
        name: 'Exit House',
        description: 'Return to the village square.',
        targetScene: 'village_square',
        position: {
          top: '90%',
          left: '50%'
        }
      }
    ]
  },
  
  'mausoleum': {
    id: 'mausoleum',
    name: 'Ancient Mausoleum',
    description: 'The interior of the stone mausoleum is cold and damp. Stone sarcophagi line the walls, and strange symbols are carved everywhere.',
    backgroundImage: '/assets/scenes/mausoleum.jpg',
    features: [
      {
        id: 'central_altar',
        name: 'Central Altar',
        description: 'A stone altar in the center of the mausoleum. Five candle holders are positioned around it, but only two contain candles.',
        position: {
          top: '60%',
          left: '50%'
        },
        isInteractive: true,
        interactions: [
          {
            id: 'examine_altar',
            name: 'Examine Altar',
            action: 'examine',
            outcome: {
              notification: {
                id: 'altar_symbols',
                message: 'The altar is carved with the same symbols you saw in the fountain. At its center is a circular depression, as if something is meant to be placed there.',
                type: 'discovery'
              }
            }
          },
          {
            id: 'place_amulet',
            name: 'Place Amulet',
            action: 'use',
            outcome: {
              puzzle: 'binding_ritual',
              notification: {
                id: 'altar_activation',
                message: 'When you place the amulet in the depression, the symbols around the altar begin to glow. You feel the air thicken with energy.',
                type: 'discovery'
              }
            },
            condition: {
              requiredItems: ['ritual_amulet']
            }
          }
        ]
      },
      {
        id: 'stone_sarcophagus',
        name: 'Child\'s Sarcophagus',
        description: 'A smaller sarcophagus, clearly meant for a child. Unlike the others, it\'s decorated with fresh flowers and small toys.',
        position: {
          top: '70%',
          left: '20%'
        },
        isInteractive: true,
        interactions: [
          {
            id: 'examine_sarcophagus',
            name: 'Examine Sarcophagus',
            action: 'examine',
            outcome: {
              dialog: 'child_ghost'
            }
          }
        ]
      }
    ],
    exits: [
      {
        id: 'to_graveyard',
        name: 'Exit Mausoleum',
        description: 'Return to the graveyard.',
        targetScene: 'graveyard',
        position: {
          top: '90%',
          left: '50%'
        }
      }
    ]
  },
  
  'church_basement': {
    id: 'church_basement',
    name: 'Church Basement',
    description: 'A hidden chamber beneath the church. Ceremonial items and ancient texts line the shelves. A ritual circle is drawn on the floor.',
    backgroundImage: '/assets/scenes/church_basement.jpg',
    features: [
      {
        id: 'ritual_circle',
        name: 'Ritual Circle',
        description: 'A complex circle of symbols drawn on the floor in what appears to be a mixture of chalk and dried blood.',
        position: {
          top: '70%',
          left: '50%'
        },
        isInteractive: true,
        interactions: [
          {
            id: 'examine_circle',
            name: 'Examine Circle',
            action: 'examine',
            outcome: {
              notification: {
                id: 'circle_details',
                message: 'The circle contains five points, each with a different symbol: Earth, Air, Fire, Water, and Spirit. At the center is a symbol you don\'t recognize, depicting a child inside a star.',
                type: 'discovery'
              }
            }
          }
        ]
      },
      {
        id: 'ancient_book',
        name: 'Ancient Book',
        description: 'A large, leather-bound tome rests on a pedestal near the circle. Its pages appear brittle with age.',
        position: {
          top: '50%',
          left: '20%'
        },
        isInteractive: true,
        interactions: [
          {
            id: 'read_book',
            name: 'Read Book',
            action: 'examine',
            outcome: {
              notification: {
                id: 'book_contents',
                message: 'The book describes a ritual to bind an entity known as "The Hollow One" using a child as a vessel. The price of failure is eternal twilight for all involved, neither living nor dead.',
                type: 'discovery'
              }
            }
          }
        ]
      },
      {
        id: 'locked_cabinet',
        name: 'Locked Cabinet',
        description: 'A heavy wooden cabinet with an ornate lock. The wood around the lock has scratch marks, as if someone tried to break in.',
        position: {
          top: '40%',
          left: '80%'
        },
        isInteractive: true,
        interactions: [
          {
            id: 'use_key',
            name: 'Use Church Key',
            action: 'use',
            outcome: {
              item: 'ritual_amulet',
              notification: {
                id: 'found_amulet',
                message: 'Inside the cabinet, you find an ancient amulet with the same symbol you saw at the center of the ritual circle. It pulses with an unnatural energy.',
                type: 'discovery'
              }
            },
            condition: {
              requiredItems: ['church_key']
            }
          }
        ]
      }
    ],
    exits: [
      {
        id: 'to_church',
        name: 'Return Upstairs',
        description: 'The stairs leading back up to the main church area.',
        targetScene: 'church',
        position: {
          top: '90%',
          left: '50%'
        }
      }
    ]
  },
  
  'clock_tower': {
    id: 'clock_tower',
    name: 'Village Clock Tower',
    description: 'The clock tower looms above you, the massive mechanism sits frozen, its gears and pendulum motionless. The hands are stopped at precisely midnight.',
    backgroundImage: '/assets/scenes/clock_tower.jpg',
    features: [
      {
        id: 'clock_mechanism',
        name: 'Clock Mechanism',
        description: 'The intricate mechanism of gears, weights, and pendulum that once kept time for the village. It appears to be intact but doesn\'t move.',
        position: {
          top: '50%',
          left: '50%'
        },
        isInteractive: true,
        interactions: [
          {
            id: 'examine_clock',
            name: 'Examine Mechanism',
            action: 'examine',
            outcome: {
              notification: {
                id: 'clock_details',
                message: 'Upon closer inspection, the mechanism isn\'t broken. Something seems to be holding it in place, as if time itself has been frozen at this moment.',
                type: 'discovery'
              }
            }
          },
          {
            id: 'repair_clock',
            name: 'Repair Clock',
            action: 'interact',
            outcome: {
              puzzle: 'clock_puzzle',
              notification: {
                id: 'clock_puzzle_start',
                message: 'You attempt to realign the gears and pendulum. This will require careful adjustment of the mechanism.',
                type: 'info'
              }
            }
          }
        ]
      }
    ],
    exits: [
      {
        id: 'to_village_square',
        name: 'Descend Tower',
        description: 'The winding staircase leading back down to the village.',
        targetScene: 'village_square',
        position: {
          top: '90%',
          left: '50%'
        }
      },
      {
        id: 'to_tower_overlook',
        name: 'Tower Overlook',
        description: 'A viewing platform at the top of the tower.',
        targetScene: 'tower_overlook',
        position: {
          top: '20%',
          left: '50%'
        },
        isHidden: true,
        requiredStatus: {
          clock_fixed: true
        }
      }
    ]
  }
};

export default scenes;