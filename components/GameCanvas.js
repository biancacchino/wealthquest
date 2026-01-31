"use client";

import { useEffect, useRef } from 'react';

export default function GameCanvas() {
  const gameRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current && !gameRef.current) {
      // Dynamically import Phaser only on client side
      import("../phaser/main").then(({ createGame }) => {
        gameRef.current = createGame('game-container');
      });
    }

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      id="game-container" 
      ref={containerRef}
      style={{ 
        width: '600px', 
        height: '400px',
        margin: '0 auto'
      }}
    />
  );
}
