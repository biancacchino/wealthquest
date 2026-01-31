"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadGameState, saveGameState } from "../../lib/storage";
import { GameState } from "../../lib/engine/types";

export default function SummaryPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const saved = loadGameState();
    if (!saved) {
      router.push("/");
      return;
    }
    setGameState(saved);
  }, [router]);

  const summary = useMemo(() => {
    if (!gameState) return null;
    const purchases = gameState.week.history.filter((event) => event.choice === "buy").length;
    const skips = gameState.week.history.filter((event) => event.choice === "skip").length;
    const recent = gameState.week.history.slice(-5).map((event) => ({
      id: event.id,
      day: event.dayIndex + 1,
      encounterId: event.encounterId,
      choice: event.choice
    }));
    return { purchases, skips, recent };
  }, [gameState]);

  const handleReplay = () => {
    if (!gameState) return;
    const resetState: GameState = {
      ...gameState,
      week: {
        ...gameState.week,
        dayIndex: 0,
        balance: gameState.settings.weeklyAllowance,
        goalSaved: 0,
        history: [],
        unlockedInsights: []
      }
    };
    setGameState(resetState);
    saveGameState(resetState);
    router.push("/game");
  };

  if (!gameState || !summary) {
    return <p>Loading summary...</p>;
  }

  return (
    <div className="stack">
      <h1>Week Summary</h1>
      <div className="card stack">
        <p>
          You chose {summary.purchases} purchase(s) and skipped {summary.skips} time(s).
        </p>
        <p>
          Your goal is still ${gameState.settings.goal.cost - gameState.week.goalSaved} away.
        </p>
      </div>

      <div className="card stack">
        <h3>Timeline highlights</h3>
        <ul className="summary-list">
          {summary.recent.map((event) => (
            <li key={event.id}>
              Day {event.day}: {event.encounterId} — {event.choice}
            </li>
          ))}
        </ul>
      </div>

      <div className="card stack">
        <p>Different choices, different outcomes — no shame, just learning.</p>
        <button className="button-primary" onClick={handleReplay}>
          Replay Week
        </button>
      </div>
    </div>
  );
}
