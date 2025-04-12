/**
 * Eden's Hollow UI Scene
 * 
 * This scene handles the UI elements and player interactions:
 * - Displaying choices
 * - Handling player input
 * - Showing inventory items
 * - Transition effects
 */

import { GameState, Choice, Passage } from '../../../types/game';

interface UISceneProps {
  gameState: GameState;
  currentPassage: Passage | null;
  onChoiceSelected: (choice: Choice) => void;
}

export default class UIScene extends Phaser.Scene {
  private gameState: GameState;
  private currentPassage: Passage | null;
  private onChoiceSelected: (choice: Choice) => void;
  
  // UI elements
  private choiceButtons: Phaser.GameObjects.Container[] = [];
  private inventoryIcons: Phaser.GameObjects.Image[] = [];
  private fadeRect: Phaser.GameObjects.Rectangle | null = null;
  
  // State tracking
  private isFading = false;
  private buttonHoverIndex = -1;
  
  constructor(props: UISceneProps) {
    super({ key: 'UIScene' });
    this.gameState = props.gameState;
    this.currentPassage = props.currentPassage;
    this.onChoiceSelected = props.onChoiceSelected;
  }
  
  preload() {
    // Load UI assets
    this.load.image('button-bg', '/games/edens-hollow/ui/button-bg.png');
    this.load.image('button-bg-hover', '/games/edens-hollow/ui/button-bg-hover.png');
    this.load.image('button-bg-disabled', '/games/edens-hollow/ui/button-bg-disabled.png');
  }
  
  create() {
    // Set up fade rectangle for transitions (initially transparent)
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.fadeRect = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0);
    this.fadeRect.setDepth(1000); // Place above all other elements
    
    // Update with current passage
    if (this.currentPassage) {
      this.showChoicesForPassage(this.currentPassage);
    }
    
    // Add keyboard navigation for choices
    this.setupKeyboardNavigation();
  }
  
  updateGameState(gameState: GameState, currentPassage: Passage | null) {
    this.gameState = gameState;
    
    // Update passage if changed
    if (currentPassage !== this.currentPassage) {
      this.currentPassage = currentPassage;
      
      // Start fadeout transition
      this.startTransition(() => {
        // Clear previous choices
        this.clearChoices();
        
        // Show new choices after transition
        if (currentPassage) {
          this.showChoicesForPassage(currentPassage);
        }
      });
    }
  }
  
  clearChoices() {
    // Remove all choice buttons
    this.choiceButtons.forEach(button => button.destroy());
    this.choiceButtons = [];
  }
  
  showChoicesForPassage(passage: Passage) {
    if (!passage.choices || passage.choices.length === 0) return;
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Position choices at the bottom of the screen above the text area
    const startY = height - 400;
    const buttonHeight = 60;
    const padding = 10;
    
    passage.choices.forEach((choice, index) => {
      // Determine if this choice should be locked
      const isLocked = this.isChoiceLocked(choice);
      
      // Create choice button container
      const buttonContainer = this.add.container(width / 2, startY + (buttonHeight + padding) * index);
      
      // Button background
      const buttonBg = this.add.image(0, 0, isLocked ? 'button-bg-disabled' : 'button-bg');
      buttonBg.setDisplayWidth(width - 100);
      buttonBg.setDisplayHeight(buttonHeight);
      buttonBg.setOrigin(0.5);
      
      // Choice text
      const textColor = isLocked ? '#777777' : '#FFFFFF';
      const choiceText = this.add.text(0, 0, choice.text, {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: textColor,
        align: 'center',
        wordWrap: { width: width - 150 }
      });
      choiceText.setOrigin(0.5);
      
      // Add to container
      buttonContainer.add(buttonBg);
      buttonContainer.add(choiceText);
      
      // Make interactive if not locked
      if (!isLocked) {
        buttonBg.setInteractive({ useHandCursor: true });
        
        buttonBg.on('pointerover', () => {
          buttonBg.setTexture('button-bg-hover');
          this.buttonHoverIndex = index;
        });
        
        buttonBg.on('pointerout', () => {
          buttonBg.setTexture('button-bg');
          this.buttonHoverIndex = -1;
        });
        
        buttonBg.on('pointerdown', () => {
          this.handleChoiceSelection(choice);
        });
      } else {
        // Add lock icon or indicator for locked choices
        let lockReason = '';
        
        if (choice.minSanity && this.gameState.sanity < choice.minSanity) {
          lockReason = `Requires ${choice.minSanity} Sanity`;
        } else if (choice.maxSanity && this.gameState.sanity > choice.maxSanity) {
          lockReason = `Requires less than ${choice.maxSanity} Sanity`;
        } else if (choice.requiresItems && choice.requiresItems.length > 0) {
          const missingItems = choice.requiresItems.filter(
            item => !this.gameState.inventory.includes(item)
          );
          if (missingItems.length > 0) {
            lockReason = `Missing item${missingItems.length > 1 ? 's' : ''}`;
          }
        } else if (choice.requiresFlags) {
          const missingFlags = Object.entries(choice.requiresFlags).filter(
            ([flag, value]) => this.gameState.flags[flag] !== value
          );
          if (missingFlags.length > 0) {
            lockReason = 'Conditions not met';
          }
        }
        
        // Add lock reason text
        const lockText = this.add.text(width / 2 - 120, 0, lockReason, {
          fontFamily: 'Georgia, serif',
          fontSize: '12px',
          color: '#FF4444',
          align: 'right'
        });
        lockText.setOrigin(1, 0.5);
        buttonContainer.add(lockText);
      }
      
      this.choiceButtons.push(buttonContainer);
    });
  }
  
  isChoiceLocked(choice: Choice): boolean {
    // Check all choice requirements against current game state
    
    // Sanity requirements
    if (choice.minSanity && this.gameState.sanity < choice.minSanity) {
      return true;
    }
    
    if (choice.maxSanity && this.gameState.sanity > choice.maxSanity) {
      return true;
    }
    
    // Item requirements
    if (choice.requiresItems && choice.requiresItems.length > 0) {
      const hasAllItems = choice.requiresItems.every(
        item => this.gameState.inventory.includes(item)
      );
      if (!hasAllItems) return true;
    }
    
    // Flag requirements
    if (choice.requiresFlags) {
      const allFlagsMatch = Object.entries(choice.requiresFlags).every(
        ([flag, value]) => this.gameState.flags[flag] === value
      );
      if (!allFlagsMatch) return true;
    }
    
    return false;
  }
  
  handleChoiceSelection(choice: Choice) {
    // Don't allow selections during transitions
    if (this.isFading) return;
    
    // Trigger sound effect
    this.sound.play('choice');
    
    // Start transition effect
    this.startTransition(() => {
      // Call callback with selected choice
      this.onChoiceSelected(choice);
    });
  }
  
  startTransition(callback: () => void) {
    this.isFading = true;
    
    // Fade out to black
    if (this.fadeRect) {
      this.tweens.add({
        targets: this.fadeRect,
        alpha: 1,
        duration: 600,
        onComplete: () => {
          // Execute callback when fade out is complete
          callback();
          
          // Fade back in
          this.tweens.add({
            targets: this.fadeRect,
            alpha: 0,
            duration: 600,
            onComplete: () => {
              this.isFading = false;
            }
          });
        }
      });
    }
  }
  
  setupKeyboardNavigation() {
    // Add keyboard navigation for choices
    const upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    upKey.on('down', () => {
      if (this.isFading) return;
      
      if (this.buttonHoverIndex <= 0) {
        // Wrap to bottom
        this.buttonHoverIndex = this.choiceButtons.length - 1;
      } else {
        this.buttonHoverIndex--;
      }
      
      this.updateButtonHighlights();
    });
    
    downKey.on('down', () => {
      if (this.isFading) return;
      
      if (this.buttonHoverIndex >= this.choiceButtons.length - 1) {
        // Wrap to top
        this.buttonHoverIndex = 0;
      } else {
        this.buttonHoverIndex++;
      }
      
      this.updateButtonHighlights();
    });
    
    const selectHandler = () => {
      if (this.isFading) return;
      
      if (this.buttonHoverIndex >= 0 && this.buttonHoverIndex < this.choiceButtons.length &&
          this.currentPassage && this.currentPassage.choices) {
        
        const choice = this.currentPassage.choices[this.buttonHoverIndex];
        
        // Check if choice is locked
        if (!this.isChoiceLocked(choice)) {
          this.handleChoiceSelection(choice);
        }
      }
    };
    
    enterKey.on('down', selectHandler);
    spaceKey.on('down', selectHandler);
  }
  
  updateButtonHighlights() {
    // Update visual state of all choice buttons based on hover index
    this.choiceButtons.forEach((button, index) => {
      const buttonBg = button.getAt(0) as Phaser.GameObjects.Image;
      if (buttonBg && buttonBg.input && buttonBg.input.enabled) {
        if (index === this.buttonHoverIndex) {
          buttonBg.setTexture('button-bg-hover');
        } else {
          buttonBg.setTexture('button-bg');
        }
      }
    });
  }
}