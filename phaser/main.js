import * as Phaser from 'phaser';
import { World } from './scenes/World';

export function createGame(parent, callbacks = {}, characterId = null) {
  const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    parent,
    backgroundColor: '#1a1a1a',
    pixelArt: true,
    roundPixels: true,
    scene: [World],
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    callbacks: {
      postBoot: (game) => {
        game.registry.set('callbacks', callbacks);
        game.registry.set('characterId', characterId);
      }
    }
  };

  return new Phaser.Game(config);
}
