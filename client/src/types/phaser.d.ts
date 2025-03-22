/**
 * Phaser Global Type Declarations
 * 
 * This file provides basic type declarations for the global Phaser object
 * that is loaded from CDN in our application.
 */

/**
 * Declare the global Phaser namespace to provide type information
 * for Phaser methods and properties used throughout the application.
 */
declare namespace Phaser {
  export const AUTO: number;
  export const CANVAS: number;
  export const WEBGL: number;
  
  export namespace GameObjects {
    export class Text {
      setOrigin(x: number, y: number): this;
      setText(text: string): this;
      setResolution(resolution: number): this;
      setDepth(value: number): this;
      setScrollFactor(x: number, y?: number): this;
      destroy(): void;
    }
    
    export class Graphics {
      fillStyle(color: number, alpha?: number): this;
      fillRect(x: number, y: number, width: number, height: number): this;
      clear(): this;
      destroy(): void;
      generateTexture(key: string, width?: number, height?: number): this;
    }
    
    export class Sprite {
      setDepth(value: number): this;
      setSize(width: number, height: number): this;
      setOffset(x: number, y: number): this;
      setScale(x: number, y?: number): this;
      setOrigin(x: number, y?: number): this;
      setTint(color: number): this;
      setScrollFactor(x: number, y?: number): this;
      disableBody(disableGameObject?: boolean, hideGameObject?: boolean): this;
      destroy(): void;
      
      anims: {
        play(key: string, ignoreIfPlaying?: boolean): this;
        stop(): this;
      };
      
      body: any;
      x: number;
      y: number;
      alpha: number;
    }
    
    export class RenderTexture {
      draw(texture: string, x: number, y: number): this;
      saveTexture(key: string): this;
      destroy(): void;
    }
  }
  
  export namespace Physics {
    export namespace Arcade {
      export class Sprite extends GameObjects.Sprite {
        setVelocity(x: number, y?: number): this;
        setVelocityX(value: number): this;
        setVelocityY(value: number): this;
      }
      
      export class Group {
        addMultiple(entries: any[]): this;
      }
    }
  }
  
  export namespace Tilemaps {
    export class Tilemap {
      createLayer(name: string, tileset: Tileset, x?: number, y?: number): TilemapLayer;
      addTilesetImage(tilesetName: string, key: string): Tileset;
      createFromObjects(objectLayerName: string, config: any): any[];
      widthInPixels: number;
      heightInPixels: number;
      findObject(objectLayerName: string, callback: Function): any;
    }
    
    export class Tileset {
      // Basic properties for type checking
    }
    
    export class TilemapLayer {
      setCollisionByProperty(properties: any): this;
      setDepth(value: number): this;
    }
    
    export class ObjectLayer {
      // Basic properties for type checking
    }
  }
  
  export namespace Types {
    export namespace Input {
      export namespace Keyboard {
        export interface CursorKeys {
          up: Key;
          down: Key;
          left: Key;
          right: Key;
          space: Key;
          shift: Key;
        }
      }
    }
  }
  
  export namespace Input {
    export namespace Keyboard {
      export class Key {
        isDown: boolean;
        isUp: boolean;
        timeDown: number;
        duration: number;
        timeUp: number;
      }
    }
  }

  export class Game {
    constructor(config: any);
    destroy(removeCanvas?: boolean, noReturn?: boolean): void;
    events: Events;
    scale: Scale;
    scene: SceneManager;
    destroyed: boolean;
    device: Device;
  }

  export interface Events {
    on(event: string, callback: Function, context?: any): void;
    once(event: string, callback: Function, context?: any): void;
    emit(event: string, ...args: any[]): void;
  }

  export interface Scale {
    resize(width: number, height: number): void;
    width: number;
    height: number;
  }

  export interface SceneManager {
    add(key: string, scene: any, autoStart?: boolean, data?: any): void;
    start(key: string, data?: any): void;
    getScene(key: string): Scene;
  }

  export class Scene {
    constructor(config: string | SceneConfig);
    add: GameObjectFactory;
    anims: AnimationManager;
    cache: CacheManager;
    cameras: CameraManager;
    input: InputManager;
    load: LoaderPlugin;
    make: GameObjectCreator;
    physics: PhysicsManager;
    sys: Systems;
    textures: TextureManager;
    time: TimeManager;
    tweens: TweenManager;
    
    create(data?: any): void;
    init(data?: any): void;
    preload(): void;
    update(time: number, delta: number): void;
    scene: ScenePlugin;
  }

  export interface SceneConfig {
    key?: string;
    active?: boolean;
    visible?: boolean;
    pack?: any;
    cameras?: any;
    map?: any;
    physics?: any;
    loader?: any;
    plugins?: any;
  }

  export interface ScenePlugin {
    start(key: string, data?: any): void;
    pause(key: string): void;
    resume(key: string): void;
    stop(key: string): void;
    restart(key: string): void;
    sleep(key: string): void;
    wake(key: string): void;
    switch(key: string): void;
    getScene(key: string): Scene;
  }

  export interface GameObjectFactory {
    container(x?: number, y?: number, children?: any[]): any;
    graphics(config?: any): GameObjects.Graphics;
    image(x: number, y: number, texture: string, frame?: string | number): GameObjects.Sprite;
    rectangle(x: number, y: number, width: number, height: number, fillColor?: number, fillAlpha?: number): any;
    renderTexture(x: number, y: number, width: number, height: number): GameObjects.RenderTexture;
    sprite(x: number, y: number, texture: string, frame?: string | number): GameObjects.Sprite;
    text(x: number, y: number, text: string | string[], style?: any): GameObjects.Text;
    tileSprite(x: number, y: number, width: number, height: number, texture: string, frame?: string | number): any;
  }
  
  export namespace GameObjects {
    export class RenderTexture {
      draw(texture: string, x: number, y: number): this;
      saveTexture(key: string): this;
      destroy(): void;
    }
  }

  export interface GameObjectCreator {
    tilemap(config: any): any;
  }

  export interface AnimationManager {
    create(config: any): any;
    generateFrameNumbers(key: string, config?: any): any[];
  }

  export interface CacheManager {
    json: any;
  }

  export interface CameraManager {
    main: Camera;
    add(x: number, y: number, width: number, height: number, makeMain?: boolean, name?: string): Camera;
  }

  export interface Camera {
    setBounds(x: number, y: number, width: number, height: number): void;
    startFollow(target: any, roundPixels?: boolean, lerpX?: number, lerpY?: number): void;
    setZoom(zoom: number): void;
    width: number;
    height: number;
    zoom: number;
  }

  export interface InputManager {
    keyboard: KeyboardManager;
    addPointer(quantity?: number): void;
    on(event: string, callback: Function, context?: any): void;
    off(event: string, callback?: Function, context?: any): void;
  }

  export interface KeyboardManager {
    createCursorKeys(): CursorKeys;
    addKey(keyCode: string): Key;
    on(event: string, callback: Function, context?: any): void;
    off(event: string, callback?: Function, context?: any): void;
  }

  export interface CursorKeys {
    up: Key;
    down: Key;
    left: Key;
    right: Key;
    space: Key;
    shift: Key;
  }

  export interface Key {
    isDown: boolean;
    isUp: boolean;
    timeDown: number;
    duration: number;
    timeUp: number;
  }

  export interface LoaderPlugin {
    image(key: string, url: string): void;
    spritesheet(key: string, url: string, config: any): void;
    audio(key: string, url: string): void;
    tilemapTiledJSON(key: string, url: string): void;
    on(event: string, callback: Function, context?: any): void;
    once(event: string, callback: Function, context?: any): void;
    start(): void;
  }

  export interface PhysicsManager {
    add: PhysicsFactory;
    world: PhysicsWorld;
  }

  export interface PhysicsFactory {
    collider(object1: any, object2: any, collideCallback?: Function, processCallback?: Function, callbackContext?: any): any;
    group(children?: any[], config?: any): any;
    overlap(object1: any, object2: any, overlapCallback?: Function, processCallback?: Function, callbackContext?: any): any;
    sprite(x: number, y: number, texture: string, frame?: string | number): any;
  }

  export interface PhysicsWorld {
    enable(object: any, system?: number): void;
    setBounds(x: number, y: number, width: number, height: number, checkLeft?: boolean, checkRight?: boolean, checkUp?: boolean, checkDown?: boolean): void;
  }

  export interface Systems {
    game: Game;
    canvas: HTMLCanvasElement;
    config: any;
    device: Device;
  }

  export interface Device {
    input: {
      touch: boolean;
    };
    os: {
      desktop: boolean;
      mobile: boolean;
    };
  }

  export interface TextureManager {
    exists(key: string): boolean;
    get(key: string): Texture;
  }

  export interface Texture {
    source: { width: number; height: number }[];
  }

  export interface TimeManager {
    addEvent(config: any): any;
    delayedCall(delay: number, callback: Function, args?: any[], callbackScope?: any): any;
  }

  export interface TweenManager {
    add(config: any): any;
  }

  export namespace Input {
    export namespace Keyboard {
      export function JustDown(key: Key): boolean;
      export function JustUp(key: Key): boolean;
    }
  }

  export namespace Math {
    export function Between(min: number, max: number): number;
    export function RND(min: number, max: number): number;
  }
}