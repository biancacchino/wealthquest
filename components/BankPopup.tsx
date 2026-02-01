"use client";

import React, { useState, useEffect } from "react";
import { ChoiceEvent, BankTransaction, InvestmentType } from "../types";
import { 
  BankIcon, 
  SavingsIcon, 
  HistoryIcon, 
  DepositIcon, 
  WithdrawIcon, 
  CloseIcon,
  EtfIcon 
} from "./PixelIcons";

interface BankPopupProps {
  cashBalance: number;
  bankBalance: number;
  portfolio?: Record<InvestmentType, number>;
  history: Array<ChoiceEvent | BankTransaction>; // Combined history
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  onClose: () => void;
}

export const BankPopup: React.FC<BankPopupProps> = ({
  cashBalance,
  bankBalance,
  portfolio,
  history,
  onDeposit,
  onWithdraw,
  onClose,
}) => {
  const [tab, setTab] = useState<"savings" | "transactions">("savings");
  const [mode, setMode] = useState<"deposit" | "withdraw" | null>(null); // Sub-mode for Savings
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Initial Welcome Message (General Entry)
  useEffect(() => {
    setMessage(
      "Banks aren’t about growing money fast. They’re about keeping money safe and available when life gets unpredictable. What you put here won’t change much day to day, but it’s there when you need it — no risk, no surprises."
    );
  }, []); // Run once on mount

  // Update message when mode/tab changes
  useEffect(() => {
    // Transaction View Logic
    if (tab === "transactions") {
        if (history.length === 0) {
            setMessage("Looking at transactions shows how money actually moves. Individual purchases can feel small, but patterns become clear when everything is listed in one place. This is where habits are easiest to see.");
        } else {
             // Check if savings balance is growing (simple check: current bank balance > 0)
             if (bankBalance > 0) {
                 setMessage("Progress here usually comes from consistency, not big decisions. Even slow growth means you’re creating distance between yourself and unexpected problems.");
                 return;
             }

             // Check for many small expenses (spending > 5 items)
             const spendingCount = history.filter((h: any) => h.choice === 'buy').length;
             if (spendingCount > 5) {
                 setMessage("Small amounts rarely feel important in the moment. Over time, repetition matters more than size. This isn’t about guilt — it’s about awareness.");
                 return;
             }

             // Empty buffer fallback
             if (bankBalance === 0) {
                 setMessage("Without a buffer, unexpected costs feel heavier. That doesn’t mean anything went wrong — it just means everything is happening in real time.");
                 return;
             }

             // Default transaction message
             setMessage("Looking at transactions shows how money actually moves. Individual purchases can feel small, but patterns become clear when everything is listed in one place. This is where habits are easiest to see.");
        }
    } 
    // Savings View Logic
    else if (tab === "savings") {
        if (mode === "deposit") {
            setMessage("Depositing money here means choosing safety over speed. Your balance will grow a little over time, but the real value is knowing this money is protected and easy to access if something goes wrong.");
        } else if (mode === "withdraw") {
            setMessage("Savings are meant to be used when you need them. Taking money out isn’t a mistake — it’s the reason this account exists. The goal isn’t to never touch it, but to have it when it matters.");
        } else {
            // Default Savings View (1.25% text)
            setMessage("A savings account earns interest slowly over time. At 1.25%, your balance won’t change dramatically, but it grows without effort or risk. This is money meant for emergencies, short-term goals, or peace of mind — not quick wins.");
        }
    }
  }, [tab, mode, history.length, bankBalance]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setAmount(val);
  };

  const handleTransaction = () => {
    const val = parseInt(amount, 10);
    if (!val || val <= 0) return;

    if (mode === "deposit") {
      if (val > cashBalance) {
        // keep educational tone, maybe show a toast or shake
        return;
      }
      onDeposit(val);
      setAmount("");
      setMode(null); // Reset to main savings view
    } else if (mode === "withdraw") {
      if (val > bankBalance) {
        return;
      }
      onWithdraw(val);
      setAmount("");
      setMode(null);
    }
  };

  const setMax = () => {
    if (mode === "deposit") {
      setAmount(Math.floor(cashBalance).toString());
    } else {
      setAmount(Math.floor(bankBalance).toString());
    }
  };
  
  // Helper to render transaction item
  const renderTransaction = (item: any, index: number) => {
      // Determine type safely
      const isBank = item.type === 'deposit' || item.type === 'withdraw' || item.type === 'interest';
      const isSpend = item.choice === 'buy';
      
      let label = "";
      let amountChange = "";
      let colorClass = "";

      if (isBank) {
          label = item.type === 'deposit' ? "Bank Deposit" : "Bank Withdrawal";
          amountChange = item.type === 'deposit' ? `+$${item.amount}` : `-$${item.amount}`;
          colorClass = item.type === 'deposit' ? "text-green-600" : "text-red-500";
      } else {
          // Encounter: item.encounterId might be 'DOOR_PIZZA' etc or 'enc_123'
          // We can try to use mapping if available or just ID
          label = item.encounterId; 
          if (isSpend) {
            amountChange = `-$${item.cost}`;
            colorClass = "text-red-500";
          } else {
            label += " (Skipped)";
            amountChange = "$0";
            colorClass = "text-gray-500";
          }
      }

      return (
        <div key={index} className="flex justify-between items-center bg-[#eff7d9] p-2 rounded border border-[#8a9c78] text-xs mb-2">
            <span className="text-[#2a3c1a] font-bold truncate w-2/3">{label}</span>
            <span className={`font-bold ${colorClass}`}>{amountChange}</span>
        </div>
      );
  };

  return (
    <div className="fixed inset-0 z-30 bg-black/80 flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg relative flex flex-col max-h-[85vh]"
        style={{
          backgroundColor: "#d4e4bc",
          border: "4px solid #4a5c3a",
          borderRadius: "12px",
          boxShadow: "inset 4px 4px 0 #eff7d9, inset -4px -4px 0 #8a9c78, 10px 10px 0 rgba(0,0,0,0.5)",
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{
            backgroundColor: "#4a5c3a",
            borderRadius: "8px 8px 0 0",
            borderBottom: "4px solid #2a3c1a",
          }}
        >
          <div className="flex items-center gap-3">
            <BankIcon className="text-[#eff7d9]" />
            <span className="text-[#eff7d9] text-base font-bold tracking-widest uppercase text-shadow-sm">
              BANK
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#eff7d9] hover:text-white font-bold"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-1/3 bg-[#8a9c78] p-4 flex flex-col gap-4 border-r-4 border-[#4a5c3a]">
                
                {/* Account Summary */}
                <div className="bg-[#2a3c1a] p-4 rounded border-2 border-[#eff7d9] text-center mb-4">
                    <div className="text-[#8a9c78] text-[8px] uppercase mb-1">Total Savings</div>
                    <div className="text-[#4ade80] text-lg font-bold text-shadow-green break-words">
                        ${Math.floor(bankBalance)}
                    </div>
                    <div className="text-[#eff7d9] text-[8px] mt-1">Interest: 1.25%</div>
                </div>

                {/* Investment Summary */}
                {portfolio && (
                    <div className="bg-[#1e293b] p-4 rounded border-2 border-[#475569] text-center mb-4">
                        <div className="text-gray-400 text-[8px] uppercase mb-1">Total Investments</div>
                        <div className="text-[#60a5fa] text-xs font-bold text-shadow-blue break-words">
                            ${Object.values(portfolio).reduce((a, b) => a + b, 0).toLocaleString()}
                        </div>
                        <div className="text-gray-500 text-[8px] mt-1 flex justify-center items-center gap-1">
                             <EtfIcon className="w-3 h-3" /> View at NYSE
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => { setTab("savings"); setMode(null); }}
                        className={`p-3 text-xs font-bold text-left rounded transition-all flex items-center gap-2 ${
                            tab === "savings" 
                            ? "bg-[#eff7d9] text-[#2a3c1a] border-l-4 border-[#2a3c1a]" 
                            : "bg-[#4a5c3a] text-[#eff7d9] hover:bg-[#6b7c5a]"
                        }`}
                    >
                        <SavingsIcon className="w-5 h-5" /> Savings
                    </button>
                    <button
                        onClick={() => setTab("transactions")}
                        className={`p-3 text-xs font-bold text-left rounded transition-all flex items-center gap-2 ${
                            tab === "transactions" 
                            ? "bg-[#eff7d9] text-[#2a3c1a] border-l-4 border-[#2a3c1a]" 
                            : "bg-[#4a5c3a] text-[#eff7d9] hover:bg-[#6b7c5a]"
                        }`}
                    >
                        <HistoryIcon className="w-5 h-5" /> History
                    </button>
                </div>
                
                {/* Wallet Preview */}
                <div className="mt-auto bg-[#6b7c5a] p-3 rounded border border-[#2a3c1a] text-center">
                    <div className="text-[#d4e4bc] text-[8px] uppercase">Cash Wallet</div>
                    <div className="text-white text-sm font-bold">${Math.floor(cashBalance)}</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col p-6 bg-[#eff7d9] overflow-y-auto">
                
                {/* Educational Text Box (Always visible at top) */}
                <div className="bg-[#fff] border-2 border-[#8a9c78] p-4 rounded mb-6 shadow-sm min-h-[100px] flex items-center">
                     <p className="text-[#2a3c1a] text-[10px] leading-relaxed">
                        {message}
                     </p>
                </div>

                {/* Tab Content */}
                {tab === "savings" && (
                    <div className="flex-1 flex flex-col">
                        {!mode ? (
                            <div className="grid grid-cols-1 gap-4 mt-auto">
                                <button
                                    onClick={() => setMode("deposit")}
                                    className="bg-[#4a5c3a] hover:bg-[#2a3c1a] text-white py-4 rounded border-b-4 border-[#1a2c0a] active:translate-y-1 active:border-b-0 transition-all font-bold text-sm uppercase flex items-center justify-center gap-2"
                                >
                                    <DepositIcon className="w-6 h-6" /> Deposit Money
                                </button>
                                <button
                                    onClick={() => setMode("withdraw")}
                                    className="bg-[#d97706] hover:bg-[#b45309] text-white py-4 rounded border-b-4 border-[#78350f] active:translate-y-1 active:border-b-0 transition-all font-bold text-sm uppercase flex items-center justify-center gap-2"
                                >
                                    <WithdrawIcon className="w-6 h-6" /> Withdraw Money
                                </button>
                            </div>
                        ) : (
                            <div className="mt-auto bg-[#fff] p-4 rounded border-2 border-[#8a9c78]">
                                <h3 className="text-[#2a3c1a] font-bold text-xs uppercase mb-4 border-b border-[#8a9c78] pb-2">
                                    {mode === "deposit" ? "Deposit to Savings" : "Withdraw from Savings"}
                                </h3>
                                
                                <div className="flex gap-2 mb-4">
                                     <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5c3a] font-bold">$</span>
                                        <input
                                        type="text"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        placeholder="0"
                                        className="w-full bg-[#f4f9eb] border-2 border-[#8a9c78] rounded p-3 pl-8 text-[#2a3c1a] text-sm font-bold focus:outline-none focus:border-[#2a3c1a]"
                                        />
                                    </div>
                                    <button 
                                        onClick={setMax}
                                        className="bg-[#8a9c78] text-white px-3 rounded font-bold text-[10px] hover:bg-[#4a5c3a]"
                                    >
                                        MAX
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setMode(null); setAmount(""); }}
                                        className="flex-1 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded font-bold text-xs"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        onClick={handleTransaction}
                                        className={`flex-1 py-3 text-white rounded font-bold text-xs ${
                                            mode === 'deposit' 
                                            ? 'bg-[#4a5c3a] hover:bg-[#2a3c1a]' 
                                            : 'bg-[#d97706] hover:bg-[#b45309]'
                                        }`}
                                    >
                                        CONFIRM
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {tab === "transactions" && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-white border-2 border-[#8a9c78] rounded">
                        {history.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-xs">No transactions yet.</div>
                        ) : (
                            // Show transactions in reverse order (newest first)
                            // Note: We are mixing history types so sorting by index/natural order makes sense (assuming latest is pushed last)
                            [...history].reverse().map((item, i) => renderTransaction(item, i))
                        )}
                    </div>
                )}

            </div>

        </div>
      </div>
    </div>
  );
};
