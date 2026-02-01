import React from 'react';
import { MoneyState, PlayerStats } from '../types';
import { WalletIcon } from './PixelIcons';

interface MoneyHUDProps {
  money: MoneyState;
  stats: PlayerStats;
  onGoalClick: () => void;
  className?: string;
}

export const MoneyHUD: React.FC<MoneyHUDProps> = ({ 
  money, 
  stats,
  onGoalClick, 
  className = '' 
}) => {
  // Total balance across all accounts
  const totalBalance = money.cash + money.bank + money.tfsa;
  
  // Goal progress = bank + tfsa (safe savings only), minus $5 emergency buffer
  const emergencyBuffer = 5;
  const safeSavings = money.bank + money.tfsa;
  const savedForGoal = Math.max(0, safeSavings - emergencyBuffer);
  const progressPercent = Math.min(100, (savedForGoal / money.goal.cost) * 100);
  const amountNeeded = Math.max(0, money.goal.cost - savedForGoal);
  
  // Show deposit warning when cash is high
  const showDepositWarning = money.cash >= 10;

  return (
    <div 
      className={`w-64 select-none ${className}`}
      style={{ fontFamily: '"Press Start 2P", monospace' }}
    >
      {/* Main HUD Panel */}
      <div
        style={{
          backgroundColor: '#9ccce8',
          border: '4px solid #5a98b8',
          borderRadius: '8px',
          boxShadow: 'inset 2px 2px 0 #b8e0f0, inset -2px -2px 0 #4888a8, 4px 4px 0 rgba(0,0,0,0.3)',
        }}
      >
        {/* Title Bar */}
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ 
            backgroundColor: '#5a98b8', 
            borderRadius: '4px 4px 0 0',
            borderBottom: '2px solid #4888a8'
          }}
        >
          <span className="text-white text-[8px] font-bold tracking-wide flex items-center gap-2">
            <WalletIcon className="w-4 h-4 text-white" />
            MY MONEY
          </span>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Cash Balance - with warning indicator */}
          <div
            style={{
              backgroundColor: showDepositWarning ? '#fef3c7' : '#fffef8',
              border: `3px solid ${showDepositWarning ? '#f59e0b' : '#c8d8e8'}`,
              borderRadius: '4px',
              boxShadow: 'inset 2px 2px 0 #fff, inset -2px -2px 0 #b8c8d8',
            }}
            className="p-2"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] text-gray-500 uppercase tracking-wider">💵 Cash</span>
              {showDepositWarning && <span className="text-[7px] text-amber-600">⚠️ Unsafe!</span>}
            </div>
            <div className="text-gray-800 text-sm font-bold">${money.cash.toFixed(2)}</div>
            {showDepositWarning && (
              <div className="text-[7px] text-amber-600 mt-1">Visit the bank to deposit!</div>
            )}
          </div>

          {/* Bank Balance - safe indicator */}
          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '3px solid #10b981',
              borderRadius: '4px',
              boxShadow: 'inset 2px 2px 0 #fff, inset -2px -2px 0 #a7f3d0',
            }}
            className="p-2"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] text-gray-500 uppercase tracking-wider">🏦 Bank</span>
              <span className="text-[7px] text-green-600">✓ Safe</span>
            </div>
            <div className="text-gray-800 text-sm font-bold">${money.bank.toFixed(2)}</div>
          </div>

          {/* TFSA Balance - investment indicator */}
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '3px solid #3b82f6',
              borderRadius: '4px',
              boxShadow: 'inset 2px 2px 0 #fff, inset -2px -2px 0 #bfdbfe',
            }}
            className="p-2"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] text-gray-500 uppercase tracking-wider">📈 TFSA</span>
              <span className="text-[7px] text-blue-600">✓ Invested</span>
            </div>
            <div className="text-gray-800 text-sm font-bold">${money.tfsa.toFixed(2)}</div>
          </div>

          {/* Goal Progress - Clickable */}
          <button
            onClick={onGoalClick}
            className="w-full text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: '#fffef8',
              border: '3px solid #c8d8e8',
              borderRadius: '4px',
              boxShadow: 'inset 2px 2px 0 #fff, inset -2px -2px 0 #b8c8d8',
            }}
          >
            <div className="p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] text-gray-500 uppercase tracking-wider">Goal</span>
                <span className="text-[8px] text-blue-600">tap to change ›</span>
              </div>
              <div className="text-gray-800 text-[10px] font-bold mb-2">
                {money.goal.label} (${money.goal.cost})
              </div>
              
              {/* Progress Bar */}
              <div
                className="h-4 overflow-hidden"
                style={{
                  backgroundColor: '#d8e8f0',
                  border: '2px solid #a0b8c8',
                  borderRadius: '2px',
                }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: progressPercent >= 100 ? '#4ade80' : '#58a8d0',
                    boxShadow: progressPercent >= 100 
                      ? 'inset 0 2px 0 #86efac, inset 0 -2px 0 #22c55e'
                      : 'inset 0 2px 0 #78c8e8, inset 0 -2px 0 #3888b0',
                  }}
                />
              </div>
              
              {/* Progress Text */}
              <div className="text-[8px] text-gray-600 mt-1">
                {progressPercent >= 100 ? (
                  <span className="text-green-600">✓ Goal reached!</span>
                ) : (
                  <span>${savedForGoal.toFixed(0)} of ${money.goal.cost} saved</span>
                )}
              </div>
            </div>
          </button>

          {/* Amount needed hint */}
          {amountNeeded > 0 && (
            <div 
              className="text-center py-2 px-3"
              style={{
                backgroundColor: '#4888b0',
                borderRadius: '12px',
                border: '2px solid #3070a0',
                boxShadow: 'inset 0 2px 0 #68a8d0, inset 0 -2px 0 #285888',
              }}
            >
              <span className="text-[8px] text-white">
                💼 Work to earn more!
              </span>
            </div>
          )}

          {/* Player Stats Section */}
          <div
            style={{
              backgroundColor: '#fffef8',
              border: '3px solid #c8d8e8',
              borderRadius: '4px',
              boxShadow: 'inset 2px 2px 0 #fff, inset -2px -2px 0 #b8c8d8',
            }}
            className="p-2"
          >
            <div className="text-[8px] text-gray-500 uppercase tracking-wider mb-2">Your Insights</div>
            
            {/* Future Preparedness */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[7px] text-gray-600">🌱 Building for Tomorrow</span>
                <span className="text-[7px] text-gray-500">{stats.futurePreparedness}%</span>
              </div>
              <div
                className="h-2 overflow-hidden"
                style={{
                  backgroundColor: '#e8e8e0',
                  border: '1px solid #c0c0b0',
                  borderRadius: '2px',
                }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${stats.futurePreparedness}%`,
                    backgroundColor: stats.futurePreparedness >= 70 ? '#4ade80' : stats.futurePreparedness >= 40 ? '#fbbf24' : '#f87171',
                  }}
                />
              </div>
            </div>

            {/* Financial Mindfulness */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[7px] text-gray-600">💭 Making Intentional Choices</span>
                <span className="text-[7px] text-gray-500">{stats.financialMindfulness}%</span>
              </div>
              <div
                className="h-2 overflow-hidden"
                style={{
                  backgroundColor: '#e8e8e0',
                  border: '1px solid #c0c0b0',
                  borderRadius: '2px',
                }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${stats.financialMindfulness}%`,
                    backgroundColor: stats.financialMindfulness >= 70 ? '#4ade80' : stats.financialMindfulness >= 40 ? '#fbbf24' : '#f87171',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
