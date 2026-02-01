"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
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

function SummaryContent() {
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
      <div className="flex items-center justify-center min-h-screen p-4" style={{ backgroundColor: '#7eb8d8' }}>
        <div 
          className="w-full max-w-lg p-2 my-auto"
          style={{ 
            backgroundColor: '#9ccce8',
            border: '4px solid #5a98b8',
            borderRadius: '8px',
            boxShadow: 'inset 2px 2px 0 #b8e0f0, inset -2px -2px 0 #4888a8'
          }}
        >
          <div 
            className="flex items-center justify-center px-3 py-2 mb-2"
            style={{ backgroundColor: '#5a98b8', borderRadius: '4px' }}
          >
            <span className="text-white font-bold text-sm tracking-wide" style={{ fontFamily: "'Press Start 2P', monospace" }}>Loading...</span>
          </div>
          <div 
            className="p-6 flex justify-center"
            style={{ 
              backgroundColor: '#fffef8',
              border: '4px solid #c8d8e8',
              borderRadius: '4px',
              boxShadow: 'inset 2px 2px 0 #fff, inset -2px -2px 0 #b8c8d8'
            }}
          >
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i}
                  className="w-2 h-2"
                  style={{ 
                    backgroundColor: '#5a98b8',
                    animation: `pixelBlink 1s ease-in-out ${i * 0.2}s infinite`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <style>{`
          @keyframes pixelBlink {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  const trophyEmoji = completed ? "🏆" : gaveUp ? "📊" : "⭐";
  const titleText = completed ? "GOAL ACHIEVED!" : gaveUp ? "RUN ENDED" : "SUMMARY";
  const subtitleText = completed 
    ? `You got your ${gameState.money.goal.label}!`
    : gaveUp 
      ? "Every experience is a lesson"
      : `Progress toward ${gameState.money.goal.label}`;

  const renderStatTile = (label: string, value: string | number, emoji: string) => (
    <div 
      style={{
        backgroundColor: '#d8ecf8',
        border: '3px solid #a0b8c8',
        borderRadius: '4px',
        padding: '12px 8px',
        textAlign: 'center',
        boxShadow: 'inset 2px 2px 0 #fff, inset -2px -2px 0 #90a8b8',
        cursor: 'pointer',
        transition: 'transform 0.1s ease'
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{ fontSize: '18px', marginBottom: '4px' }}>{emoji}</div>
      <div style={{ 
        fontSize: '12px', 
        color: '#3a7a98', 
        marginBottom: '2px',
        fontFamily: "'Press Start 2P', monospace"
      }}>{value}</div>
      <div style={{ 
        fontSize: '7px', 
        color: '#5a98b8',
        fontFamily: "'Press Start 2P', monospace"
      }}>{label}</div>
    </div>
  );

  const renderProgressBar = (value: number, label: string, emoji: string) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8px' 
      }}>
        <span style={{ 
          fontSize: '9px', 
          color: '#5a7888',
          fontFamily: "'Press Start 2P', monospace"
        }}>{emoji} {label}</span>
        <span style={{ 
          fontSize: '9px', 
          color: value >= 70 ? '#22c55e' : value >= 40 ? '#f59e0b' : '#ef4444',
          fontFamily: "'Press Start 2P', monospace"
        }}>{value}%</span>
      </div>
      <div 
        style={{ 
          height: '20px',
          backgroundColor: '#d8e8f0',
          border: '3px solid #a0b8c8',
          borderRadius: '2px',
          boxShadow: 'inset 1px 1px 0 #c0d0d8',
          overflow: 'hidden'
        }}
      >
        <div 
          style={{ 
            width: `${value}%`,
            height: '100%',
            backgroundColor: value >= 70 ? '#4ade80' : value >= 40 ? '#fbbf24' : '#f87171',
            boxShadow: value >= 70 
              ? 'inset 0 2px 0 #6ee7a0, inset 0 -2px 0 #22c55e'
              : value >= 40 
                ? 'inset 0 2px 0 #fcd34d, inset 0 -2px 0 #d97706'
                : 'inset 0 2px 0 #fca5a5, inset 0 -2px 0 #dc2626',
            transition: 'width 0.5s ease'
          }}
        />
      </div>
      <div style={{ 
        fontSize: '7px', 
        color: '#7a9aa8', 
        marginTop: '6px', 
        fontStyle: 'italic',
        fontFamily: "'Press Start 2P', monospace"
      }}>
        {getInsightMessage(label === "Future Prep" ? "futurePreparedness" : "financialMindfulness", value)}
      </div>
    </div>
  );

  const tabButtonStyle = (isActive: boolean) => ({
    padding: '10px 16px',
    fontSize: '8px',
    fontFamily: "'Press Start 2P', monospace",
    backgroundColor: isActive ? '#4888b0' : '#6aa8c8',
    color: '#fff',
    border: '3px solid ' + (isActive ? '#3070a0' : '#5a98b8'),
    borderRadius: '20px',
    cursor: 'pointer',
    boxShadow: isActive 
      ? 'inset 0 2px 0 #68a8d0, inset 0 -2px 0 #285888'
      : 'inset 0 2px 0 #8ac8e8, inset 0 -2px 0 #4a88a8',
    transition: 'all 0.2s ease',
    marginRight: '8px'
  });

  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ backgroundColor: '#7eb8d8' }}>
      {/* Main Container - LoadingScreen style */}
      <div 
        className="w-full max-w-lg p-2 my-auto"
        style={{ 
          backgroundColor: '#9ccce8',
          border: '4px solid #5a98b8',
          borderRadius: '8px',
          boxShadow: 'inset 2px 2px 0 #b8e0f0, inset -2px -2px 0 #4888a8'
        }}
      >
        {/* Title Bar */}
        <div 
          className="flex items-center justify-between px-3 py-2 mb-2"
          style={{ backgroundColor: '#5a98b8', borderRadius: '4px' }}
        >
          <span 
            className="text-white font-bold text-sm tracking-wide"
            style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
          >
            {titleText}
          </span>
          <span 
            className="text-white/70"
            style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px' }}
          >
            {username}
          </span>
        </div>

        {/* Inner Content Panel */}
        <div 
          className="p-4"
          style={{ 
            backgroundColor: '#fffef8',
            border: '4px solid #c8d8e8',
            borderRadius: '4px',
            boxShadow: 'inset 2px 2px 0 #fff, inset -2px -2px 0 #b8c8d8'
          }}
        >
          {/* Bouncing Trophy Icon */}
          <div className="flex justify-center mb-4">
            <div 
              className="w-16 h-16 animate-bounce"
              style={{ 
                backgroundColor: '#d8ecf8',
                border: '3px solid #a0b8c8',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}
            >
              {trophyEmoji}
            </div>
          </div>

          {/* Subtitle */}
          <div className="text-center mb-4">
            <p 
              className="text-gray-600 mb-1"
              style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px' }}
            >
              {subtitleText}
            </p>
          </div>

          {/* Stats Grid - Styled Tiles */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            marginBottom: '16px'
          }}>
            {renderStatTile("Cash", `$${summary.cash.toFixed(0)}`, "💵")}
            {renderStatTile("Saved", `$${summary.savings.toFixed(0)}`, "🏦")}
            {renderStatTile("Bought", summary.purchases, "🛒")}
            {renderStatTile("Skipped", summary.skips, "⏭️")}
          </div>

          {/* Tab Navigation - Pill Style */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '4px'
          }}>
            <button 
              style={tabButtonStyle(activeTab === 'stats')} 
              onClick={() => setActiveTab('stats')}
            >
              📊 Stats
            </button>
            <button 
              style={tabButtonStyle(activeTab === 'tips')} 
              onClick={() => setActiveTab('tips')}
            >
              💡 Tips
            </button>
            <button 
              style={tabButtonStyle(activeTab === 'history')} 
              onClick={() => setActiveTab('history')}
            >
              📜 History
            </button>
          </div>

          {/* Tab Content Area */}
          <div 
            style={{ 
              backgroundColor: '#e8f4f8',
              border: '3px solid #c8d8e8',
              borderRadius: '4px',
              padding: '16px',
              boxShadow: 'inset 1px 1px 0 #f0f8fc, inset -1px -1px 0 #b8c8d8',
              minHeight: '180px'
            }}
          >
            {activeTab === 'stats' && (
              <div>
                {renderProgressBar(summary.stats.futurePreparedness, "Future Prep", "📈")}
                {renderProgressBar(summary.stats.financialMindfulness, "Mindfulness", "🧠")}
                
                {!completed && (
                  <div 
                    style={{
                      backgroundColor: '#d8ecf8',
                      border: '3px solid #a0b8c8',
                      borderRadius: '4px',
                      padding: '12px',
                      marginTop: '12px',
                      boxShadow: 'inset 1px 1px 0 #e8f4fc, inset -1px -1px 0 #90a8b8'
                    }}
                  >
                    <p style={{ 
                      fontSize: '8px', 
                      color: '#5a7888', 
                      margin: 0,
                      fontFamily: "'Press Start 2P', monospace"
                    }}>
                      🎯 Goal: {gameState.money.goal.label}
                    </p>
                    <p style={{ 
                      fontSize: '8px', 
                      color: '#f59e0b', 
                      margin: '8px 0 0 0',
                      fontFamily: "'Press Start 2P', monospace"
                    }}>
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
                  backgroundColor: '#dcfce7',
                  border: '3px solid #86efac',
                  borderRadius: '4px',
                  padding: '12px',
                  marginBottom: '12px',
                  boxShadow: 'inset 1px 1px 0 #f0fdf4, inset -1px -1px 0 #6ee7a0'
                }}>
                  <h4 style={{ 
                    fontSize: '8px', 
                    color: '#16a34a', 
                    margin: '0 0 10px 0',
                    fontFamily: "'Press Start 2P', monospace"
                  }}>✨ What You Did Well</h4>
                  {summary.positiveFeedback.map((fb, i) => (
                    <p key={i} style={{ 
                      fontSize: '7px', 
                      color: '#166534', 
                      margin: '6px 0', 
                      paddingLeft: '8px', 
                      borderLeft: '2px solid #4ade80',
                      fontFamily: "'Press Start 2P', monospace"
                    }}>
                      {fb}
                    </p>
                  ))}
                </div>

                {/* Room to Grow */}
                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '3px solid #fcd34d',
                  borderRadius: '4px',
                  padding: '12px',
                  boxShadow: 'inset 1px 1px 0 #fefce8, inset -1px -1px 0 #f59e0b'
                }}>
                  <h4 style={{ 
                    fontSize: '8px', 
                    color: '#b45309', 
                    margin: '0 0 10px 0',
                    fontFamily: "'Press Start 2P', monospace"
                  }}>🌱 Room to Grow</h4>
                  {summary.improvementFeedback.map((fb, i) => (
                    <p key={i} style={{ 
                      fontSize: '7px', 
                      color: '#92400e', 
                      margin: '6px 0', 
                      paddingLeft: '8px', 
                      borderLeft: '2px solid #fbbf24',
                      fontFamily: "'Press Start 2P', monospace"
                    }}>
                      {fb}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 style={{ 
                  fontSize: '9px', 
                  color: '#5a7888', 
                  marginBottom: '12px',
                  fontFamily: "'Press Start 2P', monospace"
                }}>
                  Recent Decisions
                </h3>
                {summary.recent.length > 0 ? (
                  <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {summary.recent.map((event, i) => (
                      <div key={event.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: i % 2 === 0 ? '#d8ecf8' : '#e8f4f8',
                        borderRadius: '4px',
                        marginBottom: '4px',
                        border: '2px solid #c8d8e8'
                      }}>
                        <span style={{ 
                          fontSize: '6px', 
                          color: '#5a7888', 
                          flex: 1,
                          fontFamily: "'Press Start 2P', monospace"
                        }}>
                          {event.encounterId.replace(/_/g, ' ')}
                        </span>
                        <span style={{
                          fontSize: '6px',
                          padding: '3px 8px',
                          borderRadius: '10px',
                          backgroundColor: event.choice === 'buy' ? '#fecaca' : '#bbf7d0',
                          color: event.choice === 'buy' ? '#b91c1c' : '#15803d',
                          border: event.choice === 'buy' ? '2px solid #f87171' : '2px solid #4ade80',
                          fontFamily: "'Press Start 2P', monospace"
                        }}>
                          {event.choice === 'buy' ? `BUY $${event.cost.toFixed(0)}` : 'SKIP'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ 
                    fontSize: '8px', 
                    color: '#7a9aa8', 
                    textAlign: 'center',
                    fontFamily: "'Press Start 2P', monospace"
                  }}>No decisions yet!</p>
                )}
              </div>
            )}
          </div>

          {/* Blinking dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className="w-2 h-2"
                style={{ 
                  backgroundColor: '#5a98b8',
                  animation: `pixelBlink 1s ease-in-out ${i * 0.2}s infinite`
                }}
              />
            ))}
          </div>
        </div>

        {/* Play Again Button - Tip Box Style */}
        <div 
          className="mt-2 py-3 px-4 text-center cursor-pointer"
          style={{ 
            backgroundColor: '#4ade80',
            borderRadius: '20px',
            border: '3px solid #22c55e',
            boxShadow: 'inset 0 2px 0 #6ee7a0, inset 0 -2px 0 #16a34a',
            transition: 'transform 0.1s ease'
          }}
          onClick={handlePlayAgain}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <p 
            className="font-bold"
            style={{ 
              color: '#166534',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '10px',
              margin: 0
            }}
          >
            🎮 PLAY AGAIN
          </p>
        </div>

        {/* Footer Tip Box */}
        <div 
          className="mt-2 py-3 px-4 text-center"
          style={{ 
            backgroundColor: '#4888b0',
            borderRadius: '20px',
            border: '3px solid #3070a0',
            boxShadow: 'inset 0 2px 0 #68a8d0, inset 0 -2px 0 #285888'
          }}
        >
          <p 
            className="text-white font-bold"
            style={{ 
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              margin: 0
            }}
          >
            💙 Thanks for playing, {username}!
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pixelBlink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen p-4" style={{ backgroundColor: '#7eb8d8' }}>
        <div 
          className="w-full max-w-lg p-2 my-auto"
          style={{ 
            backgroundColor: '#9ccce8',
            border: '4px solid #5a98b8',
            borderRadius: '8px',
            boxShadow: 'inset 2px 2px 0 #b8e0f0, inset -2px -2px 0 #4888a8'
          }}
        >
          <div 
            className="flex items-center justify-center px-3 py-2 mb-2"
            style={{ backgroundColor: '#5a98b8', borderRadius: '4px' }}
          >
            <span className="text-white font-bold text-sm tracking-wide" style={{ fontFamily: "'Press Start 2P', monospace" }}>Loading...</span>
          </div>
          <div 
            className="p-6 flex justify-center"
            style={{ 
              backgroundColor: '#fffef8',
              border: '4px solid #c8d8e8',
              borderRadius: '4px',
              boxShadow: 'inset 2px 2px 0 #fff, inset -2px -2px 0 #b8c8d8'
            }}
          >
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i}
                  className="w-2 h-2"
                  style={{ 
                    backgroundColor: '#5a98b8',
                    animation: `pixelBlink 1s ease-in-out ${i * 0.2}s infinite`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <style>{`
          @keyframes pixelBlink {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    }>
      <SummaryContent />
    </Suspense>
  );
}
