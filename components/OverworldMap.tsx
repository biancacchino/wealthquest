"use client";

import PlayerSprite from "./PlayerSprite";

export type TileType = "walkable" | "blocked" | "encounter" | "npc";

export interface Tile {
  type: TileType;
  id?: string;
  label?: string;
}

export default function OverworldMap({
  tiles,
  playerPosition
}: {
  tiles: Tile[][];
  playerPosition: { x: number; y: number };
}) {
  return (
    <div className="grid-map" role="grid">
      {tiles.map((row, y) =>
        row.map((tile, x) => {
          const isPlayer = playerPosition.x === x && playerPosition.y === y;
          return (
            <div
              key={`${x}-${y}`}
              className={`tile ${tile.type}`}
              role="gridcell"
            >
              {isPlayer ? <PlayerSprite /> : tile.label}
            </div>
          );
        })
      )}
    </div>
  );
}
