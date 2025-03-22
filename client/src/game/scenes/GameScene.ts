/**
 * Main Game Scene for Eden's Hollow
 * Handles core gameplay mechanics, level rendering, and character interactions
 */

export default class GameScene extends Phaser.Scene {
  // Game objects
  private player!: Phaser.Physics.Arcade.Sprite;
  private map!: Phaser.Tilemaps.Tilemap;
  private tileset!: Phaser.Tilemaps.Tileset;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  private wallsLayer!: Phaser.Tilemaps.TilemapLayer;
  private objectsLayer!: Phaser.Tilemaps.TilemapLayer;
  
  // Game items and collectibles
  private coins!: Phaser.Physics.Arcade.Group;
  private potions!: Phaser.Physics.Arcade.Group;
  private chests!: Phaser.Physics.Arcade.Group;
  
  // Game state
  private score: number = 0;
  private health: number = 100;
  
  // UI elements
  private scoreText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  
  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private actionKey!: Phaser.Input.Keyboard.Key;
  
  constructor() {
    super('GameScene');
  }
  
  create(): void {
    this.createMap();
    this.createPlayer();
    this.createItems();
    this.createUI();
    this.setupInput();
    this.setupCamera();
    this.setupCollisions();
    
    console.log('Game scene created successfully');
  }
  
  update(): void {
    this.handlePlayerMovement();
    this.handlePlayerInteractions();
    this.updateUI();
  }
  
  /**
   * Create and configure the game map using tilemap
   */
  private createMap(): void {
    // Create tilemap from JSON
    this.map = this.make.tilemap({ key: 'map' });
    
    // Add the tileset image
    this.tileset = this.map.addTilesetImage('main', 'tileset');
    
    // Create layers
    this.groundLayer = this.map.createLayer('ground', this.tileset, 0, 0);
    this.wallsLayer = this.map.createLayer('walls', this.tileset, 0, 0);
    this.objectsLayer = this.map.createLayer('objects', this.tileset, 0, 0);
    
    // Set collisions for the walls layer
    this.wallsLayer.setCollisionByProperty({ collides: true });
    
    // Set depth ordering for layers
    this.groundLayer.setDepth(0);
    this.wallsLayer.setDepth(10);
    this.objectsLayer.setDepth(20);
  }
  
  /**
   * Create and configure the player character
   */
  private createPlayer(): void {
    // Find player spawn position from object layer
    const spawnPoint = this.map.findObject('objects', (obj: any) => obj.name === 'Player') || { x: 100, y: 100 };
    
    // Create player sprite using pixelated texture
    this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'player_pixel');
    this.player.setDepth(30);
    
    // Set player collision bounds
    this.player.setSize(24, 24);
    this.player.setOffset(4, 8);
    
    // Start with the player facing down
    this.player.anims.play('player_down');
  }
  
  /**
   * Create collectible items throughout the level
   */
  private createItems(): void {
    // Create groups for the various items
    this.coins = this.physics.add.group();
    this.potions = this.physics.add.group();
    this.chests = this.physics.add.group();
    
    // Place coins
    const coinObjects = this.map.createFromObjects('objects', { 
      name: 'Coin',
      key: 'coin_pixel'
    });
    
    this.coins.addMultiple(coinObjects);
    this.physics.world.enable(coinObjects);
    
    coinObjects.forEach((coin: any) => {
      coin.setDepth(25);
      coin.setScale(0.8);
      coin.body.setSize(20, 20);
      
      // Add a simple bobbing animation
      this.tweens.add({
        targets: coin,
        y: coin.y - 5,
        duration: 800,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    });
    
    // Place potions
    const potionObjects = this.map.createFromObjects('objects', { 
      name: 'Potion',
      key: 'potion_pixel'
    });
    
    this.potions.addMultiple(potionObjects);
    this.physics.world.enable(potionObjects);
    
    potionObjects.forEach((potion: any) => {
      potion.setDepth(25);
      potion.body.setSize(20, 24);
    });
    
    // Place chests
    const chestObjects = this.map.createFromObjects('objects', { 
      name: 'Chest',
      key: 'chest_pixel'
    });
    
    this.chests.addMultiple(chestObjects);
    this.physics.world.enable(chestObjects);
    
    chestObjects.forEach((chest: any) => {
      chest.setDepth(25);
      chest.body.setSize(28, 20);
      
      // Add a property to track if the chest has been opened
      chest.isOpen = false;
    });
  }
  
  /**
   * Create UI elements for score, health, etc.
   */
  private createUI(): void {
    // Create a UI container that stays fixed to the camera
    const uiContainer = this.add.container(0, 0);
    uiContainer.setScrollFactor(0); // Fix to camera
    uiContainer.setDepth(100); // Always on top
    
    // Add a semi-transparent background panel
    const uiPanel = this.add.rectangle(
      10, 10, 200, 80, 
      0x000000, 0.5
    );
    uiPanel.setOrigin(0, 0);
    
    // Add score text
    this.scoreText = this.add.text(
      20, 20, 
      `Score: ${this.score}`, 
      { font: '16px monospace', color: '#ffffff' }
    );
    
    // Add health text
    this.healthText = this.add.text(
      20, 50, 
      `Health: ${this.health}`, 
      { font: '16px monospace', color: '#ffffff' }
    );
    
    // Add all elements to the UI container
    uiContainer.add([uiPanel, this.scoreText, this.healthText]);
  }
  
  /**
   * Setup keyboard and touch input
   */
  private setupInput(): void {
    // Create cursor keys for movement
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // Create action key (Space)
    this.actionKey = this.input.keyboard.addKey('SPACE');
    
    // Add touch input for mobile devices
    this.input.addPointer(1);
    
    // Check for touch device - simplified for compatibility
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouchDevice) {
      // Implement joystick if needed
      console.log('Touch device detected, joystick could be implemented here');
    }
  }
  
  /**
   * Configure the camera to follow the player
   */
  private setupCamera(): void {
    // Set bounds to the map size
    this.cameras.main.setBounds(
      0, 0, 
      this.map.widthInPixels, 
      this.map.heightInPixels
    );
    
    // Set camera to follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    
    // Add some zoom controls (for debugging)
    this.input.keyboard.on('keydown-Z', () => {
      this.cameras.main.zoom -= 0.1;
    });
    
    this.input.keyboard.on('keydown-X', () => {
      this.cameras.main.zoom += 0.1;
    });
  }
  
  /**
   * Setup collision detection between game elements
   */
  private setupCollisions(): void {
    // Player collides with walls
    this.physics.add.collider(this.player, this.wallsLayer);
    
    // Player overlaps with collectible items
    this.physics.add.overlap(
      this.player, this.coins, 
      this.collectCoin, undefined, this
    );
    
    this.physics.add.overlap(
      this.player, this.potions, 
      this.collectPotion, undefined, this
    );
    
    this.physics.add.overlap(
      this.player, this.chests, 
      this.interactWithChest, undefined, this
    );
  }
  
  /**
   * Handle player movement based on input
   */
  private handlePlayerMovement(): void {
    // Reset velocity
    this.player.setVelocity(0);
    
    const speed = 120;
    let moving = false;
    
    // Handle keyboard input
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play('player_left', true);
      moving = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play('player_right', true);
      moving = true;
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
      if (!moving) this.player.anims.play('player_up', true);
      moving = true;
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
      if (!moving) this.player.anims.play('player_down', true);
      moving = true;
    }
    
    // Stop animations if not moving
    if (!moving) {
      this.player.anims.stop();
    }
  }
  
  /**
   * Handle player interactions with objects
   */
  private handlePlayerInteractions(): void {
    // Check for action key press to interact with nearby objects
    if (Phaser.Input.Keyboard.JustDown(this.actionKey)) {
      // This is handled by the overlap callbacks
    }
  }
  
  /**
   * Update UI elements based on game state
   */
  private updateUI(): void {
    // Update score and health displays
    this.scoreText.setText(`Score: ${this.score}`);
    this.healthText.setText(`Health: ${this.health}`);
  }
  
  /**
   * Collect a coin and increase score
   */
  private collectCoin(player: any, coin: any): void {
    // Disable the coin 
    coin.disableBody(true, true);
    
    // Play collection animation
    this.tweens.add({
      targets: coin,
      y: coin.y - 20,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        coin.destroy();
      }
    });
    
    // Update score
    this.score += 10;
    
    // Play coin collection sound effect (if available)
    // this.sound.play('coin_pickup');
  }
  
  /**
   * Collect a potion and restore health
   */
  private collectPotion(player: any, potion: any): void {
    // Disable the potion
    potion.disableBody(true, true);
    
    // Play collection animation
    this.tweens.add({
      targets: potion,
      y: potion.y - 20,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        potion.destroy();
      }
    });
    
    // Increase health
    this.health = Math.min(100, this.health + 25);
    
    // Play potion collection sound effect (if available)
    // this.sound.play('potion_pickup');
  }
  
  /**
   * Interact with a chest to open it and get rewards
   */
  private interactWithChest(player: any, chest: any): void {
    // Only open the chest if action key is pressed and it's not already open
    if (Phaser.Input.Keyboard.JustDown(this.actionKey) && !chest.isOpen) {
      // Mark the chest as open
      chest.isOpen = true;
      
      // Play chest opening animation
      this.tweens.add({
        targets: chest,
        y: chest.y - 5,
        duration: 100,
        ease: 'Power1',
        yoyo: true,
        onComplete: () => {
          // Change chest appearance to open state
          // chest.setTexture('chest_open');
          
          // Award random loot
          const lootValue = Phaser.Math.Between(20, 50);
          this.score += lootValue;
          
          // Display floating score text
          const scorePopup = this.add.text(
            chest.x, chest.y - 20, 
            `+${lootValue}`, 
            { font: '14px monospace', color: '#ffff00' }
          );
          
          // Animate the score popup
          this.tweens.add({
            targets: scorePopup,
            y: scorePopup.y - 30,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
              scorePopup.destroy();
            }
          });
        }
      });
      
      // Play chest opening sound effect (if available)
      // this.sound.play('chest_open');
    }
  }
}