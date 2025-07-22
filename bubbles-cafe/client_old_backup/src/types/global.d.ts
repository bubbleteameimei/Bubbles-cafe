/**
 * Global Type Declarations
 * This file declares global interfaces and types for the application
 */

// Extend the Window interface to include Phaser
declare global {
  interface Window {
    Phaser: typeof Phaser;
  }
}

export {};