"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentSession, saveUser, createInitialGameState } from "../../services/storage";
import { GameState } from "../../types";

// Compute stats from history - mirrors Overworld logic
const computeStatsFromHistory = (history: any[], balance: number, goalCost: number) => {
  if (history.length === 0) {
    return { futurePreparedness: 50, financialMindfulness: 50 };
  }

  // Future Preparedness
  const goalProgress = Math.min(100, (balance / goalCost) * 100);
  const skips = history.filter((e: any) => e.choice === 'skip').length;
  const skipRatio = (skips / history.length) * 100;
  const bufferScore = Math.min(100, (balance / 25) * 100);
  const futurePreparedness = Math.round((goalProgress * 0.5) + (skipRatio * 0.3) + (bufferScore * 0.2));

  // Financial Mindfulness
  const purchases = history.filter((e: any) => e.choice === 'buy');
  const needPurchases = purchases.filter((e: any) => e.category === 'need').length;
  const wantPurchases = purchases.filter((e: any) => e.category === 'want').length;
  const socialPurchases = purchases.filter((e: any) => e.category === 'social').length;
  
  let needsScore = 50;
  if (purchases.length > 0) {
    const weightedSum = (needPurchases * 1) + (socialPurchases * 0.5) + (wantPurchases * 0);
    needsScore = Math.min(100, (weightedSum / purchases.length) * 100);
  }
  
  const buyRatio = purchases.length / history.length;
  const balanceScore = 100 - Math.abs(buyRatio - 0.5) * 200;
  const uniqueEncounters = new Set(history.map((e: any) => e.encounterId)).size;
  const varietyScore = Math.min(100, (uniqueEncounters / 3) * 100);
  const financialMindfulness = Math.round((needsScore * 0.4) + (balanceScore * 0.4) + (varietyScore * 0.2));

  return {
    futurePreparedness: Math.max(0, Math.min(100, futurePreparedness)),
    financialMindfulness: Math.max(0, Math.min(100, financialMindfulness)),
  };
};

// Get insight message based on stat value - Wealthsimple's reflective tone
const getInsightMessage = (statName: string, value: number): string => {
  if (statName === 'futurePreparedness') {
    if (value >= 70) return "You're building a solid foundation for your goals. Keep it up!";
    if (value >= 40) return "You're making progress. Small steps forward still count.";
    return "Every journey starts somewhere. Tomorrow is a new opportunity.";
  }
  if (statName === 'financialMindfulness') {
    if (value >= 70) return "You're making thoughtful choices about your money.";
    if (value >= 40) return "You're learning to balance needs and wants.";
    return "Awareness is the first step. You're already doing better than you think.";
  }
  return "";
};

export default function SummaryPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const user = getCurrentSession();
    if (!user) {
      router.push("/");
      return;
    }
    setGameState(user.gameState);
  }, [router]);

  const summary = useMemo(() => {
    if (!gameState) return null;
    const history = gameState.money.history;
    const purchases = history.filter((event) => event.choice === "buy").length;
    const skips = history.filter((event) => event.choice === "skip").length;
    
    // Adaptation for current Type structure
    const recent = history.slice(-5).map((event) => ({
      id: event.id,
      day: 1, // Placeholder
      encounterId: event.encounterId,
      choice: event.choice,
      cost: event.cost,
      balanceAfter: event.deltas.balanceAfter
    }));

    // Re-calculate stats properly using the helper
    const stats = computeStatsFromHistory(history, gameState.money.balance, gameState.money.goal.cost);

    return {
      purchases,
      skips,
      savings: gameState.money.bankBalance || 0,
      recent,
      stats
    };
  }, [gameState]);

  const handleReplay = () => {
    const user = getCurrentSession();
    if (!user) return;
    
    // Reset game state but keep username/character
    const newState = createInitialGameState();
    const updatedUser = { ...user, gameState: newState };
    
    saveUser(updatedUser);
    router.push("/");
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
          You saved total ${summary.savings}.
          Your goal needs ${gameState.money.goal.cost - (gameState.money.bankBalance || 0)} more.
        </p>
      </div>

      {/* Player Insights Section */}
      <div className="card stack">
        <h3>Your Insights</h3>
        
        <div className="insight-item">
          <div className="insight-header">
            <span>🌱 Building for Tomorrow</span>
            <span>{summary.stats.futurePreparedness}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${summary.stats.futurePreparedness}%`,
                backgroundColor: summary.stats.futurePreparedness >= 70 ? '#4ade80' : summary.stats.futurePreparedness >= 40 ? '#fbbf24' : '#f87171'
              }}
            />
          </div>
          <p className="insight-message">{getInsightMessage('futurePreparedness', summary.stats.futurePreparedness)}</p>
        </div>

        <div className="insight-item">
          <div className="insight-header">
            <span>💭 Making Intentional Choices</span>
            <span>{summary.stats.financialMindfulness}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${summary.stats.financialMindfulness}%`,
                backgroundColor: summary.stats.financialMindfulness >= 70 ? '#4ade80' : summary.stats.financialMindfulness >= 40 ? '#fbbf24' : '#f87171'
              }}
            />
          </div>
          <p className="insight-message">{getInsightMessage('financialMindfulness', summary.stats.financialMindfulness)}</p>
        </div>
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

      <style jsx>{`
        .insight-item {
          margin-bottom: 1rem;
        }
        .insight-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }
        .progress-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          transition: width 0.5s ease;
        }
        .insight-message {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.5rem;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
