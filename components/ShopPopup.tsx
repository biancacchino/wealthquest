"use client";

import React, { useState } from "react";

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  emoji?: string;
}

interface ShopPopupProps {
  title: string;
  items: ShopItem[];
  userBalance: number;
  onPurchase: (itemId: string, itemName: string, price: number) => void;
  onCancel: () => void;
  imagePath?: string;
}

export const ShopPopup: React.FC<ShopPopupProps> = ({
  title,
  items,
  userBalance,
  onPurchase,
  onCancel,
  imagePath,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const selectedItem = items.find((item) => item.id === selectedItemId);
  const canAffordSelected = selectedItem
    ? userBalance >= selectedItem.price
    : false;

  const handleBuy = () => {
    if (selectedItem && canAffordSelected) {
      onPurchase(selectedItem.id, selectedItem.name, selectedItem.price);
      setSelectedItemId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-20 bg-black/80 flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl"
        style={{
          backgroundColor: "#5a98b8",
          border: "6px solid #3a7a98",
          borderRadius: "8px",
          boxShadow:
            "inset 2px 2px 0 #7ab8d8, inset -2px -2px 0 #2a5a78, 8px 8px 0 rgba(0,0,0,0.5)",
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        {/* Title Bar */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            backgroundColor: "#3a7a98",
            borderBottom: "4px solid #2a5a78",
            borderRadius: "2px 2px 0 0",
          }}
        >
          <span className="text-white text-lg font-bold tracking-wide uppercase">
            {title}
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
            backgroundColor: "#a8c8e0",
            borderRadius: "0 0 4px 4px",
          }}
        >
          <div className="grid grid-cols-2 gap-6">
            {/* Left Side - Image/Emoji */}
            <div className="flex items-center justify-center">
              <div
                className="w-64 h-80 flex justify-center"
                style={{
                  border: "4px solid #5a98b8",
                  backgroundColor: "#e8f4f8",
                  borderRadius: "4px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "12rem", lineHeight: 1, display: "block", marginTop: "1.5rem" }}>🛍️</span>
              </div>
            </div>

            {/* Right Side - Items List */}
            <div className="flex flex-col">
              <h3
                className="text-sm font-bold mb-4 text-center p-3"
                style={{
                  backgroundColor: "#3a7a98",
                  color: "white",
                  border: "2px solid #2a5a78",
                  borderRadius: "4px",
                }}
              >
                What would you like to buy?
              </h3>

              <div className="space-y-2 flex-1">
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
                          : "2px solid #b8c8d8",
                        borderRadius: "4px",
                        boxShadow: isSelected
                          ? "inset 2px 2px 0 #fffeb8, inset -2px -2px 0 #c4b84a"
                          : "inset 1px 1px 0 #fff, inset -1px -1px 0 #8898a8",
                        padding: "8px 12px",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-bold flex items-center gap-2"
                          style={{ color: "#1a3a52" }}
                        >
                          {item.emoji && (
                            <span className="text-lg">{item.emoji}</span>
                          )}
                          {item.name}
                        </span>
                        <span
                          className="text-xs font-bold"
                          style={{ color: "#1a3a52" }}
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
                  Buy
                </button>

                <button
                  onClick={onCancel}
                  className="w-full py-3 px-4 text-xs font-bold uppercase tracking-wide bg-red-500 hover:bg-red-400 text-white border-2 border-red-700 transition-all"
                  style={{
                    borderRadius: "4px",
                    boxShadow: "inset 0 2px 0 rgba(255,255,255,0.3)",
                  }}
                >
                  Cancel
                </button>
              </div>

              {/* Balance Display with Educational Tip */}
              <div
                className="mt-4 p-3 text-center"
                style={{
                  backgroundColor: "#e8f4f8",
                  border: "2px solid #5a98b8",
                  borderRadius: "4px",
                }}
              >
                <div className="text-xs font-bold" style={{ color: "#3a7a98" }}>
                  Your balance: ${userBalance.toFixed(2)}
                </div>
                {selectedItem && (
                  <div className="text-[10px] mt-2" style={{ color: "#6b7280" }}>
                    💡 After purchase: ${Math.max(0, userBalance - selectedItem.price).toFixed(2)} remaining
                    {userBalance - selectedItem.price < 5 && userBalance >= selectedItem.price && (
                      <div className="text-yellow-600 mt-1 font-bold">
                        ⚠️ Keep some money for unexpected needs!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
