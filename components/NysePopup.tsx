"use client";

import React, { useState } from "react";
import { InvestmentType } from "../types";
import {
  EtfIcon,
  StockIcon,
  BondIcon,
  MineralsIcon,
  CryptoIcon,
  RealEstateIcon,
  OptionsIcon,
  CloseIcon,
  WalletIcon,
  PortfolioIcon
} from "./PixelIcons";
import { LineGraph } from "./LineGraph";

interface NysePopupProps {
  cashBalance: number;
  portfolio: Record<InvestmentType, number>;
  marketTrends?: Record<InvestmentType, number[]>;
  onInvest: (type: InvestmentType, amount: number) => void;
  onClose: () => void;
  onTick?: () => void;
}

type StationId = InvestmentType;

interface StationData {
  id: StationId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  intro: string[];
  reflection: string[];
  after: string[];
}

const STATIONS: StationData[] = [
  {
    id: "etf",
    label: "ETF Station",
    icon: EtfIcon,
    color: "#4ade80",
    intro: [
      "Exchange-Traded Funds are designed for long-term growth.",
      "Instead of betting on one company, ETFs spread your money across many.",
      "This reduces risk, but it also limits dramatic gains.",
      "ETFs are often chosen by people who value consistency over excitement." 
    ],
    reflection: [
        "ETFs rarely make headlines.",
        "Their strength isn’t speed — it’s reliability over time."
    ],
    after: [
        "Nothing feels different right now.",
        "That’s usually how long-term decisions start."
    ]
  },
  {
    id: "stocks",
    label: "Stocks",
    icon: StockIcon,
    color: "#60a5fa",
    intro: [
        "Stocks represent ownership in individual companies.",
        "When a company performs well, its stock can grow quickly.",
        "When it struggles, losses can happen just as fast."
    ],
    reflection: [
        "Stocks reward attention and patience.",
        "They also demand tolerance for uncertainty."
    ],
    after: [
        "You’ve accepted more risk in exchange for potential growth.",
        "The outcome won’t be clear immediately."
    ]
  },
  {
    id: "bonds",
    label: "Bonds",
    icon: BondIcon,
    color: "#f472b6",
    intro: [
        "Bonds are designed to be predictable.",
        "Instead of growth, they focus on stability and regular returns.",
        "Many people use bonds to balance risk elsewhere."
    ],
    reflection: [
        "Bonds rarely surprise you — in good or bad ways."
    ],
    after: [
        "This choice won’t change much today.",
        "That’s the point."
    ]
  },
  {
    id: "minerals",
    label: "Minerals",
    icon: MineralsIcon,
    color: "#fbbf24",
    intro: [
        "Gold doesn’t grow like businesses do.",
        "Its value often comes from protection rather than profit.",
        "During unstable times, people tend to rely on assets like this."
    ],
    reflection: [
        "Some investments are about preservation, not growth."
    ],
    after: [
        "You now hold something tangible in a digital world."
    ]
  },
  {
    id: "crypto",
    label: "Crypto",
    icon: CryptoIcon,
    color: "#a78bfa",
    intro: [
        "Cryptocurrency is highly volatile.",
        "Prices can change rapidly based on sentiment, trends, and speculation.",
        "Gains can be fast — and so can losses."
    ],
    reflection: [
        "This space rewards risk tolerance more than patience."
    ],
    after: [
        "Expect uncertainty.",
        "That’s part of the experience."
    ]
  },
  {
    id: "real_estate",
    label: "Real Estate",
    icon: RealEstateIcon,
    color: "#fb923c",
    intro: [
        "Real estate is a long-term commitment.",
        "It often requires more upfront investment, but can provide steady returns over time.",
        "Unlike other assets, it’s slow to change."
    ],
    reflection: [
        "Flexibility is limited, but consistency is common."
    ],
    after: [
        "You've planted a seed in solid ground."
    ]
  },
  {
    id: "options",
    label: "Options",
    icon: OptionsIcon,
    color: "#ef4444",
    intro: [
        "Options are complex financial instruments.",
        "They involve predicting future price movements within specific time frames.",
        "These strategies can amplify gains — and losses."
    ],
    reflection: [
        "Complexity increases risk.",
        "Knowledge matters here."
    ],
    after: [
        "High stakes, high pressure."
    ]
  }
];

export const NysePopup: React.FC<NysePopupProps> = ({
  cashBalance,
  portfolio,
  marketTrends,
  onInvest,
  onClose,
  onTick,
}) => {
  const [selectedStation, setSelectedStation] = useState<StationId | null>(null);
  const [viewState, setViewState] = useState<"intro" | "invest" | "after">("intro");
  const [introStep, setIntroStep] = useState(0);
  const [investAmount, setInvestAmount] = useState<string>("");
  const [closing, setClosing] = useState(false);

  // Market Simulation Tick
  React.useEffect(() => {
    if (!onTick) return;
    const interval = setInterval(onTick, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, [onTick]);

  // Determine current content
  const currentStation = STATIONS.find(s => s.id === selectedStation);

  const handleStationClick = (id: StationId) => {
    setSelectedStation(id);
    setViewState("intro");
    setIntroStep(0);
    setInvestAmount("");
  };

  const handleInvestClick = () => {
    setViewState("invest");
  };

  const handleConfirmInvest = () => {
    const val = parseInt(investAmount, 10);
    if (!val || val <= 0) return;
    if (val > cashBalance) return;

    if (currentStation) {
        onInvest(currentStation.id, val);
        setViewState("after");
    }
  };

  const handeCloseAttempt = () => {
      setClosing(true);
      // Show exit text then actually close after a delay?
      // Or just show text in a modal on top.
      // For now, let's just use a simple alert-like overlay or integrated view.
  };

  if (closing) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-lg">
          <p className="text-[#eff7d9] text-lg font-bold font-mono leading-loose">
            &quot;Investing isn&rsquo;t about constant action.<br /><br />
            Sometimes the smartest move is waiting.&quot;
          </p>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-[#4a5c3a] text-white font-bold rounded hover:bg-[#6b7c5a]"
          >
            LEAVE BUILDING
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl h-[70vh] flex flex-col relative"
        style={{
          backgroundColor: "#1e293b", // Dark Slate Blue/Gray
          border: "4px solid #334155",
          borderRadius: "8px",
          fontFamily: '"Press Start 2P", monospace',
          boxShadow: "0 0 0 4px #0f172a, 0 10px 20px rgba(0,0,0,0.5)"
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-[#0f172a] border-b-4 border-[#334155] rounded-t-md">
            <div className="flex items-center gap-3">
                <span className="text-2xl">🏛️</span>
                <span className="text-gray-200 font-bold tracking-widest">NYSE FLOOR</span>
            </div>
            <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 bg-[#1e293b] px-3 py-1 rounded border border-[#334155]">
                    <WalletIcon className="text-green-400 w-4 h-4" />
                    <span className="text-green-400 text-xs">${Math.floor(cashBalance)}</span>
                 </div>
                 <button onClick={handeCloseAttempt} className="text-gray-400 hover:text-white">
                    <CloseIcon className="w-6 h-6" />
                 </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative bg-[#334155]">
            {/* Tiled floor background pattern */}
            <div className="absolute inset-0 opacity-10" 
                 style={{ 
                     backgroundImage: "radial-gradient(#475569 1px, transparent 1px)", 
                     backgroundSize: "20px 20px" 
                 }} 
            />

            {!selectedStation ? (
                // MAIN FLOOR VIEW
                <div className="relative z-10 h-full p-8 flex items-center justify-center">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-3xl">
                        {STATIONS.map((station) => (
                            <button
                                key={station.id}
                                onClick={() => handleStationClick(station.id)}
                                className="aspect-square flex flex-col items-center justify-center gap-3 bg-[#1e293b] border-2 border-[#475569] hover:border-[#94a3b8] hover:-translate-y-1 transition-all rounded shadow-lg group relative overflow-hidden"
                            >
                                <div className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundColor: station.color }} />
                                <station.icon className="w-12 h-12 text-gray-400 group-hover:text-white transition-colors" />
                                <span className="text-[10px] text-gray-300 group-hover:text-white text-center px-2 leading-tight">
                                    {station.label}
                                </span>
                                {/* Mini holdings indicator */}
                                {portfolio[station.id] > 0 && (
                                    <div className="absolute top-2 right-2 bg-green-900/80 text-green-400 text-[8px] px-1 rounded">
                                        ${portfolio[station.id]}
                                    </div>
                                )}
                            </button>
                        ))}
                        
                        {/* PORTFOLIO MONITOR BUTTON */}
                        <button
                            onClick={() => setSelectedStation('portfolio' as any)} // Cast as any since 'portfolio' isn't in StationId
                            className="aspect-square flex flex-col items-center justify-center gap-3 bg-[#0f172a] border-2 border-indigo-500/50 hover:border-indigo-400 hover:-translate-y-1 transition-all rounded shadow-lg group relative overflow-hidden col-span-2 md:col-span-1"
                        >
                             <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-500" />
                             <PortfolioIcon className="w-12 h-12 text-indigo-400 group-hover:text-white transition-colors" />
                             <span className="text-[10px] text-indigo-200 group-hover:text-white text-center px-2 leading-tight font-bold">
                                PORTFOLIO<br/>MONITOR
                            </span>
                        </button>
                    </div>
                </div>
            ) : selectedStation === ('portfolio' as any) ? (
                 // PORTFOLIO MONITOR VIEW
                 <div className="relative z-10 h-full flex flex-col" style={{ backgroundColor: "#0f172a" }}>
                    {/* Header */}
                    <div className="p-4 bg-[#1e293b] border-b border-[#334155] flex items-center gap-3">
                         <button 
                            onClick={() => setSelectedStation(null)}
                            className="text-gray-500 hover:text-white text-xs mr-2"
                         >
                            ◀ BACK
                         </button>
                         <PortfolioIcon className="w-6 h-6 text-indigo-400" />
                         <span className="text-white text-sm text-indigo-400 font-bold">PORTFOLIO MONITOR</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                        <div className="max-w-2xl mx-auto space-y-8">
                             {/* Total Value Card */}
                             <div className="bg-gradient-to-r from-indigo-900/40 to-[#1e293b] p-6 rounded-lg border border-indigo-500/30 flex items-center justify-between">
                                 <div>
                                     <div className="text-indigo-300 text-xs uppercase tracking-widest mb-1">Total Asset Value</div>
                                     <div className="text-3xl text-white font-bold">
                                         ${Object.values(portfolio).reduce((a, b) => a + b, 0).toLocaleString()}
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <div className="text-indigo-300 text-xs uppercase tracking-widest mb-1">Day Change</div>
                                     <div className="text-sm text-gray-500 font-mono">
                                         --% (Market Closed)
                                     </div>
                                 </div>
                             </div>

                             {/* Breakdown */}
                             <div className="space-y-4">
                                 <h3 className="text-gray-400 text-xs uppercase tracking-widest border-b border-gray-700 pb-2">Asset Breakdown</h3>
                                 <div className="grid gap-3">
                                     {STATIONS.map(station => {
                                         const amount = portfolio[station.id];
                                         const total = Object.values(portfolio).reduce((a, b) => a + b, 0);
                                         const percentage = total > 0 ? (amount / total) * 100 : 0;
                                         
                                         return (
                                             <div key={station.id} className="bg-[#1e293b] p-3 rounded flex items-center gap-4 border border-transparent hover:border-gray-600 transition-colors">
                                             <div className="p-2 rounded bg-[#0f172a]" style={{ color: station.color }}>
                                                     <station.icon className="w-6 h-6" />
                                                 </div>
                                                 <div className="flex-1">
                                                     <div className="flex justify-between items-end mb-1">
                                                         <span className="text-gray-200 text-xs font-bold">{station.label}</span>
                                                         <span className="text-white text-xs font-mono">${amount.toLocaleString()}</span>
                                                     </div>
                                                     {/* Bar */}
                                                     <div className="h-1.5 w-full bg-[#0f172a] rounded-full overflow-hidden">
                                                         <div 
                                                             className="h-full rounded-full" 
                                                             style={{ 
                                                                 width: `${percentage}%`,
                                                                 backgroundColor: station.color 
                                                             }} 
                                                         />
                                                     </div>
                                                 </div>
                                                 <div className="w-12 text-right text-[10px] text-gray-500 font-mono">
                                                     {percentage.toFixed(0)}%
                                                 </div>
                                             </div>
                                         );
                                     })}
                                 </div>
                             </div>

                             {/* Insight */}
                             <div className="p-4 bg-indigo-900/20 border border-indigo-500/20 rounded text-center">
                                 <p className="text-indigo-200 text-[10px] italic">
                                     "A diversified portfolio is like a balanced diet for your finances."
                                 </p>
                             </div>
                        </div>
                    </div>
                 </div>
            ) : !currentStation ? null : (
                // STATION VIEW
                <div className="relative z-10 h-full flex flex-col" style={{ backgroundColor: "#0f172a" }}>
                    {/* Station Header */}
                    <div className="p-4 bg-[#1e293b] border-b border-[#334155] flex items-center gap-3">
                         <button 
                            onClick={() => setSelectedStation(null)}
                            className="text-gray-500 hover:text-white text-xs mr-2"
                         >
                            ◀ BACK
                         </button>
                         <div style={{ color: currentStation.color }}>
                            <currentStation.icon className="w-6 h-6" />
                         </div>
                         <span className="text-white text-sm" style={{ color: currentStation.color }}>{currentStation.label} STATION</span>
                    </div>

                    {/* Station Content */}
                    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full">
                        
                        {viewState === "intro" && (
                            <div className="space-y-6 animate-fade-in w-full max-w-lg">
                                {/* Market Graph */}
                                <div className="w-full h-32 bg-[#0f172a] rounded border border-gray-700 p-2 relative shadow-inner">
                                    <div className="absolute top-2 left-2 text-[8px] text-gray-500 uppercase tracking-widest">Market Performance (30 Days)</div>
                                    <LineGraph 
                                        data={marketTrends?.[currentStation!.id] || []} 
                                        color={currentStation!.color} 
                                    />
                                </div>

                                <div className="min-h-[60px] flex items-center justify-center">
                                    <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                                        {currentStation.intro[introStep]}
                                    </p>
                                </div>
                                <div className="pt-8 flex flex-col items-center gap-4 justify-center">
                                    {introStep < currentStation.intro.length - 1 ? (
                                        <button 
                                            onClick={() => setIntroStep(prev => prev + 1)}
                                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded text-xs border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all uppercase animate-pulse"
                                        >
                                            Next ►
                                        </button>
                                    ) : (
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={handleInvestClick}
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded text-xs border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all uppercase"
                                            >
                                                Invest
                                            </button>
                                            <button 
                                                onClick={() => setSelectedStation(null)}
                                                className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded text-xs border-b-4 border-gray-800 active:border-b-0 active:translate-y-1 transition-all uppercase"
                                            >
                                                Walk Away
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {viewState === "invest" && (
                             <div className="space-y-6 w-full max-w-sm animate-fade-in">
                                <div className="space-y-2">
                                     {currentStation.reflection.map((line, i) => (
                                        <p key={i} className="text-blue-200/80 text-[10px] italic">
                                            {line}
                                        </p>
                                    ))}
                                </div>

                                <div className="bg-[#1e293b] p-6 rounded border border-[#334155] space-y-4">
                                    <div className="text-gray-400 text-[10px] uppercase text-center">Amount to Invest</div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input 
                                            type="text" 
                                            value={investAmount}
                                            onChange={(e) => setInvestAmount(e.target.value.replace(/[^0-9]/g, ""))}
                                            className="w-full bg-[#0f172a] border border-[#334155] rounded p-3 pl-8 text-white focus:border-blue-500 outline-none"
                                            placeholder="0"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="text-right text-[10px] text-gray-500">
                                        Max: ${Math.floor(cashBalance)}
                                    </div>
                                    <button 
                                        onClick={handleConfirmInvest}
                                        disabled={!investAmount || parseInt(investAmount) <= 0 || parseInt(investAmount) > cashBalance}
                                        className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded text-xs border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all uppercase"
                                    >
                                        Confirm Investment
                                    </button>
                                     <button 
                                        onClick={() => setViewState("intro")}
                                        className="w-full py-2 text-gray-500 hover:text-white text-[10px]"
                                    >
                                        CANCEL
                                    </button>
                                </div>
                             </div>
                        )}

                        {viewState === "after" && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="text-4xl">🤝</div>
                                <div className="space-y-4">
                                     {currentStation.after.map((line, i) => (
                                        <p key={i} className="text-green-300 text-sm leading-relaxed">
                                            {line}
                                        </p>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => setSelectedStation(null)}
                                    className="bg-[#334155] hover:bg-[#475569] text-white px-8 py-3 rounded text-xs font-bold uppercase"
                                >
                                    Return to Floor
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
