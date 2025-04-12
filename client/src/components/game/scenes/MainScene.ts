/**
 * Eden's Hollow Main Scene
 * 
 * This scene handles the main game visuals including:
 * - Background images
 * - Visual effects
 * - Story text display
 * - Animation effects
 */

import { GameState, Passage } from '../../../types/game';
import { loadBackground } from '../../../utils/gameAssetLoader';

interface MainSceneProps {
  gameState: GameState;
  currentPassage: Passage | null;
}

export default class MainScene extends Phaser.Scene {
  private gameState: GameState;
  private currentPassage: Passage | null;
  
  // Visual elements
  private background: Phaser.GameObjects.Image | null = null;
  private vignette: Phaser.GameObjects.Image | null = null;
  private textDisplay: Phaser.GameObjects.Text | null = null;
  private textContainer: Phaser.GameObjects.Container | null = null;
  private sanityMeter: Phaser.GameObjects.Container | null = null;
  
  // Animation properties
  private textRevealSpeed = 30; // Characters per second
  private currentText = '';
  private targetText = '';
  private charIndex = 0;
  private textRevealTimer: Phaser.Time.TimerEvent | null = null;
  
  // Visual effect properties
  private sanityEffects: Phaser.GameObjects.Image[] = [];
  private showingLowSanityEffects = false;
  
  constructor(props: MainSceneProps) {
    super({ key: 'MainScene' });
    this.gameState = props.gameState;
    this.currentPassage = props.currentPassage;
  }
  
  preload() {
    // Create gradient background fallback first
    const width = this.cameras.main.width || 800;
    const height = this.cameras.main.height || 600;
    
    // Create fallback textures for backgrounds
    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x000000, 0x000011, 0x000022, 0x000011, 1);
    bgGraphics.fillRect(0, 0, width, height);
    bgGraphics.generateTexture('bg-fallback', width, height);
    bgGraphics.destroy();
    
    // Create fallback texture for vignette
    const vignetteGraphics = this.add.graphics();
    vignetteGraphics.fillStyle(0x000000, 0);
    vignetteGraphics.fillRect(0, 0, width, height);
    vignetteGraphics.generateTexture('vignette-fallback', width, height);
    vignetteGraphics.destroy();
    
    // Try to load assets with error handling
    try {
      this.load.image('vignette', '/games/edens-hollow/effects/vignette.png');
    } catch (e) {
      console.log('Using fallback for vignette');
    }
    
    try {
      this.load.image('sanity-effect-low', '/games/edens-hollow/effects/sanity-low.png');
      this.load.image('sanity-effect-critical', '/games/edens-hollow/effects/sanity-critical.png');
    } catch (e) {
      console.log('Using fallbacks for sanity effects');
    }
    
    // Load initial background based on story
    if (this.currentPassage) {
      try {
        loadBackground(this, 'manor-exterior');
      } catch (e) {
        console.log('Error loading initial background:', e);
      }
    }
  }
  
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create a dark background as fallback first
    const bgFallback = this.add.graphics();
    bgFallback.fillStyle(0x000011, 1);
    bgFallback.fillRect(0, 0, width, height);
    
    // Create background with fallback
    try {
      this.background = this.add.image(width / 2, height / 2, 'background-manor-exterior');
      this.background.setDisplaySize(width, height);
    } catch (e) {
      console.log('Using fallback background');
      this.background = this.add.image(width / 2, height / 2, 'bg-fallback');
      this.background.setDisplaySize(width, height);
    }
    
    // Create text container (with black semi-transparent background)
    this.createTextContainer();
    
    // Create sanity meter
    this.createSanityMeter();
    
    // Create a vignette effect using canvas
    const vignetteTexture = this.textures.createCanvas('vignette-texture', width, height);
    
    if (vignetteTexture) {
      const vignetteContext = vignetteTexture.getContext();
      
      // Create radial gradient for vignette
      const vignetteGrad = vignetteContext.createRadialGradient(
        width/2, height/2, height * 0.5, // inner circle
        width/2, height/2, height        // outer circle to edge
      );
      vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');     // transparent center
      vignetteGrad.addColorStop(1, 'rgba(0,0,0,0.7)');   // dark edges
      
      vignetteContext.fillStyle = vignetteGrad;
      vignetteContext.fillRect(0, 0, width, height);
      vignetteTexture.refresh();
    } else {
      // Create a fallback vignette if canvas creation failed
      const vignetteGraphics = this.add.graphics();
      vignetteGraphics.fillStyle(0x000000, 0);
      vignetteGraphics.fillRect(0, 0, width, height);
      vignetteGraphics.generateTexture('vignette-texture', width, height);
      vignetteGraphics.destroy();
    }
    
    // Add the vignette 
    this.vignette = this.add.image(width / 2, height / 2, 'vignette-texture');
    this.vignette.setDisplaySize(width, height);
    this.vignette.setAlpha(0.4);
    
    // Set up sanity visual effects (initially hidden)
    this.setupSanityEffects();
    
    // Update with current passage
    if (this.currentPassage) {
      this.showPassage(this.currentPassage);
    }
  }
  
  createTextContainer() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.textContainer = this.add.container(0, 0);
    
    // Semi-transparent black background
    const textBg = this.add.rectangle(
      width / 2, 
      height - 200, 
      width - 40, 
      300, 
      0x000000, 
      0.7
    );
    
    // Text display
    this.textDisplay = this.add.text(
      30, 
      height - 330, 
      '', 
      {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: '#FFFFFF',
        align: 'left',
        wordWrap: { width: width - 60 }
      }
    );
    
    this.textContainer.add(textBg);
    this.textContainer.add(this.textDisplay);
  }
  
  createSanityMeter() {
    const width = this.cameras.main.width;
    
    this.sanityMeter = this.add.container(width - 150, 50);
    
    // Meter background
    const meterBg = this.add.rectangle(0, 0, 120, 25, 0x000000, 0.7);
    meterBg.setStrokeStyle(2, 0xAAAAAA);
    
    // Meter label
    const meterLabel = this.add.text(-55, -20, 'SANITY', {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#FFFFFF'
    });
    
    // Meter fill (will be updated in update())
    const meterFill = this.add.rectangle(-60, 0, 0, 21, 0x00FF00);
    meterFill.setName('meterFill');
    
    // Add to container
    this.sanityMeter.add(meterBg);
    this.sanityMeter.add(meterLabel);
    this.sanityMeter.add(meterFill);
  }
  
  setupSanityEffects() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create better fallback graphics for sanity effects
    // For low sanity - a slight dark red vignette
    const lowSanityCanvas = this.textures.createCanvas('low-sanity-gradient', width, height);
    
    if (lowSanityCanvas) {
      const lowSanityContext = lowSanityCanvas.getContext();
      
      // Create radial gradient (dark red around edges)
      const lowGrad = lowSanityContext.createRadialGradient(
        width/2, height/2, height * 0.25, 
        width/2, height/2, height
      );
      lowGrad.addColorStop(0, 'rgba(0,0,0,0)');
      lowGrad.addColorStop(1, 'rgba(100,0,0,0.5)');
      
      lowSanityContext.fillStyle = lowGrad;
      lowSanityContext.fillRect(0, 0, width, height);
      lowSanityCanvas.refresh();
    }
    
    // For critical sanity - more intense dark red effect
    const criticalSanityCanvas = this.textures.createCanvas('critical-sanity-gradient', width, height);
    
    if (criticalSanityCanvas) {
      const criticalSanityContext = criticalSanityCanvas.getContext();
      
      // Create radial gradient (more intense dark red)
      const criticalGrad = criticalSanityContext.createRadialGradient(
        width/2, height/2, height * 0.1, 
        width/2, height/2, height * 0.7
      );
      criticalGrad.addColorStop(0, 'rgba(0,0,0,0)');
      criticalGrad.addColorStop(1, 'rgba(120,0,0,0.7)');
      
      criticalSanityContext.fillStyle = criticalGrad;
      criticalSanityContext.fillRect(0, 0, width, height);
      criticalSanityCanvas.refresh();
    }
    
    // Low sanity overlay - use canvas texture instead of loading image
    const lowSanityEffect = this.add.image(width / 2, height / 2, 'low-sanity-gradient');
    lowSanityEffect.setDisplaySize(width, height);
    lowSanityEffect.setAlpha(0);
    
    // Critical sanity overlay - use canvas texture instead of loading image
    const criticalSanityEffect = this.add.image(width / 2, height / 2, 'critical-sanity-gradient');
    criticalSanityEffect.setDisplaySize(width, height);
    criticalSanityEffect.setAlpha(0);
    
    this.sanityEffects = [lowSanityEffect, criticalSanityEffect];
  }
  
  updateGameState(gameState: GameState, currentPassage: Passage | null) {
    this.gameState = gameState;
    
    // Update passage if changed
    if (currentPassage !== this.currentPassage) {
      this.currentPassage = currentPassage;
      if (currentPassage) {
        this.showPassage(currentPassage);
      }
    }
    
    // Update sanity effects based on current sanity
    this.updateSanityEffects();
  }
  
  showPassage(passage: Passage) {
    // Load appropriate background based on passage location
    this.loadBackgroundForPassage(passage.id);
    
    // Reset text animation
    if (this.textRevealTimer) {
      this.textRevealTimer.remove();
    }
    
    // Set up text reveal
    this.charIndex = 0;
    this.currentText = '';
    this.targetText = passage.text;
    
    // Determine text reveal speed based on game settings
    const charsPerSecond = this.getTextSpeed();
    
    // Start text reveal
    this.textRevealTimer = this.time.addEvent({
      delay: 1000 / charsPerSecond,
      callback: this.revealNextCharacter,
      callbackScope: this,
      loop: true
    });
  }
  
  revealNextCharacter() {
    if (this.charIndex < this.targetText.length) {
      this.charIndex++;
      this.currentText = this.targetText.substring(0, this.charIndex);
      
      if (this.textDisplay) {
        this.textDisplay.setText(this.currentText);
      }
    } else {
      // All text revealed
      if (this.textRevealTimer) {
        this.textRevealTimer.remove();
      }
    }
  }
  
  getTextSpeed() {
    // Return characters per second based on game settings
    const { textSpeed } = this.gameState.settings;
    
    switch (textSpeed) {
      case 'slow':
        return 20;
      case 'fast':
        return 50;
      case 'normal':
      default:
        return 30;
    }
  }
  
  loadBackgroundForPassage(passageId: string) {
    let backgroundKey = 'manor-exterior'; // default
    
    // Map passage IDs to backgrounds
    if (passageId.includes('foyer')) {
      backgroundKey = 'manor-foyer';
    } else if (passageId.includes('garden')) {
      backgroundKey = 'manor-garden';
    } else if (passageId.includes('entrance')) {
      backgroundKey = 'manor-entrance';
    } else if (passageId.includes('retreat')) {
      backgroundKey = 'manor-exterior-dusk';
    } else if (passageId.includes('early-departure')) {
      backgroundKey = 'manor-exterior-dusk';
    } else if (passageId.includes('ending')) {
      backgroundKey = 'town-dusk';
    }
    
    // Create a fallback rectangle as background if the background doesn't exist yet
    // This allows the game to function properly even if image assets are missing
    if (!this.background) {
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
      
      // Create a gradient-like background as fallback
      const gradient = this.add.graphics();
      gradient.fillGradientStyle(0x000000, 0x000000, 0x1a1a2e, 0x121212, 1);
      gradient.fillRect(0, 0, width, height);
      
      this.background = this.add.image(width / 2, height / 2, 'background-manor-exterior');
      this.background.setDisplaySize(width, height);
    }
    
    // Check if we have a current passage background specified
    if (this.currentPassage && this.currentPassage.background) {
      // Override with the specific background from the passage data
      backgroundKey = this.currentPassage.background;
    }
    
    // Try to load the background image
    try {
      loadBackground(this, backgroundKey);
      
      // Update the background image when loaded
      this.textures.once(`addtexture_background-${backgroundKey}`, () => {
        if (this.background) {
          this.background.setTexture(`background-${backgroundKey}`);
          this.background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        }
      });
    } catch (error) {
      console.log(`Background image for ${backgroundKey} could not be loaded. Using fallback.`);
    }
  }
  
  updateSanityEffects() {
    const sanity = this.gameState.sanity;
    
    // Update meter fill
    if (this.sanityMeter) {
      const fill = this.sanityMeter.getByName('meterFill') as Phaser.GameObjects.Rectangle;
      if (fill) {
        // Width from 0 to 120 based on sanity 0-100
        fill.width = (sanity / 100) * 120;
        
        // Color ranges from red (0) to yellow (50) to green (100)
        if (sanity < 50) {
          fill.setFillStyle(0xFF0000 + Math.floor((sanity / 50) * 255) * 256);
        } else {
          fill.setFillStyle(0xFFFF00 - Math.floor(((sanity - 50) / 50) * 255) * 256);
        }
      }
    }
    
    // Update visual effects based on sanity
    if (sanity < 30) {
      const lowEffect = this.sanityEffects[0];
      const criticalEffect = this.sanityEffects[1];
      
      if (sanity < 15) {
        // Critical sanity effects (< 15)
        lowEffect.setAlpha(0.7);
        criticalEffect.setAlpha(0.5);
        this.showingLowSanityEffects = true;
      } else {
        // Low sanity effects (15-30)
        lowEffect.setAlpha(0.4);
        criticalEffect.setAlpha(0);
        this.showingLowSanityEffects = true;
      }
    } else {
      // Normal sanity
      this.sanityEffects.forEach(effect => effect.setAlpha(0));
      this.showingLowSanityEffects = false;
    }
  }
  
  update(time: number, delta: number) {
    // Add subtle animation to sanity effects if active
    if (this.showingLowSanityEffects) {
      this.sanityEffects.forEach(effect => {
        const pulse = 0.1 * Math.sin(time / 1000);
        effect.setAlpha(effect.alpha + pulse);
      });
    }
  }
}