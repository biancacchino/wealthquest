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
    this.doorCooldowns = new Map();
  }

  preload() {
    // Load the background map image
    this.load.image('map_background', '/assets/maps/GameMap.png');
    
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

    // --- SETUP GROUPS ---
    this.buildings = this.physics.add.staticGroup();
    this.doors = this.physics.add.staticGroup(); // Triggers
    
    // --- CREATE COLLISION ZONES ---
    this.createCollisionZones();

    // Create player at starting position (User requested: 310, 225)
    this.player = new Player(this, 310, 225);

    // Sync GameState to this new position
    this.gameState.updatePlayerPosition(
        Math.floor(310 / tileSize), 
        Math.floor(225 / tileSize)
    );

    // --- ADD COLLISIONS ---
    // Player hits buildings -> Stop
    this.physics.add.collider(this.player.sprite, this.buildings);

    // Player touches door -> Check Timer first
    this.physics.add.overlap(this.player.sprite, this.doors, (player, door) => {
        this.handleDoorOverlap(door.name);
    });

    // Encounter markers (Visual only now, or could convert to triggers too)
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
      // Optional: Add physics to encounters if you want them to be triggers too
      // this.physics.add.existing(marker, true);
      return { id: encounter.id, marker };
    });

    // Set camera bounds to the world size
    this.cameras.main.setBounds(0, 0, this.mapWidthPx, this.mapHeightPx);
    
    // Zoom OUT for overview (0.4x zoom)
    this.cameras.main.setZoom(0.4);
    
    // Start camera at top-left corner (0, 0)
    // this.cameras.main.scrollX = 0; // Let follow handle it
    // this.cameras.main.scrollY = 0;
    
    // Camera follow with slight smoothing (0.1)
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);


    // Add WASD keys for movement
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // Movement speed (pixels per frame -> velocity)
    // used to be 4 per frame, for physics velocity we need higher values (e.g. 150-200)
    this.moveSpeed = 200; 

    // Add UI text (fixed to camera)
    this.add.text(10, 10, 'Use WASD to move', {
      fontSize: '40px', // Zoomed out fix
      fill: '#fff'
    }).setScrollFactor(0); // Fixed to camera
    
    // Debug: show map size
    this.add.text(10, 60, `Map: ${this.mapWidthPx}x${this.mapHeightPx}px`, {
      fontSize: '30px', // Zoomed out fix
      fill: '#888'
    }).setScrollFactor(0);

    // Debug: show player position
    this.debugText = this.add.text(10, 100, '', {
        fontSize: '40px', // Zoomed out fix
        fill: '#00ff00',
        backgroundColor: '#000000'
    }).setScrollFactor(0);

    // Track door interaction
    this.currentOverlappingDoor = null;
    this.overlapEnterTime = 0;
    this.lastOverlapFrameTime = 0;
  }

  // --- NEW HELPER METHODS ---

  createCollisionZones() {
    // Helper to create invisible solid box
    // Added 'color' parameter (defaults to Red 0xff0000 if not provided)
    const createBuilding = (x, y, w, h, name, color = 0xff0000) => {
        // x, y are center coordinates by default in Phaser arcade physics
        // But for exact placement it's easier to think in top-left
        // DEBUGGING: Set alpha to 0.5 to see the box. Set to 0 to hide it.
        const zone = this.add.rectangle(x + w/2, y + h/2, w, h, color, 0); 
        this.buildings.add(zone); // Add to static group
        zone.name = name;
        // Adjust body size if needed (padding)
        // zone.body.setSize(w + 2, h + 2); 
    };

    // Helper to create door trigger
    const createDoor = (x, y, w, h, name, color = 0x00ff00) => {
        // Set alpha to 0 to hide the box.
        const zone = this.add.rectangle(x + w/2, y + h/2, w, h, color, 0); // alpha 0 (invisible)
        this.doors.add(zone);
        zone.name = name;
    };

    // ---------------------------------------------------------
    // ZONES (Buildings = Walls, Doors = Triggers)
    // ---------------------------------------------------------

    // --- 1. Apartment Area ---
    createDoor(312, 218, 40, 60, 'DOOR_APARTMENT');
    createDoor(515, 295, 15, 30, 'DOOR_BUS_APARTMENT', 0x800080);
    
    // Apartment Walls
    createBuilding(210, 5, 280, 200, 'COLL_WORK');
    createBuilding(10, 5, 280, 320, 'COLL_WORK');
    createBuilding(367, 200, 100, 100, 'COLL_WORK');


    // --- 2. Work / Library / NYSE Area (Top Right/Middle) ---
    createDoor(785, 339, 40, 60, 'DOOR_WORK');
    createDoor(892, 338, 40, 60, 'DOOR_LIBRARY');
    createDoor(1105, 340, 40, 60, 'DOOR_NYSE');
    
    // Work Walls
    createBuilding(647, 163, 670, 160, 'COLL_WORK');


    // --- 3. Pizza Area ---
    createDoor(1345, 372, 40, 60, 'DOOR_PIZZA');
    createDoor(1449, 372, 15, 30, 'DOOR_BUS_PIZZA', 0x800080);

    // Pizza Walls
    createBuilding(1300, 190, 40, 170, 'COLL_WORK');
    createBuilding(1260, 225, 170, 120, 'COLL_WORK', 0x0000ff);


    // --- 4. Mall / Movies Area ---
    createDoor(1049, 738, 40, 60, 'DOOR_MALL');
    createDoor(1309, 743, 40, 60, 'DOOR_MOVIES');
    createDoor(1435, 738, 15, 30, 'DOOR_BUS_MOVIES', 0x800080);

    // Mall/Movie Walls
    createBuilding(830, 420, 500, 310, 'COLL_APARTMENT'); // Mall building
    createBuilding(1320, 450, 100, 280, 'COLL_WORK'); // Movie building


    // --- 5. Market / Arcade Area ---
    createDoor(593, 590, 40, 60, 'DOOR_MARKET');
    createDoor(562, 827, 40, 60, 'DOOR_ARCADE');
    createDoor(665, 835, 15, 30, 'DOOR_BUS_ARCADE', 0x800080);

    // Market/Arcade Walls
    createBuilding(400, 415, 300, 170, 'COLL_CORNER_STORE'); // Market building
    createBuilding(400, 690, 250, 140, 'COLL_ARCADE'); // Arcade building


    // --- 6. Coffee / Bank Area ---
    createDoor(303, 600, 40, 60, 'DOOR_COFFEE');
    createDoor(147, 615, 15, 30, 'DOOR_BUS_COFFEE', 0x800080);
    createDoor(290, 796, 40, 60, 'DOOR_BANK');
    createDoor(182, 814, 15, 30, 'DOOR_BUS_BANK', 0x800080);

    // Coffee/Bank Walls
    createBuilding(176, 415, 250, 180, 'COLL_MALL_MAIN'); // Coffee building
    createBuilding(190, 680, 230, 100, 'COLL_COFFEE'); // Bank building


    // --- 7. Beach ---
    createDoor(0, 900, 3000, 100, 'DOOR_BEACH');

    
    // --- 8. Borders (Grass/Limits) ---
    createBuilding(0, 0, 10000, 75, 'COLL_WORK', 0x0000ff); // Top
    createBuilding(1500, 0, 80, 370, 'COLL_WORK', 0x0000ff); // Right side
    createBuilding(1435, 330, 55, 20, 'COLL_WORK'); // Small right block
    createBuilding(0, 0, 70, 360, 'COLL_WORK', 0x0000ff); // Left side
    createBuilding(0, 0, 20, 900, 'COLL_WORK'); // Thin left
    createBuilding(0, 680, 80, 240, 'COLL_WORK', 0x0000ff); // Left bottom
    createBuilding(90, 860, 140, 30, 'COLL_WORK'); // Left bottom small
    


    
    console.log("Collision zones created");
  }

  handleDoorOverlap(doorName) {
    const now = this.time.now;
    this.lastOverlapFrameTime = now;

    // 1. Initial Entry: Start Timer
    if (this.currentOverlappingDoor !== doorName) {
        this.currentOverlappingDoor = doorName;
        this.overlapEnterTime = now;
        console.log(`Entered ${doorName}. Waiting 1s...`);
        return; 
    }

    // 2. Waiting (debounce already handled inside handleDoorTrigger or we can add extra check)
    // Check if 1 second has passed
    if (now - this.overlapEnterTime >= 1000) {
        this.handleDoorTrigger(doorName);
    }
  }

  handleDoorTrigger(doorName) {
      const now = this.time.now;
      
      // Check specific door cooldown
      if (this.doorCooldowns.has(doorName) && this.doorCooldowns.get(doorName) > now) {
          return;
      }
      
      this.lastTriggerTime = now;

      // Prevent spamming the trigger (debounce could go here)
      console.log("Player hit door:", doorName);

      // Store the last door name so we know where to bounce back from
      this.lastDoorHit = doorName;
      
      // Store exact player position when they hit the door
      this.savedPlayerPos = {
          x: this.player.sprite.x,
          y: this.player.sprite.y
      };

      // IMPORTANT: Emit an event so execution jumps back to React
      // This allows showing the UI!
      const callbacks = this.registry.get('callbacks');
      if (callbacks && callbacks.onEncounter) {
          // You need to map DOOR_NAMES to encounter IDs or handle this string in React
          // For now, let's just pass the door name as the ID
          callbacks.onEncounter(doorName);
      }
      
      // Example routing (internal game logic if needed)
      switch(doorName) {
          case 'DOOR_CORNER_STORE':
              // Access corner store UI
              break;
          case 'DOOR_ARCADE':
              // Start arcade mini-game
              break;
          case 'DOOR_APARTMENT':
              // Go home / sleep
              break;
          case 'DOOR_MALL':
              // Open shopping menu
              break;
          default:
              break;
      }
  }

  // Push player out of the door zone slightly
  pushPlayerBack() {
      if (!this.player || !this.player.sprite) return;
      
      console.log("Restoring player position...", this.savedPlayerPos);

      // RESTORE: If we have a saved position, put them back exactly there first
      if (this.savedPlayerPos) {
          // Use body.reset to properly teleport physics body and kill velocity
          this.player.sprite.body.reset(
              this.savedPlayerPos.x, 
              this.savedPlayerPos.y + 10 
          );
      } else {
          // Fallback if no saved pos (rare)
          this.player.sprite.y += 30;
          this.player.sprite.body.setVelocity(0, 0);
      }
  }


  update() {
    if (this.isMovementLocked) {
        if (this.player && this.player.sprite && this.player.sprite.body) {
             this.player.setVelocity(0, 0);
        }
        return;
    }

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

      // Use Physics velocity instead of manual position update
      this.player.setVelocity(dx * this.moveSpeed, dy * this.moveSpeed);
      
      // Determine facing direction and play walk animation
      // Prioritize horizontal over vertical for diagonals (or change as you prefer)
      let direction;
      if (dx < 0) direction = 'left';
      else if (dx > 0) direction = 'right';
      else if (dy < 0) direction = 'up';
      else if (dy > 0) direction = 'down';
      
      if (direction) {
        this.player.playWalkAnimation(direction);
      }
      
      // Update game state with tile position
      const tileX = Math.floor(this.player.sprite.x / tileSize);
      const tileY = Math.floor(this.player.sprite.y / tileSize);
      this.gameState.updatePlayerPosition(tileX, tileY);
      
      // Check for encounters at current tile
      this.checkEncounterAt(tileX, tileY);
    } else {
        // Stop moving and play idle animation
        this.player.setVelocity(0, 0);
        this.player.playIdleAnimation();
    }

    // Update debug text with player position
    if (this.debugText && this.player && this.player.sprite) {
        this.debugText.setText(`x: ${Math.round(this.player.sprite.x)}, y: ${Math.round(this.player.sprite.y)}`);
    }

    // Reset overlap if player left the zone
    if (this.currentOverlappingDoor && (this.time.now - this.lastOverlapFrameTime > 50)) {
        console.log(`Left ${this.currentOverlappingDoor}`);
        this.currentOverlappingDoor = null;
    }
  }

  movePlayer(dx, dy) {
    const { tileSize } = World.MAP_CONFIG;
    const currentPos = this.gameState.playerPosition;
    const newX = currentPos.x + dx;
    const newY = currentPos.y + dy;

    // Calculate map dimensions in tiles
    const mapWidthTiles = Math.floor(this.mapWidthPx / tileSize);
    const mapHeightTiles = Math.floor(this.mapHeightPx / tileSize);

    // Bounds checking for the large map
    if (newX >= 0 && newX < mapWidthTiles && newY >= 0 && newY < mapHeightTiles) {
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

  handleDoorDecision(doorName, decision) {
    const now = this.time.now;
    if (decision === 'yes') {
        // If yes, long cooldown (15 seconds)
        this.doorCooldowns.set(doorName, now + 15000);
        console.log(`Door ${doorName} accepted. Cooldown: 15s`);
    } else {
        // If no, short cooldown (3 seconds)
        this.doorCooldowns.set(doorName, now + 3000);
        console.log(`Door ${doorName} declined. Cooldown: 3s`);
    }
  }
}
