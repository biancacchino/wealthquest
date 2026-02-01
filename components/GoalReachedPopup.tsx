"use client";

import React from "react";
import type { MoneyGoal } from "../types";

interface GoalReachedPopupProps {
  goal: MoneyGoal;
  bankBalance: number;
  onConfirm: () => void;
  onDecline: () => void;
}

export const GoalReachedPopup: React.FC<GoalReachedPopupProps> = ({
  goal,
  bankBalance,
  onConfirm,
  onDecline,
}) => {
  const goalEmojis: Record<string, string> = {
    treat: "🍦",
    headphones: "🎧",
    game: "🎮",
    outfit: "👕",
    biggoal: "🌟",
  };

  const emoji = goalEmojis[goal.id] || "🎯";

  return (
    <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center p-4">
      <div
        className="w-full max-w-md p-2"
        style={{
          backgroundColor: "#4ade80",
          border: "4px solid #22c55e",
          borderRadius: "8px",
          boxShadow: "inset 2px 2px 0 #86efac, inset -2px -2px 0 #16a34a",
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        {/* Title Bar */}
        <div
          className="flex items-center justify-center px-3 py-3 mb-2"
          style={{ backgroundColor: "#22c55e", borderRadius: "4px" }}
        >
          <span className="text-white font-bold text-sm tracking-wide">
            🎉 GOAL REACHED! 🎉
          </span>
        </div>

        {/* Inner Content Panel */}
        <div
          className="p-6"
          style={{
            backgroundColor: "#fffef8",
            border: "4px solid #bbf7d0",
            borderRadius: "4px",
            boxShadow: "inset 2px 2px 0 #fff, inset -2px -2px 0 #86efac",
          }}
        >
          {/* Goal Icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-20 h-20 animate-bounce"
              style={{
                backgroundColor: "#dcfce7",
                border: "3px solid #86efac",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "40px",
              }}
            >
              {emoji}
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <p className="text-gray-800 font-bold text-sm mb-3">
              You saved enough for your goal!
            </p>
            <p className="text-green-700 text-xs mb-2">
              {goal.label} - ${goal.cost.toFixed(2)}
            </p>
            <p className="text-gray-600 text-[10px]">
              Your savings: ${bankBalance.toFixed(2)}
            </p>
          </div>

          {/* Question */}
          <div className="text-center mb-6">
            <p className="text-gray-700 font-bold text-xs">
              Would you like to buy it now?
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={onConfirm}
              className="w-full py-3 text-xs font-bold text-white transition-transform hover:scale-[1.02]"
              style={{
                backgroundColor: "#22c55e",
                borderRadius: "20px",
                border: "3px solid #16a34a",
                boxShadow: "inset 0 2px 0 #4ade80, inset 0 -2px 0 #15803d",
              }}
            >
              🛒 Buy {goal.label}!
            </button>
            <button
              onClick={onDecline}
              className="w-full py-2 text-[10px] font-bold text-gray-600 transition-transform hover:scale-[1.02]"
              style={{
                backgroundColor: "#f3f4f6",
                borderRadius: "16px",
                border: "2px solid #d1d5db",
                boxShadow: "inset 0 1px 0 #fff, inset 0 -1px 0 #e5e7eb",
              }}
            >
              Keep Saving
            </button>
          </div>

          {/* Tip */}
          <p className="text-center text-gray-400 text-[8px] mt-4">
            Tip: You can always save more for bigger goals!
          </p>
        </div>
      </div>
    </div>
  );
};
