import React from 'react';
import { MoneyState } from '../types';

interface MoneyHUDProps {
  money: MoneyState;
  onGoalClick: () => void;
  onAllowanceClick?: () => void;
  className?: string;
}

export const MoneyHUD: React.FC<MoneyHUDProps> = ({ money, onGoalClick, onAllowanceClick, className = '' }) => {
  const progressPercent = Math.min(100, (money.balance / money.goal.cost) * 100);
  const daysUntilPayday = 7 - money.dayIndex;
  const amountNeeded = Math.max(0, money.goal.cost - money.balance);
  const weeksToGoal = amountNeeded > 0 
    ? Math.ceil(amountNeeded / money.weeklyAllowance) 
    : 0;

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
          <span className="text-white text-[8px] font-bold tracking-wide">💰 MY MONEY</span>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Balance Display */}
          <div
            style={{
              backgroundColor: '#fffef8',
              border: '3px solid #c8d8e8',
              borderRadius: '4px',
              boxShadow: 'inset 2px 2px 0 #fff, inset -2px -2px 0 #b8c8d8',
            }}
            className="p-2"
          >
            <div className="text-[8px] text-gray-500 uppercase tracking-wider mb-1">Balance</div>
            <div className="text-gray-800 text-sm font-bold">${money.balance.toFixed(0)}</div>
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
                  <span>${money.balance} of ${money.goal.cost} saved</span>
                )}
              </div>
            </div>
          </button>

          {/* Info Row */}
          <div className="flex gap-2">
            {/* Days until payday */}
            <div
              className="flex-1 p-2 text-center"
              style={{
                backgroundColor: '#e8f4e8',
                border: '2px solid #a8d8a8',
                borderRadius: '4px',
              }}
            >
              <div className="text-[7px] text-gray-500 uppercase">Payday</div>
              <div className="text-[10px] text-gray-700 font-bold">
                {daysUntilPayday === 0 ? 'Today!' : `${daysUntilPayday}d`}
              </div>
            </div>

            {/* Weeks to goal */}
            <div
              className="flex-1 p-2 text-center"
              style={{
                backgroundColor: '#f8f4e8',
                border: '2px solid #d8c8a8',
                borderRadius: '4px',
              }}
            >
              <div className="text-[7px] text-gray-500 uppercase">ETA</div>
              <div className="text-[10px] text-gray-700 font-bold">
                {weeksToGoal === 0 ? 'Done!' : `${weeksToGoal}w`}
              </div>
            </div>
          </div>

          {/* Weekly Allowance Info */}
          <button 
            onClick={onAllowanceClick}
            className="w-full text-center py-2 px-3 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            style={{
              backgroundColor: '#4888b0',
              borderRadius: '12px',
              border: '2px solid #3070a0',
              boxShadow: 'inset 0 2px 0 #68a8d0, inset 0 -2px 0 #285888',
            }}
          >
            <span className="text-[8px] text-white">
              +${money.weeklyAllowance}/week allowance
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
