/**
 * Asset Loader for Eden's Hollow
 * Handles loading game assets with progress tracking
 */

// Asset type definitions
export interface Asset {
  key: string;
  path: string;
  type: AssetType;
}

export enum AssetType {
  IMAGE = 'image',
  SPRITESHEET = 'spritesheet',
  AUDIO = 'audio',
  TILEMAP = 'tilemapTiledJSON',
  TILESET = 'image',
}

// Asset group interface for organizing assets by category
export interface AssetGroup {
  name: string;
  assets: Asset[];
}

// Default game assets
export const defaultAssets: AssetGroup[] = [
  {
    name: 'Environment',
    assets: [
      {
        key: 'tileset',
        path: '/assets/environment/tileset.svg',
        type: AssetType.TILESET,
      },
      {
        key: 'map',
        path: '/assets/environment/map.json',
        type: AssetType.TILEMAP,
      },
    ],
  },
  {
    name: 'Characters',
    assets: [
      {
        key: 'player',
        path: '/assets/characters/player.svg',
        type: AssetType.SPRITESHEET,
      },
    ],
  },
  {
    name: 'Items',
    assets: [
      {
        key: 'potion',
        path: '/assets/items/potion.svg',
        type: AssetType.IMAGE,
      },
      {
        key: 'coin',
        path: '/assets/items/coin.svg',
        type: AssetType.IMAGE,
      },
      {
        key: 'chest',
        path: '/assets/items/chest.svg',
        type: AssetType.IMAGE,
      },
    ],
  },
  {
    name: 'UI',
    assets: [
      {
        key: 'button',
        path: '/assets/ui/button.svg',
        type: AssetType.IMAGE,
      },
    ],
  },
];

/**
 * Asset Loader class
 * Manages loading game assets with progress tracking
 */
export default class AssetLoader {
  private scene: Phaser.Scene;
  private totalAssets: number = 0;
  private loadedAssets: number = 0;

  /**
   * Create a new AssetLoader
   * @param scene The Phaser scene to use for loading
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Load an asset based on its type
   * @param asset The asset to load
   */
  private loadAsset(asset: Asset): void {
    const { key, path, type } = asset;

    switch (type) {
      case AssetType.IMAGE:
        this.scene.load.image(key, path);
        break;
      case AssetType.SPRITESHEET:
        // For SVG spritesheets, we need to specify frame size
        // Default values that will be updated later
        this.scene.load.spritesheet(key, path, {
          frameWidth: 32,
          frameHeight: 32,
        });
        break;
      case AssetType.AUDIO:
        this.scene.load.audio(key, path);
        break;
      case AssetType.TILEMAP:
        this.scene.load.tilemapTiledJSON(key, path);
        break;
      default:
        console.warn(`Unknown asset type ${type} for ${key}`);
        break;
    }
  }

  /**
   * Load all assets from asset groups
   * @param assetGroups The asset groups to load
   * @param onProgress Progress callback function
   */
  loadAssets(
    assetGroups: AssetGroup[],
    onProgress?: (progress: number) => void
  ): void {
    // Count total assets
    this.totalAssets = assetGroups.reduce(
      (total, group) => total + group.assets.length,
      0
    );
    this.loadedAssets = 0;

    // Setup progress tracking
    this.scene.load.on('progress', (value: number) => {
      if (onProgress) {
        onProgress(value);
      }
    });

    // Load all assets
    assetGroups.forEach((group) => {
      group.assets.forEach((asset) => {
        this.loadAsset(asset);
      });
    });

    // Start loading
    this.scene.load.start();
  }

  /**
   * Load additional assets after the initial load
   * @param assets Array of assets to load
   * @param onComplete Callback function when all assets are loaded
   */
  loadAdditionalAssets(assets: Asset[], onComplete?: () => void): void {
    if (assets.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    // Setup complete callback
    this.scene.load.once('complete', () => {
      if (onComplete) onComplete();
    });

    // Load all assets
    assets.forEach((asset) => {
      this.loadAsset(asset);
    });

    // Start loading
    this.scene.load.start();
  }

  /**
   * Check if an asset is loaded
   * @param key The asset key to check
   * @returns True if the asset is loaded, false otherwise
   */
  isAssetLoaded(key: string): boolean {
    return this.scene.textures.exists(key);
  }

  /**
   * Get total loading progress
   * @returns Progress value between 0 and 1
   */
  getProgress(): number {
    return this.loadedAssets / this.totalAssets;
  }
}