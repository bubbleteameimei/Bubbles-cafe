import { Dialog } from '../types';

export const dialogs: Record<string, Dialog> = {
  'priest_ghost': {
    id: 'priest_ghost',
    character: {
      id: 'priest',
      name: 'Father Thomas',
      avatarImage: '/assets/characters/priest.png',
      nameColor: '#8a7d6d'
    },
    content: [
      {
        speaker: 'Father Thomas',
        text: "It's been so long since anyone came to Eden's Hollow. Are you lost, child? Or perhaps... drawn here?",
        responses: [
          {
            text: "I'm not sure why I'm here. Can you tell me about this place?",
            nextIndex: 1
          },
          {
            text: "Who are you?",
            nextIndex: 2
          }
        ]
      },
      {
        speaker: 'Father Thomas',
        text: "I've been trapped here since that day. We all have. The failed ritual bound us to this place, neither living nor dead, just... waiting.",
        responses: [
          {
            text: "What ritual? What happened here?",
            nextIndex: 3
          },
          {
            text: "How can I help you?",
            nextIndex: 4
          }
        ]
      },
      {
        speaker: 'Father Thomas',
        text: "I was once the priest of this village. Now I'm just another trapped soul. I tried to stop them, but my faith wasn't strong enough.",
        responses: [
          {
            text: "Stop who? What happened?",
            nextIndex: 3
          },
          {
            text: "Is there a way to free you?",
            nextIndex: 4
          }
        ]
      },
      {
        speaker: 'Father Thomas',
        text: "I'll help you understand, but first I need to know you can be trusted. Find the church key in the abandoned house, then come back to me.",
        responses: [
          {
            text: "I'll find the key.",
            nextIndex: 5,
            outcome: {
              status: { priest_quest_started: true },
              notification: {
                id: "priest_quest",
                message: "Father Thomas has asked you to find the church key hidden in the abandoned house.",
                type: "info"
              }
            }
          }
        ]
      },
      {
        speaker: 'Father Thomas',
        text: "I'll be here, as I have been for over a century, waiting. The basement of the church holds many answers, but I need to know you're committed to the truth.",
        responses: [
          {
            text: "I'll return with the key.",
            nextIndex: 5
          }
        ]
      },
      {
        speaker: 'Father Thomas',
        text: "Return when you have the key. Only then can I show you what truly happened here.",
        responses: [
          {
            text: "I'll be back soon.",
            nextIndex: -1
          }
        ]
      }
    ]
  },
  
  'priest_ghost_key': {
    id: 'priest_ghost_key',
    character: {
      id: 'priest',
      name: 'Father Thomas',
      avatarImage: '/assets/characters/priest.png',
      nameColor: '#8a7d6d'
    },
    content: [
      {
        speaker: 'Father Thomas',
        text: "You've found the key. Now I can show you the truth. The basement contains records of what happened here, and why we're all trapped.",
        responses: [
          {
            text: "Thank you. I'll explore the basement.",
            nextIndex: 1,
            outcome: {
              status: { priest_helped: true },
              notification: {
                id: "basement_unlocked",
                message: "Father Thomas has granted you access to the church basement. The stairs are now visible in the main church area.",
                type: "discovery"
              },
              item: "church_key"
            }
          }
        ]
      },
      {
        speaker: 'Father Thomas',
        text: "Be careful down there. The darkness that consumed this village... it still lingers. And remember - not everything is as it seems.",
        responses: [
          {
            text: "I'll be careful.",
            nextIndex: -1
          }
        ]
      }
    ]
  },
  
  'child_ghost': {
    id: 'child_ghost',
    character: {
      id: 'child',
      name: 'Lost Child',
      avatarImage: '/assets/characters/child.png',
      nameColor: '#a4c2f4'
    },
    content: [
      {
        speaker: 'Lost Child',
        text: "Hello? Can you see me? No one's been able to see me for so long...",
        responses: [
          {
            text: "I can see you. Who are you?",
            nextIndex: 1
          },
          {
            text: "What happened to you?",
            nextIndex: 2
          }
        ]
      },
      {
        speaker: 'Lost Child',
        text: "My name is Emily. I lived in this village a long time ago. Until the ritual.",
        responses: [
          {
            text: "What ritual?",
            nextIndex: 3
          }
        ]
      },
      {
        speaker: 'Lost Child',
        text: "They chose me. They said I was special. That I would save everyone from the darkness that was coming. I was so scared.",
        responses: [
          {
            text: "I'm so sorry, Emily.",
            nextIndex: 4
          },
          {
            text: "Who did this to you?",
            nextIndex: 5
          }
        ]
      },
      {
        speaker: 'Lost Child',
        text: "The town council, the mayor, even my parents... they all agreed. They formed a circle around me in the church basement. Started chanting. But something went wrong.",
        responses: [
          {
            text: "What went wrong with the ritual?",
            nextIndex: 6
          }
        ]
      },
      {
        speaker: 'Lost Child',
        text: "I don't blame them. They were trying to save everyone from something worse. They just failed, and now we're all trapped here.",
        responses: [
          {
            text: "I'll find a way to help you.",
            nextIndex: 7
          }
        ]
      },
      {
        speaker: 'Lost Child',
        text: "Everyone. The whole village took part. Father Thomas tried to stop them, but they wouldn't listen. They were desperate.",
        responses: [
          {
            text: "Tell me more about the ritual.",
            nextIndex: 6
          }
        ]
      },
      {
        speaker: 'Lost Child',
        text: "They were trying to bind a powerful entity - something they called 'The Hollow One.' It was supposed to protect the village, but instead... it trapped us all in this endless twilight.",
        responses: [
          {
            text: "Is there a way to reverse it?",
            nextIndex: 8
          }
        ]
      },
      {
        speaker: 'Lost Child',
        text: "You'd do that? No one's tried to help us in so long. If you could complete the ritual correctly this time, maybe we could all move on.",
        responses: [
          {
            text: "I'll find a way.",
            nextIndex: 9,
            outcome: {
              status: { child_quest_started: true },
              notification: {
                id: "child_quest",
                message: "Emily has asked you to help free the trapped souls of Eden's Hollow by properly completing the ritual.",
                type: "info"
              }
            }
          }
        ]
      },
      {
        speaker: 'Lost Child',
        text: "The clock tower. That's where it started. When they began the ritual, time stopped for Eden's Hollow. If you can get the clock moving again, it might weaken the binding.",
        responses: [
          {
            text: "Thank you, Emily. I'll find the clock tower.",
            nextIndex: -1
          }
        ]
      }
    ]
  },
  
  'mayor_ghost': {
    id: 'mayor_ghost',
    character: {
      id: 'mayor',
      name: 'Former Mayor',
      avatarImage: '/assets/characters/mayor.png',
      nameColor: '#990000'
    },
    content: [
      {
        speaker: 'Former Mayor',
        text: "Another visitor to our cursed village. What brings you to this wretched place?",
        responses: [
          {
            text: "I'm trying to understand what happened here.",
            nextIndex: 1
          },
          {
            text: "Are you the former mayor?",
            nextIndex: 2
          }
        ]
      },
      {
        speaker: 'Former Mayor',
        text: "What happened here? Desperation. Fear. Terrible choices made by desperate people. Myself included.",
        responses: [
          {
            text: "Tell me about the ritual.",
            nextIndex: 3
          }
        ]
      },
      {
        speaker: 'Former Mayor',
        text: "Yes, I was the mayor of Eden's Hollow. Now I'm just another trapped soul, paying for my sins for eternity.",
        responses: [
          {
            text: "What sins are you paying for?",
            nextIndex: 3
          }
        ]
      },
      {
        speaker: 'Former Mayor',
        text: "It was my decision. The ritual. The sacrifice. I convinced the town it was necessary. The Hollow One had been watching our village for decades, and its influence was growing stronger.",
        responses: [
          {
            text: "You sacrificed a child.",
            nextIndex: 4
          },
          {
            text: "What is The Hollow One?",
            nextIndex: 5
          }
        ]
      },
      {
        speaker: 'Former Mayor',
        text: "Yes. Emily. My own granddaughter. Can you imagine the monster I had to become? I told myself it was for the greater good, that one life for many was a fair trade.",
        responses: [
          {
            text: "That's unforgivable.",
            nextIndex: 6
          },
          {
            text: "You were trying to protect everyone.",
            nextIndex: 7
          }
        ]
      },
      {
        speaker: 'Former Mayor',
        text: "An ancient entity. Older than humanity. It fed on fear and suffering, and our village was to be its next feast. We thought binding it would save us, but we only trapped ourselves with it.",
        responses: [
          {
            text: "Is there a way to undo this?",
            nextIndex: 8
          }
        ]
      },
      {
        speaker: 'Former Mayor',
        text: "I know. That's why I remain here, in this purgatory. Never moving on, never finding peace. This is my punishment, and I deserve every moment of it.",
        responses: [
          {
            text: "Is there a way to free the others?",
            nextIndex: 8
          }
        ]
      },
      {
        speaker: 'Former Mayor',
        text: "My intentions don't matter. The road to hell is paved with good intentions, as they say. And this... this is our hell.",
        responses: [
          {
            text: "Can the ritual be reversed?",
            nextIndex: 8
          }
        ]
      },
      {
        speaker: 'Former Mayor',
        text: "If the souls were freed, maybe then God will hear my prayers for absolution. The ritual can be completed properly. You need the amulet from the church basement and the proper incantation from the mausoleum.",
        responses: [
          {
            text: "I'll make things right.",
            nextIndex: 9,
            outcome: {
              status: { mayor_info_given: true },
              notification: {
                id: "ritual_components",
                message: "The former mayor has revealed you need the ritual amulet from the church basement and an incantation from the mausoleum to properly complete the ritual.",
                type: "discovery"
              }
            }
          }
        ]
      },
      {
        speaker: 'Former Mayor',
        text: "Remember this - Eden's Hollow exists in limbo since that fateful day. We all exist in the eternal dusk, moving neither on nor truly living. Complete the ritual, free us all.",
        responses: [
          {
            text: "I'll find a way to free you all.",
            nextIndex: -1
          }
        ]
      }
    ]
  }
};

export default dialogs;