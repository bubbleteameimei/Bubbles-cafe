import { Dialog } from '../types';

// Game dialogs collection
export const gameDialogs: Record<string, Dialog> = {
  stranger_greeting: {
    id: 'stranger_greeting',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'Well, well... another visitor to Eden's Hollow. I haven't seen a new face in quite some time. Are you lost, perhaps?',
    responses: [
      {
        text: 'Who are you?',
        nextDialog: 'stranger_identity'
      },
      {
        text: 'What is this place?',
        nextDialog: 'stranger_about_town'
      },
      {
        text: 'I need to leave. Which way is out?',
        nextDialog: 'stranger_warning'
      }
    ]
  },
  
  stranger_identity: {
    id: 'stranger_identity',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'Names have little meaning in Eden's Hollow. I've been here... longer than most. I observe. I wait. Some call me the Watcher. What about you? What draws you to this place?',
    responses: [
      {
        text: 'I was just exploring the forest and found myself here.',
        nextDialog: 'stranger_curious'
      },
      {
        text: 'What is this place?',
        nextDialog: 'stranger_about_town'
      },
      {
        text: 'I don't trust you.',
        nextDialog: 'stranger_distrust'
      }
    ]
  },
  
  stranger_about_town: {
    id: 'stranger_about_town',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'Eden's Hollow is... special. Once a thriving village, now something else entirely. Time works differently here. The residents are... changed. Some are gone, some remain, and some have become something new. I wouldn't linger after dark if I were you.',
    responses: [
      {
        text: 'What happened to this place?',
        nextDialog: 'stranger_history'
      },
      {
        text: 'Are you warning me?',
        nextDialog: 'stranger_warning'
      },
      {
        text: 'I should explore the village.',
        nextDialog: 'stranger_farewell'
      }
    ]
  },
  
  stranger_warning: {
    id: 'stranger_warning',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'Leave? Oh, my dear visitor... Eden's Hollow doesn't simply release those who wander in. The path that brought you here is gone. The forest shifts and changes. If you wish to leave, you'll need to understand the village's secrets first. And that... that is a dangerous task.',
    responses: [
      {
        text: 'There must be a way out.',
        nextDialog: 'stranger_escape'
      },
      {
        text: 'What secrets?',
        nextDialog: 'stranger_secrets'
      },
      {
        text: 'I'm not afraid of danger.',
        nextDialog: 'stranger_courage'
      }
    ]
  },
  
  stranger_curious: {
    id: 'stranger_curious',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'Curiosity... a powerful and dangerous trait. Eden's Hollow calls to the curious, the seekers of mystery. But be cautious - some secrets are better left uncovered. This place has a way of... changing those who delve too deeply.',
    responses: [
      {
        text: 'What secrets does this place hold?',
        nextDialog: 'stranger_secrets'
      },
      {
        text: 'I should be going now.',
        nextDialog: 'stranger_farewell'
      }
    ]
  },
  
  stranger_distrust: {
    id: 'stranger_distrust',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'Wise. Very wise indeed. Trust is a luxury in Eden's Hollow. Keep your wits about you. Question everything you see, everyone you meet. Perhaps you'll survive longer than the others.',
    responses: [
      {
        text: 'What others?',
        nextDialog: 'stranger_others'
      },
      {
        text: 'I can take care of myself.',
        nextDialog: 'stranger_farewell'
      }
    ]
  },
  
  stranger_history: {
    id: 'stranger_history',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'A century ago, the town elders made a pact. They sought power, eternal life... They got something else entirely. A darkness seeped into the soil, the water, the very air. The village and its people were... transformed. Those who remain are no longer what they appear to be.',
    responses: [
      {
        text: 'What kind of pact?',
        nextDialog: 'stranger_pact'
      },
      {
        text: 'Are you one of them?',
        nextDialog: 'stranger_accusation'
      },
      {
        text: 'I need to find a way out of here.',
        nextDialog: 'stranger_escape'
      }
    ]
  },
  
  stranger_secrets: {
    id: 'stranger_secrets',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'Every building hides a story. Every resident, a mystery. The church holds the darkest secrets of all. The fountain in the village square might reveal something to those who know how to look. The old journal you found in the camp? Read it carefully. Very carefully.',
    responses: [
      {
        text: 'How did you know about the journal?',
        nextDialog: 'stranger_knowing'
      },
      {
        text: 'I'll investigate these places.',
        nextDialog: 'stranger_farewell'
      }
    ],
    onComplete: {
      status: { 'received_stranger_hints': true }
    }
  },
  
  stranger_escape: {
    id: 'stranger_escape',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'There is... a way. The old church holds a passage beneath its altar. But accessing it requires solving the village's mysteries. Find the amulet. Decode the symbols. Unlock the door beneath the church, and you might find your way home. But beware what follows you back...',
    responses: [
      {
        text: 'What amulet? Where do I find it?',
        nextDialog: 'stranger_amulet'
      },
      {
        text: 'Thank you for the information.',
        nextDialog: 'stranger_farewell'
      }
    ],
    onComplete: {
      status: { 'knows_escape_route': true }
    }
  },
  
  stranger_courage: {
    id: 'stranger_courage',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'No? Many have said the same. Their bones now lie beneath this soil. Courage without caution is merely recklessness. But if you're determined, start with the village square. The fountain holds a clue for those with patience.',
    responses: [
      {
        text: 'I'll check out the fountain.',
        nextDialog: 'stranger_farewell'
      },
      {
        text: 'Any other advice?',
        nextDialog: 'stranger_advice'
      }
    ]
  },
  
  stranger_others: {
    id: 'stranger_others',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'You're not the first to wander into Eden's Hollow. Not by far. Some leave their mark on the village. Others... well, the village leaves its mark on them. Look for signs of previous visitors - notes, abandoned possessions. They might help you avoid their fate.',
    responses: [
      {
        text: 'I'll keep an eye out.',
        nextDialog: 'stranger_farewell'
      }
    ]
  },
  
  stranger_pact: {
    id: 'stranger_pact',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'They found ancient texts in the caves beneath the village. Rituals that promised power and eternal life. They didn't understand the price. The entity they contacted had no interest in granting wishes without... compensation. The entire village became its payment.',
    responses: [
      {
        text: 'What entity?',
        nextDialog: 'stranger_entity'
      },
      {
        text: 'I've heard enough.',
        nextDialog: 'stranger_farewell'
      }
    ]
  },
  
  stranger_accusation: {
    id: 'stranger_accusation',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'An interesting question. I've been here a very long time. Perhaps too long. What I am now... is complicated. Neither fully here nor there. But unlike the others, I remember what it was to be human. I remember compassion. That's why I'm warning you now.',
    responses: [
      {
        text: 'I appreciate the warning.',
        nextDialog: 'stranger_farewell'
      },
      {
        text: 'How do I protect myself?',
        nextDialog: 'stranger_advice'
      }
    ]
  },
  
  stranger_knowing: {
    id: 'stranger_knowing',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'I see much from the shadows. The journal belonged to Professor Harlow - the last academic who came to study Eden's Hollow. He understood more than most. Keep that journal close. His insights might save your life, just as they might have saved his... had he heeded his own warnings.',
    responses: [
      {
        text: 'What happened to Professor Harlow?',
        nextDialog: 'stranger_harlow'
      },
      {
        text: 'I'll read the journal carefully.',
        nextDialog: 'stranger_farewell'
      }
    ]
  },
  
  stranger_amulet: {
    id: 'stranger_amulet',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'The amulet lies beneath the fountain in the village square. But it will only reveal itself to one who solves the puzzle of the moon phases. When you have it, wear it at all times. It offers... some protection against what dwells here.',
    responses: [
      {
        text: 'Thank you for your help.',
        nextDialog: 'stranger_farewell'
      }
    ],
    onComplete: {
      status: { 'knows_amulet_location': true }
    }
  },
  
  stranger_advice: {
    id: 'stranger_advice',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'Never wander after dark. Keep to lit areas. If you hear whispers without a source, walk the other way. Don't look too long at your own reflection. And if you see someone familiar - someone you know couldn't possibly be here - run. Run without looking back.',
    responses: [
      {
        text: 'I'll remember that.',
        nextDialog: 'stranger_farewell'
      }
    ]
  },
  
  stranger_entity: {
    id: 'stranger_entity',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'Some questions are dangerous to answer. Some names dangerous to speak. Let's just say it dwells between realities, feeding on human potential - all the moments and choices that make up a life. Eden's Hollow exists in a state of perpetual... harvest.',
    responses: [
      {
        text: 'That's horrifying.',
        nextDialog: 'stranger_farewell'
      }
    ]
  },
  
  stranger_harlow: {
    id: 'stranger_harlow',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'He went into the church alone at night. We heard the screams for hours. By morning, there was only silence. If you find yourself in the church, do not approach the altar unless you have the amulet. And never, ever go into the basement without proper preparation.',
    responses: [
      {
        text: 'I'll be careful.',
        nextDialog: 'stranger_farewell'
      }
    ]
  },
  
  stranger_farewell: {
    id: 'stranger_farewell',
    speaker: 'Mysterious Stranger',
    speakerImage: '/images/eden/characters/stranger.jpg',
    text: 'Our conversation draws attention. I must fade back into the shadows now. Remember what I've told you. And should you survive long enough to uncover the truth of Eden's Hollow... well, perhaps we'll speak again. Until then, stay vigilant, traveler.',
    responses: [
      {
        text: 'Goodbye.',
        outcome: {
          notification: {
            id: 'stranger_leaves',
            message: 'The stranger melts back into the shadows, leaving you alone at the entrance to the village.',
            type: 'info'
          }
        }
      }
    ]
  },
  
  journal_entry_1: {
    id: 'journal_entry_1',
    text: '...July 17th: Arrived in Eden's Hollow today to investigate the folklore surrounding the village's abandonment. Locals in nearby towns refuse to discuss it. Found an abandoned camp at the forest edge - appears recently used, but hastily left behind. Continuing to the village tomorrow...',
    responses: [
      {
        text: 'Continue reading',
        nextDialog: 'journal_entry_2'
      },
      {
        text: 'Close journal'
      }
    ]
  },
  
  journal_entry_2: {
    id: 'journal_entry_2',
    text: '...July 18th: The village is not abandoned as reported. There are people here, though they're... odd. Unnaturally still until addressed. Their speech patterns are peculiar. They insist I join them for the "festival" tomorrow night. Noticed strange symbols carved into trees leading to town...',
    responses: [
      {
        text: 'Continue reading',
        nextDialog: 'journal_entry_3'
      },
      {
        text: 'Close journal'
      }
    ]
  },
  
  journal_entry_3: {
    id: 'journal_entry_3',
    text: '...July 19th: Something is wrong with this place. The sun hasn't moved since yesterday. My watch has stopped. People appear in windows, then vanish when approached. Found references in the town hall to a ritual performed in 1887. Townspeople becoming increasingly insistent about the festival...',
    responses: [
      {
        text: 'Continue reading',
        nextDialog: 'journal_entry_4'
      },
      {
        text: 'Close journal'
      }
    ]
  },
  
  journal_entry_4: {
    id: 'journal_entry_4',
    text: '...July 20th(?): Must leave. NOW. The "festival" is some kind of sacrifice. Found a hidden passage under the church. Strange metal door with rune symbols. Sequence seems to be Journey-Darkness-Gateway-Revelation. If anyone finds this journal, DO NOT stay after dark. DO NOT trust the residents...',
    responses: [
      {
        text: 'Close journal',
        outcome: {
          status: { 'read_full_journal': true },
          notification: {
            id: 'journal_insight',
            message: 'You've learned about a hidden passage beneath the church and a potential escape route.',
            type: 'info'
          }
        }
      }
    ]
  }
};