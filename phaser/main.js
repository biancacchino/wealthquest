import Phaser from 'phaser';
import { World } from './scenes/World';

export function createGame(containerId) {
  const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 400,
    parent: containerId,
    backgroundColor: '#1a1a1a',
    pixelArt: true, // Crucial for pixel-perfect scaling
    roundPixels: true, // Prevents sub-pixel blurring
    scene: [World],
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    }
  };

  return new Phaser.Game(config);
}
