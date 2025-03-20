import { Dialog } from '../types';

/**
 * Game character dialogs
 */
export const gameDialogs: Record<string, Dialog> = {
  village_ghost: {
    id: 'village_ghost',
    content: [
      {
        speaker: 'Ghostly Figure',
        text: 'You... you can see me? It's been so long since anyone new came to Eden's Hollow.',
        responses: [
          {
            text: 'Who are you?',
            nextIndex: 1
          },
          {
            text: 'What happened to this village?',
            nextIndex: 2
          },
          {
            text: 'I should go.',
            outcome: {
              notification: {
                id: 'ghost-leave',
                message: 'The ghostly figure fades away with a sad expression.',
                type: 'info'
              }
            }
          }
        ]
      },
      {
        speaker: 'Ghostly Figure',
        text: 'I was... I am Sarah. One of the five who were chosen for the ritual. We've been trapped here since that day.',
        responses: [
          {
            text: 'What ritual?',
            nextIndex: 3
          },
          {
            text: 'How can I help you?',
            nextIndex: 4
          }
        ]
      },
      {
        speaker: 'Ghostly Figure',
        text: 'A tragedy befell us in 1891. The elders performed a ritual to protect the village from a coming darkness, but it went terribly wrong. We've been trapped in this endless dusk ever since, neither living nor dead.',
        responses: [
          {
            text: 'Tell me about this ritual.',
            nextIndex: 3
          },
          {
            text: 'Is there any way to fix this?',
            nextIndex: 4
          }
        ]
      },
      {
        speaker: 'Sarah',
        text: 'The five of us—all children—were to represent the five elements of existence. But the ritual was interrupted, and our spirits have been bound to this village ever since.',
        responses: [
          {
            text: 'Who were the five children?',
            nextIndex: 5
          },
          {
            text: 'How can I help you?',
            nextIndex: 4
          }
        ]
      },
      {
        speaker: 'Sarah',
        text: 'The ritual must be completed properly. Find the journal in the old inn. It contains the instructions. Then gather the five ritual items and place them in their correct positions in the church basement.',
        responses: [
          {
            text: 'I'll help you.',
            outcome: {
              status: { quest_accept: true },
              notification: {
                id: 'quest-accepted',
                message: 'New Quest: Complete the ritual and free the trapped spirits of Eden's Hollow.',
                type: 'discovery'
              }
            }
          },
          {
            text: 'I need to think about this.',
            outcome: {
              notification: {
                id: 'quest-pending',
                message: 'Sarah nods solemnly, "I understand. This is a heavy burden for a stranger. If you decide to help us, I'll be here."',
                type: 'info'
              }
            }
          }
        ]
      },
      {
        speaker: 'Sarah',
        text: 'Emma, Thomas, William, Lucy, and myself. We were all friends, all innocent. The village elders thought our purity would make the ritual more powerful.',
        responses: [
          {
            text: 'That's terrible.',
            nextIndex: 6
          },
          {
            text: 'How can I help you?',
            nextIndex: 4
          }
        ]
      },
      {
        speaker: 'Sarah',
        text: 'It was. But we don't blame them. They were trying to save everyone from something worse. They just... failed. And we've all been paying the price ever since.',
        responses: [
          {
            text: 'I'll find a way to help you.',
            nextIndex: 4
          }
        ]
      }
    ]
  },
  
  church_priest: {
    id: 'church_priest',
    content: [
      {
        speaker: 'Ghostly Priest',
        text: 'Welcome to the house of God, traveler. Though I fear God has long abandoned this place.',
        responses: [
          {
            text: 'Who are you?',
            nextIndex: 1
          },
          {
            text: 'What happened in this church?',
            nextIndex: 2
          },
          {
            text: 'I'm looking for information about a ritual.',
            nextIndex: 3
          }
        ]
      },
      {
        speaker: 'Ghostly Priest',
        text: 'I was Father Thomas Morrison, shepherd to this wayward flock. Now I am but a shadow, haunting these hallowed halls in penance.',
        responses: [
          {
            text: 'Penance for what?',
            nextIndex: 4
          },
          {
            text: 'Tell me about the ritual.',
            nextIndex: 3
          }
        ]
      },
      {
        speaker: 'Ghostly Priest',
        text: 'Unspeakable things. The altar was used for purposes far from God's teaching. I should have stopped them, but I was weak. I believed their wild tales of coming darkness.',
        responses: [
          {
            text: 'Tell me about the five children.',
            nextIndex: 5
          },
          {
            text: 'How can the ritual be completed properly?',
            nextIndex: 6
          }
        ]
      },
      {
        speaker: 'Ghostly Priest',
        text: 'I should have forbidden it! They said it was the only way, that the old powers required innocent vessels. Blasphemy! But the fear in the village was palpable after the strange occurrences began.',
        responses: [
          {
            text: 'What strange occurrences?',
            nextIndex: 7
          },
          {
            text: 'Where can I find the ritual items?',
            nextIndex: 8
          }
        ]
      },
      {
        speaker: 'Ghostly Priest',
        text: 'I participated in the deaths of five innocent children. God forgive me! I believed we were saving the village, but we were only damning ourselves.',
        responses: [
          {
            text: 'Is there no forgiveness?',
            nextIndex: 9
          },
          {
            text: 'Where are the ritual items now?',
            nextIndex: 8
          }
        ]
      },
      {
        speaker: 'Ghostly Priest',
        text: 'Five pure souls. Emma the eldest, always caring for the others. Thomas, so bright and curious. William with his mischievous smile. Little Lucy who never spoke above a whisper. And Sarah, who saw things others couldn't.',
        responses: [
          {
            text: 'And they're all trapped here?',
            nextIndex: 10
          },
          {
            text: 'How can I free them?',
            nextIndex: 6
          }
        ]
      },
      {
        speaker: 'Ghostly Priest',
        text: 'The journal in the inn contains the true procedure. We misinterpreted crucial elements. The five must be arranged in order of age, not by element as we did. And the words spoken must be of release, not binding.',
        responses: [
          {
            text: 'Where are the ritual items?',
            nextIndex: 8
          },
          {
            text: 'I'll complete the ritual correctly.',
            outcome: {
              status: { priest_helped: true },
              notification: {
                id: 'ritual-guidance',
                message: 'The priest's expression softens. "Perhaps there is hope for redemption after all."',
                type: 'info'
              }
            }
          }
        ]
      },
      {
        speaker: 'Ghostly Priest',
        text: 'It began with livestock dying mysteriously. Then crops withered overnight. Children spoke of shadowy figures at their windows. The well water turned brackish. Many believed it was a curse.',
        responses: [
          {
            text: 'Was it a curse?',
            nextIndex: 11
          },
          {
            text: 'Let's talk about the ritual.',
            nextIndex: 3
          }
        ]
      },
      {
        speaker: 'Ghostly Priest',
        text: 'Scattered throughout the village. The candle remains in the church. The mirror in the clock tower. The amulet was buried in the cemetery. The herb grows wild by the forest edge now. And the journal lies forgotten in the inn.',
        responses: [
          {
            text: 'Thank you for your help.',
            outcome: {
              status: { items_location_known: true },
              notification: {
                id: 'items-location',
                message: 'You now know where to find all five ritual items. Mark these locations in your memory.',
                type: 'discovery'
              }
            }
          }
        ]
      },
      {
        speaker: 'Ghostly Priest',
        text: 'Perhaps. If the ritual is completed properly, and the children's spirits are freed... maybe then God will finally hear my prayers for absolution.',
        responses: [
          {
            text: 'I'll try to set things right.',
            outcome: {
              status: { priest_comforted: true },
              notification: {
                id: 'priest-comfort',
                message: 'The priest bows his head. "Thank you, stranger. May God guide your path where He abandoned mine."',
                type: 'info'
              }
            }
          }
        ]
      },
      {
        speaker: 'Ghostly Priest',
        text: 'Yes. Along with everyone who was in Eden's Hollow that fateful day. We all exist in this limbo, this eternal dusk. Neither moving on nor truly living.',
        responses: [
          {
            text: 'I'll find a way to free you all.',
            nextIndex: 6
          }
        ]
      },
      {
        speaker: 'Ghostly Priest',
        text: 'We may never know. The ritual interrupted whatever was happening. Now we're trapped in the moment of our greatest sin, forever reliving it.',
        responses: [
          {
            text: 'How can I break this cycle?',
            nextIndex: 6
          }
        ]
      }
    ]
  }
};