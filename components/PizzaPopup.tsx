"use client";

import React, { useState } from "react";
import type { EncounterCategory } from "../types";

export interface PizzaItem {
  id: string;
  name: string;
  price: number;
  emoji?: string;
  category?: EncounterCategory;
}

interface PizzaPopupProps {
  title: string;
  items: PizzaItem[];
  userBalance: number;
  bankBalance?: number;
  onPurchase: (itemId: string, itemName: string, price: number, category?: EncounterCategory) => void;
  onCancel: () => void;
}

export const PizzaPopup: React.FC<PizzaPopupProps> = ({
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

  // Get category badge color and label
  const getCategoryBadge = (category?: EncounterCategory) => {
    switch (category) {
      case 'need':
        return { color: 'bg-green-500', label: 'Meal' };
      case 'social':
        return { color: 'bg-blue-500', label: 'Sharing' };
      default:
        return { color: 'bg-orange-500', label: 'Extra' };
    }
  };

  return (
    <div className="fixed inset-0 z-20 bg-black/80 flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl"
        style={{
          backgroundColor: "#ef4444",
          border: "6px solid #dc2626",
          borderRadius: "8px",
          boxShadow:
            "inset 2px 2px 0 #f87171, inset -2px -2px 0 #b91c1c, 8px 8px 0 rgba(0,0,0,0.5)",
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        {/* Title Bar */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            backgroundColor: "#dc2626",
            borderBottom: "4px solid #b91c1c",
            borderRadius: "2px 2px 0 0",
          }}
        >
          <span className="text-white text-lg font-bold tracking-wide uppercase">
            🍕 {title}
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
            backgroundColor: "#fecaca",
            borderRadius: "0 0 4px 4px",
          }}
        >
          <div className="grid grid-cols-2 gap-6">
            {/* Left Side - Pizza Emoji */}
            <div className="flex items-center justify-center">
              <div
                className="w-64 h-80 flex flex-col justify-center items-center"
                style={{
                  border: "4px solid #dc2626",
                  backgroundColor: "#fef2f2",
                  borderRadius: "4px",
                  background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
                }}
              >
                <span style={{ fontSize: "8rem", lineHeight: 1 }}>🍕</span>
                <span className="text-xs mt-4 text-red-800 font-bold">Fresh & Hot!</span>
              </div>
            </div>

            {/* Right Side - Items List */}
            <div className="flex flex-col">
              <h3
                className="text-sm font-bold mb-4 text-center p-3"
                style={{
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "2px solid #b91c1c",
                  borderRadius: "4px",
                }}
              >
                What&apos;ll it be?
              </h3>

              <div className="space-y-2 flex-1 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const isSelected = selectedItemId === item.id;
                  const canAfford = userBalance >= item.price;
                  const isDisabled = !canAfford;
                  const badge = getCategoryBadge(item.category);

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
                          : "2px solid #fca5a5",
                        borderRadius: "4px",
                        boxShadow: isSelected
                          ? "inset 2px 2px 0 #fffeb8, inset -2px -2px 0 #c4b84a"
                          : "inset 1px 1px 0 #fff, inset -1px -1px 0 #f87171",
                        padding: "8px 12px",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-bold flex items-center gap-2"
                          style={{ color: "#7f1d1d" }}
                        >
                          {item.emoji && <span className="text-xl">{item.emoji}</span>}
                          {item.name}
                          <span className={`text-[8px] px-1 py-0.5 rounded text-white ${badge.color}`}>
                            {badge.label}
                          </span>
                        </span>
                        <span
                          className="text-xs font-bold"
                          style={{ color: "#7f1d1d" }}
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
                      ? "bg-green-500 hover:bg-green-400 text-white border-2 border-green-700 cursor-pointer"
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
                  Order
                </button>

                <button
                  onClick={onCancel}
                  className="w-full py-3 px-4 text-xs font-bold uppercase tracking-wide bg-gray-500 hover:bg-gray-400 text-white border-2 border-gray-700 transition-all"
                  style={{
                    borderRadius: "4px",
                    boxShadow: "inset 0 2px 0 rgba(255,255,255,0.3)",
                  }}
                >
                  Not Hungry
                </button>
              </div>

              {/* Balance Display with Educational Tip */}
              <div
                className="mt-4 p-3 text-center"
                style={{
                  backgroundColor: "#fef2f2",
                  border: "2px solid #dc2626",
                  borderRadius: "4px",
                }}
              >
                <div className="text-xs font-bold" style={{ color: "#dc2626" }}>
                  Your balance: ${userBalance.toFixed(2)}
                </div>
                {selectedItem && (
                  <div className="text-[10px] mt-2" style={{ color: "#6b7280" }}>
                    💡 After purchase: ${Math.max(0, userBalance - selectedItem.price).toFixed(2)} remaining
                    {selectedItem.category === 'need' && (
                      <div className="text-green-600 mt-1 font-bold">
                        ✓ Food is a necessity - good choice!
                      </div>
                    )}
                    {selectedItem.category === 'social' && (
                      <div className="text-blue-600 mt-1 font-bold">
                        🍕 Sharing pizza is fun, but it costs more!
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
