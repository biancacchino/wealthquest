"use client";

import React, { useMemo } from "react";
import type { MoneyState } from "../types";

interface ApartmentRestPopupProps {
  money: MoneyState;
  onClose: () => void;
}

//hello
const getRestMessage = (money: MoneyState) => {
  const buyCount = money.history.filter(
    (event) => event.choice === "buy",
  ).length;
  const skipCount = money.history.filter(
    (event) => event.choice === "skip",
  ).length;
  const depositCount = money.bankHistory.filter(
    (tx) => tx.type === "deposit",
  ).length;

  if (money.history.length === 0 && money.bankHistory.length === 0) {
    return "Rest is still a decision.";
  }

  if (depositCount > 0) {
    return "Nothing changed today.\nThat’s normal.";
  }

  if (buyCount >= 3 && buyCount > skipCount) {
    return "Comfort feels immediate.\nThe cost shows up later.";
  }

  if (money.balance >= 40 && buyCount <= 1 && depositCount === 0) {
    return "You earned more today.\nIt cost you energy.";
  }

  return "Rest is still a decision.";
};

export const ApartmentRestPopup: React.FC<ApartmentRestPopupProps> = ({
  money,
  onClose,
}) => {
  const restMessage = useMemo(() => getRestMessage(money), [money]);

  return (
    <div className="absolute inset-0 z-30 bg-black/70 flex items-center justify-center p-4">
      <div
        className="w-full max-w-xl p-2"
        style={{
          backgroundColor: "#9ccce8",
          border: "4px solid #5a98b8",
          borderRadius: "8px",
          boxShadow: "inset 2px 2px 0 #b8e0f0, inset -2px -2px 0 #4888a8",
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        <div
          className="flex items-center justify-between px-3 py-2 mb-2"
          style={{ backgroundColor: "#5a98b8", borderRadius: "4px" }}
        >
          <span className="text-white font-bold text-xs tracking-wide">
            Resting...
          </span>
          <span className="text-white/70 text-[10px]">Apartment</span>
        </div>

        <div
          className="p-6"
          style={{
            backgroundColor: "#fffef8",
            border: "4px solid #c8d8e8",
            borderRadius: "4px",
            boxShadow: "inset 2px 2px 0 #fff, inset -2px -2px 0 #b8c8d8",
          }}
        >
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 animate-bounce"
              style={{
                backgroundColor: "#d8ecf8",
                border: "3px solid #a0b8c8",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              💤
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="text-gray-700 font-bold text-xs mb-2">
              You are currently resting.
            </p>
            {restMessage.split("\n").map((line, index) => (
              <p key={index} className="text-gray-500 text-[10px]">
                {line}
              </p>
            ))}
          </div>

          <div
            className="h-6 overflow-hidden"
            style={{
              backgroundColor: "#d8e8f0",
              border: "3px solid #a0b8c8",
              borderRadius: "2px",
              boxShadow: "inset 1px 1px 0 #c0d0d8",
            }}
          >
            <div
              className="h-full animate-[rest_2s_ease-in-out_infinite]"
              style={{
                width: "60%",
                backgroundColor: "#58a8d0",
                boxShadow: "inset 0 2px 0 #78c8e8, inset 0 -2px 0 #3888b0",
              }}
            />
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 py-3 text-[10px] font-bold text-white"
            style={{
              backgroundColor: "#4888b0",
              borderRadius: "20px",
              border: "3px solid #3070a0",
              boxShadow: "inset 0 2px 0 #68a8d0, inset 0 -2px 0 #285888",
            }}
          >
            Wake Up
          </button>
        </div>
      </div>

      <style>{`
        @keyframes rest {
          0% { transform: translateX(-10%); width: 30%; }
          50% { transform: translateX(10%); width: 60%; }
          100% { transform: translateX(-10%); width: 30%; }
        }
      `}</style>
    </div>
  );
};
