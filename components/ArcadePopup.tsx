"use client";

import React, { useState } from "react";
import type { EncounterCategory } from "../types";

export interface ArcadeItem {
  id: string;
  name: string;
  price: number;
  emoji?: string;
  category?: EncounterCategory;
}

interface ArcadePopupProps {
  title: string;
  items: ArcadeItem[];
  userBalance: number;
  bankBalance?: number;
  onPurchase: (itemId: string, itemName: string, price: number, category?: EncounterCategory) => void;
  onCancel: () => void;
}

export const ArcadePopup: React.FC<ArcadePopupProps> = ({
  title,
  items,
  userBalance,
  bankBalance = 0,
  onPurchase,
  onCancel,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const selectedItem = items.find((item) => item.id === selectedItemId);
  const canAffordSelected = selectedItem
    ? userBalance >= selectedItem.price
    : false;

  const handleBuy = () => {
    if (selectedItem && canAffordSelected) {
      onPurchase(selectedItem.id, selectedItem.name, selectedItem.price, selectedItem.category || 'want');
      setSelectedItemId(null);
    }
  };

  // Render educational balance messages
  const renderBalanceMessage = () => {
    if (!selectedItem) return null;
    
    const afterPurchase = userBalance - selectedItem.price;
    const cantAfford = userBalance < selectedItem.price;
    const wouldSpendAll = afterPurchase === 0;
    const wouldLeaveLittle = afterPurchase > 0 && afterPurchase < 5;
    const hasSavingsToHelp = bankBalance > 0 && cantAfford && (userBalance + bankBalance) >= selectedItem.price;
    
    if (cantAfford && hasSavingsToHelp) {
      return (
        <div className="text-amber-600 mt-2 text-[10px] font-bold">
          💡 You have ${bankBalance.toFixed(2)} in savings! But remember: savings are for your future goals. Is this purchase worth dipping into them?
        </div>
      );
    }
    
    if (cantAfford) {
      return (
        <div className="text-red-600 mt-2 text-[10px] font-bold">
          ❌ You can&apos;t afford this right now. Keep saving!
        </div>
      );
    }
    
    if (wouldSpendAll) {
      return (
        <div className="text-orange-600 mt-2 text-[10px] font-bold">
          ⚠️ This would use ALL your cash! Always keep some money for emergencies.
        </div>
      );
    }
    
    if (wouldLeaveLittle) {
      return (
        <div className="text-yellow-600 mt-2 text-[10px] font-bold">
          💭 This would leave you with only ${afterPurchase.toFixed(2)}. Budget carefully!
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="fixed inset-0 z-20 bg-black/80 flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl"
        style={{
          backgroundColor: "#10b981",
          border: "6px solid #059669",
          borderRadius: "8px",
          boxShadow:
            "inset 2px 2px 0 #34d399, inset -2px -2px 0 #047857, 8px 8px 0 rgba(0,0,0,0.5)",
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        {/* Title Bar */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            backgroundColor: "#059669",
            borderBottom: "4px solid #047857",
            borderRadius: "2px 2px 0 0",
          }}
        >
          <span className="text-white text-lg font-bold tracking-wide uppercase flex items-center gap-2">
            🕹️ {title}
            <span className="animate-pulse">🎮</span>
          </span>
          <button
            onClick={onCancel}
            className="text-white hover:text-yellow-300 text-2xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Container */}
        <div
          className="p-6"
          style={{
            backgroundColor: "#6ee7b7",
            borderRadius: "0 0 4px 4px",
          }}
        >
          <div className="grid grid-cols-2 gap-6">
            {/* Left Side - Arcade Emoji */}
            <div className="flex items-center justify-center">
              <div
                className="w-64 h-80 flex flex-col justify-center items-center gap-4"
                style={{
                  border: "4px solid #059669",
                  backgroundColor: "#1a1a2e",
                  borderRadius: "4px",
                }}
              >
                <span style={{ fontSize: "6rem", lineHeight: 1 }} className="animate-bounce">🕹️</span>
                <div className="flex gap-2">
                  <span className="text-2xl animate-pulse">🪙</span>
                  <span className="text-2xl animate-pulse delay-100">🪙</span>
                  <span className="text-2xl animate-pulse delay-200">🪙</span>
                </div>
              </div>
            </div>

            {/* Right Side - Items List */}
            <div className="flex flex-col">
              <h3
                className="text-sm font-bold mb-4 text-center p-3"
                style={{
                  backgroundColor: "#059669",
                  color: "white",
                  border: "2px solid #047857",
                  borderRadius: "4px",
                }}
              >
                Get tokens to play!
              </h3>

              <div className="space-y-2 flex-1 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const isSelected = selectedItemId === item.id;
                  const canAfford = userBalance >= item.price;
                  const isDisabled = !canAfford;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      disabled={isDisabled}
                      className={`w-full text-left transition-all ${
                        isDisabled
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:scale-105 cursor-pointer"
                      }`}
                      style={{
                        backgroundColor: isSelected ? "#f0f87a" : "#fffef8",
                        border: isSelected
                          ? "3px solid #d4c854"
                          : "2px solid #a7f3d0",
                        borderRadius: "4px",
                        boxShadow: isSelected
                          ? "inset 2px 2px 0 #fffeb8, inset -2px -2px 0 #c4b84a"
                          : "inset 1px 1px 0 #fff, inset -1px -1px 0 #6ee7b7",
                        padding: "8px 12px",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-bold flex items-center gap-2"
                          style={{ color: "#064e3b" }}
                        >
                          {item.emoji && <span className="text-xl">{item.emoji}</span>}
                          {item.name}
                          <span className="text-[8px] px-1 py-0.5 rounded text-white bg-orange-500">
                            Fun
                          </span>
                        </span>
                        <span
                          className="text-xs font-bold"
                          style={{ color: "#064e3b" }}
                        >
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mt-4">
                <button
                  onClick={handleBuy}
                  disabled={!selectedItem || !canAffordSelected}
                  className={`w-full py-3 px-4 text-xs font-bold uppercase tracking-wide transition-all ${
                    selectedItem && canAffordSelected
                      ? "bg-yellow-500 hover:bg-yellow-400 text-black border-2 border-yellow-700 cursor-pointer"
                      : "bg-gray-400 text-gray-700 border-2 border-gray-600 cursor-not-allowed"
                  }`}
                  style={{
                    borderRadius: "4px",
                    boxShadow:
                      selectedItem && canAffordSelected
                        ? "inset 0 2px 0 rgba(255,255,255,0.3)"
                        : "none",
                  }}
                >
                  🪙 Buy
                </button>

                <button
                  onClick={onCancel}
                  className="w-full py-3 px-4 text-xs font-bold uppercase tracking-wide bg-red-500 hover:bg-red-400 text-white border-2 border-red-700 transition-all"
                  style={{
                    borderRadius: "4px",
                    boxShadow: "inset 0 2px 0 rgba(255,255,255,0.3)",
                  }}
                >
                  Leave Arcade
                </button>
              </div>

              {/* Balance Display with Educational Tip */}
              <div
                className="mt-4 p-3 text-center"
                style={{
                  backgroundColor: "#d1fae5",
                  border: "2px solid #059669",
                  borderRadius: "4px",
                }}
              >
                <div className="text-xs font-bold" style={{ color: "#059669" }}>
                  Your balance: ${userBalance.toFixed(2)}
                </div>
                {selectedItem && (
                  <div className="text-[10px] mt-2" style={{ color: "#6b7280" }}>
                    💡 After purchase: ${Math.max(0, userBalance - selectedItem.price).toFixed(2)} remaining
                    {selectedItem.price > 10 && (
                      <div className="text-orange-600 mt-1 font-bold">
                        🎯 Set a budget for fun! It&apos;s easy to overspend at arcades.
                      </div>
                    )}
                  </div>
                )}
                {renderBalanceMessage()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
