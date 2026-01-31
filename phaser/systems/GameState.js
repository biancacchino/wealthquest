export class GameState {
  constructor() {
    this.playerPosition = { x: 5, y: 4 };
    this.inventory = [];
    this.completedEncounters = [];
  }

  updatePlayerPosition(x, y) {
    this.playerPosition = { x, y };
  }

  addToInventory(item) {
    this.inventory.push(item);
  }

  completeEncounter(encounterId) {
    if (!this.completedEncounters.includes(encounterId)) {
      this.completedEncounters.push(encounterId);
    }
  }

  hasCompletedEncounter(encounterId) {
    return this.completedEncounters.includes(encounterId);
  }

  getState() {
    return {
      playerPosition: this.playerPosition,
      inventory: this.inventory,
      completedEncounters: this.completedEncounters
    };
  }

  loadState(savedState) {
    if (savedState) {
      this.playerPosition = savedState.playerPosition || { x: 5, y: 4 };
      this.inventory = savedState.inventory || [];
      this.completedEncounters = savedState.completedEncounters || [];
    }
  }
}
