export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    // Create a physics sprite instead of a simple rectangle
    // Using a blank texture or create one if needed, assuming we want a simple box for now
    // If 'player' texture exists, use it, otherwise use a colored rectangle texture
    if (scene.textures.exists('player')) {
        this.sprite = scene.physics.add.sprite(x, y, 'player');
    } else {
        // Fallback: create a placeholder texture
        if (!scene.textures.exists('player_placeholder')) {
            const graphics = scene.make.graphics().fillStyle(0x00ff00).fillRect(0, 0, 32, 32);
            graphics.generateTexture('player_placeholder', 32, 32);
            graphics.destroy();
        }
        this.sprite = scene.physics.add.sprite(x, y, 'player_placeholder');
    }
    
    // --- HITBOX TUNING ---
    // Make the collision box smaller than the sprite (e.g. 16x16 instead of 32x32)
    // This makes it less likely to get stuck on corners or accidentally trigger doors
    this.sprite.body.setSize(20, 20); 
    this.sprite.body.setOffset(6, 12); // Center it towards the bottom (feet)

    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    this.sprite.setScale(2); // Scale up the small ~15x20 pixel sprites (2x sprite * 2x camera = 4x total)
    this.sprite.setOrigin(0.5, 0.5); // Center the sprite origin
    
    // Create animations for 4 directions using atlas frames
    this.createAnimations(scene);
  }

  createAnimations(scene) {
    const prefix = this.spritePrefix;
    const directions = ['down', 'up', 'left', 'right'];
    
    directions.forEach(dir => {
      // Remove existing animations first (in case of character switch)
      if (scene.anims.exists(`walk-${dir}`)) {
        scene.anims.remove(`walk-${dir}`);
      }
      if (scene.anims.exists(`idle-${dir}`)) {
        scene.anims.remove(`idle-${dir}`);
      }
      
      // Walk animation (walk1 -> idle -> walk2 -> idle for smooth 2-frame walk cycle)
      scene.anims.create({
        key: `walk-${dir}`,
        frames: [
          { key: 'player', frame: `${prefix}_${dir}_walk1` },
          { key: 'player', frame: `${prefix}_${dir}_idle` },
          { key: 'player', frame: `${prefix}_${dir}_walk2` },
          { key: 'player', frame: `${prefix}_${dir}_idle` }
        ],
        frameRate: 8,
        repeat: -1
      });
      
      // Idle animation (single frame)
      scene.anims.create({
        key: `idle-${dir}`,
        frames: [{ key: 'player', frame: `${prefix}_${dir}_idle` }],
        frameRate: 1
      });
    });
    
    // Start with idle-down
    this.sprite.play('idle-down');
  }

  playWalkAnimation(direction) {
    this.direction = direction;
    const animKey = `walk-${direction}`;
    if (this.sprite.anims.currentAnim?.key !== animKey) {
      this.sprite.play(animKey, true);
    }
  }

  playIdleAnimation() {
    const animKey = `idle-${this.direction}`;
    if (this.sprite.anims.currentAnim?.key !== animKey) {
      this.sprite.play(animKey, true);
    }
  }

  // physics body doesn't need manual update but we can expose methods to set velocity
  setVelocity(x, y) {
    this.sprite.setVelocity(x, y);
  }

  moveTo(x, y) {
    this.sprite.setPosition(x, y);
  }

  getPosition() {
    return {
      x: this.sprite.x,
      y: this.sprite.y
    };
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
}
