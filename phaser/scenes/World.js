import * as Phaser from 'phaser';
import { Player } from '../entities/Player';
import { GameState } from '../systems/GameState';
import { ENCOUNTERS } from '../data/encounters';

export class World extends Phaser.Scene {
  // Map configuration - large world with 640x480 viewport
  static MAP_CONFIG = {
    tileSize: 32,
    // Background image dimensions (update these to match your actual image)
    mapWidthPx: 1152,
    mapHeightPx: 768,
    viewWidth: 640,
    viewHeight: 480
  };

  constructor() {
    super({ key: 'World' });
    this.gameState = new GameState();
    this.isMovementLocked = false;
  }

  preload() {
    // Load the background map image
    this.load.image('map_background', '/assets/sprites/map_background.png');
    
    // Load character atlas (small sprite sheet + JSON) for gameplay
    const characterId = this.game.registry.get('characterId');
    
    if (characterId === 'green_cap') {
      this.load.atlas('player', '/assets/sprites/alex-spritesheet.png', '/assets/sprites/alex-sprites.json');
      this.game.registry.set('spritePrefix', 'alex');
    } else if (characterId === 'black_cap') {
      this.load.atlas('player', '/assets/sprites/robin-spritesheet.png', '/assets/sprites/robin-sprites.json');
      this.game.registry.set('spritePrefix', 'robin');
    } else {
      // Fallback to Alex if no character selected
      this.load.atlas('player', '/assets/sprites/alex-spritesheet.png', '/assets/sprites/alex-sprites.json');
      this.game.registry.set('spritePrefix', 'alex');
    }
  }

  create() {
    const { tileSize } = World.MAP_CONFIG;

    // Get the background texture and its actual dimensions
    this.background = this.add.image(0, 0, 'map_background');
    this.background.setOrigin(0, 0);
    
    // Use actual image dimensions for world bounds
    this.mapWidthPx = this.background.width;
    this.mapHeightPx = this.background.height;

    // Set world bounds for physics and camera
    this.physics.world.setBounds(0, 0, this.mapWidthPx, this.mapHeightPx);

    // Create player at starting position
    const startPos = this.gameState.playerPosition;
    this.player = new Player(
      this,
      startPos.x * tileSize + tileSize / 2,
      startPos.y * tileSize + tileSize / 2
    );

    // Encounter markers
    this.encounterMarkers = ENCOUNTERS.map((encounter) => {
      const marker = this.add.rectangle(
        encounter.tile.x * tileSize + tileSize / 2,
        encounter.tile.y * tileSize + tileSize / 2,
        tileSize - 6,
        tileSize - 6,
        0x4ade80,
        0.6
      );
      marker.setStrokeStyle(2, 0x14532d, 0.8);
      return { id: encounter.id, marker };
    });

    // Set camera bounds to the world size
    this.cameras.main.setBounds(0, 0, this.mapWidthPx, this.mapHeightPx);
    
    // Zoom in for better view of the big map (2x zoom)
    this.cameras.main.setZoom(2);
    
    // Start camera at top-left corner (0, 0)
    this.cameras.main.scrollX = 0;
    this.cameras.main.scrollY = 0;
    
    // Camera follow with slight smoothing (0.1)
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);


    // Add WASD keys for movement
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // Movement speed (pixels per frame)
    this.moveSpeed = 2;

    // Add UI text (fixed to camera)
    this.add.text(10, 10, 'Use WASD to move', {
      fontSize: '16px',
      fill: '#fff'
    }).setScrollFactor(0); // Fixed to camera
    
    // Debug: show map size
    this.add.text(10, 30, `Map: ${this.mapWidthPx}x${this.mapHeightPx}px`, {
      fontSize: '12px',
      fill: '#888'
    }).setScrollFactor(0);
  }

  update() {
    if (this.isMovementLocked) return;

    const { tileSize } = World.MAP_CONFIG;
    
    // Calculate movement direction
    let dx = 0;
    let dy = 0;
    
    // Check arrow keys OR WASD for movement
    const leftPressed = this.keys.left.isDown;
    const rightPressed = this.keys.right.isDown;
    const upPressed = this.keys.up.isDown;
    const downPressed = this.keys.down.isDown;
    
    if (leftPressed) dx = -1;
    else if (rightPressed) dx = 1;
    
    if (upPressed) dy = -1;
    else if (downPressed) dy = 1;
    
    // Apply movement if any direction is pressed
    if (dx !== 0 || dy !== 0) {
      // Normalize diagonal movement
      let moveX = dx;
      let moveY = dy; // Slow down vertical movement
      if (dx !== 0 && dy !== 0) {
        const factor = 0.707; // 1/sqrt(2)
        moveX *= factor;
        moveY *= factor;
      }
      
      // Calculate new position
      const newX = this.player.sprite.x + moveX * this.moveSpeed;
      const newY = this.player.sprite.y + moveY * this.moveSpeed;
      
      // Bounds checking - keep player within world
      const halfTile = tileSize / 2;
      const clampedX = Phaser.Math.Clamp(newX, halfTile, this.mapWidthPx - halfTile);
      const clampedY = Phaser.Math.Clamp(newY, halfTile, this.mapHeightPx - halfTile);
      
      // Move the player FIRST
      this.player.sprite.x = clampedX;
      this.player.sprite.y = clampedY;
      
      // Update game state with tile position
      const tileX = Math.floor(clampedX / tileSize);
      const tileY = Math.floor(clampedY / tileSize);
      this.gameState.updatePlayerPosition(tileX, tileY);
      
      // Check for encounters at current tile
      this.checkEncounterAt(tileX, tileY);
      
      // Determine direction for animation (prioritize vertical for up/down visibility)
      let direction;
      if (dy < 0) direction = 'up';
      else if (dy > 0) direction = 'down';
      else if (dx < 0) direction = 'left';
      else if (dx > 0) direction = 'right';
      
      // Play walk animation AFTER movement (so errors don't block movement)
      try {
        this.player.playWalkAnimation(direction);
      } catch (e) {
        console.error('Animation error:', e);
      }
    } else {
      // No movement - play idle animation
      try {
        this.player.playIdleAnimation();
      } catch (e) {
        console.error('Idle animation error:', e);
      }
    }
  }

  movePlayer(dx, dy) {
    const { tileSize, mapWidth, mapHeight } = World.MAP_CONFIG;
    const currentPos = this.gameState.playerPosition;
    const newX = currentPos.x + dx;
    const newY = currentPos.y + dy;

    // Bounds checking for the large map
    if (newX >= 0 && newX < mapWidth && newY >= 0 && newY < mapHeight) {
      this.gameState.updatePlayerPosition(newX, newY);
      this.player.moveTo(
        newX * tileSize + tileSize / 2,
        newY * tileSize + tileSize / 2
      );
      this.checkEncounterAt(newX, newY);
    }
  }

  checkEncounterAt(x, y) {
    const encounter = ENCOUNTERS.find((item) => item.tile.x === x && item.tile.y === y);
    if (!encounter) return;
    if (this.gameState.hasCompletedEncounter(encounter.id)) return;

    const callbacks = this.registry.get('callbacks') || {};
    if (typeof callbacks.onEncounter === 'function') {
      this.isMovementLocked = true;
      callbacks.onEncounter(encounter.id);
    }
  }

  setMovementLocked(isLocked) {
    this.isMovementLocked = isLocked;
  }

  markEncounterComplete(encounterId) {
    this.gameState.completeEncounter(encounterId);
    const markerEntry = this.encounterMarkers?.find((item) => item.id === encounterId);
    if (markerEntry?.marker) {
      markerEntry.marker.setFillStyle(0x1f2937, 0.4);
      markerEntry.marker.setStrokeStyle(2, 0x0f172a, 0.6);
    }
  }
}
