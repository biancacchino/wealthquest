interface GameConfig {
  onEncounter: (encounterId: string) => void;
  characterId?: string | null;
}

export function createGame(
  container: HTMLElement,
  options: GameConfig
): Phaser.Game;