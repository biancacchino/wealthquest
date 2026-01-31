import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { GameState } from '../systems/GameState';

export class World extends Phaser.Scene {
  constructor() {
    super({ key: 'World' });
    this.gameState = new GameState();
  }

  preload() {
    // Load assets here when you have them
    // this.load.image('tiles', '/assets/tiles/tileset.png');
    // this.load.spritesheet('player', '/assets/sprites/player.png', { frameWidth: 32, frameHeight: 32 });
  }

  create() {
    // Create the world grid (12x8 as per your original setup)
    const tileSize = 50;
    const width = 12;
    const height = 8;

    // Draw grid background
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const posX = x * tileSize + tileSize / 2;
        const posY = y * tileSize + tileSize / 2;
        
        // Alternating colors for grid
        const color = (x + y) % 2 === 0 ? 0x2a2a2a : 0x353535;
        this.add.rectangle(posX, posY, tileSize, tileSize, color);
      }
    }

    // Create player at starting position
    const startPos = this.gameState.playerPosition;
    this.player = new Player(
      this,
      startPos.x * tileSize + tileSize / 2,
      startPos.y * tileSize + tileSize / 2
    );

    // Add keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // Add text
    this.add.text(10, 10, 'Use arrow keys to move', {
      fontSize: '16px',
      fill: '#fff'
    });
  }

  update() {
    // Handle movement (add collision detection as needed)
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.movePlayer(-1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.movePlayer(1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.movePlayer(0, -1);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.movePlayer(0, 1);
    }
  }

  movePlayer(dx, dy) {
    const tileSize = 50;
    const currentPos = this.gameState.playerPosition;
    const newX = currentPos.x + dx;
    const newY = currentPos.y + dy;

    // Simple bounds checking (12x8 grid)
    if (newX >= 0 && newX < 12 && newY >= 0 && newY < 8) {
      this.gameState.updatePlayerPosition(newX, newY);
      this.player.moveTo(
        newX * tileSize + tileSize / 2,
        newY * tileSize + tileSize / 2
      );
    }
  }
}
