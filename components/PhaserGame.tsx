"use client";

import React, { useEffect, useRef } from 'react';
import type { Game } from 'phaser';

interface PhaserGameProps {
  onEncounter: (encounterId: string) => void;
  onReady?: (game: Phaser.Game) => void;
  characterId?: string | null;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ onEncounter, onReady, characterId }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (gameRef.current) return;

    let isMounted = true;

    const initGame = async () => {
      if (typeof window === 'undefined') return;
      const { createGame } = await import('../phaser/main');
      if (!isMounted || !containerRef.current) return;
      const game = createGame(containerRef.current, { onEncounter, characterId });
      gameRef.current = game;

      if (onReady) {
        onReady(game);
      }
    };

    initGame();

    return () => {
      isMounted = false;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onEncounter, onReady, characterId]);

  return (
    <div className="flex items-center justify-center">
      <div
        ref={containerRef}
        className="rounded-lg overflow-hidden border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] flex items-center justify-center [&>canvas]:block"
      />
    </div>
  );
};
