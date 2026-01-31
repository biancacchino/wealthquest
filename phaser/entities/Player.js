export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    // Create sprite from the loaded sprite sheet
    this.sprite = scene.add.sprite(x, y, 'player', 0);
    this.sprite.setDepth(10);
    this.sprite.setScale(2); // Scale up 2x for better visibility
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
