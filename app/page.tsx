"use client";

import Link from "next/link";
import { loadGameState, clearGameState } from "../lib/storage";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    setHasSave(Boolean(loadGameState()));
  }, []);

  const handleNewGame = () => {
    clearGameState();
    setHasSave(false);
  };

  return (
    <div className="stack">
      <span className="badge">Empowerment Journey</span>
      <h1>Pocket Paths</h1>
      <p>
        Explore a calm town, meet friendly guides, and practice money choices
        without pressure.
      </p>
      <div className="card stack">
        <h2>Start playing</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {hasSave ? (
            <Link className="button-primary" href="/game">
              Continue
            </Link>
          ) : (
            <Link className="button-primary" href="/onboarding">
              New Game
            </Link>
          )}
          <Link className="button-secondary" href="/onboarding" onClick={handleNewGame}>
            New Game (reset)
          </Link>
        </div>
      </div>
      <div className="card">
        <h3>How it works</h3>
        <ul>
          <li>Move around the town using arrow keys or the on-screen pad.</li>
          <li>Step on encounter tiles to make spending choices.</li>
          <li>See a calm “What changed?” recap after every decision.</li>
        </ul>
      </div>
    </div>
  );
}
