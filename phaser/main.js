import * as Phaser from 'phaser';
import { World } from './scenes/World';

export function createGame(parent, options = {}) {
  const { onEncounter, onFootstep, characterId } = options;
  
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
      preBoot: (game) => {
        // Set registry values BEFORE scenes boot
        game.registry.set('callbacks', { onEncounter, onFootstep });
        game.registry.set('characterId', characterId);
      }
    }
  };

  return new Phaser.Game(config);
}
