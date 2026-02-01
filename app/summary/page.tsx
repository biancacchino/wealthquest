"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentSession, saveUser, createInitialGameState } from "../../services/storage";
import { GameState } from "../../types";
import { LoadingScreen } from "../../components/LoadingScreen";

// Compute stats from history
const computeStatsFromHistory = (history: any[], balance: number, goalCost: number) => {
  if (history.length === 0) {
    return { futurePreparedness: 50, financialMindfulness: 50 };
  }
  const goalProgress = Math.min(100, (balance / goalCost) * 100);
  const skips = history.filter((e: any) => e.choice === 'skip').length;
  const skipRatio = (skips / history.length) * 100;
  const bufferScore = Math.min(100, (balance / 25) * 100);
  const futurePreparedness = Math.round((goalProgress * 0.5) + (skipRatio * 0.3) + (bufferScore * 0.2));

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

const getInsightMessage = (statName: string, value: number): string => {
  if (statName === 'futurePreparedness') {
    if (value >= 70) return "You're building a solid foundation!";
    if (value >= 40) return "Making progress. Keep it up!";
    return "Every journey starts somewhere.";
  }
  if (statName === 'financialMindfulness') {
    if (value >= 70) return "Thoughtful choices pay off!";
    if (value >= 40) return "Learning to balance needs & wants.";
    return "Awareness is the first step.";
  }
  return "";
};

const getPositiveFeedback = (history: any[], bankHistory: any[], stats: { futurePreparedness: number; financialMindfulness: number }): string[] => {
  const feedback: string[] = [];
  const purchases = history.filter((e: any) => e.choice === 'buy');
  const skips = history.filter((e: any) => e.choice === 'skip');
  const needPurchases = purchases.filter((e: any) => e.category === 'need');
  const wantPurchases = purchases.filter((e: any) => e.category === 'want');
  const deposits = bankHistory.filter((tx: any) => tx.type === 'deposit');
  
  if (skips.length >= 3) feedback.push(`Showed self-control ${skips.length}x!`);
  if (needPurchases.length > wantPurchases.length && needPurchases.length > 0) feedback.push(`Prioritized needs over wants!`);
  if (deposits.length > 0) {
    const totalDeposited = deposits.reduce((sum: number, tx: any) => sum + tx.amount, 0);
    feedback.push(`Saved $${totalDeposited.toFixed(2)} at the bank!`);
  }
  if (stats.futurePreparedness >= 70) feedback.push(`Excellent future planning!`);
  if (stats.financialMindfulness >= 70) feedback.push(`Thoughtful spending decisions!`);
  if (history.length > 0 && skips.length / history.length >= 0.5) feedback.push(`Patience pays off!`);
  if (feedback.length === 0) feedback.push(`Started learning about money!`);
  return feedback.slice(0, 3);
};

const getImprovementFeedback = (history: any[], bankHistory: any[], stats: { futurePreparedness: number; financialMindfulness: number }, bankBalance: number, goalCost: number): string[] => {
  const feedback: string[] = [];
  const purchases = history.filter((e: any) => e.choice === 'buy');
  const skips = history.filter((e: any) => e.choice === 'skip');
  const wantPurchases = purchases.filter((e: any) => e.category === 'want');
  const deposits = bankHistory.filter((tx: any) => tx.type === 'deposit');
  
  if (wantPurchases.length > 3) feedback.push(`Review ${wantPurchases.length} "want" purchases.`);
  if (deposits.length === 0 && history.length > 0) feedback.push(`Try using the bank more!`);
  if (stats.futurePreparedness < 40) feedback.push(`Focus on your savings goal!`);
  if (stats.financialMindfulness < 40 && purchases.length > skips.length * 2) feedback.push(`Balance buying and saving.`);
  if (bankBalance < goalCost * 0.5 && history.length > 5) feedback.push(`Keep pushing to your goal!`);
  if (feedback.length === 0) feedback.push(`Try new strategies next time!`);
  return feedback.slice(0, 3);
};

type TabType = 'stats' | 'tips' | 'history';

export default function SummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showLoading, setShowLoading] = useState(false);
  const [username, setUsername] = useState<string>('Adventurer');
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  
  const completed = searchParams.get('completed') === 'true';
  const gaveUp = searchParams.get('completed') === 'false';

  useEffect(() => {
    const user = getCurrentSession();
    if (!user) {
      router.push("/");
      return;
    }
    setGameState(user.gameState);
    setUsername(user.username || 'Adventurer');
  }, [router]);

  const summary = useMemo(() => {
    if (!gameState) return null;
    const history = gameState.money.history;
    const purchases = history.filter((event) => event.choice === "buy").length;
    const skips = history.filter((event) => event.choice === "skip").length;
    
    const recent = history.slice(-5).map((event) => ({
      id: event.id,
      day: 1,
      encounterId: event.encounterId,
      choice: event.choice,
      cost: event.cost,
      balanceAfter: event.deltas.balanceAfter
    }));

    const stats = computeStatsFromHistory(history, gameState.money.bankBalance, gameState.money.goal.cost);
    const positiveFeedback = getPositiveFeedback(history, gameState.money.bankHistory || [], stats);
    const improvementFeedback = getImprovementFeedback(
      history, 
      gameState.money.bankHistory || [], 
      stats, 
      gameState.money.bankBalance || 0, 
      gameState.money.goal.cost
    );

    return {
      purchases,
      skips,
      cash: gameState.money.balance || 0,
      savings: gameState.money.bankBalance || 0,
      recent,
      stats,
      positiveFeedback,
      improvementFeedback
    };
  }, [gameState]);

  const handlePlayAgain = () => {
    const user = getCurrentSession();
    if (!user) return;
    const newState = createInitialGameState();
    const updatedUser = { ...user, gameState: newState };
    saveUser(updatedUser);
    setShowLoading(true);
  };

  const handleLoadComplete = () => {
    router.push("/");
  };

  if (showLoading) {
    return <LoadingScreen onLoadComplete={handleLoadComplete} characterName={username} />;
  }

  if (!gameState || !summary) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#1a1a2e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Press Start 2P', monospace",
        color: "#7ab8d8"
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  const headerBg = completed ? "#22c55e" : gaveUp ? "#64748b" : "#5a98b8";
  const headerBorder = completed ? "#16a34a" : gaveUp ? "#475569" : "#3a7a98";

  const renderStatBox = (label: string, value: string | number, emoji: string) => (
    <div style={{
      backgroundColor: "#2a2a4a",
      border: "3px solid #5a98b8",
      borderRadius: "4px",
      padding: "12px",
      textAlign: "center",
      boxShadow: "inset 1px 1px 0 #3a3a6a, inset -1px -1px 0 #1a1a3a, 3px 3px 0 rgba(0,0,0,0.3)"
    }}>
      <div style={{ fontSize: "20px", marginBottom: "4px" }}>{emoji}</div>
      <div style={{ fontSize: "14px", color: "#4ade80", marginBottom: "4px" }}>{value}</div>
      <div style={{ fontSize: "8px", color: "#7ab8d8" }}>{label}</div>
    </div>
  );

  const renderProgressBar = (value: number, label: string) => (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "9px", color: "#d1d5db" }}>{label}</span>
        <span style={{ fontSize: "9px", color: value >= 70 ? "#4ade80" : value >= 40 ? "#fbbf24" : "#f87171" }}>{value}%</span>
      </div>
      <div style={{
        height: "12px",
        backgroundColor: "#1a1a2e",
        border: "2px solid #3a7a98",
        borderRadius: "2px",
        overflow: "hidden"
      }}>
        <div style={{
          width: `${value}%`,
          height: "100%",
          backgroundColor: value >= 70 ? "#4ade80" : value >= 40 ? "#fbbf24" : "#f87171",
          transition: "width 0.5s ease",
          boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.2)"
        }} />
      </div>
      <div style={{ fontSize: "7px", color: "#6b7280", marginTop: "4px", fontStyle: "italic" }}>
        {getInsightMessage(label === "Future Prep" ? "futurePreparedness" : "financialMindfulness", value)}
      </div>
    </div>
  );

  const tabStyle = (isActive: boolean) => ({
    padding: "8px 16px",
    fontSize: "9px",
    backgroundColor: isActive ? "#5a98b8" : "#2a2a4a",
    color: isActive ? "#fff" : "#7ab8d8",
    border: `2px solid ${isActive ? "#7ab8d8" : "#3a7a98"}`,
    borderBottom: isActive ? "none" : "2px solid #3a7a98",
    borderRadius: "4px 4px 0 0",
    cursor: "pointer",
    marginRight: "4px",
    transition: "all 0.2s ease"
  });

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#1a1a2e",
      backgroundImage: "radial-gradient(#2a2a4a 1px, transparent 1px)",
      backgroundSize: "20px 20px",
      padding: "20px",
      fontFamily: "'Press Start 2P', monospace"
    }}>
      <div style={{
        maxWidth: "600px",
        margin: "0 auto"
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: headerBg,
          border: `4px solid ${headerBorder}`,
          borderRadius: "8px",
          padding: "20px",
          textAlign: "center",
          marginBottom: "20px",
          boxShadow: `inset 2px 2px 0 rgba(255,255,255,0.3), inset -2px -2px 0 rgba(0,0,0,0.2), 6px 6px 0 rgba(0,0,0,0.4)`
        }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>
            {completed ? "🎉" : gaveUp ? "📊" : "📈"}
          </div>
          <h1 style={{
            fontSize: "16px",
            color: "#fff",
            margin: "0 0 8px 0",
            textShadow: "2px 2px 0 rgba(0,0,0,0.3)"
          }}>
            {completed ? "GOAL ACHIEVED!" : gaveUp ? "RUN ENDED" : "SUMMARY"}
          </h1>
          <p style={{
            fontSize: "8px",
            color: "rgba(255,255,255,0.9)",
            margin: 0
          }}>
            {completed 
              ? `You got your ${gameState.money.goal.label}!`
              : gaveUp 
                ? "Every experience is a lesson"
                : `Progress toward ${gameState.money.goal.label}`}
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
          marginBottom: "20px"
        }}>
          {renderStatBox("Cash", `$${summary.cash.toFixed(0)}`, "💵")}
          {renderStatBox("Saved", `$${summary.savings.toFixed(0)}`, "🏦")}
          {renderStatBox("Bought", summary.purchases, "🛒")}
          {renderStatBox("Skipped", summary.skips, "⏭️")}
        </div>

        {/* Main Content Card */}
        <div style={{
          backgroundColor: "#5a98b8",
          border: "4px solid #3a7a98",
          borderRadius: "8px",
          boxShadow: "inset 2px 2px 0 #7ab8d8, inset -2px -2px 0 #2a5a78, 6px 6px 0 rgba(0,0,0,0.4)",
          overflow: "hidden"
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex",
            padding: "12px 12px 0",
            backgroundColor: "#3a7a98"
          }}>
            <button style={tabStyle(activeTab === 'stats')} onClick={() => setActiveTab('stats')}>📊 Stats</button>
            <button style={tabStyle(activeTab === 'tips')} onClick={() => setActiveTab('tips')}>💡 Tips</button>
            <button style={tabStyle(activeTab === 'history')} onClick={() => setActiveTab('history')}>📜 History</button>
          </div>

          {/* Tab Content */}
          <div style={{ padding: "16px", backgroundColor: "#5a98b8" }}>
            {activeTab === 'stats' && (
              <div>
                <h3 style={{ fontSize: "10px", color: "#fff", marginBottom: "16px", textShadow: "1px 1px 0 rgba(0,0,0,0.3)" }}>
                  📈 Your Performance
                </h3>
                {renderProgressBar(summary.stats.futurePreparedness, "Future Prep")}
                {renderProgressBar(summary.stats.financialMindfulness, "Mindfulness")}
                
                {!completed && (
                  <div style={{
                    backgroundColor: "#2a5a78",
                    border: "2px solid #1a4a68",
                    borderRadius: "4px",
                    padding: "12px",
                    marginTop: "16px"
                  }}>
                    <p style={{ fontSize: "8px", color: "#d1d5db", margin: 0 }}>
                      🎯 Goal: {gameState.money.goal.label} (${gameState.money.goal.cost})
                    </p>
                    <p style={{ fontSize: "8px", color: "#fbbf24", margin: "8px 0 0 0" }}>
                      ${Math.max(0, gameState.money.goal.cost - summary.savings).toFixed(2)} more needed!
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tips' && (
              <div>
                {/* What You Did Well */}
                <div style={{
                  backgroundColor: "rgba(74, 222, 128, 0.2)",
                  border: "2px solid #4ade80",
                  borderRadius: "4px",
                  padding: "12px",
                  marginBottom: "16px"
                }}>
                  <h4 style={{ fontSize: "9px", color: "#4ade80", margin: "0 0 10px 0" }}>✨ What You Did Well</h4>
                  {summary.positiveFeedback.map((fb, i) => (
                    <p key={i} style={{ fontSize: "8px", color: "#d1d5db", margin: "6px 0", paddingLeft: "8px", borderLeft: "2px solid #4ade80" }}>
                      {fb}
                    </p>
                  ))}
                </div>

                {/* Room to Grow */}
                <div style={{
                  backgroundColor: "rgba(251, 191, 36, 0.2)",
                  border: "2px solid #fbbf24",
                  borderRadius: "4px",
                  padding: "12px"
                }}>
                  <h4 style={{ fontSize: "9px", color: "#fbbf24", margin: "0 0 10px 0" }}>🌱 Room to Grow</h4>
                  {summary.improvementFeedback.map((fb, i) => (
                    <p key={i} style={{ fontSize: "8px", color: "#d1d5db", margin: "6px 0", paddingLeft: "8px", borderLeft: "2px solid #fbbf24" }}>
                      {fb}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 style={{ fontSize: "10px", color: "#fff", marginBottom: "12px", textShadow: "1px 1px 0 rgba(0,0,0,0.3)" }}>
                  📜 Recent Decisions
                </h3>
                {summary.recent.length > 0 ? (
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {summary.recent.map((event, i) => (
                      <div key={event.id} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px",
                        backgroundColor: i % 2 === 0 ? "rgba(0,0,0,0.1)" : "transparent",
                        borderRadius: "2px"
                      }}>
                        <span style={{ fontSize: "7px", color: "#d1d5db", flex: 1 }}>
                          {event.encounterId.replace(/_/g, ' ')}
                        </span>
                        <span style={{
                          fontSize: "7px",
                          padding: "2px 6px",
                          borderRadius: "2px",
                          backgroundColor: event.choice === 'buy' ? "#ef4444" : "#22c55e",
                          color: "#fff"
                        }}>
                          {event.choice === 'buy' ? `BUY $${event.cost.toFixed(0)}` : 'SKIP'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: "8px", color: "#7ab8d8", textAlign: "center" }}>No decisions yet!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Play Again Button */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p style={{
            fontSize: "8px",
            color: "#7ab8d8",
            marginBottom: "12px",
            fontStyle: "italic"
          }}>
            {completed 
              ? "Ready to try for a bigger goal?"
              : "Different choices, different outcomes!"}
          </p>
          <button
            onClick={handlePlayAgain}
            style={{
              padding: "14px 32px",
              fontSize: "12px",
              fontFamily: "'Press Start 2P', monospace",
              backgroundColor: "#4ade80",
              color: "#1a1a2e",
              border: "4px solid #22c55e",
              borderRadius: "4px",
              cursor: "pointer",
              boxShadow: "inset 2px 2px 0 #6ee7a0, inset -2px -2px 0 #16a34a, 4px 4px 0 rgba(0,0,0,0.4)",
              transition: "transform 0.1s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            🎮 PLAY AGAIN
          </button>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center",
          marginTop: "24px",
          padding: "12px",
          borderTop: "2px dashed #3a7a98"
        }}>
          <p style={{ fontSize: "7px", color: "#5a98b8", margin: 0 }}>
            Thanks for playing, {username}! 💙
          </p>
        </div>
      </div>
    </div>
  );
}
