export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.add.rectangle(x, y, 40, 40, 0x00ff00);
    this.sprite.setDepth(10);
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
